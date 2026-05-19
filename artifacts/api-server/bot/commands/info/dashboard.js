const { EmbedBuilder } = require("discord.js");
const config = require("../../config/config.json");

module.exports = {
  name: "dashboard",
  aliases: ["dash", "web", "website"],
  usage: "dashboard",
  description: "Sends the link to the HowlBeats web dashboard",
  category: "Info",
  cooldown: 3,
  run: async (client, message, args) => {
    const domain = config.website || (process.env.REPLIT_DOMAINS ? `https://${process.env.REPLIT_DOMAINS.split(",")[0]}` : "http://localhost:8080");

    const embed = new EmbedBuilder()
      .setColor(config.color)
      .setTitle("🎛️ HowlBeats Dashboard")
      .setDescription(`Manage your server settings, view the live queue, and more from the web dashboard!`)
      .addFields(
        { name: "🌐 Dashboard", value: `[Click here to open](${domain}/dashboard)`, inline: true },
        { name: "📖 Commands", value: `[View all commands](${domain}/commands)`, inline: true },
      )
      .setFooter({ text: config.footertext });

    message.reply({ embeds: [embed] });
  },
};
