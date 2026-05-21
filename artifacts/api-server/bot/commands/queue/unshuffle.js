const { EmbedBuilder } = require("discord.js");
const config = require("../../config/config.json");
const { check_if_dj } = require("../../handlers/functions");

module.exports = {
  name: "unshuffle",
  aliases: ["unshuf", "deshuffle", "reshuffle"],
  usage: "unshuffle",
  description: "Re-shuffles the queue randomly (mix it up again)",
  category: "Queue",
  cooldown: 3,
  run: async (client, message, args) => {
    const channel = message.member?.voice?.channel;
    if (!channel) return message.reply({ embeds: [new EmbedBuilder().setColor(config.wrongcolor).setTitle("🐾 Join a voice channel first!")] });
    const player = client.kazagumo.players.get(message.guild.id);
    if (!player || !player.queue.current) return message.reply({ embeds: [new EmbedBuilder().setColor(config.wrongcolor).setTitle("🐾 Nothing is playing!")] });
    if (channel.id !== player.voiceId) return message.reply({ embeds: [new EmbedBuilder().setColor(config.wrongcolor).setTitle("🐾 Join my voice channel first!")] });

    const djError = check_if_dj(client, message.member, player.queue.current?.info?.requester);
    if (djError) return message.reply({ embeds: [new EmbedBuilder().setColor(config.wrongcolor).setTitle(`🐾 You need a DJ role: ${djError}`)] });

    if (player.queue.length < 2) return message.reply({ embeds: [new EmbedBuilder().setColor(config.wrongcolor).setTitle("🐾 Not enough tracks to shuffle!")] });

    player.queue.shuffle();

    message.reply({ embeds: [new EmbedBuilder().setColor(config.color).setTitle("🔀 Queue re-shuffled!").setDescription(`${player.queue.length} tracks mixed up again~`).setFooter({ text: config.footertext })] });
  },
};
