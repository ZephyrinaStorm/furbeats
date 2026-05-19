const { EmbedBuilder } = require("discord.js");
const config = require("../../config/config.json");
const { FILTER_PRESETS, FILTER_NAMES, applyFilters } = require("../../lib/filterPresets");
const { check_if_dj } = require("../../handlers/functions");

module.exports = {
  name: "setfilter",
  aliases: ["setfilters", "setf"],
  usage: "setfilter <name>",
  description: "Replaces all active filters with a single filter",
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

    const name = args[0]?.toLowerCase();
    if (!name) return message.reply({ embeds: [new EmbedBuilder().setColor(config.wrongcolor).setTitle(`🐾 Provide a filter name! Available: ${FILTER_NAMES.map(f => `\`${f}\``).join(", ")}`)] });
    if (!FILTER_PRESETS[name]) return message.reply({ embeds: [new EmbedBuilder().setColor(config.wrongcolor).setTitle(`🐾 Unknown filter \`${name}\`! Use \`f!filters\` to see all.`)] });

    client.infos.ensure(message.guild.id, { activeFilters: [] });
    const activeFilters = name === "clear" ? [] : [name];
    client.infos.set(message.guild.id, activeFilters, "activeFilters");

    await applyFilters(player, activeFilters).catch(() => {});

    message.reply({ embeds: [new EmbedBuilder().setColor(config.color).setTitle(name === "clear" ? "🎚️ All filters cleared!" : `🎚️ Filter set to \`${name}\`!`).setFooter({ text: config.footertext })] });
  },
};
