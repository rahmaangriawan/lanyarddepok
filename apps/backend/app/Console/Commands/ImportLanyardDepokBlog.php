<?php

namespace App\Console\Commands;

use App\Models\Category;
use App\Models\Comment;
use App\Models\Media;
use App\Models\Post;
use DOMDocument;
use DOMElement;
use DOMNode;
use DOMXPath;
use Illuminate\Console\Command;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Throwable;

class ImportLanyardDepokBlog extends Command
{
    protected $signature = 'blog:import-lanyarddepok
        {--dry-run : Crawl and parse without changing database or files}
        {--keep-old : Keep existing local posts instead of replacing them}
        {--limit= : Limit imported articles for testing}';

    protected $description = 'Scrape lanyarddepok.com blog posts, download images, and import them into the local CMS.';

    private const BASE_URL = 'https://lanyarddepok.com';

    private const BLOG_URL = 'https://lanyarddepok.com/blog';

    private int $imageSuccessCount = 0;

    private int $imageFailureCount = 0;

    /**
     * @var array<string, string>
     */
    private array $downloadedImages = [];

    public function handle(): int
    {
        $dryRun = (bool) $this->option('dry-run');
        $keepOld = (bool) $this->option('keep-old');
        $limit = $this->parseLimit();

        $this->info('Crawling artikel dari '.self::BLOG_URL);

        $articleUrls = $this->collectArticleUrls($limit);

        if ($articleUrls === []) {
            $this->error('Tidak ada artikel yang berhasil ditemukan. Data lokal tidak diubah.');

            return self::FAILURE;
        }

        $this->info('Artikel ditemukan: '.count($articleUrls));

        $articles = [];
        foreach ($articleUrls as $url) {
            try {
                $article = $this->parseArticle($url);

                if (! $article) {
                    $this->warn("Lewati artikel karena konten kosong: {$url}");
                    continue;
                }

                $articles[] = $article;
                $this->line('Parsed: '.$article['title']);
            } catch (Throwable $exception) {
                $this->warn("Gagal parse {$url}: ".$exception->getMessage());
            }
        }

        if ($articles === []) {
            $this->error('Tidak ada artikel valid setelah parsing. Data lokal tidak diubah.');

            return self::FAILURE;
        }

        if ($dryRun) {
            $this->info('Dry run selesai. Tidak ada data atau file yang diubah.');
            $this->table(
                ['Metric', 'Value'],
                [
                    ['Artikel valid', count($articles)],
                    ['Gambar akan diunduh', array_sum(array_map(fn (array $article) => count($article['imageUrls']), $articles))],
                ],
            );

            return self::SUCCESS;
        }

        if (! $keepOld) {
            Storage::disk('public')->deleteDirectory('uploads/blog-import');
            Media::query()
                ->where('filepath', 'like', 'storage/uploads/blog-import/%')
                ->orWhere('url', 'like', '/storage/uploads/blog-import/%')
                ->delete();
        }

        DB::transaction(function () use ($articles, $keepOld): void {
            $category = Category::firstOrCreate(
                ['slug' => 'artikel', 'type' => 'BLOG'],
                ['name' => 'Artikel', 'description' => 'Artikel Lanyard Depok'],
            );

            if (! $keepOld) {
                Comment::query()->whereIn('postId', Post::query()->select('id'))->delete();
                Post::query()->delete();
            }

            foreach ($articles as $article) {
                $imported = $this->importArticleImages($article);

                Post::updateOrCreate(
                    ['slug' => $article['slug']],
                    [
                        'title' => $article['title'],
                        'content' => $imported['content'],
                        'published' => true,
                        'featuredImage' => $imported['featuredImage'],
                        'categoryId' => $category->id,
                        'createdAt' => $article['createdAt'] ?? now(),
                        'metaTitle' => $article['metaTitle'] ?: $article['title'],
                        'metaDescription' => $article['metaDescription'],
                    ],
                );
            }
        });

        $this->info('Import selesai.');
        $this->table(
            ['Metric', 'Value'],
            [
                ['Artikel diimport', count($articles)],
                ['Gambar berhasil', $this->imageSuccessCount],
                ['Gambar gagal', $this->imageFailureCount],
                ['Mode hapus artikel lama', $keepOld ? 'Tidak, keep-old aktif' : 'Ya'],
            ],
        );

        return self::SUCCESS;
    }

