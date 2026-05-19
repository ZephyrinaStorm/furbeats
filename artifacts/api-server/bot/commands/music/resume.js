const { EmbedBuilder } = require("discord.js");
const config = require("../../config/config.json");

module.exports = {
  name: "resume",
  aliases: ["r", "res"],
  usage: "resume",
  description: "Resumes the paused song",
  category: "Music",
  cooldown: 1,
  run: async (client, message, args) => {
    const channel = message.member?.voice?.channel;
    if (!channel) return message.reply({ embeds: [new EmbedBuilder().setColor(config.wrongcolor).setTitle("🐾 Join a voice channel first!")] });
    const player = client.kazagumo.players.get(message.guild.id);
    if (!player || !player.queue.current) return message.reply({ embeds: [new EmbedBuilder().setColor(config.wrongcolor).setTitle("🐾 Nothing is playing!")] });
    if (!player.paused) return message.reply({ embeds: [new EmbedBuilder().setColor(config.wrongcolor).setTitle("🐾 Not paused!")] });
    player.pause(false);
    message.reply({ embeds: [new EmbedBuilder().setColor(config.color).setTitle("▶️ Resumed!")] });
  }
};
