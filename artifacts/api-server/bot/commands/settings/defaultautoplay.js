const { EmbedBuilder } = require("discord.js");
const config = require("../../config/config.json");

module.exports = {
  name: "defaultautoplay",
  aliases: ["dautoplay", "defautoplay"],
  usage: "defaultautoplay",
  description: "Toggles whether autoplay is on by default for this server",
  category: "Settings",
  cooldown: 3,
  memberpermissions: ["ManageGuild"],
  run: async (client, message, args) => {
    if (!message.member.permissions.has("ManageGuild")) {
      return message.reply({ embeds: [new EmbedBuilder().setColor(config.wrongcolor).setTitle("🐾 You need **Manage Server** permission!")] });
    }

    client.settings.ensure(message.guild.id, { defaultautoplay: false });
    const current = client.settings.get(message.guild.id, "defaultautoplay") || false;
    const next = !current;
    client.settings.set(message.guild.id, next, "defaultautoplay");

    message.reply({
      embeds: [new EmbedBuilder()
        .setColor(config.color)
        .setTitle(`${next ? "✅" : "❌"} Default Autoplay **${next ? "enabled" : "disabled"}**!`)
        .setDescription(next ? "🐾 Autoplay will be on by default when the bot starts playing." : "🐾 Autoplay will be off by default.")
        .setFooter({ text: config.footertext })]
    });
  },
};
