<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AuthorSlugRedirect extends Model
{
    public const CREATED_AT = 'createdAt';
    public const UPDATED_AT = null;

    protected $table = 'author_slug_redirect';

    protected $fillable = [
        'slug',
        'userId',
    ];

    public function author()
    {
        return $this->belongsTo(User::class, 'userId');
    }
}
