<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Project extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'status',
        'start_date',
        'end_date',
        'manager_id',
    ];

    public function milestones(): HasMany
    {
        return $this->hasMany(Milestone::class);
    }

    public function manager(): BelongsTo
    {
        return $this->belongsTo(User::class, 'manager_id');
    }

    public function bugs(): HasMany
    {
        return $this->hasMany(Bug::class);
    }

    public function tasks(): HasMany
    {
        return $this->hasMany(Task::class);
    }
}
