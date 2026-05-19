const { EmbedBuilder } = require("discord.js");
const config = require("../../config/config.json");
const { FILTER_NAMES } = require("../../lib/filterPresets");

module.exports = {
  name: "filters",
  aliases: ["listfilter", "listfilters", "allfilters", "filter"],
  usage: "filters",
  description: "Lists all available filters and the currently active ones",
  category: "Filter",
  cooldown: 3,
  run: async (client, message, args) => {
    const player = client.kazagumo.players.get(message.guild.id);
    const activeFilters = client.infos.get(message.guild.id, "activeFilters") || [];

    const embed = new EmbedBuilder()
      .setColor(config.color)
      .setTitle("🎚️ Audio Filters")
      .setDescription(
        `Use \`f!addfilter <name>\` to add, \`f!setfilter <name>\` to replace all, \`f!removefilter <name>\` to remove, or \`f!clearfilters\` to clear.\n`
      )
      .addFields(
        {
          name: "✅ Active Filters",
          value: activeFilters.length ? activeFilters.map(f => `\`${f}\``).join(", ") : "*None*",
          inline: false,
        },
        {
          name: "📋 Available Presets",
          value: FILTER_NAMES.map(f => `\`${f}\``).join(", "),
          inline: false,
        }
      )
      .setFooter({ text: config.footertext });

    message.reply({ embeds: [embed] });
  },
};
