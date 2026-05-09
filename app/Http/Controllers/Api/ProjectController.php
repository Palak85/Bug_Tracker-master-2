<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Project;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProjectController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): JsonResponse
    {
        $projects = Project::with(['manager:id,name', 'milestones'])
            ->withCount(['bugs', 'tasks'])
            ->latest()
            ->get();
        return response()->json($projects);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): JsonResponse
    {
        if (auth()->user()->role === 'dev') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'name'         => 'required|string|max:255',
            'description'  => 'nullable|string',
            'status'       => 'required|in:active,archived',
            'start_date'   => 'nullable|date',
            'end_date'     => 'nullable|date|after_or_equal:start_date',
            'manager_id'   => 'nullable|exists:users,id',
            'milestones'   => 'nullable|array',
            'milestones.*.title'       => 'required|string|max:255',
            'milestones.*.description' => 'nullable|string',
            'milestones.*.due_date'    => 'required|date',
        ]);

        return \DB::transaction(function () use ($validated) {
            $project = Project::create(collect($validated)->except('milestones')->toArray());

            if (!empty($validated['milestones'])) {
                foreach ($validated['milestones'] as $m) {
                    $project->milestones()->create($m);
                }
            }

            return response()->json($project->load(['manager:id,name', 'milestones']), 201);
        });
    }

    /**
     * Display the specified resource.
     */
    public function show(Project $project): JsonResponse
    {
        return response()->json($project->load(['manager:id,name', 'bugs', 'tasks', 'milestones']));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Project $project): JsonResponse
    {
        if (auth()->user()->role === 'dev') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'name'        => 'string|max:255',
            'description' => 'nullable|string',
            'status'      => 'in:active,archived',
            'start_date'  => 'nullable|date',
            'end_date'    => 'nullable|date|after_or_equal:start_date',
            'manager_id'  => 'nullable|exists:users,id',
        ]);

        $project->update($validated);

        return response()->json($project->load('manager:id,name'));
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Project $project): JsonResponse
    {
        if (auth()->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $project->delete();

        return response()->json(['message' => 'Project deleted successfully']);
    }
}
