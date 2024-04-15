#!/bin/sh

# Wait for PostgreSQL to become available
echo "Waiting for postgres..."
while ! nc -z postgres-cloud 5432; do
  sleep 0.1
done
echo "PostgreSQL started"

# Run Prisma migrations
npx prisma generate
npx prisma db push

# Start your application
exec npm run start
