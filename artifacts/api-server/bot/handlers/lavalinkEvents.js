const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { createBar, msToTime, check_if_dj } = require("./functions");
const config = require("../config/config.json");

const PlayerMap = new Map();

function buildNowPlayingEmbed(player, track) {
  const pos = player.position || 0;
  const dur = track.length || 0;
  const bar = createBar(dur, pos, 20);
  const title = track.title || "Unknown";
  const embed = new EmbedBuilder()
    .setColor(config.color)
    .setAuthor({ name: "🐾 Now Playing" })
    .setTitle(title.length > 100 ? title.slice(0, 97) + "..." : title)
    .setURL(track.uri || null)
    .setThumbnail(track.thumbnail || null)
    .addFields(
      { name: "Artist", value: track.author || "Unknown", inline: true },
      { name: "Duration", value: `${msToTime(pos)} / ${dur === 0 ? "LIVE" : msToTime(dur)}`, inline: true },
      { name: "Requested by", value: track.requester ? `<@${track.requester?.id || track.requester}>` : "Unknown", inline: true },
    )
    .setDescription(`${bar}\n`)
    .setFooter({ text: config.footertext });

  if (player.paused) embed.setAuthor({ name: "⏸ Paused" });
  return embed;
}

function buildControls(player) {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId("prev").setEmoji("⏮").setStyle(ButtonStyle.Secondary).setDisabled(!player.queue.previous),
    new ButtonBuilder().setCustomId("pauseresume").setEmoji(player.paused ? "▶️" : "⏸").setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId("skip").setEmoji("⏭").setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId("stop").setEmoji("⏹").setStyle(ButtonStyle.Danger),
    new ButtonBuilder().setCustomId("shuffle").setEmoji("🔀").setStyle(ButtonStyle.Secondary),
  );
}

