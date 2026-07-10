<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    public const CREATED_AT = 'createdAt';
    public const UPDATED_AT = 'updatedAt';

    protected $table = 'order';

    protected $fillable = [
        'userId',
        'lanyardWidth',
        'printingType',
        'attachment',
        'quantity',
        'totalPrice',
        'notes',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'quantity' => 'integer',
            'totalPrice' => 'integer',
            'createdAt' => 'datetime',
            'updatedAt' => 'datetime',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'userId');
    }
}
