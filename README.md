# Pintail Project & Automation Platform

Infrastructure and services for Pintail Property Management projects and automation workflows.

## Components and services
- Traefik reverse proxy with Lets Encrypt (prod).
- n8n workflow automation.
- Budibase admin/dashboard UI.
- Chat Service: Express API + embeddable widget, OpenAI-powered, SSE streaming.
- PostgreSQL: provided in development via Docker Compose; external in production.

## Repository layout
- `infra/` Docker Compose files, start/stop scripts, env sample, backups.
- `apps/chat-service/` Chat API + widget source and Dockerfile.
- `workflows/` n8n workflow exports (JSON).
- `runtime/` Runtime data (Traefik certs, backups).

## Requirements
- Docker + Docker Compose.
- For production backups: AWS CLI credentials with access to the backup bucket.

## Configuration
1. Copy the sample env file:
   ```bash
   cp infra/env-sample infra/.env
   ```
2. Update required values in `infra/.env`, especially:
   - `OPENAI_API_KEY`
   - `N8N_ENCRYPTION_KEY`
   - `BB_ADMIN_USER_EMAIL`, `BB_ADMIN_USER_PASSWORD`
   - `CHAT_SERVICE_HOSTNAME`, `N8N_HOSTNAME`, `BUDIBASE_HOSTNAME`
3. Chat Service runtime config (system prompt, model, history) lives in
   `apps/chat-service/config/config.json`. You can override the path with
   `CONFIG_PATH` in the container environment if needed.

## Local development (Docker)
The dev stack uses `docker-compose.yml` plus `docker-compose.dev.yml`, which
adds a local PostgreSQL container and exposes service ports.

Start:
```bash
./infra/start.sh
```

Stop:
```bash
./infra/stop.sh
```

Dev endpoints after `start.sh`:
- Chat Service: `http://localhost:3000`
- Chat Widget test page: `http://localhost:3000/widget/test.html`
- Budibase: `http://localhost:8080`
- n8n: `http://localhost:5678`
- PostgreSQL: `localhost:5432`

## Production deployment
Production uses `infra/docker-compose.yml` (no built-in Postgres). You will
need production Postgres instances for both the app and n8n.

1. Prepare a production `.env` with:
   - External Postgres hosts/credentials for app + n8n.
   - Valid `N8N_HOSTNAME`, `CHAT_SERVICE_HOSTNAME`, `BUDIBASE_HOSTNAME`.
   - `N8N_PROTOCOL=https` and `WEBHOOK_URL` matching the public URL.
2. Ensure DNS for those hostnames points to the server.
3. Open ports 80 and 443 for Traefik and Lets Encrypt.
4. Start services:
   ```bash
   docker compose -f infra/docker-compose.yml up -d --build
   ```

Traefik stores certs in `runtime/traefik-data`.

## Workflows
The `workflows/` directory contains n8n workflow exports that can be imported
into n8n. Notable flows:
- `99.01-rent-manager-api-request.json` (RentManager API token handling)
- `01-get-open-service-manager-issues.json` (example workflow)

## Backups (production)
`infra/backup.sh` backs up n8n and Budibase volumes to S3 and prunes old
backups. It assumes a server layout under `/home/ubuntu/pintail` and uses
`runtime/backups` for local archives. Update the script if your layout or
bucket differs.

