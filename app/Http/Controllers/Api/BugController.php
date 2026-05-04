<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Bug;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class BugController extends Controller
{
    /**
     * List all bugs, with optional filtering.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Bug::with(['creator:id,name', 'assignee:id,name']);

        $user = $request->user();
        if ($user && $user->role === 'developer') {
            $query->where(function($q) use ($user) {
                $q->where('assigned_to', $user->id)
                  ->orWhere('created_by', $user->id);
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('priority')) {
            $query->where('priority', $request->priority);
        }

        if ($request->filled('severity')) {
            $query->where('severity', $request->severity);
        }

        if ($request->filled('assigned_to')) {
            $query->where('assigned_to', $request->assigned_to);
        }

        if ($request->filled('category')) {
            $query->where('category', $request->category);
        }

        if ($request->filled('project')) {
            $query->where('project', 'like', '%' . $request->project . '%');
        }

        $bugs = $query->latest()->paginate(15);

        return response()->json($bugs);
    }

    /**
     * Create a new bug report.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title'       => 'required|string|max:255',
            'description' => 'required|string',
            'priority'    => ['sometimes', Rule::in(['low', 'medium', 'high', 'urgent'])],
            'severity'    => ['sometimes', Rule::in(['minor', 'major', 'critical', 'blocker'])],
            'assigned_to' => 'nullable|exists:users,id',
            'category'    => 'nullable|string|max:100',
            'project'     => 'nullable|string|max:100',
        ]);

        $validated['created_by'] = $request->user()->id;
        $validated['status'] = 'reported';

        $bug = Bug::create($validated);
        $bug->load(['creator:id,name', 'assignee:id,name']);

        return response()->json($bug, 201);
    }

    /**
     * Show a single bug.
     */
    public function show(Bug $bug): JsonResponse
    {
        $bug->load(['creator:id,name,email', 'assignee:id,name,email']);

        return response()->json($bug);
    }

    /**
     * Update a bug (status, priority, assignee, etc.).
     */
    public function update(Request $request, Bug $bug): JsonResponse
    {
        $validated = $request->validate([
            'title'       => 'sometimes|string|max:255',
            'description' => 'sometimes|string',
            'status'      => ['sometimes', Rule::in(['reported', 'in_progress', 'resolved', 'closed'])],
            'priority'    => ['sometimes', Rule::in(['low', 'medium', 'high', 'urgent'])],
            'severity'    => ['sometimes', Rule::in(['minor', 'major', 'critical', 'blocker'])],
            'assigned_to' => 'nullable|exists:users,id',
            'category'    => 'sometimes|string|max:100',
            'project'     => 'sometimes|string|max:100',
        ]);

        $user = $request->user();
        if ($user->role !== 'admin' && $user->role !== 'manager' && $user->id !== $bug->created_by && $user->id !== $bug->assigned_to) {
            return response()->json(['message' => 'Unauthorized. Only admins, managers, creators, or assignees can update this bug.'], 403);
        }

        $bug->update($validated);
        $bug->load(['creator:id,name', 'assignee:id,name']);

        return response()->json($bug);
    }

    /**
     * Delete a bug report.
     */
    public function destroy(Bug $bug): JsonResponse
    {
        $bug->delete();

        return response()->json(['message' => 'Bug deleted successfully.']);
    }
}
