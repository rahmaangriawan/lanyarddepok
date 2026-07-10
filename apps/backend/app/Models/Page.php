<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Page extends Model
{
    public const CREATED_AT = 'createdAt';
    public const UPDATED_AT = 'updatedAt';

    protected $table = 'page';

    protected $fillable = ['title', 'slug', 'content', 'published', 'metaTitle', 'metaDescription', 'createdAt'];

    protected function casts(): array
    {
        return [
            'published' => 'boolean',
            'createdAt' => 'datetime',
            'updatedAt' => 'datetime',
        ];
    }
}
