const { EmbedBuilder } = require("discord.js");
const config = require("../../config/config.json");
const { createBar, msToTime } = require("../../handlers/functions");

module.exports = {
  name: "status",
  aliases: ["stats", "playerstatus", "musicstatus"],
  usage: "status",
  description: "Shows detailed player and queue status",
  category: "Queue",
  cooldown: 3,
  run: async (client, message, args) => {
    const player = client.kazagumo.players.get(message.guild.id);
    if (!player || !player.queue.current) {
      return message.reply({ embeds: [new EmbedBuilder().setColor(config.wrongcolor).setTitle("🐾 Nothing is playing!")] });
    }

    const current = player.queue.current;
    const pos = player.position || 0;
    const dur = current.length || 0;
    const bar = createBar(dur, pos, 20);
    const activeFilters = client.infos.get(message.guild.id, "activeFilters") || [];

    const loopIcons = { none: "❌ Off", track: "🔂 Track", queue: "🔁 Queue" };
    const totalDuration = player.queue.durationLength;

    const embed = new EmbedBuilder()
      .setColor(config.color)
      .setTitle("📊 Player Status")
      .setThumbnail(current.thumbnail || null)
      .addFields(
        { name: "🎵 Now Playing", value: `**[${(current.title || "Unknown").slice(0, 50)}](${current.uri || "#"})**\nby ${current.author || "Unknown"}`, inline: false },
        { name: "⏱️ Progress", value: `${bar}\n${msToTime(pos)} / ${dur === 0 ? "LIVE" : msToTime(dur)}`, inline: false },
        { name: "⏯️ State", value: player.paused ? "⏸ Paused" : "▶ Playing", inline: true },
        { name: "🔁 Loop", value: loopIcons[player.loop] || "❌ Off", inline: true },
        { name: "🔊 Volume", value: `${player.volume}%`, inline: true },
        { name: "📋 Queue", value: `${player.queue.length} track${player.queue.length !== 1 ? "s" : ""} (${msToTime(totalDuration)} remaining)`, inline: true },
        { name: "🎚️ Filters", value: activeFilters.length ? activeFilters.map(f => `\`${f}\``).join(", ") : "*None*", inline: true },
        { name: "📺 Channel", value: `<#${message.channel.id}>`, inline: true },
      )
      .setFooter({ text: config.footertext });

    message.reply({ embeds: [embed] });
  },
};
