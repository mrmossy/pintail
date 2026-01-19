#!/bin/bash
# Stop script for Pintail development environment

set -e  # Exit on any error

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "Stopping Pintail development services..."

# Use dev compose file to stop services
docker compose -f docker-compose.yml -f docker-compose.dev.yml down

echo "Services stopped."
