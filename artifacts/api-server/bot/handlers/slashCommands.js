const { REST, Routes, SlashCommandBuilder } = require("discord.js");

const SLASH_DATA = {
  play: b => b.addStringOption(o => o.setName("query").setDescription("Song name or URL to play").setRequired(true)),
  playskip: b => b.addStringOption(o => o.setName("query").setDescription("Song to play immediately (skips current)").setRequired(true)),
  playtop: b => b.addStringOption(o => o.setName("query").setDescription("Song to add to the top of the queue").setRequired(true)),
  skip: b => b.addIntegerOption(o => o.setName("amount").setDescription("Number of songs to skip (default 1)").setMinValue(1).setRequired(false)),
  seek: b => b.addIntegerOption(o => o.setName("seconds").setDescription("Position in seconds to seek to").setRequired(true)),
  volume: b => b.addIntegerOption(o => o.setName("amount").setDescription("Volume level 1-150").setMinValue(1).setMaxValue(150).setRequired(false)),
  loop: b => b.addStringOption(o => o.setName("mode").setDescription("Loop mode").setRequired(false).addChoices(
    { name: "Off", value: "none" },
    { name: "Track", value: "track" },
    { name: "Queue", value: "queue" },
  )),
  remove: b => b.addIntegerOption(o => o.setName("position").setDescription("Queue position to remove").setMinValue(1).setRequired(true)),
  jump: b => b.addIntegerOption(o => o.setName("position").setDescription("Queue position to jump to").setMinValue(1).setRequired(true)),
  move: b => b
    .addIntegerOption(o => o.setName("from").setDescription("Current position").setMinValue(1).setRequired(true))
    .addIntegerOption(o => o.setName("to").setDescription("Target position").setMinValue(1).setRequired(true)),
  addfilter: b => b.addStringOption(o => o.setName("name").setDescription("Filter name to add").setRequired(true).addChoices(
    { name: "bassboost", value: "bassboost" }, { name: "heavybass", value: "heavybass" },
    { name: "nightcore", value: "nightcore" }, { name: "vaporwave", value: "vaporwave" },
    { name: "8d", value: "8d" }, { name: "treble", value: "treble" },
    { name: "karaoke", value: "karaoke" }, { name: "vibrato", value: "vibrato" },
    { name: "tremolo", value: "tremolo" }, { name: "soft", value: "soft" },
  )),
  setfilter: b => b.addStringOption(o => o.setName("name").setDescription("Filter to set (replaces all current filters)").setRequired(true).addChoices(
    { name: "clear (remove all)", value: "clear" }, { name: "bassboost", value: "bassboost" },
    { name: "heavybass", value: "heavybass" }, { name: "nightcore", value: "nightcore" },
    { name: "vaporwave", value: "vaporwave" }, { name: "8d", value: "8d" },
    { name: "treble", value: "treble" }, { name: "karaoke", value: "karaoke" },
    { name: "vibrato", value: "vibrato" }, { name: "tremolo", value: "tremolo" }, { name: "soft", value: "soft" },
  )),
  removefilter: b => b.addStringOption(o => o.setName("name").setDescription("Filter name to remove").setRequired(true).addChoices(
    { name: "bassboost", value: "bassboost" }, { name: "heavybass", value: "heavybass" },
    { name: "nightcore", value: "nightcore" }, { name: "vaporwave", value: "vaporwave" },
    { name: "8d", value: "8d" }, { name: "treble", value: "treble" },
    { name: "karaoke", value: "karaoke" }, { name: "vibrato", value: "vibrato" },
    { name: "tremolo", value: "tremolo" }, { name: "soft", value: "soft" },
  )),
  custombassboost: b => b.addIntegerOption(o => o.setName("level").setDescription("Bass boost level 0-100 (0 = off)").setMinValue(0).setMaxValue(100).setRequired(true)),
  speed: b => b.addNumberOption(o => o.setName("speed").setDescription("Playback speed 0.25-3.0 (1.0 = normal)").setMinValue(0.25).setMaxValue(3.0).setRequired(true)),
  help: b => b.addStringOption(o => o.setName("command").setDescription("Command to get help for").setRequired(false)),
  dj: b => b
    .addStringOption(o => o.setName("action").setDescription("Action to perform").setRequired(true)
      .addChoices({ name: "add", value: "add" }, { name: "remove", value: "remove" }, { name: "list", value: "list" }, { name: "clear", value: "clear" }))
    .addRoleOption(o => o.setName("role").setDescription("DJ role to add or remove").setRequired(false)),
  defaultvolume: b => b.addIntegerOption(o => o.setName("volume").setDescription("Default volume 1-150").setMinValue(1).setMaxValue(150).setRequired(false)),
  defaultfilter: b => b.addStringOption(o => o.setName("filter").setDescription("Default filter name (or 'none' to clear)").setRequired(false).addChoices(
    { name: "none", value: "none" }, { name: "bassboost", value: "bassboost" },
    { name: "nightcore", value: "nightcore" }, { name: "vaporwave", value: "vaporwave" },
    { name: "8d", value: "8d" }, { name: "karaoke", value: "karaoke" },
  )),
  botchat: b => b
    .addStringOption(o => o.setName("action").setDescription("Action to perform").setRequired(true)
      .addChoices({ name: "add", value: "add" }, { name: "remove", value: "remove" }, { name: "list", value: "list" }, { name: "clear", value: "clear" }))
    .addChannelOption(o => o.setName("channel").setDescription("Channel to add or remove").setRequired(false)),
  setupmusic: b => b.addChannelOption(o => o.setName("channel").setDescription("Existing channel to use (leave empty to create one)").setRequired(false)),

  replay: b => b,
  forward: b => b.addIntegerOption(o => o.setName("seconds").setDescription("Seconds to skip forward (default: 30)").setMinValue(1).setMaxValue(600).setRequired(false)),
  rewind: b => b.addIntegerOption(o => o.setName("seconds").setDescription("Seconds to rewind (default: 15)").setMinValue(1).setMaxValue(600).setRequired(false)),
  voteskip: b => b,
  "247": b => b,
  related: b => b,
  radio: b => b.addStringOption(o => o.setName("genre").setDescription("Genre or style to play as radio (lofi, jazz, edm, kpop, anime, rock...)").setRequired(true)),
  lyrics: b => b,
  history: b => b,
  playlist: b => b
    .addStringOption(o => o.setName("action").setDescription("What to do").setRequired(true).addChoices(
      { name: "save — save current queue as playlist", value: "save" },
      { name: "load — load a saved playlist into queue", value: "load" },
      { name: "list — show all saved playlists", value: "list" },
      { name: "delete — delete a saved playlist", value: "delete" },
    ))
    .addStringOption(o => o.setName("name").setDescription("Playlist name (required for save / load / delete)").setRequired(false)),
  restrict: b => b.addStringOption(o => o.setName("command").setDescription("Command name to toggle DJ-only restriction (e.g. skip)").setRequired(false)),
  announce: b => b,
};

