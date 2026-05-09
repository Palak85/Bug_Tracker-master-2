import { useState } from 'react';
import { MoreVertical, Plus, Clock, User, AlertCircle, ArrowRight, Sparkles, CalendarClock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const columns = [
  { id: 'open', label: 'To Do', color: 'bg-purple-500' },
  { id: 'in_progress', label: 'In Progress', color: 'bg-amber-500' },
  { id: 'resolved', label: 'Completed', color: 'bg-emerald-500' }
];

export default function KanbanBoard({ tasks, onUpdate, onEditTask, isLoading }) {
  const [draggedTaskId, setDraggedTaskId] = useState(null);

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
      <div className="flex flex-row gap-6 h-[calc(100vh-250px)] overflow-hidden">
        {[1, 2, 3].map(i => (
          <div key={i} className="flex-1 min-w-[320px] bg-gray-50/50 rounded-3xl p-4 animate-pulse border border-gray-100">
            <div className="h-6 w-24 bg-gray-200 rounded-full mb-6" />
            <div className="space-y-4">
              {[1, 2].map(j => <div key={j} className="h-32 bg-white rounded-2xl shadow-sm" />)}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-row gap-6 min-h-[600px] overflow-x-auto pb-6 scrollbar-hide">
      {columns.map(col => (
        <div
          key={col.id}
          onDrop={(e) => handleDrop(e, col.id)}
          onDragOver={handleDragOver}
          className={`flex-1 min-w-[320px] flex flex-col bg-[#f8f9fc] rounded-[32px] p-5 border border-transparent transition-all duration-300 ${
            draggedTaskId ? 'hover:border-purple-300 hover:bg-purple-50/30' : ''
          }`}
        >
          {/* Column Header */}
          <div className="flex justify-between items-center px-2 mb-6">
            <div className="flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full ${col.color}`} />
              <h3 className="text-sm font-bold text-gray-700 uppercase tracking-widest">{col.label}</h3>
              <span className="bg-white px-2 py-0.5 rounded-lg text-[10px] font-bold text-gray-400 shadow-sm border border-gray-100">
                {tasks.filter(t => t.status === col.id).length}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onEditTask(null)}
                className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-400 hover:text-purple-600 hover:bg-purple-50 transition-all border border-gray-100"
                title="Add Task"
              >
                <Plus size={14} />
              </button>
              <button
                onClick={() => onEditTask(null)}
                className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 shadow-md flex items-center justify-center text-white hover:scale-110 transition-all"
                title="AI Task Helper"
              >
                <Sparkles size={12} />
              </button>
            </div>
          </div>

          {/* Task List */}
          <div className="flex-1 space-y-4">
            <AnimatePresence>
              {tasks
                .filter(t => t.status === col.id)
                .map((task) => (
                  <motion.div
                    key={task.id}
                    layoutId={task.id.toString()}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task.id)}
                    onClick={() => onEditTask(task)}
                    className="group bg-white p-5 rounded-2xl shadow-sm hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all cursor-pointer border border-gray-50 relative overflow-hidden"
                  >
                    {/* Priority Accent */}
                    <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                      task.priority === 'urgent' ? 'bg-rose-500' :
                      task.priority === 'high' ? 'bg-amber-500' :
                      task.priority === 'medium' ? 'bg-indigo-500' : 'bg-gray-300'
                    }`} />

                    <div className="flex justify-between items-start mb-3">
                      <span className={`text-[10px] font-bold uppercase tracking-tighter px-2 py-0.5 rounded-md ${
                        task.priority === 'urgent' ? 'bg-rose-50 text-rose-600' :
                        task.priority === 'high' ? 'bg-amber-50 text-amber-600' :
                        'bg-gray-50 text-gray-500'
                      }`}>
                        {task.priority}
                      </span>
                      <button 
                        onClick={() => onEditTask(task)}
                        className="text-gray-300 hover:text-purple-500 transition-colors"
                      >
                        <ArrowRight size={14} />
                      </button>
                    </div>

                    <h4 className="text-sm font-bold text-gray-800 mb-2 line-clamp-2 leading-tight">
                      {task.title}
                    </h4>
                    
                    <p className="text-xs text-gray-500 line-clamp-2 mb-4 leading-relaxed">
                      {task.description}
                    </p>

                    <div className="flex justify-between items-center pt-4 border-t border-gray-50">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center text-[10px] text-white font-bold shadow-sm">
                          {task.assignee ? task.assignee.name.charAt(0) : '?'}
                        </div>
                        <span className="text-[10px] font-medium text-gray-500">
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
                          <div className="flex items-center gap-1 text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200 animate-pulse">
                            <CalendarClock size={10} />
                            Overdue
                          </div>
                        );
                        if (isDueToday) return (
                          <div className="flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                            <CalendarClock size={10} />
                            Today
                          </div>
                        );
                        return (
                          <div className="flex items-center gap-1 text-[10px] text-gray-400">
                            <Clock size={10} />
                            {dl.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                          </div>
                        );
                      })()}
                    </div>
                  </motion.div>
                ))}
            </AnimatePresence>

            {/* Empty State in Column */}
            {tasks.filter(t => t.status === col.id).length === 0 && (
              <div className="flex flex-col items-center justify-center py-10 border-2 border-dashed border-gray-100 rounded-3xl opacity-50">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center mb-2 shadow-sm">
                  <Plus className="text-gray-300" size={16} />
                </div>
                <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">Drop here</p>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
