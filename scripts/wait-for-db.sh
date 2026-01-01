#!/bin/bash
# Wait for PostgreSQL database to be ready
# Usage: ./scripts/wait-for-db.sh [timeout_seconds]
# Default timeout: 60 seconds

set -e

TIMEOUT=${1:-60}
HOST=${DB_HOST:-localhost}
PORT=${DB_PORT:-5440}
USER=${DB_USER:-psychpedia}
DB=${DB_NAME:-psychpedia}

echo "Waiting for PostgreSQL to be ready on ${HOST}:${PORT}..."
echo "Timeout: ${TIMEOUT} seconds"

START_TIME=$(date +%s)
ELAPSED=0

while [ $ELAPSED -lt $TIMEOUT ]; do
  # Try to connect using pg_isready if available, otherwise use nc (netcat)
  if command -v pg_isready >/dev/null 2>&1; then
    if pg_isready -h "$HOST" -p "$PORT" -U "$USER" >/dev/null 2>&1; then
      echo "✅ PostgreSQL is ready!"
      exit 0
    fi
  elif command -v nc >/dev/null 2>&1; then
    if nc -z "$HOST" "$PORT" >/dev/null 2>&1; then
      # Port is open, but verify with a simple psql query if possible
      if command -v psql >/dev/null 2>&1; then
        if PGPASSWORD="$POSTGRES_PASSWORD" psql -h "$HOST" -p "$PORT" -U "$USER" -d "$DB" -c "SELECT 1;" >/dev/null 2>&1; then
          echo "✅ PostgreSQL is ready!"
          exit 0
        fi
      else
        # Just check if port is open
        echo "✅ PostgreSQL port is open (nc check only)"
        exit 0
      fi
    fi
  else
    echo "❌ Error: Neither pg_isready nor nc (netcat) is available"
    exit 1
  fi

  ELAPSED=$(($(date +%s) - START_TIME))
  if [ $ELAPSED -lt $TIMEOUT ]; then
    echo "  Waiting... (${ELAPSED}s/${TIMEOUT}s)"
    sleep 2
  fi
done

echo "❌ Timeout: PostgreSQL did not become ready within ${TIMEOUT} seconds"
exit 1

