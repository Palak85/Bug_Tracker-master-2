<?php

namespace App\Observers;

use App\Models\Bug;
use App\Models\Activity;

class BugObserver
{
    /**
     * Handle the Bug "created" event.
     */
    public function created(Bug $bug): void
    {
        Activity::create([
            'user_id'     => auth()->id() ?? $bug->created_by,
            'type'        => 'bug',
            'subject_id'  => $bug->id,
            'action'      => 'created',
            'description' => "Reported a new bug: {$bug->title}",
        ]);
    }

    /**
     * Handle the Bug "updated" event.
     */
    public function updated(Bug $bug): void
    {
        if ($bug->isDirty('status')) {
            Activity::create([
                'user_id'     => auth()->id(),
                'type'        => 'bug',
                'subject_id'  => $bug->id,
                'action'      => 'status_change',
                'description' => "Changed status of '{$bug->title}' to " . strtoupper(str_replace('_', ' ', $bug->status)),
            ]);
        } else {
            Activity::create([
                'user_id'     => auth()->id(),
                'type'        => 'bug',
                'subject_id'  => $bug->id,
                'action'      => 'updated',
                'description' => "Updated details for bug: {$bug->title}",
            ]);
        }
    }

    /**
     * Handle the Bug "deleted" event.
     */
    public function deleted(Bug $bug): void
    {
        Activity::create([
            'user_id'     => auth()->id(),
            'type'        => 'bug',
            'subject_id'  => $bug->id,
            'action'      => 'deleted',
            'description' => "Deleted bug: {$bug->title}",
        ]);
    }
}
