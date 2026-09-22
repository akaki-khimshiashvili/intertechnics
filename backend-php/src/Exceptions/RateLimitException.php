<?php

declare(strict_types=1);

require_once __DIR__ . '/ApiException.php';

class RateLimitException extends ApiException
{
    public function __construct(string $message, private readonly int $retryAfterSeconds)
    {
        parent::__construct($message, 429);
    }

    public function getRetryAfterSeconds(): int
    {
        return $this->retryAfterSeconds;
    }
}
