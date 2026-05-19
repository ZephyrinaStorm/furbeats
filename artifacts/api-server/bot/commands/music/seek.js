const { EmbedBuilder } = require("discord.js");
const config = require("../../config/config.json");
const { msToTime } = require("../../handlers/functions");

module.exports = {
  name: "seek",
  aliases: [],
  usage: "seek <seconds>",
  description: "Seeks to a position in the song",
  category: "Music",
  cooldown: 2,
  run: async (client, message, args) => {
    const player = client.kazagumo.players.get(message.guild.id);
    if (!player || !player.queue.current) return message.reply({ embeds: [new EmbedBuilder().setColor(config.wrongcolor).setTitle("🐾 Nothing is playing!")] });
    if (!args[0]) return message.reply({ embeds: [new EmbedBuilder().setColor(config.wrongcolor).setTitle("🐾 Provide seconds to seek to!")] });
    const seconds = parseInt(args[0]);
    if (isNaN(seconds) || seconds < 0) return message.reply({ embeds: [new EmbedBuilder().setColor(config.wrongcolor).setTitle("🐾 Invalid time!")] });
    await player.seek(seconds * 1000);
    message.reply({ embeds: [new EmbedBuilder().setColor(config.color).setTitle(`⏩ Seeked to **${msToTime(seconds * 1000)}**`)] });
  }
};
