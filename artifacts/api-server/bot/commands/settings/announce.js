const { EmbedBuilder } = require("discord.js");
const config = require("../../config/config.json");

module.exports = {
  name: "announce",
  aliases: ["nowplayingmsg", "npannounce"],
  usage: "announce",
  description: "Toggles whether a now-playing message is sent for each new track",
  category: "Settings",
  cooldown: 3,
  memberpermissions: ["ManageGuild"],
  run: async (client, message, args) => {
    if (!message.member.permissions.has("ManageGuild")) {
      return message.reply({ embeds: [new EmbedBuilder().setColor(config.wrongcolor).setTitle("🐾 You need **Manage Server** permission!")] });
    }

    client.settings.ensure(message.guild.id, { announce: true });
    const current = client.settings.get(message.guild.id, "announce");
    const next = current === false ? true : false;
    client.settings.set(message.guild.id, next, "announce");

    message.reply({
      embeds: [new EmbedBuilder()
        .setColor(config.color)
        .setTitle(`${next ? "✅" : "❌"} Now-Playing Announcements **${next ? "On" : "Off"}**!`)
        .setDescription(
          next
            ? "🐾 I'll post a now-playing card with controls for each new track."
            : "🐾 I'll play silently — no now-playing messages will be sent."
        )
        .setFooter({ text: config.footertext })],
    });
  },
};
