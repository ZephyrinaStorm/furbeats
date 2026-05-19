const { EmbedBuilder } = require("discord.js");
const config = require("../../config/config.json");

module.exports = {
  name: "loop",
  aliases: ["repeat"],
  usage: "loop <none|track|queue>",
  description: "Sets loop mode",
  category: "Queue",
  cooldown: 1,
  run: async (client, message, args) => {
    const player = client.kazagumo.players.get(message.guild.id);
    if (!player) return message.reply({ embeds: [new EmbedBuilder().setColor(config.wrongcolor).setTitle("🐾 Nothing is playing!")] });
    const modes = { none: "none", off: "none", track: "track", song: "track", queue: "queue", all: "queue" };
    const input = args[0]?.toLowerCase();
    if (input && !modes[input]) return message.reply({ embeds: [new EmbedBuilder().setColor(config.wrongcolor).setTitle("🐾 Use: `none`, `track`, or `queue`")] });
    const current = player.loop;
    let next;
    if (!input) {
      const cycle = ["none", "track", "queue"];
      next = cycle[(cycle.indexOf(current) + 1) % cycle.length];
    } else {
      next = modes[input];
    }
    player.setLoop(next);
    const icons = { none: "❌", track: "🔂", queue: "🔁" };
    message.reply({ embeds: [new EmbedBuilder().setColor(config.color).setTitle(`${icons[next]} Loop set to **${next}**`)] });
  }
};
