const { EmbedBuilder } = require("discord.js");
const config = require("../../config/config.json");
const { createBar, msToTime } = require("../../handlers/functions");

module.exports = {
  name: "nowplaying",
  aliases: ["np", "current"],
  usage: "nowplaying",
  description: "Shows the currently playing song",
  category: "Music",
  cooldown: 2,
  run: async (client, message, args) => {
    const player = client.kazagumo.players.get(message.guild.id);
    if (!player || !player.queue.current) return message.reply({ embeds: [new EmbedBuilder().setColor(config.wrongcolor).setTitle("🐾 Nothing is playing!")] });
    const track = player.queue.current;
    const pos = player.position || 0;
    const dur = track.length || 0;
    const bar = createBar(dur, pos, 20);
    const embed = new EmbedBuilder()
      .setColor(config.color)
      .setAuthor({ name: "🐾 Now Playing" })
      .setTitle(track.title)
      .setURL(track.uri || null)
      .setThumbnail(track.thumbnail || null)
      .addFields(
        { name: "Artist", value: track.author || "Unknown", inline: true },
        { name: "Duration", value: `${msToTime(pos)} / ${dur === 0 ? "LIVE" : msToTime(dur)}`, inline: true },
        { name: "Requested by", value: track.requester ? `<@${track.requester?.id || track.requester}>` : "Unknown", inline: true },
      )
      .setDescription(bar)
      .setFooter({ text: config.footertext });
    message.reply({ embeds: [embed] });
  }
};
