const express = require("express");
const path = require("path");
const passport = require("passport");
const session = require("express-session");
const MemoryStore = require("memorystore")(session);
const Strategy = require("passport-discord").Strategy;
const bodyParser = require("body-parser");
const { msToTime } = require("../handlers/functions");
const botConfig = require("../config/config.json");
const filters = require("../config/filters.json");

function buildQueueHtml(player) {
  if (!player || !player.queue.current) {
    return `<div style="text-align:center;padding:4rem;"><div style="font-size:5rem;margin-bottom:1rem;">🐾</div><h2 style="color:var(--text-muted);">Nothing is playing right now</h2><p style="color:var(--text-muted);">Start playing music with <code>/play</code>!</p></div>`;
  }

  const current = player.queue.current;
  const dur = current.length || 0;
  const pos = player.position || 0;
  const pct = dur > 0 ? Math.min(100, (pos / dur) * 100) : 0;
  const thumb = current.thumbnail || `https://via.placeholder.com/160x100/241a14/FF8C00?text=🐾`;
  const tracks = [...player.queue];

  let html = `
    <div class="now-playing-card" id="now-playing-card">
      <img src="${thumb}" alt="Thumbnail" onerror="this.src='https://via.placeholder.com/160x100/241a14/FF8C00?text=🐾'">
      <div class="np-info">
        <p style="color:var(--primary);font-weight:700;font-size:0.85rem;margin-bottom:0.3rem;">${player.paused ? "⏸ PAUSED" : "▶ NOW PLAYING"}</p>
        <h2><a href="${current.uri || "#"}" target="_blank" style="color:var(--text);">${(current.title || "Unknown").slice(0, 80)}</a></h2>
        <p>by ${current.author || "Unknown"}</p>
        <div class="progress-bar-wrap">
          <div class="progress-bar-bg"><div class="progress-bar-fill" style="width:${pct.toFixed(1)}%;"></div></div>
          <div class="progress-times"><span>${msToTime(pos)}</span><span>${dur === 0 ? "LIVE" : msToTime(dur)}</span></div>
        </div>
      </div>
    </div>
    <h2 style="font-size:1.2rem;font-weight:700;margin-bottom:1rem;">📋 Queue <span style="color:var(--text-muted);font-weight:400;">(${tracks.length} track${tracks.length !== 1 ? "s" : ""})</span></h2>
    <div class="queue-list">
  `;

  if (tracks.length === 0) {
    html += `<p style="color:var(--text-muted);text-align:center;padding:1.5rem;">Queue is empty — add more songs with <code>/play</code>!</p>`;
  } else {
    tracks.slice(0, 25).forEach((t, i) => {
      const tThumb = t.thumbnail || "";
      html += `
        <div class="queue-item">
          <span class="queue-num">${i + 1}</span>
          ${tThumb ? `<img src="${tThumb}" style="width:48px;height:30px;object-fit:cover;border-radius:4px;" onerror="this.style.display='none'" alt="">` : ""}
          <div class="queue-item-info">
            <a href="${t.uri || "#"}" target="_blank">${(t.title || "Unknown").slice(0, 60)}</a><br>
            <small>${t.author || "Unknown"}</small>
          </div>
          <span class="queue-item-dur">${t.length === 0 ? "LIVE" : msToTime(t.length || 0)}</span>
        </div>
      `;
    });
    if (tracks.length > 25) {
      html += `<p style="color:var(--text-muted);text-align:center;padding:1rem;">...and ${tracks.length - 25} more tracks</p>`;
    }
  }

  html += `</div>`;
  return html;
}

