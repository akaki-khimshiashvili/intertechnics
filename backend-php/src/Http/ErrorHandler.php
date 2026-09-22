<?php

declare(strict_types=1);

require_once __DIR__ . '/../Exceptions/ApiException.php';
require_once __DIR__ . '/../Exceptions/RateLimitException.php';
require_once __DIR__ . '/Response.php';

class ErrorHandler
{
    public static function register(): void
    {
        set_error_handler(static function (int $severity, string $message, string $file, int $line): bool {
            if (!(error_reporting() & $severity)) {
                return false;
            }
            throw new \ErrorException($message, 0, $severity, $file, $line);
        });

        set_exception_handler([self::class, 'handle']);
    }

    public static function handle(\Throwable $e): void
    {
        if ($e instanceof RateLimitException) {
            header('Retry-After: ' . $e->getRetryAfterSeconds());
            Response::json(
                ['detail' => $e->getMessage(), 'retry_after' => $e->getRetryAfterSeconds()],
                $e->getStatusCode()
            );
        }

        if ($e instanceof ApiException) {
            Response::json(['detail' => $e->getMessage()], $e->getStatusCode());
        }

        error_log((string) $e);
        Response::json(['detail' => 'Internal server error'], 500);
    }
}
