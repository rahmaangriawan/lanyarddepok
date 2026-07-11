<?php

use App\Models\Category;
use App\Models\CityPage;
use App\Models\Comment;
use App\Models\AuthorSlugRedirect;
use App\Models\Inquiry;
use App\Models\Media;
use App\Models\Order;
use App\Models\Page;
use App\Models\Portfolio;
use App\Models\Post;
use App\Models\Product;
use App\Models\Setting;
use App\Models\User;
use App\Support\PublicApi;
use App\Support\ArticlePreview;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

Route::get('/health', fn () => ['ok' => true, 'app' => 'lanyarddepok-laravel']);

Route::get('/turnstile-config', function () {
    $settings = PublicApi::settings(['turnstile_homepage_enabled', 'turnstile_site_key']);

    return [
        'enabled' => ($settings['turnstile_homepage_enabled'] ?? 'false') === 'true',
        'siteKey' => $settings['turnstile_site_key'] ?? '',
    ];
});

Route::get('/public-settings', function () {
    return PublicApi::noStoreJson([
        'success' => true,
        'settings' => PublicApi::settings([
            'site_title',
            'site_description',
            'site_logo',
            'site_favicon',
            'og_image',
            'contact_phone',
            'contact_whatsapp',
            'contact_email',
            'contact_address',
            'seo_meta_title',
            'seo_meta_description',
            'google_site_verification',
            'bing_site_verification',
            'social_instagram',
            'social_facebook',
            'social_tiktok',
            'seo_auto_links',
            'seo_auto_links_limit',
        ]),
    ]);
});

Route::get('/sitemap', function () {
    return PublicApi::noStoreJson([
        'success' => true,
        'sitemap' => [
            'posts' => Post::query()
                ->where('published', true)
                ->orderByDesc('updatedAt')
                ->get(['slug', 'updatedAt']),
            'products' => Product::query()
                ->where('published', true)
                ->orderByDesc('updatedAt')
                ->get(['slug', 'sku', 'updatedAt'])
                ->map(fn (Product $product) => [
                    'slug' => $product->slug ?: $product->sku,
                    'updatedAt' => $product->updatedAt,
                ])
                ->filter(fn (array $product) => filled($product['slug']))
                ->values(),
            'pages' => Page::query()
                ->where('published', true)
                ->orderByDesc('updatedAt')
                ->get(['slug', 'updatedAt']),
            'cityPages' => CityPage::query()
                ->where('published', true)
                ->orderByDesc('updatedAt')
                ->get(['slug', 'updatedAt']),
            'authors' => User::query()
                ->whereNotNull('slug')
                ->whereHas('posts', fn ($query) => $query->where('published', true))
                ->orderBy('name')
                ->get(['slug', 'updatedAt']),
        ],
    ]);
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
                $product->name = PublicApi::normalizeText($product->name);
                $product->description = PublicApi::normalizeText($product->description);
                $product->shortDescription = PublicApi::normalizeText($product->shortDescription);
                $product->metaTitle = PublicApi::normalizeText($product->metaTitle);
                $product->metaDescription = PublicApi::normalizeText($product->metaDescription);

                return $product;
            });
    }, collect(), false);

    return PublicApi::noStoreJson(['success' => true, 'products' => $products]);
});

Route::get('/products/{slug}', function (string $slug) {
    $product = Product::query()
        ->with('category:id,name,slug')
        ->where('published', true)
        ->where(fn ($query) => $query->where('slug', $slug)->orWhere('sku', $slug))
        ->firstOrFail();

    return PublicApi::noStoreJson(['success' => true, 'product' => $product]);
});

Route::get('/categories', function (Request $request) {
    $type = $request->query('type', 'PRODUCT');

    return PublicApi::json([
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

    return PublicApi::noStoreJson([
        'success' => true,
        'posts' => rescue(
            fn () => Post::query()
                ->select(['id', 'title', 'slug', 'featuredImage', 'categoryId', 'authorId', 'createdAt', 'updatedAt', 'metaTitle', 'metaDescription'])
                ->with(['category:id,name,slug', 'author:id,name,slug,bio,avatar'])
                ->where('published', true)
                ->when($request->query('category'), fn ($query, $slug) => $query->whereHas('category', fn ($category) => $category->where('slug', $slug)->where('type', 'BLOG')))
                ->orderByDesc('createdAt')
                ->paginate($limit),
            [],
            false,
        ),
    ]);
});

Route::get('/authors/{slug}', function (string $slug, Request $request) {
    $author = User::query()
        ->select(['id', 'name', 'slug', 'bio', 'avatar', 'updatedAt'])
        ->where('slug', $slug)
        ->first();

    if (! $author) {
        $redirect = AuthorSlugRedirect::query()
            ->with('author:id,slug')
            ->where('slug', $slug)
            ->first();

        if ($redirect?->author?->slug) {
            return PublicApi::noStoreJson([
                'success' => true,
                'author' => null,
                'posts' => [],
                'redirectTo' => "/penulis/{$redirect->author->slug}",
            ]);
        }

        abort(404);
    }

    $limit = max(1, min($request->integer('limit') ?: 6, 24));

    return PublicApi::noStoreJson([
        'success' => true,
        'author' => $author,
        'posts' => Post::query()
            ->select(['id', 'title', 'slug', 'featuredImage', 'categoryId', 'authorId', 'createdAt', 'updatedAt', 'metaTitle', 'metaDescription'])
            ->with(['category:id,name,slug', 'author:id,name,slug,bio,avatar'])
            ->where('published', true)
            ->where('authorId', $author->id)
            ->orderByDesc('createdAt')
            ->paginate($limit),
    ]);
});

Route::get('/posts/{slug}', function (string $slug, Request $request) {
    $previewId = $request->query('preview');

    $query = Post::query()
        ->with(['category:id,name,slug', 'author:id,name,slug,bio,avatar', 'comments' => fn ($query) => $query->where('approved', true)->orderByDesc('createdAt')])
        ->where('slug', $slug);

    if ($previewId) {
        abort_unless(ArticlePreview::isValid(
            (int) $previewId,
            $slug,
            $request->query('expires'),
            $request->query('signature'),
        ), 404);
        $query->where('id', $previewId);
    } else {
        $query->where('published', true);
    }

    $post = $query->firstOrFail();

    return PublicApi::noStoreJson(['success' => true, 'post' => PublicApi::sanitizeContent($post)]);
});

Route::get('/pages/{slug}', fn (string $slug) => PublicApi::noStoreJson([
    'success' => true,
    'page' => PublicApi::sanitizeContent(Page::query()->where('published', true)->where('slug', $slug)->firstOrFail()),
]));

Route::get('/city-pages/{slug}', fn (string $slug) => PublicApi::noStoreJson([
    'success' => true,
    'cityPage' => PublicApi::sanitizeContent(CityPage::query()->where('published', true)->where('slug', $slug)->firstOrFail()),
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

    $settings = PublicApi::settings(['turnstile_homepage_enabled', 'turnstile_secret_key']);
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

    Route::get('/settings', fn () => ['success' => true, 'settings' => PublicApi::settings()]);
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

        if (! is_string($path) || $path === '' || ! Storage::disk('public')->exists($path)) {
            throw ValidationException::withMessages([
                'file' => 'File gagal disimpan ke storage publik. Periksa izin folder storage lalu coba lagi.',
            ]);
        }

        $media = Media::create([
            'filename' => $filename,
            'filepath' => $path,
            'mimetype' => $file->getMimeType() ?: 'application/octet-stream',
            'size' => $file->getSize(),
            'url' => Storage::disk('public')->url($path),
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
