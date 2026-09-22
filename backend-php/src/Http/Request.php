<?php

declare(strict_types=1);

require_once __DIR__ . '/../Exceptions/ValidationException.php';

class Request
{
    private static ?array $cachedJsonBody = null;
    private static bool $jsonBodyParsed = false;

    public static function method(): string
    {
        return $_SERVER['REQUEST_METHOD'] ?? 'GET';
    }

    public static function path(): string
    {
        $uri = $_SERVER['REQUEST_URI'] ?? '/';
        $path = parse_url($uri, PHP_URL_PATH);
        return $path === false || $path === null ? '/' : $path;
    }

    public static function query(string $key, ?string $default = null): ?string
    {
        $value = $_GET[$key] ?? null;
        if (!is_string($value) || trim($value) === '') {
            return $default;
        }
        return $value;
    }

    public static function ip(): string
    {
        $forwarded = $_SERVER['HTTP_X_FORWARDED_FOR'] ?? null;
        if (is_string($forwarded) && trim($forwarded) !== '') {
            $first = trim(explode(',', $forwarded)[0]);
            if ($first !== '') {
                return $first;
            }
        }
        return $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    }

    public static function jsonBody(): array
    {
        if (self::$jsonBodyParsed) {
            return self::$cachedJsonBody ?? [];
        }
        self::$jsonBodyParsed = true;

        $raw = file_get_contents('php://input') ?: '';
        if (trim($raw) === '') {
            self::$cachedJsonBody = [];
            return [];
        }

        try {
            $decoded = json_decode($raw, true, 16, JSON_THROW_ON_ERROR);
        } catch (\JsonException) {
            throw new ValidationException('Request body must be valid JSON');
        }

        if (!is_array($decoded)) {
            throw new ValidationException('Request body must be a JSON object');
        }

        self::$cachedJsonBody = $decoded;
        return $decoded;
    }
}