    private function parseLimit(): ?int
    {
        $value = $this->option('limit');

        if ($value === null || $value === false || $value === '') {
            return null;
        }

        $limit = (int) $value;

        return $limit > 0 ? $limit : null;
    }

    /**
     * @return list<string>
     */
    private function collectArticleUrls(?int $limit): array
    {
        $listingQueue = [self::BLOG_URL];
        $seenListings = [];
        $articleUrls = [];

        while ($listingQueue !== []) {
            $listingUrl = array_shift($listingQueue);
            if (! $listingUrl || isset($seenListings[$listingUrl])) {
                continue;
            }

            $seenListings[$listingUrl] = true;
            $html = $this->fetchHtml($listingUrl);
            $xpath = $this->xpath($html);

            foreach ($xpath->query('//a[@href]') ?: [] as $anchor) {
                if (! $anchor instanceof DOMElement) {
                    continue;
                }

                $url = $this->absoluteUrl($anchor->getAttribute('href'), $listingUrl);
                if (! $url || ! $this->isSameHost($url)) {
                    continue;
                }

                if ($this->isArticleUrl($url)) {
                    $articleUrls[$this->normalizeUrl($url)] = true;

                    if ($limit && count($articleUrls) >= $limit) {
                        break 2;
                    }

                    continue;
                }

                if ($this->isBlogListingUrl($url) && ! isset($seenListings[$this->normalizeUrl($url)])) {
                    $listingQueue[] = $this->normalizeUrl($url);
                }
            }
        }

        return array_keys($articleUrls);
    }

    /**
     * @return array<string, mixed>|null
     */
    private function parseArticle(string $url): ?array
    {
        $html = $this->fetchHtml($url);
        $xpath = $this->xpath($html);
        $title = $this->firstText($xpath, [
            '//article//h1',
            '//main//h1',
            '//h1',
            '//meta[@property="og:title"]/@content',
            '//title',
        ]);

        $title = trim(preg_replace('/\s+\|\s+.*$/', '', $title) ?? $title);
        if ($title === '') {
            return null;
        }

        $slug = $this->slugFromUrl($url) ?: Str::slug($title);
        $metaDescription = $this->firstText($xpath, [
            '//meta[@name="description"]/@content',
            '//meta[@property="og:description"]/@content',
        ]);
        $createdAt = $this->parseDate($this->firstText($xpath, [
            '//meta[@property="article:published_time"]/@content',
            '//time[@datetime]/@datetime',
            '//time',
        ]));
        $featuredImage = $this->firstText($xpath, [
            '//meta[@property="og:image"]/@content',
            '//meta[@name="twitter:image"]/@content',
        ]);

        $contentNode = $this->findContentNode($xpath);
        if (! $contentNode) {
            return null;
        }

        $this->sanitizeNode($contentNode);
        $this->removeDuplicateTitle($contentNode, $title);
        $imageUrls = $this->extractImageUrls($contentNode, $url);
        $primaryImage = $featuredImage !== ''
            ? ($this->absoluteUrl($featuredImage, $url) ?: $featuredImage)
            : ($imageUrls[0] ?? null);
        $this->removeLeadingFeaturedMedia($contentNode);
        $contentHtml = $this->innerHtml($contentNode);

        if ($featuredImage !== '') {
            array_unshift($imageUrls, $primaryImage);
        }

        $imageUrls = array_values(array_unique(array_filter($imageUrls)));

        return [
            'sourceUrl' => $url,
            'title' => $title,
            'slug' => $slug,
            'content' => $contentHtml,
            'featuredImageUrl' => $primaryImage,
            'imageUrls' => $imageUrls,
            'metaTitle' => $title,
            'metaDescription' => $metaDescription !== '' ? $metaDescription : Str::limit(strip_tags($contentHtml), 155, ''),
            'createdAt' => $createdAt,
        ];
    }

