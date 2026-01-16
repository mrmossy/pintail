#!/bin/bash
# Stop script for Pintail development environment

set -e  # Exit on any error

echo "Stopping Pintail development services..."

# Use dev compose file to stop services
docker compose -f docker-compose.yml -f docker-compose.dev.yml down

echo "Services stopped."