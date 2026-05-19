const { EmbedBuilder } = require("discord.js");
const config = require("../../config/config.json");
const { msToTime } = require("../../handlers/functions");

module.exports = {
  name: "rewind",
  aliases: ["rw", "back"],
  usage: "rewind [seconds]",
  description: "Rewinds by a number of seconds (default: 15)",
  category: "Music",
  cooldown: 2,
  run: async (client, message, args) => {
    const channel = message.member?.voice?.channel;
    if (!channel) return message.reply({ embeds: [new EmbedBuilder().setColor(config.wrongcolor).setTitle("🐾 Join a voice channel first!")] });
    const player = client.kazagumo.players.get(message.guild.id);
    if (!player || !player.queue.current) return message.reply({ embeds: [new EmbedBuilder().setColor(config.wrongcolor).setTitle("🐾 Nothing is playing!")] });
    if (channel.id !== player.voiceId) return message.reply({ embeds: [new EmbedBuilder().setColor(config.wrongcolor).setTitle("🐾 Join my voice channel first!")] });
    const seconds = parseInt(args[0]) || 15;
    if (isNaN(seconds) || seconds < 1 || seconds > 600) return message.reply({ embeds: [new EmbedBuilder().setColor(config.wrongcolor).setTitle("🐾 Seconds must be between 1 and 600!")] });
    const newPos = Math.max(0, (player.position || 0) - seconds * 1000);
    await player.seek(newPos);
    message.reply({
      embeds: [new EmbedBuilder()
        .setColor(config.color)
        .setTitle(`⏪ Rewound **${seconds}s** → \`${msToTime(newPos)}\``)
        .setFooter({ text: config.footertext })],
    });
  },
};
