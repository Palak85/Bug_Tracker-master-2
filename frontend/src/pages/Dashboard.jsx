import { useState, useEffect, useCallback, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { LogOut, Bug, Plus, Search, Filter, CheckSquare, Clock, AlertCircle, Loader2, Users, Shield, Zap, Target, TrendingUp, Paperclip, Menu, X, ArrowRight, Sparkles, CalendarClock } from 'lucide-react';
import BugModal from '../components/BugModal';
import TaskModal from '../components/TaskModal';
import ProfileModal from '../components/ProfileModal';
import StatsTab from '../components/StatsTab';
import ActivityFeed from '../components/ActivityFeed';
import ProjectTab from '../components/ProjectTab';
import ConfirmModal from '../components/ConfirmModal';
import NotificationPanel from '../components/NotificationPanel';
import KanbanBoard from '../components/KanbanBoard';
import { Layout } from 'lucide-react';
import toast from 'react-hot-toast';
import { usePolling } from '../hooks/usePolling';
import BugChatbot from '../components/BugChatbot';
import { MessageSquareText, Sun, Moon } from 'lucide-react';
import { useDarkMode } from '../hooks/useDarkMode';

export default function Dashboard() {
  const { user, logout } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('bugs');
  const [bugs, setBugs] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [adminUsers, setAdminUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isBugModalOpen, setIsBugModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({ status: '', priority: '', severity: '', project_id: '', due_date: '' });
  const [confirmState, setConfirmState] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isFloatingChatOpen, setIsFloatingChatOpen] = useState(false);
  const [isDark, toggleTheme] = useDarkMode();

  // Debounce the search so we don't fire on every keystroke
  useEffect(() => {
    const timer = setTimeout(() => { setDebouncedSearch(searchQuery); setPage(1); }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Wrap fetchData in useCallback so usePolling can reference a stable identity
  const fetchData = useCallback(async (isPolling = false) => {
    if (!isPolling) setIsLoading(true);
    try {
      const [usersRes, projectsRes] = await Promise.all([
        api.get('/users'),
        api.get('/projects')
      ]);
      setUsers(Array.isArray(usersRes.data) ? usersRes.data : usersRes.data.data || []);
      setProjects(projectsRes.data || []);
      if (activeTab === 'bugs') {
        const bugsRes = await api.get('/bugs', { params: { ...filters, search: debouncedSearch, page } });
        setBugs(bugsRes.data.data || []);
        setTotalPages(bugsRes.data.last_page || 1);
      } else if (activeTab === 'tasks') {
        const tasksRes = await api.get('/tasks', { params: { ...filters, search: debouncedSearch, page } });
        setTasks(tasksRes.data.data || []);
        setTotalPages(tasksRes.data.last_page || 1);
      }
    } catch (err) {
      console.error('Failed to fetch data', err);
    } finally {
      if (!isPolling) setIsLoading(false);
    }
  }, [activeTab, filters, debouncedSearch, page]);

  // Auto-refresh every 30s — fires immediately on mount too
  usePolling(fetchData, 30_000);

  useEffect(() => {
    if (user?.role === 'admin' && activeTab === 'users') fetchAdminUsers();
  }, [activeTab, user]);

  const handleFilterChange = (f, val) => { setFilters({ ...filters, [f]: val }); setPage(1); };


  const fetchAdminUsers = async () => {
    try { const res = await api.get('/admin/users'); setAdminUsers(res.data); }
    catch (err) { console.error('Failed to fetch admin users', err); }
  };

  const handleApprove = async (id) => {
    setConfirmState({
      title: 'Approve User',
      message: 'Grant this user access to BugFinder? They will be able to log in immediately.',
      confirmLabel: 'Approve',
      variant: 'warning',
      onConfirm: async () => {
        try {
          await api.patch(`/admin/users/${id}/approve`);
          fetchAdminUsers();
          toast.success('User approved successfully.');
        } catch {
          toast.error('Failed to approve user.');
        }
      },
    });
  };

  const handleReject = async (id) => {
    setConfirmState({
      title: 'Remove User',
      message: 'This will permanently remove the user from the system. This action cannot be undone.',
      confirmLabel: 'Remove',
      variant: 'danger',
      onConfirm: async () => {
        try {
          await api.delete(`/admin/users/${id}`);
          fetchAdminUsers();
          toast.success('User removed.');
        } catch {
          toast.error('Failed to remove user.');
        }
      },
    });
  };

  const handleExportCsv = async () => {
    try {
      const response = await api.get('/admin/export-bugs', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `bug_reports_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Report downloaded');
    } catch (err) {
      toast.error('Failed to export report');
    }
  };

  const handleUpdateTaskStatus = async (taskId, data) => {
    try {
      await api.patch(`/tasks/${taskId}`, data);
      toast.success('Task status updated');
      fetchData(); // Refresh list
    } catch (err) {
      toast.error('Failed to update task status');
      console.error(err);
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

  const items = activeTab === 'bugs' ? bugs : tasks;
  const filteredItems = items.filter(item => {
    const search = searchQuery.toLowerCase();
    const title = (item.title || '').toLowerCase();
    const description = (item.description || '').toLowerCase();
    const category = (item.category || '').toLowerCase();
    const projectName = typeof item.project === 'object' && item.project 
      ? (item.project.name || '').toLowerCase() 
      : (item.project || '').toLowerCase();

    return title.includes(search) || 
           description.includes(search) || 
           category.includes(search) || 
           projectName.includes(search);
  });

  const getPriorityStyle = (p) => {
    switch (p) {
      case 'urgent': return 'text-white bg-gradient-to-r from-rose-500 to-pink-500 border-rose-600 shadow-sm shadow-rose-200';
      case 'high':   return 'text-white bg-gradient-to-r from-orange-500 to-amber-500 border-orange-600 shadow-sm shadow-orange-200';
      case 'medium': return 'text-white bg-gradient-to-r from-indigo-500 to-purple-500 border-indigo-600 shadow-sm shadow-indigo-200';
      default:       return 'text-[var(--text-muted)] bg-[var(--bg-input)] border-[var(--border-subtle)]';
    }
  };

  const getStatusStyle = (s) => {
    switch (s) {
      case 'resolved':
      case 'closed':      return 'text-white bg-gradient-to-r from-emerald-500 to-teal-500 border-emerald-600 shadow-sm shadow-emerald-200';
      case 'in_progress': return 'text-white bg-gradient-to-r from-amber-500 to-orange-500 border-amber-600 shadow-sm shadow-amber-200';
      default:            return 'text-white bg-gradient-to-r from-indigo-500 to-purple-500 border-indigo-600 shadow-sm shadow-indigo-200';
    }
  };

  const getSeverityStyle = (s, status) => {
    const isClosed = status === 'resolved' || status === 'closed';
    switch (s) {
      case 'blocker':
      case 'critical': return `text-white bg-gradient-to-r from-rose-600 to-pink-600 border-rose-700 shadow-sm shadow-rose-300 ${isClosed ? '' : 'animate-pulse'}`;
      case 'major':    return 'text-white bg-gradient-to-r from-orange-500 to-red-500 border-orange-600 shadow-sm shadow-orange-200';
      case 'minor':    return 'text-white bg-gradient-to-r from-blue-400 to-indigo-500 border-blue-500 shadow-sm shadow-blue-200';
      default:         return 'text-[var(--text-muted)] bg-[var(--bg-input)] border-[var(--border-subtle)]';
    }
  };

  const navItems = [
    ...(user?.role !== 'dev' ? [{ id: 'projects',  icon: Layout,      label: 'Projects'     }] : []),
    { id: 'bugs',      icon: Bug,         label: 'Issues Log'   },
    { id: 'tasks',     icon: CheckSquare,  label: 'Sprint Board' },
    ...(user?.role === 'admin' ? [{ id: 'analytics', icon: TrendingUp,   label: 'Analytics'    }] : []),
    { id: 'activity',  icon: Clock,        label: 'Activity Log' },
    ...(user?.role === 'admin' ? [{ id: 'users', icon: Users, label: 'Team Access' }] : []),
  ];

  const totalItems = activeTab === 'bugs' ? bugs.length : tasks.length;
  const criticalCount  = filteredItems.filter(i => i.priority === 'urgent' || i.priority === 'high').length;
  const activeCount    = filteredItems.filter(i => i.status === 'in_progress').length;
  const resolvedCount  = filteredItems.filter(i => i.status === 'resolved' || i.status === 'closed').length;
  const overdueCount   = filteredItems.filter(i => {
    if (!i.deadline) return false;
    const deadlineDate = new Date(i.deadline);
    const today = new Date(); today.setHours(0,0,0,0);
    return deadlineDate < today && i.status !== 'resolved' && i.status !== 'closed';
  }).length;

  const stats = [
    { label: 'Total',    value: totalItems,     pct: 100,                                        color: 'text-purple-600', icon: Zap        },
    { label: 'Critical', value: criticalCount,  pct: totalItems ? Math.round(criticalCount  / totalItems * 100) : 0, color: 'text-rose-500',   icon: AlertCircle },
    { label: 'Active',   value: activeCount,    pct: totalItems ? Math.round(activeCount    / totalItems * 100) : 0, color: 'text-indigo-600', icon: Target      },
    { label: 'Overdue',  value: overdueCount,   pct: totalItems ? Math.round(overdueCount   / totalItems * 100) : 0, color: 'text-amber-600',  icon: CalendarClock },
  ];

  return (
    <div className="flex h-screen bg-[var(--bg-base)] text-[var(--text-primary)] overflow-hidden font-sans relative transition-colors duration-300">
      {/* Background blobs */}
      <div className="absolute w-[600px] h-[600px] bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full blur-[160px] top-[-200px] left-[-200px] opacity-25 pointer-events-none z-0" />
      <div className="absolute w-[500px] h-[500px] bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full blur-[160px] bottom-[-200px] right-[-200px] opacity-25 pointer-events-none z-0" />

      {/* ── MOBILE SIDEBAR BACKDROP ── */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-20 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* ── SIDEBAR ── */}
      <aside className={`fixed lg:relative z-30 lg:z-10 w-72 bg-[var(--bg-surface)] shadow-[4px_0_30px_rgba(0,0,0,0.08)] flex flex-col h-full transition-all duration-300 ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      } border-r border-[var(--border-subtle)]`}>
        {/* Logo */}
        <div className="px-8 pt-8 pb-6">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg">
              <Bug className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-lg font-bold text-gray-800 leading-none block">BugFinder</span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-purple-500">Enterprise</span>
            </div>
          </div>

          {/* Nav */}
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-4 ml-2">Navigation</p>
          <nav className="space-y-2">
            {navItems.map(({ id, icon: Icon, label }) => (
              <button
                key={id}
                onClick={() => { setActiveTab(id); setPage(1); }}
                className={`w-full flex items-center gap-3 px-5 py-3.5 rounded-2xl text-sm font-semibold transition-all duration-300 ${
                  activeTab === id
                    ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg shadow-purple-200'
                    : 'text-gray-500 hover:bg-[#f3f5f9] hover:text-purple-600'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </nav>
        </div>

        {/* User card — click to open profile */}
        <div className="mt-auto px-6 pb-8">
          <button
            onClick={() => setIsProfileOpen(true)}
            className="w-full bg-[var(--bg-input)] rounded-2xl p-4 flex items-center gap-3 mb-4 hover:bg-purple-50 hover:ring-2 hover:ring-purple-200 transition-all text-left group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow flex-shrink-0 overflow-hidden">
              {user?.avatar_url ? (
                <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                user?.name?.charAt(0)
              )}
            </div>
            <div className="overflow-hidden flex-1">
              <p className="font-bold text-[var(--text-primary)] text-sm truncate group-hover:text-purple-700 transition-colors">{user?.name}</p>
              <div className="flex items-center gap-1">
                <Shield className="w-3 h-3 text-purple-500" />
                <p className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold">{user?.role}</p>
              </div>
            </div>
            <span className="text-[10px] text-purple-400 font-semibold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Edit ✦</span>
          </button>
          <button
            onClick={toggleTheme}
            className="w-full flex items-center justify-center gap-2 py-3 mb-3 rounded-full text-purple-600 border border-purple-200 bg-purple-50 hover:bg-purple-100 transition-colors text-xs font-bold uppercase tracking-widest"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            {isDark ? 'Light Theme' : 'Dark Theme'}
          </button>
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-full text-rose-500 border border-rose-200 bg-rose-50 hover:bg-rose-100 transition-colors text-xs font-bold uppercase tracking-widest"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <main className="flex-1 overflow-y-auto relative z-10 p-5 lg:p-10">

        {/* Mobile header row — hamburger + page title + bell */}
        <div className="flex items-center gap-3 mb-6 lg:hidden">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="w-10 h-10 rounded-xl bg-[var(--bg-surface)] shadow-sm flex items-center justify-center text-[var(--text-muted)] hover:text-purple-600 hover:bg-purple-50 transition-all border border-[var(--border-subtle)]"
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="text-lg font-bold text-[var(--text-primary)] capitalize flex-1">{activeTab.replace('_', ' ')}</span>
          <NotificationPanel />
        </div>

        {/* Desktop header — bell + live indicator (hidden on mobile) */}
        <div className="hidden lg:flex items-center justify-end gap-3 mb-6">
          <span className="flex items-center gap-1.5 text-[10px] text-emerald-500 font-semibold bg-emerald-50 px-2.5 py-1 rounded-full">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            Live · 30s
          </span>
          <NotificationPanel />
        </div>
        {/* Stat cards — hidden on analytics/activity and for non-admin users */}
        {user?.role === 'admin' && ['bugs', 'tasks'].includes(activeTab) && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
            {stats.map((s, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.07)] p-5 flex flex-col gap-2 hover:-translate-y-1 transition-transform duration-300">
                <div className="flex justify-between items-center">
                  <p className="text-xs text-gray-400 font-semibold uppercase tracking-widest">{s.label}</p>
                  <s.icon className={`w-4 h-4 ${s.color}`} />
                </div>
                <p className={`text-4xl font-bold ${s.color}`}>{s.value}</p>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-400 to-indigo-500 rounded-full transition-all duration-700"
                    style={{ width: `${s.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Search + Filters + CTA — only for bugs/tasks */}
        {['bugs', 'tasks'].includes(activeTab) && (
          <div className="flex flex-col xl:flex-row gap-4 mb-8 animate-in fade-in slide-in-from-top-2 duration-500">
            {/* Search */}
            <div className="relative flex-1 max-w-xl">
              <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search bugs, tasks, projects..."
                className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-full pl-12 pr-5 py-3 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-purple-400/40 shadow-sm transition-all"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              {['status', 'priority', 'severity'].map(f => (
                <div key={f} className="flex items-center gap-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-full px-4 py-2.5 shadow-sm hover:border-purple-300 transition-colors">
                  <Filter className="w-3.5 h-3.5 text-purple-500" />
                  <select
                    className="bg-transparent text-xs font-semibold text-[var(--text-muted)] focus:outline-none capitalize cursor-pointer"
                    value={filters[f]}
                    onChange={e => handleFilterChange(f, e.target.value)}
                  >
                    <option value="">All {f}</option>
                    {f === 'status' ? (
                      activeTab === 'bugs'
                        ? ['reported','in_progress','resolved'].map(v => <option key={v} value={v}>{v.replace('_',' ')}</option>)
                        : ['open','in_progress','resolved'].map(v => <option key={v} value={v}>{v.replace('_',' ')}</option>)
                    ) : f === 'priority'
                      ? ['low','medium','high','urgent'].map(v => <option key={v} value={v}>{v}</option>)
                      : ['minor','major','critical','blocker'].map(v => <option key={v} value={v}>{v}</option>)
                    }
                  </select>
                </div>
              ))}

              {/* Due Date Filter */}
              <div className={`flex items-center gap-2 bg-[var(--bg-surface)] border rounded-full px-4 py-2.5 shadow-sm transition-colors ${
                filters.due_date ? 'border-amber-400 bg-amber-50' : 'border-[var(--border-subtle)] hover:border-purple-300'
              }`}>
                <CalendarClock className={`w-3.5 h-3.5 ${filters.due_date ? 'text-amber-600' : 'text-purple-500'}`} />
                <select
                  className="bg-transparent text-xs font-semibold text-[var(--text-muted)] focus:outline-none cursor-pointer"
                  value={filters.due_date}
                  onChange={e => handleFilterChange('due_date', e.target.value)}
                >
                  <option value="">All Deadlines</option>
                  <option value="overdue">🔴 Overdue</option>
                  <option value="due_today">🟡 Due Today</option>
                  <option value="upcoming">🟢 Next 7 Days</option>
                  <option value="no_deadline">⚪ No Deadline</option>
                </select>
              </div>

              <button
                onClick={handleCreateNew}
                className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-6 py-3 rounded-full text-sm font-semibold shadow-lg shadow-purple-200 hover:scale-[1.03] active:scale-95 transition-all"
              >
                <Plus className="w-4 h-4" />
                New {activeTab === 'bugs' ? 'Bug' : 'Task'}
              </button>

              {user?.role === 'admin' && activeTab === 'bugs' && (
                <button
                  onClick={handleExportCsv}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-bold border border-gray-200 text-gray-500 hover:bg-gray-50 transition-all"
                >
                  <ArrowRight className="w-4 h-4 rotate-90" />
                  Export CSV
                </button>
              )}
            </div>
          </div>
        )}

        {/* Content area */}
        {isLoading && ['bugs', 'tasks', 'users'].includes(activeTab) ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 animate-pulse shadow-sm">
                <div className="w-20 h-4 bg-gray-100 rounded-full mb-4" />
                <div className="w-full h-5 bg-gray-100 rounded-xl mb-2" />
                <div className="w-3/4 h-4 bg-gray-100 rounded-xl mb-6" />
                <div className="flex justify-between pt-4 border-t border-gray-50">
                  <div className="w-16 h-4 bg-gray-100 rounded" />
                  <div className="w-16 h-4 bg-gray-100 rounded" />
                </div>
              </div>
            ))}
          </div>

        ) : activeTab === 'analytics' && user?.role === 'admin' ? (
          <StatsTab />
        ) : activeTab === 'activity' ? (
          <ActivityFeed />
        ) : activeTab === 'projects' && user?.role !== 'dev' ? (
          <ProjectTab onUpdate={fetchData} />
        ) : activeTab === 'users' ? (
          /* ── USERS TABLE ── */
          <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.07)] overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-[#f3f5f9] border-b border-gray-100">
                <tr>
                  {['Identity','Role','Status','Actions'].map(h => (
                    <th key={h} className="px-8 py-5 text-[11px] font-bold uppercase tracking-widest text-gray-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {adminUsers.map(u => (
                  <tr key={u.id} className="hover:bg-[#f8f9fc] transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center text-white font-bold text-sm shadow overflow-hidden">
                          {u.avatar_url ? (
                            <img src={u.avatar_url} alt={u.name} className="w-full h-full object-cover" />
                          ) : (
                            u.name.charAt(0)
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-gray-800">{u.name}</p>
                          <p className="text-xs text-gray-400">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-xs font-bold uppercase tracking-widest text-purple-600 bg-purple-50 border border-purple-200 px-3 py-1 rounded-full">
                        {u.role}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${u.is_approved ? 'bg-emerald-500' : 'bg-amber-400 animate-pulse'}`} />
                        <span className={`text-xs font-bold ${u.is_approved ? 'text-emerald-600' : 'text-amber-600'}`}>
                          {u.is_approved ? 'Approved' : 'Pending'}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex gap-2">
                        {!u.is_approved && (
                          <button
                            onClick={() => handleApprove(u.id)}
                            className="px-4 py-1.5 rounded-full text-xs font-bold bg-emerald-500 text-white hover:bg-emerald-600 transition-colors shadow"
                          >
                            Approve
                          </button>
                        )}
                        {u.id !== user.id && (
                          <button
                            onClick={() => handleReject(u.id)}
                            className="px-4 py-1.5 rounded-full text-xs font-bold border border-rose-200 text-rose-500 hover:bg-rose-50 transition-colors"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        ) : filteredItems.length === 0 ? (
          /* ── EMPTY STATE ── */
          <div className="text-center py-40 bg-white rounded-2xl border-2 border-dashed border-gray-200 shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-purple-50 flex items-center justify-center mx-auto mb-5">
              <Bug className="w-8 h-8 text-purple-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-700 mb-2">Nothing here yet</h3>
            <p className="text-gray-400 text-sm">No {activeTab} found matching your filters</p>
          </div>

        ) : activeTab === 'tasks' ? (
          <KanbanBoard 
            tasks={tasks} 
            onUpdate={handleUpdateTaskStatus} 
            onEditTask={handleEdit}
            isLoading={isLoading}
          />
        ) : (
          /* ── CARDS GRID (Bugs) ── */
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
            {filteredItems.map(item => (
              <div
                key={item.id}
                onClick={() => handleEdit(item)}
                className="bg-[var(--bg-surface)] rounded-2xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.07)] border border-[var(--border-subtle)] hover:border-purple-200 hover:shadow-[0_8px_30px_rgba(139,92,246,0.12)] transition-all duration-300 cursor-pointer group"
              >
                {/* Top row: ID + tags + status */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-widest">#{item.id}</span>
                    <div className="flex flex-wrap gap-1.5 mt-1.5 items-center">
                      {(item.project || item.project_id) && (
                        <span className="text-[9px] px-2 py-0.5 rounded-full bg-purple-50 text-purple-600 border border-purple-200 font-bold uppercase tracking-wide">
                          {typeof item.project === 'object' ? item.project.name : item.project}
                        </span>
                      )}
                      {item.attachment_path && (
                        <Paperclip size={12} className="text-[var(--text-muted)]" title="Has attachment" />
                      )}
                      {item.category && (
                        <span className="text-[9px] px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-200 font-bold uppercase tracking-wide">
                          {item.category}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {item.severity && (
                      <span className={`text-[9px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full border ${getSeverityStyle(item.severity, item.status)}`}>
                        {item.severity}
                      </span>
                    )}
                    <span className={`text-[9px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full border ${getStatusStyle(item.status)}`}>
                      {(item.status || '').replace('_', ' ')}
                    </span>
                  </div>
                </div>

                {/* Title */}
                <h3 className="font-bold text-[var(--text-primary)] text-base mb-2 line-clamp-2 group-hover:text-purple-600 transition-colors leading-snug">
                  {item.title}
                </h3>
                <p className="text-[var(--text-muted)] text-sm line-clamp-2 mb-5 leading-relaxed">{item.description}</p>

                {/* Footer: reporter + priority + deadline badge */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center text-white text-xs font-bold shadow overflow-hidden">
                      {item.creator?.avatar_url ? (
                        <img src={item.creator.avatar_url} alt={item.creator.name} className="w-full h-full object-cover" />
                      ) : (
                        (item.creator?.name || 'U').charAt(0)
                      )}
                    </div>
                    <span className="text-xs text-gray-500 font-medium">{item.creator?.name || 'Anonymous'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Overdue / Due Today badge */}
                    {item.deadline && (() => {
                      const dl = new Date(item.deadline);
                      const today = new Date(); today.setHours(0,0,0,0);
                      const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
                      const isOverdue = dl < today && item.status !== 'resolved' && item.status !== 'closed';
                      const isDueToday = dl >= today && dl < tomorrow;
                      if (isOverdue) return (
                        <span className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wide px-2 py-1 rounded-full border bg-rose-50 text-rose-600 border-rose-200 animate-pulse">
                          <CalendarClock className="w-3 h-3" />
                          Overdue
                        </span>
                      );
                      if (isDueToday) return (
                        <span className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wide px-2 py-1 rounded-full border bg-amber-50 text-amber-600 border-amber-200">
                          <CalendarClock className="w-3 h-3" />
                          Due Today
                        </span>
                      );
                      return (
                        <span className="flex items-center gap-1 text-[9px] font-medium text-gray-400">
                          <Clock className="w-3 h-3" />
                          {dl.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </span>
                      );
                    })()}
                    <div className={`flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full border ${getPriorityStyle(item.priority)}`}>
                      <AlertCircle size={10} />
                      {item.priority}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {activeTab !== 'users' && !isLoading && filteredItems.length > 0 && totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 mt-10">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-6 py-2.5 rounded-full text-sm font-semibold bg-white border border-gray-200 text-gray-600 hover:border-purple-300 hover:text-purple-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
            >
              Previous
            </button>
            <span className="text-sm text-gray-500 font-medium">
              Page <span className="font-bold text-gray-800">{page}</span> of <span className="font-bold text-gray-800">{totalPages}</span>
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-6 py-2.5 rounded-full text-sm font-semibold bg-white border border-gray-200 text-gray-600 hover:border-purple-300 hover:text-purple-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
            >
              Next
            </button>
          </div>
        )}
      </main>

      {/* Modals */}
      <BugModal isOpen={isBugModalOpen} onClose={() => setIsBugModalOpen(false)} bug={selectedItem} onSave={fetchData} users={users} projects={projects} currentUser={user} />
      <TaskModal isOpen={isTaskModalOpen} onClose={() => setIsTaskModalOpen(false)} task={selectedItem} onSave={fetchData} users={users} projects={projects} currentUser={user} />
      <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
      <ConfirmModal state={confirmState} onClose={() => setConfirmState(null)} />

      {/* ── FLOATING AI ASSISTANT ── */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4">
        {/* Chat Panel */}
        {isFloatingChatOpen && (
          <div className="w-[400px] h-[600px] bg-white rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-gray-100 overflow-hidden flex flex-col animate-in slide-in-from-bottom-10 duration-500">
            <BugChatbot 
              type={activeTab === 'tasks' ? 'task' : 'bug'}
              onClose={() => setIsFloatingChatOpen(false)}
              formData={{}}
              onApplySuggestion={(suggestion) => {
                setSelectedItem(null);
                if (activeTab === 'tasks' || (suggestion.type === 'task')) {
                  // Pre-fill Task Modal logic would go here, 
                  // but for now we just open the modal. 
                  // We'll set the selectedItem to a "draft" state.
                  setSelectedItem({ 
                    ...suggestion, 
                    isDraft: true,
                    status: 'open',
                    priority: suggestion.priority || 'medium'
                  });
                  setIsTaskModalOpen(true);
                } else {
                  setSelectedItem({ 
                    ...suggestion, 
                    isDraft: true,
                    status: 'reported',
                    severity: (suggestion.severity || 'major').toLowerCase(),
                    priority: (suggestion.priority || 'medium').toLowerCase()
                  });
                  setIsBugModalOpen(true);
                }
                setIsFloatingChatOpen(false);
              }}
            />
          </div>
        )}

        {/* FAB Button */}
        <button
          onClick={() => setIsFloatingChatOpen(!isFloatingChatOpen)}
          className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-xl transition-all duration-300 hover:scale-110 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(139,92,246,0.3)] active:scale-95 ${
            isFloatingChatOpen 
              ? 'bg-white text-gray-400 hover:text-purple-600' 
              : 'bg-gradient-to-br from-purple-500 to-indigo-600 text-white ring-4 ring-purple-500/20'
          }`}
        >
          {isFloatingChatOpen ? <X size={24} /> : <Sparkles size={24} />}
          {!isFloatingChatOpen && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white animate-pulse" />
          )}
        </button>
      </div>
    </div>
  );
}
