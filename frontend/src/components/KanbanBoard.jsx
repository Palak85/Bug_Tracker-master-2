import { useState } from 'react';
import { MoreVertical, Plus, Clock, User, AlertCircle, ArrowRight, Sparkles, CalendarClock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const columns = [
  { id: 'open', label: 'To Do', color: 'bg-gradient-to-r from-indigo-500 to-purple-600 shadow-indigo-200' },
  { id: 'in_progress', label: 'In Progress', color: 'bg-gradient-to-r from-amber-500 to-orange-600 shadow-amber-200' },
  { id: 'resolved', label: 'Completed', color: 'bg-gradient-to-r from-emerald-500 to-teal-600 shadow-emerald-200' }
];

export default function KanbanBoard({ tasks, onUpdate, onEditTask, isLoading }) {
  const [draggedTaskId, setDraggedTaskId] = useState(null);
  const [expandedRows, setExpandedRows] = useState({});

  const toggleExpand = (id) => {
    setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const getPriorityStyle = (p) => {
    switch (p) {
      case 'urgent': return 'text-white bg-gradient-to-r from-rose-500 to-pink-500 border-rose-600 shadow-sm shadow-rose-200';
      case 'high':   return 'text-white bg-gradient-to-r from-orange-500 to-amber-500 border-orange-600 shadow-sm shadow-orange-200';
      case 'medium': return 'text-white bg-gradient-to-r from-indigo-500 to-purple-500 border-indigo-600 shadow-sm shadow-indigo-200';
      default:       return 'text-[var(--text-muted)] bg-[var(--bg-input)] border-[var(--border-subtle)]';
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

  const handleDragStart = (e, id) => {
    setDraggedTaskId(id);
    e.dataTransfer.setData('taskId', id);
  };

  const handleDrop = async (e, newStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    setDraggedTaskId(null);
    
    const task = tasks.find(t => t.id.toString() === taskId.toString());
    if (task && task.status !== newStatus) {
      await onUpdate(taskId, { status: newStatus });
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-10">
        {[1, 2, 3].map(i => (
          <div key={i} className="animate-pulse">
            <div className="flex justify-between items-center mb-4 px-2">
              <div className="h-6 w-32 bg-[var(--bg-hover)] rounded-full" />
              <div className="h-4 w-16 bg-[var(--bg-hover)] rounded-full" />
            </div>
            <div className="flex gap-4 overflow-hidden">
              {[1, 2, 3, 4].map(j => (
                <div key={j} className="min-w-[280px] h-40 bg-[var(--bg-surface)] rounded-3xl border border-[var(--border-subtle)]" />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-12 pb-10">
      {columns.map(col => {
        const columnTasks = [...tasks]
          .filter(t => t.status === col.id)
          .sort((a, b) => (b.id || 0) - (a.id || 0)); // Most recent first

        return (
          <div
            key={col.id}
            onDrop={(e) => handleDrop(e, col.id)}
            onDragOver={handleDragOver}
            className={`flex flex-col transition-all duration-300 ${
              draggedTaskId ? 'opacity-70' : ''
            }`}
          >
            {/* Row Header */}
            <div className="flex justify-between items-center px-2 mb-5">
              <div className="flex items-center gap-4">
                <div className={`w-3 h-3 rounded-full ${col.color}`} />
                <div>
                  <h3 className="text-base font-bold text-[var(--text-primary)] tracking-tight">{col.label}</h3>
                  <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mt-0.5">
                    {columnTasks.length} {columnTasks.length === 1 ? 'Task' : 'Tasks'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={() => toggleExpand(col.id)}
                  className={`px-4 py-1.5 rounded-full text-[11px] font-bold transition-all border ${
                    expandedRows[col.id]
                      ? 'bg-purple-600 text-white border-purple-700 shadow-md'
                      : 'bg-purple-50 text-purple-600 border-purple-100 hover:bg-purple-100'
                  }`}
                >
                  {expandedRows[col.id] ? 'Show Less' : 'View All'}
                </button>
                {col.id === 'open' && (
                  <>
                    <div className="h-6 w-[1px] bg-gray-100 mx-1" />
                    <button
                      onClick={() => onEditTask(null)}
                      className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-400 hover:text-purple-600 hover:bg-purple-50 transition-all border border-gray-100"
                      title="Add Task"
                    >
                      <Plus size={14} />
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Horizontal or Grid Task List */}
            <div className={`flex gap-5 pb-4 px-2 scrollbar-hide -mx-2 transition-all duration-500 ${
              expandedRows[col.id] 
                ? 'flex-wrap items-stretch' 
                : 'flex-row overflow-x-auto overflow-y-hidden'
            }`}>
              <AnimatePresence>
                {columnTasks.map((task) => (
                  <motion.div
                    key={task.id}
                    layoutId={task.id.toString()}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task.id)}
                    onClick={() => onEditTask(task)}
                    className="group min-w-[300px] max-w-[300px] bg-white p-5 rounded-[24px] shadow-sm hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all cursor-pointer border border-gray-50 relative overflow-hidden"
                  >
                    {/* Priority Accent */}
                    <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                      task.priority === 'urgent' ? 'bg-rose-500' :
                      task.priority === 'high' ? 'bg-amber-500' :
                      task.priority === 'medium' ? 'bg-indigo-500' : 'bg-gray-300'
                    }`} />

                    <div className="flex justify-between items-start mb-3">
                      <div className="flex flex-wrap gap-1.5">
                        {task.severity && (
                          <span className={`text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${getSeverityStyle(task.severity, task.status)}`}>
                            {task.severity}
                          </span>
                        )}
                        {task.priority && (
                          <span className={`text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${getPriorityStyle(task.priority)}`}>
                            {task.priority}
                          </span>
                        )}
                      </div>
                      <ArrowRight size={12} className="text-gray-300 group-hover:text-purple-500 group-hover:translate-x-1 transition-all" />
                    </div>

                    <h4 className="text-sm font-bold text-[var(--text-primary)] mb-2 line-clamp-1 group-hover:text-purple-600 transition-colors">
                      {task.title}
                    </h4>
                    
                    <p className="text-[11px] text-gray-500 line-clamp-2 mb-4 leading-relaxed h-8">
                      {task.description}
                    </p>

                    <div className="flex justify-between items-center pt-4 border-t border-[var(--border-subtle)]">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center text-[10px] text-white font-bold shadow-sm overflow-hidden">
                          {task.assignee?.avatar_url ? (
                            <img src={task.assignee.avatar_url} alt={task.assignee.name} className="w-full h-full object-cover" />
                          ) : (
                            task.assignee ? task.assignee.name.charAt(0) : '?'
                          )}
                        </div>
                        <span className="text-[10px] font-medium text-[var(--text-muted)]">
                          {task.assignee ? task.assignee.name.split(' ')[0] : 'Unassigned'}
                        </span>
                      </div>
                      
                      {task.deadline && (() => {
                        const dl = new Date(task.deadline);
                        const today = new Date(); today.setHours(0,0,0,0);
                        const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
                        const isOverdue = dl < today && task.status !== 'resolved';
                        const isDueToday = dl >= today && dl < tomorrow;
                        if (isOverdue) return (
                          <div className="flex items-center gap-1 text-[9px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                            <CalendarClock size={9} />
                            Overdue
                          </div>
                        );
                        return (
                          <div className="flex items-center gap-1 text-[9px] text-[var(--text-muted)]">
                            <Clock size={9} />
                            {dl.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                          </div>
                        );
                      })()}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Empty State for In Progress / Completed */}
              {col.id !== 'open' && columnTasks.length === 0 && (
                <div className="flex-1 flex flex-col items-center justify-center py-8 border border-dashed border-[var(--border-subtle)] rounded-[24px] opacity-40 bg-[var(--bg-input)]/30 min-w-[300px]">
                  <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">No tasks {col.label.toLowerCase()}</p>
                </div>
              )}

              {/* Add New Placeholder Card (Only for To Do) */}
              {col.id === 'open' && (
                <div 
                  onClick={() => onEditTask(null)}
                  className="min-w-[200px] flex flex-col items-center justify-center border-2 border-dashed border-gray-100 rounded-[24px] opacity-40 hover:opacity-100 hover:border-purple-300 hover:bg-purple-50/20 transition-all cursor-pointer group"
                >
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center mb-2 shadow-sm group-hover:scale-110 transition-transform">
                    <Plus className="text-gray-300 group-hover:text-purple-500" size={16} />
                  </div>
                  <p className="text-[10px] font-bold text-gray-300 group-hover:text-purple-500 uppercase tracking-widest">New Task</p>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
