#!/usr/bin/env bash
# Builds Mintora and runs the end-to-end tests. Needs node with playwright and python3.
set -e
cd "$(dirname "$0")/.."
python3 build.py
T=tests/.serve; rm -rf "$T"; mkdir -p "$T"
cp dist/mintora.html "$T/index.html"; cp manifest.webmanifest icon.svg "$T/"
python3 -m http.server 8897 --bind 127.0.0.1 -d "$T" >/dev/null 2>&1 & SRV=$!
trap 'kill $SRV 2>/dev/null' EXIT
sleep 1
node tests/test.js
