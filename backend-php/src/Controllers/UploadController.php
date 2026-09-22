<?php

declare(strict_types=1);

require_once __DIR__ . '/../Http/Request.php';
require_once __DIR__ . '/../Http/Response.php';
require_once __DIR__ . '/../Exceptions/ValidationException.php';

class UploadController
{
    private const MAX_DIMENSION = 1920;
    private const WEBP_QUALITY = 82;

    public static function store(array $params): void
    {
        if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
            throw new ValidationException('No file uploaded');
        }

        $file = $_FILES['file'];
        $tmp = $file['tmp_name'];
        $original = $file['name'];

        $ext = strtolower(pathinfo($original, PATHINFO_EXTENSION));
        $allowed = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
        if (!in_array($ext, $allowed, true)) {
            throw new ValidationException('Invalid file type');
        }

        $uploadDir = __DIR__ . '/../../public/uploads';
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0755, true);
        }

        $basename = bin2hex(random_bytes(16));
        $target = $uploadDir . '/' . $basename . '.' . $ext;

        if (!move_uploaded_file($tmp, $target)) {
            throw new \RuntimeException('Failed to move uploaded file');
        }

        $finalPath = self::optimize($target, $ext, $uploadDir . '/' . $basename);

        Response::json(['url' => '/uploads/' . basename($finalPath)]);
    }

    /**
     * Downscales to MAX_DIMENSION and re-encodes as WebP — smaller than
     * JPEG/PNG at equivalent quality, so every accepted extension converges
     * on one efficient format regardless of what the client uploaded. This
     * is a server-side floor beneath whatever the admin panel already
     * converted client-side. GIFs pass through untouched (GD would flatten
     * any animation to a single frame); so does anything else if the gd
     * extension isn't loaded. Returns the path of whichever file should
     * actually be served — the new .webp one, or the original if untouched.
     */
    private static function optimize(string $path, string $ext, string $baseNoExt): string
    {
        if ($ext === 'gif') {
            return $path;
        }

        if (!extension_loaded('gd')) {
            return $path;
        }

        $image = match ($ext) {
            'jpg', 'jpeg' => @imagecreatefromjpeg($path),
            'png' => @imagecreatefrompng($path),
            'webp' => @imagecreatefromwebp($path),
            default => null,
        };
        if (!$image instanceof \GdImage) {
            unlink($path);
            throw new ValidationException('Uploaded file is not a valid image');
        }

        $width = imagesx($image);
        $height = imagesy($image);
        $scale = min(1.0, self::MAX_DIMENSION / max($width, $height));

        if ($scale < 1.0) {
            $newWidth = max(1, (int) round($width * $scale));
            $newHeight = max(1, (int) round($height * $scale));
            $resized = imagecreatetruecolor($newWidth, $newHeight);
            imagealphablending($resized, false);
            imagesavealpha($resized, true);
            imagecopyresampled($resized, $image, 0, 0, 0, 0, $newWidth, $newHeight, $width, $height);
            imagedestroy($image);
            $image = $resized;
        }

        imagesavealpha($image, true);

        $webpPath = $baseNoExt . '.webp';
        imagewebp($image, $webpPath, self::WEBP_QUALITY);
        imagedestroy($image);

        if ($webpPath !== $path) {
            unlink($path);
        }

        return $webpPath;
    }
}
