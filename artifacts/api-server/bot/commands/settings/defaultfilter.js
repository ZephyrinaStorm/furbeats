const { EmbedBuilder } = require("discord.js");
const config = require("../../config/config.json");
const { FILTER_NAMES, FILTER_PRESETS } = require("../../lib/filterPresets");

module.exports = {
  name: "defaultfilter",
  aliases: ["dfilter", "deffilter"],
  usage: "defaultfilter <name|none>",
  description: "Sets the default filter applied when the bot starts playing",
  category: "Settings",
  cooldown: 3,
  memberpermissions: ["ManageGuild"],
  run: async (client, message, args) => {
    if (!message.member.permissions.has("ManageGuild")) {
      return message.reply({ embeds: [new EmbedBuilder().setColor(config.wrongcolor).setTitle("🐾 You need **Manage Server** permission!")] });
    }

    const current = client.settings.get(message.guild.id, "defaultfilter") || "none";
    if (!args[0]) {
      return message.reply({ embeds: [new EmbedBuilder().setColor(config.color).setTitle(`🎚️ Current default filter: **${current}**`).setDescription(`Available: ${FILTER_NAMES.map(f => `\`${f}\``).join(", ")}`).setFooter({ text: config.footertext })] });
    }

    const name = args[0].toLowerCase();
    if (name !== "none" && name !== "clear" && !FILTER_PRESETS[name]) {
      return message.reply({ embeds: [new EmbedBuilder().setColor(config.wrongcolor).setTitle(`🐾 Unknown filter! Available: ${FILTER_NAMES.map(f => `\`${f}\``).join(", ")}, \`none\``)] });
    }

    client.settings.ensure(message.guild.id, { defaultfilter: "none" });
    client.settings.set(message.guild.id, name === "clear" ? "none" : name, "defaultfilter");

    message.reply({ embeds: [new EmbedBuilder().setColor(config.color).setTitle(`🎚️ Default filter set to **${name === "clear" ? "none" : name}**`).setDescription("This filter will be applied when I start playing in a new session.").setFooter({ text: config.footertext })] });
  },
};
