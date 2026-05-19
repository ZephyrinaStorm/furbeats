module.exports = async (client, oldState, newState) => {
  try {
    const player = client.kazagumo?.players?.get(oldState.guild.id);
    if (!player) return;
    const botVoiceChannel = oldState.guild.channels.cache.get(player.voiceId);
    if (!botVoiceChannel) return;
    const nonBotMembers = botVoiceChannel.members.filter(m => !m.user.bot);
    if (nonBotMembers.size === 0) {
      setTimeout(() => {
        const p2 = client.kazagumo?.players?.get(oldState.guild.id);
        if (!p2) return;
        const ch = oldState.guild.channels.cache.get(p2.voiceId);
        if (!ch) return;
        if (ch.members.filter(m => !m.user.bot).size === 0) {
          const mode247 = client.infos?.get(oldState.guild.id, "mode247") || false;
          if (!mode247) p2.destroy().catch(() => {});
        }
      }, 30000);
    }
  } catch (e) {
    console.error("[HowlBeats] voiceStateUpdate error:", e);
  }
};
