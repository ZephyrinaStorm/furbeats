const { EmbedBuilder } = require("discord.js");
const config = require("../../config/config.json");

module.exports = {
  name: "invite",
  aliases: ["inviteme", "addme", "addbot"],
  usage: "invite",
  description: "Sends the invite link to add HowlBeats to your server",
  category: "Info",
  cooldown: 5,
  run: async (client, message, args) => {
    const inviteURL = `https://discord.com/api/oauth2/authorize?client_id=${client.user.id}&permissions=8&scope=bot%20applications.commands`;
    const domain = config.website || (process.env.REPLIT_DOMAINS ? `https://${process.env.REPLIT_DOMAINS.split(",")[0]}` : null);

    const embed = new EmbedBuilder()
      .setColor(config.color)
      .setTitle("📩 Invite HowlBeats!")
      .setDescription(`Add HowlBeats to your server for high-quality furry music vibes~ 🐾`)
      .setThumbnail(client.user.displayAvatarURL())
      .addFields(
        { name: "📩 Invite Link", value: `[Add to Discord](${inviteURL})`, inline: true },
        ...(domain ? [{ name: "🌐 Website", value: `[Open Dashboard](${domain})`, inline: true }] : []),
        { name: "💬 Support", value: config.support || "N/A", inline: true },
      )
      .setFooter({ text: config.footertext });

    message.reply({ embeds: [embed] });
  },
};
