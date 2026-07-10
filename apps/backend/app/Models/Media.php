<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Media extends Model
{
    public const CREATED_AT = 'createdAt';
    public const UPDATED_AT = null;

    protected $table = 'media';

    protected $fillable = ['filename', 'filepath', 'mimetype', 'size', 'url'];

    protected function casts(): array
    {
        return [
            'size' => 'integer',
            'createdAt' => 'datetime',
        ];
    }
}