function buildSlashCommands(commands) {
  const slashCommands = [];
  for (const [, cmd] of commands) {
    if (!cmd.name) continue;
    const name = cmd.name.toLowerCase().replace(/[^a-z0-9_-]/g, "").slice(0, 32);
    const description = (cmd.description || "No description provided").slice(0, 100);
    if (!name) continue;
    try {
      let builder = new SlashCommandBuilder().setName(name).setDescription(description);
      if (SLASH_DATA[cmd.name]) {
        builder = SLASH_DATA[cmd.name](builder);
      }
      slashCommands.push(builder.toJSON());
    } catch (e) {
      console.error(`[HowlBeats] Failed to build slash for ${cmd.name}:`, e.message);
    }
  }
  return slashCommands;
}

async function registerSlashCommands(client) {
  const token = process.env.DISCORD_TOKEN;
  const clientId = process.env.DISCORD_CLIENT_ID || client.user?.id;
  if (!token || !clientId) return console.warn("[HowlBeats] Cannot register slash commands — missing token or client ID");

  const slashData = buildSlashCommands(client.commands);
  const rest = new REST({ version: "10" }).setToken(token);

  try {
    console.log(`[HowlBeats] Registering ${slashData.length} slash commands globally...`);
    await rest.put(Routes.applicationCommands(clientId), { body: slashData });
    console.log(`[HowlBeats] ✅ ${slashData.length} slash commands registered!`);
  } catch (e) {
    console.error("[HowlBeats] Failed to register slash commands:", e.message);
  }
}

module.exports = { buildSlashCommands, registerSlashCommands };
