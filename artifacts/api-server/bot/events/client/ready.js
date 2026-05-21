const { registerSlashCommands } = require("../../handlers/slashCommands");

module.exports = async (client) => {
  try {
    console.log(`[HowlBeats] Bot ready: ${client.user.tag}`);

    const activities = [
      { name: "/play | HowlBeats 🐾", type: 2 },
      { name: "furry tunes~", type: 2 },
      { name: "/help for commands", type: 3 },
      { name: `${client.guilds.cache.size} servers 🐾`, type: 3 },
    ];
    let i = 0;
    const setActivity = () => {
      const a = activities[i % activities.length];
      client.user.setPresence({ activities: [{ name: a.name, type: a.type }], status: "online" });
      i++;
    };
    setActivity();
    setInterval(setActivity, 20000);

    await registerSlashCommands(client);
  } catch (e) {
    console.error("[HowlBeats] ready error:", e);
  }
};
