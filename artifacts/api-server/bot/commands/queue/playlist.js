const { EmbedBuilder } = require("discord.js");
const config = require("../../config/config.json");
const { msToTime } = require("../../handlers/functions");

module.exports = {
  name: "playlist",
  aliases: ["pl", "savedqueue"],
  usage: "playlist <save|load|list|delete> [name]",
  description: "Save, load, list, or delete server playlists",
  category: "Queue",
  cooldown: 5,
  run: async (client, message, args) => {
    const action = args[0]?.toLowerCase();
    const name = args.slice(1).join(" ").trim().toLowerCase().replace(/[^a-z0-9 _-]/g, "").slice(0, 32);

    client.settings.ensure(message.guild.id, { playlists: {} });

    if (!action || action === "list") {
      const playlists = client.settings.get(message.guild.id, "playlists") || {};
      const names = Object.keys(playlists);
      if (!names.length) {
        return message.reply({ embeds: [new EmbedBuilder().setColor(config.wrongcolor).setTitle("🐾 No saved playlists yet!\nUse `/playlist save <name>` to save the current queue.")] });
      }
      return message.reply({
        embeds: [new EmbedBuilder()
          .setColor(config.color)
          .setTitle("🎵 Saved Playlists")
          .setDescription(names.map((n, i) => `**${i + 1}.** \`${n}\` — ${playlists[n].length} track${playlists[n].length !== 1 ? "s" : ""}`).join("\n"))
          .setFooter({ text: config.footertext })],
      });
    }

    if (action === "save") {
      if (!name) return message.reply({ embeds: [new EmbedBuilder().setColor(config.wrongcolor).setTitle("🐾 Provide a playlist name!")] });
      const player = client.kazagumo.players.get(message.guild.id);
      if (!player || !player.queue.current) return message.reply({ embeds: [new EmbedBuilder().setColor(config.wrongcolor).setTitle("🐾 Nothing is playing!")] });
      const tracks = [player.queue.current, ...player.queue].slice(0, 50);
      const saved = tracks.map(t => ({ title: t.title, uri: t.uri, author: t.author, length: t.length }));
      const playlists = client.settings.get(message.guild.id, "playlists") || {};
      playlists[name] = saved;
      client.settings.set(message.guild.id, playlists, "playlists");
      return message.reply({
        embeds: [new EmbedBuilder()
          .setColor(config.color)
          .setTitle(`✅ Playlist **${name}** saved!`)
          .setDescription(`Saved **${saved.length}** track${saved.length !== 1 ? "s" : ""}. Use \`/playlist load ${name}\` to load it.`)
          .setFooter({ text: config.footertext })],
      });
    }

    if (action === "load") {
      if (!name) return message.reply({ embeds: [new EmbedBuilder().setColor(config.wrongcolor).setTitle("🐾 Provide a playlist name!")] });
      const playlists = client.settings.get(message.guild.id, "playlists") || {};
      if (!playlists[name]) return message.reply({ embeds: [new EmbedBuilder().setColor(config.wrongcolor).setTitle(`🐾 No playlist named \`${name}\`!`)] });
      const channel = message.member?.voice?.channel;
      if (!channel) return message.reply({ embeds: [new EmbedBuilder().setColor(config.wrongcolor).setTitle("🐾 Join a voice channel first!")] });

      const loading = await message.reply({ content: `📂 Loading playlist **${name}**...` });
      try {
        const player = client.kazagumo.players.get(message.guild.id) || await client.kazagumo.createPlayer({
          guildId: message.guild.id, voiceId: channel.id, textId: message.channel.id,
          deaf: true, volume: client.settings.get(message.guild.id, "defaultvolume") || 80,
        });

        let loaded = 0;
        for (const saved of playlists[name]) {
          try {
            const res = await client.kazagumo.search(saved.uri || saved.title, { requester: { id: message.author.id, tag: message.author.tag } });
            if (res?.tracks?.length) { player.queue.add(res.tracks[0]); loaded++; }
          } catch { /* skip tracks that fail */ }
        }

        if (!player.playing && !player.paused && player.queue.length > 0) await player.play();
        await loading.edit({
          content: null,
          embeds: [new EmbedBuilder()
            .setColor(config.color)
            .setTitle(`✅ Loaded playlist **${name}**!`)
            .setDescription(`Added **${loaded}** track${loaded !== 1 ? "s" : ""} to the queue.`)
            .setFooter({ text: config.footertext })],
        });
      } catch (e) {
        loading.edit({ content: `🐾 Error loading playlist: ${e.message}` }).catch(() => {});
      }
      return;
    }

    if (action === "delete") {
      if (!name) return message.reply({ embeds: [new EmbedBuilder().setColor(config.wrongcolor).setTitle("🐾 Provide a playlist name!")] });
      if (!message.member.permissions.has("ManageGuild")) return message.reply({ embeds: [new EmbedBuilder().setColor(config.wrongcolor).setTitle("🐾 You need **Manage Server** to delete playlists!")] });
      const playlists = client.settings.get(message.guild.id, "playlists") || {};
      if (!playlists[name]) return message.reply({ embeds: [new EmbedBuilder().setColor(config.wrongcolor).setTitle(`🐾 No playlist named \`${name}\`!`)] });
      delete playlists[name];
      client.settings.set(message.guild.id, playlists, "playlists");
      return message.reply({ embeds: [new EmbedBuilder().setColor(config.color).setTitle(`🗑️ Deleted playlist **${name}**!`).setFooter({ text: config.footertext })] });
    }

    message.reply({ embeds: [new EmbedBuilder().setColor(config.wrongcolor).setTitle("🐾 Invalid action! Use: `save`, `load`, `list`, or `delete`")] });
  },
};
