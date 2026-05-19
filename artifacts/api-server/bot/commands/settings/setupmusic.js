const { EmbedBuilder, PermissionFlagsBits, ChannelType, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const config = require("../../config/config.json");

module.exports = {
  name: "setupmusic",
  aliases: ["setup", "musicsetup", "setmusic"],
  usage: "setupmusic [#channel]",
  description: "Sets up a dedicated music channel where you can type song names to play them",
  category: "Settings",
  cooldown: 10,
  memberpermissions: ["ManageGuild"],
  run: async (client, message, args) => {
    if (!message.member.permissions.has("ManageGuild")) {
      return message.reply({ embeds: [new EmbedBuilder().setColor(config.wrongcolor).setTitle("🐾 You need **Manage Server** permission!")] });
    }

    let channel = message.mentions?.channels?.first() || message.guild.channels.cache.get(args[0]);

    if (!channel) {
      try {
        channel = await message.guild.channels.create({
          name: "🐾furvibez-music",
          type: ChannelType.GuildText,
          topic: "🐾 HowlBeats Music Channel — Type a song name or URL to play it!",
          permissionOverwrites: [
            { id: message.guild.id, allow: [PermissionFlagsBits.SendMessages, PermissionFlagsBits.ViewChannel] },
            { id: client.user.id, allow: [PermissionFlagsBits.SendMessages, PermissionFlagsBits.ViewChannel, PermissionFlagsBits.ManageMessages] },
          ],
        });
      } catch (e) {
        return message.reply({ embeds: [new EmbedBuilder().setColor(config.wrongcolor).setTitle("🐾 Couldn't create a channel! Give me **Manage Channels** permission or mention an existing channel.")] });
      }
    }

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId("pauseresume").setEmoji("⏸").setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId("skip").setEmoji("⏭").setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId("stop").setEmoji("⏹").setStyle(ButtonStyle.Danger),
      new ButtonBuilder().setCustomId("shuffle").setEmoji("🔀").setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId("queue_view").setLabel("Queue").setEmoji("📋").setStyle(ButtonStyle.Secondary),
    );

    const setupEmbed = new EmbedBuilder()
      .setColor(config.color)
      .setTitle("🐾 HowlBeats Music Player")
      .setDescription(
        "**Type a song name or URL in this channel to play music!**\n\n" +
        "🎵 Just type anything to search and play\n" +
        "🔗 Paste a YouTube/Spotify link to play directly\n" +
        "📋 Use buttons below to control playback\n\n" +
        "*Waiting for music...*"
      )
      .setImage("https://via.placeholder.com/800x200/241a14/FF8C00?text=🐾+HowlBeats+Music+Player")
      .setFooter({ text: config.footertext });

    try {
      await channel.bulkDelete(10).catch(() => {});
    } catch {}

    const setupMsg = await channel.send({ embeds: [setupEmbed], components: [row] });

    client.settings.ensure(message.guild.id, { musicChannel: null, musicMessage: null });
    client.settings.set(message.guild.id, channel.id, "musicChannel");
    client.settings.set(message.guild.id, setupMsg.id, "musicMessage");

    message.reply({ embeds: [new EmbedBuilder().setColor(config.color).setTitle(`✅ Music channel set up in ${channel}!`).setDescription("Type song names there to play music. The player will update as songs change.").setFooter({ text: config.footertext })] });
  },
};
