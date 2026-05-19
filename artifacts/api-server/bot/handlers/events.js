const { readdirSync } = require("fs");
const path = require("path");

const DISCORD_EVENT_MAP = {
  ready: "clientReady",
};

module.exports = (client) => {
  try {
    let amount = 0;
    const evBase = path.join(__dirname, "../events");
    ["client", "guild"].forEach(dir => {
      const files = readdirSync(path.join(evBase, dir)).filter(f => f.endsWith(".js"));
      for (const file of files) {
        const event = require(path.join(evBase, dir, file));
        const baseName = file.split(".")[0];
        const eventName = DISCORD_EVENT_MAP[baseName] || baseName;
        client.on(eventName, event.bind(null, client));
        amount++;
      }
    });
    console.log(`[HowlBeats] ${amount} events loaded`);
  } catch (e) {
    console.error("[HowlBeats] Error loading events:", e);
  }
};
