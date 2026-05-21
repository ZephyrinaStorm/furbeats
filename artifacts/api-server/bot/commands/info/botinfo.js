const { EmbedBuilder } = require("discord.js");
const config = require("../../config/config.json");
const os = require("os");

module.exports = {
  name: "botinfo",
  aliases: ["info", "binfo", "about"],
  usage: "botinfo",
  description: "Shows information and stats about the bot",
  category: "Info",
  cooldown: 5,
  run: async (client, message, args) => {
    const uptime = process.uptime();
    const h = Math.floor(uptime / 3600);
    const m = Math.floor((uptime % 3600) / 60);
    const s = Math.floor(uptime % 60);
    const uptimeStr = `${h}h ${m}m ${s}s`;

    const totalMemMB = (os.totalmem() / 1024 / 1024).toFixed(0);
    const usedMemMB = ((os.totalmem() - os.freemem()) / 1024 / 1024).toFixed(0);
    const heapMB = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(1);

    const totalUsers = client.guilds.cache.reduce((a, g) => a + g.memberCount, 0);
    const players = client.kazagumo.players.size;

    const embed = new EmbedBuilder()
      .setColor(config.color)
      .setTitle(`🐾 ${client.user.username} — Bot Info`)
      .setThumbnail(client.user.displayAvatarURL({ size: 256 }))
      .addFields(
        { name: "🤖 Bot", value: `**Tag:** ${client.user.tag}\n**ID:** ${client.user.id}`, inline: true },
        { name: "📊 Stats", value: `**Servers:** ${client.guilds.cache.size}\n**Users:** ${totalUsers.toLocaleString()}\n**Players:** ${players}`, inline: true },
        { name: "⏰ Uptime", value: uptimeStr, inline: true },
        { name: "💾 Memory", value: `**Heap:** ${heapMB} MB\n**System:** ${usedMemMB}/${totalMemMB} MB`, inline: true },
        { name: "🏓 Ping", value: `**API:** ${Math.round(client.ws.ping)}ms`, inline: true },
        { name: "📦 Versions", value: `**Node:** ${process.version}\n**discord.js:** v14`, inline: true },
        { name: "🎵 Platforms (11)", value: "YouTube • Spotify • Apple Music\nDeezer • SoundCloud • Yandex\nTidal • Jiosaavn • Twitch\nBandcamp • Vimeo & more", inline: true },
      )
      .setFooter({ text: config.footertext })
      .setTimestamp();

    message.reply({ embeds: [embed] });
  },
};
