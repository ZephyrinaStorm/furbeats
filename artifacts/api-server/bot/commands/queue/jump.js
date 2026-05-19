const { EmbedBuilder } = require("discord.js");
const config = require("../../config/config.json");
const { check_if_dj } = require("../../handlers/functions");

module.exports = {
  name: "jump",
  aliases: ["skipto", "jumpto"],
  usage: "jump <position>",
  description: "Jumps to a specific song in the queue, skipping all songs before it",
  category: "Queue",
  cooldown: 3,
  run: async (client, message, args) => {
    const channel = message.member?.voice?.channel;
    if (!channel) return message.reply({ embeds: [new EmbedBuilder().setColor(config.wrongcolor).setTitle("🐾 Join a voice channel first!")] });
    const player = client.kazagumo.players.get(message.guild.id);
    if (!player || !player.queue.current) return message.reply({ embeds: [new EmbedBuilder().setColor(config.wrongcolor).setTitle("🐾 Nothing is playing!")] });
    if (channel.id !== player.voiceId) return message.reply({ embeds: [new EmbedBuilder().setColor(config.wrongcolor).setTitle("🐾 Join my voice channel first!")] });

    const djError = check_if_dj(client, message.member, player.queue.current?.requester);
    if (djError) return message.reply({ embeds: [new EmbedBuilder().setColor(config.wrongcolor).setTitle(`🐾 You need a DJ role: ${djError}`)] });

    const pos = parseInt(args[0]);
    if (isNaN(pos) || pos < 1 || pos > player.queue.length) {
      return message.reply({ embeds: [new EmbedBuilder().setColor(config.wrongcolor).setTitle(`🐾 Provide a valid position! Queue has **${player.queue.length}** track${player.queue.length !== 1 ? "s" : ""}.`)] });
    }

    const targetTrack = player.queue[pos - 1];
    player.queue.splice(0, pos - 1);
    await player.skip();

    message.reply({ embeds: [new EmbedBuilder().setColor(config.color).setTitle(`⏭ Jumped to position **${pos}**!`).setDescription(`Now playing: **${targetTrack.title}**`).setFooter({ text: config.footertext })] });
  },
};
