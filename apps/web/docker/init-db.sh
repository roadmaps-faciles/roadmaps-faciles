#!/bin/bash
set -e

# Create the licensing database alongside the main roadmaps-faciles database
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" <<-EOSQL
    CREATE DATABASE licensing;
EOSQL
