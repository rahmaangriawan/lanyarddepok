<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    public const CREATED_AT = 'createdAt';
    public const UPDATED_AT = 'updatedAt';

    protected $table = 'product';

    protected $fillable = [
        'sku',
        'name',
        'slug',
        'specs',
        'accessories',
        'basePrice',
        'minOrder',
        'shortDescription',
        'sheetStatus',
        'sites',
        'sortOrder',
        'featuredImage',
        'categoryId',
        'description',
        'published',
        'metaTitle',
        'metaDescription',
        'createdAt',
    ];

    protected function casts(): array
    {
        return [
            'published' => 'boolean',
            'sortOrder' => 'integer',
            'createdAt' => 'datetime',
            'updatedAt' => 'datetime',
        ];
    }

    public function category()
    {
        return $this->belongsTo(Category::class, 'categoryId');
    }
}
