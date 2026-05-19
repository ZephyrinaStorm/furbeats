const { EmbedBuilder } = require("discord.js");
const config = require("../../config/config.json");

function makeSafeMsg(msg, interaction) {
  const obj = msg || {};
  obj.edit = (opts) => {
    const payload = typeof opts === "string" ? { content: opts } : opts;
    return interaction.editReply(payload).catch(() => {});
  };
  obj.createdTimestamp = obj.createdTimestamp || Date.now();
  return obj;
}

function buildFakeMessage(interaction) {
  let firstReplyDone = false;

  const reply = async (opts) => {
    const payload = typeof opts === "string" ? { content: opts } : opts;
    try {
      if (!firstReplyDone) {
        firstReplyDone = true;
        if (interaction.deferred || interaction.replied) {
          const msg = await interaction.editReply(payload);
          return makeSafeMsg(msg, interaction);
        } else {
          const { resource } = await interaction.reply({ ...payload, withResponse: true });
          return makeSafeMsg(resource?.message, interaction);
        }
      } else {
        await interaction.followUp(payload).catch(() => {});
        return makeSafeMsg(null, interaction);
      }
    } catch (e) {
      console.error("[HowlBeats] slash reply error:", e.message);
      return makeSafeMsg(null, interaction);
    }
  };

  return {
    guild: interaction.guild,
    guildId: interaction.guildId,
    channel: {
      id: interaction.channelId,
      send: reply,
    },
    channelId: interaction.channelId,
    author: interaction.user,
    member: interaction.member,
    createdTimestamp: Date.now(),
    content: `/${interaction.commandName}`,
    reply,
    _interaction: interaction,
  };
}

function extractArgs(interaction) {
  if (!interaction.options || !interaction.options.data) return [];
  return interaction.options.data.map(opt => {
    if (opt.type === 7 && opt.channel) return opt.channel.id;
    if (opt.type === 8 && opt.role) return opt.role.id;
    return String(opt.value);
  });
}

module.exports = async (client, interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const deferred = await interaction.deferReply().then(() => true).catch(() => false);
  if (!deferred) return;

  const command = client.commands.get(interaction.commandName)
    || client.commands.get(client.aliases.get(interaction.commandName));

  if (!command) {
    return interaction.editReply({ content: "🐾 Unknown command!" }).catch(() => {});
  }

  const restricted = client.settings.get(interaction.guildId, "restrictedCommands") || [];
  if (restricted.includes(command.name)) {
    const member = interaction.member;
    const djroles = client.settings.get(interaction.guildId, "djroles") || [];
    if (djroles.length > 0) {
      const hasDJ = djroles.some(r => member.roles.cache.has(r));
      const isAdmin = member.permissions.has("Administrator");
      if (!hasDJ && !isAdmin) {
        return interaction.editReply({
          embeds: [new EmbedBuilder()
            .setColor(config.wrongcolor || "#f85149")
            .setTitle(`🔒 \`/${command.name}\` is restricted to DJ roles!`)
            .setDescription("Ask a server admin to assign you a DJ role.")],
        }).catch(() => {});
      }
    }
  }

  const fakeMessage = buildFakeMessage(interaction);
  const args = extractArgs(interaction);

  try {
    await command.run(client, fakeMessage, args);
  } catch (e) {
    console.error(`[HowlBeats] Slash command error (${command.name}):`, e);
    interaction.editReply({
      embeds: [new EmbedBuilder()
        .setColor(config.wrongcolor || "#f85149")
        .setTitle("🐾 Something went wrong running that command!")]
    }).catch(() => {});
  }
};
