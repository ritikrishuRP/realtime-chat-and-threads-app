#!/bin/sh
set -e

run_migrations() {
  echo "▶ Running migrations..."
  node /app/dist/db/migrate.js
}

run_seed() {
  echo "▶ Seeding database..."
  node /app/dist/scripts/seed/index.js
}

case "$1" in
  migrate-only)
    run_migrations
    exit 0
    ;;
  seed-only)
    run_seed
    exit 0
    ;;
  migrate-and-seed)
    run_migrations
    run_seed
    exit 0
    ;;
  *)
    # Default startup path
    run_migrations
    if [ "$RUN_SEED" = "true" ]; then
      run_seed
    else
      echo "▶ Skipping seed (RUN_SEED != true)"
    fi
    exec node /app/dist/server.js
    ;;
esac