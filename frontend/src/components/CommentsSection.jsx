import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { Send, Trash2, User, Clock, Loader2, AlertCircle } from 'lucide-react';
import ConfirmModal from './ConfirmModal';

export default function CommentsSection({ bugId, taskId }) {
  const { user } = useContext(AuthContext);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [postError, setPostError] = useState('');
  const [confirmState, setConfirmState] = useState(null);

  useEffect(() => {
    fetchComments();
  }, [bugId, taskId]);

  const fetchComments = async () => {
    setIsLoading(true);
    try {
      const params = bugId ? { bug_id: bugId } : { task_id: taskId };
      const response = await api.get('/comments', { params });
      setComments(response.data);
    } catch (err) {
      console.error('Failed to fetch comments', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setPostError('');
    setIsSubmitting(true);
    try {
      const payload = {
        content: newComment,
        bug_id: bugId || null,
        task_id: taskId || null,
      };
      const response = await api.post('/comments', payload);
      setComments([response.data, ...comments]);
      setNewComment('');
    } catch (err) {
      console.error('Failed to post comment', err);
      setPostError('Failed to post comment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    setConfirmState({
      title: 'Delete Comment',
      message: 'Permanently delete this comment? This cannot be undone.',
      confirmLabel: 'Delete',
      variant: 'danger',
      onConfirm: async () => {
        try {
          await api.delete(`/comments/${id}`);
          setComments(comments.filter(c => c.id !== id));
        } catch (err) {
          console.error('Failed to delete comment', err);
          setPostError('Failed to delete comment. Please try again.');
        }
      },
    });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="mt-10 border-t border-gray-100 pt-8">
      <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
        Comments
        <span className="bg-gray-100 text-gray-500 text-xs px-2 py-0.5 rounded-full">
          {comments.length}
        </span>
      </h3>

      {/* New Comment Input */}
      <form onSubmit={handleSubmit} className="mb-8">
        {postError && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2.5 rounded-2xl mb-3 text-xs flex items-center gap-2">
            <AlertCircle size={13} /> {postError}
          </div>
        )}
        <div className="relative group">
          <textarea
            className="w-full bg-[#f3f5f9] border border-gray-200 rounded-2xl px-5 py-4 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400/40 transition-all resize-none pr-14"
            placeholder="Write a comment..."
            rows="2"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />
          <button
            type="submit"
            disabled={isSubmitting || !newComment.trim()}
            className="absolute right-3 bottom-3 w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
      </form>

      {/* Comments List */}
      <div className="space-y-6">
        {isLoading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="w-6 h-6 text-purple-500 animate-spin" />
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
            <p className="text-gray-400 text-sm">No comments yet. Start the conversation!</p>
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="group animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center text-white text-xs font-bold shadow-sm overflow-hidden">
                    {comment.user.avatar_url ? (
                      <img src={comment.user.avatar_url} alt={comment.user.name} className="w-full h-full object-cover" />
                    ) : (
                      comment.user.name.charAt(0)
                    )}
                  </div>
                  <div>
                    <span className="text-sm font-bold text-gray-800">{comment.user.name}</span>
                    <span className="text-[10px] text-purple-500 font-bold uppercase tracking-widest ml-2 px-1.5 py-0.5 bg-purple-50 rounded-md">
                      {comment.user.role}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-gray-400 flex items-center gap-1">
                    <Clock size={10} />
                    {formatDate(comment.created_at)}
                  </span>
                  {(user?.id === comment.user_id || user?.role === 'admin') && (
                    <button
                      onClick={() => handleDelete(comment.id)}
                      className="text-gray-300 hover:text-rose-500 transition-colors p-1"
                      title="Delete comment"
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
              </div>
              <div className="ml-11 bg-white border border-gray-100 rounded-2xl rounded-tl-none p-4 shadow-sm group-hover:shadow-md transition-shadow">
                <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">{comment.content}</p>
              </div>
            </div>
          ))
        )}
      </div>
      <ConfirmModal state={confirmState} onClose={() => setConfirmState(null)} />
    </div>
  );
}
