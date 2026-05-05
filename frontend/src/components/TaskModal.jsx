import { useState, useEffect } from 'react';
import { X, Loader2, Trash2, AlertCircle } from 'lucide-react';
import api from '../services/api';
import CommentsSection from './CommentsSection';

const labelCls  = 'block text-xs font-bold uppercase tracking-widest text-gray-400 mb-1.5';
const inputCls  = 'w-full bg-[#f3f5f9] border border-gray-200 rounded-2xl px-4 py-3 text-gray-700 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed';
const selectCls = 'w-full bg-[#f3f5f9] border border-gray-200 rounded-2xl px-4 py-3 text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer';

export default function TaskModal({ isOpen, onClose, task, onSave, users, currentUser }) {
  const [formData, setFormData] = useState({
    title: '', description: '', priority: 'medium', severity: 'minor',
    status: 'open', category: '', project: '', deadline: '', assigned_to: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title, description: task.description, priority: task.priority,
        severity: task.severity || 'minor', status: task.status, category: task.category || '',
        project: task.project || '', deadline: task.deadline ? task.deadline.split('T')[0] : '',
        assigned_to: task.assigned_to || ''
      });
    } else {
      setFormData({ title: '', description: '', priority: 'medium', severity: 'minor', status: 'open', category: '', project: '', deadline: '', assigned_to: '' });
    }
  }, [task, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    try {
      const data = { ...formData };
      if (!data.assigned_to) data.assigned_to = null;
      if (!data.deadline) data.deadline = null;
      task ? await api.put(`/tasks/${task.id}`, data) : await api.post('/tasks', data);
      onSave(); onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save task');
    } finally { setIsSubmitting(false); }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to permanently delete this task?')) return;
    setIsSubmitting(true);
    try { await api.delete(`/tasks/${task.id}`); onSave(); onClose(); }
    catch (err) { setError(err.response?.data?.message || 'Failed to delete task'); }
    finally { setIsSubmitting(false); }
  };

  const canDelete = task && currentUser && (currentUser.role === 'admin' || currentUser.id === task.created_by);
  const set = (key, val) => setFormData({ ...formData, [key]: val });

  // Assignable users filtered by role:
  // admin  → everyone
  // manager → exclude admins and themselves
  // dev    → no assignment allowed (field hidden)
  const assignableUsers = !currentUser ? [] :
    currentUser.role === 'admin'
      ? (users || [])
      : currentUser.role === 'manager'
        ? (users || []).filter(u => u.role !== 'admin' && u.id !== currentUser.id)
        : []; // dev — hidden

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-gray-800/30 backdrop-blur-md" onClick={onClose} />

      {/* Modal card */}
      <div className="relative bg-white rounded-[30px] w-full max-w-2xl shadow-[0_25px_60px_rgba(0,0,0,0.2)] max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="sticky top-0 z-10 bg-white rounded-t-[30px] flex justify-between items-center px-8 py-6 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-bold text-gray-800">{task ? 'Edit Task' : 'New Task'}</h2>
            <p className="text-xs text-gray-400 mt-0.5">Fill in the details below</p>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-full bg-[#f3f5f9] flex items-center justify-center text-gray-400 hover:text-purple-600 hover:bg-purple-50 transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-8 pb-8 pt-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-2xl mb-5 text-sm flex items-center gap-2">
              <AlertCircle size={14} /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Title */}
            <div>
              <label className={labelCls}>Title</label>
              <input type="text" required className={inputCls}
                placeholder="What needs to be done?"
                value={formData.title} onChange={e => set('title', e.target.value)} />
            </div>

            {/* Description */}
            <div>
              <label className={labelCls}>Description</label>
              <textarea required rows={4} className={`${inputCls} resize-none`}
                placeholder="Describe the task in detail..."
                value={formData.description} onChange={e => set('description', e.target.value)} />
            </div>

            {/* Category + Project */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Category / Module</label>
                <input type="text" className={inputCls}
                  placeholder="e.g. Authentication, UI, Database"
                  value={formData.category} onChange={e => set('category', e.target.value)} />
              </div>
              <div>
                <label className={labelCls}>Project / Product</label>
                <input type="text" className={inputCls}
                  placeholder="e.g. Mobile App, Admin Panel"
                  value={formData.project} onChange={e => set('project', e.target.value)} />
              </div>
            </div>

            {/* Priority + Severity + Deadline + Status + Assign */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Priority</label>
                <select className={selectCls} value={formData.priority} onChange={e => set('priority', e.target.value)}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>Severity</label>
                <select className={selectCls} value={formData.severity} onChange={e => set('severity', e.target.value)}>
                  <option value="minor">Minor</option>
                  <option value="major">Major</option>
                  <option value="critical">Critical</option>
                  <option value="blocker">Blocker</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>Deadline</label>
                <input type="date" className={inputCls}
                  value={formData.deadline} onChange={e => set('deadline', e.target.value)} />
              </div>
              {task && (
                <div>
                  <label className={labelCls}>Status</label>
                  <select className={selectCls} value={formData.status} onChange={e => set('status', e.target.value)}>
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                  </select>
                </div>
              )}
              {/* Assign To — hidden for developers */}
              {currentUser?.role !== 'dev' && (
                <div>
                  <label className={labelCls}>Assign To</label>
                  <select className={selectCls} value={formData.assigned_to} onChange={e => set('assigned_to', e.target.value)}>
                    <option value="">Unassigned</option>
                    {assignableUsers.length > 0
                      ? assignableUsers.map(u => <option key={u.id} value={u.id}>{u.name} ({u.role})</option>)
                      : <option disabled>No eligible team members</option>
                    }
                  </select>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex justify-between items-center pt-4 border-t border-gray-100 mt-2">
              {canDelete ? (
                <button type="button" onClick={handleDelete} disabled={isSubmitting}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full text-rose-500 border border-rose-200 bg-rose-50 hover:bg-rose-100 text-sm font-semibold transition-all">
                  <Trash2 className="w-4 h-4" /> Delete
                </button>
              ) : <span />}
              <div className="flex gap-3">
                <button type="button" onClick={onClose}
                  className="px-6 py-2.5 rounded-full text-sm font-semibold text-gray-500 bg-[#f3f5f9] hover:bg-gray-200 transition-all">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-full text-sm font-semibold text-white bg-gradient-to-r from-purple-500 to-indigo-600 shadow-lg shadow-purple-200 hover:scale-[1.03] active:scale-95 transition-all flex items-center gap-2 disabled:opacity-70">
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {task ? 'Update Task' : 'Create Task'}
                </button>
              </div>
            </div>
          </form>

          {task && (
            <div className="mt-8 pt-6 border-t border-gray-100">
              <CommentsSection taskId={task.id} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
