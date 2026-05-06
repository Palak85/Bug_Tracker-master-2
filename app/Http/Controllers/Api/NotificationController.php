<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Activity;
use App\Models\Bug;
use App\Models\Task;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    /**
     * Return the last 15 activity items that are relevant to the authenticated user:
     *  - Bugs/tasks they CREATED that were touched by someone else
     *  - Bugs/tasks ASSIGNED to them that changed
     *  - Comments posted on their bugs/tasks by others
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        // IDs of bugs where the user is creator or assignee
        $bugIds = Bug::where(function ($q) use ($user) {
            $q->where('created_by', $user->id)
              ->orWhere('assigned_to', $user->id);
        })->pluck('id');

        // IDs of tasks where the user is creator or assignee
        $taskIds = Task::where(function ($q) use ($user) {
            $q->where('created_by', $user->id)
              ->orWhere('assigned_to', $user->id);
        })->pluck('id');

        $activities = Activity::with('user:id,name,role')
            ->where('user_id', '!=', $user->id)  // exclude the user's own actions
            ->where(function ($q) use ($bugIds, $taskIds) {
                $q->where(function ($q2) use ($bugIds) {
                    $q2->where('type', 'bug')->whereIn('subject_id', $bugIds);
                })->orWhere(function ($q2) use ($taskIds) {
                    $q2->where('type', 'task')->whereIn('subject_id', $taskIds);
                })->orWhere(function ($q2) use ($bugIds, $taskIds) {
                    // Comments on their items
                    $q2->where('type', 'comment')
                       ->where(function ($q3) use ($bugIds, $taskIds) {
                           $q3->whereIn('subject_id', $bugIds)
                              ->orWhereIn('subject_id', $taskIds);
                       });
                });
            })
            ->latest()
            ->limit(15)
            ->get()
            ->map(function ($activity) use ($user) {
                return [
                    'id'          => $activity->id,
                    'type'        => $activity->type,
                    'action'      => $activity->action,
                    'description' => $activity->description,
                    'subject_id'  => $activity->subject_id,
                    'actor'       => $activity->user?->name ?? 'Someone',
                    'actor_role'  => $activity->user?->role ?? '',
                    'is_unread'   => $user->notifications_read_at === null
                                     || $activity->created_at->gt($user->notifications_read_at),
                    'created_at'  => $activity->created_at,
                ];
            });

        return response()->json($activities);
    }

    /**
     * Return just the count of unread notifications.
     */
    public function unreadCount(Request $request): JsonResponse
    {
        $user = $request->user();

        $bugIds = Bug::where(function ($q) use ($user) {
            $q->where('created_by', $user->id)->orWhere('assigned_to', $user->id);
        })->pluck('id');

        $taskIds = Task::where(function ($q) use ($user) {
            $q->where('created_by', $user->id)->orWhere('assigned_to', $user->id);
        })->pluck('id');

        $count = Activity::where('user_id', '!=', $user->id)
            ->where(function ($q) use ($bugIds, $taskIds) {
                $q->where(function ($q2) use ($bugIds) {
                    $q2->where('type', 'bug')->whereIn('subject_id', $bugIds);
                })->orWhere(function ($q2) use ($taskIds) {
                    $q2->where('type', 'task')->whereIn('subject_id', $taskIds);
                });
            })
            ->when($user->notifications_read_at, fn($q) =>
                $q->where('created_at', '>', $user->notifications_read_at)
            )
            ->count();

        return response()->json(['count' => $count]);
    }

    /**
     * Mark all notifications as read by updating the user's notifications_read_at timestamp.
     */
    public function markRead(Request $request): JsonResponse
    {
        $request->user()->update(['notifications_read_at' => now()]);
        return response()->json(['message' => 'Notifications marked as read.']);
    }
}
