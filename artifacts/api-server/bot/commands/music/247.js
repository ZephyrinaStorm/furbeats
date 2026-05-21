const { EmbedBuilder } = require("discord.js");
const config = require("../../config/config.json");

module.exports = {
  name: "247",
  aliases: ["nonstop", "stay"],
  usage: "247",
  description: "Toggles 24/7 mode — bot stays in voice even when no one is listening",
  category: "Music",
  cooldown: 3,
  memberpermissions: ["ManageGuild"],
  run: async (client, message, args) => {
    if (!message.member.permissions.has("ManageGuild")) {
      return message.reply({ embeds: [new EmbedBuilder().setColor(config.wrongcolor).setTitle("🐾 You need **Manage Server** permission!")] });
    }

    client.infos.ensure(message.guild.id, { mode247: false });
    const current = client.infos.get(message.guild.id, "mode247") || false;
    const next = !current;
    client.infos.set(message.guild.id, next, "mode247");

    message.reply({
      embeds: [new EmbedBuilder()
        .setColor(config.color)
        .setTitle(`${next ? "✅" : "❌"} 24/7 Mode **${next ? "Enabled" : "Disabled"}**!`)
        .setDescription(
          next
            ? "🐾 I'll stay in the voice channel even when it's empty~"
            : "🐾 I'll leave the voice channel after 30 seconds when empty."
        )
        .setFooter({ text: config.footertext })],
    });
  },
};
