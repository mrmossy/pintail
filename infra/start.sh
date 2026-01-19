#!/bin/bash
# Start script for Pintail development environment

set -e  # Exit on any error

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "Starting Pintail development services..."

# Add the dev compose file for local development
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d --build

echo "Services started! Access points:"
echo "- Chat Service: http://localhost:3000"
echo "- Budibase Dashboard: http://localhost:8080"
echo "- N8N: http://localhost:5678"
echo "- PostgreSQL: localhost:5432"
