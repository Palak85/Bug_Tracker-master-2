<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Milestone;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MilestoneController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        if (auth()->user()->role === 'dev') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'project_id'  => 'required|exists:projects,id',
            'title'       => 'required|string|max:255',
            'description' => 'nullable|string',
            'due_date'    => 'required|date',
            'status'      => 'required|in:pending,completed',
        ]);

        $milestone = Milestone::create($validated);

        return response()->json($milestone, 201);
    }

    public function update(Request $request, Milestone $milestone): JsonResponse
    {
        if (auth()->user()->role === 'dev') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'title'       => 'string|max:255',
            'description' => 'nullable|string',
            'due_date'    => 'date',
            'status'      => 'in:pending,completed',
        ]);

        $milestone->update($validated);

        return response()->json($milestone);
    }

    public function destroy(Milestone $milestone): JsonResponse
    {
        if (auth()->user()->role === 'dev') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $milestone->delete();

        return response()->json(['message' => 'Milestone deleted successfully']);
    }
}
