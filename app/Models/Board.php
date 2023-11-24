<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Board extends Model
{
    use HasFactory, HasUlids;
    
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);    
    }
    
    public function columns(): HasMany
    {
        return $this->hasMany(Column::class);    
    }
}
