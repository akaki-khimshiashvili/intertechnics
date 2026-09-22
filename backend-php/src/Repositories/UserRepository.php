<?php

declare(strict_types=1);

require_once __DIR__ . '/../Config/Database.php';

class UserRepository
{
    public static function findByUsername(string $username): ?array
    {
        $stmt = Database::connection()->prepare('SELECT * FROM users WHERE username = :username');
        $stmt->execute(['username' => $username]);
        $row = $stmt->fetch();
        return $row === false ? null : $row;
    }

    public static function create(string $username, string $password): void
    {
        $hash = password_hash($password, PASSWORD_BCRYPT);
        $stmt = Database::connection()->prepare(
            'INSERT INTO users (username, password_hash) VALUES (:username, :password_hash)'
        );
        $stmt->execute(['username' => $username, 'password_hash' => $hash]);
    }

    public static function verifyPassword(array $user, string $password): bool
    {
        return password_verify($password, $user['password_hash']);
    }
}
