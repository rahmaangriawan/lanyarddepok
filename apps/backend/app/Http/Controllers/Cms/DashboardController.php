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
use Illuminate\Contracts\View\View;
use Illuminate\Database\Eloquent\Model;

class DashboardController extends Controller
{
    public function __invoke(): View
    {
        $productTotal = Product::count();
        $productPublished = Product::query()->where('published', true)->count();
        $productDraft = max($productTotal - $productPublished, 0);
        $productPublishedPercent = $this->percent($productPublished, $productTotal);
        $productDraftPercent = $this->percent($productDraft, $productTotal);

        return view('cms.dashboard', [
            'stats' => [
                [
                    'label' => 'Produk',
                    'value' => $productTotal,
                    'caption' => 'KATALOG AKTIF DAN DRAFT',
                    'trend' => $this->trend(Product::class),
                    'tone' => 'amber',
                    'segments' => [
                        ['label' => 'Aktif', 'value' => $productPublished, 'percent' => $productPublishedPercent, 'tone' => 'success'],
                        ['label' => 'Draft', 'value' => $productDraft, 'percent' => $productDraftPercent, 'tone' => 'blue'],
                    ],
                ],
                [
                    'label' => 'Artikel',
                    'value' => Post::count(),
                    'caption' => 'KONTEN BLOG CMS',
                    'trend' => $this->trend(Post::class),
                    'tone' => 'blue',
                    'sparkline' => $this->monthlySeries(Post::class),
                ],
                [
                    'label' => 'Inquiry',
                    'value' => Inquiry::count(),
                    'caption' => 'PESAN MASUK CUSTOMER',
                    'trend' => $this->trend(Inquiry::class),
                    'tone' => 'violet',
                    'sparkline' => $this->monthlySeries(Inquiry::class),
                ],
            ],
            'recentPosts' => Post::query()
                ->latest('createdAt')
                ->limit(5)
                ->get(['id', 'title', 'slug', 'published', 'createdAt']),
            'recentInquiries' => Inquiry::query()
                ->latest('createdAt')
                ->limit(5)
                ->get(['id', 'name', 'email', 'phone', 'createdAt']),
            'moduleCounts' => [
                ['label' => 'Pages', 'caption' => 'Halaman CMS', 'count' => Page::count(), 'tone' => 'blue', 'href' => route('cms.index', 'pages')],
                ['label' => 'Categories', 'caption' => 'Kategori konten', 'count' => Category::count(), 'tone' => 'green', 'href' => route('cms.index', 'categories')],
                ['label' => 'Portfolio', 'caption' => 'Karya tampil', 'count' => Portfolio::count(), 'tone' => 'violet', 'href' => route('cms.index', 'portfolio')],
                ['label' => 'Comments', 'caption' => 'Komentar masuk', 'count' => Comment::count(), 'tone' => 'amber', 'href' => route('cms.index', 'comments')],
                ['label' => 'Orders', 'caption' => 'Request order', 'count' => Order::count(), 'tone' => 'blue', 'href' => route('cms.index', 'orders')],
                ['label' => 'City Pages', 'caption' => 'Landing kota', 'count' => CityPage::count(), 'tone' => 'green', 'href' => route('cms.index', 'city-pages')],
                ['label' => 'Settings', 'caption' => 'Key konfigurasi', 'count' => Setting::count(), 'tone' => 'violet', 'href' => route('cms.index', 'settings')],
                ['label' => 'Media', 'caption' => 'File upload lokal', 'count' => Media::count(), 'tone' => 'amber', 'href' => route('cms.index', 'media')],
            ],
        ]);
    }

    /**
     * @param class-string<Model> $model
     */
    private function monthlySeries(string $model): array
    {
        $months = [];
        $start = now()->startOfMonth()->subMonths(11);

        for ($index = 0; $index < 12; $index++) {
            $month = $start->copy()->addMonths($index);
            $months[] = $model::query()
                ->whereBetween('createdAt', [$month->copy()->startOfMonth(), $month->copy()->endOfMonth()])
                ->count();
        }

        return $months;
    }

    /**
     * @param class-string<Model> $model
     */
    private function trend(string $model): string
    {
        $now = now();
        $current = $model::query()
            ->whereBetween('createdAt', [$now->copy()->startOfMonth(), $now->copy()->endOfMonth()])
            ->count();
        $previousMonth = $now->copy()->subMonthNoOverflow();
        $previous = $model::query()
            ->whereBetween('createdAt', [$previousMonth->copy()->startOfMonth(), $previousMonth->copy()->endOfMonth()])
            ->count();

        if ($previous === 0) {
            return $current > 0 ? '100%' : '0%';
        }

        return round((($current - $previous) / $previous) * 100, 1) . '%';
    }

    private function percent(int $value, int $total): int
    {
        if ($total <= 0) {
            return 0;
        }

        return (int) round(($value / $total) * 100);
    }
}
