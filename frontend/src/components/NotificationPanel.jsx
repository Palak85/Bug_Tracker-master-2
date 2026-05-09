import { useState, useEffect, useRef, useCallback } from 'react';
import { Bell, Bug, CheckSquare, MessageSquare, X, Check, Loader2 } from 'lucide-react';
import api from '../services/api';
import { usePolling } from '../hooks/usePolling';

/* ── helpers ──────────────────────────────────────────────────────────────── */
function relativeTime(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days  = Math.floor(diff / 86_400_000);
  if (mins < 1)   return 'just now';
  if (mins < 60)  return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

function typeIcon(type) {
  switch (type) {
    case 'bug':     return <Bug       size={14} className="text-rose-500   flex-shrink-0 mt-0.5" />;
    case 'task':    return <CheckSquare size={14} className="text-indigo-500 flex-shrink-0 mt-0.5" />;
    case 'comment': return <MessageSquare size={14} className="text-amber-500  flex-shrink-0 mt-0.5" />;
    default:        return <Bell      size={14} className="text-gray-400   flex-shrink-0 mt-0.5" />;
  }
}

function actionLabel(action) {
  const map = {
    created:       'Created',
    updated:       'Updated',
    deleted:       'Deleted',
    status_change: 'Changed status on',
    commented:     'Commented on',
    resolved:      'Resolved',
    closed:        'Closed',
  };
  return map[action] ?? action;
}

/* ── component ────────────────────────────────────────────────────────────── */
export default function NotificationPanel() {
  const [isOpen,         setIsOpen]         = useState(false);
  const [notifications,  setNotifications]  = useState([]);
  const [unreadCount,    setUnreadCount]    = useState(0);
  const [isLoading,      setIsLoading]      = useState(false);
  const [isMarking,      setIsMarking]      = useState(false);
  const panelRef = useRef(null);

  /* ── fetch notifications ── */
  const fetchNotifications = useCallback(async (isPolling = false) => {
    try {
      const [notifRes, countRes] = await Promise.all([
        api.get('/notifications'),
        api.get('/notifications/unread-count'),
      ]);
      setNotifications(notifRes.data.data || []);
      setUnreadCount(countRes.data.count ?? 0);
    } catch {
      // Silently fail — this is a non-critical feature
    }
  }, []);

  // Poll every 30 seconds
  usePolling(fetchNotifications, 30_000);

  // Load immediately when panel opens
  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      fetchNotifications().finally(() => setIsLoading(false));
    }
  }, [isOpen, fetchNotifications]);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') setIsOpen(false); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  /* ── mark all read ── */
  const handleMarkRead = async () => {
    setIsMarking(true);
    try {
      await api.post('/notifications/mark-read');
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, is_unread: false })));
    } catch {
      // ignore
    } finally {
      setIsMarking(false);
    }
  };

  return (
    <div ref={panelRef} className="relative">

      {/* ── Bell Button ── */}
      <button
        onClick={() => setIsOpen(prev => !prev)}
        className="relative w-10 h-10 rounded-xl bg-white shadow-sm border border-gray-100 flex items-center justify-center text-gray-500 hover:text-purple-600 hover:bg-purple-50 hover:border-purple-200 transition-all"
        title="Notifications"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 bg-gradient-to-br from-rose-500 to-pink-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm animate-bounce">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* ── Dropdown Panel ── */}
      {isOpen && (
        <div className="absolute right-0 top-12 w-80 bg-white rounded-[20px] shadow-[0_20px_60px_rgba(0,0,0,0.15)] border border-gray-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">

          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
            <div className="flex items-center gap-2">
              <Bell size={16} className="text-purple-500" />
              <h3 className="font-bold text-gray-800 text-sm">Notifications</h3>
              {unreadCount > 0 && (
                <span className="bg-rose-50 text-rose-500 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkRead}
                  disabled={isMarking}
                  className="text-[10px] font-semibold text-purple-500 hover:text-purple-700 flex items-center gap-1 transition-colors"
                >
                  {isMarking
                    ? <Loader2 size={10} className="animate-spin" />
                    : <Check size={10} />
                  }
                  Mark all read
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={12} />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="max-h-[360px] overflow-y-auto">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="animate-spin text-purple-400" size={20} />
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-10 px-6">
                <Bell size={32} className="text-gray-200 mx-auto mb-3" />
                <p className="text-sm text-gray-400 font-medium">You're all caught up!</p>
                <p className="text-xs text-gray-300 mt-1">No new activity on your items.</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-50">
                {notifications.map((n) => (
                  <li
                    key={n.id}
                    className={`flex items-start gap-3 px-5 py-3.5 transition-colors ${
                      n.is_unread ? 'bg-purple-50/50 hover:bg-purple-50' : 'hover:bg-gray-50'
                    }`}
                  >
                    {/* Type icon */}
                    <div className={`mt-1 w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      n.type === 'bug'     ? 'bg-rose-50'   :
                      n.type === 'task'   ? 'bg-indigo-50' :
                      n.type === 'comment'? 'bg-amber-50'  : 'bg-gray-50'
                    }`}>
                      {typeIcon(n.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-700 leading-relaxed">
                        <span className="font-semibold text-gray-900">{n.actor}</span>
                        {' '}
                        <span className="text-gray-500">{actionLabel(n.action)}</span>
                        {' '}
                        <span className="font-medium text-gray-700">
                          {n.type === 'comment' ? 'your item' : `${n.type} #${n.subject_id}`}
                        </span>
                      </p>
                      {n.description && (
                        <p className="text-[11px] text-gray-400 mt-0.5 truncate">{n.description}</p>
                      )}
                      <p className="text-[10px] text-gray-300 mt-1">{relativeTime(n.created_at)}</p>
                    </div>

                    {/* Unread dot */}
                    {n.is_unread && (
                      <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0" />
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="border-t border-gray-50 px-5 py-3 flex justify-center">
              <p className="text-[10px] text-gray-300">
                Showing last {notifications.length} notifications · Updates every 30s
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
