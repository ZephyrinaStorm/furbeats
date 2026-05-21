#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LAVALINK_DIR="$SCRIPT_DIR/lavalink"
LOCAL_PASS="furbeats_lavalink_local"
LOCAL_PORT="8000"

# In web-only mode the bot never connects to Lavalink, so skip starting it
if [ "$WEB_ONLY" = "true" ]; then
  echo "[HowlBeats] Web-only mode — skipping Lavalink startup."
  exec node --enable-source-maps ./dist/index.mjs
fi

# If an external Lavalink host is configured, use it instead of starting the local node
if [ -n "$LAVALINK_HOST" ] && [ "$LAVALINK_HOST" != "localhost" ] && [ "$LAVALINK_HOST" != "127.0.0.1" ]; then
  echo "[HowlBeats] Using public Lavalink at $LAVALINK_HOST"
else
  echo "[HowlBeats] Starting personal Lavalink node..."
  cd "$LAVALINK_DIR"
  java -Xmx512m -jar Lavalink.jar > /tmp/lavalink.log 2>&1 &
  LAVALINK_PID=$!
  echo "[HowlBeats] Lavalink PID: $LAVALINK_PID"

  echo "[HowlBeats] Waiting for Lavalink to be ready on port $LOCAL_PORT..."
  for i in $(seq 1 45); do
    if curl -sf "http://localhost:${LOCAL_PORT}/version" \
         -H "Authorization: ${LOCAL_PASS}" > /dev/null 2>&1; then
      echo "[HowlBeats] ✅ Lavalink is ready!"
      break
    fi
    if ! kill -0 $LAVALINK_PID 2>/dev/null; then
      echo "[HowlBeats] ❌ Lavalink process died! Logs:"
      cat /tmp/lavalink.log
      exit 1
    fi
    sleep 1
  done

  tail -f /tmp/lavalink.log &

  export LAVALINK_HOST=127.0.0.1
  export LAVALINK_PORT=$LOCAL_PORT
  export LAVALINK_PASSWORD=$LOCAL_PASS
  echo "[HowlBeats] Bot connecting to personal Lavalink at 127.0.0.1:${LOCAL_PORT}"
fi

# Start the bot
cd "$SCRIPT_DIR"
exec node --enable-source-maps ./dist/index.mjs
