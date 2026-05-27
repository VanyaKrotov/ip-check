#!/usr/bin/env sh
set -eu

REPO="${REPO:-}"
INSTALL_DIR="${INSTALL_DIR:-/opt/ip-check}"
APP_PORT="${APP_PORT:-3000}"
GITHUB_TOKEN="${GITHUB_TOKEN:-}"

if [ -z "$REPO" ]; then
  echo "REPO is required, for example: REPO=owner/ip-check $0" >&2
  exit 1
fi

if command -v curl >/dev/null 2>&1; then
  DOWNLOADER="curl"
else
  echo "curl is required" >&2
  exit 1
fi

AUTH_HEADER=""
if [ -n "$GITHUB_TOKEN" ]; then
  AUTH_HEADER="Authorization: Bearer $GITHUB_TOKEN"
fi

API_URL="https://api.github.com/repos/$REPO/releases/latest"
TMP_DIR="$(mktemp -d)"
cleanup() {
  rm -rf "$TMP_DIR"
}
trap cleanup EXIT

if [ -n "$AUTH_HEADER" ]; then
  RELEASE_JSON="$TMP_DIR/release.json"
  curl -fsSL -H "$AUTH_HEADER" "$API_URL" -o "$RELEASE_JSON"
else
  RELEASE_JSON="$TMP_DIR/release.json"
  curl -fsSL "$API_URL" -o "$RELEASE_JSON"
fi

ASSET_URL="$(grep -o '"browser_download_url": *"[^"]*ip-check-release[^"]*\.tar\.gz"' "$RELEASE_JSON" | head -n 1 | sed 's/.*"browser_download_url": *"//;s/"$//')"

if [ -z "$ASSET_URL" ]; then
  echo "Could not find ip-check-release tar.gz asset in the latest release" >&2
  exit 1
fi

ARCHIVE="$TMP_DIR/ip-check-release.tar.gz"
if [ -n "$AUTH_HEADER" ]; then
  "$DOWNLOADER" -fsSL -H "$AUTH_HEADER" "$ASSET_URL" -o "$ARCHIVE"
else
  "$DOWNLOADER" -fsSL "$ASSET_URL" -o "$ARCHIVE"
fi

mkdir -p "$INSTALL_DIR"
tar -xzf "$ARCHIVE" -C "$INSTALL_DIR" --strip-components=1

IMAGE="ghcr.io/$(printf '%s' "$REPO" | tr '[:upper:]' '[:lower:]'):latest"
if [ -f "$INSTALL_DIR/docker-compose.yml" ]; then
  sed -i.bak "s#ghcr.io/OWNER/REPOSITORY:latest#$IMAGE#g" "$INSTALL_DIR/docker-compose.yml"
fi

cd "$INSTALL_DIR"
export APP_PORT

if docker compose version >/dev/null 2>&1; then
  docker compose pull || true
  docker compose up -d --remove-orphans
else
  docker-compose pull || true
  docker-compose up -d --remove-orphans
fi

echo "IP Check is running on port $APP_PORT"
