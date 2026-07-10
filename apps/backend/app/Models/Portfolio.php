<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Portfolio extends Model
{
    public const CREATED_AT = 'createdAt';
    public const UPDATED_AT = 'updatedAt';

    protected $table = 'portfolio';

    protected $fillable = ['title', 'description', 'imageUrl', 'logoUrl', 'logoText', 'link'];
}
