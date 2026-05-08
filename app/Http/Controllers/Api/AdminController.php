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
        $users = User::latest()->get();
        return response()->json($users);
    }

    /**
     * Approve a user.
     */
    public function approve(Request $request, User $user): JsonResponse
    {
        $user->update(['is_approved' => true]);

        return response()->json(['message' => 'User approved successfully.', 'user' => $user]);
    }

    /**
     * Delete/Reject a user.
     */
    public function destroy(Request $request, User $user): JsonResponse
    {
        if ($user->id === $request->user()->id) {
            return response()->json(['message' => 'Cannot delete yourself'], 400);
        }

        $user->delete();

        return response()->json(['message' => 'User deleted successfully.']);
    }
    /**
     * Export all bugs to CSV.
     */
    public function exportBugs(): \Symfony\Component\HttpFoundation\StreamedResponse
    {
        $bugs = \App\Models\Bug::with(['project', 'creator', 'assignee'])->latest()->get();
        
        $headers = [
            'Content-type'        => 'text/csv',
            'Content-Disposition' => 'attachment; filename=bug_reports_' . date('Y-m-d') . '.csv',
            'Pragma'              => 'no-cache',
            'Cache-Control'       => 'must-revalidate, post-check=0, pre-check=0',
            'Expires'             => '0'
        ];

        $columns = ['ID', 'Title', 'Project', 'Status', 'Priority', 'Severity', 'Created By', 'Assigned To', 'Created At'];

        return response()->stream(function() use($bugs, $columns) {
            $file = fopen('php://output', 'w');
            fputcsv($file, $columns);

            foreach ($bugs as $bug) {
                fputcsv($file, [
                    $bug->id,
                    $bug->title,
                    $bug->project?->name ?? 'N/A',
                    strtoupper($bug->status),
                    strtoupper($bug->priority),
                    strtoupper($bug->severity),
                    $bug->creator?->name ?? 'N/A',
                    $bug->assignee?->name ?? 'N/A',
                    $bug->created_at->toDateTimeString()
                ]);
            }
            fclose($file);
        }, 200, $headers);
    }
}
