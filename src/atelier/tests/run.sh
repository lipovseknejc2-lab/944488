#!/usr/bin/env bash
# Builds Atelier and runs every test: features, phone taps (sandboxed preview, blocked address bar, Safari),
# stress and crash, and offline as a GitHub Pages app. Needs node + playwright (npm i playwright) and python3.
set -e
[ -d /opt/npm-tools/node_modules ] && export NODE_PATH="/opt/npm-tools/node_modules${NODE_PATH:+:$NODE_PATH}"
cd "$(dirname "$0")/.."
python3 build.py
T=tests/.serve; rm -rf "$T"; mkdir -p "$T/944488/atelier" "$T/shots" tests/shots
cp dist/atelier.html tests/sandbox.html tests/t.pdf tests/t.gif "$T/"
cp ../../atelier/sw.js ../../atelier/manifest.webmanifest ../../atelier/*.png ../../atelier/icon.svg "$T/944488/atelier/" 2>/dev/null || true
cp dist/atelier.html "$T/944488/atelier/index.html"
# the server runs directly (not in a subshell) so the trap below really stops it after the run
python3 -m http.server 8812 --bind 127.0.0.1 -d "$T" >/dev/null 2>&1 & SRV=$!
trap 'kill $SRV 2>/dev/null' EXIT
sleep 1
echo "== features";  (cd "$T" && node ../feat.js)   | grep -E "FAIL|passed"
echo "== phone";     (cd "$T" && node ../phone.js)  | grep -E "FAIL|passed"
echo "== stress";    (cd "$T" && node ../stress.js) | grep -E "ms|heap|taps|external|error|ERROR"
echo "== notes";    (cd "$T" && node ../notes.js)  | grep -E "FAIL|passed"
echo "== groups";   (cd "$T" && node ../groups.js) | grep -E "FAIL|passed"
echo "== plugins";  (cd "$T" && node ../plugins.js) | grep -E "FAIL|passed"
echo "== focus";    (cd "$T" && node ../focus.js)  | grep -E "FAIL|passed"
echo "== offline";   node tests/offl.js "$PWD/$T"   | grep -E "FAIL|passed"
# Atelier Plugins, the desktop hub, on its own and together with Atelier (same site, like GitHub Pages)
(cd ../hub && python3 build.py >/dev/null)
python3 -m http.server 8813 --bind 127.0.0.1 -d ../hub/dist >/dev/null 2>&1 & SRV2=$!
python3 -m http.server 8814 --bind 127.0.0.1 -d ../.. >/dev/null 2>&1 & SRV3=$!
trap 'kill $SRV $SRV2 $SRV3 2>/dev/null' EXIT
sleep 1
echo "== hub";       (cd ../hub/tests && node hub.js)    | grep -E "FAIL|passed"
echo "== together";  (cd ../hub/tests && node bridge.js) | grep -E "FAIL|passed"
