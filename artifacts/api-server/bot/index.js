const { Client, GatewayIntentBits, Collection } = require("discord.js");
const { Kazagumo } = require("kazagumo");
const { Connectors } = require("shoukaku");
const JsonStore = require("./lib/JsonStore");
const path = require("path");

const config = require("./config/config.json");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.MessageContent,
  ],
  allowedMentions: { parse: [], repliedUser: false },
  failIfNotExists: false,
});

// Lavalink connection — prefers external node (LAVALINK_HOST env var) over localhost
const _llHost = process.env.LAVALINK_HOST || "localhost";
const _llPort = process.env.LAVALINK_PORT || "8000";
const _llPass = process.env.LAVALINK_PASSWORD || "furbeats_lavalink_local";
const _llSecure = Number(_llPort) === 443 || Number(_llPort) === 8443 || process.env.LAVALINK_SECURE === "true";

const lavalinkNodes = [{
  name: "HowlBeats-Node",
  url: `${_llHost}:${_llPort}`,
  auth: _llPass,
  secure: _llSecure,
}];

console.log(`[HowlBeats] Lavalink → ${_llSecure ? "wss" : "ws"}://${_llHost}:${_llPort}`);

client.kazagumo = new Kazagumo(
  {
    defaultSearchEngine: "youtube",
    send: (guildId, payload) => {
      const guild = client.guilds.cache.get(guildId);
      if (guild) guild.shard.send(payload);
    },
  },
  new Connectors.DiscordJS(client),
  lavalinkNodes,
  {
    moveOnDisconnect: false,
    resumable: true,
    resumableTimeout: 60,
    reconnectTries: 30,
    reconnectInterval: 3,
    restTimeout: 60,
    userAgent: "HowlBeats (furvibeztunes.xyz)",
  },
);

client.shoukaku = client.kazagumo.shoukaku;

client.commands = new Collection();
client.aliases = new Collection();
client.cooldowns = new Collection();

client.settings = new JsonStore({ name: "settings", dataDir: path.join(__dirname, "./databases") });
client.infos = new JsonStore({ name: "infos", dataDir: path.join(__dirname, "./databases") });

require("./handlers/commands")(client);
require("./handlers/events")(client);
require("./handlers/lavalinkEvents")(client);

process.on("unhandledRejection", (reason, promise) => {
  console.error("[HowlBeats] Unhandled rejection (not crashing):", reason?.message || reason);
});

process.on("uncaughtException", (err) => {
  console.error("[HowlBeats] Uncaught exception (not crashing):", err?.message || err);
});

function start(port) {
  client.once("clientReady", () => {
    console.log(`[HowlBeats] Bot ready: ${client.user.tag}`);
    require("./dashboard/index.js")(client, port);
  });

  client.login(process.env.DISCORD_TOKEN).catch(e => {
    console.error("[HowlBeats] Failed to login:", e.message);
    process.exit(1);
  });
}

// Web-only mode: starts just the Express dashboard without connecting to Discord.
// Used in development so the webview can show the dashboard while the real bot
// runs separately on its own port via the artifact workflow.
function startWebOnly(port) {
  const path = require("path");
  const mockClient = {
    user: null,
    ws: { ping: -1 },
    guilds: {
      cache: {
        size: 0,
        get: () => undefined,
        reduce: (_fn, init) => init,
      },
    },
    kazagumo: null,
    commands: new (require("discord.js").Collection)(),
    aliases: new (require("discord.js").Collection)(),
    settings: new (require("./lib/JsonStore"))({
      name: "settings",
      dataDir: path.join(__dirname, "./databases"),
    }),
    infos: new (require("./lib/JsonStore"))({
      name: "infos",
      dataDir: path.join(__dirname, "./databases"),
    }),
  };

  // Load command metadata so the /commands page still renders properly
  try {
    require("./handlers/commands")(mockClient);
  } catch (_) {}

  console.log(`[HowlBeats] Starting in web-only mode on port ${port}`);
  require("./dashboard/index.js")(mockClient, port);
}

module.exports = { client, start, startWebOnly };
