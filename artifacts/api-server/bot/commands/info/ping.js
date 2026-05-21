const { EmbedBuilder } = require("discord.js");
const config = require("../../config/config.json");

module.exports = {
  name: "ping",
  aliases: [],
  usage: "ping",
  description: "Shows the bot latency",
  category: "Info",
  cooldown: 3,
  run: async (client, message, args) => {
    const sent = await message.reply({ content: "🐾 Pinging..." });
    const latency = sent.createdTimestamp - message.createdTimestamp;
    await sent.edit({
      content: null,
      embeds: [new EmbedBuilder()
        .setColor(config.color)
        .setTitle("🏓 Pong!")
        .addFields(
          { name: "Bot Latency", value: `\`${latency}ms\``, inline: true },
          { name: "API Latency", value: `\`${Math.round(client.ws.ping)}ms\``, inline: true },
        )
        .setFooter({ text: config.footertext })]
    });
  }
};
