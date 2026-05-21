const { EmbedBuilder } = require("discord.js");
const config = require("../../config/config.json");
const { check_if_dj } = require("../../handlers/functions");

module.exports = {
  name: "autoplay",
  aliases: ["ap"],
  usage: "autoplay",
  description: "Toggles autoplay — plays related songs when the queue ends",
  category: "Music",
  cooldown: 3,
  run: async (client, message, args) => {
    const channel = message.member?.voice?.channel;
    if (!channel) return message.reply({ embeds: [new EmbedBuilder().setColor(config.wrongcolor).setTitle("🐾 Join a voice channel first!")] });
    const player = client.kazagumo.players.get(message.guild.id);
    if (!player) return message.reply({ embeds: [new EmbedBuilder().setColor(config.wrongcolor).setTitle("🐾 Nothing is playing!")] });
    if (channel.id !== player.voiceId) return message.reply({ embeds: [new EmbedBuilder().setColor(config.wrongcolor).setTitle("🐾 Join my voice channel first!")] });

    const djError = check_if_dj(client, message.member, player.queue.current?.info?.requester);
    if (djError) return message.reply({ embeds: [new EmbedBuilder().setColor(config.wrongcolor).setTitle(`🐾 You need a DJ role: ${djError}`)] });

    client.infos.ensure(message.guild.id, { autoplay: false });
    const current = client.infos.get(message.guild.id, "autoplay") || false;
    const next = !current;
    client.infos.set(message.guild.id, next, "autoplay");

    message.reply({
      embeds: [new EmbedBuilder()
        .setColor(config.color)
        .setTitle(`${next ? "✅" : "❌"} Autoplay **${next ? "enabled" : "disabled"}**!`)
        .setDescription(next ? "🐾 I'll keep the tunes going by playing related songs~" : "🐾 Autoplay turned off. Queue will stop when empty.")
        .setFooter({ text: config.footertext })]
    });
  },
};
