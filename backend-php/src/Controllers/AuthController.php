<?php

declare(strict_types=1);

require_once __DIR__ . '/../Http/Request.php';
require_once __DIR__ . '/../Http/Response.php';
require_once __DIR__ . '/../Http/AuthMiddleware.php';
require_once __DIR__ . '/../Http/RateLimiter.php';
require_once __DIR__ . '/../Config/Jwt.php';
require_once __DIR__ . '/../Exceptions/ValidationException.php';
require_once __DIR__ . '/../Repositories/UserRepository.php';
require_once __DIR__ . '/../Repositories/RevokedTokenRepository.php';

class AuthController
{
    private const RATE_LIMIT_BUCKET = 'login';
    private const MAX_ATTEMPTS = 5;
    private const WINDOW_SECONDS = 900;
    private const LOCK_SECONDS = 300;

    // Second, IP-independent bucket per username, so rotating source IPs
    // can't turn the per-IP limit into unlimited guesses against one account.
    private const USER_BUCKET = 'login_user';
    private const USER_MAX_ATTEMPTS = 20;
    private const USER_WINDOW_SECONDS = 3600;
    private const USER_LOCK_SECONDS = 900;

    public static function login(array $params): void
    {
        $body = Request::jsonBody();
        $username = $body['username'] ?? '';
        $password = $body['password'] ?? '';

        if (!is_string($username) || !is_string($password) || trim($username) === '' || trim($password) === '') {
            throw new ValidationException('username and password are required');
        }

        $identifier = self::rateLimitIdentifier($username);
        $userIdentifier = strtolower(trim($username));
        RateLimiter::guard(self::RATE_LIMIT_BUCKET, $identifier);
        RateLimiter::guard(self::USER_BUCKET, $userIdentifier);

        $user = UserRepository::findByUsername($username);
        if ($user === null || !UserRepository::verifyPassword($user, $password)) {
            RateLimiter::recordAttempt(
                self::RATE_LIMIT_BUCKET,
                $identifier,
                self::MAX_ATTEMPTS,
                self::WINDOW_SECONDS,
                self::LOCK_SECONDS
            );
            RateLimiter::recordAttempt(
                self::USER_BUCKET,
                $userIdentifier,
                self::USER_MAX_ATTEMPTS,
                self::USER_WINDOW_SECONDS,
                self::USER_LOCK_SECONDS
            );
            throw new ValidationException('Invalid username or password');
        }

        RateLimiter::reset(self::RATE_LIMIT_BUCKET, $identifier);
        RateLimiter::reset(self::USER_BUCKET, $userIdentifier);

        $secret = Env::get('JWT_SECRET');
        if ($secret === null || $secret === '') {
            throw new \RuntimeException('JWT_SECRET is not configured');
        }

        $token = Jwt::encode(['sub' => (int) $user['id'], 'username' => $user['username']], $secret);
        Response::json(['access_token' => $token, 'token_type' => 'bearer']);
    }

    public static function me(array $params): void
    {
        $claims = AuthMiddleware::authenticate();
        Response::json(['id' => $claims['sub'], 'username' => $claims['username']]);
    }

    public static function logout(array $params): void
    {
        $claims = AuthMiddleware::authenticate();
        if (isset($claims['jti'], $claims['exp']) && is_string($claims['jti'])) {
            RevokedTokenRepository::revoke($claims['jti'], (int) $claims['exp']);
        }
        Response::json(['message' => 'Logged out']);
    }

    private static function rateLimitIdentifier(string $username): string
    {
        return strtolower(trim($username)) . '|' . Request::ip();
    }
}
