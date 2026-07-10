<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Page;
use App\Support\HtmlSanitizer;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class PageController extends Controller
{
    public function index()
    {
        return ['success' => true, 'pages' => Page::latest('updatedAt')->paginate(50)];
    }

    public function store(Request $request)
    {
        $page = Page::create($this->validated($request));

        return response()->json(['success' => true, 'page' => $page], 201);
    }

    public function show(Page $page)
    {
        return ['success' => true, 'page' => $page];
    }

    public function update(Request $request, Page $page)
    {
        $page->update($this->validated($request, $page->id));

        return ['success' => true, 'page' => $page->refresh()];
    }

    public function destroy(Page $page)
    {
        $page->delete();

        return ['success' => true];
    }

    private function validated(Request $request, ?int $ignoreId = null): array
    {
        $data = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', 'unique:page,slug'.($ignoreId ? ','.$ignoreId : '')],
            'content' => ['required', 'string'],
            'published' => ['nullable', 'boolean'],
            'metaTitle' => ['nullable', 'string', 'max:255'],
            'metaDescription' => ['nullable', 'string'],
        ]);

        $data['slug'] = $data['slug'] ?? Str::slug($data['title']);
        $data['published'] = (bool) ($data['published'] ?? false);
        $data['content'] = HtmlSanitizer::clean($data['content']);

        return $data;
    }
}
