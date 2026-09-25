<?php

declare(strict_types=1);

require_once __DIR__ . '/../Exceptions/ValidationException.php';

/**
 * Only `name` is required. Every spec field is optional because different
 * machine categories need different specs (a compressor has no "lift
 * height", an asphalt plant has no "load capacity") — category-specific
 * extras that don't have their own column belong in `specs`.
 */
class MachineValidator
{
    private const CONDITIONS = ['new', 'used'];
    private const STATUSES = ['available', 'reserved', 'sold'];

    public static function forCreate(array $input): array
    {
        $data = [
            'name' => self::requiredString($input, 'name', 200),
            'name_en' => self::optionalString($input, 'name_en', 200),
            'brand' => self::optionalString($input, 'brand', 100),
            'category' => self::optionalString($input, 'category', 100),
            'model' => self::optionalString($input, 'model', 100),
            'year' => self::optionalInt($input, 'year', 1950, 2100),
            'condition_status' => array_key_exists('condition_status', $input)
                ? self::requiredEnum($input, 'condition_status', self::CONDITIONS)
                : 'new',
            'price' => self::optionalDecimal($input, 'price'),
            'currency' => self::optionalString($input, 'currency', 10) ?? 'USD',
            'price_negotiable' => self::optionalBool($input, 'price_negotiable') ?? false,
            'vat_percent' => self::optionalVatPercent($input),
            'contact_phone' => self::optionalPhone($input),
            'engine' => self::optionalString($input, 'engine', 150),
            'power_hp' => self::optionalDecimal($input, 'power_hp'),
            'operating_weight_kg' => self::optionalDecimal($input, 'operating_weight_kg'),
            'load_capacity_kg' => self::optionalDecimal($input, 'load_capacity_kg'),
            'lift_height_m' => self::optionalDecimal($input, 'lift_height_m'),
            'working_hours' => self::optionalInt($input, 'working_hours', 0, 1000000),
            'fuel_type' => self::optionalString($input, 'fuel_type', 50),
            'cabin' => self::optionalString($input, 'cabin', 150),
            'warranty' => self::optionalString($input, 'warranty', 150),
            'description' => self::optionalString($input, 'description', 20000),
            'description_en' => self::optionalString($input, 'description_en', 20000),
            'specs' => self::optionalSpecs($input) ?? [],
            'main_image' => self::optionalString($input, 'main_image', 500),
            'images' => self::optionalImages($input) ?? [],
            'status' => array_key_exists('status', $input)
                ? self::requiredEnum($input, 'status', self::STATUSES)
                : 'available',
            'featured' => self::optionalBool($input, 'featured') ?? false,
            'meta_title' => self::optionalString($input, 'meta_title', 255),
            'meta_description' => self::optionalString($input, 'meta_description', 500),
        ];

        if (array_key_exists('slug', $input) && is_string($input['slug']) && trim($input['slug']) !== '') {
            $data['slug'] = trim($input['slug']);
        }

        return $data;
    }

    public static function forUpdate(array $input): array
    {
        $data = [];

        if (array_key_exists('name', $input)) {
            $data['name'] = self::requiredString($input, 'name', 200);
        }
        if (array_key_exists('slug', $input) && is_string($input['slug']) && trim($input['slug']) !== '') {
            $data['slug'] = trim($input['slug']);
        }

        $optionalStringFields = [
            'name_en' => 200, 'brand' => 100, 'category' => 100, 'model' => 100,
            'currency' => 10, 'engine' => 150, 'fuel_type' => 50, 'cabin' => 150,
            'warranty' => 150, 'description' => 20000, 'description_en' => 20000,
            'main_image' => 500, 'meta_title' => 255, 'meta_description' => 500,
        ];
        foreach ($optionalStringFields as $field => $maxLength) {
            if (array_key_exists($field, $input)) {
                $data[$field] = self::optionalString($input, $field, $maxLength);
            }
        }

        if (array_key_exists('year', $input)) {
            $data['year'] = self::optionalInt($input, 'year', 1950, 2100);
        }
        if (array_key_exists('working_hours', $input)) {
            $data['working_hours'] = self::optionalInt($input, 'working_hours', 0, 1000000);
        }
        if (array_key_exists('condition_status', $input)) {
            $data['condition_status'] = self::requiredEnum($input, 'condition_status', self::CONDITIONS);
        }
        if (array_key_exists('status', $input)) {
            $data['status'] = self::requiredEnum($input, 'status', self::STATUSES);
        }

        foreach (['price', 'power_hp', 'operating_weight_kg', 'load_capacity_kg', 'lift_height_m'] as $field) {
            if (array_key_exists($field, $input)) {
                $data[$field] = self::optionalDecimal($input, $field);
            }
        }

        if (array_key_exists('vat_percent', $input)) {
            $data['vat_percent'] = self::optionalVatPercent($input);
        }
        if (array_key_exists('contact_phone', $input)) {
            $data['contact_phone'] = self::optionalPhone($input);
        }
        if (array_key_exists('price_negotiable', $input)) {
            $data['price_negotiable'] = self::optionalBool($input, 'price_negotiable') ?? false;
        }
        if (array_key_exists('featured', $input)) {
            $data['featured'] = self::optionalBool($input, 'featured') ?? false;
        }
        if (array_key_exists('specs', $input)) {
            $data['specs'] = self::optionalSpecs($input) ?? [];
        }
        if (array_key_exists('images', $input)) {
            $data['images'] = self::optionalImages($input) ?? [];
        }

        return $data;
    }

