const { EmbedBuilder } = require("discord.js");
const config = require("../../config/config.json");
const { applyFilters } = require("../../lib/filterPresets");
const { check_if_dj } = require("../../handlers/functions");

module.exports = {
  name: "clearfilters",
  aliases: ["clearfilter", "clearf", "cfilters", "nofilter"],
  usage: "clearfilters",
  description: "Clears all active audio filters",
  category: "Filter",
  cooldown: 3,
  run: async (client, message, args) => {
    const channel = message.member?.voice?.channel;
    if (!channel) return message.reply({ embeds: [new EmbedBuilder().setColor(config.wrongcolor).setTitle("🐾 Join a voice channel first!")] });
    const player = client.kazagumo.players.get(message.guild.id);
    if (!player || !player.queue.current) return message.reply({ embeds: [new EmbedBuilder().setColor(config.wrongcolor).setTitle("🐾 Nothing is playing!")] });
    if (channel.id !== player.voiceId) return message.reply({ embeds: [new EmbedBuilder().setColor(config.wrongcolor).setTitle("🐾 Join my voice channel first!")] });

    const djError = check_if_dj(client, message.member, player.queue.current?.info?.requester);
    if (djError) return message.reply({ embeds: [new EmbedBuilder().setColor(config.wrongcolor).setTitle(`🐾 You need a DJ role: ${djError}`)] });

    client.infos.set(message.guild.id, [], "activeFilters");
    await applyFilters(player, []).catch(() => {});

    message.reply({ embeds: [new EmbedBuilder().setColor(config.color).setTitle("🎚️ All filters cleared! Audio is back to normal~").setFooter({ text: config.footertext })] });
  },
};
