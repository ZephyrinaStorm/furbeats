const { EmbedBuilder } = require("discord.js");
const config = require("../../config/config.json");

module.exports = {
  name: "defaultvolume",
  aliases: ["dvolume", "defvolume", "setvol"],
  usage: "defaultvolume <1-150>",
  description: "Sets the default volume for this server",
  category: "Settings",
  cooldown: 3,
  memberpermissions: ["ManageGuild"],
  run: async (client, message, args) => {
    if (!message.member.permissions.has("ManageGuild")) {
      return message.reply({ embeds: [new EmbedBuilder().setColor(config.wrongcolor).setTitle("🐾 You need **Manage Server** permission!")] });
    }

    const current = client.settings.get(message.guild.id, "defaultvolume") || 80;
    if (!args[0]) {
      return message.reply({ embeds: [new EmbedBuilder().setColor(config.color).setTitle(`🔊 Current default volume: **${current}%**`).setFooter({ text: config.footertext })] });
    }

    const vol = parseInt(args[0]);
    if (isNaN(vol) || vol < 1 || vol > 150) return message.reply({ embeds: [new EmbedBuilder().setColor(config.wrongcolor).setTitle("🐾 Volume must be between 1 and 150!")] });

    client.settings.ensure(message.guild.id, { defaultvolume: 80 });
    client.settings.set(message.guild.id, vol, "defaultvolume");

    const player = client.kazagumo.players.get(message.guild.id);
    if (player) await player.setVolume(vol).catch(() => {});

    message.reply({ embeds: [new EmbedBuilder().setColor(config.color).setTitle(`🔊 Default volume set to **${vol}%**`).setDescription("New players will start at this volume.").setFooter({ text: config.footertext })] });
  },
};
