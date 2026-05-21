const { EmbedBuilder } = require("discord.js");
const config = require("../../config/config.json");

const GENRE_PRESETS = {
  lofi: "lofi hip hop radio",
  chillhop: "chillhop radio",
  jazz: "jazz piano radio",
  classical: "classical music radio",
  edm: "edm electronic dance music mix",
  hiphop: "hip hop rap mix",
  pop: "pop hits radio",
  rock: "rock music radio",
  metal: "heavy metal mix",
  anime: "anime music mix",
  kpop: "kpop mix",
  vgm: "video game music mix",
  ambient: "ambient relaxing music",
  country: "country music radio",
};

module.exports = {
  name: "radio",
  aliases: ["stream", "genreplay"],
  usage: "radio <genre>",
  description: "Plays a genre radio stream (lofi, jazz, edm, kpop, anime, rock, etc.)",
  category: "Music",
  cooldown: 5,
  run: async (client, message, args) => {
    const channel = message.member?.voice?.channel;
    if (!channel) return message.reply({ embeds: [new EmbedBuilder().setColor(config.wrongcolor).setTitle("🐾 Join a voice channel first!")] });
    if (!args[0]) {
      return message.reply({
        embeds: [new EmbedBuilder()
          .setColor(config.color)
          .setTitle("📻 Radio Genres")
          .setDescription(Object.keys(GENRE_PRESETS).map(g => `\`${g}\``).join(", ") + "\n\nOr type any genre name!")
          .setFooter({ text: config.footertext })],
      });
    }

    const genre = args.join(" ").toLowerCase();
    const query = GENRE_PRESETS[genre] || `${genre} music radio`;
    const searching = await message.reply({ content: `📻 Tuning in to **${genre}** radio...` });

    try {
      const newPlayer = client.kazagumo.players.get(message.guild.id) || await client.kazagumo.createPlayer({
        guildId: message.guild.id,
        voiceId: channel.id,
        textId: message.channel.id,
        deaf: true,
        volume: client.settings.get(message.guild.id, "defaultvolume") || 80,
      });

      const result = await client.kazagumo.search(query, { requester: { id: message.author.id, tag: message.author.tag } });
      if (!result || !result.tracks.length) return searching.edit({ content: `🐾 No results for \`${genre}\`!` });

      const track = result.tracks[0];
      newPlayer.queue.add(track);
      if (!newPlayer.playing && !newPlayer.paused) await newPlayer.play();

      await searching.edit({
        content: null,
        embeds: [new EmbedBuilder()
          .setColor(config.color)
          .setTitle("📻 Radio Started!")
          .setDescription(`**[${track.title}](${track.uri})**\nby ${track.author || "Unknown"}`)
          .addFields({ name: "📻 Genre", value: genre, inline: true })
          .setThumbnail(track.thumbnail || null)
          .setFooter({ text: config.footertext })],
      });
    } catch (e) {
      console.error("[HowlBeats] radio error:", e.message);
      searching.edit({ content: `🐾 Error: ${e.message}` }).catch(() => {});
    }
  },
};
