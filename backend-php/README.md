# Backend (PHP) setup & workflow

Vanilla PHP 8.3+ API, no framework and no Composer — plain `require_once` includes (see `bootstrap.php`). Uses PDO/MySQL directly. Same architecture as the reference `kurbanchiev-dental/backend-php` project: hand-rolled JWT auth, PDO repositories, GD-based WebP conversion on upload.

## Requirements

- Docker & Docker Compose (recommended), OR PHP 8.3+ with the `pdo_mysql` and `gd` extensions enabled and a MySQL 8+ server. `gd` is optional but recommended — without it, uploaded images are stored as-is (no resize/compression).

## Docker setup (recommended for development)

    cd backend-php
    docker compose up -d --build

Apply the database schema:

    docker compose exec php php database/migrate.php

Create the admin user (defaults to username `admin`, password `admin123` if no arguments are given):

    docker compose exec php php database/create_admin.php
    # or with custom credentials:
    docker compose exec php php database/create_admin.php <username> <password>

The API will be available at http://localhost:8080.

## Configure

    cp .env.example .env
    # edit .env with your MySQL host/port/name/user/password and a strong JWT_SECRET

In Docker, `.env` is automatically loaded by the `php` service via `env_file`.

## Run the dev server (non-Docker)

    php -S localhost:8000 -t public

## API

- `GET /` — health check
- `GET /machines` — list, supports query params: `q` (search), `brand`, `category`, `condition` (`new`/`used`), `status` (`available`/`reserved`/`sold`/`all`, defaults to hiding `sold`), `featured` (`1`), `price_min`, `price_max`, `sort` (`price_asc`/`price_desc`/`oldest`), `limit`/`offset`. Returns `{data: [...], total: N}`.
- `GET /machines/filters` — distinct brands, categories, and price range, for building filter UIs.
- `GET /machines/{id-or-slug}` — single machine.
- `POST /machines`, `PUT /machines/{id}`, `DELETE /machines/{id}` — authenticated.
- `POST /uploads/image` — authenticated, multipart `file` field, returns `{url}` of a re-encoded WebP file under `/uploads/`.
- `POST /auth/login`, `GET /auth/me`, `POST /auth/logout`.

Error responses use `{"detail": "..."}` with standard HTTP status codes (400/404/409/429/500).

## Security notes

- All SQL uses PDO prepared statements; multi-statement execution is disabled on the app's PDO connection.
- Only allow-listed fields are accepted per endpoint (no mass assignment).
- `display_errors` is off; unhandled errors are logged server-side and returned as a generic 500 to clients.
- `public/.htaccess` denies serving anything outside `public/` and disables directory listing/server signature.
- Set `CORS_ALLOWED_ORIGINS` in `.env` to a comma-separated allow-list (empty disables CORS).
- In production: serve over HTTPS, use TLS to MySQL if it's remote, set `expose_php = Off` in `php.ini`, and keep `.env` out of version control (only `.env.example` is committed).
- Authentication is implemented via `POST /auth/login` returning HS256 JWT access tokens; include the token as `Authorization: Bearer <token>` on write endpoints. Read endpoints (`GET /machines`) remain public.
- Login is rate-limited (5 attempts / 15 min, then a 5 min lockout) keyed by `lowercased-username|ip`.

## Uploads → WebP

Every accepted image (jpg/jpeg/png/gif/webp) is re-encoded server-side via GD to WebP at quality 82, downscaled to a max dimension of 1920px, and saved under a random 32-hex-character filename in `public/uploads/` (GIFs pass through untouched to preserve animation). This is the authoritative conversion; the admin panel also compresses to WebP client-side before upload as an optimization, but the server always re-encodes regardless.
