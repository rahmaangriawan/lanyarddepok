<?php

namespace App\Http\Controllers\Cms;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\CityPage;
use App\Models\Comment;
use App\Models\Inquiry;
use App\Models\Media;
use App\Models\Order;
use App\Models\Page;
use App\Models\Portfolio;
use App\Models\Post;
use App\Models\Product;
use App\Models\Setting;
use App\Support\HtmlSanitizer;
use App\Support\ArticlePreview;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Contracts\View\View;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Illuminate\Validation\Rule;

class CmsResourceController extends Controller
{
    public function index(Request $request, string $resource): View
    {
        $config = $this->config($resource);

        if ($resource === 'media') {
            return $this->mediaIndex($request, $config);
        }

        if ($resource === 'settings') {
            return $this->settingsIndex($config);
        }

        $query = $config['model']::query();

        foreach ($config['with'] ?? [] as $relation) {
            $query->with($relation);
        }

        $search = trim((string) $request->query('q', ''));
        if ($search !== '' && ! empty($config['search'])) {
            $query->where(function ($query) use ($config, $search) {
                foreach ($config['search'] as $column) {
                    $query->orWhere($column, 'like', "%{$search}%");
                }
            });
        }

        if ($request->filled('type') && in_array('type', $config['filters'] ?? [], true)) {
            $query->where('type', $request->query('type'));
        }

        if ($request->filled('published') && in_array('published', $config['filters'] ?? [], true)) {
            $query->where('published', $request->boolean('published'));
        }

        $sortColumn = $config['sort'][0] ?? 'id';
        $sortDirection = $config['sort'][1] ?? 'desc';

        return view('cms.index', [
            'resource' => $resource,
            'config' => Arr::except($config, ['model']),
            'items' => $query
                ->orderBy($sortColumn, $sortDirection)
                ->paginate(12)
                ->withQueryString(),
            'filters' => [
                'q' => $search,
                'type' => $request->query('type'),
                'published' => $request->query('published'),
            ],
            'options' => $this->options($config),
        ]);
    }

    public function create(Request $request, string $resource): View
    {
        $config = $this->config($resource);

        return view('cms.form', [
            'resource' => $resource,
            'config' => Arr::except($config, ['model']),
            'item' => null,
            'options' => $this->options($config),
            'defaults' => [
                'type' => $request->query('type'),
                'published' => true,
                'approved' => false,
            ],
            'previewUrl' => null,
        ]);
    }

    public function store(Request $request, string $resource): RedirectResponse|JsonResponse
    {
        $config = $this->config($resource);

        if ($resource === 'settings') {
            return $this->storeSettings($request, $config);
        }

        $data = $this->validated($request, $config);

        if ($resource === 'media') {
            $media = $this->storeMedia($request);

            if ($request->expectsJson() || $request->ajax()) {
                return response()->json([
                    'success' => true,
                    'media' => [
                        'id' => $media->id,
                        'filename' => $media->filename,
                        'url' => $media->url,
                        'mimetype' => $media->mimetype,
                    ],
                ]);
            }
        } else {
            if ($resource === 'posts') {
                $data['authorId'] = $request->user()->id;
            }

            $config['model']::create($data);
        }

        return redirect()
            ->route('cms.index', $resource)
            ->with('success', "{$config['singular']} berhasil dibuat.");
    }

    public function edit(string $resource, int $id): View
    {
        $config = $this->config($resource);
        $item = $config['model']::query()->findOrFail($id);

        return view('cms.form', [
            'resource' => $resource,
            'config' => Arr::except($config, ['model']),
            'item' => $item,
            'options' => $this->options($config),
            'defaults' => [],
            'previewUrl' => $resource === 'posts' ? ArticlePreview::url($item) : null,
        ]);
    }

    public function mediaPicker(Request $request): JsonResponse
    {
        $perPage = max(1, min($request->integer('per_page') ?: 24, 48));
        $search = trim((string) $request->query('q', ''));
        $query = Media::query()->where('mimetype', 'like', 'image/%');

        if ($search !== '') {
            $query->where(function ($query) use ($search) {
                $query
                    ->where('filename', 'like', "%{$search}%")
                    ->orWhere('url', 'like', "%{$search}%");
            });
        }

        $media = $query
            ->orderBy('createdAt', 'desc')
            ->paginate($perPage)
            ->withQueryString();

        return response()->json([
            'success' => true,
            'media' => collect($media->items())->map(fn (Media $item) => [
                'id' => $item->id,
                'filename' => $item->filename,
                'url' => $item->url,
                'createdAt' => optional($item->createdAt)->toIso8601String(),
            ])->values(),
            'pagination' => [
                'current_page' => $media->currentPage(),
                'last_page' => $media->lastPage(),
                'per_page' => $media->perPage(),
                'total' => $media->total(),
            ],
        ]);
    }

