#!/usr/bin/env sh
set -eu

DEFAULT_REPO="VanyaKrotov/ip-check"
DEFAULT_INSTALL_DIR="/opt/ip-check"
DEFAULT_APP_PORT="3001"

is_interactive() {
  [ -t 0 ]
}

ask_with_default() {
  prompt="$1"
  default="$2"

  if is_interactive; then
    printf "%s [%s]: " "$prompt" "$default" >&2
    read -r answer || answer=""
    if [ -n "$answer" ]; then
      printf "%s" "$answer"
      return
    fi
  fi

  printf "%s" "$default"
}

ask_optional_secret() {
  prompt="$1"

  if is_interactive; then
    printf "%s: " "$prompt" >&2
    if command -v stty >/dev/null 2>&1; then
      stty -echo
      read -r answer || answer=""
      stty echo
      printf "\n" >&2
    else
      read -r answer || answer=""
    fi
    printf "%s" "$answer"
    return
  fi

  printf ""
}

run_as_root() {
  if [ "$(id -u)" -eq 0 ]; then
    "$@"
  elif command -v sudo >/dev/null 2>&1; then
    sudo "$@"
  else
    echo "This step requires root privileges. Re-run as root or install sudo." >&2
    exit 1
  fi
}

detect_package_manager() {
  if command -v apt-get >/dev/null 2>&1; then
    printf "apt"
  elif command -v dnf >/dev/null 2>&1; then
    printf "dnf"
  elif command -v yum >/dev/null 2>&1; then
    printf "yum"
  elif command -v apk >/dev/null 2>&1; then
    printf "apk"
  elif command -v pacman >/dev/null 2>&1; then
    printf "pacman"
  else
    printf ""
  fi
}

install_packages() {
  manager="$(detect_package_manager)"

  if [ -z "$manager" ]; then
    echo "Could not detect a supported package manager. Install missing dependencies manually." >&2
    exit 1
  fi

  case "$manager" in
    apt)
      run_as_root apt-get update
      run_as_root apt-get install -y "$@"
      ;;
    dnf)
      run_as_root dnf install -y "$@"
      ;;
    yum)
      run_as_root yum install -y "$@"
      ;;
    apk)
      run_as_root apk add --no-cache "$@"
      ;;
    pacman)
      run_as_root pacman -Sy --noconfirm "$@"
      ;;
  esac
}

install_base_dependencies() {
  has_missing=0

  for cmd in curl tar grep sed mktemp tr head; do
    if ! command -v "$cmd" >/dev/null 2>&1; then
      has_missing=1
    fi
  done

  if [ "$has_missing" -eq 1 ]; then
    echo "Installing missing base dependencies." >&2
    manager="$(detect_package_manager)"

    case "$manager" in
      apt | dnf | yum | pacman)
        install_packages ca-certificates curl tar grep sed coreutils
        ;;
      apk)
        install_packages ca-certificates curl tar grep sed coreutils
        ;;
      *)
        echo "Could not install base dependencies automatically. Install ca-certificates, curl, tar, grep, sed, and coreutils." >&2
        exit 1
        ;;
    esac
  fi
}

install_docker() {
  if command -v docker >/dev/null 2>&1; then
    return
  fi

  echo "Docker is not installed. Installing Docker with the system package manager." >&2
  manager="$(detect_package_manager)"

  case "$manager" in
    apt)
      install_packages docker.io
      ;;
    dnf | yum)
      install_packages docker
      ;;
    apk)
      install_packages docker
      ;;
    pacman)
      install_packages docker
      ;;
    *)
      echo "Could not install Docker automatically. Install Docker and re-run this script." >&2
      exit 1
      ;;
  esac
}

install_compose() {
  if docker compose version >/dev/null 2>&1 || command -v docker-compose >/dev/null 2>&1; then
    return
  fi

  echo "Docker Compose is not installed. Installing Compose support." >&2
  manager="$(detect_package_manager)"

  case "$manager" in
    apt)
      install_packages docker-compose-plugin || install_packages docker-compose
      ;;
    dnf | yum)
      install_packages docker-compose-plugin || install_packages docker-compose
      ;;
    apk)
      install_packages docker-cli-compose || install_packages docker-compose
      ;;
    pacman)
      install_packages docker-compose
      ;;
    *)
      echo "Could not install Docker Compose automatically. Install Docker Compose and re-run this script." >&2
      exit 1
      ;;
  esac
}

start_docker() {
  if docker info >/dev/null 2>&1; then
    return
  fi

  echo "Starting Docker service." >&2
  if command -v systemctl >/dev/null 2>&1; then
    run_as_root systemctl enable --now docker
  elif command -v service >/dev/null 2>&1; then
    run_as_root service docker start
  else
    echo "Could not start Docker automatically. Start Docker and re-run this script." >&2
    exit 1
  fi
}

compose() {
  if docker compose version >/dev/null 2>&1; then
    docker compose "$@"
  elif run_as_root docker compose version >/dev/null 2>&1; then
    run_as_root docker compose "$@"
  elif command -v docker-compose >/dev/null 2>&1; then
    if docker-compose version >/dev/null 2>&1; then
      docker-compose "$@"
    else
      run_as_root docker-compose "$@"
    fi
  else
    echo "Docker Compose is not available" >&2
    exit 1
  fi
}

REPO="${REPO:-$(ask_with_default "GitHub repository" "$DEFAULT_REPO")}"
INSTALL_DIR="${INSTALL_DIR:-$(ask_with_default "Install directory" "$DEFAULT_INSTALL_DIR")}"
APP_PORT="${APP_PORT:-$(ask_with_default "Public app port" "$DEFAULT_APP_PORT")}"
GITHUB_TOKEN="${GITHUB_TOKEN:-$(ask_optional_secret "GitHub token for private repositories or higher API limits (optional)")}"

install_base_dependencies
install_docker
install_compose
start_docker

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

RELEASE_JSON="$TMP_DIR/release.json"
if [ -n "$AUTH_HEADER" ]; then
  curl -fsSL -H "$AUTH_HEADER" "$API_URL" -o "$RELEASE_JSON"
else
  curl -fsSL "$API_URL" -o "$RELEASE_JSON"
fi

ASSET_URL="$(grep -o '"browser_download_url": *"[^"]*ip-check-release[^"]*\.tar\.gz"' "$RELEASE_JSON" | head -n 1 | sed 's/.*"browser_download_url": *"//;s/"$//')"

if [ -z "$ASSET_URL" ]; then
  echo "Could not find ip-check-release tar.gz asset in the latest release" >&2
  exit 1
fi

ARCHIVE="$TMP_DIR/ip-check-release.tar.gz"
if [ -n "$AUTH_HEADER" ]; then
  curl -fsSL -H "$AUTH_HEADER" "$ASSET_URL" -o "$ARCHIVE"
else
  curl -fsSL "$ASSET_URL" -o "$ARCHIVE"
fi

run_as_root mkdir -p "$INSTALL_DIR"
run_as_root tar -xzf "$ARCHIVE" -C "$INSTALL_DIR" --strip-components=1

IMAGE="ghcr.io/$(printf '%s' "$REPO" | tr '[:upper:]' '[:lower:]'):latest"
if [ -f "$INSTALL_DIR/docker-compose.yml" ]; then
  run_as_root sed -i.bak "s#ghcr.io/OWNER/REPOSITORY:latest#$IMAGE#g" "$INSTALL_DIR/docker-compose.yml"
fi

cd "$INSTALL_DIR"
export APP_PORT

compose pull || true
compose up -d --remove-orphans

echo "IP Check is running on port $APP_PORT"
