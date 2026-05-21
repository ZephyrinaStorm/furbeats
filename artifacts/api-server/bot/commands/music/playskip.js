const { EmbedBuilder } = require("discord.js");
const config = require("../../config/config.json");
const { check_if_dj } = require("../../handlers/functions");
const { normalizeQuery, getLoadingMessage } = require("../../lib/platformResolver");

module.exports = {
  name: "playskip",
  aliases: ["ps", "skipadd"],
  usage: "playskip <search/link>",
  description: "Plays a song immediately, skipping the current one — supports all 11 platforms",
  category: "Music",
  cooldown: 3,
  run: async (client, message, args) => {
    const channel = message.member?.voice?.channel;
    if (!channel) return message.reply({ embeds: [new EmbedBuilder().setColor(config.wrongcolor).setTitle("🐾 Join a voice channel first!")] });
    if (!args[0]) return message.reply({ embeds: [new EmbedBuilder().setColor(config.wrongcolor).setTitle("🐾 Provide a search query or link!")] });

    const player = client.kazagumo.players.get(message.guild.id);
    if (player && channel.id !== player.voiceId) return message.reply({ embeds: [new EmbedBuilder().setColor(config.wrongcolor).setTitle("🐾 Join my voice channel first!")] });

    if (player) {
      const djError = check_if_dj(client, message.member, player.queue.current?.requester);
      if (djError) return message.reply({ embeds: [new EmbedBuilder().setColor(config.wrongcolor).setTitle(`🐾 You need a DJ role: ${djError}`)] });
    }

    const raw = args.join(" ");
    const query = normalizeQuery(raw);
    const searching = await message.reply({ content: getLoadingMessage(query) });

    try {
      const newPlayer = player || await client.kazagumo.createPlayer({
        guildId: message.guild.id,
        voiceId: channel.id,
        textId: message.channel.id,
        deaf: true,
        volume: client.settings.get(message.guild.id, "defaultvolume") || 80,
      });

      const result = await client.kazagumo.search(query, { requester: { id: message.author.id, tag: message.author.tag } });
      if (!result || !result.tracks.length) return searching.edit({ content: "🐾 No results found!" });

      const track = result.tracks[0];
      newPlayer.queue.unshift(track);

      if (newPlayer.playing || newPlayer.paused) {
        await newPlayer.skip();
        await searching.edit({ content: `⏭ Skipped! Now playing: **${track.title}**` });
      } else {
        await newPlayer.play();
        await searching.edit({ content: `🎶 Now playing: **${track.title}**` });
      }
    } catch (e) {
      console.error("[HowlBeats] playskip error:", e);
      searching.edit({ content: `🐾 Error: ${e.message}` }).catch(() => {});
    }
  },
};
