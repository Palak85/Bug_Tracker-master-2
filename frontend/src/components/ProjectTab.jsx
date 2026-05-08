import { useState, useEffect } from 'react';
import api from '../services/api';
import { Plus, Layout, User, Clock, Loader2, AlertCircle, Trash2 } from 'lucide-react';
import ConfirmModal from './ConfirmModal';

export default function ProjectTab({ onUpdate }) {
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '', status: 'active', manager_id: '', start_date: '', end_date: '' });
  const [error, setError] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [confirmState, setConfirmState] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null); // For detailed roadmap view

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [pRes, uRes] = await Promise.all([
        api.get('/projects'),
        api.get('/users')
      ]);
      setProjects(pRes.data);
      setUsers(uRes.data);
    } catch (err) {
      console.error('Failed to fetch project data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    try {
      await api.post('/projects', formData);
      setIsModalOpen(false);
      setFormData({ name: '', description: '', status: 'active', manager_id: '', start_date: '', end_date: '' });
      fetchData();
      if (onUpdate) onUpdate();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create project');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    setConfirmState({
      title: 'Delete Project',
      message: `Delete "${name}"? This will not delete its bugs and tasks, but will remove their project link.`,
      confirmLabel: 'Delete Project',
      variant: 'danger',
      onConfirm: async () => {
        try {
          await api.delete(`/projects/${id}`);
          fetchData();
          if (onUpdate) onUpdate();
        } catch (err) {
          setDeleteError('Failed to delete project. Please try again.');
        }
      },
    });
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-purple-600" /></div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-gray-800">Projects Management</h3>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-5 py-2.5 rounded-full text-sm font-semibold shadow-lg shadow-purple-200 hover:scale-[1.03] transition-all"
        >
          <Plus size={18} /> New Project
        </button>
      </div>

      {deleteError && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-2xl text-sm flex items-center gap-2">
          <AlertCircle size={14} /> {deleteError}
          <button onClick={() => setDeleteError('')} className="ml-auto text-red-400 hover:text-red-600">✕</button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.length === 0 ? (
          <div className="col-span-full py-20 text-center bg-white rounded-[30px] border-2 border-dashed border-gray-100">
            <Layout className="mx-auto text-gray-200 mb-4" size={48} />
            <p className="text-gray-400">No projects created yet. Start by adding one!</p>
          </div>
        ) : (
          projects.map(project => {
            const totalTasks = project.tasks_count || 0;
            const completedTasks = project.tasks?.filter(t => t.status === 'resolved').length || 0;
            const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
            
            return (
              <div key={project.id} className="bg-white p-6 rounded-[30px] shadow-sm border border-gray-100 hover:shadow-md transition-all group">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
                    <Layout size={20} />
                  </div>
                  <div className="flex gap-2">
                    <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full ${
                      project.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-400'
                    }`}>
                      {project.status}
                    </span>
                    <button onClick={() => handleDelete(project.id, project.name)} className="opacity-0 group-hover:opacity-100 p-1 text-gray-300 hover:text-rose-500 transition-all">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <h4 className="font-bold text-gray-800 mb-2">{project.name}</h4>
                <p className="text-sm text-gray-400 line-clamp-2 mb-4">{project.description || 'No description provided.'}</p>
                
                {/* Progress Bar */}
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Progress</span>
                    <span className="text-xs font-bold text-purple-600">{progress}%</span>
                  </div>
                  <div className="h-1.5 bg-gray-50 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full transition-all duration-1000"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                  <button 
                    onClick={() => setSelectedProject(project)}
                    className="text-[10px] font-bold text-purple-500 uppercase tracking-widest hover:text-purple-700 transition-colors"
                  >
                    View Roadmap →
                  </button>
                  <div className="flex items-center gap-1 text-[10px] text-gray-300">
                    <Clock size={12} />
                    {project.end_date ? new Date(project.end_date).toLocaleDateString() : 'No Deadline'}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Roadmap Detail View */}
      {selectedProject && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-md" onClick={() => setSelectedProject(null)} />
          <div className="relative bg-[#f8f9fc] rounded-[40px] w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
            <div className="bg-white p-8 border-b border-gray-100 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">{selectedProject.name} Roadmap</h2>
                <p className="text-sm text-gray-400">Timeline: {selectedProject.start_date || '?'} — {selectedProject.end_date || '?'}</p>
              </div>
              <button onClick={() => setSelectedProject(null)} className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-all">✕</button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-8">
              <div className="space-y-6">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Key Milestones</h3>
                {(!selectedProject.milestones || selectedProject.milestones.length === 0) ? (
                  <div className="bg-white p-10 rounded-3xl text-center border-2 border-dashed border-gray-100">
                    <p className="text-gray-400 text-sm">No milestones defined for this project.</p>
                  </div>
                ) : (
                  <div className="relative space-y-8 before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200">
                    {selectedProject.milestones.map((m, i) => (
                      <div key={m.id} className="relative pl-12">
                        <div className={`absolute left-0 top-1 w-10 h-10 rounded-xl flex items-center justify-center shadow-sm z-10 ${
                          m.status === 'completed' ? 'bg-emerald-500 text-white' : 'bg-white border border-gray-200 text-gray-300'
                        }`}>
                          {m.status === 'completed' ? '✓' : i + 1}
                        </div>
                        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-50 flex justify-between items-center">
                          <div>
                            <h4 className={`font-bold ${m.status === 'completed' ? 'text-gray-400 line-through' : 'text-gray-800'}`}>{m.title}</h4>
                            <p className="text-xs text-gray-400 mt-1">{m.description}</p>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] font-bold text-gray-400 block uppercase mb-1">Due Date</span>
                            <span className="text-xs font-medium text-gray-600 bg-gray-50 px-2 py-1 rounded-lg border border-gray-100">
                              {new Date(m.due_date).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-800/30 backdrop-blur-md" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-white rounded-[30px] w-full max-w-md p-8 shadow-2xl animate-in zoom-in duration-300">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Create New Project</h2>
            {error && <div className="bg-rose-50 text-rose-500 p-3 rounded-xl mb-4 text-xs flex items-center gap-2"><AlertCircle size={14}/>{error}</div>}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Project Name</label>
                <input required className="w-full bg-gray-50 border-none rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-purple-400" 
                  value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Mobile App v1.0" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Description</label>
                <textarea rows={3} className="w-full bg-gray-50 border-none rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-purple-400 resize-none" 
                  value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Project goals and scope..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Start Date</label>
                  <input type="date" className="w-full bg-gray-50 border-none rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-purple-400" 
                    value={formData.start_date} onChange={e => setFormData({...formData, start_date: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">End Date</label>
                  <input type="date" className="w-full bg-gray-50 border-none rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-purple-400" 
                    value={formData.end_date} onChange={e => setFormData({...formData, end_date: e.target.value})} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Project Lead</label>
                <select className="w-full bg-gray-50 border-none rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-purple-400 cursor-pointer"
                  value={formData.manager_id} onChange={e => setFormData({...formData, manager_id: e.target.value})}>
                  <option value="">Select Manager</option>
                  {users.filter(u => u.role !== 'dev').map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 text-sm font-bold text-gray-400 hover:text-gray-600">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="flex-1 bg-gradient-to-r from-purple-500 to-indigo-600 text-white py-3 rounded-2xl text-sm font-bold shadow-lg flex items-center justify-center gap-2">
                  {isSubmitting && <Loader2 className="animate-spin" size={16} />} Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <ConfirmModal state={confirmState} onClose={() => setConfirmState(null)} />
    </div>
  );
}
