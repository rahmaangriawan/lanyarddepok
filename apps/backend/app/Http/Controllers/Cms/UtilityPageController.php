<?php

namespace App\Http\Controllers\Cms;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Contracts\View\View;

class UtilityPageController extends Controller
{
    public function analytics(): View
    {
        return view('cms.utility', [
            'title' => 'Analitik',
            'eyebrow' => 'Insights',
            'description' => 'Pantau ringkasan integrasi analytics. Modul detail GA4/GSC bisa disambungkan lagi setelah kredensial final siap.',
            'cards' => [
                [
                    'label' => 'GA4 Property ID',
                    'value' => Setting::query()->where('key', 'ga4_property_id')->value('value') ?: 'Belum diset',
                    'description' => 'ID properti untuk membaca ringkasan traffic GA4.',
                    'status' => Setting::query()->where('key', 'ga4_property_id')->value('value') ? 'Aktif' : 'Perlu setup',
                    'icon' => 'chart',
                    'tone' => 'primary',
                ],
                [
                    'label' => 'Search Console URL',
                    'value' => Setting::query()->where('key', 'gsc_site_url')->value('value') ?: 'Belum diset',
                    'description' => 'Properti website yang dipakai untuk data pencarian.',
                    'status' => Setting::query()->where('key', 'gsc_site_url')->value('value') ? 'Aktif' : 'Perlu setup',
                    'icon' => 'search',
                    'tone' => 'success',
                ],
                [
                    'label' => 'Service Account',
                    'value' => Setting::query()->where('key', 'google_service_account_json')->value('value') ? 'Tersimpan' : 'Belum diset',
                    'description' => 'Credential Google API untuk Sheets, GA4, dan GSC.',
                    'status' => Setting::query()->where('key', 'google_service_account_json')->value('value') ? 'Siap dipakai' : 'Upload credential',
                    'icon' => 'key',
                    'tone' => 'warning',
                ],
            ],
        ]);
    }

    public function profile(): View
    {
        return view('cms.profile', [
            'user' => auth()->user(),
        ]);
    }
}
