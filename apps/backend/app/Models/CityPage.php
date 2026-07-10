<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CityPage extends Model
{
    public const CREATED_AT = 'createdAt';
    public const UPDATED_AT = 'updatedAt';

    protected $table = 'citypage';

    protected $fillable = [
        'title',
        'slug',
        'content',
        'published',
        'featuredImage',
        'parentId',
        'metaTitle',
        'metaDescription',
        'createdAt',
    ];

    protected function casts(): array
    {
        return [
            'published' => 'boolean',
            'createdAt' => 'datetime',
            'updatedAt' => 'datetime',
        ];
    }

    public function parent()
    {
        return $this->belongsTo(self::class, 'parentId');
    }

    public function children()
    {
        return $this->hasMany(self::class, 'parentId');
    }
}
