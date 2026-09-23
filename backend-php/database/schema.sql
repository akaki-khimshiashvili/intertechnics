-- MySQL 8+ schema for the Intertechnics API (InnoDB, utf8mb4)

CREATE TABLE IF NOT EXISTS users (
    id             INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    username       VARCHAR(50) NOT NULL UNIQUE,
    password_hash  VARCHAR(255) NOT NULL,
    created_at     DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at     DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- One row per machine in the catalog. Only `name` is required — every spec
-- column is nullable because different machine categories need different
-- specs (a compressor has no "lift height", an asphalt plant has no "load
-- capacity"); `specs` is a JSON array of {label, value} pairs for anything
-- category-specific that doesn't have its own column, e.g. an asphalt
-- plant's "Throughput: 120 t/h". `images` is a JSON array of gallery image
-- URLs in addition to `main_image`.
CREATE TABLE IF NOT EXISTS machines (
    id                   INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    slug                 VARCHAR(220) NOT NULL UNIQUE,
    name                 VARCHAR(200) NOT NULL,
    name_en              VARCHAR(200) NULL,
    brand                VARCHAR(100) NULL,
    category             VARCHAR(100) NULL,
    model                VARCHAR(100) NULL,
    year                 SMALLINT UNSIGNED NULL,
    condition_status     ENUM('new','used') NOT NULL DEFAULT 'new',
    price                DECIMAL(12,2) NULL,
    currency             VARCHAR(10) NOT NULL DEFAULT 'USD',
    price_negotiable     TINYINT(1) NOT NULL DEFAULT 0,
    engine               VARCHAR(150) NULL,
    power_hp             DECIMAL(8,2) NULL,
    operating_weight_kg  DECIMAL(10,2) NULL,
    load_capacity_kg     DECIMAL(10,2) NULL,
    lift_height_m        DECIMAL(6,2) NULL,
    working_hours        INT UNSIGNED NULL,
    fuel_type            VARCHAR(50) NULL,
    cabin                VARCHAR(150) NULL,
    warranty             VARCHAR(150) NULL,
    description          LONGTEXT NULL,
    description_en       LONGTEXT NULL,
    specs                JSON NOT NULL DEFAULT (JSON_ARRAY()),
    main_image           VARCHAR(500) NULL,
    images                JSON NOT NULL DEFAULT (JSON_ARRAY()),
    status               ENUM('available','reserved','sold') NOT NULL DEFAULT 'available',
    featured             TINYINT(1) NOT NULL DEFAULT 0,
    meta_title           VARCHAR(255) NULL,
    meta_description     VARCHAR(500) NULL,
    created_at           DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at           DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    INDEX idx_machines_category (category),
    INDEX idx_machines_brand (brand),
    INDEX idx_machines_status (status),
    INDEX idx_machines_featured (featured),
    INDEX idx_machines_price (price)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS rate_limits (
    id                 INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    bucket             VARCHAR(40) NOT NULL,
    identifier         VARCHAR(255) NOT NULL,
    attempts           INT UNSIGNED NOT NULL DEFAULT 0,
    window_started_at  DATETIME(6) NOT NULL,
    locked_until       DATETIME(6) NULL,
    UNIQUE KEY uniq_rate_limits_bucket_identifier (bucket, identifier)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS revoked_tokens (
    jti         VARCHAR(64) NOT NULL PRIMARY KEY,
    expires_at  DATETIME(6) NOT NULL,
    revoked_at  DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    INDEX idx_revoked_tokens_expires_at (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Anonymous analytics for the admin dashboard. No cookies, no IP address, no
-- user agent is stored. visitor_hash is SHA-256(daily secret + IP + UA): it
-- can't be reversed, and because the secret changes every day the same
-- person can't be followed across days — it only lets us count unique
-- visitors per day. event_type: page_view | contact_click | phone_click.
-- path is the language-neutral route ("/", "/machines", "/machines/<slug>").
-- machine_id is set for machine detail views; no FK, so deleting a machine
-- keeps its history.
CREATE TABLE IF NOT EXISTS analytics_events (
    id            BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    event_type    VARCHAR(32) NOT NULL,
    path          VARCHAR(255) NULL,
    machine_id    INT UNSIGNED NULL,
    source        VARCHAR(20) NULL,
    lang          CHAR(2) NULL,
    visitor_hash  CHAR(64) NULL,
    created_at    DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    INDEX idx_analytics_type_created (event_type, created_at),
    INDEX idx_analytics_machine_created (machine_id, created_at),
    INDEX idx_analytics_created_visitor (created_at, visitor_hash)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
