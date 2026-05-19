const { EmbedBuilder } = require("discord.js");
const config = require("../../config/config.json");

const pendingVotes = new Map();

module.exports = {
  name: "voteskip",
  aliases: ["vs", "vskip"],
  usage: "voteskip",
  description: "Vote to skip the current song — majority of listeners needed",
  category: "Music",
  cooldown: 3,
  run: async (client, message, args) => {
    const channel = message.member?.voice?.channel;
    if (!channel) return message.reply({ embeds: [new EmbedBuilder().setColor(config.wrongcolor).setTitle("🐾 Join a voice channel first!")] });
    const player = client.kazagumo.players.get(message.guild.id);
    if (!player || !player.queue.current) return message.reply({ embeds: [new EmbedBuilder().setColor(config.wrongcolor).setTitle("🐾 Nothing is playing!")] });
    if (channel.id !== player.voiceId) return message.reply({ embeds: [new EmbedBuilder().setColor(config.wrongcolor).setTitle("🐾 Join my voice channel first!")] });

    const listeners = channel.members.filter(m => !m.user.bot).size;
    const required = Math.max(1, Math.ceil(listeners / 2));

    if (!pendingVotes.has(message.guild.id)) pendingVotes.set(message.guild.id, new Set());
    const guildVotes = pendingVotes.get(message.guild.id);

    if (guildVotes.has(message.author.id)) {
      return message.reply({
        embeds: [new EmbedBuilder()
          .setColor(config.wrongcolor)
          .setTitle(`🐾 You already voted! (${guildVotes.size}/${required})`)],
      });
    }

    guildVotes.add(message.author.id);

    if (guildVotes.size >= required) {
      pendingVotes.delete(message.guild.id);
      await player.skip();
      return message.reply({
        embeds: [new EmbedBuilder()
          .setColor(config.color)
          .setTitle(`⏭ Vote passed! (${guildVotes.size}/${required}) — Skipped!`)
          .setFooter({ text: config.footertext })],
      });
    }

    message.reply({
      embeds: [new EmbedBuilder()
        .setColor(config.color)
        .setTitle(`🗳️ Skip vote: **${guildVotes.size}/${required}**`)
        .setDescription(`Need **${required - guildVotes.size}** more vote${required - guildVotes.size !== 1 ? "s" : ""} to skip!`)
        .setFooter({ text: config.footertext })],
    });

    setTimeout(() => {
      if (pendingVotes.get(message.guild.id) === guildVotes) pendingVotes.delete(message.guild.id);
    }, 60000);
  },
};
