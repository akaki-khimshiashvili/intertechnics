<?php

declare(strict_types=1);

require_once __DIR__ . '/../Config/Env.php';
require_once __DIR__ . '/../Http/Request.php';
require_once __DIR__ . '/../Http/Response.php';
require_once __DIR__ . '/../Http/RateLimiter.php';
require_once __DIR__ . '/../Exceptions/ApiException.php';
require_once __DIR__ . '/../Exceptions/ValidationException.php';
require_once __DIR__ . '/../Support/SmtpMailer.php';

class ContactController
{
    private const TOPICS = [
        'purchase' => 'Machine purchase',
        'parts' => 'Spare parts',
        'service' => 'Service & repair',
        'other' => 'Other',
    ];

    // Public endpoint that sends real mail: 5 requests per hour per client
    // is plenty for a person, then an hour locked out.
    private const RATE_LIMIT_BUCKET = 'contact';
    private const MAX_REQUESTS = 5;
    private const WINDOW_SECONDS = 3600;
    private const LOCK_SECONDS = 3600;

    private const DEFAULT_RECIPIENT = 'intertechnicsltd@gmail.com';

    /** POST /contact — public. 204 on success. */
    public static function send(array $params): void
    {
        $body = Request::jsonBody();

        // Honeypot: a field real visitors never see. Bots that fill it get a
        // fake success so they don't learn to skip it.
        if (trim((string) ($body['website'] ?? '')) !== '') {
            Response::json(null, 204);
        }

        $ip = Request::ip();
        RateLimiter::guard(self::RATE_LIMIT_BUCKET, $ip);

        $topic = $body['topic'] ?? null;
        if (!is_string($topic) || !array_key_exists($topic, self::TOPICS)) {
            throw new ValidationException('Unknown request type');
        }

        $name = self::text($body['name'] ?? null, 100, 'name', required: true);
        $phone = self::text($body['phone'] ?? null, 30, 'phone', required: true);
        if (!preg_match('/^[+\d][\d\s()-]{4,29}$/', $phone)) {
            throw new ValidationException('Invalid phone number');
        }
        $email = self::text($body['email'] ?? null, 254, 'email');
        if ($email !== '' && filter_var($email, FILTER_VALIDATE_EMAIL) === false) {
            throw new ValidationException('Invalid email address');
        }
        $machine = self::text($body['machine'] ?? null, 120, 'machine');
        $message = self::text($body['message'] ?? null, 2000, 'message', required: true, multiline: true);
        // The work-order number shown on the form, so a reply can quote it.
        $ref = is_string($body['ref'] ?? null) && preg_match('/^IT-\d{6}-\d{4}$/', $body['ref']) ? $body['ref'] : null;

        if (!SmtpMailer::isConfigured()) {
            error_log('contact: SMTP is not configured, message not sent');
            throw new ApiException('Message could not be sent', 503);
        }

        RateLimiter::recordAttempt(self::RATE_LIMIT_BUCKET, $ip, self::MAX_REQUESTS, self::WINDOW_SECONDS, self::LOCK_SECONDS);

        $lines = [
            'Work order: ' . ($ref ?? '—'),
            'Request type: ' . self::TOPICS[$topic],
            "Name: {$name}",
            "Phone: {$phone}",
        ];
        if ($email !== '') {
            $lines[] = "Email: {$email}";
        }
        if ($machine !== '') {
            $lines[] = "Machine / model: {$machine}";
        }
        $lines[] = '';
        $lines[] = $message;
        $lines[] = '';
        $lines[] = '— Sent from the contact form on intertechnics.ge';

        try {
            SmtpMailer::send(
                Env::get('CONTACT_RECIPIENT') ?: self::DEFAULT_RECIPIENT,
                '[Website] ' . self::TOPICS[$topic] . " — {$name}" . ($ref !== null ? " ({$ref})" : ''),
                implode("\n", $lines),
                $email !== '' ? $email : null
            );
        } catch (\RuntimeException $e) {
            error_log('contact: ' . $e->getMessage());
            throw new ApiException('Message could not be sent', 503);
        }

        Response::json(null, 204);
    }

    private static function text(mixed $value, int $max, string $field, bool $required = false, bool $multiline = false): string
    {
        if ($value !== null && !is_string($value)) {
            throw new ValidationException("Invalid {$field}");
        }
        $value = trim((string) $value);
        // Drop control characters; keep line breaks only where they belong.
        $value = preg_replace($multiline ? '/[^\P{C}\n]/u' : '/\p{C}/u', '', str_replace("\r\n", "\n", $value)) ?? '';

        if ($required && $value === '') {
            throw new ValidationException("The {$field} field is required");
        }
        if (mb_strlen($value) > $max) {
            throw new ValidationException("The {$field} field is too long");
        }
        return $value;
    }
}
