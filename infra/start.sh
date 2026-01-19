#!/bin/bash
# Start script for Pintail development environment

set -e  # Exit on any error

# Require explicit confirmation
echo "⚠️  WARNING: This is a DEVELOPMENT-ONLY script!"
echo "Are you sure you're running this in a development environment? (type 'dev' to continue)"
read -r confirmation
if [[ "$confirmation" != "dev" ]]; then
    echo "Script execution cancelled."
    exit 1
fi

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
