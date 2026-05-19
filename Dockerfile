# Use a highly optimized, fully pre-configured PHP + Nginx image
FROM richarvey/nginx-php-fpm:3.1.6

# Set working directory
WORKDIR /var/www/html

# Copy the entire codebase into the container
COPY . /var/www/html

# Configure Environment Variables for richarvey image
ENV WEBROOT /var/www/html/public
ENV APP_ENV production
ENV APP_DEBUG false
ENV SKIP_COMPOSER 0

# Expose port 80
EXPOSE 80

# Make sure our startup scripts are executable
RUN chmod +x /var/www/html/scripts/00-laravel-deploy.sh
