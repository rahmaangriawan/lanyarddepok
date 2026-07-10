<?php

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
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

if (! function_exists('settings_map')) {
    function settings_map(?array $keys = null): array
    {
        return Setting::query()
            ->when($keys, fn ($query) => $query->whereIn('key', $keys))
            ->pluck('value', 'key')
            ->all();
    }
}

if (! function_exists('public_json')) {
    function public_json(array $payload, int $seconds = 600)
    {
        return response()->json($payload)
            ->header('Cache-Control', "public, s-maxage={$seconds}, stale-while-revalidate=300");
    }
}

if (! function_exists('sanitize_public_content')) {
    function sanitize_public_content($model)
    {
        if ($model && isset($model->content)) {
            $model->content = HtmlSanitizer::clean($model->content);
        }

        return $model;
    }
}

if (! function_exists('slug_from')) {
    function slug_from(string $value): string
    {
        return Str::slug($value) ?: Str::random(8);
    }
}

if (! function_exists('normalize_depok_text')) {
    function normalize_depok_text(?string $value): ?string
    {
        return is_string($value) ? str_replace(['lanyardbogor', 'Lanyard Bogor', 'Bogor'], ['lanyarddepok', 'Lanyard Depok', 'Depok'], $value) : $value;
    }
}

Route::get('/health', fn () => ['ok' => true, 'app' => 'lanyarddepok-laravel']);

Route::get('/turnstile-config', function () {
    $settings = settings_map(['turnstile_homepage_enabled', 'turnstile_site_key']);

    return [
        'enabled' => ($settings['turnstile_homepage_enabled'] ?? 'false') === 'true',
        'siteKey' => $settings['turnstile_site_key'] ?? '',
    ];
});

Route::get('/public-settings', function () {
    return public_json([
        'success' => true,
        'settings' => settings_map(['seo_auto_links', 'seo_auto_links_limit']),
    ], 300);
});

