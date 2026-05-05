import { useState, useEffect } from 'react';
import api from '../services/api';
import { Clock, User, Bug, CheckCircle, Trash2, Edit3, Loader2 } from 'lucide-react';

export default function ActivityFeed() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      const response = await api.get('/activities');
      setActivities(response.data.data);
    } catch (err) {
      console.error('Failed to fetch activities', err);
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (action, type) => {
    if (action === 'deleted') return <Trash2 className="text-rose-500" size={14} />;
    if (action === 'status_change') return <Edit3 className="text-amber-500" size={14} />;
    if (type === 'bug') return <Bug className="text-purple-500" size={14} />;
    if (type === 'task') return <CheckCircle className="text-indigo-500" size={14} />;
    return <Clock className="text-gray-400" size={14} />;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="w-6 h-6 text-purple-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
      <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
        Recent Activity
        <span className="text-xs font-normal text-gray-400">Audit Trail</span>
      </h3>

      <div className="relative">
        {/* Vertical Line */}
        <div className="absolute left-4 top-0 bottom-0 w-px bg-gray-100" />

        <div className="space-y-8">
          {activities.length === 0 ? (
            <p className="text-center text-gray-400 text-sm py-10">No activities recorded yet.</p>
          ) : (
            activities.map((activity) => (
              <div key={activity.id} className="relative pl-10">
                {/* Icon Circle */}
                <div className="absolute left-0 w-8 h-8 rounded-full bg-white border border-gray-100 shadow-sm flex items-center justify-center z-10">
                  {getIcon(activity.action, activity.type)}
                </div>

                <div className="bg-white p-4 rounded-2xl border border-gray-50 shadow-sm hover:shadow-md transition-all">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-sm font-bold text-gray-800">{activity.user.name}</span>
                    <span className="text-[10px] text-gray-400 flex items-center gap-1">
                      <Clock size={10} />
                      {formatDate(activity.created_at)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">{activity.description}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md ${
                      activity.type === 'bug' ? 'bg-purple-50 text-purple-600' : 'bg-indigo-50 text-indigo-600'
                    }`}>
                      {activity.type}
                    </span>
                    <span className="text-[10px] text-gray-400">ID: #{activity.subject_id}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