    public function update(Request $request, string $resource, int $id): RedirectResponse
    {
        $config = $this->config($resource);
        $item = $config['model']::query()->findOrFail($id);
        $item->update($this->validated($request, $config, $item));

        return redirect()
            ->route('cms.index', $resource)
            ->with('success', "{$config['singular']} berhasil diperbarui.");
    }

    public function destroy(string $resource, int $id): RedirectResponse
    {
        $config = $this->config($resource);
        $item = $config['model']::query()->findOrFail($id);

        if ($resource === 'media' && $item instanceof Media) {
            Storage::disk('public')->delete($item->filepath);
        }

        $item->delete();

        return redirect()
            ->route('cms.index', $resource)
            ->with('success', "{$config['singular']} berhasil dihapus.");
    }

    public function toggle(Request $request, string $resource, int $id): RedirectResponse
    {
        $config = $this->config($resource);
        abort_unless(in_array('published', $config['fillable'], true) || in_array('approved', $config['fillable'], true), 404);

        $field = in_array('published', $config['fillable'], true) ? 'published' : 'approved';
        $item = $config['model']::query()->findOrFail($id);
        $item->forceFill([$field => ! (bool) $item->{$field}])->save();

        return back()->with('success', 'Status berhasil diperbarui.');
    }

    public function bulk(Request $request, string $resource): RedirectResponse
    {
        $config = $this->config($resource);
        $validated = $request->validate([
            'selected' => ['required', 'array', 'min:1'],
            'selected.*' => ['integer'],
            'bulk_action' => ['required', 'string', Rule::in(['delete', 'publish', 'draft', 'approve', 'unapprove', 'category'])],
            'categoryId' => ['nullable', 'integer', Rule::exists('category', 'id')],
        ]);

        $query = $config['model']::query()->whereIn('id', $validated['selected']);
        $count = (clone $query)->count();
        abort_if($count === 0, 404);

        match ($validated['bulk_action']) {
            'delete' => $this->bulkDelete($query->get(), $resource),
            'publish' => $this->bulkStatus($query, $config, true, 'published'),
            'draft' => $this->bulkStatus($query, $config, false, 'published'),
            'approve' => $this->bulkStatus($query, $config, true, 'approved'),
            'unapprove' => $this->bulkStatus($query, $config, false, 'approved'),
            'category' => $this->bulkCategory($query, $config, $validated['categoryId'] ?? null),
        };

        return back()->with('success', "{$count} data berhasil diproses.");
    }

    private function bulkDelete($items, string $resource): void
    {
        foreach ($items as $item) {
            if ($resource === 'media' && $item instanceof Media) {
                Storage::disk('public')->delete($item->filepath);
            }

            $item->delete();
        }
    }

    private function bulkStatus($query, array $config, bool $value, string $field): void
    {
        abort_unless(in_array($field, $config['fillable'], true), 404);
        $query->update([$field => $value]);
    }

    private function bulkCategory($query, array $config, ?int $categoryId): void
    {
        abort_unless(in_array('categoryId', $config['fillable'], true), 404);
        $query->update(['categoryId' => $categoryId]);
    }

    private function validated(Request $request, array $config, ?Model $item = null): array
    {
        if (($config['key'] ?? null) === 'media') {
            return $request->validate(['file' => ['required', 'file', 'mimes:jpg,jpeg,png,webp,gif,pdf', 'max:5120']]);
        }

        $rules = [];
        foreach ($config['fields'] as $field) {
            $name = $field['name'];
            if (! in_array($name, $config['fillable'], true)) {
                continue;
            }

            $rule = match ($field['type']) {
                'boolean' => ['sometimes', 'boolean'],
                'number' => ['nullable', 'integer'],
                'datetime' => ['nullable', 'date'],
                'select' => ['nullable', 'string'],
                'email' => ['nullable', 'email', 'max:191'],
                'textarea', 'richtext' => ['nullable', 'string'],
                default => ['nullable', 'string', 'max:191'],
            };

            if ($field['required'] ?? false) {
                $rule = array_values(array_filter($rule, fn ($value) => $value !== 'nullable'));
                array_unshift($rule, 'required');
            }

            if (($field['slugFrom'] ?? null) && ! $request->filled($name)) {
                continue;
            }

            if ($name === 'slug') {
                $rule[] = Rule::unique($config['table'], 'slug')->ignore($item?->getKey());
            }

            $rules[$name] = $rule;
        }

        $data = $request->validate($rules);

        foreach ($config['fields'] as $field) {
            if (($field['slugFrom'] ?? null) && empty($data[$field['name']]) && $request->filled($field['slugFrom'])) {
                $data[$field['name']] = Str::slug((string) $request->input($field['slugFrom']));
            }

            if ($field['type'] === 'boolean') {
                $data[$field['name']] = $request->boolean($field['name']);
            }

            if ($field['type'] === 'richtext' && isset($data[$field['name']])) {
                $data[$field['name']] = HtmlSanitizer::clean($data[$field['name']]);
            }
        }

        if (in_array('createdAt', $config['fillable'], true)) {
            if ($item && ! $request->filled('createdAt')) {
                unset($data['createdAt']);
            } elseif (! $item && empty($data['createdAt'])) {
                $data['createdAt'] = now();
            }
        }

        return Arr::only($data, $config['fillable']);
    }

