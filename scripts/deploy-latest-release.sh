#!/usr/bin/env sh
set -eu

DEFAULT_REPO="VanyaKrotov/ip-check"
DEFAULT_INSTALL_DIR="/opt/ip-check"
DEFAULT_APP_PORT="3001"
DEFAULT_NGINX_FALLBACK_PORT="8443"

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

  for cmd in curl tar grep sed mktemp tr head find dirname cp; do
    if ! command -v "$cmd" >/dev/null 2>&1; then
      has_missing=1
    fi
  done

  if [ "$has_missing" -eq 1 ]; then
    echo "Installing missing base dependencies." >&2
    manager="$(detect_package_manager)"

    case "$manager" in
      apt | dnf | yum | pacman)
        install_packages ca-certificates curl tar grep sed findutils coreutils
        ;;
      apk)
        install_packages ca-certificates curl tar grep sed findutils coreutils
        ;;
      *)
        echo "Could not install base dependencies automatically. Install ca-certificates, curl, tar, grep, sed, findutils, and coreutils." >&2
        exit 1
        ;;
    esac
  fi
}

configure_docker_apt_repository() {
  run_as_root apt-get update
  run_as_root apt-get install -y ca-certificates curl
  run_as_root install -m 0755 -d /etc/apt/keyrings
  run_as_root curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
  run_as_root chmod a+r /etc/apt/keyrings/docker.asc

  ARCH="$(dpkg --print-architecture)"
  CODENAME="$(
    . /etc/os-release
    printf "%s" "${UBUNTU_CODENAME:-$VERSION_CODENAME}"
  )"

  DOCKER_LIST="/etc/apt/sources.list.d/docker.list"
  DOCKER_LIST_TMP="/tmp/docker.list.$$"
  printf "deb [arch=%s signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu %s stable\n" "$ARCH" "$CODENAME" > "$DOCKER_LIST_TMP"
  run_as_root cp "$DOCKER_LIST_TMP" "$DOCKER_LIST"
  rm -f "$DOCKER_LIST_TMP"
  run_as_root apt-get update
}

install_docker() {
  if command -v docker >/dev/null 2>&1 && docker compose version >/dev/null 2>&1; then
    return
  fi

  echo "Installing Docker and Compose support." >&2
  manager="$(detect_package_manager)"

  case "$manager" in
    apt)
      configure_docker_apt_repository
      run_as_root apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
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
  if docker compose version >/dev/null 2>&1 || run_as_root docker compose version >/dev/null 2>&1; then
    return
  fi

  if command -v docker-compose >/dev/null 2>&1; then
    echo "Legacy docker-compose is installed, but Compose v2 is required. Installing Docker Compose plugin." >&2
  else
    echo "Docker Compose is not installed. Installing Compose v2 support." >&2
  fi

  manager="$(detect_package_manager)"

  case "$manager" in
    apt)
      configure_docker_apt_repository
      run_as_root apt-get install -y docker-compose-plugin
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

  if ! docker compose version >/dev/null 2>&1 && ! run_as_root docker compose version >/dev/null 2>&1; then
    echo "Docker Compose v2 is still not available after installation." >&2
    echo "Install the docker-compose-plugin package or update Docker Engine, then re-run this script." >&2
    exit 1
  fi
}

