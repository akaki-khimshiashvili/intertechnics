<?php

declare(strict_types=1);

require_once __DIR__ . '/../Repositories/RateLimitRepository.php';
require_once __DIR__ . '/../Exceptions/RateLimitException.php';

class RateLimiter
{
    public static function guard(string $bucket, string $identifier): void
    {
        $row = RateLimitRepository::find($bucket, $identifier);
        if ($row === null || $row['locked_until'] === null) {
            return;
        }

        $lockedUntil = new \DateTimeImmutable($row['locked_until']);
        $now = new \DateTimeImmutable();
        if ($lockedUntil > $now) {
            throw new RateLimitException(
                'Too many attempts. Please try again later.',
                max(1, $lockedUntil->getTimestamp() - $now->getTimestamp())
            );
        }
    }

    public static function recordAttempt(
        string $bucket,
        string $identifier,
        int $maxAttempts,
        int $windowSeconds,
        int $lockSeconds
    ): void {
        $now = new \DateTimeImmutable();
        $row = RateLimitRepository::find($bucket, $identifier);

        if ($row === null) {
            $attempts = 1;
            $windowStart = $now;
        } else {
            $windowStart = new \DateTimeImmutable($row['window_started_at']);
            $windowExpired = ($now->getTimestamp() - $windowStart->getTimestamp()) > $windowSeconds;
            if ($windowExpired) {
                $attempts = 1;
                $windowStart = $now;
            } else {
                $attempts = (int) $row['attempts'] + 1;
            }
        }

        $lockedUntil = null;
        if ($attempts >= $maxAttempts) {
            $lockedUntil = $now->modify("+{$lockSeconds} seconds");
            $attempts = 0;
        }

        RateLimitRepository::upsert(
            $bucket,
            $identifier,
            $attempts,
            $windowStart->format('Y-m-d H:i:s.u'),
            $lockedUntil?->format('Y-m-d H:i:s.u')
        );
    }

    public static function reset(string $bucket, string $identifier): void
    {
        RateLimitRepository::reset($bucket, $identifier);
    }
}
