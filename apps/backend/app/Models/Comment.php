<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Comment extends Model
{
    public const CREATED_AT = 'createdAt';
    public const UPDATED_AT = null;

    protected $table = 'comment';

    protected $fillable = ['postId', 'name', 'email', 'content', 'approved'];

    protected function casts(): array
    {
        return [
            'approved' => 'boolean',
            'createdAt' => 'datetime',
        ];
    }

    public function post()
    {
        return $this->belongsTo(Post::class, 'postId');
    }
}
