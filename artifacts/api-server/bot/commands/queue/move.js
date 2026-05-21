const { EmbedBuilder } = require("discord.js");
const config = require("../../config/config.json");
const { check_if_dj, arrayMove } = require("../../handlers/functions");

module.exports = {
  name: "move",
  aliases: ["mv"],
  usage: "move <from> <to>",
  description: "Moves a song from one position to another in the queue",
  category: "Queue",
  cooldown: 3,
  run: async (client, message, args) => {
    const channel = message.member?.voice?.channel;
    if (!channel) return message.reply({ embeds: [new EmbedBuilder().setColor(config.wrongcolor).setTitle("🐾 Join a voice channel first!")] });
    const player = client.kazagumo.players.get(message.guild.id);
    if (!player || !player.queue.current) return message.reply({ embeds: [new EmbedBuilder().setColor(config.wrongcolor).setTitle("🐾 Nothing is playing!")] });
    if (channel.id !== player.voiceId) return message.reply({ embeds: [new EmbedBuilder().setColor(config.wrongcolor).setTitle("🐾 Join my voice channel first!")] });

    const djError = check_if_dj(client, message.member, player.queue.current?.requester);
    if (djError) return message.reply({ embeds: [new EmbedBuilder().setColor(config.wrongcolor).setTitle(`🐾 You need a DJ role: ${djError}`)] });

    const from = parseInt(args[0]);
    const to = parseInt(args[1]);
    const len = player.queue.length;

    if (!args[1] || isNaN(from) || isNaN(to) || from < 1 || to < 1 || from > len || to > len) {
      return message.reply({ embeds: [new EmbedBuilder().setColor(config.wrongcolor).setTitle(`🐾 Usage: \`/move <from> <to>\` — Queue has **${len}** tracks.`)] });
    }
    if (from === to) return message.reply({ embeds: [new EmbedBuilder().setColor(config.wrongcolor).setTitle("🐾 That's the same position!")] });

    const track = player.queue[from - 1];
    const [removed] = player.queue.splice(from - 1, 1);
    player.queue.splice(to - 1, 0, removed);

    message.reply({ embeds: [new EmbedBuilder().setColor(config.color).setTitle("↕️ Track moved!").setDescription(`**${track.title}**\nMoved from position **${from}** to **${to}**`).setFooter({ text: config.footertext })] });
  },
};
