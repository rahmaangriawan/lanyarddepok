<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Post extends Model
{
    public const CREATED_AT = 'createdAt';
    public const UPDATED_AT = 'updatedAt';

    protected $table = 'post';

    protected $fillable = [
        'title',
        'slug',
        'content',
        'published',
        'featuredImage',
        'categoryId',
        'authorId',
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

    public function category()
    {
        return $this->belongsTo(Category::class, 'categoryId');
    }

    public function comments()
    {
        return $this->hasMany(Comment::class, 'postId');
    }

    public function author()
    {
        return $this->belongsTo(User::class, 'authorId');
    }
}
