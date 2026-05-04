import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { LogOut, Bug, Plus, Search, Filter, Calendar, CheckSquare, Clock, AlertCircle, Loader2, ChevronRight, LayoutDashboard, Settings, UserCircle, Bell, Users, Shield, Zap, Target } from 'lucide-react';
import BugModal from '../components/BugModal';
import TaskModal from '../components/TaskModal';

export default function Dashboard() {
  const { user, logout } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('bugs');
  const [bugs, setBugs] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]); // All users for dropdowns
  const [adminUsers, setAdminUsers] = useState([]); // Users for the admin tab
  const [isLoading, setIsLoading] = useState(true);
  const [isBugModalOpen, setIsBugModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    severity: ''
  });

  useEffect(() => {
    fetchData();
    if (user?.role === 'admin') {
      fetchAdminUsers();
    }
  }, [activeTab, user, filters]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [bugsRes, tasksRes, usersRes] = await Promise.all([
        api.get('/bugs', { params: { ...filters, search: searchQuery } }),
        api.get('/tasks', { params: { ...filters, search: searchQuery } }),
        api.get('/users')
      ]);
      setBugs(bugsRes.data.data || []);
      setTasks(tasksRes.data.data || []);
      setUsers(Array.isArray(usersRes.data) ? usersRes.data : usersRes.data.data || []);
    } catch (err) {
      console.error('Failed to fetch data', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAdminUsers = async () => {
    try {
      const res = await api.get('/admin/users');
      setAdminUsers(res.data);
    } catch (err) {
      console.error('Failed to fetch admin users', err);
    }
  };

  const handleApprove = async (id) => {
    try {
      await api.patch(`/admin/users/${id}/approve`);
      fetchAdminUsers();
    } catch (err) {
      alert('Failed to approve user');
    }
  };

  const handleReject = async (id) => {
    if (!confirm('Are you sure you want to remove this user?')) return;
    try {
      await api.delete(`/admin/users/${id}`);
      fetchAdminUsers();
    } catch (err) {
      alert('Failed to remove user');
    }
  };

  const handleCreateNew = () => {
    setSelectedItem(null);
    if (activeTab === 'bugs') setIsBugModalOpen(true);
    else setIsTaskModalOpen(true);
  };

  const handleEdit = (item) => {
    setSelectedItem(item);
    if (activeTab === 'bugs') setIsBugModalOpen(true);
    else setIsTaskModalOpen(true);
  };

  const items = activeTab === 'bugs' ? bugs : tasks;
  const filteredItems = items.filter(item => 
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.project?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getPriorityColor = (p) => {
    switch(p) {
      case 'urgent': return 'text-rose-400 bg-rose-400/10 border-rose-400/20 shadow-[0_0_15px_rgba(251,113,133,0.1)]';
      case 'high': return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
      case 'medium': return 'text-indigo-400 bg-indigo-400/10 border-indigo-400/20';
      default: return 'text-slate-400 bg-slate-400/10 border-slate-400/20';
    }
  };

  const getStatusColor = (s) => {
    switch(s) {
      case 'resolved':
      case 'closed': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]';
      case 'in_progress': return 'bg-blue-500/10 text-blue-400 border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.1)]';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  return (
    <div className="flex h-screen bg-[#050505] text-slate-300 overflow-hidden font-sans">
      {/* Premium Sidebar */}
      <aside className="w-80 bg-[#0a0a0a] border-r border-white/5 flex flex-col relative z-30 shadow-[10px_0_50px_rgba(0,0,0,0.5)]">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 to-transparent pointer-events-none"></div>
        
        <div className="p-10 relative z-10">
          <div className="flex items-center gap-4 mb-14 group cursor-pointer">
            <div className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-3 rounded-2xl shadow-2xl shadow-indigo-500/30 group-hover:rotate-6 transition-transform duration-500">
              <Bug className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-2xl font-black text-white tracking-tighter block leading-none">BugFinder</span>
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400">Enterprise</span>
            </div>
          </div>

          <nav className="space-y-4">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600 mb-6 ml-4">Command Terminal</p>
            <button 
              onClick={() => setActiveTab('bugs')}
              className={`w-full flex items-center gap-4 px-6 py-5 rounded-2xl transition-all duration-500 group relative overflow-hidden ${activeTab === 'bugs' ? 'bg-indigo-500 text-white shadow-2xl shadow-indigo-500/40' : 'text-slate-500 hover:bg-white/5 hover:text-white'}`}
            >
              <Bug className={`w-5 h-5 relative z-10 ${activeTab === 'bugs' ? 'text-white' : 'group-hover:text-indigo-400 transition-colors'}`} />
              <span className="text-xs font-black uppercase tracking-[0.2em] relative z-10">Issues Log</span>
              {activeTab === 'bugs' && <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer"></div>}
            </button>
            <button 
              onClick={() => setActiveTab('tasks')}
              className={`w-full flex items-center gap-4 px-6 py-5 rounded-2xl transition-all duration-500 group relative overflow-hidden ${activeTab === 'tasks' ? 'bg-indigo-500 text-white shadow-2xl shadow-indigo-500/40' : 'text-slate-500 hover:bg-white/5 hover:text-white'}`}
            >
              <CheckSquare className={`w-5 h-5 relative z-10 ${activeTab === 'tasks' ? 'text-white' : 'group-hover:text-indigo-400 transition-colors'}`} />
              <span className="text-xs font-black uppercase tracking-[0.2em] relative z-10">Sprint Board</span>
              {activeTab === 'tasks' && <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer"></div>}
            </button>
            {user?.role === 'admin' && (
              <button 
                onClick={() => setActiveTab('users')}
                className={`w-full flex items-center gap-4 px-6 py-5 rounded-2xl transition-all duration-500 group relative overflow-hidden ${activeTab === 'users' ? 'bg-indigo-500 text-white shadow-2xl shadow-indigo-500/40' : 'text-slate-500 hover:bg-white/5 hover:text-white'}`}
              >
                <Users className={`w-5 h-5 relative z-10 ${activeTab === 'users' ? 'text-white' : 'group-hover:text-indigo-400 transition-colors'}`} />
                <span className="text-xs font-black uppercase tracking-[0.2em] relative z-10">Team Access</span>
                {activeTab === 'users' && <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer"></div>}
              </button>
            )}
          </nav>
        </div>

        <div className="mt-auto p-8 relative z-10">
          <div className="glass-panel p-6 rounded-3xl border-white/5 bg-white/[0.02] mb-6 hover:bg-white/[0.05] transition-all cursor-pointer group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-xl shadow-xl shadow-indigo-500/20 group-hover:scale-110 transition-transform">
                {user?.name?.charAt(0)}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-black text-white truncate">{user?.name}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <Shield className="w-3 h-3 text-indigo-400" />
                  <p className="text-[9px] uppercase tracking-widest text-slate-500 font-black">{user?.role}</p>
                </div>
              </div>
            </div>
          </div>
          <button 
            onClick={logout}
            className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl text-rose-500 hover:bg-rose-500/10 transition-all font-black text-[10px] uppercase tracking-[0.3em] border border-transparent hover:border-rose-500/20"
          >
            <LogOut className="w-4 h-4" />
            Terminate Session
          </button>
        </div>
      </aside>

      {/* Dynamic Main Workspace */}
      <main className="flex-1 overflow-y-auto relative bg-[#050505] p-10 lg:p-20 selection:bg-indigo-500/30">
        {/* Cinematic Lighting */}
        <div className="absolute top-0 right-0 w-[60%] h-[60%] bg-indigo-600/10 rounded-full blur-[180px] -mr-[20%] -mt-[20%] pointer-events-none opacity-50 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-[40%] h-[40%] bg-purple-600/5 rounded-full blur-[150px] -ml-[10%] -mb-[10%] pointer-events-none opacity-50"></div>

        <div className="max-w-7xl mx-auto relative z-10">
          {/* Header Dashboard Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-20">
            {[
              { label: 'System Volume', value: activeTab === 'bugs' ? bugs.length : tasks.length, color: 'text-indigo-400', icon: Zap },
              { label: 'Critical Risk', value: filteredItems.filter(i => i.priority === 'urgent' || i.priority === 'high').length, color: 'text-rose-400', icon: AlertCircle },
              { label: 'Active Targets', value: filteredItems.filter(i => i.status === 'in_progress').length, color: 'text-blue-400', icon: Target },
              { label: 'Resolved Signals', value: filteredItems.filter(i => i.status === 'resolved' || i.status === 'closed').length, color: 'text-emerald-400', icon: CheckSquare }
            ].map((stat, idx) => (
              <div key={idx} className="glass-panel p-8 rounded-[2.5rem] border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-all hover:-translate-y-2 duration-500 group">
                <div className="flex justify-between items-start mb-6">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">{stat.label}</p>
                  <stat.icon className={`w-5 h-5 ${stat.color} opacity-40 group-hover:opacity-100 transition-opacity`} />
                </div>
                <p className="text-5xl font-black text-white tracking-tighter">{stat.value}</p>
                <div className="mt-6 h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div className={`h-full bg-gradient-to-r from-indigo-500 to-purple-500 w-2/3`}></div>
                </div>
              </div>
            ))}
          </div>

          {/* Action Hub */}
          <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-10 mb-16">
            <div className="relative w-full max-w-2xl group">
              <div className="absolute inset-0 bg-indigo-500/10 blur-3xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-700"></div>
              <Search className="w-6 h-6 text-slate-600 absolute left-8 top-1/2 -translate-y-1/2 group-focus-within:text-indigo-400 transition-colors" />
              <input 
                type="text" 
                placeholder="Search encrypted database..." 
                className="w-full bg-[#0a0a0a] border border-white/5 rounded-[2.5rem] pl-20 pr-10 py-6 text-sm font-bold text-white placeholder-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all shadow-2xl"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-6">
              {activeTab !== 'users' && (
                <div className="flex items-center gap-4">
                  {['status', 'priority', ...(activeTab === 'bugs' ? ['severity'] : [])].map((f) => (
                    <div key={f} className="glass-panel bg-white/[0.02] border border-white/5 rounded-2xl px-6 py-4 flex items-center gap-3 hover:border-indigo-500/30 transition-all cursor-pointer">
                      <Filter className="w-4 h-4 text-indigo-400" />
                      <select 
                        className="bg-transparent border-none text-[10px] font-black uppercase tracking-widest text-slate-400 focus:ring-0 p-0 pr-8 cursor-pointer hover:text-white transition-colors"
                        value={filters[f]}
                        onChange={(e) => setFilters({...filters, [f]: e.target.value})}
                      >
                        <option value="" className="bg-[#0a0a0a] text-white">All {f.toUpperCase()}</option>
                        {f === 'status' ? (
                          activeTab === 'bugs' ? (
                            <>
                              <option value="reported" className="bg-[#0a0a0a] text-white">Reported</option>
                              <option value="in_progress" className="bg-[#0a0a0a] text-white">Active</option>
                              <option value="resolved" className="bg-[#0a0a0a] text-white">Resolved</option>
                            </>
                          ) : (
                            <>
                              <option value="open" className="bg-[#0a0a0a] text-white">Open</option>
                              <option value="in_progress" className="bg-[#0a0a0a] text-white">Active</option>
                              <option value="resolved" className="bg-[#0a0a0a] text-white">Done</option>
                            </>
                          )
                        ) : f === 'priority' ? (
                          <>
                            <option value="low" className="bg-[#0a0a0a] text-white">Low</option>
                            <option value="medium" className="bg-[#0a0a0a] text-white">Medium</option>
                            <option value="high" className="bg-[#0a0a0a] text-white">High</option>
                            <option value="urgent" className="bg-[#0a0a0a] text-white">Urgent</option>
                          </>
                        ) : (
                          <>
                            <option value="minor" className="bg-[#0a0a0a] text-white">Minor</option>
                            <option value="major" className="bg-[#0a0a0a] text-white">Major</option>
                            <option value="critical" className="bg-[#0a0a0a] text-white">Critical</option>
                            <option value="blocker" className="bg-[#0a0a0a] text-white">Blocker</option>
                          </>
                        )}
                      </select>
                    </div>
                  ))}
                </div>
              )}
              <button 
                onClick={handleCreateNew}
                className="bg-indigo-500 hover:bg-indigo-600 text-white px-12 py-6 rounded-[2.5rem] font-black text-xs uppercase tracking-[0.2em] flex items-center gap-4 transition-all duration-500 shadow-[0_20px_50px_rgba(79,70,229,0.3)] hover:scale-105 active:scale-95 group"
              >
                <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform duration-500" />
                New {activeTab === 'bugs' ? 'Report' : 'Target'}
              </button>
            </div>
          </div>

          {/* Attractive Content Cards */}
          {isLoading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-10">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="glass-panel rounded-[3rem] p-10 border-white/5 animate-pulse bg-white/[0.01]">
                  <div className="w-24 h-6 bg-white/5 rounded-full mb-10"></div>
                  <div className="w-full h-10 bg-white/5 rounded-2xl mb-4"></div>
                  <div className="w-2/3 h-8 bg-white/5 rounded-2xl mb-12"></div>
                  <div className="flex justify-between pt-8 border-t border-white/5">
                    <div className="flex gap-4">
                      <div className="w-12 h-12 bg-white/5 rounded-2xl"></div>
                      <div className="w-24 h-6 bg-white/5 rounded-xl mt-3"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : activeTab === 'users' ? (
            <div className="glass-panel rounded-[3rem] overflow-hidden border border-white/5 shadow-2xl bg-[#0a0a0a]">
              <table className="w-full text-left">
                <thead className="bg-white/[0.02] border-b border-white/5">
                  <tr>
                    <th className="px-12 py-8 text-[11px] font-black uppercase tracking-[0.3em] text-slate-500">Identity</th>
                    <th className="px-10 py-8 text-[11px] font-black uppercase tracking-[0.3em] text-slate-500">Privileges</th>
                    <th className="px-10 py-8 text-[11px] font-black uppercase tracking-[0.3em] text-slate-500">Authentication</th>
                    <th className="px-12 py-8 text-[11px] font-black uppercase tracking-[0.3em] text-slate-500 text-right">Ops</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {adminUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-white/[0.01] transition-colors group">
                      <td className="px-12 py-10">
                        <div className="flex items-center gap-6">
                          <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-white/5 flex items-center justify-center text-indigo-400 font-black text-xl shadow-inner group-hover:scale-110 transition-transform">
                            {u.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-black text-white text-lg leading-tight">{u.name}</p>
                            <p className="text-xs text-slate-600 font-bold tracking-tight">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-10 py-10 text-xs font-black uppercase tracking-[0.2em] text-indigo-400">{u.role}</td>
                      <td className="px-10 py-10">
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${u.is_approved ? 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]' : 'bg-amber-500 animate-pulse shadow-[0_0_15px_rgba(245,158,11,0.5)]'}`}></div>
                          <span className={`text-[11px] font-black uppercase tracking-widest ${u.is_approved ? 'text-emerald-500' : 'text-amber-500'}`}>
                            {u.is_approved ? 'Authenticated' : 'Pending Verification'}
                          </span>
                        </div>
                      </td>
                      <td className="px-12 py-10 text-right">
                        <div className="flex justify-end gap-4">
                          {!u.is_approved && (
                            <button onClick={() => handleApprove(u.id)} className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-emerald-500/20 active:scale-95 transition-all">Verify Access</button>
                          )}
                          {u.id !== user.id && (
                            <button onClick={() => handleReject(u.id)} className="text-slate-600 hover:text-rose-400 hover:bg-rose-500/10 px-6 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">Revoke</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-56 glass-panel rounded-[4rem] border-white/5 border-dashed bg-white/[0.01]">
              <div className="bg-slate-900 w-24 h-24 rounded-[2rem] flex items-center justify-center mx-auto mb-10 shadow-inner group">
                <Bug className="w-10 h-10 text-slate-700 group-hover:text-indigo-500 transition-colors" />
              </div>
              <h3 className="text-4xl font-black text-white mb-4 tracking-tighter">Database Silent</h3>
              <p className="text-slate-600 font-bold uppercase tracking-[0.3em] text-[10px]">No anomalies detected in the current sector</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-10">
              {filteredItems.map((item) => (
                <div 
                  key={item.id} 
                  onClick={() => handleEdit(item)}
                  className="glass-panel rounded-[3rem] p-10 border border-white/5 bg-[#0a0a0a] group cursor-pointer hover:border-indigo-500/40 hover:shadow-[0_40px_100px_rgba(0,0,0,0.8)] transition-all duration-700 relative overflow-hidden active:scale-[0.98]"
                >
                  {/* Subtle Gradient Glow */}
                  <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-full blur-[100px] -mr-32 -mt-32 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                  
                  <div className="flex justify-between items-start mb-10 relative z-10">
                    <div className="flex flex-col gap-3">
                      <span className="text-[11px] font-black tracking-[0.4em] text-slate-600 uppercase">SIGNAL #{item.id}</span>
                      <div className="flex flex-wrap gap-2">
                        {item.project && <span className="px-4 py-2 rounded-xl bg-indigo-500/10 text-indigo-400 text-[9px] font-black uppercase tracking-[0.2em] border border-indigo-500/20">{item.project}</span>}
                        {item.category && <span className="px-4 py-2 rounded-xl bg-purple-500/10 text-purple-400 text-[9px] font-black uppercase tracking-[0.2em] border border-purple-500/20">{item.category}</span>}
                      </div>
                    </div>
                    <span className={`px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border shadow-2xl ${getStatusColor(item.status)}`}>
                      {item.status.replace('_', ' ')}
                    </span>
                  </div>

                  <h3 className="text-3xl font-black text-white mb-6 line-clamp-2 group-hover:text-indigo-400 transition-colors duration-500 leading-tight tracking-tight relative z-10">
                    {item.title}
                  </h3>
                  <p className="text-slate-500 font-medium text-base line-clamp-3 mb-12 leading-relaxed opacity-80 group-hover:opacity-100 transition-opacity relative z-10">
                    {item.description}
                  </p>

                  <div className="flex items-center justify-between pt-10 border-t border-white/5 relative z-10">
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-white/5 flex items-center justify-center text-xl font-black text-white shadow-xl group-hover:scale-110 transition-transform duration-500">
                        {(item.creator?.name || 'U')?.charAt(0)}
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-700 leading-none mb-2">Reporter</p>
                        <p className="text-base font-black text-white leading-none tracking-tight">{item.creator?.name || 'Anonymous'}</p>
                      </div>
                    </div>

                    <div className={`flex items-center gap-3 px-5 py-3 rounded-2xl border shadow-xl ${getPriorityColor(item.priority)}`}>
                      <Clock className="w-4 h-4" />
                      <span className="text-[10px] font-black uppercase tracking-widest">{item.priority}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Modals */}
      <BugModal 
        isOpen={isBugModalOpen}
        onClose={() => setIsBugModalOpen(false)}
        bug={selectedItem}
        onSave={fetchData}
        users={users}
      />
      <TaskModal 
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        task={selectedItem}
        onSave={fetchData}
        users={users}
      />
    </div>
  );
}
