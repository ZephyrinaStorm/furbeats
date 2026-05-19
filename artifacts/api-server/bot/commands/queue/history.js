const { EmbedBuilder } = require("discord.js");
const config = require("../../config/config.json");
const { msToTime } = require("../../handlers/functions");

module.exports = {
  name: "history",
  aliases: ["played", "recent"],
  usage: "history",
  description: "Shows the last 15 tracks that were played in this server",
  category: "Queue",
  cooldown: 3,
  run: async (client, message, args) => {
    const hist = client.infos.get(message.guild.id, "history") || [];
    if (!hist.length) {
      return message.reply({ embeds: [new EmbedBuilder().setColor(config.wrongcolor).setTitle("🐾 No play history yet!")] });
    }

    const embed = new EmbedBuilder()
      .setColor(config.color)
      .setTitle("📜 Play History")
      .setDescription(
        hist.slice(0, 15).map((t, i) =>
          `**${i + 1}.** [${(t.title || "Unknown").slice(0, 50)}](${t.uri || "#"}) — \`${msToTime(t.length || 0)}\``
        ).join("\n")
      )
      .setFooter({ text: `${Math.min(hist.length, 15)} of ${hist.length} recent tracks • ${config.footertext}` });

    message.reply({ embeds: [embed] });
  },
};