module.exports = (client, port) => {
  const app = express();

  passport.serializeUser((user, done) => done(null, user));
  passport.deserializeUser((obj, done) => done(null, obj));

  const callbackURL = botConfig.website
    ? `${botConfig.website}/callback`
    : (process.env.REPLIT_DOMAINS ? `https://${process.env.REPLIT_DOMAINS.split(",")[0]}/callback` : `http://localhost:${port}/callback`);

  passport.use(new Strategy({
    clientID: process.env.DISCORD_CLIENT_ID,
    clientSecret: process.env.DISCORD_CLIENT_SECRET,
    callbackURL,
    scope: ["identify", "guilds"],
  }, (accessToken, refreshToken, profile, done) => {
    process.nextTick(() => done(null, profile));
  }));

  app.use(session({
    store: new MemoryStore({ checkPeriod: 86400000 }),
    secret: process.env.SESSION_SECRET || "furbeats-secret-paws",
    resave: false,
    saveUninitialized: false,
  }));

  app.use(passport.initialize());
  app.use(passport.session());
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  if (process.env.NODE_ENV !== "production") {
    app.use((req, res, next) => {
      res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
      res.setHeader("X-Frame-Options", "ALLOWALL");
      res.setHeader("Content-Security-Policy", "frame-ancestors *");
      next();
    });
  }

  app.set("view engine", "ejs");
  app.set("views", path.join(__dirname, "./views"));
  app.use(express.static(path.join(__dirname, "./public")));

  const checkAuth = (req, res, next) => {
    if (req.isAuthenticated()) return next();
    req.session.backURL = req.url;
    res.redirect("/login");
  };

  const commonVars = (req) => ({
    botClient: client,
    user: req.isAuthenticated() ? req.user : null,
    botConfig,
    filters,
    commands: Array.from(client.commands.values()),
    callback: callbackURL,
  });

  app.get("/login", (req, res, next) => {
    if (!req.session.backURL) req.session.backURL = "/";
    next();
  }, passport.authenticate("discord", { prompt: "consent" }));

  app.get("/callback", passport.authenticate("discord", { failureRedirect: "/" }), (req, res) => {
    res.redirect(req.session.backURL || "/dashboard");
  });

  app.get("/logout", (req, res) => {
    req.session.destroy(() => {
      req.logout(() => {});
      res.redirect("/");
    });
  });

  app.get("/", (req, res) => {
    res.render("index", commonVars(req));
  });

  app.get("/commands", (req, res) => {
    res.render("commands", commonVars(req));
  });

  app.get("/about", (req, res) => {
    res.render("about", commonVars(req));
  });

  app.get("/terms", (req, res) => {
    res.render("terms", commonVars(req));
  });

  app.get("/privacy", (req, res) => {
    res.render("privacy", commonVars(req));
  });

  app.get("/dashboard", (req, res) => {
    if (!req.isAuthenticated()) {
      req.session.backURL = "/dashboard";
      return res.redirect("/login");
    }
    if (!req.user.guilds) return res.redirect("/?error=Unable+to+fetch+guilds");
    res.render("dashboard", commonVars(req));
  });

  app.get("/dashboard/:guildID", checkAuth, async (req, res) => {
    const guild = client.guilds.cache.get(req.params.guildID);
    if (!guild) return res.redirect("/dashboard?error=Bot+not+in+that+server");

    let member = guild.members.cache.get(req.user.id);
    if (!member) {
      try { member = await guild.members.fetch(req.user.id); } catch {}
    }
    if (!member) return res.redirect("/dashboard?error=Could+not+find+you+in+the+server");
    if (!member.permissions.has("ManageGuild")) return res.redirect("/dashboard?error=You+need+Manage+Server+permission");

    client.settings.ensure(guild.id, {
      prefix: botConfig.prefix,
      defaultvolume: 80,
      defaultautoplay: false,
      djroles: [],
      botchannel: [],
    });

    res.render("settings", { ...commonVars(req), guild, saved: req.query.saved });
  });

  app.post("/dashboard/:guildID", checkAuth, async (req, res) => {
    const guild = client.guilds.cache.get(req.params.guildID);
    if (!guild) return res.redirect("/dashboard");

    let member = guild.members.cache.get(req.user.id);
    if (!member) {
      try { member = await guild.members.fetch(req.user.id); } catch {}
    }
    if (!member || !member.permissions.has("ManageGuild")) return res.redirect("/dashboard?error=Not+allowed");

    if (req.body.prefix) client.settings.set(guild.id, String(req.body.prefix).split(" ")[0], "prefix");
    if (req.body.defaultvolume) client.settings.set(guild.id, Number(req.body.defaultvolume), "defaultvolume");
    client.settings.set(guild.id, !!req.body.defaultautoplay, "defaultautoplay");
    if (req.body.djroles) {
      const roles = Array.isArray(req.body.djroles) ? req.body.djroles : [req.body.djroles];
      client.settings.set(guild.id, roles, "djroles");
    } else {
      client.settings.set(guild.id, [], "djroles");
    }
    if (req.body.botchannel) {
      const channels = Array.isArray(req.body.botchannel) ? req.body.botchannel : [req.body.botchannel];
      client.settings.set(guild.id, channels, "botchannel");
    } else {
      client.settings.set(guild.id, [], "botchannel");
    }

    res.redirect(`/dashboard/${guild.id}?saved=1`);
  });

  app.get("/queue/:guildID", (req, res) => {
    const player = client.kazagumo?.players?.get(req.params.guildID);
    const guild = client.guilds.cache.get(req.params.guildID);
    const queueHtml = buildQueueHtml(player);
    res.render("queue", { ...commonVars(req), guild, queueHtml });
  });

  app.get("/api/queue/:guildID", (req, res) => {
    const player = client.kazagumo?.players?.get(req.params.guildID);
    res.json({ html: buildQueueHtml(player) });
  });

  app.get("/api/stats", (req, res) => {
    res.json({
      guilds: client.guilds.cache.size,
      users: client.guilds.cache.reduce((a, g) => a + g.memberCount, 0),
      commands: client.commands.size,
      players: client.kazagumo?.players?.size || 0,
      ping: Math.round(client.ws.ping),
      uptime: process.uptime(),
    });
  });

  app.get("/api/healthz", (req, res) => {
    res.json({ ok: true, bot: client.user?.tag || "not ready" });
  });

  app.listen(port, () => {
    console.log(`[HowlBeats] Dashboard listening on port ${port}`);
  });

  return app;
};
