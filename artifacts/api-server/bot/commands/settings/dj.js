const { EmbedBuilder } = require("discord.js");
const config = require("../../config/config.json");

module.exports = {
  name: "dj",
  aliases: ["djrole"],
  usage: "dj <add|remove|list> [@role]",
  description: "Manages DJ roles",
  category: "Settings",
  cooldown: 3,
  memberpermissions: ["MANAGE_GUILD"],
  run: async (client, message, args) => {
    const djroles = client.settings.get(message.guild.id, "djroles") || [];
    const action = args[0]?.toLowerCase();
    if (!action || action === "list") {
      return message.reply({ embeds: [new EmbedBuilder().setColor(config.color).setTitle("🎧 DJ Roles").setDescription(djroles.length ? djroles.map(r => `<@&${r}>`).join(", ") : "No DJ roles set")] });
    }
    const role = message.mentions.roles.first() || message.guild.roles.cache.get(args[1]);
    if (!role) return message.reply({ embeds: [new EmbedBuilder().setColor(config.wrongcolor).setTitle("🐾 Please mention a role!")] });
    if (action === "add") {
      if (djroles.includes(role.id)) return message.reply({ embeds: [new EmbedBuilder().setColor(config.wrongcolor).setTitle("🐾 That role is already a DJ role!")] });
      djroles.push(role.id);
      client.settings.set(message.guild.id, djroles, "djroles");
      message.reply({ embeds: [new EmbedBuilder().setColor(config.color).setTitle(`🎧 Added **${role.name}** as a DJ role!`)] });
    } else if (action === "remove") {
      const filtered = djroles.filter(r => r !== role.id);
      client.settings.set(message.guild.id, filtered, "djroles");
      message.reply({ embeds: [new EmbedBuilder().setColor(config.color).setTitle(`🎧 Removed **${role.name}** from DJ roles!`)] });
    }
  }
};
