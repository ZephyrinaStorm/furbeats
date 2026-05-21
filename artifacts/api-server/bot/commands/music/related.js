const { EmbedBuilder } = require("discord.js");
const config = require("../../config/config.json");

module.exports = {
  name: "related",
  aliases: ["suggest", "rec", "recommend"],
  usage: "related",
  description: "Adds a related song to the queue based on what's currently playing",
  category: "Music",
  cooldown: 5,
  run: async (client, message, args) => {
    const channel = message.member?.voice?.channel;
    if (!channel) return message.reply({ embeds: [new EmbedBuilder().setColor(config.wrongcolor).setTitle("🐾 Join a voice channel first!")] });
    const player = client.kazagumo.players.get(message.guild.id);
    if (!player || !player.queue.current) return message.reply({ embeds: [new EmbedBuilder().setColor(config.wrongcolor).setTitle("🐾 Nothing is playing!")] });
    if (channel.id !== player.voiceId) return message.reply({ embeds: [new EmbedBuilder().setColor(config.wrongcolor).setTitle("🐾 Join my voice channel first!")] });

    const current = player.queue.current;
    const searching = await message.reply({ content: "🔍 Finding a related song..." });

    try {
      const query = `${current.author || ""} ${current.title} mix`.trim();
      const result = await client.kazagumo.search(query, { requester: { id: message.author.id, tag: message.author.tag } });
      if (!result || result.tracks.length < 2) {
        return searching.edit({ content: "🐾 Couldn't find a related song — try `/radio` instead!" });
      }

      const candidates = result.tracks.filter(t => t.title !== current.title).slice(0, 5);
      const pick = candidates[Math.floor(Math.random() * candidates.length)];
      player.queue.add(pick);
      if (!player.playing && !player.paused) await player.play();

      await searching.edit({
        content: null,
        embeds: [new EmbedBuilder()
          .setColor(config.color)
          .setTitle("🎵 Related Song Added!")
          .setDescription(`**[${pick.title}](${pick.uri})**\nby ${pick.author || "Unknown"}`)
          .setThumbnail(pick.thumbnail || null)
          .setFooter({ text: config.footertext })],
      });
    } catch (e) {
      console.error("[HowlBeats] related error:", e.message);
      searching.edit({ content: `🐾 Error: ${e.message}` }).catch(() => {});
    }
  },
};
