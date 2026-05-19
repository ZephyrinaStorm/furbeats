// Thin HTTP proxy: forwards Replit webview (port 3000) → HowlBeats bot (port 8080).
// Binds immediately so the workflow port-check passes, then forwards all requests.
import http from "http";

const TARGET_PORT = 8080;
const PROXY_PORT = process.env.PROXY_PORT ? Number(process.env.PROXY_PORT) : 3000;

const server = http.createServer((req, res) => {
  const options = {
    hostname: "127.0.0.1",
    port: TARGET_PORT,
    path: req.url,
    method: req.method,
    headers: { ...req.headers, host: `127.0.0.1:${TARGET_PORT}` },
  };
  const proxy = http.request(options, (upstream) => {
    res.writeHead(upstream.statusCode, upstream.headers);
    upstream.pipe(res, { end: true });
  });
  req.pipe(proxy, { end: true });
  proxy.on("error", () => {
    if (!res.headersSent) {
      res.writeHead(502, { "Content-Type": "text/html" });
    }
    res.end(`<html><body style="font-family:sans-serif;text-align:center;padding:60px;background:#1a0a00;color:#FF8C00">
      <h2>HowlBeats is starting up...</h2>
      <p>The bot server is warming up. Refresh in a few seconds.</p>
      <script>setTimeout(()=>location.reload(),3000)</script>
    </body></html>`);
  });
});

// Bind immediately — workflow port-check must see this port open fast
server.listen(PROXY_PORT, "0.0.0.0", () => {
  console.log(`[HowlBeats] Webview proxy listening on :${PROXY_PORT} → :${TARGET_PORT}`);
});
