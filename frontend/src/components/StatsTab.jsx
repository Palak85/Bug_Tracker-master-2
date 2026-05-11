import { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, Legend
} from 'recharts';
import { Bug, CheckCircle, Clock, AlertTriangle, TrendingUp, Users } from 'lucide-react';
import { useDarkMode } from '../hooks/useDarkMode';

const COLORS = ['#8b5cf6', '#6366f1', '#ec4899', '#f59e0b', '#10b981', '#ef4444'];

export default function StatsTab() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDark] = useDarkMode();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/stats');
      setStats(response.data);
    } catch (err) {
      console.error('Failed to fetch stats', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  const overviewCards = [
    { label: 'Total Bugs', value: stats.overview.total_bugs, icon: Bug, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Total Tasks', value: stats.overview.total_tasks, icon: CheckCircle, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Projects', value: stats.overview.total_projects, icon: TrendingUp, color: 'text-pink-600', bg: 'bg-pink-50' },
    { label: 'Active Users', value: stats.overview.total_users, icon: Users, color: 'text-amber-600', bg: 'bg-amber-50' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Overview Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {overviewCards.map((card, i) => (
          <div key={i} className="bg-white p-6 rounded-[24px] shadow-sm border border-gray-100 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl ${card.bg} flex items-center justify-center ${card.color}`}>
              <card.icon size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-400 font-medium">{card.label}</p>
              <h3 className="text-2xl font-bold text-gray-800">{card.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Severity Distribution */}
        <div className="bg-white p-8 rounded-[30px] shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
            <AlertTriangle className="text-rose-500" size={20} />
            Bug Severity Distribution
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.bugs_by_severity}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="count"
                  nameKey="severity"
                >
                  {stats.bugs_by_severity.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '16px', 
                    border: 'none', 
                    boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
                    backgroundColor: isDark ? '#1e293b' : '#fff',
                    color: isDark ? '#f1f5f9' : '#1f2937'
                  }}
                />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bug Trends */}
        <div className="bg-white p-8 rounded-[30px] shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
            <TrendingUp className="text-indigo-500" size={20} />
            Weekly Bug Trends
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.bug_trends}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? '#334155' : '#f0f0f0'} />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: isDark ? '#94a3b8' : '#9ca3af' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: isDark ? '#94a3b8' : '#9ca3af' }} />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '16px', 
                    border: 'none', 
                    boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
                    backgroundColor: isDark ? '#1e293b' : '#fff',
                    color: isDark ? '#f1f5f9' : '#1f2937'
                  }}
                />
                <Line type="monotone" dataKey="count" stroke="#8b5cf6" strokeWidth={4} dot={{ r: 6, fill: '#8b5cf6', strokeWidth: 2, stroke: isDark ? '#1e293b' : '#fff' }} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Breakdown (Bar Chart) */}
        <div className="bg-white p-8 rounded-[30px] shadow-sm border border-gray-100 lg:col-span-2">
          <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
            <Clock className="text-purple-500" size={20} />
            Status Breakdown
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.bugs_by_status}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? '#334155' : '#f0f0f0'} />
                <XAxis dataKey="status" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: isDark ? '#94a3b8' : '#9ca3af' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: isDark ? '#94a3b8' : '#9ca3af' }} />
                <Tooltip 
                   cursor={{ fill: isDark ? 'rgba(255,255,255,0.05)' : '#f3f4f6' }}
                   contentStyle={{ 
                     borderRadius: '16px', 
                     border: 'none', 
                     boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
                     backgroundColor: isDark ? '#1e293b' : '#fff',
                     color: isDark ? '#f1f5f9' : '#1f2937'
                   }}
                />
                <Bar dataKey="count" fill="#6366f1" radius={[10, 10, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
