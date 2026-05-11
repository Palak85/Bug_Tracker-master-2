<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Comment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CommentController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): JsonResponse
    {
        $request->validate([
            'bug_id'  => 'required_without:task_id|exists:bugs,id',
            'task_id' => 'required_without:bug_id|exists:tasks,id',
        ]);

        $query = Comment::with('user:id,name,role,avatar_path');

        if ($request->has('bug_id')) {
            $query->where('bug_id', $request->bug_id);
        } else {
            $query->where('task_id', $request->task_id);
        }

        $comments = $query->latest()->get();

        return response()->json($comments);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'bug_id'  => 'nullable|exists:bugs,id',
            'task_id' => 'nullable|exists:tasks,id',
            'content' => 'required|string|min:1',
        ]);

        $comment = Comment::create([
            'user_id' => $request->user()->id,
            'bug_id'  => $validated['bug_id'] ?? null,
            'task_id' => $validated['task_id'] ?? null,
            'content' => $validated['content'],
        ]);

        return response()->json($comment->load('user:id,name,role,avatar_path'), 201);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Comment $comment): JsonResponse
    {
        // Only the author or an admin can delete a comment
        if (auth()->id() !== $comment->user_id && auth()->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $comment->delete();

        return response()->json(['message' => 'Comment deleted successfully']);
    }
}
