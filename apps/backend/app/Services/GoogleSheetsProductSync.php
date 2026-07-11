<?php

namespace App\Services;

use App\Models\Product;
use App\Models\Setting;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use RuntimeException;

final class GoogleSheetsProductSync
{
    private const SCOPE = 'https://www.googleapis.com/auth/spreadsheets.readonly';

    private const COLUMN_ALIASES = [
        'sku' => ['sku', 'kode', 'kode_produk', 'product_code'],
        'name' => ['name', 'nama', 'nama_produk', 'product_name', 'produk'],
        'slug' => ['slug', 'product_slug'],
        'specs' => ['specs', 'spesifikasi', 'specification'],
        'accessories' => ['accessories', 'aksesoris', 'accessory'],
        'basePrice' => ['base_price', 'baseprice', 'harga', 'harga_dasar', 'price'],
        'minOrder' => ['min_order', 'minorder', 'minimum_order', 'minimum_pesanan', 'moq'],
        'shortDescription' => ['short_description', 'shortdescription', 'deskripsi_singkat', 'ringkasan'],
        'sheetStatus' => ['sheet_status', 'sheetstatus', 'status'],
        'sites' => ['sites', 'site', 'website', 'domain'],
        'sortOrder' => ['sort_order', 'sortorder', 'urutan', 'order'],
        'featuredImage' => ['featured_image', 'featuredimage', 'image', 'image_url', 'gambar'],
        'description' => ['description', 'deskripsi', 'long_description'],
        'published' => ['published', 'publish', 'tampil', 'aktif'],
        'metaTitle' => ['meta_title', 'metatitle', 'seo_title'],
        'metaDescription' => ['meta_description', 'metadescription', 'seo_description'],
    ];

    public function sync(): array
    {
        $settings = Setting::query()
            ->whereIn('key', ['google_service_account_json', 'google_spreadsheet_id', 'google_spreadsheet_range'])
            ->pluck('value', 'key');

        $credentialJson = trim((string) $settings->get('google_service_account_json'));
        $spreadsheetId = trim((string) $settings->get('google_spreadsheet_id'));
        $range = trim((string) $settings->get('google_spreadsheet_range')) ?: 'Sheet1!A:Z';

        if ($credentialJson === '' || $spreadsheetId === '') {
            throw new RuntimeException('Credential Google dan Spreadsheet ID wajib diisi di CMS Settings.');
        }

        $credentials = json_decode($credentialJson, true);
        if (! is_array($credentials)) {
            throw new RuntimeException('Credential Google bukan JSON service account yang valid.');
        }

        $token = $this->accessToken($credentials);
        $response = Http::withToken($token)
            ->acceptJson()
            ->timeout(25)
            ->get('https://sheets.googleapis.com/v4/spreadsheets/'.rawurlencode($spreadsheetId).'/values/'.rawurlencode($range));

        if (! $response->successful()) {
            $message = $response->json('error.message') ?: 'Google Sheets tidak dapat dibaca.';
            throw new RuntimeException($message);
        }

        $values = $response->json('values');
        if (! is_array($values) || count($values) < 2) {
            throw new RuntimeException('Spreadsheet tidak memiliki header dan baris produk pada range yang dipilih.');
        }

        $headers = array_map(fn ($header) => $this->normalizeHeader((string) $header), array_shift($values));
        $columns = $this->resolveColumns($headers);

        if (! isset($columns['sku'])) {
            throw new RuntimeException('Kolom SKU tidak ditemukan. Header terbaca: '.implode(', ', array_filter($headers)));
        }

        $result = DB::transaction(function () use ($values, $columns) {
            $created = 0;
            $updated = 0;
            $skipped = 0;

            foreach ($values as $row) {
                if (! is_array($row)) {
                    $skipped++;
                    continue;
                }

                $sku = trim((string) $this->cell($row, $columns, 'sku'));
                if ($sku === '') {
                    $skipped++;
                    continue;
                }

                $sites = trim((string) $this->cell($row, $columns, 'sites'));
                if (! $this->matchesCurrentSite($sites)) {
                    $skipped++;
                    continue;
                }

                $product = Product::query()->firstOrNew(['sku' => $sku]);
                $isNew = ! $product->exists;
                $data = $this->productData($row, $columns, $product);

                $product->fill($data);
                $product->sku = $sku;
                $product->save();

                $isNew ? $created++ : $updated++;
            }

            return compact('created', 'updated', 'skipped');
        });

        Setting::updateOrCreate(['key' => 'google_products_last_synced_at'], ['value' => now()->toIso8601String()]);
        Setting::updateOrCreate(['key' => 'google_products_last_sync_summary'], ['value' => json_encode($result)]);

        return [...$result, 'range' => $range, 'rows' => count($values)];
    }

