const { EmbedBuilder } = require("discord.js");
const config = require("../../config/config.json");

module.exports = {
  name: "clear",
  aliases: ["clearqueue"],
  usage: "clear",
  description: "Clears the queue",
  category: "Queue",
  cooldown: 2,
  run: async (client, message, args) => {
    const player = client.kazagumo.players.get(message.guild.id);
    if (!player) return message.reply({ embeds: [new EmbedBuilder().setColor(config.wrongcolor).setTitle("🐾 Nothing is playing!")] });
    player.queue.clear();
    message.reply({ embeds: [new EmbedBuilder().setColor(config.color).setTitle("🗑️ Queue cleared!")] });
  }
};
