const { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, ComponentType } = require("discord.js");
const config = require("../../config/config.json");

const catIcons  = { Music: "🎵", Queue: "📋", Filter: "🎚️", Settings: "⚙️", Info: "ℹ️" };
const catOrder  = ["Music", "Queue", "Filter", "Settings", "Info"];
const CAT_COLOR = { Music: "#FF8C00", Queue: "#ffad42", Filter: "#FF6B35", Settings: "#58a6ff", Info: "#56d364" };

module.exports = {
  name: "help",
  aliases: ["h", "commands"],
  usage: "help [command]",
  description: "Interactive help menu with category pages",
  category: "Info",
  cooldown: 3,
  run: async (client, message, args) => {
    const interaction = message._interaction;
    const userId = interaction ? interaction.user.id : message.author.id;

    // Build category map
    const categories = {};
    for (const cmd of client.commands.values()) {
      const cat = cmd.category || "Misc";
      if (!categories[cat]) categories[cat] = [];
      categories[cat].push(cmd);
    }
    const catList = catOrder.filter(c => categories[c])
      .concat(Object.keys(categories).filter(c => !catOrder.includes(c)));

    // Total pages = 1 home + one per category
    // page 0 = home/bio, pages 1..N = categories
    const TOTAL = 1 + catList.length;

    // ─── Single-command lookup ───────────────────────────────────────────
    if (args[0]) {
      const cmd = client.commands.get(args[0]) || client.commands.get(client.aliases.get(args[0]));
      if (!cmd) {
        return message.reply({
          embeds: [new EmbedBuilder()
            .setColor(config.wrongcolor || "#f85149")
            .setTitle(`🐾 Unknown command: \`/${args[0]}\``)
            .setDescription("Use `/help` to open the command menu.")]
        });
      }
      return message.reply({
        embeds: [new EmbedBuilder()
          .setColor(CAT_COLOR[cmd.category] || config.color)
          .setTitle(`${catIcons[cmd.category] || "📁"} \`/${cmd.name}\``)
          .setDescription(cmd.description || "No description")
          .addFields(
            { name: "Usage",    value: `\`/${cmd.usage || cmd.name}\``,                                inline: true },
            { name: "Category", value: `${catIcons[cmd.category] || "📁"} ${cmd.category || "Misc"}`, inline: true },
            ...(cmd.cooldown && cmd.cooldown > 1 ? [{ name: "Cooldown", value: `${cmd.cooldown}s`, inline: true }] : []),
          )
          .setThumbnail(client.user.displayAvatarURL())
          .setFooter({ text: config.footertext })]
      });
    }

    // ─── Embed builders ──────────────────────────────────────────────────
    const buildHomePage = () =>
      new EmbedBuilder()
        .setColor(config.color)
        .setAuthor({ name: "HowlBeats", iconURL: client.user.displayAvatarURL() })
        .setTitle("🐾 Welcome to the Help Menu!")
        .setThumbnail(client.user.displayAvatarURL())
        .setDescription(
          "**HowlBeats** is a furry-themed music bot that brings high-quality audio " +
          "from multiple platforms straight to your Discord server.\n\n" +
          "Use the **◀ ▶ arrows** to flip through category pages, or tap a **category button** to jump directly.\n" +
          "Type `/help <command>` for detailed info on a specific command.\n\u200b"
        )
        .addFields(
          {
            name: "🎵 Supported Platforms (11)",
            value:
              "▶ YouTube  •  🟢 Spotify  •  🍎 Apple Music  •  🟠 Deezer\n" +
              "🔶 SoundCloud  •  🟡 Yandex  •  🌊 Tidal  •  🎶 Jiosaavn\n" +
              "💜 Twitch  •  🎸 Bandcamp  •  🎬 Vimeo  •  📡 HTTP Streams",
            inline: false,
          },
          {
            name: "📚 Command Categories",
            value: catList
              .map(c => `${catIcons[c] || "📁"} **${c}** — ${categories[c].length} commands`)
              .join("\n"),
            inline: false,
          },
          {
            name: "🌐 Links",
            value: `[Website](${config.website})  •  [Support](${config.support})`,
            inline: false,
          },
        )
        .setFooter({ text: `${client.commands.size} commands total  •  Page 1 / ${TOTAL}  •  ${config.footertext}` })
        .setTimestamp();

    const buildCatPage = (catIdx) => {
      const cat  = catList[catIdx];
      const cmds = categories[cat];
      const pageNum = catIdx + 2; // home is page 1

      // Split into chunks ≤ 1024 chars
      const lines  = cmds.map(c => `**\`/${c.name}\`** — ${c.description || "No description"}`);
      const chunks = [];
      let chunk = "";
      for (const line of lines) {
        const next = chunk ? chunk + "\n" + line : line;
        if (next.length > 1000) { chunks.push(chunk); chunk = line; }
        else { chunk = next; }
      }
      if (chunk) chunks.push(chunk);

      const embed = new EmbedBuilder()
        .setColor(CAT_COLOR[cat] || config.color)
        .setAuthor({ name: "HowlBeats", iconURL: client.user.displayAvatarURL() })
        .setTitle(`${catIcons[cat] || "📁"} ${cat} Commands  (${cmds.length})`)
        .setThumbnail(client.user.displayAvatarURL());

      chunks.forEach((c, i) =>
        embed.addFields({ name: i === 0 ? "Commands" : "\u200b", value: c })
      );

      embed.setFooter({
        text: `Page ${pageNum} / ${TOTAL}  •  /help <command> for details  •  ${config.footertext}`,
      });
      return embed;
    };

    // ─── Button builders ─────────────────────────────────────────────────
    // Row 1 — nav arrows + home
    const buildNavRow = (page, disabled = false) =>
      new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("help_prev")
          .setEmoji("◀️")
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(disabled || page === 0),
        new ButtonBuilder()
          .setCustomId("help_home")
          .setLabel("🐾 Home")
          .setStyle(page === 0 ? ButtonStyle.Primary : ButtonStyle.Success)
          .setDisabled(disabled || page === 0),
        new ButtonBuilder()
          .setCustomId("help_next")
          .setEmoji("▶️")
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(disabled || page === TOTAL - 1),
      );

    // Rows 2+ — category shortcut buttons (up to 5 per row)
    const buildCatRows = (page, disabled = false) => {
      const btns = catList.map((cat, i) =>
        new ButtonBuilder()
          .setCustomId(`help_cat_${i}`)
          .setLabel(`${catIcons[cat] || "📁"} ${cat}`)
          .setStyle(page === i + 1 ? ButtonStyle.Primary : ButtonStyle.Secondary)
          .setDisabled(disabled)
      );
      const rows = [];
      for (let i = 0; i < btns.length; i += 5)
        rows.push(new ActionRowBuilder().addComponents(btns.slice(i, i + 5)));
      return rows;
    };

    const getComponents = (page, disabled = false) => [
      buildNavRow(page, disabled),
      ...buildCatRows(page, disabled),
    ];

    const getEmbed = (page) =>
      page === 0 ? buildHomePage() : buildCatPage(page - 1);

    // ─── Send initial message ────────────────────────────────────────────
    let currentPage = 0;

    const sentMsg = await message.reply({
      embeds: [getEmbed(0)],
      components: getComponents(0),
    });

    if (!sentMsg?.createMessageComponentCollector) return;

    // ─── Collector ───────────────────────────────────────────────────────
    const collector = sentMsg.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: 120_000,
    });

    collector.on("collect", async (i) => {
      if (i.user.id !== userId) {
        return i.reply({ content: "🐾 This menu isn't for you!", ephemeral: true });
      }

      if (i.customId === "help_home") {
        currentPage = 0;
      } else if (i.customId === "help_prev") {
        currentPage = Math.max(0, currentPage - 1);
      } else if (i.customId === "help_next") {
        currentPage = Math.min(TOTAL - 1, currentPage + 1);
      } else if (i.customId.startsWith("help_cat_")) {
        const idx = parseInt(i.customId.replace("help_cat_", ""), 10);
        currentPage = idx + 1; // +1 because page 0 is home
      }

      await i.update({
        embeds: [getEmbed(currentPage)],
        components: getComponents(currentPage),
      });
    });

    collector.on("end", async () => {
      try {
        await sentMsg.edit({ components: getComponents(currentPage, true) });
      } catch {}
    });
  },
};
