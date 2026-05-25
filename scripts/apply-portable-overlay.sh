#!/usr/bin/env bash
set -euo pipefail

VERSION="${1:?Usage: apply-portable-overlay.sh <version>}"
OVERLAY="portable-overlay"

cp "${OVERLAY}/portable-paths.js" ./portable-paths.js
cp "${OVERLAY}/portable-f5-refresh.js" ./portable-f5-refresh.js
cp "${OVERLAY}/app.js" ./app.js
cp "${OVERLAY}/config.js" ./config.js
cp "${OVERLAY}/.gitignore" ./.gitignore
cp "${OVERLAY}/.github/workflows/build.yml" ./.github/workflows/build.yml
cp "${OVERLAY}/.github/workflows/release-windows-portable.yml" ./.github/workflows/release-windows-portable.yml
cp "${OVERLAY}/.github/workflows/sync-upstream-release.yml" ./.github/workflows/sync-upstream-release.yml

jq --arg v "${VERSION}" \
  --arg url "https://github.com/codychen98/homeassistant-desktop-portable-release" \
  '
  .name = "homeassistant-desktop-portable" |
  .repository.url = $url |
  .description = "Windows portable fork of Home Assistant Desktop (data beside executable, no installer)" |
  .version = $v |
  .scripts["build-win-portable"] = "electron-builder build --win dir --x64 --publish never" |
  .dependencies |= with_entries(select(.key as $k | ["auto-launch", "electron-updater", "semver"] | index($k) | not)) |
  .build.win.icon = "./build/iconwin.png" |
  .build.win.target = [{"target": "dir", "arch": ["x64"]}]
  ' package.json > package.json.tmp && mv package.json.tmp package.json

npm install --package-lock-only
