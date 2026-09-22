<?php

declare(strict_types=1);

require_once __DIR__ . '/../Config/Database.php';

class RevokedTokenRepository
{
    public static function isRevoked(string $jti): bool
    {
        $stmt = Database::connection()->prepare('SELECT 1 FROM revoked_tokens WHERE jti = :jti');
        $stmt->execute(['jti' => $jti]);
        return $stmt->fetch() !== false;
    }

    public static function revoke(string $jti, int $expiresAtTimestamp): void
    {
        $expiresAt = (new \DateTimeImmutable('@' . $expiresAtTimestamp))->format('Y-m-d H:i:s');

        $stmt = Database::connection()->prepare(
            'INSERT INTO revoked_tokens (jti, expires_at) VALUES (:jti, :expires_at)
             ON DUPLICATE KEY UPDATE expires_at = :new_expires_at'
        );
        $stmt->execute(['jti' => $jti, 'expires_at' => $expiresAt, 'new_expires_at' => $expiresAt]);

        Database::connection()->exec('DELETE FROM revoked_tokens WHERE expires_at < NOW()');
    }
}
