const { EmbedBuilder } = require("discord.js");
const config = require("../../config/config.json");

module.exports = {
  name: "commandcount",
  aliases: ["cmds", "cmdcount", "count"],
  usage: "commandcount",
  description: "Shows the total number of commands and categories",
  category: "Info",
  cooldown: 3,
  run: async (client, message, args) => {
    const categories = {};
    for (const cmd of client.commands.values()) {
      const cat = cmd.category || "Misc";
      if (!categories[cat]) categories[cat] = 0;
      categories[cat]++;
    }

    const catIcons = { Music: "🎵", Queue: "📋", Filter: "🎚️", Settings: "⚙️", Info: "ℹ️" };

    const embed = new EmbedBuilder()
      .setColor(config.color)
      .setTitle("📊 Command Count")
      .setDescription(`**Total: ${client.commands.size} commands** across **${Object.keys(categories).length} categories**`)
      .addFields(
        Object.entries(categories).map(([cat, count]) => ({
          name: `${catIcons[cat] || "📁"} ${cat}`,
          value: `${count} command${count !== 1 ? "s" : ""}`,
          inline: true,
        }))
      )
      .setFooter({ text: config.footertext });

    message.reply({ embeds: [embed] });
  },
};
