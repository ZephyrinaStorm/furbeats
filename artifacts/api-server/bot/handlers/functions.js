const { Collection } = require("discord.js");
const settings = require("../config/settings.json");

module.exports.delay = delay;
module.exports.getRandomInt = getRandomInt;
module.exports.createBar = createBar;
module.exports.format = format;
module.exports.escapeRegex = escapeRegex;
module.exports.arrayMove = arrayMove;
module.exports.isValidURL = isValidURL;
module.exports.onCoolDown = onCoolDown;
module.exports.check_if_dj = check_if_dj;
module.exports.nFormatter = nFormatter;
module.exports.msToTime = msToTime;

function check_if_dj(client, member, requesterId) {
  if (!client) return false;
  const roleids = client.settings.get(member.guild.id, "djroles");
  if (!roleids || !Array.isArray(roleids) || roleids.length === 0) return false;
  let isdj = false;
  for (const roleid of roleids) {
    if (member.roles.cache.has(roleid)) isdj = true;
  }
  if (!isdj && !member.permissions.has("ADMINISTRATOR") && requesterId !== member.id)
    return roleids.map(i => `<@&${i}>`).join(", ");
  return false;
}

function onCoolDown(userId, command, client) {
  if (!client.cooldowns.has(command.name)) {
    client.cooldowns.set(command.name, new Collection());
  }
  const now = Date.now();
  const timestamps = client.cooldowns.get(command.name);
  const cooldownAmount = (command.cooldown || settings.default_cooldown_in_sec) * 1000;
  if (timestamps.has(userId)) {
    const expirationTime = timestamps.get(userId) + cooldownAmount;
    if (now < expirationTime) {
      return (expirationTime - now) / 1000;
    }
  }
  timestamps.set(userId, now);
  setTimeout(() => timestamps.delete(userId), cooldownAmount);
  return false;
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

function createBar(total, current, size = 20, line = "▬", slider = "🐾") {
  if (!total) return `**[${slider}${line.repeat(size - 1)}]**`;
  if (!current) return `**[${slider}${line.repeat(size - 1)}]**`;
  const filled = Math.round(size * (current / total));
  const bar = line.repeat(Math.max(0, filled - 1)) + slider + line.repeat(Math.max(0, size - filled));
  return `**[${bar}]**`;
}

function format(ms) {
  const h = Math.floor(ms / 3600000);
  const m = Math.floor(ms / 60000) % 60;
  const s = Math.floor((ms % 60000) / 1000);
  if (h < 1) return `${m < 10 ? "0" : ""}${m}:${s < 10 ? "0" : ""}${s}`;
  return `${h < 10 ? "0" : ""}${h}:${m < 10 ? "0" : ""}${m}:${s < 10 ? "0" : ""}${s}`;
}

function msToTime(ms) {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  if (h > 0) return `${h}:${String(m % 60).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
  return `${m}:${String(s % 60).padStart(2, "0")}`;
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function arrayMove(array, from, to) {
  array = [...array];
  const [item] = array.splice(from, 1);
  array.splice(to, 0, item);
  return array;
}

function isValidURL(string) {
  try {
    const url = new URL(string);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function nFormatter(num, digits = 2) {
  if (!num) return "0";
  const lookup = [
    { value: 1e18, symbol: "E" },
    { value: 1e15, symbol: "P" },
    { value: 1e12, symbol: "T" },
    { value: 1e9, symbol: "G" },
    { value: 1e6, symbol: "M" },
    { value: 1e3, symbol: "k" },
    { value: 1, symbol: "" },
  ];
  const item = lookup.find(i => num >= i.value);
  if (!item) return "0";
  return (num / item.value).toFixed(digits).replace(/\.0+$|(\.[0-9]*[1-9])0+$/, "$1") + item.symbol;
}
