<?php

declare(strict_types=1);

require_once __DIR__ . '/ApiException.php';

class ValidationException extends ApiException
{
    public function __construct(string $message = 'Invalid request')
    {
        parent::__construct($message, 400);
    }
}
