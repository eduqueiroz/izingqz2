#!/bin/bash

# Obtém o diretório raiz do projeto, assumindo que o script está na pasta 'backend'
PROJECT_ROOT="$(dirname $(pwd))"

echo "Starting backend updates..."
cd "$PROJECT_ROOT/backend"
npm install --force
echo "Backend dependencies installed."
npx sequelize db:migrate
echo "Database migration completed."
npx sequelize db:seed:all
echo "Database seeding completed."

echo "Starting frontend updates..."
cd "$PROJECT_ROOT/frontend"
npm install --force
echo "Frontend dependencies installed."
export NODE_OPTIONS=--openssl-legacy-provider
npx quasar build -P -m pwa
echo "Frontend build completed."

echo "Restarting all services..."
pm2 restart all
echo "All services restarted successfully."
