const { EmbedBuilder } = require("discord.js");
const config = require("../../config/config.json");

module.exports = {
  name: "uptime",
  aliases: ["up", "online"],
  usage: "uptime",
  description: "Shows how long the bot has been online",
  category: "Info",
  cooldown: 3,
  run: async (client, message, args) => {
    const totalSeconds = Math.floor(process.uptime());
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const parts = [];
    if (days > 0) parts.push(`**${days}** day${days !== 1 ? "s" : ""}`);
    if (hours > 0) parts.push(`**${hours}** hour${hours !== 1 ? "s" : ""}`);
    if (minutes > 0) parts.push(`**${minutes}** minute${minutes !== 1 ? "s" : ""}`);
    parts.push(`**${seconds}** second${seconds !== 1 ? "s" : ""}`);

    const embed = new EmbedBuilder()
      .setColor(config.color)
      .setTitle("⏰ Bot Uptime")
      .setDescription(`🐾 I've been online for ${parts.join(", ")}!`)
      .addFields(
        { name: "🟢 Status", value: "Online", inline: true },
        { name: "🏓 Ping", value: `${Math.round(client.ws.ping)}ms`, inline: true },
        { name: "🎵 Active Players", value: `${client.kazagumo.players.size}`, inline: true },
      )
      .setTimestamp()
      .setFooter({ text: config.footertext });

    message.reply({ embeds: [embed] });
  },
};
