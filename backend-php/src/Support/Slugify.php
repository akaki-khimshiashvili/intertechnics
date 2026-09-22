<?php

declare(strict_types=1);

/** Turns a machine name (Latin and/or Georgian) into a URL-safe slug. */
class Slugify
{
    private const GEORGIAN_MAP = [
        'ა' => 'a', 'ბ' => 'b', 'გ' => 'g', 'დ' => 'd', 'ე' => 'e', 'ვ' => 'v',
        'ზ' => 'z', 'თ' => 't', 'ი' => 'i', 'კ' => 'k', 'ლ' => 'l', 'მ' => 'm',
        'ნ' => 'n', 'ო' => 'o', 'პ' => 'p', 'ჟ' => 'zh', 'რ' => 'r', 'ს' => 's',
        'ტ' => 't', 'უ' => 'u', 'ფ' => 'f', 'ქ' => 'k', 'ღ' => 'gh', 'ყ' => 'q',
        'შ' => 'sh', 'ჩ' => 'ch', 'ც' => 'ts', 'ძ' => 'dz', 'წ' => 'ts', 'ჭ' => 'ch',
        'ხ' => 'kh', 'ჯ' => 'j', 'ჰ' => 'h',
    ];

    public static function make(string $text): string
    {
        $text = mb_strtolower(strtr($text, self::GEORGIAN_MAP));
        $text = preg_replace('/[^a-z0-9]+/u', '-', $text) ?? '';
        $text = trim($text, '-');

        if ($text === '') {
            $text = 'machine-' . bin2hex(random_bytes(4));
        }

        return $text;
    }
}