    private function storeMedia(Request $request): Media
    {
        $request->validate(['file' => ['required', 'file', 'mimes:jpg,jpeg,png,webp,gif,pdf', 'max:5120']]);
        $file = $request->file('file');
        $path = $file->store('cms', 'public');

        if (! is_string($path) || $path === '' || ! Storage::disk('public')->exists($path)) {
            throw ValidationException::withMessages([
                'file' => 'File gagal disimpan ke storage publik. Periksa izin folder storage lalu coba lagi.',
            ]);
        }

        return Media::create([
            'filename' => $file->getClientOriginalName(),
            'filepath' => $path,
            'mimetype' => $file->getMimeType() ?: 'application/octet-stream',
            'size' => $file->getSize(),
            'url' => Storage::disk('public')->url($path),
        ]);
    }

    private function mediaIndex(Request $request, array $config): View
    {
        $query = Media::query();
        $search = trim((string) $request->query('q', ''));
        $type = (string) $request->query('file_type', 'all');

        if ($search !== '') {
            $query->where(function ($query) use ($search) {
                $query
                    ->where('filename', 'like', "%{$search}%")
                    ->orWhere('url', 'like', "%{$search}%")
                    ->orWhere('mimetype', 'like', "%{$search}%");
            });
        }

        match ($type) {
            'image' => $query->where('mimetype', 'like', 'image/%'),
            'pdf' => $query->where('mimetype', 'application/pdf'),
            'other' => $query
                ->where('mimetype', 'not like', 'image/%')
                ->where('mimetype', '!=', 'application/pdf'),
            default => null,
        };

        return view('cms.media.index', [
            'resource' => 'media',
            'config' => Arr::except($config, ['model']),
            'items' => $query
                ->orderBy('createdAt', 'desc')
                ->paginate(20)
                ->withQueryString(),
            'filters' => [
                'q' => $search,
                'file_type' => $type,
            ],
            'stats' => [
                'all' => Media::count(),
                'image' => Media::query()->where('mimetype', 'like', 'image/%')->count(),
                'pdf' => Media::query()->where('mimetype', 'application/pdf')->count(),
            ],
        ]);
    }

    private function settingsIndex(array $config): View
    {
        $groups = $this->settingGroups();
        $knownKeys = collect($groups)
            ->flatMap(fn (array $group) => collect($group['fields'])->pluck('key'))
            ->values()
            ->all();
        $settings = Setting::query()
            ->orderBy('key')
            ->get()
            ->pluck('value', 'key')
            ->all();
        $seoAutoLinks = collect(json_decode($settings['seo_auto_links'] ?? '[]', true) ?: [])
            ->filter(fn ($item) => is_array($item))
            ->map(fn (array $item) => [
                'keyword' => (string) ($item['keyword'] ?? ''),
                'url' => (string) ($item['url'] ?? ''),
            ])
            ->filter(fn (array $item) => $item['keyword'] !== '' || $item['url'] !== '')
            ->values()
            ->all();

        return view('cms.settings.index', [
            'resource' => 'settings',
            'config' => Arr::except($config, ['model']),
            'groups' => $groups,
            'settings' => $settings,
            'seoAutoLinks' => $seoAutoLinks,
            'rawSettings' => Setting::query()
                ->whereNotIn('key', $knownKeys)
                ->orderBy('key')
                ->get(),
        ]);
    }

