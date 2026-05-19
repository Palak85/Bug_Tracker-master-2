#!/bin/sh

echo "Running production optimizations..."

# Ensure storage and bootstrap/cache directories are writable
chmod -R 775 /var/www/html/storage
chmod -R 775 /var/www/html/bootstrap/cache

# Run database migrations automatically in production
echo "Running database migrations..."
php artisan migrate --force

# Cache config, routes, and views for lightning-fast speeds
echo "Caching configurations..."
php artisan config:cache
php artisan route:cache
php artisan view:cache
