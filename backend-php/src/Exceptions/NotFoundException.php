<?php

declare(strict_types=1);

require_once __DIR__ . '/ApiException.php';

class NotFoundException extends ApiException
{
    public function __construct(string $message = 'Not found')
    {
        parent::__construct($message, 404);
    }
}
