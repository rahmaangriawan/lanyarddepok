<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    public const CREATED_AT = 'createdAt';
    public const UPDATED_AT = 'updatedAt';

    protected $table = 'category';

    protected $fillable = ['name', 'slug', 'description', 'type'];

    public function posts()
    {
        return $this->hasMany(Post::class, 'categoryId');
    }

    public function products()
    {
        return $this->hasMany(Product::class, 'categoryId');
    }
}
