#!/bin/bash
# NOTE: This script is needed 'cause the PostgreSQL docker image doesn't accepts
# creating more than one database in the env POSTGRES_DB.
# So we create the database 'visualdynamics' there, and the 'directus' database here.
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    CREATE DATABASE directus;
EOSQL