<?php

declare(strict_types=1);

require_once __DIR__ . '/../Exceptions/ValidationException.php';

/** Minimal HS256 JWT implementation using only PHP builtins (no Composer). */
class Jwt
{
    public static function encode(array $payload, string $secret, int $ttlSeconds = 86400): string
    {
        $header = ['alg' => 'HS256', 'typ' => 'JWT'];
        $now = time();
        $payload['iat'] = $now;
        $payload['exp'] = $now + $ttlSeconds;
        $payload['jti'] = bin2hex(random_bytes(16));

        $segments = [
            self::base64UrlEncode(json_encode($header, JSON_THROW_ON_ERROR)),
            self::base64UrlEncode(json_encode($payload, JSON_THROW_ON_ERROR)),
        ];

        $signature = hash_hmac('sha256', implode('.', $segments), $secret, true);
        $segments[] = self::base64UrlEncode($signature);

        return implode('.', $segments);
    }

    public static function decode(string $token, string $secret): array
    {
        $parts = explode('.', $token);
        if (count($parts) !== 3) {
            throw new ValidationException('Invalid token format');
        }

        [$headerB64, $payloadB64, $signatureB64] = $parts;

        $header = json_decode(self::base64UrlDecode($headerB64), true, 16, JSON_THROW_ON_ERROR);
        if (!is_array($header) || ($header['alg'] ?? null) !== 'HS256' || ($header['typ'] ?? null) !== 'JWT') {
            throw new ValidationException('Invalid token algorithm');
        }

        $expected = self::base64UrlEncode(
            hash_hmac('sha256', "{$headerB64}.{$payloadB64}", $secret, true)
        );
        if (!hash_equals($expected, $signatureB64)) {
            throw new ValidationException('Invalid token signature');
        }

        $payload = json_decode(self::base64UrlDecode($payloadB64), true, 16, JSON_THROW_ON_ERROR);
        if (!is_array($payload)) {
            throw new ValidationException('Invalid token payload');
        }

        if (isset($payload['exp']) && $payload['exp'] < time()) {
            throw new ValidationException('Token expired');
        }

        return $payload;
    }

    private static function base64UrlEncode(string $data): string
    {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }

    private static function base64UrlDecode(string $data): string
    {
        $padding = 4 - (strlen($data) % 4);
        if ($padding !== 4) {
            $data .= str_repeat('=', $padding);
        }
        return base64_decode(strtr($data, '-_', '+/'));
    }
}
