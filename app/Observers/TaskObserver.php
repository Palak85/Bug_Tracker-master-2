<?php

namespace App\Observers;

use App\Models\Task;
use App\Models\Activity;

class TaskObserver
{
    /**
     * Handle the Task "created" event.
     */
    public function created(Task $task): void
    {
        Activity::create([
            'user_id'     => auth()->id() ?? $task->created_by,
            'project_id'  => $task->project_id,
            'type'        => 'task',
            'subject_id'  => $task->id,
            'action'      => 'created',
            'description' => "Created a new task: {$task->title}",
        ]);
    }

    /**
     * Handle the Task "updated" event.
     */
    public function updated(Task $task): void
    {
        if ($task->isDirty('status')) {
            Activity::create([
                'user_id'     => auth()->id(),
                'project_id'  => $task->project_id,
                'type'        => 'task',
                'subject_id'  => $task->id,
                'action'      => 'status_change',
                'description' => "Changed status of '{$task->title}' to " . strtoupper(str_replace('_', ' ', $task->status)),
            ]);
        } elseif ($task->isDirty('assigned_to')) {
            $task->load('assignee');
            $assigneeName = $task->assignee ? $task->assignee->name : 'Unassigned';
            Activity::create([
                'user_id'     => auth()->id(),
                'project_id'  => $task->project_id,
                'type'        => 'task',
                'subject_id'  => $task->id,
                'action'      => 'assigned',
                'description' => "Assigned task '{$task->title}' to {$assigneeName}",
            ]);
        } else {
            Activity::create([
                'user_id'     => auth()->id(),
                'project_id'  => $task->project_id,
                'type'        => 'task',
                'subject_id'  => $task->id,
                'action'      => 'updated',
                'description' => "Updated details for task: {$task->title}",
            ]);
        }
    }

    /**
     * Handle the Task "deleted" event.
     */
    public function deleted(Task $task): void
    {
        Activity::create([
            'user_id'     => auth()->id(),
            'project_id'  => $task->project_id,
            'type'        => 'task',
            'subject_id'  => $task->id,
            'action'      => 'deleted',
            'description' => "Deleted task: {$task->title}",
        ]);
    }
}
