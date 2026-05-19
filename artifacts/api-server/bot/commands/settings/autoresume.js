const { EmbedBuilder } = require("discord.js");
const config = require("../../config/config.json");

module.exports = {
  name: "autoresume",
  aliases: ["aresume", "resumeonstart"],
  usage: "autoresume",
  description: "Toggles whether the bot resumes playing when someone re-joins the voice channel",
  category: "Settings",
  cooldown: 5,
  memberpermissions: ["ManageGuild"],
  run: async (client, message, args) => {
    if (!message.member.permissions.has("ManageGuild")) {
      return message.reply({ embeds: [new EmbedBuilder().setColor(config.wrongcolor).setTitle("🐾 You need **Manage Server** permission!")] });
    }

    client.settings.ensure(message.guild.id, { autoresume: false });
    const current = client.settings.get(message.guild.id, "autoresume") || false;
    const next = !current;
    client.settings.set(message.guild.id, next, "autoresume");

    message.reply({
      embeds: [new EmbedBuilder()
        .setColor(config.color)
        .setTitle(`${next ? "✅" : "❌"} Auto-resume **${next ? "enabled" : "disabled"}**!`)
        .setDescription(next ? "🐾 The bot will automatically resume playback when someone joins the voice channel after it was paused alone." : "🐾 Auto-resume is off. The bot won't resume automatically.")
        .setFooter({ text: config.footertext })]
    });
  },
};
