const { EmbedBuilder } = require("discord.js");
const config = require("../../config/config.json");

module.exports = {
  name: "remove",
  aliases: ["rm"],
  usage: "remove <position>",
  description: "Removes a track from the queue",
  category: "Queue",
  cooldown: 1,
  run: async (client, message, args) => {
    const player = client.kazagumo.players.get(message.guild.id);
    if (!player || !player.queue.current) return message.reply({ embeds: [new EmbedBuilder().setColor(config.wrongcolor).setTitle("🐾 Nothing is playing!")] });
    const pos = parseInt(args[0]);
    if (isNaN(pos) || pos < 1 || pos > player.queue.length) {
      return message.reply({ embeds: [new EmbedBuilder().setColor(config.wrongcolor).setTitle(`🐾 Invalid position! Queue has ${player.queue.length} tracks.`)] });
    }
    const removed = player.queue[pos - 1];
    player.queue.remove(pos - 1);
    message.reply({ embeds: [new EmbedBuilder().setColor(config.color).setTitle(`🗑️ Removed **${removed.title}** from queue`)] });
  }
};
