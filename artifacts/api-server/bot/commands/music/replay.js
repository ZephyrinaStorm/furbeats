const { EmbedBuilder } = require("discord.js");
const config = require("../../config/config.json");

module.exports = {
  name: "replay",
  aliases: ["restart", "replaytrack"],
  usage: "replay",
  description: "Restarts the current song from the beginning",
  category: "Music",
  cooldown: 2,
  run: async (client, message, args) => {
    const channel = message.member?.voice?.channel;
    if (!channel) return message.reply({ embeds: [new EmbedBuilder().setColor(config.wrongcolor).setTitle("🐾 Join a voice channel first!")] });
    const player = client.kazagumo.players.get(message.guild.id);
    if (!player || !player.queue.current) return message.reply({ embeds: [new EmbedBuilder().setColor(config.wrongcolor).setTitle("🐾 Nothing is playing!")] });
    if (channel.id !== player.voiceId) return message.reply({ embeds: [new EmbedBuilder().setColor(config.wrongcolor).setTitle("🐾 Join my voice channel first!")] });
    await player.seek(0);
    message.reply({
      embeds: [new EmbedBuilder()
        .setColor(config.color)
        .setTitle("🔄 Restarting from the beginning!")
        .setDescription(`**${player.queue.current.title}**`)
        .setFooter({ text: config.footertext })],
    });
  },
};
