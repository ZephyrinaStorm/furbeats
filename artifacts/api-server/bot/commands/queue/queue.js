const { EmbedBuilder } = require("discord.js");
const config = require("../../config/config.json");
const { msToTime } = require("../../handlers/functions");

module.exports = {
  name: "queue",
  aliases: ["q", "list"],
  usage: "queue",
  description: "Shows the music queue",
  category: "Queue",
  cooldown: 2,
  run: async (client, message, args) => {
    const player = client.kazagumo.players.get(message.guild.id);
    if (!player || !player.queue.current) return message.reply({ embeds: [new EmbedBuilder().setColor(config.wrongcolor).setTitle("🐾 Nothing is playing!")] });
    const current = player.queue.current;
    const tracks = [...player.queue];
    const embed = new EmbedBuilder()
      .setColor(config.color)
      .setTitle("🐾 Music Queue")
      .setDescription(
        `**Now Playing:** [${current.title}](${current.uri}) — \`${msToTime(current.length)}\`\n\n` +
        (tracks.length === 0 ? "*No more tracks queued*" :
          tracks.slice(0, 15).map((t, i) =>
            `**${i + 1}.** [${t.title.slice(0, 50)}](${t.uri}) — \`${msToTime(t.length)}\``
          ).join("\n") +
          (tracks.length > 15 ? `\n*...and ${tracks.length - 15} more*` : "")
        )
      )
      .setFooter({ text: `${tracks.length + 1} tracks total | ${config.footertext}` });
    message.reply({ embeds: [embed] });
  }
};
