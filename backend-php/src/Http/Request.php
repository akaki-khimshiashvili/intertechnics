<?php

declare(strict_types=1);

require_once __DIR__ . '/../Config/Env.php';
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

    /**
     * Client IP. X-Forwarded-For is client-controlled, so it's only honoured
     * when the direct peer is one of the proxies listed in TRUSTED_PROXIES;
     * otherwise anyone could pick a fresh "IP" per request and dodge the
     * login rate limit. With trusted proxies, the right-most hop that isn't
     * itself a trusted proxy is the real client.
     */
    public static function ip(): string
    {
        $remote = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
        $trusted = array_filter(array_map('trim', explode(',', Env::get('TRUSTED_PROXIES', '') ?? '')));
        if ($trusted === [] || !in_array($remote, $trusted, true)) {
            return $remote;
        }

        $forwarded = $_SERVER['HTTP_X_FORWARDED_FOR'] ?? '';
        $hops = is_string($forwarded) ? array_filter(array_map('trim', explode(',', $forwarded))) : [];
        foreach (array_reverse($hops) as $hop) {
            if (!in_array($hop, $trusted, true) && filter_var($hop, FILTER_VALIDATE_IP) !== false) {
                return $hop;
            }
        }
        return $remote;
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
