const { EmbedBuilder } = require("discord.js");
const config = require("../../config/config.json");
const { check_if_dj } = require("../../handlers/functions");

module.exports = {
  name: "previous",
  aliases: ["prev", "pre", "back"],
  usage: "previous",
  description: "Plays the previous song",
  category: "Queue",
  cooldown: 3,
  run: async (client, message, args) => {
    const channel = message.member?.voice?.channel;
    if (!channel) return message.reply({ embeds: [new EmbedBuilder().setColor(config.wrongcolor).setTitle("🐾 Join a voice channel first!")] });
    const player = client.kazagumo.players.get(message.guild.id);
    if (!player) return message.reply({ embeds: [new EmbedBuilder().setColor(config.wrongcolor).setTitle("🐾 Nothing is playing!")] });
    if (channel.id !== player.voiceId) return message.reply({ embeds: [new EmbedBuilder().setColor(config.wrongcolor).setTitle("🐾 Join my voice channel first!")] });

    const djError = check_if_dj(client, message.member, player.queue.current?.requester);
    if (djError) return message.reply({ embeds: [new EmbedBuilder().setColor(config.wrongcolor).setTitle(`🐾 You need a DJ role: ${djError}`)] });

    if (!player.queue.previous) {
      return message.reply({ embeds: [new EmbedBuilder().setColor(config.wrongcolor).setTitle("🐾 No previous track to go back to!")] });
    }

    const prev = player.queue.previous;
    player.queue.unshift(prev);
    await player.skip();

    message.reply({ embeds: [new EmbedBuilder().setColor(config.color).setTitle("⏮ Playing previous track!").setDescription(`**${prev.title}**`).setFooter({ text: config.footertext })] });
  },
};
