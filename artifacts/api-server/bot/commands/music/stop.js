const { EmbedBuilder } = require("discord.js");
const config = require("../../config/config.json");

module.exports = {
  name: "stop",
  aliases: ["dc", "leave"],
  usage: "stop",
  description: "Stops music and leaves the voice channel",
  category: "Music",
  cooldown: 2,
  run: async (client, message, args) => {
    const channel = message.member?.voice?.channel;
    if (!channel) return message.reply({ embeds: [new EmbedBuilder().setColor(config.wrongcolor).setTitle("🐾 Join a voice channel first!")] });
    const player = client.kazagumo.players.get(message.guild.id);
    if (!player) return message.reply({ embeds: [new EmbedBuilder().setColor(config.wrongcolor).setTitle("🐾 Nothing is playing!")] });
    await player.destroy();
    message.reply({ embeds: [new EmbedBuilder().setColor(config.color).setTitle("⏹ Stopped and left the channel! See you next time~ 🐾")] });
  }
};
