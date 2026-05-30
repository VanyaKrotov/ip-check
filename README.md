# IP Check

IP Check is a single-page SSR application for checking the current user's IP address and looking up location and network details for any IP address or domain.

The app uses data from [ip-api.com](https://ip-api.com) and displays country, region, city, coordinates, timezone, ISP, organization, ASN, reverse DNS, proxy, hosting, and mobile network signals.

## Features

- Detects the user's IP address from request headers when possible.
- Supports manual lookup for any IPv4, IPv6, or domain.
- Supports `default_ip` query parameter for prefilled lookups:

```text
/?default_ip=8.8.8.8
```

- Localized UI in English, Finnish, German, Polish, and Russian.
- Defaults to English, then switches language based on the detected IP country when the user has not selected a language manually.
- Localized date formatting with `date-fns`.
- Responsive layout with light/dark theme based on browser settings.

## Tech Stack

- React + TypeScript
- React Router SSR
- Tailwind CSS + shadcn/ui-style components
- TanStack Query
- Axios
- date-fns
- i18next
- Docker + Docker Compose

## Local Development

Install dependencies:

```sh
npm install
```

Start the development server:

```sh
npm run dev
```

The app will be available at:

```text
http://localhost:5173
```

## Testing And Validation

Run TypeScript and React Router type generation:

```sh
npm run typecheck
```

Build the production bundle:

```sh
npm run build
```

Start the built SSR server:

```sh
npm run start
```

By default, the production server listens on port `3000`.

## API Behavior

SSR renders the page shell with loading skeletons. After hydration, TanStack Query requests data from the local server endpoint:

```text
/api/ip-info
```

The server route detects the client IP from request headers and requests data from:

```text
http://ip-api.com/json
```

If `default_ip` or a submitted IP value is present, that target is used. Otherwise, the app attempts to infer the client IP from:

- `cf-connecting-ip`
- `true-client-ip`
- `x-forwarded-for`
- `x-real-ip`

## Docker

Build and run with Docker Compose:

```sh
docker compose up -d --build
```

Override the public port:

```sh
APP_PORT=8080 docker compose up -d --build
```

## GitHub Actions

The repository includes two workflows:

- `.github/workflows/build.yml` runs typecheck, app build, and Docker image build. It runs on `v*` tags and can also be started manually.
- `.github/workflows/release.yml` runs on `v*` tags, builds and pushes the Docker image to GHCR, and creates a GitHub Release with a deployment archive.

Create a release by pushing a version tag:

```sh
git tag v1.0.0
git push origin v1.0.0
```

The release archive is named:

```text
ip-check-release-<tag>.tar.gz
```

## Deployment

The `scripts/deploy-latest-release.sh` script downloads the latest GitHub Release archive and starts or updates the app on an Ubuntu server with Docker installed.
If the install directory already contains `docker-compose.yml`, the script treats it as an existing installation, refreshes the release files, pulls the latest image, and recreates the container.
The script requires Docker Compose v2 (`docker compose`) because legacy `docker-compose` v1 can fail on modern Docker images with `KeyError: 'ContainerConfig'`.

Interactive usage:

```sh
bash <(curl -fsSL https://raw.githubusercontent.com/VanyaKrotov/ip-check/main/scripts/deploy-latest-release.sh)
```

Environment variables can still be used for unattended installs:

```sh
REPO=owner/ip-check APP_PORT=3001 NGINX_FALLBACK_PORT=8443 ./scripts/deploy-latest-release.sh
```

For private repositories, pass a GitHub token:

```sh
REPO=owner/ip-check GITHUB_TOKEN=ghp_xxx ./scripts/deploy-latest-release.sh
```

Optional environment variables:

- `REPO`: GitHub repository in `owner/name` format. Defaults to `VanyaKrotov/ip-check`.
- `INSTALL_DIR`: target directory on the server. Defaults to `/opt/ip-check`.
- `APP_PORT`: local host port used by Nginx to reach the Docker container. Defaults to `3001`.
- `NGINX_FALLBACK_PORT`: local Nginx port that accepts Xray fallback traffic with PROXY protocol. Defaults to `8443`.
- `GITHUB_TOKEN`: token for private repositories or higher API limits.
