<?php

namespace App\Http\Controllers;

use App\Models\Task;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class TaskController extends Controller
{
    /**
     * List all tasks, with optional filtering.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Task::with(['creator:id,name', 'assignee:id,name']);

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

        if ($request->filled('assigned_to')) {
            $query->where('assigned_to', $request->assigned_to);
        }

        if ($request->filled('category')) {
            $query->where('category', $request->category);
        }

        if ($request->filled('project')) {
            $query->where('project', 'like', '%' . $request->project . '%');
        }

        $tasks = $query->latest()->paginate(15);

        return response()->json($tasks);
    }

    /**
     * Create a new task.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title'       => 'required|string|max:255',
            'description' => 'required|string',
            'priority'    => ['sometimes', Rule::in(['low', 'medium', 'high', 'urgent'])],
            'deadline'    => 'nullable|date',
            'assigned_to' => 'nullable|exists:users,id',
            'category'    => 'nullable|string|max:100',
            'project'     => 'nullable|string|max:100',
        ]);

        $validated['created_by'] = $request->user()->id;
        $validated['status'] = 'open';

        $task = Task::create($validated);
        $task->load(['creator:id,name', 'assignee:id,name']);

        return response()->json($task, 201);
    }

    /**
     * Show a single task.
     */
    public function show(Task $task): JsonResponse
    {
        $task->load(['assignee:id,name,email']);

        return response()->json($task);
    }

    /**
     * Update a task.
     */
    public function update(Request $request, Task $task): JsonResponse
    {
        $validated = $request->validate([
            'title'       => 'sometimes|string|max:255',
            'description' => 'sometimes|string',
            'status'      => ['sometimes', Rule::in(['open', 'in_progress', 'resolved'])],
            'priority'    => ['sometimes', Rule::in(['low', 'medium', 'high', 'urgent'])],
            'deadline'    => 'nullable|date',
            'assigned_to' => 'nullable|exists:users,id',
            'category'    => 'sometimes|string|max:100',
            'project'     => 'sometimes|string|max:100',
        ]);

        $user = $request->user();
        if ($user->role !== 'admin' && $user->role !== 'manager' && $user->id !== $task->created_by && $user->id !== $task->assigned_to) {
            return response()->json(['message' => 'Unauthorized. Only admins, managers, creators, or assignees can update this task.'], 403);
        }

        $task->update($validated);
        $task->load(['assignee:id,name']);

        return response()->json($task);
    }

    /**
     * Delete a task.
     */
    public function destroy(Task $task): JsonResponse
    {
        $task->delete();

        return response()->json(['message' => 'Task deleted successfully.']);
    }
}
