<?php

namespace App\Observers;

use App\Models\Comment;
use App\Models\Activity;

class CommentObserver
{
    /**
     * Handle the Comment "created" event.
     */
    public function created(Comment $comment): void
    {
        $projectId = null;
        if ($comment->bug_id && $comment->bug) {
            $projectId = $comment->bug->project_id;
        } elseif ($comment->task_id && $comment->task) {
            $projectId = $comment->task->project_id;
        }

        Activity::create([
            'user_id'     => auth()->id(),
            'project_id'  => $projectId,
            'type'        => 'comment',
            'subject_id'  => $comment->id,
            'action'      => 'created',
            'description' => "Posted a comment: " . \Illuminate\Support\Str::limit($comment->content, 50),
        ]);
    }

    /**
     * Handle the Comment "updated" event.
     */
    public function updated(Comment $comment): void
    {
        //
    }

    /**
     * Handle the Comment "deleted" event.
     */
    public function deleted(Comment $comment): void
    {
        //
    }

    /**
     * Handle the Comment "restored" event.
     */
    public function restored(Comment $comment): void
    {
        //
    }

    /**
     * Handle the Comment "force deleted" event.
     */
    public function forceDeleted(Comment $comment): void
    {
        //
    }
}
