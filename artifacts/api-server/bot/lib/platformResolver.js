const PLATFORMS = [
  {
    name: "Spotify",
    emoji: "🟢",
    regex: /spotify\.com|^spotify:/i,
    searchPrefix: "spsearch:",
    urlBase: "open.spotify.com",
    native: false,
  },
  {
    name: "Apple Music",
    emoji: "🍎",
    regex: /music\.apple\.com/i,
    searchPrefix: "amsearch:",
    urlBase: "music.apple.com",
    native: false,
  },
  {
    name: "Deezer",
    emoji: "🟣",
    regex: /deezer\.com|deezer\.page\.link/i,
    searchPrefix: "dzsearch:",
    urlBase: "deezer.com",
    native: false,
  },
  {
    name: "Yandex Music",
    emoji: "🟡",
    regex: /music\.yandex\.(com|ru)/i,
    searchPrefix: "ymsearch:",
    urlBase: "music.yandex.com",
    native: false,
  },
  {
    name: "Jiosaavn",
    emoji: "🎶",
    regex: /jiosaavn\.com|saavn\.com/i,
    searchPrefix: "jssearch:",
    urlBase: "jiosaavn.com",
    native: false,
  },
  {
    name: "Tidal",
    emoji: "🌊",
    regex: /tidal\.com/i,
    searchPrefix: "tdsearch:",
    urlBase: "tidal.com",
    native: false,
  },
  {
    name: "YouTube Music",
    emoji: "🎵",
    regex: /music\.youtube\.com/i,
    searchPrefix: "ytmsearch:",
    urlBase: "music.youtube.com",
    native: true,
  },
  {
    name: "YouTube",
    emoji: "▶️",
    regex: /youtube\.com|youtu\.be/i,
    searchPrefix: "ytsearch:",
    urlBase: "youtube.com",
    native: true,
  },
  {
    name: "SoundCloud",
    emoji: "🔶",
    regex: /soundcloud\.com|on\.soundcloud\.com/i,
    searchPrefix: "scsearch:",
    urlBase: "soundcloud.com",
    native: true,
  },
  {
    name: "Twitch",
    emoji: "💜",
    regex: /twitch\.tv/i,
    searchPrefix: null,
    urlBase: "twitch.tv",
    native: true,
  },
  {
    name: "Bandcamp",
    emoji: "🎸",
    regex: /bandcamp\.com/i,
    searchPrefix: null,
    urlBase: "bandcamp.com",
    native: true,
  },
  {
    name: "Vimeo",
    emoji: "🎬",
    regex: /vimeo\.com/i,
    searchPrefix: null,
    urlBase: "vimeo.com",
    native: true,
  },
  {
    name: "HTTP Stream",
    emoji: "📡",
    regex: /^https?:\/\//i,
    searchPrefix: null,
    urlBase: null,
    native: true,
  },
];

function detectPlatform(input) {
  for (const p of PLATFORMS) {
    if (p.regex.test(input)) return p;
  }
  return null;
}

function isUrl(str) {
  return /^https?:\/\//i.test(str) || /^spotify:/i.test(str);
}

function normalizeQuery(input) {
  const spotifyUri = input.match(/^spotify:(track|album|playlist|artist):([A-Za-z0-9]+)$/i);
  if (spotifyUri) {
    return `https://open.spotify.com/${spotifyUri[1]}/${spotifyUri[2]}`;
  }
  return input;
}

function getLoadingMessage(query) {
  if (isUrl(query)) {
    const platform = detectPlatform(query);
    if (platform && platform.name !== "HTTP Stream") {
      return `${platform.emoji} Loading from **${platform.name}**...`;
    }
    return `📡 Loading audio stream...`;
  }
  return `🔍 Searching for \`${query.slice(0, 50)}\`...`;
}

module.exports = { detectPlatform, isUrl, normalizeQuery, getLoadingMessage, PLATFORMS };
