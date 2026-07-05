#!/bin/bash
# Scout Project launcher — stops old instance, installs, and starts dev server

PORT=${1:-3456}
DIR="$(cd "$(dirname "$0")" && pwd)"

echo "Stopping any existing Scout server..."
lsof -ti :$PORT 2>/dev/null | xargs kill -9 2>/dev/null
sleep 1

cd "$DIR"

echo "Installing dependencies..."
npm install --silent

echo "Generating Prisma client..."
npx prisma generate --silent

echo "Starting Scout on http://localhost:$PORT ..."
nohup npx next dev -p $PORT > /tmp/scout-dev.log 2>&1 &
sleep 3

if curl -s -o /dev/null -w "" http://localhost:$PORT; then
  echo "Scout is live → http://localhost:$PORT"
  open http://localhost:$PORT
else
  echo "Failed to start. Check /tmp/scout-dev.log"
fi
