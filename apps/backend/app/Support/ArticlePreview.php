<?php

namespace App\Support;

use App\Models\Post;
use Illuminate\Support\Carbon;

final class ArticlePreview
{
    public static function url(Post $post): string
    {
        $expires = now()->addDay()->timestamp;
        $slug = (string) $post->slug;
        $postId = (int) $post->getKey();
        $query = http_build_query([
            'preview' => $postId,
            'expires' => $expires,
            'signature' => self::signature($postId, $slug, $expires),
        ]);

        return rtrim((string) config('app.frontend_url'), '/').'/blog/'.rawurlencode($slug).'?'.$query;
    }

    public static function isValid(int $postId, string $slug, mixed $expires, mixed $signature): bool
    {
        if (! is_numeric($expires) || ! is_string($signature) || $signature === '') {
            return false;
        }

        $timestamp = (int) $expires;
        if ($timestamp < Carbon::now()->timestamp) {
            return false;
        }

        return hash_equals(self::signature($postId, $slug, $timestamp), $signature);
    }

    private static function signature(int $postId, string $slug, int $expires): string
    {
        return hash_hmac('sha256', implode('|', [$postId, $slug, $expires]), (string) config('app.key'));
    }
}
