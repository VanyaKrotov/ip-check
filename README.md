# IP Check

IP Check is a single-page SSR application for checking the current user's IP address and looking up location and network details for any IP address or domain.

The app uses data from [ip-api.com](https://ip-api.com) and displays country, region, city, coordinates, timezone, ISP, organization, ASN, reverse DNS, proxy, hosting, and mobile network signals.

## Features

- Detects the user's IP address in the browser through ip-api.com.
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

SSR renders the page shell with loading skeletons. After hydration, TanStack Query requests data directly from:

```text
http://ip-api.com/json
```

If `default_ip` or a submitted IP value is present, that target is used. Otherwise, ip-api.com detects the browser's current public IP address.

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

Example:

```sh
REPO=owner/ip-check APP_PORT=3000 ./scripts/deploy-latest-release.sh
```
or

```sh
export REPO=owner/ip-check #optional
export APP_PORT=3000 #optional. default: 80

bash <(curl -fsSL https://raw.githubusercontent.com/VanyaKrotov/ip-check/main/scripts/deploy-latest-release.sh)
```


For private repositories, pass a GitHub token:

```sh
REPO=owner/ip-check GITHUB_TOKEN=ghp_xxx ./scripts/deploy-latest-release.sh
```

Optional environment variables:

- `REPO`: GitHub repository in `owner/name` format. Required.
- `INSTALL_DIR`: target directory on the server. Defaults to `/opt/ip-check`.
- `APP_PORT`: public port exposed by Docker Compose. Defaults to `3000`.
- `GITHUB_TOKEN`: token for private repositories or higher API limits.
