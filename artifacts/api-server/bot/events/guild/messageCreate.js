const config = require("../../config/config.json");

module.exports = async (client, message) => {
  if (!message.guild || !message.channel || message.author.bot) return;

  client.settings.ensure(message.guild.id, {
    prefix: config.prefix,
    defaultvolume: 80,
    defaultautoplay: false,
    djroles: [],
    botchannel: [],
    musicChannel: null,
    musicMessage: null,
  });

  const musicChannelId = client.settings.get(message.guild.id, "musicChannel");
  if (musicChannelId && message.channel.id === musicChannelId) {
    const query = message.content.trim();
    message.delete().catch(() => {});
    if (query.length < 2) return;
    const voiceChannel = message.member?.voice?.channel;
    if (!voiceChannel) {
      return message.channel.send({ content: `🐾 ${message.author}, join a voice channel first!` })
        .then(m => setTimeout(() => m.delete().catch(() => {}), 5000));
    }
    try {
      let player = client.kazagumo.players.get(message.guild.id);
      if (!player) {
        player = await client.kazagumo.createPlayer({
          guildId: message.guild.id,
          voiceId: voiceChannel.id,
          textId: message.channel.id,
          deaf: true,
          volume: client.settings.get(message.guild.id, "defaultvolume") || 80,
        });
      }
      const result = await client.kazagumo.search(query, { requester: { id: message.author.id, tag: message.author.tag } });
      if (!result || !result.tracks.length) {
        return message.channel.send({ content: `🐾 No results for \`${query}\`` })
          .then(m => setTimeout(() => m.delete().catch(() => {}), 5000));
      }
      if (result.type === "PLAYLIST") {
        result.tracks.forEach(t => player.queue.add(t));
        const note = await message.channel.send({ content: `🎶 Added playlist **${result.playlistName}** (${result.tracks.length} tracks)` });
        setTimeout(() => note.delete().catch(() => {}), 6000);
      } else {
        player.queue.add(result.tracks[0]);
        const note = await message.channel.send({ content: `🎶 Added **${result.tracks[0].title}** to the queue` });
        setTimeout(() => note.delete().catch(() => {}), 6000);
      }
      if (!player.playing && !player.paused) await player.play();
    } catch (e) {
      console.error("[HowlBeats] musicChannel play error:", e.message);
    }
  }
};
