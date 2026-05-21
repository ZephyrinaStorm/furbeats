const { EmbedBuilder } = require("discord.js");
const config = require("../../config/config.json");
const { check_if_dj } = require("../../handlers/functions");

module.exports = {
  name: "speed",
  aliases: ["customspeed", "changespeed", "cspeed", "playbackspeed"],
  usage: "speed <0.5-2.0>",
  description: "Changes the playback speed (0.5 = slow, 1.0 = normal, 2.0 = fast)",
  category: "Filter",
  cooldown: 3,
  run: async (client, message, args) => {
    const channel = message.member?.voice?.channel;
    if (!channel) return message.reply({ embeds: [new EmbedBuilder().setColor(config.wrongcolor).setTitle("🐾 Join a voice channel first!")] });
    const player = client.kazagumo.players.get(message.guild.id);
    if (!player || !player.queue.current) return message.reply({ embeds: [new EmbedBuilder().setColor(config.wrongcolor).setTitle("🐾 Nothing is playing!")] });
    if (channel.id !== player.voiceId) return message.reply({ embeds: [new EmbedBuilder().setColor(config.wrongcolor).setTitle("🐾 Join my voice channel first!")] });

    const djError = check_if_dj(client, message.member, player.queue.current?.info?.requester);
    if (djError) return message.reply({ embeds: [new EmbedBuilder().setColor(config.wrongcolor).setTitle(`🐾 You need a DJ role: ${djError}`)] });

    if (!args[0]) return message.reply({ embeds: [new EmbedBuilder().setColor(config.wrongcolor).setTitle("🐾 Provide a speed (0.5–2.0)! Use `1` for normal.")] });
    const speed = parseFloat(args[0]);
    if (isNaN(speed) || speed < 0.25 || speed > 3.0) return message.reply({ embeds: [new EmbedBuilder().setColor(config.wrongcolor).setTitle("🐾 Speed must be between 0.25 and 3.0!")] });

    await player.shoukaku.setFilters({ timescale: { speed, pitch: 1.0, rate: 1.0 } }).catch(() => {});

    const label = speed === 1.0 ? "normal" : `${speed}x`;
    message.reply({ embeds: [new EmbedBuilder().setColor(config.color).setTitle(`⏩ Playback speed set to **${label}**!`).setFooter({ text: config.footertext })] });
  },
};
