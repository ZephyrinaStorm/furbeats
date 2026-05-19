const { EmbedBuilder } = require("discord.js");
const config = require("../../config/config.json");

module.exports = {
  name: "shuffle",
  aliases: ["mix"],
  usage: "shuffle",
  description: "Shuffles the queue",
  category: "Queue",
  cooldown: 2,
  run: async (client, message, args) => {
    const player = client.kazagumo.players.get(message.guild.id);
    if (!player || !player.queue.current) return message.reply({ embeds: [new EmbedBuilder().setColor(config.wrongcolor).setTitle("🐾 Nothing is playing!")] });
    player.queue.shuffle();
    message.reply({ embeds: [new EmbedBuilder().setColor(config.color).setTitle("🔀 Queue shuffled!")] });
  }
};