    /**
     * @param array<string, mixed> $article
     * @return array{content: string, featuredImage: ?string}
     */
    private function importArticleImages(array $article): array
    {
        $rewrites = [];
        foreach ($article['imageUrls'] as $index => $imageUrl) {
            $localUrl = $this->downloadImage((string) $imageUrl, (string) $article['slug'], $index + 1);
            if ($localUrl) {
                $rewrites[(string) $imageUrl] = $localUrl;
            }
        }

        $content = (string) $article['content'];
        foreach ($rewrites as $remoteUrl => $localUrl) {
            $content = str_replace($remoteUrl, $localUrl, $content);
            $content = str_replace(htmlspecialchars($remoteUrl, ENT_QUOTES), $localUrl, $content);
        }

        $featuredImage = null;
        if ($article['featuredImageUrl'] && isset($rewrites[$article['featuredImageUrl']])) {
            $featuredImage = $rewrites[$article['featuredImageUrl']];
        }

        if (! $featuredImage && $rewrites !== []) {
            $featuredImage = reset($rewrites) ?: null;
        }

        return [
            'content' => $content,
            'featuredImage' => $featuredImage,
        ];
    }

    private function downloadImage(string $url, string $slug, int $index): ?string
    {
        if (isset($this->downloadedImages[$url])) {
            return $this->downloadedImages[$url];
        }

        try {
            $response = Http::timeout(30)
                ->retry(2, 350)
                ->withHeaders($this->headers())
                ->get($url);

            if (! $response->ok()) {
                $this->imageFailureCount++;

                return null;
            }

            $contentType = strtolower((string) $response->header('Content-Type'));
            if (! str_starts_with($contentType, 'image/')) {
                $this->imageFailureCount++;

                return null;
            }

            $extension = $this->extensionFromContentType($contentType) ?: $this->extensionFromUrl($url) ?: 'jpg';
            $filename = Str::slug($slug).'-'.str_pad((string) $index, 2, '0', STR_PAD_LEFT).'-'.Str::lower(Str::random(6)).'.'.$extension;
            $path = 'uploads/blog-import/'.$filename;

            Storage::disk('public')->put($path, $response->body());

            $localUrl = Storage::url($path);
            Media::create([
                'filename' => $filename,
                'filepath' => 'storage/'.$path,
                'mimetype' => $contentType ?: 'image/'.$extension,
                'size' => strlen($response->body()),
                'url' => $localUrl,
            ]);

            $this->downloadedImages[$url] = $localUrl;
            $this->imageSuccessCount++;

            return $localUrl;
        } catch (Throwable $exception) {
            $this->imageFailureCount++;
            $this->warn("Gagal download gambar {$url}: ".$exception->getMessage());

            return null;
        }
    }

    private function fetchHtml(string $url): string
    {
        $response = Http::timeout(30)
            ->retry(2, 350)
            ->withHeaders($this->headers())
            ->get($url);

        if (! $response->ok()) {
            throw new \RuntimeException("HTTP {$response->status()}");
        }

        return $response->body();
    }

    /**
     * @return array<string, string>
     */
    private function headers(): array
    {
        return [
            'Accept' => 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
            'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36',
        ];
    }

    private function xpath(string $html): DOMXPath
    {
        $document = new DOMDocument();
        libxml_use_internal_errors(true);
        $document->loadHTML('<?xml encoding="utf-8" ?>'.$html, LIBXML_NOERROR | LIBXML_NOWARNING);
        libxml_clear_errors();

        return new DOMXPath($document);
    }

    /**
     * @param list<string> $queries
     */
    private function firstText(DOMXPath $xpath, array $queries): string
    {
        foreach ($queries as $query) {
            $nodes = $xpath->query($query);
            if (! $nodes || $nodes->length === 0) {
                continue;
            }

            $node = $nodes->item(0);
            $value = trim($node?->nodeValue ?? '');
            if ($value !== '') {
                return html_entity_decode($value, ENT_QUOTES | ENT_HTML5, 'UTF-8');
            }
        }

        return '';
    }

