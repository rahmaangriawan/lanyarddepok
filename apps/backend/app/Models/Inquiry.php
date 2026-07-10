<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Inquiry extends Model
{
    public const CREATED_AT = 'createdAt';
    public const UPDATED_AT = null;

    protected $table = 'inquiry';

    protected $fillable = ['name', 'email', 'phone', 'message'];

    protected function casts(): array
    {
        return ['createdAt' => 'datetime'];
    }
}
