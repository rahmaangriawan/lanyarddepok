<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Portfolio;
use Illuminate\Http\Request;

class PortfolioController extends Controller
{
    public function index(Request $request)
    {
        return ['success' => true, 'portfolios' => Portfolio::latest('createdAt')->paginate(max(1, min($request->integer('per_page') ?: 50, 100)))];
    }

    public function store(Request $request)
    {
        $portfolio = Portfolio::create($this->validated($request));

        return response()->json(['success' => true, 'portfolio' => $portfolio], 201);
    }

    public function update(Request $request, Portfolio $portofolio)
    {
        $portofolio->update($this->validated($request));

        return ['success' => true, 'portfolio' => $portofolio->refresh()];
    }

    public function destroy(Portfolio $portofolio)
    {
        $portofolio->delete();

        return ['success' => true];
    }

    private function validated(Request $request): array
    {
        return $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string'],
            'imageUrl' => ['required', 'string', 'max:255'],
            'logoUrl' => ['nullable', 'string', 'max:255'],
            'logoText' => ['nullable', 'string', 'max:255'],
            'link' => ['nullable', 'string', 'max:255'],
        ]);
    }
}