install_nginx() {
  if command -v nginx >/dev/null 2>&1; then
    return
  fi

  echo "Nginx is not installed. Installing Nginx for Xray fallback proxying." >&2
  install_packages nginx
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

start_nginx() {
  if command -v systemctl >/dev/null 2>&1; then
    run_as_root systemctl enable --now nginx
  elif command -v service >/dev/null 2>&1; then
    run_as_root service nginx start || run_as_root service nginx restart
  fi
}

reload_nginx() {
  if command -v systemctl >/dev/null 2>&1; then
    run_as_root systemctl reload nginx
  elif command -v service >/dev/null 2>&1; then
    run_as_root service nginx reload || run_as_root service nginx restart
  else
    run_as_root nginx -s reload
  fi
}

configure_nginx_proxy() {
  NGINX_CONF_DIR="/etc/nginx/conf.d"
  NGINX_CONF_FILE="$NGINX_CONF_DIR/ip-check.conf"
  NGINX_CONF_TMP="$TMP_DIR/ip-check.nginx.conf"

  cat > "$NGINX_CONF_TMP" <<EOF
server {
    listen 127.0.0.1:$NGINX_FALLBACK_PORT proxy_protocol;
    server_name _;

    set_real_ip_from 127.0.0.1;
    real_ip_header proxy_protocol;

    location / {
        proxy_http_version 1.1;
        proxy_pass http://127.0.0.1:$APP_PORT;

        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$proxy_protocol_addr;
        proxy_set_header X-Forwarded-For \$proxy_protocol_addr;
        proxy_set_header X-Forwarded-Proto https;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
EOF

  run_as_root mkdir -p "$NGINX_CONF_DIR"
  run_as_root cp "$NGINX_CONF_TMP" "$NGINX_CONF_FILE"
  run_as_root nginx -t
  start_nginx
  reload_nginx
}

compose() {
  if docker compose version >/dev/null 2>&1; then
    if [ -n "${COMPOSE_FILE_PATH:-}" ]; then
      docker compose -f "$COMPOSE_FILE_PATH" "$@"
    else
      docker compose "$@"
    fi
  elif run_as_root docker compose version >/dev/null 2>&1; then
    if [ -n "${COMPOSE_FILE_PATH:-}" ]; then
      run_as_root docker compose -f "$COMPOSE_FILE_PATH" "$@"
    else
      run_as_root docker compose "$@"
    fi
  elif command -v docker-compose >/dev/null 2>&1; then
    echo "Warning: falling back to legacy docker-compose. Compose v2 is recommended." >&2
    if docker-compose version >/dev/null 2>&1; then
      if [ -n "${COMPOSE_FILE_PATH:-}" ]; then
        docker-compose -f "$COMPOSE_FILE_PATH" "$@"
      else
        docker-compose "$@"
      fi
    else
      if [ -n "${COMPOSE_FILE_PATH:-}" ]; then
        run_as_root docker-compose -f "$COMPOSE_FILE_PATH" "$@"
      else
        run_as_root docker-compose "$@"
      fi
    fi
  else
    echo "Docker Compose is not available" >&2
    exit 1
  fi
}

REPO="${REPO:-$(ask_with_default "GitHub repository" "$DEFAULT_REPO")}"
INSTALL_DIR="${INSTALL_DIR:-$(ask_with_default "Install directory" "$DEFAULT_INSTALL_DIR")}"
APP_PORT="${APP_PORT:-$(ask_with_default "Public app port" "$DEFAULT_APP_PORT")}"
NGINX_FALLBACK_PORT="${NGINX_FALLBACK_PORT:-$(ask_with_default "Nginx Xray fallback port" "$DEFAULT_NGINX_FALLBACK_PORT")}"
GITHUB_TOKEN="${GITHUB_TOKEN:-$(ask_optional_secret "GitHub token for private repositories or higher API limits (optional)")}"

install_base_dependencies
install_docker
install_compose
install_nginx
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

BUNDLE_DIR="$TMP_DIR/bundle"
mkdir -p "$BUNDLE_DIR"
tar -xzf "$ARCHIVE" -C "$BUNDLE_DIR"

COMPOSE_SOURCE="$(find "$BUNDLE_DIR" -name docker-compose.yml -type f | head -n 1)"
if [ -z "$COMPOSE_SOURCE" ]; then
  echo "Could not find docker-compose.yml in the release archive" >&2
  exit 1
fi

RELEASE_DIR="$(dirname "$COMPOSE_SOURCE")"
IMAGE="ghcr.io/$(printf '%s' "$REPO" | tr '[:upper:]' '[:lower:]'):latest"
COMPOSE_FILE_PATH="$INSTALL_DIR/docker-compose.yml"
INSTALLED=0

if [ -f "$COMPOSE_FILE_PATH" ]; then
  INSTALLED=1
  echo "Existing IP Check installation found in $INSTALL_DIR. Updating it." >&2
else
  echo "No existing IP Check installation found in $INSTALL_DIR. Installing it." >&2
fi

run_as_root mkdir -p "$INSTALL_DIR"
run_as_root cp -R "$RELEASE_DIR/." "$INSTALL_DIR/"

if [ -f "$COMPOSE_FILE_PATH" ]; then
  run_as_root sed -i.bak "s#ghcr.io/OWNER/REPOSITORY:latest#$IMAGE#g" "$COMPOSE_FILE_PATH"
  run_as_root sed -i.bak 's#- "${APP_PORT:-3000}:3000"#- "127.0.0.1:${APP_PORT:-3000}:3000"#g' "$COMPOSE_FILE_PATH"
else
  echo "Could not find $COMPOSE_FILE_PATH after installing release files" >&2
  exit 1
fi

cd "$INSTALL_DIR"
export APP_PORT

compose pull || true
if [ "$INSTALLED" -eq 1 ]; then
  compose up -d --force-recreate --remove-orphans
  echo "IP Check has been updated and restarted on port $APP_PORT"
else
  compose up -d --remove-orphans
  echo "IP Check has been installed and started on port $APP_PORT"
fi

configure_nginx_proxy
compose ps
echo "Configure Xray fallback dest to 127.0.0.1:$NGINX_FALLBACK_PORT with xver: 1"
