#!/bin/sh
set -e

echo "⏳ Running database migrations..."
npx prisma migrate deploy

echo "🌱 Seeding database..."
npx prisma db seed || echo "⚠️  Seed skipped (may already exist)"

echo "🚀 Starting server..."
exec node dist/server.js
