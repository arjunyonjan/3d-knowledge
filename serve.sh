#!/data/data/com.termux/files/usr/bin/bash
PORT="${1:-3000}"
DIR="$(cd "$(dirname "$0")" && pwd)"
LOG="$DIR/.vite-serve.log"

cd "$DIR"

# Use polling to avoid ENOSPC inotify limits on Android
CHOKIDAR_USEPOLLING=true nohup node node_modules/.bin/vite --host --port "$PORT" > "$LOG" 2>&1 &
PID=$!

sleep 6

# Read actual port from log
ACTUAL=$(grep -oP 'http://localhost:\K\d+' "$LOG" | head -1)
PORT="${ACTUAL:-$PORT}"

# Extract network IPs from Vite log
NET_IPS=$(grep -oP 'Network: http://\K[0-9.]+' "$LOG")

echo ""
echo "  ➜  Local:   http://localhost:$PORT"
echo "$NET_IPS" | while read ip; do
  echo "  ➜  Network: http://$ip:$PORT"
done
echo "  ➜  PID:     $PID"
echo ""