    private function findContentNode(DOMXPath $xpath): ?DOMNode
    {
        $queries = [
            '//article//*[contains(concat(" ", normalize-space(@class), " "), " lg:col-span-8 ")]',
            '//article//*[contains(concat(" ", normalize-space(@class), " "), " prose ")]',
            '//*[contains(@class, "entry-content")]',
            '//*[contains(@class, "post-content")]',
            '//*[contains(@class, "article-content")]',
            '//*[contains(@class, "content-prose")]',
            '//article[contains(@class, "post")]',
            '//article',
        ];

        $bestNode = null;
        $bestLength = 0;

        foreach ($queries as $query) {
            foreach ($xpath->query($query) ?: [] as $node) {
                $textLength = mb_strlen(trim($node->textContent ?? ''));
                if ($textLength > $bestLength) {
                    $bestLength = $textLength;
                    $bestNode = $node;
                }
            }
        }

        if ($bestLength > 80) {
            return $bestNode;
        }

        $main = $xpath->query('//main')->item(0);

        return $main && mb_strlen(trim($main->textContent ?? '')) > 80 ? $main : null;
    }

    private function sanitizeNode(DOMNode $node): void
    {
        $document = $node instanceof DOMDocument ? $node : $node->ownerDocument;
        if (! $document) {
            return;
        }

        $xpath = new DOMXPath($document);
        foreach (['script', 'style', 'form', 'iframe', 'noscript', 'svg', 'nav', 'aside', 'header', 'footer'] as $tag) {
            foreach ($xpath->query('.//'.$tag, $node) ?: [] as $blocked) {
                $blocked->parentNode?->removeChild($blocked);
            }
        }

        $chromeClassParts = [
            'breadcrumb',
            'sidebar',
            'related',
            'recent',
            'share',
            'author',
            'comment',
            'pagination',
            'newsletter',
            'toc',
            'table-of-contents',
        ];

        foreach ($xpath->query('.//*[@class]', $node) ?: [] as $element) {
            if (! $element instanceof DOMElement) {
                continue;
            }

            $className = strtolower($element->getAttribute('class'));
            foreach ($chromeClassParts as $blockedClassPart) {
                if (str_contains($className, $blockedClassPart)) {
                    $element->parentNode?->removeChild($element);
                    break;
                }
            }
        }

        foreach ($xpath->query('.//*', $node) ?: [] as $element) {
            if (! $element instanceof DOMElement) {
                continue;
            }

            $removeAttributes = [];
            foreach ($element->attributes ?? [] as $attribute) {
                $name = strtolower($attribute->name);
                if (str_starts_with($name, 'on') || in_array($name, ['class', 'style', 'srcset', 'sizes'], true)) {
                    $removeAttributes[] = $attribute->name;
                }
            }

            foreach ($removeAttributes as $attributeName) {
                $element->removeAttribute($attributeName);
            }

            if ($element->tagName === 'img') {
                $lazySource = $element->getAttribute('data-src')
                    ?: $element->getAttribute('data-lazy-src')
                    ?: $element->getAttribute('data-original');

                if ($lazySource !== '' && $element->getAttribute('src') === '') {
                    $element->setAttribute('src', $lazySource);
                }
            }
        }
    }

    private function removeDuplicateTitle(DOMNode $node, string $title): void
    {
        $document = $node->ownerDocument;
        if (! $document) {
            return;
        }

        $xpath = new DOMXPath($document);
        $normalizedTitle = Str::of($title)->lower()->squish()->toString();

        foreach ($xpath->query('.//h1', $node) ?: [] as $heading) {
            $headingTitle = Str::of($heading->textContent ?? '')->lower()->squish()->toString();
            if ($headingTitle === $normalizedTitle || str_contains($headingTitle, $normalizedTitle)) {
                $heading->parentNode?->removeChild($heading);
                break;
            }
        }
    }

    private function removeLeadingFeaturedMedia(DOMNode $node): void
    {
        $document = $node->ownerDocument;
        if (! $document) {
            return;
        }

        $xpath = new DOMXPath($document);
        foreach ($xpath->query('.//*[self::figure or self::img]', $node) ?: [] as $media) {
            $hasEarlierBodyText = false;
            $current = $media;

            while ($current && $current !== $node) {
                $sibling = $current->previousSibling;
                while ($sibling) {
                    if (trim($sibling->textContent ?? '') !== '') {
                        $hasEarlierBodyText = true;
                        break 2;
                    }

                    $sibling = $sibling->previousSibling;
                }

                $current = $current->parentNode;
            }

            if (! $hasEarlierBodyText) {
                $media->parentNode?->removeChild($media);
            }

            break;
        }
    }

