<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Bug extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'status',
        'priority',
        'severity',
        'category',
        'project',
        'project_id',
        'attachment_path',
        'attachment_name',
        'created_by',
        'assigned_to',
        'deadline',
    ];

    protected $casts = [
        'status'   => 'string',
        'priority' => 'string',
        'severity' => 'string',
        'deadline' => 'date',
    ];

    /**
     * The project this bug belongs to.
     */
    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    /**
     * The user who created this bug.
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * The user assigned to fix this bug.
     */
    public function assignee(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    /**
     * The comments associated with this bug.
     */
    public function comments(): HasMany
    {
        return $this->hasMany(Comment::class);
    }
}
