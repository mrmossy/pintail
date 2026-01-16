#!/bin/bash
set -e

psql -U postgres -d postgres <<EOF
-- Create application database and user
CREATE DATABASE "pintail-app";
CREATE USER app_user WITH ENCRYPTED PASSWORD 'app_password';
ALTER DATABASE "pintail-app" OWNER TO app_user;

-- Create n8n database and user
CREATE DATABASE "pintail-n8n";
CREATE USER n8n_user WITH ENCRYPTED PASSWORD 'n8n_password';
ALTER DATABASE "pintail-n8n" OWNER TO n8n_user;
EOF
