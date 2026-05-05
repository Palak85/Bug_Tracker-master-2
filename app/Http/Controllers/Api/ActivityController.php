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
        
        $activities = Activity::with('user:id,name,role')
            ->latest()
            ->paginate($limit);

        return response()->json($activities);
    }
}
