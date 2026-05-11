<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Bug;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class BugController extends Controller
{
    /**
     * List all bugs, with optional filtering.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Bug::with(['creator:id,name,avatar_path', 'assignee:id,name,avatar_path', 'project:id,name']);

        $user = $request->user();
        if ($user && $user->role === 'dev') {
            $query->where(function($q) use ($user) {
                $q->where('assigned_to', $user->id)
                  ->orWhere('created_by', $user->id)
                  ->orWhereHas('project', function($pq) use ($user) {
                      $pq->where('manager_id', $user->id);
                  });
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

        if ($request->filled('project_id')) {
            $query->where('project_id', $request->project_id);
        }

        if ($request->filled('search')) {
            $query->where(function($q) use ($request) {
                $q->where('title', 'like', '%' . $request->search . '%')
                  ->orWhere('description', 'like', '%' . $request->search . '%');
            });
        }

        // Due date filters
        if ($request->filled('due_date')) {
            $today = now()->toDateString();
            switch ($request->due_date) {
                case 'overdue':
                    $query->whereNotNull('deadline')
                          ->where('deadline', '<', $today)
                          ->whereNotIn('status', ['resolved', 'closed']);
                    break;
                case 'due_today':
                    $query->where('deadline', $today);
                    break;
                case 'upcoming':
                    $query->where('deadline', '>', $today)
                          ->where('deadline', '<=', now()->addDays(7)->toDateString());
                    break;
                case 'no_deadline':
                    $query->whereNull('deadline');
                    break;
            }
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
            'project_id'  => 'nullable|exists:projects,id',
            'deadline'    => 'nullable|date',
            'attachment'  => 'nullable|file|mimes:jpg,jpeg,png,pdf,txt|max:5120', // Max 5MB
        ]);

        $validated['created_by'] = $request->user()->id;
        $validated['status'] = 'reported';

        if ($request->hasFile('attachment')) {
            $path = $request->file('attachment')->store('attachments', 'public');
            $validated['attachment_path'] = $path;
            $validated['attachment_name'] = $request->file('attachment')->getClientOriginalName();
        }

        $bug = Bug::create($validated);
        $bug->load(['creator:id,name,avatar_path', 'assignee:id,name,avatar_path', 'project:id,name']);

        return response()->json($bug, 201);
    }

    /**
     * Show a single bug.
     */
    public function show(Bug $bug): JsonResponse
    {
        $bug->load(['creator:id,name,email,avatar_path', 'assignee:id,name,email,avatar_path', 'project:id,name']);

        return response()->json($bug);
    }

    /**
     * Update a bug (status, priority, assignee, etc.).
     */
    public function update(Request $request, Bug $bug): JsonResponse
    {
        $user = $request->user();
        $isProjectManager = $bug->project && $bug->project->manager_id === $user->id;
        $isFullEditor = $user->role === 'admin' || $user->role === 'manager' || $user->id === $bug->created_by || $isProjectManager;
        $isAssignee = $user->id === $bug->assigned_to;

        if (!$isFullEditor && !$isAssignee) {
            return response()->json(['message' => 'Unauthorized. Only admins, managers, creators, or assignees can update this bug.'], 403);
        }

        if (!$isFullEditor && $isAssignee) {
            $validated = $request->validate([
                'status' => ['sometimes', Rule::in(['reported', 'in_progress', 'resolved', 'closed'])],
            ]);
        } else {
            $validated = $request->validate([
                'title'       => 'sometimes|string|max:255',
                'description' => 'sometimes|string',
                'status'      => ['sometimes', Rule::in(['reported', 'in_progress', 'resolved', 'closed'])],
                'priority'    => ['sometimes', Rule::in(['low', 'medium', 'high', 'urgent'])],
                'severity'    => ['sometimes', Rule::in(['minor', 'major', 'critical', 'blocker'])],
                'assigned_to' => 'nullable|exists:users,id',
                'category'    => 'nullable|string|max:100',
                'project_id'  => 'nullable|exists:projects,id',
                'deadline'    => 'nullable|date',
                'attachment'  => 'nullable|file|mimes:jpg,jpeg,png,pdf,txt|max:5120',
            ]);
        }

        if ($request->hasFile('attachment')) {
            // Delete old attachment if exists
            if ($bug->attachment_path) {
                Storage::disk('public')->delete($bug->attachment_path);
            }
            $path = $request->file('attachment')->store('attachments', 'public');
            $validated['attachment_path'] = $path;
            $validated['attachment_name'] = $request->file('attachment')->getClientOriginalName();
        }

        $bug->update($validated);
        $bug->load(['creator:id,name,avatar_path', 'assignee:id,name,avatar_path', 'project:id,name']);

        return response()->json($bug);
    }

    /**
     * Delete a bug report.
     */
    public function destroy(Request $request, Bug $bug): JsonResponse
    {
        $user = $request->user();
        $isProjectManager = $bug->project && $bug->project->manager_id === $user->id;
        if ($user->role !== 'admin' && $user->id !== $bug->created_by && !$isProjectManager) {
            return response()->json(['message' => 'Unauthorized. Only admins, project managers, or the creator can delete this bug.'], 403);
        }

        // Delete attachment if exists
        if ($bug->attachment_path) {
            Storage::disk('public')->delete($bug->attachment_path);
        }

        $bug->delete();

        return response()->json(['message' => 'Bug deleted successfully.']);
    }
}
