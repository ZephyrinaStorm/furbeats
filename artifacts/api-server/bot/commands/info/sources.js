const { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, ComponentType } = require("discord.js");
const config = require("../../config/config.json");

const PAGES = [
  {
    title: "🎵 Supported Platforms — Page 1 / 3",
    fields: [
      {
        name: "▶️ YouTube",
        value: "Full support — search by name or paste any video/playlist link, including YouTube Shorts.\n`/play never gonna give you up`\n`/play https://youtu.be/...`",
      },
      {
        name: "🎵 YouTube Music",
        value: "Paste a YouTube Music track or playlist link for higher-quality audio.\n`/play https://music.youtube.com/watch?v=...`",
      },
      {
        name: "🟢 Spotify",
        value: "Paste any Spotify track, album, artist, or playlist link.\n`/play https://open.spotify.com/track/...`\n`/play https://open.spotify.com/playlist/...`",
      },
      {
        name: "🍎 Apple Music",
        value: "Paste any Apple Music track, album, or playlist link.\n`/play https://music.apple.com/album/...`",
      },
    ],
  },
  {
    title: "🎵 Supported Platforms — Page 2 / 3",
    fields: [
      {
        name: "🟣 Deezer",
        value: "Paste any Deezer track, album, or playlist link.\n`/play https://www.deezer.com/track/...`\n`/play https://www.deezer.com/playlist/...`",
      },
      {
        name: "🟡 Yandex Music",
        value: "Paste any Yandex Music track, album, or playlist link.\n`/play https://music.yandex.com/track/...`",
      },
      {
        name: "🔶 SoundCloud",
        value: "Search by name (defaults to SoundCloud) or paste a direct link.\n`/play lofi chill soundcloud`\n`/play https://soundcloud.com/artist/track`",
      },
      {
        name: "🌊 Tidal",
        value: "Paste any Tidal track or album link.\n`/play https://tidal.com/track/...`",
      },
    ],
  },
  {
    title: "🎵 Supported Platforms — Page 3 / 3",
    fields: [
      {
        name: "🎶 Jiosaavn",
        value: "Paste a JioSaavn link or search — huge Indian & Bollywood music catalog.\n`/play https://www.jiosaavn.com/song/...`\n`/play bollywood hits jiosaavn`",
      },
      {
        name: "💜 Twitch",
        value: "Paste a Twitch channel URL to stream the live audio from any channel.\n`/play https://twitch.tv/channelname`",
      },
      {
        name: "🎸 Bandcamp",
        value: "Paste any Bandcamp track or album URL to support indie artists.\n`/play https://artist.bandcamp.com/track/...`",
      },
      {
        name: "🎬 Vimeo",
        value: "Paste a Vimeo video URL to play its audio.\n`/play https://vimeo.com/...`",
      },
      {
        name: "📡 HTTP Streams",
        value: "Stream directly from any public audio URL, radio endpoint, or `.mp3`/`.aac` file.\n`/play https://stream.radioparadise.com/aac-128`",
      },
    ],
  },
];

const buildEmbed = (pageIdx) => {
  const page = PAGES[pageIdx];
  const embed = new EmbedBuilder()
    .setColor(config.color)
    .setTitle(page.title)
    .setDescription(
      pageIdx === 0
        ? "HowlBeats supports **11 music platforms**! Paste a link or search by name with `/play`.\nUse ◀ ▶ to browse all platforms."
        : "Use ◀ ▶ to browse all platforms."
    )
    .setFooter({ text: `${config.footertext} • Tip: text searches always default to YouTube` });

  for (const f of page.fields) {
    embed.addFields({ name: f.name, value: f.value, inline: false });
  }
  return embed;
};

const buildNav = (pageIdx, disabled = false) =>
  new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("src_prev")
      .setEmoji("◀️")
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(disabled || pageIdx === 0),
    new ButtonBuilder()
      .setCustomId("src_next")
      .setEmoji("▶️")
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(disabled || pageIdx === PAGES.length - 1),
  );

module.exports = {
  name: "sources",
  aliases: ["platforms", "supportedplatforms", "source"],
  usage: "sources",
  description: "Shows all 11 supported music & streaming platforms",
  category: "Info",
  cooldown: 5,
  run: async (client, message, args) => {
    const interaction = message._interaction;
    const userId = interaction ? interaction.user.id : message.author.id;

    let currentPage = 0;

    const sentMsg = await message.reply({
      embeds: [buildEmbed(0)],
      components: [buildNav(0)],
    });

    if (!sentMsg?.createMessageComponentCollector) return;

    const collector = sentMsg.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: 90_000,
    });

    collector.on("collect", async (i) => {
      if (i.user.id !== userId) {
        return i.reply({ content: "🐾 This menu isn't for you!", ephemeral: true });
      }
      if (i.customId === "src_prev") currentPage = Math.max(0, currentPage - 1);
      if (i.customId === "src_next") currentPage = Math.min(PAGES.length - 1, currentPage + 1);
      await i.update({ embeds: [buildEmbed(currentPage)], components: [buildNav(currentPage)] });
    });

    collector.on("end", async () => {
      try {
        await sentMsg.edit({ components: [buildNav(currentPage, true)] });
      } catch {}
    });
  },
};
