const { EmbedBuilder } = require("discord.js");
const config = require("../../config/config.json");

module.exports = {
  name: "restrict",
  aliases: ["cmdrestrict", "lockcmd"],
  usage: "restrict <command>",
  description: "Toggles DJ-only restriction on a specific command",
  category: "Settings",
  cooldown: 3,
  memberpermissions: ["ManageGuild"],
  run: async (client, message, args) => {
    if (!message.member.permissions.has("ManageGuild")) {
      return message.reply({ embeds: [new EmbedBuilder().setColor(config.wrongcolor).setTitle("🐾 You need **Manage Server** permission!")] });
    }

    if (!args[0]) {
      client.settings.ensure(message.guild.id, { restrictedCommands: [] });
      const restricted = client.settings.get(message.guild.id, "restrictedCommands") || [];
      return message.reply({
        embeds: [new EmbedBuilder()
          .setColor(config.color)
          .setTitle("🔒 Restricted Commands")
          .setDescription(restricted.length ? restricted.map(c => `\`/${c}\``).join(", ") : "*No restricted commands — all commands are available to everyone.*")
          .setFooter({ text: config.footertext })],
      });
    }

    const cmdName = args[0].toLowerCase().replace(/^\//, "");
    if (!client.commands.has(cmdName)) {
      return message.reply({ embeds: [new EmbedBuilder().setColor(config.wrongcolor).setTitle(`🐾 Unknown command: \`${cmdName}\`!`)] });
    }

    client.settings.ensure(message.guild.id, { restrictedCommands: [] });
    const restricted = client.settings.get(message.guild.id, "restrictedCommands") || [];
    const isRestricted = restricted.includes(cmdName);

    if (isRestricted) {
      const updated = restricted.filter(c => c !== cmdName);
      client.settings.set(message.guild.id, updated, "restrictedCommands");
      return message.reply({
        embeds: [new EmbedBuilder()
          .setColor(config.color)
          .setTitle(`🔓 \`/${cmdName}\` is now unrestricted!`)
          .setDescription("Everyone can use this command again.")
          .setFooter({ text: config.footertext })],
      });
    }

    restricted.push(cmdName);
    client.settings.set(message.guild.id, restricted, "restrictedCommands");
    return message.reply({
      embeds: [new EmbedBuilder()
        .setColor(config.color)
        .setTitle(`🔒 \`/${cmdName}\` is now DJ-only!`)
        .setDescription("Only users with a DJ role or **Manage Server** can use it.")
        .setFooter({ text: config.footertext })],
    });
  },
};
