#!/bin/bash

# Database Refresh Script
# This script downloads the production database and restores it locally
# Usage: pnpm db:refresh (from apps/front-office directory)

set -e  # Exit on any error

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🔄 Starting database refresh from production...${NC}\n"

# Check for required tools
command -v pg_dump >/dev/null 2>&1 || { echo -e "${RED}Error: pg_dump is not installed. Please install PostgreSQL client tools.${NC}" >&2; exit 1; }
command -v psql >/dev/null 2>&1 || { echo -e "${RED}Error: psql is not installed. Please install PostgreSQL client tools.${NC}" >&2; exit 1; }

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

# Check if .env files exist
if [ ! -f "$PROJECT_DIR/.env" ]; then
    echo -e "${RED}Error: .env file not found at $PROJECT_DIR/.env${NC}"
    exit 1
fi

if [ ! -f "$PROJECT_DIR/.env.production" ]; then
    echo -e "${RED}Error: .env.production file not found at $PROJECT_DIR/.env.production${NC}"
    exit 1
fi

# Load environment variables
echo -e "${YELLOW}📋 Loading environment variables...${NC}"
export $(grep -v '^#' "$PROJECT_DIR/.env" | grep DATABASE_URL | xargs)
LOCAL_DATABASE_URL="$DATABASE_URL"

export $(grep -v '^#' "$PROJECT_DIR/.env.production" | grep DATABASE_URL | xargs)
PROD_DATABASE_URL="$DATABASE_URL"

if [ -z "$LOCAL_DATABASE_URL" ]; then
    echo -e "${RED}Error: DATABASE_URL not found in .env${NC}"
    exit 1
fi

if [ -z "$PROD_DATABASE_URL" ]; then
    echo -e "${RED}Error: DATABASE_URL not found in .env.production${NC}"
    exit 1
fi

# Extract database name from local URL for drop/create operations
# Format: postgresql://user:pass@host:port/dbname
LOCAL_DB_NAME=$(echo "$LOCAL_DATABASE_URL" | sed -E 's|.*://[^/]*/([^?]*).*|\1|')

if [ -z "$LOCAL_DB_NAME" ]; then
    echo -e "${RED}Error: Could not extract database name from LOCAL_DATABASE_URL${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Local database: $LOCAL_DB_NAME${NC}"

# Create temporary file for database backup
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
TEMP_BACKUP="/tmp/prod-db-backup-$TIMESTAMP.sql"

echo -e "\n${YELLOW}📥 Exporting production database...${NC}"
pg_dump -d "$PROD_DATABASE_URL" -f "$TEMP_BACKUP" --no-owner --no-acl

if [ ! -f "$TEMP_BACKUP" ]; then
    echo -e "${RED}Error: Failed to create database backup${NC}"
    exit 1
fi

BACKUP_SIZE=$(du -h "$TEMP_BACKUP" | cut -f1)
echo -e "${GREEN}✓ Production database exported ($BACKUP_SIZE)${NC}"

# Extract connection details for database operations (for drop/create we need to connect to 'postgres' db)
# Build a connection string to the postgres database
# If the target database IS 'postgres', we'll connect to 'template1' instead
if [ "$LOCAL_DB_NAME" = "postgres" ]; then
    ADMIN_URL=$(echo "$LOCAL_DATABASE_URL" | sed -E "s|/[^/]*(\?.*)?$|/template1\1|")
else
    ADMIN_URL=$(echo "$LOCAL_DATABASE_URL" | sed -E "s|/[^/]*(\?.*)?$|/postgres\1|")
fi

echo -e "\n${YELLOW}🔌 Terminating existing connections to '$LOCAL_DB_NAME'...${NC}"
psql -d "$ADMIN_URL" -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '$LOCAL_DB_NAME' AND pid <> pg_backend_pid();" 2>/dev/null || true

echo -e "${YELLOW}🗑️  Dropping local database '$LOCAL_DB_NAME' (if exists)...${NC}"
psql -d "$ADMIN_URL" -c "DROP DATABASE IF EXISTS \"$LOCAL_DB_NAME\";" 2>/dev/null || true

echo -e "${YELLOW}🆕 Creating fresh local database '$LOCAL_DB_NAME'...${NC}"
psql -d "$ADMIN_URL" -c "CREATE DATABASE \"$LOCAL_DB_NAME\";"

echo -e "\n${YELLOW}📤 Restoring production data to local database...${NC}"
psql -d "$LOCAL_DATABASE_URL" -f "$TEMP_BACKUP" -q

echo -e "\n${YELLOW}🧹 Cleaning up temporary files...${NC}"
rm "$TEMP_BACKUP"

echo -e "\n${GREEN}✅ Database refresh complete!${NC}"
echo -e "${GREEN}Your local database now contains a copy of production data.${NC}\n"