    private function storeSettings(Request $request, array $config): RedirectResponse
    {
        $validated = $request->validate([
            'settings' => ['array'],
            'settings.*' => ['nullable', 'string'],
            'seo_auto_link_keywords' => ['array'],
            'seo_auto_link_keywords.*' => ['nullable', 'string', 'max:191'],
            'seo_auto_link_urls' => ['array'],
            'seo_auto_link_urls.*' => ['nullable', 'string', 'max:255'],
            'delete_keys' => ['array'],
            'delete_keys.*' => ['string', 'max:191'],
            'new_key' => ['nullable', 'string', 'max:191', 'regex:/^[A-Za-z0-9_.-]+$/'],
            'new_value' => ['nullable', 'string'],
        ]);

        $settingsInput = $validated['settings'] ?? [];
        $seoLinks = [];
        $keywords = $validated['seo_auto_link_keywords'] ?? [];
        $urls = $validated['seo_auto_link_urls'] ?? [];

        foreach ($keywords as $index => $keyword) {
            $url = $urls[$index] ?? '';
            $keyword = trim((string) $keyword);
            $url = trim((string) $url);

            if ($keyword === '' && $url === '') {
                continue;
            }

            $seoLinks[] = [
                'keyword' => $keyword,
                'url' => $url,
            ];
        }

        $settingsInput['seo_auto_links'] = json_encode($seoLinks, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);

        foreach ($settingsInput as $key => $value) {
            if (! is_string($key) || ! preg_match('/^[A-Za-z0-9_.-]+$/', $key)) {
                continue;
            }

            Setting::updateOrCreate(
                ['key' => $key],
                ['value' => (string) ($value ?? '')]
            );
        }

        if (! empty($validated['new_key'])) {
            Setting::updateOrCreate(
                ['key' => $validated['new_key']],
                ['value' => (string) ($validated['new_value'] ?? '')]
            );
        }

        if (! empty($validated['delete_keys'])) {
            Setting::query()->whereIn('key', $validated['delete_keys'])->delete();
        }

        return redirect()
            ->route('cms.index', 'settings')
            ->with('success', "{$config['singular']} berhasil disimpan.");
    }

    private function options(array $config): array
    {
        return [
            'categories' => Category::query()
                ->orderBy('name')
                ->get(['id', 'name', 'type'])
                ->map(fn (Category $category) => [
                    'value' => $category->id,
                    'label' => "{$category->name} ({$category->type})",
                ]),
            'posts' => Post::query()
                ->orderBy('title')
                ->get(['id', 'title'])
                ->map(fn (Post $post) => ['value' => $post->id, 'label' => $post->title]),
            'cityPages' => CityPage::query()
                ->orderBy('title')
                ->get(['id', 'title'])
                ->map(fn (CityPage $page) => ['value' => $page->id, 'label' => $page->title]),
        ];
    }

