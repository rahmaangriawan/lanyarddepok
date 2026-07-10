<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\Cms\CmsResourceController;
use App\Http\Controllers\Cms\DashboardController;
use App\Http\Controllers\Cms\UtilityPageController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

$serveLegacyPublicAsset = function (string $directory, string $path) {
    $rootPublic = dirname(base_path(), 2) . DIRECTORY_SEPARATOR . 'public';
    $base = realpath($rootPublic . DIRECTORY_SEPARATOR . $directory);
    $file = $base ? realpath($base . DIRECTORY_SEPARATOR . $path) : false;

    abort_unless($base && $file && str_starts_with($file, $base) && is_file($file), 404);

    return response()->file($file, [
        'Cache-Control' => 'public, max-age=31536000, immutable',
    ]);
};

$serveStorageAsset = function (string $path) {
    $rootPublic = dirname(base_path(), 2) . DIRECTORY_SEPARATOR . 'public';
    $bases = array_filter([
        realpath(storage_path('app/public')),
        realpath($rootPublic . DIRECTORY_SEPARATOR . 'storage'),
    ]);

    foreach ($bases as $base) {
        $file = realpath($base . DIRECTORY_SEPARATOR . $path);

        if ($file && str_starts_with($file, $base) && is_file($file)) {
            return response()->file($file, [
                'Cache-Control' => 'public, max-age=31536000, immutable',
            ]);
        }
    }

    abort(404);
};

Route::get('/', function () {
    return redirect(config('app.frontend_url', env('ASTRO_FRONTEND_URL', 'http://localhost:4321')));
});

Route::get('/media/{path}', fn (string $path) => $serveLegacyPublicAsset('media', $path))->where('path', '.*');
Route::get('/uploads/{path}', fn (string $path) => $serveLegacyPublicAsset('uploads', $path))->where('path', '.*');
Route::get('/images/{path}', fn (string $path) => $serveLegacyPublicAsset('images', $path))->where('path', '.*');
Route::get('/storage/{path}', fn (string $path) => $serveStorageAsset($path))->where('path', '.*');

Route::redirect('/dashboard', '/kawruh');
Route::get('/kawruh/login', fn () => redirect(Auth::check() ? '/dashboard' : '/login'));
Route::redirect('/login/blackout', '/login');

Route::middleware(['auth', 'verified', 'admin'])->prefix('kawruh')->group(function () {
    Route::get('/', DashboardController::class)->name('dashboard');
    Route::get('/analytics', [UtilityPageController::class, 'analytics'])->name('cms.analytics');
    Route::redirect('/blog', '/kawruh/posts');
    Route::redirect('/categories-produk', '/kawruh/categories?type=PRODUCT');
    Route::redirect('/categories-blog', '/kawruh/categories?type=BLOG');
    Route::redirect('/cities', '/kawruh/city-pages');
    Route::redirect('/komentar', '/kawruh/comments');
    Route::redirect('/formulir', '/kawruh/inquiries');
    Route::redirect('/portofolio', '/kawruh/portfolio');
    Route::get('/profile', [UtilityPageController::class, 'profile'])->name('cms.profile');
    Route::get('/media-picker', [CmsResourceController::class, 'mediaPicker'])->name('cms.media-picker');
    Route::get('/{resource}', [CmsResourceController::class, 'index'])->name('cms.index');
    Route::get('/{resource}/create', [CmsResourceController::class, 'create'])->name('cms.create');
    Route::post('/{resource}/bulk', [CmsResourceController::class, 'bulk'])->name('cms.bulk');
    Route::post('/{resource}', [CmsResourceController::class, 'store'])->name('cms.store');
    Route::get('/{resource}/{id}/edit', [CmsResourceController::class, 'edit'])->name('cms.edit');
    Route::patch('/{resource}/{id}', [CmsResourceController::class, 'update'])->name('cms.update');
    Route::delete('/{resource}/{id}', [CmsResourceController::class, 'destroy'])->name('cms.destroy');
    Route::post('/{resource}/{id}/toggle', [CmsResourceController::class, 'toggle'])->name('cms.toggle');
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
