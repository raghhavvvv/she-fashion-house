#!/bin/bash
echo "Starting She Fashion House Server... please keep this window open."
node app.js &
PID=$!
sleep 3
open http://localhost:3000

# To kill the server process when this script's terminal is closed
trap "kill $PID" EXIT
wait