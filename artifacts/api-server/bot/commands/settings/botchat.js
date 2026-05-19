const { EmbedBuilder } = require("discord.js");
const config = require("../../config/config.json");

module.exports = {
  name: "botchat",
  aliases: ["botch", "setchannel", "botchannel"],
  usage: "botchat <add|remove|list|clear> [#channel]",
  description: "Manages which channels the bot listens for commands in",
  category: "Settings",
  cooldown: 3,
  memberpermissions: ["ManageGuild"],
  run: async (client, message, args) => {
    if (!message.member.permissions.has("ManageGuild")) {
      return message.reply({ embeds: [new EmbedBuilder().setColor(config.wrongcolor).setTitle("🐾 You need **Manage Server** permission!")] });
    }

    client.settings.ensure(message.guild.id, { botchannel: [] });
    const botchannels = client.settings.get(message.guild.id, "botchannel") || [];
    const action = args[0]?.toLowerCase();

    if (!action || action === "list") {
      return message.reply({ embeds: [new EmbedBuilder().setColor(config.color).setTitle("📣 Bot Channels").setDescription(botchannels.length ? botchannels.map(c => `<#${c}>`).join(", ") : "*All channels (none set)*").setFooter({ text: config.footertext })] });
    }

    if (action === "clear") {
      client.settings.set(message.guild.id, [], "botchannel");
      return message.reply({ embeds: [new EmbedBuilder().setColor(config.color).setTitle("📣 Bot channels cleared! I'll respond in all channels now.").setFooter({ text: config.footertext })] });
    }

    const channel = message.mentions.channels.first() || message.guild.channels.cache.get(args[1]);
    if (!channel) return message.reply({ embeds: [new EmbedBuilder().setColor(config.wrongcolor).setTitle("🐾 Mention a channel! E.g. `f!botchat add #music`")] });

    if (action === "add") {
      if (botchannels.includes(channel.id)) return message.reply({ embeds: [new EmbedBuilder().setColor(config.wrongcolor).setTitle("🐾 That channel is already a bot channel!")] });
      botchannels.push(channel.id);
      client.settings.set(message.guild.id, botchannels, "botchannel");
      message.reply({ embeds: [new EmbedBuilder().setColor(config.color).setTitle(`📣 Added ${channel} as a bot channel!`).setFooter({ text: config.footertext })] });
    } else if (action === "remove") {
      const filtered = botchannels.filter(c => c !== channel.id);
      client.settings.set(message.guild.id, filtered, "botchannel");
      message.reply({ embeds: [new EmbedBuilder().setColor(config.color).setTitle(`📣 Removed ${channel} from bot channels!`).setFooter({ text: config.footertext })] });
    } else {
      message.reply({ embeds: [new EmbedBuilder().setColor(config.wrongcolor).setTitle("🐾 Usage: `f!botchat <add|remove|list|clear> [#channel]`")] });
    }
  },
};
