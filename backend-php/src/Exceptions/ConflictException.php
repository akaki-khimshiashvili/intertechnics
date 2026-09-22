<?php

declare(strict_types=1);

require_once __DIR__ . '/ApiException.php';

class ConflictException extends ApiException
{
    public function __construct(string $message = 'Conflict')
    {
        parent::__construct($message, 409);
    }
}
