const { EmbedBuilder } = require("discord.js");
const config = require("../../config/config.json");

function cleanTitle(title) {
  return title
    .replace(/\(.*?(official|video|audio|mv|lyric|hd|4k|music|ft\.|feat\.)[^)]*\)/gi, "")
    .replace(/\[.*?(official|video|audio|mv|lyric|hd|4k|music|ft\.|feat\.)[^]]*\]/gi, "")
    .replace(/[-|].*?(official|video|audio|lyric|hd|4k|music)/gi, "")
    .trim();
}

module.exports = {
  name: "lyrics",
  aliases: ["lyric", "lrc"],
  usage: "lyrics",
  description: "Fetches and displays the lyrics for the currently playing song",
  category: "Music",
  cooldown: 5,
  run: async (client, message, args) => {
    const player = client.kazagumo.players.get(message.guild.id);
    if (!player || !player.queue.current) return message.reply({ embeds: [new EmbedBuilder().setColor(config.wrongcolor).setTitle("🐾 Nothing is playing!")] });

    const track = player.queue.current;
    const title = cleanTitle(track.title || "");
    const artist = track.author || "";

    const fetching = await message.reply({ content: `🔍 Looking up lyrics for **${track.title}**...` });

    try {
      const url = `https://lrclib.net/api/get?artist_name=${encodeURIComponent(artist)}&track_name=${encodeURIComponent(title)}`;
      const res = await fetch(url, {
        headers: { "User-Agent": "HowlBeats/1.0" },
        signal: AbortSignal.timeout(8000),
      });

      if (!res.ok) {
        return fetching.edit({ content: null, embeds: [new EmbedBuilder().setColor(config.wrongcolor).setTitle("🐾 No lyrics found for this track!").setDescription("Try a different song or check the spelling.")] }).catch(() => {});
      }

      const data = await res.json();
      const lyrics = data.plainLyrics || data.syncedLyrics?.replace(/\[\d+:\d+\.\d+\]/g, "").trim();
      if (!lyrics) {
        return fetching.edit({ content: null, embeds: [new EmbedBuilder().setColor(config.wrongcolor).setTitle("🐾 Lyrics are empty for this track!")] }).catch(() => {});
      }

      const chunks = lyrics.match(/[\s\S]{1,3900}/g) || [lyrics];
      const embed = new EmbedBuilder()
        .setColor(config.color)
        .setTitle(`📝 ${track.title}`)
        .setURL(track.uri || null)
        .setDescription(chunks[0])
        .setFooter({ text: `Lyrics via lrclib.net • Page 1/${chunks.length} • ${config.footertext}` });

      await fetching.edit({ content: null, embeds: [embed] }).catch(() => {});

      for (let i = 1; i < Math.min(chunks.length, 3); i++) {
        await message._interaction?.followUp({
          embeds: [new EmbedBuilder().setColor(config.color).setDescription(chunks[i]).setFooter({ text: `Page ${i + 1}/${chunks.length} • ${config.footertext}` })],
        }).catch(() => {});
      }
    } catch (e) {
      console.error("[HowlBeats] lyrics error:", e.message);
      fetching.edit({ content: null, embeds: [new EmbedBuilder().setColor(config.wrongcolor).setTitle("🐾 Couldn't fetch lyrics!").setDescription(e.name === "TimeoutError" ? "Request timed out — lrclib.net may be slow. Try again." : e.message)] }).catch(() => {});
    }
  },
};
