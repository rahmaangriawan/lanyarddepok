<?php

namespace App\Http\Controllers\Cms;

use App\Http\Controllers\Controller;
use App\Services\GoogleSheetsProductSync;
use Illuminate\Http\RedirectResponse;
use Throwable;

class ProductSyncController extends Controller
{
    public function __invoke(GoogleSheetsProductSync $sync): RedirectResponse
    {
        try {
            $result = $sync->sync();
        } catch (Throwable $exception) {
            report($exception);

            return back()->with('error', 'Sinkronisasi Google Sheets gagal: '.$exception->getMessage());
        }

        return back()->with(
            'success',
            "Sinkronisasi selesai. {$result['created']} produk baru, {$result['updated']} diperbarui, {$result['skipped']} dilewati.",
        );
    }
}