    private function config(string $resource): array
    {
        $resources = [
            'posts' => [
                'key' => 'posts',
                'table' => 'post',
                'model' => Post::class,
                'title' => 'Blog Posts',
                'singular' => 'Artikel',
                'description' => 'Kelola artikel blog, kategori, status publish, dan metadata SEO.',
                'fillable' => ['title', 'slug', 'content', 'published', 'featuredImage', 'categoryId', 'metaTitle', 'metaDescription', 'createdAt'],
                'search' => ['title', 'slug', 'metaTitle'],
                'sort' => ['createdAt', 'desc'],
                'filters' => ['published'],
                'with' => ['category'],
                'columns' => [
                    ['key' => 'title', 'label' => 'Judul', 'primary' => true],
                    ['key' => 'category.name', 'label' => 'Kategori'],
                    ['key' => 'published', 'label' => 'Status', 'type' => 'boolean'],
                    ['key' => 'createdAt', 'label' => 'Dibuat', 'type' => 'date'],
                ],
                'fields' => $this->contentFields('title', true),
            ],
            'pages' => [
                'key' => 'pages',
                'table' => 'page',
                'model' => Page::class,
                'title' => 'Pages',
                'singular' => 'Page',
                'description' => 'Kelola halaman CMS statis dan metadata SEO.',
                'fillable' => ['title', 'slug', 'content', 'published', 'metaTitle', 'metaDescription', 'createdAt'],
                'search' => ['title', 'slug', 'metaTitle'],
                'sort' => ['updatedAt', 'desc'],
                'filters' => ['published'],
                'columns' => [
                    ['key' => 'title', 'label' => 'Judul', 'primary' => true],
                    ['key' => 'published', 'label' => 'Status', 'type' => 'boolean'],
                    ['key' => 'updatedAt', 'label' => 'Update', 'type' => 'date'],
                ],
                'fields' => $this->contentFields('title', false),
            ],
            'products' => [
                'key' => 'products',
                'table' => 'product',
                'model' => Product::class,
                'title' => 'Products',
                'singular' => 'Produk',
                'description' => 'Kelola katalog produk, harga dasar, kategori, dan status tampil.',
                'fillable' => ['sku', 'name', 'slug', 'specs', 'accessories', 'basePrice', 'minOrder', 'shortDescription', 'sheetStatus', 'sites', 'sortOrder', 'featuredImage', 'categoryId', 'description', 'published', 'metaTitle', 'metaDescription', 'createdAt'],
                'search' => ['name', 'slug', 'sku', 'shortDescription'],
                'sort' => ['sortOrder', 'asc'],
                'filters' => ['published'],
                'with' => ['category'],
                'columns' => [
                    ['key' => 'name', 'label' => 'Nama', 'primary' => true],
                    ['key' => 'sku', 'label' => 'SKU'],
                    ['key' => 'category.name', 'label' => 'Kategori'],
                    ['key' => 'basePrice', 'label' => 'Harga'],
                    ['key' => 'published', 'label' => 'Status', 'type' => 'boolean'],
                ],
                'fields' => [
                    ['name' => 'name', 'label' => 'Nama Produk', 'type' => 'text', 'required' => true],
                    ['name' => 'slug', 'label' => 'Slug', 'type' => 'text', 'slugFrom' => 'name'],
                    ['name' => 'sku', 'label' => 'SKU', 'type' => 'text'],
                    ['name' => 'categoryId', 'label' => 'Kategori', 'type' => 'select', 'optionsKey' => 'categories'],
                    ['name' => 'basePrice', 'label' => 'Harga Dasar', 'type' => 'text'],
                    ['name' => 'minOrder', 'label' => 'Minimum Order', 'type' => 'text'],
                    ['name' => 'sortOrder', 'label' => 'Urutan', 'type' => 'number'],
                    ['name' => 'featuredImage', 'label' => 'Featured Image URL', 'type' => 'text'],
                    ['name' => 'shortDescription', 'label' => 'Deskripsi Singkat', 'type' => 'textarea'],
                    ['name' => 'description', 'label' => 'Deskripsi', 'type' => 'richtext'],
                    ['name' => 'specs', 'label' => 'Spesifikasi', 'type' => 'textarea'],
                    ['name' => 'accessories', 'label' => 'Aksesoris', 'type' => 'textarea'],
                    ['name' => 'sheetStatus', 'label' => 'Sheet Status', 'type' => 'text'],
                    ['name' => 'sites', 'label' => 'Sites', 'type' => 'text'],
                    ['name' => 'published', 'label' => 'Published', 'type' => 'boolean'],
                    ['name' => 'createdAt', 'label' => 'Tanggal Publish', 'type' => 'datetime'],
                    ['name' => 'metaTitle', 'label' => 'Meta Title', 'type' => 'text'],
                    ['name' => 'metaDescription', 'label' => 'Meta Description', 'type' => 'textarea'],
                ],
            ],
            'categories' => [
                'key' => 'categories',
                'table' => 'category',
                'model' => Category::class,
                'title' => 'Categories',
                'singular' => 'Kategori',
                'description' => 'Kelola kategori blog dan produk.',
                'fillable' => ['name', 'slug', 'description', 'type'],
                'search' => ['name', 'slug', 'type'],
                'sort' => ['name', 'asc'],
                'filters' => ['type'],
                'columns' => [
                    ['key' => 'name', 'label' => 'Nama', 'primary' => true],
                    ['key' => 'slug', 'label' => 'Slug'],
                    ['key' => 'type', 'label' => 'Tipe'],
                ],
                'fields' => [
                    ['name' => 'name', 'label' => 'Nama', 'type' => 'text', 'required' => true],
                    ['name' => 'slug', 'label' => 'Slug', 'type' => 'text', 'slugFrom' => 'name'],
                    ['name' => 'type', 'label' => 'Tipe', 'type' => 'select', 'options' => [['value' => 'BLOG', 'label' => 'BLOG'], ['value' => 'PRODUCT', 'label' => 'PRODUCT']]],
                    ['name' => 'description', 'label' => 'Deskripsi', 'type' => 'textarea'],
                ],
            ],
            'media' => [
                'key' => 'media',
                'table' => 'media',
                'model' => Media::class,
                'title' => 'Media Library',
                'singular' => 'Media',
                'description' => 'Upload dan kelola file media lokal.',
                'fillable' => ['filename', 'filepath', 'mimetype', 'size', 'url'],
                'search' => ['filename', 'url', 'mimetype'],
                'sort' => ['createdAt', 'desc'],
                'columns' => [
                    ['key' => 'filename', 'label' => 'File', 'primary' => true],
                    ['key' => 'mimetype', 'label' => 'MIME'],
                    ['key' => 'size', 'label' => 'Size', 'type' => 'bytes'],
                    ['key' => 'url', 'label' => 'URL'],
                ],
                'fields' => [
                    ['name' => 'file', 'label' => 'Upload File', 'type' => 'file', 'required' => true],
                ],
            ],
            'comments' => [
                'key' => 'comments',
                'table' => 'comment',
                'model' => Comment::class,
                'title' => 'Comments',
                'singular' => 'Komentar',
                'description' => 'Moderasi komentar artikel.',
                'fillable' => ['postId', 'name', 'email', 'content', 'approved'],
                'search' => ['name', 'email', 'content'],
                'sort' => ['createdAt', 'desc'],
                'with' => ['post'],
                'columns' => [
                    ['key' => 'name', 'label' => 'Nama', 'primary' => true],
                    ['key' => 'email', 'label' => 'Email'],
                    ['key' => 'post.title', 'label' => 'Post'],
                    ['key' => 'approved', 'label' => 'Approved', 'type' => 'boolean'],
                ],
                'fields' => [
                    ['name' => 'postId', 'label' => 'Post', 'type' => 'select', 'optionsKey' => 'posts'],
                    ['name' => 'name', 'label' => 'Nama', 'type' => 'text', 'required' => true],
                    ['name' => 'email', 'label' => 'Email', 'type' => 'email'],
                    ['name' => 'content', 'label' => 'Komentar', 'type' => 'textarea'],
                    ['name' => 'approved', 'label' => 'Approved', 'type' => 'boolean'],
                ],
            ],
            'inquiries' => [
                'key' => 'inquiries',
                'table' => 'inquiry',
                'model' => Inquiry::class,
                'title' => 'Inquiries',
                'singular' => 'Inquiry',
                'description' => 'Pesan masuk dari form dan halaman public.',
                'fillable' => ['name', 'email', 'phone', 'message'],
                'search' => ['name', 'email', 'phone', 'message'],
                'sort' => ['createdAt', 'desc'],
                'columns' => [
                    ['key' => 'name', 'label' => 'Nama', 'primary' => true],
                    ['key' => 'email', 'label' => 'Email'],
                    ['key' => 'phone', 'label' => 'WhatsApp'],
                    ['key' => 'createdAt', 'label' => 'Tanggal', 'type' => 'date'],
                ],
                'fields' => [
                    ['name' => 'name', 'label' => 'Nama', 'type' => 'text', 'required' => true],
                    ['name' => 'email', 'label' => 'Email', 'type' => 'email'],
                    ['name' => 'phone', 'label' => 'WhatsApp', 'type' => 'text'],
                    ['name' => 'message', 'label' => 'Pesan', 'type' => 'textarea'],
                ],
            ],
            'city-pages' => [
                'key' => 'city-pages',
                'table' => 'citypage',
                'model' => CityPage::class,
                'title' => 'City Pages',
                'singular' => 'City Page',
                'description' => 'Kelola halaman kota dan struktur parent-child.',
                'fillable' => ['title', 'slug', 'content', 'published', 'featuredImage', 'parentId', 'metaTitle', 'metaDescription', 'createdAt'],
                'search' => ['title', 'slug', 'metaTitle'],
                'sort' => ['updatedAt', 'desc'],
                'filters' => ['published'],
                'columns' => [
                    ['key' => 'title', 'label' => 'Judul', 'primary' => true],
                    ['key' => 'published', 'label' => 'Status', 'type' => 'boolean'],
                ],
                'fields' => array_merge($this->contentFields('title', false), [
                    ['name' => 'parentId', 'label' => 'Parent', 'type' => 'select', 'optionsKey' => 'cityPages'],
                ]),
            ],
            'portfolio' => [
                'key' => 'portfolio',
                'table' => 'portfolio',
                'model' => Portfolio::class,
                'title' => 'Portfolio',
                'singular' => 'Portfolio',
                'description' => 'Kelola portfolio visual dan logo klien.',
                'fillable' => ['title', 'description', 'imageUrl', 'logoUrl', 'logoText', 'link'],
                'search' => ['title', 'description', 'logoText'],
                'sort' => ['createdAt', 'desc'],
                'columns' => [
                    ['key' => 'title', 'label' => 'Judul', 'primary' => true],
                    ['key' => 'logoText', 'label' => 'Logo Text'],
                    ['key' => 'link', 'label' => 'Link'],
                ],
                'fields' => [
                    ['name' => 'title', 'label' => 'Judul', 'type' => 'text', 'required' => true],
                    ['name' => 'description', 'label' => 'Deskripsi', 'type' => 'textarea'],
                    ['name' => 'imageUrl', 'label' => 'Image URL', 'type' => 'text'],
                    ['name' => 'logoUrl', 'label' => 'Logo URL', 'type' => 'text'],
                    ['name' => 'logoText', 'label' => 'Logo Text', 'type' => 'text'],
                    ['name' => 'link', 'label' => 'Link', 'type' => 'text'],
                ],
            ],
            'settings' => [
                'key' => 'settings',
                'table' => 'setting',
                'model' => Setting::class,
                'title' => 'Settings',
                'singular' => 'Setting',
                'description' => 'Kelola key-value setting website.',
                'fillable' => ['key', 'value'],
                'search' => ['key', 'value'],
                'sort' => ['key', 'asc'],
                'columns' => [
                    ['key' => 'key', 'label' => 'Key', 'primary' => true],
                    ['key' => 'value', 'label' => 'Value'],
                ],
                'fields' => [
                    ['name' => 'key', 'label' => 'Key', 'type' => 'text', 'required' => true],
                    ['name' => 'value', 'label' => 'Value', 'type' => 'textarea'],
                ],
            ],
            'orders' => [
                'key' => 'orders',
                'table' => 'order',
                'model' => Order::class,
                'title' => 'Orders',
                'singular' => 'Order',
                'description' => 'Pantau pesanan kalkulator dan request produksi.',
                'fillable' => ['userId', 'lanyardWidth', 'printingType', 'attachment', 'quantity', 'totalPrice', 'notes', 'status'],
                'search' => ['lanyardWidth', 'printingType', 'status', 'notes'],
                'sort' => ['createdAt', 'desc'],
                'columns' => [
                    ['key' => 'printingType', 'label' => 'Printing', 'primary' => true],
                    ['key' => 'quantity', 'label' => 'Qty'],
                    ['key' => 'totalPrice', 'label' => 'Total'],
                    ['key' => 'status', 'label' => 'Status'],
                ],
                'fields' => [
                    ['name' => 'lanyardWidth', 'label' => 'Lebar Lanyard', 'type' => 'text'],
                    ['name' => 'printingType', 'label' => 'Printing Type', 'type' => 'text'],
                    ['name' => 'attachment', 'label' => 'Attachment', 'type' => 'text'],
                    ['name' => 'quantity', 'label' => 'Quantity', 'type' => 'number'],
                    ['name' => 'totalPrice', 'label' => 'Total Price', 'type' => 'number'],
                    ['name' => 'status', 'label' => 'Status', 'type' => 'text'],
                    ['name' => 'notes', 'label' => 'Notes', 'type' => 'textarea'],
                ],
            ],
        ];

        abort_unless(isset($resources[$resource]), 404);

        return $resources[$resource];
    }

