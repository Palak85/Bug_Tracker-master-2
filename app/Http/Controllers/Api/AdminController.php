<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    /**
     * List all users for administration.
     */
    public function index(Request $request): JsonResponse
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $users = User::latest()->get();
        return response()->json($users);
    }

    /**
     * Approve a user.
     */
    public function approve(Request $request, User $user): JsonResponse
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $user->update(['is_approved' => true]);

        return response()->json(['message' => 'User approved successfully.', 'user' => $user]);
    }

    /**
     * Delete/Reject a user.
     */
    public function destroy(Request $request, User $user): JsonResponse
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if ($user->id === $request->user()->id) {
            return response()->json(['message' => 'Cannot delete yourself'], 400);
        }

        $user->delete();

        return response()->json(['message' => 'User deleted successfully.']);
    }
}
