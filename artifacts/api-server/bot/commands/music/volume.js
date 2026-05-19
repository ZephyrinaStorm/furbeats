const { EmbedBuilder } = require("discord.js");
const config = require("../../config/config.json");

module.exports = {
  name: "volume",
  aliases: ["vol", "v"],
  usage: "volume <1-150>",
  description: "Sets the volume",
  category: "Music",
  cooldown: 1,
  run: async (client, message, args) => {
    const player = client.kazagumo.players.get(message.guild.id);
    if (!player) return message.reply({ embeds: [new EmbedBuilder().setColor(config.wrongcolor).setTitle("🐾 Nothing is playing!")] });
    if (!args[0]) return message.reply({ embeds: [new EmbedBuilder().setColor(config.color).setTitle(`🔊 Current volume: **${player.volume}%**`)] });
    const vol = parseInt(args[0]);
    if (isNaN(vol) || vol < 1 || vol > 150) return message.reply({ embeds: [new EmbedBuilder().setColor(config.wrongcolor).setTitle("🐾 Volume must be between 1 and 150!")] });
    await player.setVolume(vol);
    client.settings.set(message.guild.id, vol, "defaultvolume");
    message.reply({ embeds: [new EmbedBuilder().setColor(config.color).setTitle(`🔊 Volume set to **${vol}%**`)] });
  }
};
