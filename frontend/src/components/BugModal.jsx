import { useState, useEffect } from 'react';
import { X, Loader2, Trash2, AlertCircle, Paperclip, ExternalLink, Sparkles } from 'lucide-react';
import api from '../services/api';
import CommentsSection from './CommentsSection';
import ConfirmModal from './ConfirmModal';
import BugChatbot from './BugChatbot';

/* Shared field styles — match login page inputs */
const labelCls  = 'block text-xs font-bold uppercase tracking-widest text-gray-400 mb-1.5';
const inputCls  = 'w-full bg-[#f3f5f9] border border-gray-200 rounded-2xl px-4 py-3 text-gray-700 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed';
const selectCls = 'w-full bg-[#f3f5f9] border border-gray-200 rounded-2xl px-4 py-3 text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer';

export default function BugModal({ isOpen, onClose, bug, onSave, users, projects, currentUser }) {
  const [formData, setFormData] = useState({
    title: '', description: '', priority: 'medium', severity: 'major',
    status: 'reported', category: '', project_id: '', assigned_to: '', deadline: ''
  });
  const [attachment, setAttachment] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [confirmState, setConfirmState] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);

  useEffect(() => {
    if (bug) {
      setFormData({
        title: bug.title || '', 
        description: bug.description || '', 
        priority: (bug.priority || 'medium').toLowerCase(),
        severity: (bug.severity || 'major').toLowerCase(), 
        status: bug.status || 'reported', 
        category: bug.category || '',
        project_id: bug.project_id || '', 
        assigned_to: bug.assigned_to || '',
        deadline: bug.deadline ? bug.deadline.split('T')[0] : ''
      });
    } else {
      setFormData({ title: '', description: '', priority: 'medium', severity: 'major', status: 'reported', category: '', project_id: '', assigned_to: '', deadline: '' });
    }
    setAttachment(null);
  }, [bug, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    
    try {
      const form = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== '') {
          form.append(key, formData[key]);
        }
      });
      
      if (attachment) {
        form.append('attachment', attachment);
      }

      if (bug && bug.id) {
        // Laravel PUT with files needs _method override
        form.append('_method', 'PUT');
        await api.post(`/bugs/${bug.id}`, form, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        await api.post('/bugs', form, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
      
      onSave(); 
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save bug');
    } finally { 
      setIsSubmitting(false); 
    }
  };

  const handleDelete = async () => {
    setConfirmState({
      title: 'Delete Bug Report',
      message: `Permanently delete bug #${bug.id}? This will also remove all attachments and comments. This cannot be undone.`,
      confirmLabel: 'Delete',
      variant: 'danger',
      onConfirm: async () => {
        setIsSubmitting(true);
        try { await api.delete(`/bugs/${bug.id}`); onSave(); onClose(); }
        catch (err) { setError(err.response?.data?.message || 'Failed to delete bug'); }
        finally { setIsSubmitting(false); }
      },
    });
  };

  const canDelete = bug && currentUser && (currentUser.role === 'admin' || currentUser.id === bug.created_by);
  const canEditAll = !bug || (currentUser && (currentUser.role === 'admin' || currentUser.role === 'manager' || currentUser.id === bug.created_by));
  const set = (key, val) => setFormData({ ...formData, [key]: val });

  const assignableUsers = !currentUser ? [] :
    currentUser.role === 'admin'
      ? (users || [])
      : currentUser.role === 'manager'
        ? (users || []).filter(u => u.role !== 'admin' && u.id !== currentUser.id)
        : [];

  const handleApplySuggestion = ({ title, description, severity, priority, category }) => {
    setFormData(prev => ({
      ...prev,
      ...(title && { title }),
      ...(description && { description }),
      ...(severity && { severity: severity.toLowerCase() }),
      ...(priority && { priority: priority.toLowerCase() }),
      ...(category && { category }),
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gray-800/30 backdrop-blur-md" onClick={onClose} />
      
      <div className={`relative bg-white rounded-[30px] w-full shadow-[0_25px_60px_rgba(0,0,0,0.2)] max-h-[90vh] flex transition-all duration-500 ease-in-out ${
        isChatOpen ? 'max-w-5xl' : 'max-w-2xl'
      }`}>
        {/* ── LEFT: Bug Form ── */}
        <div className="flex flex-col flex-1 min-w-0 overflow-y-auto rounded-[30px]">
        <div className="sticky top-0 z-10 bg-white rounded-t-[30px] flex justify-between items-center px-8 py-6 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              {bug ? (canEditAll ? 'Edit Bug Report' : 'Update Status') : 'New Bug Report'}
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">#{bug?.id && !bug.isDraft ? bug.id : 'New'}</p>
          </div>
          <div className="flex items-center gap-2">
            {canEditAll && (
              <button
                type="button"
                onClick={() => setIsChatOpen(o => !o)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                  isChatOpen
                    ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-md shadow-purple-200'
                    : 'bg-purple-50 text-purple-600 border border-purple-200 hover:bg-purple-100'
                }`}
              >
                <Sparkles className="w-3 h-3" />
                {isChatOpen ? 'Hide AI' : '✦ AI Help'}
              </button>
            )}
            <button onClick={onClose} className="w-9 h-9 rounded-full bg-[#f3f5f9] flex items-center justify-center text-gray-400 hover:text-purple-600 hover:bg-purple-50 transition-all">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="px-8 pb-8 pt-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-2xl mb-5 text-sm flex items-center gap-2">
              <AlertCircle size={14} /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className={labelCls}>Title</label>
              <input type="text" required disabled={!canEditAll} className={inputCls}
                placeholder="Describe the bug briefly..."
                value={formData.title} onChange={e => set('title', e.target.value)} />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className={labelCls} style={{ marginBottom: 0 }}>Description</label>
                {canEditAll && (
                  <button
                    type="button"
                    onClick={() => setIsChatOpen(o => !o)}
                    className="flex items-center gap-1 text-[9px] font-bold text-purple-500 hover:text-purple-700 transition-colors uppercase tracking-widest"
                  >
                    <Sparkles className="w-3 h-3" />
                    {isChatOpen ? 'Close AI' : 'AI Help'}
                  </button>
                )}
              </div>
              <textarea required rows={4} disabled={!canEditAll} className={`${inputCls} resize-none`}
                placeholder="Steps to reproduce... (or use AI Help above!)"
                value={formData.description} onChange={e => set('description', e.target.value)} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className={labelCls}>Project</label>
                <select disabled={!canEditAll} className={selectCls}
                  value={formData.project_id} onChange={e => set('project_id', e.target.value)}>
                  <option value="">Select Project</option>
                  {(projects || []).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Category</label>
                <input type="text" disabled={!canEditAll} className={inputCls}
                  placeholder="e.g. UI, API"
                  value={formData.category} onChange={e => set('category', e.target.value)} />
              </div>
              <div>
                <label className={labelCls}>Deadline</label>
                <input type="date" disabled={!canEditAll} className={inputCls}
                  value={formData.deadline} onChange={e => set('deadline', e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Priority</label>
                <select disabled={!canEditAll} className={selectCls}
                  value={formData.priority} onChange={e => set('priority', e.target.value)}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>Severity</label>
                <select disabled={!canEditAll} className={selectCls}
                  value={formData.severity} onChange={e => set('severity', e.target.value)}>
                  <option value="minor">Minor</option>
                  <option value="major">Major</option>
                  <option value="critical">Critical</option>
                  <option value="blocker">Blocker</option>
                </select>
              </div>
              {bug && (
                <div>
                  <label className={labelCls}>Status</label>
                  <select className={selectCls} value={formData.status} onChange={e => set('status', e.target.value)}>
                    <option value="reported">Reported</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
              )}
              {currentUser?.role !== 'dev' && (
                <div>
                  <label className={labelCls}>Assign To</label>
                  <select disabled={!canEditAll} className={selectCls}
                    value={formData.assigned_to} onChange={e => set('assigned_to', e.target.value)}>
                    <option value="">Unassigned</option>
                    {assignableUsers.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                  </select>
                </div>
              )}
            </div>

            {/* File Attachment */}
            <div>
              <label className={labelCls}>Attachment (Image/PDF)</label>
              <div className="flex items-center gap-4">
                <label className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-2 bg-[#f3f5f9] border border-gray-200 border-dashed rounded-2xl px-4 py-3 text-gray-500 text-sm hover:border-purple-400 transition-all">
                    <Paperclip size={16} />
                    <span>{attachment ? attachment.name : 'Click to upload screenshot...'}</span>
                  </div>
                  <input type="file" className="hidden" onChange={e => setAttachment(e.target.files[0])} />
                </label>
                {bug?.attachment_path && (
                  <a 
                    href={`${import.meta.env.VITE_API_URL}/storage/${bug.attachment_path}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-3 rounded-2xl bg-purple-50 text-purple-600 hover:bg-purple-100 transition-all shadow-sm flex items-center gap-2 text-xs font-bold"
                  >
                    <ExternalLink size={14} /> View
                  </a>
                )}
              </div>
            </div>

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
                  {bug ? 'Update Bug' : 'Report Bug'}
                </button>
              </div>
            </div>
          </form>

          {bug?.id && !bug.isDraft && (
            <div className="mt-8 pt-6 border-t border-gray-100">
              <CommentsSection bugId={bug.id} />
            </div>
          )}
        </div>
        </div>{/* end left panel */}

        {/* ── RIGHT: AI Chatbot Panel ── */}
        {isChatOpen && (
          <div
            className="w-80 xl:w-96 flex-shrink-0 flex flex-col animate-in slide-in-from-right-4 duration-300"
            style={{ minHeight: '400px' }}
          >
            <BugChatbot
              type="bug"
              formData={formData}
              onClose={() => setIsChatOpen(false)}
              onApplySuggestion={handleApplySuggestion}
            />
          </div>
        )}
      </div>
      <ConfirmModal state={confirmState} onClose={() => setConfirmState(null)} />
    </div>
  );
}
