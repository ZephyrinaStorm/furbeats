import { logger } from "./lib/logger";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error("PORT environment variable is required but was not provided.");
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

// The esbuild banner injects globalThis.require and globalThis.__dirname
// so we can load CommonJS bot code from this ESM entry point.
const _require = (globalThis as any).require as NodeRequire;
const _dirname = (globalThis as any).__dirname as string;

if (!_require || !_dirname) {
  throw new Error("globalThis.require or __dirname not available — check build banner.");
}

const nodePath = _require("path");
const botEntry = nodePath.join(_dirname, "../bot/index.js");

logger.info({ botEntry }, "Loading HowlBeats bot");

const webOnly = process.env["WEB_ONLY"] === "true";

if (webOnly) {
  const { startWebOnly } = _require(botEntry) as { startWebOnly: (port: number) => void };
  logger.info({ port }, "HowlBeats starting in web-only mode (dashboard only)");
  startWebOnly(port);
} else {
  const { start } = _require(botEntry) as { start: (port: number) => void };
  start(port);
  logger.info({ port }, "HowlBeats bot started");
}
