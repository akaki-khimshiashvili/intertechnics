<?php

declare(strict_types=1);

require_once __DIR__ . '/../Config/Database.php';

class RateLimitRepository
{
    public static function find(string $bucket, string $identifier): ?array
    {
        $stmt = Database::connection()->prepare(
            'SELECT * FROM rate_limits WHERE bucket = :bucket AND identifier = :identifier'
        );
        $stmt->execute(['bucket' => $bucket, 'identifier' => $identifier]);
        $row = $stmt->fetch();
        return $row === false ? null : $row;
    }

    public static function upsert(
        string $bucket,
        string $identifier,
        int $attempts,
        string $windowStartedAt,
        ?string $lockedUntil
    ): void {
        $stmt = Database::connection()->prepare(
            'INSERT INTO rate_limits (bucket, identifier, attempts, window_started_at, locked_until)
             VALUES (:bucket, :identifier, :attempts, :window_started_at, :locked_until)
             ON DUPLICATE KEY UPDATE
                attempts = :new_attempts,
                window_started_at = :new_window_started_at,
                locked_until = :new_locked_until'
        );
        $stmt->execute([
            'bucket' => $bucket,
            'identifier' => $identifier,
            'attempts' => $attempts,
            'window_started_at' => $windowStartedAt,
            'locked_until' => $lockedUntil,
            'new_attempts' => $attempts,
            'new_window_started_at' => $windowStartedAt,
            'new_locked_until' => $lockedUntil,
        ]);
    }

    public static function reset(string $bucket, string $identifier): void
    {
        $stmt = Database::connection()->prepare(
            'DELETE FROM rate_limits WHERE bucket = :bucket AND identifier = :identifier'
        );
        $stmt->execute(['bucket' => $bucket, 'identifier' => $identifier]);
    }
}
