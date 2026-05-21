const { EmbedBuilder } = require("discord.js");
const config = require("../../config/config.json");
const { normalizeQuery, getLoadingMessage, isUrl, detectPlatform } = require("../../lib/platformResolver");

module.exports = {
  name: "play",
  aliases: ["p", "paly"],
  usage: "play <search/link>",
  description: "Plays music from YouTube, Spotify, Apple Music, Deezer, SoundCloud, Yandex, Tidal, Jiosaavn, Twitch, Bandcamp, Vimeo, or a direct link",
  category: "Music",
  cooldown: 2,
  run: async (client, message, args) => {
    const channel = message.member?.voice?.channel;
    if (!channel) return message.reply({ embeds: [new EmbedBuilder().setColor(config.wrongcolor).setTitle("🐾 Join a voice channel first!")] });
    if (!args[0]) return message.reply({ embeds: [new EmbedBuilder().setColor(config.wrongcolor).setTitle("🐾 Please provide a search query or link!")] });

    const nodes = [...client.shoukaku.nodes.values()];
    const connected = nodes.some(n => n.state === 1);
    if (!connected) {
      return message.reply({ embeds: [new EmbedBuilder().setColor(config.wrongcolor).setTitle("🐾 Music service is temporarily unavailable!").setDescription("The audio server is reconnecting — please try again in a few seconds~")] });
    }

    const raw = args.join(" ");
    const query = normalizeQuery(raw);
    const loadMsg = getLoadingMessage(query);
    const searching = await message.reply({ content: loadMsg });

    try {
      const player = await client.kazagumo.createPlayer({
        guildId: message.guild.id,
        voiceId: channel.id,
        textId: message.channel.id,
        deaf: true,
        volume: client.settings.get(message.guild.id, "defaultvolume") || 80,
      });

      const result = await client.kazagumo.search(query, { requester: { id: message.author.id, tag: message.author.tag } });
      if (!result || !result.tracks.length) {
        const platform = isUrl(query) ? detectPlatform(query) : null;
        const hint = platform && platform.name !== "HTTP Stream"
          ? `\n-# Make sure the link is public and the audio server supports **${platform.name}**.`
          : "";
        return searching.edit({ content: `🐾 No results found for \`${raw.slice(0, 60)}\`!${hint}` });
      }

      if (result.type === "PLAYLIST") {
        result.tracks.forEach(t => player.queue.add(t));
        const platform = isUrl(query) ? detectPlatform(query) : null;
        const src = platform ? `${platform.emoji} ${platform.name}` : "🎵";
        await searching.edit({ content: `${src} Added playlist **${result.playlistName}** (${result.tracks.length} tracks) to the queue!` });
      } else {
        const track = result.tracks[0];
        player.queue.add(track);
        const platform = isUrl(query) ? detectPlatform(query) : null;
        const src = platform && platform.name !== "HTTP Stream" ? `${platform.emoji} ` : "";
        await searching.edit({ content: `${player.playing ? `👍 Added to queue` : `🎶 Now Playing`}: ${src}**${track.title}**` });
      }

      if (!player.playing && !player.paused) await player.play();
    } catch (e) {
      console.error("[HowlBeats] play error:", e);
      const msg = e.message?.toLowerCase().includes("no node")
        ? "🐾 The audio server just dropped — please try again in a moment~"
        : `🐾 Error: ${e.message}`;
      searching.edit({ content: msg }).catch(() => {});
    }
  }
};
