const { EmbedBuilder } = require("discord.js");
const config = require("../../config/config.json");
const { check_if_dj } = require("../../handlers/functions");

module.exports = {
  name: "custombassboost",
  aliases: ["bassboost", "bb", "bass", "cbass"],
  usage: "custombassboost <0-100>",
  description: "Sets a custom bass boost level (0 = off, 100 = max)",
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

    if (!args[0]) return message.reply({ embeds: [new EmbedBuilder().setColor(config.wrongcolor).setTitle("🐾 Provide a level (0–100)!")] });
    const level = parseInt(args[0]);
    if (isNaN(level) || level < 0 || level > 100) return message.reply({ embeds: [new EmbedBuilder().setColor(config.wrongcolor).setTitle("🐾 Level must be 0–100!")] });

    const gain = level === 0 ? 0 : (level / 100) * 1.0;
    const eq = [
      { band: 0, gain: gain * 0.9 },
      { band: 1, gain: gain * 1.0 },
      { band: 2, gain: gain * 0.8 },
      { band: 3, gain: gain * 0.5 },
      { band: 4, gain: gain * 0.2 },
    ].filter(b => true);

    await player.shoukaku.setFilters({ equalizer: level === 0 ? [] : eq }).catch(() => {});

    const label = level === 0 ? "off" : `${level}%`;
    message.reply({ embeds: [new EmbedBuilder().setColor(config.color).setTitle(`🔊 Bass boost set to **${label}**!`).setFooter({ text: config.footertext })] });
  },
};
