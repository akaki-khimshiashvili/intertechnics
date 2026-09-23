<?php

declare(strict_types=1);

require_once __DIR__ . '/../Config/Env.php';
require_once __DIR__ . '/../Http/Request.php';
require_once __DIR__ . '/../Http/Response.php';
require_once __DIR__ . '/../Http/RateLimiter.php';
require_once __DIR__ . '/../Exceptions/ValidationException.php';
require_once __DIR__ . '/../Repositories/AnalyticsRepository.php';
require_once __DIR__ . '/../Repositories/MachineRepository.php';

class AnalyticsController
{
    private const EVENT_TYPES = ['page_view', 'contact_click', 'phone_click'];
    private const RANGES = [7, 30, 90];

    // Public endpoint, so cap how much one client can write: 240 events per
    // 10 minutes is far above any real visitor, then 10 minutes locked out.
    private const RATE_LIMIT_BUCKET = 'analytics';
    private const MAX_EVENTS = 240;
    private const WINDOW_SECONDS = 600;
    private const LOCK_SECONDS = 600;

    private const BOT_PATTERN = '/bot|crawl|spider|slurp|preview|facebookexternalhit|headless|lighthouse|pingdom|monitor|curl|wget|python|httpclient/i';

    /** POST /analytics/events — public, anonymous. Always 204 (never tells a client why it was ignored). */
    public static function track(array $params): void
    {
        $userAgent = (string) ($_SERVER['HTTP_USER_AGENT'] ?? '');
        if ($userAgent === '' || preg_match(self::BOT_PATTERN, $userAgent)) {
            Response::json(null, 204);
        }

        $ip = Request::ip();
        RateLimiter::guard(self::RATE_LIMIT_BUCKET, $ip);
        RateLimiter::recordAttempt(self::RATE_LIMIT_BUCKET, $ip, self::MAX_EVENTS, self::WINDOW_SECONDS, self::LOCK_SECONDS);

        $body = Request::jsonBody();
        $type = $body['type'] ?? null;
        if (!is_string($type) || !in_array($type, self::EVENT_TYPES, true)) {
            throw new ValidationException('Unknown event type');
        }

        $path = self::cleanPath($body['path'] ?? null);
        $lang = in_array($body['lang'] ?? null, ['ka', 'en'], true) ? $body['lang'] : null;
        $source = is_string($body['source'] ?? null) && preg_match('/^[a-z_]{1,20}$/', $body['source'])
            ? $body['source']
            : null;

        $machineId = null;
        if ($type === 'page_view' && $path !== null && preg_match('#^/machines/([a-z0-9-]+)$#', $path, $m)) {
            $machine = MachineRepository::findBySlug($m[1]);
            $machineId = $machine !== null ? (int) $machine['id'] : null;
        }

        AnalyticsRepository::record($type, $path, $machineId, $source, $lang, self::visitorHash($ip, $userAgent));
        Response::json(null, 204);
    }

    /** GET /analytics/summary?days=7|30|90 — authenticated. */
    public static function summary(array $params): void
    {
        $days = (int) (Request::query('days') ?? 30);
        if (!in_array($days, self::RANGES, true)) {
            $days = 30;
        }

        $to = (new \DateTimeImmutable('tomorrow'));
        $from = $to->modify("-{$days} days");
        $previousFrom = $from->modify("-{$days} days");

        Response::json([
            'days' => $days,
            'totals' => AnalyticsRepository::totals($from, $to),
            'previous_totals' => AnalyticsRepository::totals($previousFrom, $from),
            'daily' => AnalyticsRepository::daily($from, $to),
            'top_machines' => AnalyticsRepository::topMachines($from, $to),
        ]);
    }

    private static function cleanPath(mixed $path): ?string
    {
        if (!is_string($path)) {
            return null;
        }
        $path = strtolower(substr($path, 0, 255));
        return preg_match('#^/[a-z0-9/_-]*$#', $path) ? $path : null;
    }

    /**
     * Anonymous per-day visitor id: HMAC of IP + user agent, keyed with a
     * secret that changes every day. Can't be reversed to an IP, and can't
     * link the same person across days.
     */
    private static function visitorHash(string $ip, string $userAgent): string
    {
        $secret = (string) (Env::get('ANALYTICS_SALT') ?: Env::get('JWT_SECRET') ?: 'intertechnics');
        $dailyKey = hash_hmac('sha256', (new \DateTimeImmutable())->format('Y-m-d'), $secret);
        return hash_hmac('sha256', $ip . '|' . $userAgent, $dailyKey);
    }
}
