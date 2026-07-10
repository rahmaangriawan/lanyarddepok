<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CityPage;
use App\Support\HtmlSanitizer;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CityPageController extends Controller
{
    public function index()
    {
        return ['success' => true, 'cities' => CityPage::with('parent:id,title,slug')->latest('createdAt')->paginate(50)];
    }

    public function store(Request $request)
    {
        $city = CityPage::create($this->validated($request));

        return response()->json(['success' => true, 'city' => $city], 201);
    }

    public function show(CityPage $city)
    {
        return ['success' => true, 'city' => $city];
    }

    public function update(Request $request, CityPage $city)
    {
        $data = $this->validated($request, $city->id);
        if (($data['parentId'] ?? null) === $city->id) {
            return response()->json(['error' => 'A page cannot be its own parent'], 400);
        }

        $city->update($data);

        return ['success' => true, 'city' => $city->refresh()];
    }

    public function destroy(CityPage $city)
    {
        $city->delete();

        return ['success' => true];
    }

    private function validated(Request $request, ?int $ignoreId = null): array
    {
        $data = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', 'unique:citypage,slug'.($ignoreId ? ','.$ignoreId : '')],
            'content' => ['required', 'string'],
            'published' => ['nullable', 'boolean'],
            'featuredImage' => ['nullable', 'string', 'max:255'],
            'parentId' => ['nullable', 'integer', 'exists:citypage,id'],
            'metaTitle' => ['nullable', 'string', 'max:255'],
            'metaDescription' => ['nullable', 'string'],
        ]);

        $data['slug'] = $data['slug'] ?? Str::slug($data['title']);
        $data['published'] = (bool) ($data['published'] ?? false);
        $data['content'] = HtmlSanitizer::clean($data['content']);

        return $data;
    }
}