module.exports = (client) => {
  client.shoukaku.on("error", (node, error) => {
    console.error(`[Lavalink] Node ${node} error: ${error.message}`);
  });

  client.shoukaku.on("ready", (node) => {
    console.log(`[Lavalink] ✅ Node ${node} connected and ready!`);
  });

  client.shoukaku.on("reconnecting", (node) => {
    console.warn(`[Lavalink] 🔄 Node ${node} reconnecting...`);
  });

  client.shoukaku.on("close", (node, code, reason) => {
    // Code 1000 with proxy-close:lavalink-close is a normal server-side close — Shoukaku auto-reconnects
    if (code === 1000) {
      console.warn(`[Lavalink] Node ${node} closed cleanly (${reason}) — will reconnect automatically`);
    } else {
      console.error(`[Lavalink] Node ${node} closed unexpectedly: code=${code} reason=${reason}`);
    }
  });

  client.shoukaku.on("disconnect", (node, players, moved) => {
    console.error(`[Lavalink] ❌ Node ${node} disconnected after all retry attempts (moved=${moved}).`);
    // Notify any active players that music has stopped
    if (players && players.size > 0) {
      for (const [, player] of players) {
        const textChannel = client.channels.cache.get(player.textId);
        if (textChannel) {
          textChannel.send({
            embeds: [new EmbedBuilder()
              .setColor(config.wrongcolor || "#f85149")
              .setTitle("🐾 Lost connection to audio server!")
              .setDescription("The music node disconnected. Please use `/play` again once the bot reconnects.")
              .setFooter({ text: config.footertext })],
          }).catch(() => {});
        }
        player.destroy().catch(() => {});
      }
    }
  });

  client.kazagumo.on("playerCreate", (player) => {
    console.log(`[HowlBeats] Player created for guild ${player.guildId}`);
  });

  client.kazagumo.on("playerDestroy", (player) => {
    console.log(`[HowlBeats] Player destroyed for guild ${player.guildId}`);
    PlayerMap.delete(player.guildId);
  });

  client.kazagumo.on("playerEnd", async (player, track) => {
    player._lastTrack = track;

    if (track) {
      try {
        client.infos.ensure(player.guildId, { history: [] });
        const hist = client.infos.get(player.guildId, "history") || [];
        hist.unshift({ title: track.title, author: track.author, uri: track.uri, length: track.length });
        if (hist.length > 20) hist.splice(20);
        client.infos.set(player.guildId, hist, "history");
      } catch { /* non-critical */ }
    }
  });

  client.kazagumo.on("playerStart", async (player, track) => {
    const guild = client.guilds.cache.get(player.guildId);
    const textChannel = guild?.channels.cache.get(player.textId);
    if (!textChannel) return;

    const announceEnabled = client.settings.get(player.guildId, "announce") !== false;
    if (!announceEnabled) return;

    const embed = buildNowPlayingEmbed(player, track);
    const row = buildControls(player);

    try {
      if (PlayerMap.has(player.guildId)) {
        const oldMsg = await textChannel.messages.fetch(PlayerMap.get(player.guildId)).catch(() => null);
        if (oldMsg) await oldMsg.delete().catch(() => {});
      }

      const msg = await textChannel.send({ embeds: [embed], components: [row] });
      PlayerMap.set(player.guildId, msg.id);

      const interval = setInterval(async () => {
        if (!player || player.state === "DESTROYED") { clearInterval(interval); return; }
        try {
          const current = player.queue.current;
          if (!current) { clearInterval(interval); return; }
          const fresh = buildNowPlayingEmbed(player, current);
          const freshRow = buildControls(player);
          await msg.edit({ embeds: [fresh], components: [freshRow] }).catch(() => {});
        } catch { clearInterval(interval); }
      }, 10000);

      const collector = msg.createMessageComponentCollector({ time: (track.length || 600000) + 30000 });
      collector.on("collect", async (i) => {
        try {
          await i.deferUpdate().catch(() => {});

          const member = i.guild.members.cache.get(i.user.id);
          const voiceChannel = member?.voice?.channel;
          const p = client.kazagumo.players.get(i.guildId);

          if (!voiceChannel || voiceChannel.id !== player.voiceId) {
            return i.followUp({ content: "🐾 Please join my voice channel first!", ephemeral: true }).catch(() => {});
          }

          const djError = check_if_dj(client, member, p?.queue?.current?.requester);
          if (i.customId !== "stop" && djError) {
            return i.followUp({ content: `🐾 You need a DJ role: ${djError}`, ephemeral: true }).catch(() => {});
          }

          if (i.customId === "pauseresume") {
            p.paused ? await p.resume() : await p.pause();
            await i.followUp({ content: p.paused ? "⏸ Paused!" : "▶️ Resumed!", ephemeral: true }).catch(() => {});
          } else if (i.customId === "skip") {
            await p.skip();
            await i.followUp({ content: "⏭ Skipped!", ephemeral: true }).catch(() => {});
          } else if (i.customId === "stop") {
            await p.destroy();
            await i.followUp({ content: "⏹ Stopped and left!", ephemeral: true }).catch(() => {});
          } else if (i.customId === "shuffle") {
            p.queue.shuffle();
            await i.followUp({ content: "🔀 Queue shuffled!", ephemeral: true }).catch(() => {});
          } else if (i.customId === "prev") {
            if (!p?.queue?.previous) return i.followUp({ content: "No previous track!", ephemeral: true }).catch(() => {});
            await p.play(p.queue.previous);
            await i.followUp({ content: "⏮ Playing previous track!", ephemeral: true }).catch(() => {});
          }
        } catch (e) {
          console.error("[HowlBeats] button error:", e.message);
        }
      });

      collector.on("end", () => clearInterval(interval));
    } catch (e) {
      console.error("[HowlBeats] playerStart error:", e);
    }
  });

  client.kazagumo.on("playerEmpty", async (player) => {
    const guild = client.guilds.cache.get(player.guildId);
    const textChannel = guild?.channels.cache.get(player.textId);

    const autoplayEnabled =
      client.infos.get(player.guildId, "autoplay") ??
      client.settings.get(player.guildId, "defaultautoplay") ??
      false;

    if (autoplayEnabled && player._lastTrack) {
      try {
        const lastTitle = player._lastTrack.title || "";
        const lastAuthor = player._lastTrack.author || "";
        const query = `${lastAuthor} ${lastTitle} mix`;
        const result = await client.kazagumo.search(query, { requester: { id: client.user.id, tag: client.user.tag } });
        if (result && result.tracks.length > 1) {
          const pick = result.tracks[Math.floor(Math.random() * Math.min(result.tracks.length, 5))];
          player.queue.add(pick);
          await player.play();
          if (textChannel) {
            textChannel.send({ embeds: [new EmbedBuilder().setColor(config.color).setDescription(`🐾 **Autoplay:** Now playing **${pick.title}** by ${pick.author}~`)] }).catch(() => {});
          }
          return;
        }
      } catch (e) {
        console.error("[HowlBeats] Autoplay error:", e.message);
      }
    }

    if (textChannel) {
      textChannel.send({ embeds: [new EmbedBuilder().setColor(config.color).setDescription("🐾 Queue ended! Hope you enjoyed the tunes~")] }).catch(() => {});
    }
    setTimeout(() => { if (player && player.state !== "DESTROYED") player.destroy().catch(() => {}); }, 30000);
  });

  client.kazagumo.on("playerException", (player, error) => {
    console.error(`[HowlBeats] Player exception in ${player.guildId}:`, error);
  });
};
