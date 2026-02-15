#!/bin/sh
set -e

# Ensure torrents directory exists and is writable
mkdir -p /app/torrents
chmod 777 /app/torrents

# Execute the main command
exec "$@"
