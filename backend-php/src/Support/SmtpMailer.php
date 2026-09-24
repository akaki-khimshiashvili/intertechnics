<?php

declare(strict_types=1);

require_once __DIR__ . '/../Config/Env.php';

/**
 * Minimal SMTP client for plain-text UTF-8 mail -- enough for the contact
 * form, without a Composer dependency. Port 465 uses implicit TLS, anything
 * else upgrades with STARTTLS; authenticates with AUTH LOGIN.
 *
 * Configured from SMTP_HOST / SMTP_PORT / SMTP_USER / SMTP_PASS / SMTP_FROM.
 */
class SmtpMailer
{
    private const TIMEOUT_SECONDS = 15;

    /** @var resource|null */
    private $socket = null;

    public static function isConfigured(): bool
    {
        return (Env::get('SMTP_HOST') ?? '') !== ''
            && (Env::get('SMTP_USER') ?? '') !== ''
            && (Env::get('SMTP_PASS') ?? '') !== '';
    }

    /** Throws \RuntimeException on any SMTP failure. */
    public static function send(string $to, string $subject, string $body, ?string $replyTo = null): void
    {
        (new self())->deliver($to, $subject, $body, $replyTo);
    }

    private function deliver(string $to, string $subject, string $body, ?string $replyTo): void
    {
        $host = (string) Env::get('SMTP_HOST');
        $port = (int) (Env::get('SMTP_PORT') ?: 587);
        $user = (string) Env::get('SMTP_USER');
        $pass = (string) Env::get('SMTP_PASS');
        $from = (string) (Env::get('SMTP_FROM') ?: $user);

        $remote = ($port === 465 ? 'ssl://' : 'tcp://') . "{$host}:{$port}";
        $socket = @stream_socket_client($remote, $errno, $errstr, self::TIMEOUT_SECONDS);
        if ($socket === false) {
            throw new \RuntimeException("SMTP connect failed: {$errstr} ({$errno})");
        }
        $this->socket = $socket;
        stream_set_timeout($socket, self::TIMEOUT_SECONDS);

        try {
            $this->expect(220);
            $this->command('EHLO ' . self::ehloName(), 250);

            if ($port !== 465) {
                $this->command('STARTTLS', 220);
                if (!stream_socket_enable_crypto($socket, true, STREAM_CRYPTO_METHOD_TLS_CLIENT)) {
                    throw new \RuntimeException('SMTP STARTTLS failed');
                }
                $this->command('EHLO ' . self::ehloName(), 250);
            }

            $this->command('AUTH LOGIN', 334);
            $this->command(base64_encode($user), 334);
            $this->command(base64_encode($pass), 235);

            $this->command('MAIL FROM:<' . self::address($from) . '>', 250);
            $this->command('RCPT TO:<' . self::address($to) . '>', [250, 251]);
            $this->command('DATA', 354);

            $this->write(self::message($from, $to, $subject, $body, $replyTo) . "\r\n.");
            $this->expect(250);
            $this->command('QUIT', 221);
        } finally {
            fclose($socket);
            $this->socket = null;
        }
    }

    private static function message(string $from, string $to, string $subject, string $body, ?string $replyTo): string
    {
        $headers = [
            'Date: ' . date(DATE_RFC2822),
            'From: Intertechnics website <' . self::address($from) . '>',
            'To: <' . self::address($to) . '>',
            'Subject: =?UTF-8?B?' . base64_encode(self::oneLine($subject)) . '?=',
            'Message-ID: <' . bin2hex(random_bytes(16)) . '@' . self::ehloName() . '>',
            'MIME-Version: 1.0',
            'Content-Type: text/plain; charset=UTF-8',
            'Content-Transfer-Encoding: base64',
        ];
        if ($replyTo !== null && $replyTo !== '') {
            $headers[] = 'Reply-To: <' . self::address($replyTo) . '>';
        }

        // Base64 lines never start with ".", so no dot-stuffing is needed.
        $encoded = rtrim(chunk_split(base64_encode($body), 76, "\r\n"));
        return implode("\r\n", $headers) . "\r\n\r\n" . $encoded;
    }

    /** @param int|int[] $expected */
    private function command(string $line, int|array $expected): void
    {
        $this->write($line);
        $this->expect($expected);
    }

    private function write(string $data): void
    {
        if (fwrite($this->socket, $data . "\r\n") === false) {
            throw new \RuntimeException('SMTP write failed');
        }
    }

    /** @param int|int[] $expected */
    private function expect(int|array $expected): void
    {
        $response = '';
        // Multi-line replies use "250-..." continuation lines; the last has "250 ...".
        while (($line = fgets($this->socket, 515)) !== false) {
            $response .= $line;
            if (strlen($line) < 4 || $line[3] !== '-') {
                break;
            }
        }

        $code = (int) substr($response, 0, 3);
        if (!in_array($code, (array) $expected, true)) {
            throw new \RuntimeException('SMTP unexpected reply: ' . trim($response));
        }
    }

    /** Strips anything that could break out of an address or header line. */
    private static function address(string $email): string
    {
        return preg_replace('/[\r\n<>\s]+/', '', $email) ?? '';
    }

    private static function oneLine(string $value): string
    {
        return trim(preg_replace('/[\r\n]+/', ' ', $value) ?? '');
    }

    private static function ehloName(): string
    {
        $name = preg_replace('/[^A-Za-z0-9.-]/', '', (string) ($_SERVER['SERVER_NAME'] ?? ''));
        return $name !== '' ? $name : 'localhost';
    }
}