    private function accessToken(array $credentials): string
    {
        $email = trim((string) ($credentials['client_email'] ?? ''));
        $privateKey = (string) ($credentials['private_key'] ?? '');
        $tokenUri = trim((string) ($credentials['token_uri'] ?? 'https://oauth2.googleapis.com/token'));

        if ($email === '' || $privateKey === '') {
            throw new RuntimeException('Credential service account tidak memiliki client_email atau private_key.');
        }

        $now = time();
        $header = $this->base64Url(json_encode(['alg' => 'RS256', 'typ' => 'JWT'], JSON_UNESCAPED_SLASHES));
        $claims = $this->base64Url(json_encode([
            'iss' => $email,
            'scope' => self::SCOPE,
            'aud' => $tokenUri,
            'iat' => $now,
            'exp' => $now + 3600,
        ], JSON_UNESCAPED_SLASHES));
        $unsignedToken = "{$header}.{$claims}";

        if (! openssl_sign($unsignedToken, $signature, $privateKey, OPENSSL_ALGO_SHA256)) {
            throw new RuntimeException('Private key service account tidak dapat digunakan untuk menandatangani token.');
        }

        $response = Http::asForm()->acceptJson()->timeout(20)->post($tokenUri, [
            'grant_type' => 'urn:ietf:params:oauth:grant-type:jwt-bearer',
            'assertion' => $unsignedToken.'.'.$this->base64Url($signature),
        ]);

        if (! $response->successful() || ! $response->json('access_token')) {
            $message = $response->json('error_description') ?: $response->json('error') ?: 'Autentikasi Google gagal.';
            throw new RuntimeException((string) $message);
        }

        return (string) $response->json('access_token');
    }

    private function productData(array $row, array $columns, Product $product): array
    {
        $data = [];
        foreach (['name', 'specs', 'accessories', 'basePrice', 'minOrder', 'shortDescription', 'sheetStatus', 'sites', 'featuredImage', 'description', 'metaTitle', 'metaDescription'] as $field) {
            if (! isset($columns[$field])) {
                continue;
            }

            $value = trim((string) $this->cell($row, $columns, $field));
            $data[$field] = $value !== '' ? $value : null;
        }

        if (isset($columns['sortOrder'])) {
            $data['sortOrder'] = max(0, (int) $this->cell($row, $columns, 'sortOrder'));
        }

        if (isset($columns['published'])) {
            $data['published'] = $this->booleanValue($this->cell($row, $columns, 'published'));
        } elseif (! $product->exists) {
            $status = Str::lower((string) ($data['sheetStatus'] ?? ''));
            $data['published'] = ! in_array($status, ['draft', 'inactive', 'nonaktif', 'arsip'], true);
        }

        $sheetSlug = trim((string) $this->cell($row, $columns, 'slug'));
        if ($sheetSlug !== '') {
            $data['slug'] = $this->uniqueSlug($sheetSlug, $product);
        } elseif (! $product->slug && ! empty($data['name'])) {
            $data['slug'] = $this->uniqueSlug((string) $data['name'], $product);
        }

        return $data;
    }

    private function resolveColumns(array $headers): array
    {
        $resolved = [];
        foreach (self::COLUMN_ALIASES as $field => $aliases) {
            foreach ($aliases as $alias) {
                $index = array_search($alias, $headers, true);
                if ($index !== false) {
                    $resolved[$field] = $index;
                    break;
                }
            }
        }

        return $resolved;
    }

    private function cell(array $row, array $columns, string $field): mixed
    {
        return isset($columns[$field]) ? ($row[$columns[$field]] ?? null) : null;
    }

    private function normalizeHeader(string $header): string
    {
        return trim((string) preg_replace('/[^a-z0-9]+/', '_', Str::lower(Str::ascii(trim($header)))), '_');
    }

    private function uniqueSlug(string $value, Product $product): string
    {
        $base = Str::slug($value) ?: Str::slug($product->sku);
        $slug = $base;
        $suffix = 2;

        while (Product::query()
            ->where('slug', $slug)
            ->when($product->exists, fn ($query) => $query->whereKeyNot($product->getKey()))
            ->exists()) {
            $slug = "{$base}-{$suffix}";
            $suffix++;
        }

        return $slug;
    }

    private function booleanValue(mixed $value): bool
    {
        return in_array(Str::lower(trim((string) $value)), ['1', 'true', 'yes', 'ya', 'aktif', 'active', 'publish', 'published', 'tampil'], true);
    }

    private function matchesCurrentSite(string $sites): bool
    {
        if ($sites === '') {
            return true;
        }

        $normalized = Str::lower($sites);
        if (in_array(trim($normalized), ['*', 'all', 'semua'], true)) {
            return true;
        }

        $host = Str::lower((string) parse_url(config('app.url'), PHP_URL_HOST));
        $tokens = preg_split('/[\s,;|]+/', $normalized) ?: [];

        return collect($tokens)->contains(fn ($token) => $token !== '' && (
            $token === $host
            || Str::contains($token, 'lanyarddepok')
            || $token === 'depok'
        ));
    }

    private function base64Url(string $value): string
    {
        return rtrim(strtr(base64_encode($value), '+/', '-_'), '=');
    }
}