Route::get('/products', function (Request $request) {
    $products = rescue(function () use ($request) {
        $query = Product::query()
            ->with('category:id,name,slug')
            ->where('published', true)
            ->orderBy('sortOrder')
            ->orderByDesc('createdAt');

        if ($search = trim((string) $request->query('q', ''))) {
            $query->where(function ($builder) use ($search) {
                $builder
                    ->where('name', 'like', "%{$search}%")
                    ->orWhere('sku', 'like', "%{$search}%")
                    ->orWhere('specs', 'like', "%{$search}%")
                    ->orWhere('accessories', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        return $query
            ->when($request->integer('limit') > 0, fn ($builder) => $builder->limit($request->integer('limit')))
            ->get()
            ->map(function (Product $product) {
                $product->name = normalize_depok_text($product->name);
                $product->description = normalize_depok_text($product->description);
                $product->shortDescription = normalize_depok_text($product->shortDescription);
                $product->metaTitle = normalize_depok_text($product->metaTitle);
                $product->metaDescription = normalize_depok_text($product->metaDescription);

                return $product;
            });
    }, collect(), false);

    return public_json(['success' => true, 'products' => $products]);
});

Route::get('/products/{slug}', function (string $slug) {
    $product = Product::query()
        ->with('category:id,name,slug')
        ->where('published', true)
        ->where(fn ($query) => $query->where('slug', $slug)->orWhere('sku', $slug))
        ->firstOrFail();

    return public_json(['success' => true, 'product' => $product]);
});

Route::get('/categories', function (Request $request) {
    $type = $request->query('type', 'PRODUCT');

    return public_json([
        'success' => true,
        'categories' => rescue(
            fn () => Category::query()
                ->where('type', $type)
                ->orderBy('name')
                ->limit($request->integer('limit') ?: 5)
                ->get(),
            collect(),
            false,
        ),
    ]);
});

Route::get('/posts', function (Request $request) {
    $limit = max(1, min($request->integer('limit') ?: 10, 50));

    return public_json([
        'success' => true,
        'posts' => rescue(
            fn () => Post::query()
                ->select(['id', 'title', 'slug', 'featuredImage', 'categoryId', 'createdAt', 'metaTitle', 'metaDescription'])
                ->with('category:id,name,slug')
                ->where('published', true)
                ->when($request->query('category'), fn ($query, $slug) => $query->whereHas('category', fn ($category) => $category->where('slug', $slug)->where('type', 'BLOG')))
                ->orderByDesc('createdAt')
                ->paginate($limit),
            [],
            false,
        ),
    ]);
});

Route::get('/posts/{slug}', function (string $slug, Request $request) {
    $previewId = $request->query('preview');

    $query = Post::query()
        ->with(['category:id,name,slug', 'comments' => fn ($query) => $query->where('approved', true)->orderByDesc('createdAt')])
        ->where('slug', $slug);

    if ($previewId) {
        $query->where('id', $previewId);
    } else {
        $query->where('published', true);
    }

    $post = $query->firstOrFail();

    return public_json(['success' => true, 'post' => sanitize_public_content($post)]);
});

Route::get('/pages/{slug}', fn (string $slug) => public_json([
    'success' => true,
    'page' => sanitize_public_content(Page::query()->where('published', true)->where('slug', $slug)->firstOrFail()),
]));

Route::get('/city-pages/{slug}', fn (string $slug) => public_json([
    'success' => true,
    'cityPage' => sanitize_public_content(CityPage::query()->where('published', true)->where('slug', $slug)->firstOrFail()),
]));

Route::post('/comments', function (Request $request) {
    $data = $request->validate([
        'postId' => ['required', 'integer', 'exists:post,id'],
        'name' => ['required', 'string', 'min:2', 'max:120'],
        'email' => ['required', 'email', 'max:190'],
        'content' => ['required', 'string', 'min:3'],
    ]);

    $comment = Comment::create([
        'postId' => $data['postId'],
        'name' => trim($data['name']),
        'email' => strtolower(trim($data['email'])),
        'content' => trim($data['content']),
        'approved' => false,
    ]);

    return response()->json([
        'success' => true,
        'message' => 'Komentar berhasil dikirim dan menunggu persetujuan admin.',
        'comment' => $comment,
    ], 201);
})->middleware('throttle:5,10');

Route::post('/inquiries', function (Request $request) {
    $data = $request->validate([
        'name' => ['required', 'string', 'min:3', 'max:160'],
        'email' => ['required', 'email', 'max:190'],
        'phone' => ['required', 'string', 'min:8', 'max:25'],
        'message' => ['required', 'string', 'min:10'],
        'turnstileToken' => ['nullable', 'string'],
    ]);

    $settings = settings_map(['turnstile_homepage_enabled', 'turnstile_secret_key']);
    if (($settings['turnstile_homepage_enabled'] ?? 'false') === 'true') {
        $response = Http::asForm()->post('https://challenges.cloudflare.com/turnstile/v0/siteverify', [
            'secret' => $settings['turnstile_secret_key'] ?? '',
            'response' => $data['turnstileToken'] ?? '',
            'remoteip' => $request->ip(),
        ]);

        if (! $response->json('success')) {
            return response()->json(['error' => 'Verifikasi keamanan gagal. Silakan coba lagi.'], 400);
        }
    }

    $inquiry = Inquiry::create([
        'name' => trim($data['name']),
        'email' => strtolower(trim($data['email'])),
        'phone' => trim($data['phone']),
        'message' => trim($data['message']),
    ]);

    return response()->json(['success' => true, 'inquiry' => $inquiry], 201);
})->middleware('throttle:3,5');

Route::middleware(['auth:sanctum', 'admin'])->prefix('cms')->group(function () {
    Route::get('/stats', fn () => [
        'success' => true,
        'stats' => [
            'products' => Product::count(),
            'pages' => Page::count(),
            'posts' => Post::count(),
            'media' => Media::count(),
            'comments' => Comment::count(),
        ],
        'recentActivity' => Post::query()->latest('createdAt')->limit(5)->get(['id', 'title', 'slug', 'published', 'featuredImage', 'createdAt']),
    ]);

    Route::get('/settings', fn () => ['success' => true, 'settings' => settings_map()]);
    Route::post('/settings', function (Request $request) {
        foreach ($request->all() as $key => $value) {
            Setting::updateOrCreate(['key' => $key], ['value' => (string) $value]);
        }

        return ['success' => true, 'message' => 'Settings updated successfully'];
    });

    Route::apiResource('/categories', \App\Http\Controllers\Api\CategoryController::class)->except(['show']);
    Route::apiResource('/posts', \App\Http\Controllers\Api\PostController::class);
    Route::apiResource('/pages', \App\Http\Controllers\Api\PageController::class);
    Route::apiResource('/cities', \App\Http\Controllers\Api\CityPageController::class);
    Route::apiResource('/portofolio', \App\Http\Controllers\Api\PortfolioController::class)->except(['show']);

    Route::get('/products', fn (Request $request) => ['success' => true, 'products' => Product::with('category')->orderBy('sortOrder')->orderByDesc('updatedAt')->paginate(max(1, min($request->integer('per_page') ?: 50, 100)))]);
    Route::get('/products/{sku}', fn (string $sku) => ['success' => true, 'product' => Product::with('category')->where('sku', $sku)->firstOrFail()]);
    Route::put('/products/{sku}', function (Request $request, string $sku) {
        $product = Product::firstOrNew(['sku' => $sku]);
        $product->fill($request->only(['featuredImage', 'categoryId', 'description', 'published', 'metaTitle', 'metaDescription']));
        $product->published = $request->boolean('published');
        $product->save();

        return ['success' => true, 'product' => $product];
    });

    Route::get('/comments', fn (Request $request) => ['success' => true, 'comments' => Comment::with('post:id,title,slug')->latest('createdAt')->paginate(max(1, min($request->integer('per_page') ?: 50, 100)))]);
    Route::patch('/comments/{comment}', function (Request $request, Comment $comment) {
        $comment->update(['approved' => $request->boolean('approved')]);

        return ['success' => true, 'comment' => $comment];
    });
    Route::delete('/comments/{comment}', fn (Comment $comment) => tap(['success' => true], fn () => $comment->delete()));

    Route::get('/media', fn () => ['success' => true, 'mediaList' => Media::latest('createdAt')->paginate(24)]);
    Route::post('/media', function (Request $request) {
        $request->validate(['file' => ['required', 'image', 'mimes:jpg,jpeg,png,webp,gif', 'max:8192']]);
        $file = $request->file('file');
        $filename = Str::slug(pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME)).'-'.Str::uuid().'.'.$file->extension();
        $path = $file->storeAs('uploads', $filename, 'public');
        $media = Media::create([
            'filename' => $filename,
            'filepath' => 'storage/'.$path,
            'mimetype' => $file->getMimeType() ?: 'application/octet-stream',
            'size' => $file->getSize(),
            'url' => Storage::url($path),
        ]);

        return response()->json(['success' => true, 'media' => $media], 201);
    });
    Route::delete('/media/{media}', fn (Media $media) => tap(['success' => true], function () use ($media) {
        Storage::disk('public')->delete(str_replace('/storage/', '', $media->url));
        $media->delete();
    }));

    Route::get('/inquiries', fn (Request $request) => ['success' => true, 'inquiries' => Inquiry::latest('createdAt')->paginate(max(1, min($request->integer('per_page') ?: 50, 100)))]);
    Route::delete('/inquiries/{inquiry}', fn (Inquiry $inquiry) => tap(['success' => true], fn () => $inquiry->delete()));
    Route::get('/portfolios', fn (Request $request) => ['success' => true, 'portfolios' => Portfolio::latest('createdAt')->paginate(max(1, min($request->integer('per_page') ?: 50, 100)))]);
});
