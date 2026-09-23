<?php

declare(strict_types=1);

require_once __DIR__ . '/../Config/Env.php';
require_once __DIR__ . '/../Config/Jwt.php';
require_once __DIR__ . '/../Exceptions/ValidationException.php';
require_once __DIR__ . '/../Repositories/RevokedTokenRepository.php';

class AuthMiddleware
{
    public static function authenticate(): array
    {
        $header = $_SERVER['HTTP_AUTHORIZATION']
            ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION']
            ?? (function_exists('apache_request_headers') ? (apache_request_headers()['Authorization'] ?? '') : '');

        if (str_starts_with($header, 'Bearer ')) {
            $token = substr($header, 7);
        } else {
            // Fallback for shared hosts that strip the Authorization header before
            // PHP ever sees it, even with the .htaccess workarounds: a custom
            // X-Auth-Token header (not stripped), or a `token` POST field. Never the
            // query string — URLs end up in access/proxy logs, leaking the token.
            $fallback = $_SERVER['HTTP_X_AUTH_TOKEN'] ?? $_POST['token'] ?? null;
            if (!is_string($fallback) || $fallback === '') {
                throw new ValidationException('Missing or invalid Authorization header');
            }
            $token = $fallback;
        }

        $secret = Env::get('JWT_SECRET');
        if ($secret === null || $secret === '') {
            throw new \RuntimeException('JWT_SECRET is not configured');
        }

        $claims = Jwt::decode($token, $secret);

        if (isset($claims['jti']) && is_string($claims['jti']) && RevokedTokenRepository::isRevoked($claims['jti'])) {
            throw new ValidationException('Token has been revoked');
        }

        return $claims;
    }
}
