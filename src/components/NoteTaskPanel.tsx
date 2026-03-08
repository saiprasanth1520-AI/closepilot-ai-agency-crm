import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, CheckSquare, Plus, Trash2, Edit3, Check, Clock, AlertCircle } from 'lucide-react';
import { useAppStore } from '../stores/app-store';
import { format, parseISO } from 'date-fns';
import { inputClass, btnPrimary } from './ui/Modal';

interface Props {
  dealId?: string;
  leadId?: string;
}

const priorityColors: Record<string, string> = {
  low: 'text-textSecondary',
  medium: 'text-warning',
  high: 'text-error',
};

export const NoteTaskPanel: React.FC<Props> = ({ dealId, leadId }) => {
  const { notes, tasks, addNote, deleteNote, addTask, updateTask, deleteTask } = useAppStore();
  const [tab, setTab] = useState<'notes' | 'tasks'>('notes');
  const [showAddNote, setShowAddNote] = useState(false);
  const [showAddTask, setShowAddTask] = useState(false);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskPriority, setTaskPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [taskDue, setTaskDue] = useState('');

  const filteredNotes = notes.filter((n) => (dealId ? n.dealId === dealId : n.leadId === leadId));
  const filteredTasks = tasks.filter((t) => (dealId ? t.dealId === dealId : t.leadId === leadId));

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    addNote({ title: noteTitle, content: noteContent, dealId, leadId });
    setNoteTitle(''); setNoteContent(''); setShowAddNote(false);
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    addTask({ title: taskTitle, description: taskDesc, status: 'pending', priority: taskPriority, dueDate: taskDue, dealId, leadId });
    setTaskTitle(''); setTaskDesc(''); setTaskDue(''); setShowAddTask(false);
  };

  return (
    <div className="glass-panel p-6">
      {/* Tabs */}
      <div className="flex items-center gap-1 mb-4 bg-background rounded-xl p-1">
        <button
          onClick={() => setTab('notes')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-colors ${
            tab === 'notes' ? 'bg-surface text-text' : 'text-textSecondary hover:text-text'
          }`}
        >
          <FileText size={14} /> Notes ({filteredNotes.length})
        </button>
        <button
          onClick={() => setTab('tasks')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-colors ${
            tab === 'tasks' ? 'bg-surface text-text' : 'text-textSecondary hover:text-text'
          }`}
        >
          <CheckSquare size={14} /> Tasks ({filteredTasks.length})
        </button>
      </div>

      {/* Notes Tab */}
      {tab === 'notes' && (
        <div className="space-y-3">
          <button onClick={() => setShowAddNote(!showAddNote)} className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 font-medium">
            <Plus size={14} /> Add Note
          </button>

          <AnimatePresence>
            {showAddNote && (
              <motion.form initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} onSubmit={handleAddNote} className="space-y-3 overflow-hidden">
                <input value={noteTitle} onChange={(e) => setNoteTitle(e.target.value)} required placeholder="Note title" className={inputClass} />
                <textarea value={noteContent} onChange={(e) => setNoteContent(e.target.value)} required placeholder="Write your note..." rows={3} className={inputClass} />
                <div className="flex gap-2">
                  <button type="submit" className={btnPrimary}>Save Note</button>
                  <button type="button" onClick={() => setShowAddNote(false)} className="text-sm text-textSecondary hover:text-text">Cancel</button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          {filteredNotes.map((note) => (
            <div key={note.id} className="p-3 bg-background rounded-xl border border-border group">
              <div className="flex items-start justify-between mb-1">
                <p className="text-sm font-medium">{note.title}</p>
                <button onClick={() => deleteNote(note.id)} className="opacity-0 group-hover:opacity-100 p-1 hover:bg-error/10 rounded text-textSecondary hover:text-error transition-all">
                  <Trash2 size={12} />
                </button>
              </div>
              <p className="text-xs text-textSecondary leading-relaxed">{note.content}</p>
              <p className="text-[10px] text-textSecondary mt-2">{format(parseISO(note.createdAt), 'MMM d, yyyy h:mm a')}</p>
            </div>
          ))}

          {filteredNotes.length === 0 && !showAddNote && (
            <p className="text-sm text-textSecondary text-center py-4">No notes yet. Add one above.</p>
          )}
        </div>
      )}

      {/* Tasks Tab */}
      {tab === 'tasks' && (
        <div className="space-y-3">
          <button onClick={() => setShowAddTask(!showAddTask)} className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 font-medium">
            <Plus size={14} /> Add Task
          </button>

          <AnimatePresence>
            {showAddTask && (
              <motion.form initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} onSubmit={handleAddTask} className="space-y-3 overflow-hidden">
                <input value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)} required placeholder="Task title" className={inputClass} />
                <textarea value={taskDesc} onChange={(e) => setTaskDesc(e.target.value)} placeholder="Description..." rows={2} className={inputClass} />
                <div className="grid grid-cols-2 gap-3">
                  <select value={taskPriority} onChange={(e) => setTaskPriority(e.target.value as any)} className={inputClass}>
                    <option value="low">Low Priority</option><option value="medium">Medium</option><option value="high">High Priority</option>
                  </select>
                  <input type="date" value={taskDue} onChange={(e) => setTaskDue(e.target.value)} required className={inputClass} />
                </div>
                <div className="flex gap-2">
                  <button type="submit" className={btnPrimary}>Create Task</button>
                  <button type="button" onClick={() => setShowAddTask(false)} className="text-sm text-textSecondary hover:text-text">Cancel</button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          {filteredTasks.map((task) => (
            <div key={task.id} className="p-3 bg-background rounded-xl border border-border group flex items-start gap-3">
              <button
                onClick={() => updateTask(task.id, { status: task.status === 'completed' ? 'pending' : 'completed' })}
                className={`mt-0.5 shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                  task.status === 'completed' ? 'bg-success border-success' : 'border-border hover:border-primary'
                }`}
              >
                {task.status === 'completed' && <Check size={12} className="text-white" />}
              </button>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className={`text-sm font-medium ${task.status === 'completed' ? 'line-through text-textSecondary' : ''}`}>{task.title}</p>
                  <span className={`text-[10px] font-medium ${priorityColors[task.priority]}`}>{task.priority}</span>
                </div>
                {task.description && <p className="text-xs text-textSecondary mt-0.5">{task.description}</p>}
                <div className="flex items-center gap-2 mt-1">
                  <Clock size={10} className="text-textSecondary" />
                  <span className="text-[10px] text-textSecondary">Due {task.dueDate}</span>
                </div>
              </div>
              <button onClick={() => deleteTask(task.id)} className="opacity-0 group-hover:opacity-100 p-1 hover:bg-error/10 rounded text-textSecondary hover:text-error transition-all">
                <Trash2 size={12} />
              </button>
            </div>
          ))}

          {filteredTasks.length === 0 && !showAddTask && (
            <p className="text-sm text-textSecondary text-center py-4">No tasks yet. Add one above.</p>
          )}
        </div>
      )}
    </div>
  );
};
