<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Bug;
use App\Models\Task;
use App\Models\Project;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class StatsController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(Request $request): JsonResponse
    {
        $stats = Cache::remember('dashboard_stats', 60, function () {
            return [
                'overview' => [
                    'total_bugs'     => Bug::count(),
                    'total_tasks'    => Task::count(),
                    'total_projects' => Project::count(),
                    'total_users'    => User::where('is_approved', true)->count(),
                ],
                'bugs_by_status'   => Bug::select('status', DB::raw('count(*) as count'))->groupBy('status')->get(),
                'bugs_by_priority' => Bug::select('priority', DB::raw('count(*) as count'))->groupBy('priority')->get(),
                'bugs_by_severity' => Bug::select('severity', DB::raw('count(*) as count'))->groupBy('severity')->get(),
                'tasks_by_status'  => Task::select('status', DB::raw('count(*) as count'))->groupBy('status')->get(),
                
                // Bug trends (last 7 days)
                'bug_trends' => Bug::select(DB::raw('DATE(created_at) as date'), DB::raw('count(*) as count'))
                    ->where('created_at', '>=', now()->subDays(7))
                    ->groupBy('date')
                    ->orderBy('date')
                    ->get(),
            ];
        });

        return response()->json($stats);
    }
}
