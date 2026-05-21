const { readdirSync } = require("fs");
const path = require("path");

module.exports = (client) => {
  try {
    let amount = 0;
    const cmdBase = path.join(__dirname, "../commands");
    readdirSync(cmdBase).forEach((dir) => {
      const files = readdirSync(path.join(cmdBase, dir)).filter(f => f.endsWith(".js"));
      for (const file of files) {
        const pull = require(path.join(cmdBase, dir, file));
        if (pull.name) {
          client.commands.set(pull.name, pull);
          amount++;
          if (pull.aliases && Array.isArray(pull.aliases)) {
            pull.aliases.forEach(alias => client.aliases.set(alias, pull.name));
          }
        }
      }
    });
    console.log(`[HowlBeats] ${amount} commands loaded`);
  } catch (e) {
    console.error("[HowlBeats] Error loading commands:", e);
  }
};