    private function settingGroups(): array
    {
        return [
            'umum' => [
                'label' => 'Umum',
                'description' => 'Identitas utama website dan teks dasar brand.',
                'fields' => [
                    ['key' => 'site_title', 'label' => 'Site Title', 'type' => 'text', 'placeholder' => 'Lanyard Depok'],
                    ['key' => 'site_description', 'label' => 'Site Description', 'type' => 'textarea', 'placeholder' => 'Cetak lanyard custom untuk kebutuhan brand dan event.'],
                    ['key' => 'footer_text', 'label' => 'Footer Text', 'type' => 'textarea'],
                ],
            ],
            'brand-media' => [
                'label' => 'Brand Media',
                'description' => 'Logo, favicon, dan gambar preview untuk kebutuhan brand/SEO.',
                'fields' => [
                    ['key' => 'site_logo', 'label' => 'Logo Utama', 'type' => 'image', 'fallback' => '/uploads/lanyarddepok-logo.webp'],
                    ['key' => 'site_logo_header', 'label' => 'Logo Header', 'type' => 'image', 'fallback' => '/uploads/lanyarddepok-logo-header.webp'],
                    ['key' => 'site_logo_mobile', 'label' => 'Logo Mobile', 'type' => 'image', 'fallback' => '/uploads/lanyarddepok-logo-mobile.webp'],
                    ['key' => 'site_favicon', 'label' => 'Favicon', 'type' => 'image', 'fallback' => '/uploads/lanyarddepok-favicon.webp'],
                    ['key' => 'og_image', 'label' => 'Open Graph Image', 'type' => 'image', 'fallback' => '/uploads/featured-products-showcase-lanyarddepok-v2.webp'],
                ],
            ],
            'kontak' => [
                'label' => 'Kontak',
                'description' => 'Nomor, email, alamat, dan kanal kontak public.',
                'fields' => [
                    ['key' => 'contact_phone', 'label' => 'Telepon', 'type' => 'text', 'placeholder' => '+62 822-1020-0700'],
                    ['key' => 'contact_whatsapp', 'label' => 'WhatsApp', 'type' => 'text', 'placeholder' => '6282210200700'],
                    ['key' => 'contact_email', 'label' => 'Email', 'type' => 'email', 'placeholder' => 'info@lanyarddepok.com'],
                    ['key' => 'contact_address', 'label' => 'Alamat', 'type' => 'textarea', 'placeholder' => 'Depok, Indonesia'],
                ],
            ],
            'seo' => [
                'label' => 'SEO',
                'description' => 'Metadata homepage, verifikasi, dan auto link.',
                'fields' => [
                    ['key' => 'seo_meta_title', 'label' => 'SEO Meta Title', 'type' => 'text'],
                    ['key' => 'seo_meta_description', 'label' => 'SEO Meta Description', 'type' => 'textarea'],
                    ['key' => 'google_site_verification', 'label' => 'Google Site Verification', 'type' => 'text'],
                    ['key' => 'bing_site_verification', 'label' => 'Bing Site Verification', 'type' => 'text'],
                    ['key' => 'seo_auto_links', 'label' => 'Auto Link SEO', 'type' => 'auto_links'],
                    ['key' => 'seo_auto_links_limit', 'label' => 'Maksimal Auto Link per Halaman', 'type' => 'number', 'placeholder' => '2'],
                ],
            ],
            'sosial' => [
                'label' => 'Sosial',
                'description' => 'Link sosial media brand.',
                'fields' => [
                    ['key' => 'social_instagram', 'label' => 'Instagram', 'type' => 'text'],
                    ['key' => 'social_facebook', 'label' => 'Facebook', 'type' => 'text'],
                    ['key' => 'social_tiktok', 'label' => 'TikTok', 'type' => 'text'],
                ],
            ],
            'keamanan' => [
                'label' => 'Keamanan',
                'description' => 'Turnstile dan OTP untuk proteksi form/login.',
                'fields' => [
                    ['key' => 'turnstile_homepage_enabled', 'label' => 'Turnstile Homepage Enabled', 'type' => 'select', 'options' => ['false' => 'Nonaktif', 'true' => 'Aktif']],
                    ['key' => 'turnstile_site_key', 'label' => 'Turnstile Site Key', 'type' => 'text'],
                    ['key' => 'turnstile_secret_key', 'label' => 'Turnstile Secret Key', 'type' => 'textarea'],
                    ['key' => 'otp_verify_url', 'label' => 'OTP Verify URL', 'type' => 'text'],
                    ['key' => 'otp_api_key', 'label' => 'OTP API Key', 'type' => 'textarea'],
                    ['key' => 'otp_target', 'label' => 'OTP Target', 'type' => 'text'],
                ],
            ],
            'integrasi' => [
                'label' => 'Integrasi Google',
                'description' => 'GA4, Search Console, dan Google Sheets produk.',
                'fields' => [
                    ['key' => 'google_service_account_json', 'label' => 'Credential Google', 'type' => 'credential'],
                    ['key' => 'google_analytics_measurement_id', 'label' => 'GA Measurement ID', 'type' => 'text', 'placeholder' => 'G-XXXXXXXXXX'],
                    ['key' => 'google_analytics_property_id', 'label' => 'GA4 Property ID', 'type' => 'text'],
                    ['key' => 'google_search_console_site_url', 'label' => 'Search Console Site URL', 'type' => 'text'],
                    ['key' => 'google_spreadsheet_id', 'label' => 'Spreadsheet ID', 'type' => 'text'],
                    ['key' => 'google_spreadsheet_range', 'label' => 'Spreadsheet Range', 'type' => 'text', 'placeholder' => 'Sheet1!A:Z'],
                ],
            ],
        ];
    }

    private function contentFields(string $titleField, bool $withCategory): array
    {
        $fields = [
            ['name' => $titleField, 'label' => 'Judul', 'type' => 'text', 'required' => true],
            ['name' => 'slug', 'label' => 'Slug', 'type' => 'text', 'slugFrom' => $titleField],
        ];

        if ($withCategory) {
            $fields[] = ['name' => 'categoryId', 'label' => 'Kategori', 'type' => 'select', 'optionsKey' => 'categories'];
        }

        return array_merge($fields, [
            ['name' => 'featuredImage', 'label' => 'Featured Image URL', 'type' => 'text'],
            ['name' => 'content', 'label' => 'Konten HTML', 'type' => 'richtext'],
            ['name' => 'published', 'label' => 'Published', 'type' => 'boolean'],
            ['name' => 'createdAt', 'label' => 'Tanggal Publish', 'type' => 'datetime'],
            ['name' => 'metaTitle', 'label' => 'Meta Title', 'type' => 'text'],
            ['name' => 'metaDescription', 'label' => 'Meta Description', 'type' => 'textarea'],
        ]);
    }
}
