<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CategoryController extends Controller
{
    public function index(Request $request)
    {
        return ['success' => true, 'categories' => Category::orderBy('name')->paginate(max(1, min($request->integer('per_page') ?: 100, 200)))];
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:190'],
            'slug' => ['nullable', 'string', 'max:190', 'unique:category,slug'],
            'description' => ['nullable', 'string'],
            'type' => ['nullable', 'string', 'max:50'],
        ]);

        $category = Category::create([
            'name' => $data['name'],
            'slug' => $data['slug'] ?? Str::slug($data['name']),
            'description' => $data['description'] ?? '',
            'type' => $data['type'] ?? 'BLOG',
        ]);

        return response()->json(['success' => true, 'category' => $category], 201);
    }

    public function update(Request $request, Category $category)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:190'],
            'slug' => ['nullable', 'string', 'max:190', 'unique:category,slug,'.$category->id],
            'description' => ['nullable', 'string'],
            'type' => ['nullable', 'string', 'max:50'],
        ]);

        $category->update([
            'name' => $data['name'],
            'slug' => $data['slug'] ?? Str::slug($data['name']),
            'description' => $data['description'] ?? '',
            'type' => $data['type'] ?? 'BLOG',
        ]);

        return ['success' => true, 'category' => $category];
    }

    public function destroy(Category $category)
    {
        if ($category->posts()->exists() || $category->products()->exists()) {
            return response()->json(['error' => 'Cannot delete category with related content'], 400);
        }

        $category->delete();

        return ['success' => true];
    }
}
