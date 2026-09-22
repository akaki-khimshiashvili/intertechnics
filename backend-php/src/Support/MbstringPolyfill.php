<?php

declare(strict_types=1);

if (!function_exists('mb_strlen')) {
    function mb_strlen(string $string, ?string $encoding = null): int
    {
        $count = preg_match_all('/./us', $string);
        return $count === false ? strlen($string) : $count;
    }
}
if (!function_exists('mb_check_encoding')) {
    function mb_check_encoding(?string $value = null, ?string $encoding = null): bool
    {
        if ($value === null || $value === '') {
            return true;
        }
        if ($encoding !== null && strtoupper($encoding) === 'ASCII') {
            return preg_match('/^[\x00-\x7F]*$/', $value) === 1;
        }
        return preg_match('//u', $value) === 1;
    }
}
if (!function_exists('mb_strtolower')) {
    function mb_strtolower(string $string, ?string $encoding = null): string
    {
        return strtolower($string);
    }
}
