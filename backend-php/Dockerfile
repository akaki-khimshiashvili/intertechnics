FROM php:8.3-fpm

RUN apt-get update && apt-get install -y --no-install-recommends \
        libjpeg62-turbo-dev \
        libpng-dev \
        libwebp-dev \
    && docker-php-ext-configure gd --with-jpeg --with-webp \
    && docker-php-ext-install pdo pdo_mysql gd \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

COPY docker/uploads.ini /usr/local/etc/php/conf.d/uploads.ini

WORKDIR /var/www/html
