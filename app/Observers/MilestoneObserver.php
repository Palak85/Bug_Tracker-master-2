<?php

namespace App\Observers;

use App\Models\Milestone;
use App\Models\Activity;

class MilestoneObserver
{
    /**
     * Handle the Milestone "created" event.
     */
    public function created(Milestone $milestone): void
    {
        Activity::create([
            'user_id'     => auth()->id(),
            'project_id'  => $milestone->project_id,
            'type'        => 'milestone',
            'subject_id'  => $milestone->id,
            'action'      => 'created',
            'description' => "Added milestone: {$milestone->title}",
        ]);
    }

    /**
     * Handle the Milestone "updated" event.
     */
    public function updated(Milestone $milestone): void
    {
        if ($milestone->isDirty('status') && $milestone->status === 'completed') {
            Activity::create([
                'user_id'     => auth()->id(),
                'project_id'  => $milestone->project_id,
                'type'        => 'milestone',
                'subject_id'  => $milestone->id,
                'action'      => 'completed',
                'description' => "Reached milestone: {$milestone->title} ✓",
            ]);
        } else {
            Activity::create([
                'user_id'     => auth()->id(),
                'project_id'  => $milestone->project_id,
                'type'        => 'milestone',
                'subject_id'  => $milestone->id,
                'action'      => 'updated',
                'description' => "Updated milestone: {$milestone->title}",
            ]);
        }
    }

    /**
     * Handle the Milestone "deleted" event.
     */
    public function deleted(Milestone $milestone): void
    {
        Activity::create([
            'user_id'     => auth()->id(),
            'project_id'  => $milestone->project_id,
            'type'        => 'milestone',
            'subject_id'  => $milestone->id,
            'action'      => 'deleted',
            'description' => "Removed milestone: {$milestone->title}",
        ]);
    }
}
