#!/bin/bash

echo "- compass: game"
compass watch web/game &

echo "- server"
nodemon --watch server server/server.js &

# ----------------------------------------------
#  Shutdown

read -p "RUNNING."

killall -9 ruby &> /dev/null
killall -9 node &> /dev/null

echo "KILLED.";

