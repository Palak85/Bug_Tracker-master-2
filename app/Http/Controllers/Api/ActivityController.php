<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Activity;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ActivityController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(Request $request): JsonResponse
    {
        $limit = $request->get('limit', 20);
        $user = $request->user();
        
        $query = Activity::with(['user:id,name,role', 'project:id,name'])->latest();

        if ($user->role === 'admin') {
            // Admins see all activities across the entire system
        } elseif ($user->role === 'manager') {
            // Managers see their own activity OR any activity within projects they manage
            $managedProjectIds = \App\Models\Project::where('manager_id', $user->id)->pluck('id');
            $query->where(function ($q) use ($user, $managedProjectIds) {
                $q->where('user_id', $user->id)
                  ->orWhereIn('project_id', $managedProjectIds);
            });
        } else {
            // Regular users (developers) only see their own actions
            $query->where('user_id', $user->id);
        }

        $activities = $query->paginate($limit);

        return response()->json($activities);
    }
}