    /**
     * @return list<string>
     */
    private function extractImageUrls(DOMNode $node, string $baseUrl): array
    {
        $document = $node->ownerDocument;
        if (! $document) {
            return [];
        }

        $xpath = new DOMXPath($document);
        $urls = [];

        foreach ($xpath->query('.//img', $node) ?: [] as $image) {
            if (! $image instanceof DOMElement) {
                continue;
            }

            $value = $image->getAttribute('src')
                ?: $image->getAttribute('data-src')
                ?: $image->getAttribute('data-lazy-src')
                ?: $image->getAttribute('data-original');

            $absolute = $this->absoluteUrl($value, $baseUrl);
            if ($absolute) {
                $urls[] = $absolute;
                $image->setAttribute('src', $absolute);
            }
        }

        return $urls;
    }

    private function innerHtml(DOMNode $node): string
    {
        $html = '';
        foreach ($node->childNodes as $child) {
            $html .= $node->ownerDocument?->saveHTML($child) ?? '';
        }

        return trim($html);
    }

    private function parseDate(string $value): ?Carbon
    {
        if ($value === '') {
            return null;
        }

        try {
            return Carbon::parse($value);
        } catch (Throwable) {
            return null;
        }
    }

    private function slugFromUrl(string $url): ?string
    {
        $path = trim((string) parse_url($url, PHP_URL_PATH), '/');
        $segments = array_values(array_filter(explode('/', $path)));
        $slug = end($segments);

        return $slug ? Str::slug($slug) : null;
    }

    private function isArticleUrl(string $url): bool
    {
        $path = trim((string) parse_url($url, PHP_URL_PATH), '/');
        $segments = array_values(array_filter(explode('/', $path)));

        if (count($segments) === 1) {
            return ! in_array($segments[0], [
                'blog',
                'layanan',
                'pengiriman',
                'garansi',
                'faq',
                'kontak',
                'tentang',
                'category',
                'media',
                'build',
                'storage',
                'login',
                'register',
            ], true);
        }

        return count($segments) === 2
            && $segments[0] === 'blog'
            && ! in_array($segments[1], ['page', 'category', 'tag', 'author'], true);
    }

    private function isBlogListingUrl(string $url): bool
    {
        $path = trim((string) parse_url($url, PHP_URL_PATH), '/');

        return $path === 'blog'
            || str_starts_with($path, 'blog/page/')
            || str_contains($url, '/blog?')
            || str_contains($url, '/blog/?');
    }

    private function isSameHost(string $url): bool
    {
        return parse_url($url, PHP_URL_HOST) === 'lanyarddepok.com';
    }

    private function normalizeUrl(string $url): string
    {
        return rtrim(strtok($url, '#') ?: $url, '/');
    }

    private function absoluteUrl(string $url, string $baseUrl): ?string
    {
        $url = trim(html_entity_decode($url, ENT_QUOTES | ENT_HTML5, 'UTF-8'));

        if ($url === '' || str_starts_with($url, 'data:') || str_starts_with($url, 'mailto:') || str_starts_with($url, 'tel:')) {
            return null;
        }

        if (str_starts_with($url, '//')) {
            return 'https:'.$url;
        }

        if (preg_match('/^https?:\/\//i', $url)) {
            return $this->normalizeUrl($url);
        }

        if (str_starts_with($url, '/')) {
            return self::BASE_URL.$url;
        }

        $basePath = (string) parse_url($baseUrl, PHP_URL_PATH);
        $directory = rtrim(str_replace('\\', '/', dirname($basePath)), '/');

        return self::BASE_URL.($directory ? '/'.$directory : '').'/'.$url;
    }

    private function extensionFromContentType(string $contentType): ?string
    {
        return match (true) {
            str_contains($contentType, 'webp') => 'webp',
            str_contains($contentType, 'png') => 'png',
            str_contains($contentType, 'gif') => 'gif',
            str_contains($contentType, 'svg') => 'svg',
            str_contains($contentType, 'jpeg'), str_contains($contentType, 'jpg') => 'jpg',
            default => null,
        };
    }

    private function extensionFromUrl(string $url): ?string
    {
        $extension = strtolower(pathinfo((string) parse_url($url, PHP_URL_PATH), PATHINFO_EXTENSION));

        return in_array($extension, ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg'], true)
            ? ($extension === 'jpeg' ? 'jpg' : $extension)
            : null;
    }
}
