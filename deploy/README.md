# IP Check deployment bundle

This folder is packed into each GitHub release together with the Dockerfile and compose file.

Before running on a server, replace `ghcr.io/OWNER/REPOSITORY:latest` in `docker-compose.yml` with the image published by the release workflow, or let `scripts/deploy-latest-release.sh` patch it automatically.
