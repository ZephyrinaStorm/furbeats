import path from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { pinoHttp } from "pino-http";
import { pino } from "pino";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const logger = pino({ transport: { target: "pino-pretty" } });

const DASHBOARD_PORT = Number(process.env.PORT || 8080);
const WEB_ONLY = process.env.WEB_ONLY === "true";

// globalThis.require is injected by esbuild banner so CJS bot code can be loaded
const botEntry = globalThis.require(
  path.resolve(__dirname, "..", "bot", "index.js"),
) as {
  client: unknown;
  start: (port: number) => void;
  startWebOnly: (port: number) => void;
};

if (WEB_ONLY) {
  logger.info("Starting in web-only mode");
  botEntry.startWebOnly(DASHBOARD_PORT);
} else {
  logger.info("Starting bot + dashboard");
  botEntry.start(DASHBOARD_PORT);
}
