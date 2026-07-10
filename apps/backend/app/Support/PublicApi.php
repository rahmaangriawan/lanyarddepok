<?php

namespace App\Support;

use App\Models\Setting;
use Illuminate\Http\JsonResponse;

final class PublicApi
{
    /**
     * @param list<string>|null $keys
     * @return array<string, string>
     */
    public static function settings(?array $keys = null): array
    {
        return Setting::query()
            ->when($keys, fn ($query) => $query->whereIn('key', $keys))
            ->pluck('value', 'key')
            ->all();
    }

    /**
     * @param array<string, mixed> $payload
     */
    public static function json(array $payload, int $seconds = 600): JsonResponse
    {
        return response()->json($payload)
            ->header('Cache-Control', "public, s-maxage={$seconds}, stale-while-revalidate=300");
    }

    public static function sanitizeContent(mixed $model): mixed
    {
        if ($model && isset($model->content)) {
            $model->content = HtmlSanitizer::clean($model->content);
        }

        return $model;
    }

    public static function normalizeText(?string $value): ?string
    {
        return is_string($value)
            ? str_replace(['lanyardbogor', 'Lanyard Bogor', 'Bogor'], ['lanyarddepok', 'Lanyard Depok', 'Depok'], $value)
            : $value;
    }
}