    private static function requiredString(array $input, string $field, int $maxLength): string
    {
        $value = $input[$field] ?? null;
        if (!is_string($value) || trim($value) === '') {
            throw new ValidationException("Field '{$field}' is required and must be a non-empty string");
        }
        if (mb_strlen($value) > $maxLength) {
            throw new ValidationException("Field '{$field}' must be at most {$maxLength} characters");
        }
        return trim($value);
    }

    private static function optionalString(array $input, string $field, int $maxLength): ?string
    {
        if (!array_key_exists($field, $input) || $input[$field] === null || $input[$field] === '') {
            return null;
        }
        $value = $input[$field];
        if (!is_string($value)) {
            throw new ValidationException("Field '{$field}' must be a string");
        }
        if (mb_strlen($value) > $maxLength) {
            throw new ValidationException("Field '{$field}' must be at most {$maxLength} characters");
        }
        return trim($value);
    }

    private static function optionalInt(array $input, string $field, int $min, int $max): ?int
    {
        if (!array_key_exists($field, $input) || $input[$field] === null || $input[$field] === '') {
            return null;
        }
        $value = $input[$field];
        if (!is_int($value) && !(is_string($value) && ctype_digit(ltrim($value, '-')))) {
            throw new ValidationException("Field '{$field}' must be an integer");
        }
        $intValue = (int) $value;
        if ($intValue < $min || $intValue > $max) {
            throw new ValidationException("Field '{$field}' must be between {$min} and {$max}");
        }
        return $intValue;
    }

    private static function optionalDecimal(array $input, string $field): ?float
    {
        if (!array_key_exists($field, $input) || $input[$field] === null || $input[$field] === '') {
            return null;
        }
        $value = $input[$field];
        if (!is_numeric($value)) {
            throw new ValidationException("Field '{$field}' must be a number");
        }
        $floatValue = (float) $value;
        if ($floatValue < 0) {
            throw new ValidationException("Field '{$field}' must not be negative");
        }
        return $floatValue;
    }

    private static function optionalVatPercent(array $input): ?float
    {
        $value = self::optionalDecimal($input, 'vat_percent');
        if ($value !== null && $value > 100) {
            throw new ValidationException("Field 'vat_percent' must be between 0 and 100");
        }
        return $value;
    }

    private static function optionalPhone(array $input): ?string
    {
        $value = self::optionalString($input, 'contact_phone', 30);
        if ($value !== null && !preg_match('/^\+?[\d\s()-]{5,30}$/', $value)) {
            throw new ValidationException("Field 'contact_phone' must be a phone number, e.g. 599 12 34 56");
        }
        return $value;
    }

    private static function optionalBool(array $input, string $field): ?bool
    {
        if (!array_key_exists($field, $input) || $input[$field] === null) {
            return null;
        }
        $value = $input[$field];
        if (!is_bool($value) && $value !== 0 && $value !== 1 && $value !== '0' && $value !== '1') {
            throw new ValidationException("Field '{$field}' must be a boolean");
        }
        return (bool) $value;
    }

    private static function requiredEnum(array $input, string $field, array $allowed): string
    {
        $value = $input[$field] ?? null;
        if (!is_string($value) || !in_array($value, $allowed, true)) {
            $options = implode("', '", $allowed);
            throw new ValidationException("Field '{$field}' must be one of '{$options}'");
        }
        return $value;
    }

    private static function optionalSpecs(array $input): ?array
    {
        if (!array_key_exists('specs', $input) || $input['specs'] === null) {
            return null;
        }
        $specs = $input['specs'];
        if (!is_array($specs)) {
            throw new ValidationException("Field 'specs' must be an array of {label, value} objects");
        }
        $result = [];
        foreach ($specs as $spec) {
            if (!is_array($spec) || !isset($spec['label'], $spec['value']) || !is_string($spec['label']) || !is_string($spec['value'])) {
                throw new ValidationException("Field 'specs' must be an array of {label, value} objects");
            }
            $label = trim($spec['label']);
            $value = trim($spec['value']);
            if ($label === '' || $value === '') {
                continue;
            }
            $result[] = ['label' => $label, 'value' => $value];
        }
        return $result;
    }

    private static function optionalImages(array $input): ?array
    {
        if (!array_key_exists('images', $input) || $input['images'] === null) {
            return null;
        }
        $images = $input['images'];
        if (!is_array($images)) {
            throw new ValidationException("Field 'images' must be an array of strings");
        }
        foreach ($images as $url) {
            if (!is_string($url)) {
                throw new ValidationException("Field 'images' must be an array of strings");
            }
        }
        return array_values($images);
    }
}
