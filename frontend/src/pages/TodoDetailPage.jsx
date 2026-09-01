import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, Calendar, Tag, ShieldAlert, CheckCircle2, 
  Trash2, Edit, Save, Plus, X, ListTodo, FileText, Clock 
} from 'lucide-react';

const API_BASE = 'http://localhost:5050/api/todos';

export default function TodoDetailPage() {
  const [searchParams] = useSearchParams();
  const todoId = searchParams.get('id');
  const navigate = useNavigate();

  // Detail Page States
  const [todo, setTodo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);

  // Edit fields states
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editPriority, setEditPriority] = useState('medium');
  const [editCategory, setEditCategory] = useState('General');
  const [editDueDate, setEditDueDate] = useState('');
  
  // Subtask creation state
  const [subtaskText, setSubtaskText] = useState('');

  useEffect(() => {
    if (!todoId) {
      setError('No Todo ID was provided in the query parameters.');
      setLoading(false);
      return;
    }
    fetchTodo();
  }, [todoId]);

  const fetchTodo = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/${todoId}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Task not found in database.');
        }
        throw new Error('Failed to fetch task details.');
      }
      const data = await response.json();
      setTodo(data);
      
      // Initialize edit fields
      setEditTitle(data.title || '');
      setEditDesc(data.description || '');
      setEditPriority(data.priority || 'medium');
      setEditCategory(data.category || 'General');
      setEditDueDate(data.dueDate || '');
      
      setError(null);
    } catch (err) {
      console.error(err);
      setError(err.message || 'An error occurred while fetching the task.');
    } finally {
      setLoading(false);
    }
  };

  // Toggle major completion status
  const toggleCompleted = async () => {
    if (!todo) return;
    const updatedCompleted = !todo.completed;
    try {
      const response = await fetch(`${API_BASE}/${todoId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: updatedCompleted })
      });
      if (response.ok) {
        setTodo(prev => ({ ...prev, completed: updatedCompleted }));
      }
    } catch (err) {
      console.error('Error toggling completion:', err);
    }
  };

  // Save edits (Title, Description, Priority, Category, Due Date)
  const saveEdits = async (e) => {
    e.preventDefault();
    if (!editTitle.trim()) return;

    try {
      const response = await fetch(`${API_BASE}/${todoId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editTitle.trim(),
          description: editDesc.trim(),
          priority: editPriority,
          category: editCategory.trim(),
          dueDate: editDueDate || null
        })
      });

      if (response.ok) {
        const updated = await response.json();
        setTodo(updated);
        setEditMode(false);
      } else {
        alert('Failed to save changes.');
      }
    } catch (err) {
      console.error('Error saving edits:', err);
      alert('Error updating task in backend.');
    }
  };

  // Toggle a single subtask checkbox directly
  const toggleSubtask = async (subtaskId) => {
    if (!todo) return;
    const updatedSubtasks = todo.subtasks.map(st => 
      st.id === subtaskId ? { ...st, completed: !st.completed } : st
    );

    try {
      const response = await fetch(`${API_BASE}/${todoId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subtasks: updatedSubtasks })
      });
      if (response.ok) {
        setTodo(prev => ({ ...prev, subtasks: updatedSubtasks }));
      }
    } catch (err) {
      console.error('Error toggling subtask:', err);
    }
  };

  // Add a subtask directly from details page
  const addSubtask = async () => {
    if (!subtaskText.trim() || !todo) return;
    const updatedSubtasks = [
      ...todo.subtasks,
      { title: subtaskText.trim(), completed: false }
    ];

    try {
      const response = await fetch(`${API_BASE}/${todoId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subtasks: updatedSubtasks })
      });
      if (response.ok) {
        const data = await response.json();
        setTodo(data);
        setSubtaskText('');
      }
    } catch (err) {
      console.error('Error adding subtask:', err);
    }
  };

  // Delete a subtask directly from details page
  const deleteSubtask = async (subtaskId) => {
    if (!todo) return;
    const updatedSubtasks = todo.subtasks.filter(st => st.id !== subtaskId);

    try {
      const response = await fetch(`${API_BASE}/${todoId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subtasks: updatedSubtasks })
      });
      if (response.ok) {
        setTodo(prev => ({ ...prev, subtasks: updatedSubtasks }));
      }
    } catch (err) {
      console.error('Error deleting subtask:', err);
    }
  };

  // Delete entire Todo
  const deleteTodo = async () => {
    try {
      const response = await fetch(`${API_BASE}/${todoId}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        navigate('/');
      } else {
        console.error('Failed to delete task from server');
      }
    } catch (err) {
      console.error('Error deleting todo:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4 text-slate-500">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin"></div>
        <span className="text-sm font-medium">Retrieving task detail information...</span>
      </div>
    );
  }

  if (error || !todo) {
    return (
      <div className="py-8">
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors mb-6">
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>
        <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-2xl border border-rose-200 shadow-xs text-rose-600">
          <ShieldAlert size={48} className="text-rose-500 mb-3" />
          <h3 className="text-lg font-bold text-slate-900 mb-1">Unable to Load Task</h3>
          <p className="text-sm text-slate-500">{error || 'Todo item not found.'}</p>
        </div>
      </div>
    );
  }

  // Calculate checklist percentage
  const totalSubtasks = todo.subtasks?.length || 0;
  const completedSubtasks = todo.subtasks?.filter(s => s.completed).length || 0;
  const percentComplete = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0;

  return (
    <div className="flex-1 flex flex-col">
      
      {/* Back button link */}
      <div className="mb-4">
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors">
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-start">
        {/* Main description and details panel */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs">
          
          {editMode ? (
            /* EDIT MODE INTERFACE */
            <form onSubmit={saveEdits} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                  Task Title
                </label>
                <input 
                  type="text" 
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 text-lg font-bold focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  value={editTitle}
                  onChange={e => setEditTitle(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                  Description
                </label>
                <textarea 
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all min-h-[140px] resize-y"
                  value={editDesc}
                  onChange={e => setEditDesc(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                    Category
                  </label>
                  <input 
                    type="text" 
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                    value={editCategory}
                    onChange={e => setEditCategory(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                    Priority
                  </label>
                  <select 
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer"
                    value={editPriority}
                    onChange={e => setEditPriority(e.target.value)}
                  >
                    <option value="low">🟢 Low</option>
                    <option value="medium">🟡 Medium</option>
                    <option value="high">🔴 High</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                  Due Date
                </label>
                <input 
                  type="date" 
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer"
                  value={editDueDate}
                  onChange={e => setEditDueDate(e.target.value)}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  type="submit" 
                  className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-sm font-semibold rounded-xl transition-all shadow-xs cursor-pointer"
                >
                  <Save size={17} /> Save Changes
                </button>
                <button 
                  type="button" 
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-xl transition-colors cursor-pointer"
                  onClick={() => setEditMode(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            /* VIEW MODE INTERFACE */
            <div>
              <div className="flex flex-wrap items-center justify-between gap-4 pb-5 mb-6 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <label className="custom-checkbox-wrapper shrink-0">
                    <input 
                      type="checkbox" 
                      className="custom-checkbox"
                      checked={todo.completed}
                      onChange={toggleCompleted}
                    />
                    <span className="checkmark"></span>
                  </label>
                  <span className={`text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                    todo.completed ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {todo.completed ? 'COMPLETED' : 'PENDING'}
                  </span>
                </div>

                <div className="flex gap-2">
                  <button 
                    className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                    onClick={() => setEditMode(true)}
                  >
                    <Edit size={14} /> Edit Task
                  </button>
                  <button 
                    className="flex items-center gap-1.5 px-3.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                    onClick={deleteTodo}
                  >
                    <Trash2 size={14} /> Delete Task
                  </button>
                </div>
              </div>

              <h1 className={`text-2xl sm:text-3xl font-bold mb-4 leading-snug ${todo.completed ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                {todo.title}
              </h1>

              {todo.description ? (
                <div className="my-6 p-4 bg-slate-50 rounded-xl border border-slate-200/60">
                  <div className="text-[11px] font-bold text-slate-400 tracking-wider flex items-center gap-1.5 mb-2">
                    <FileText size={13} /> DESCRIPTION
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{todo.description}</p>
                </div>
              ) : (
                <p className="italic text-slate-400 text-sm my-6">No description provided for this task.</p>
              )}

              {/* Progress bar */}
              {totalSubtasks > 0 && (
                <div className="my-6">
                  <div className="flex justify-between items-center text-xs font-semibold text-slate-500 mb-1.5">
                    <span className="flex items-center gap-1.5">
                      <ListTodo size={14} className="text-indigo-600" /> Checklist Progress
                    </span>
                    <span>{completedSubtasks}/{totalSubtasks} Items ({percentComplete}%)</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 transition-all duration-300"
                      style={{ width: `${percentComplete}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Checklist Section */}
              <div className="mt-8 pt-6 border-t border-slate-100">
                <h3 className="text-base font-bold text-slate-900 mb-4">Task Checklist</h3>
                
                {/* Subtask input creator */}
                <div className="flex gap-2 max-w-md mb-5">
                  <input 
                    type="text" 
                    className="flex-1 px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-slate-900 text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 placeholder:text-slate-400" 
                    placeholder="Add checklist subtask..."
                    value={subtaskText}
                    onChange={e => setSubtaskText(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSubtask(); } }}
                  />
                  <button 
                    type="button" 
                    className="flex items-center gap-1 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition-all cursor-pointer shadow-xs" 
                    onClick={addSubtask}
                  >
                    <Plus size={15} /> Add Item
                  </button>
                </div>

                {totalSubtasks > 0 ? (
                  <div className="space-y-2">
                    {todo.subtasks.map(st => (
                      <div 
                        key={st.id} 
                        className={`flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl hover:border-slate-300 transition-colors group ${
                          st.completed ? 'bg-slate-50/50' : 'bg-white'
                        }`}
                      >
                        <label className="custom-checkbox-wrapper shrink-0">
                          <input 
                            type="checkbox" 
                            className="custom-checkbox"
                            checked={st.completed}
                            onChange={() => toggleSubtask(st.id)}
                          />
                          <span className="checkmark"></span>
                        </label>
                        <span className={`flex-1 text-sm ${st.completed ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                          {st.title}
                        </span>
                        <button 
                          type="button" 
                          className="text-slate-300 hover:text-rose-500 transition-colors cursor-pointer p-1"
                          onClick={() => deleteSubtask(st.id)}
                          title="Delete checklist item"
                        >
                          <X size={15} />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="italic text-slate-400 text-xs">No checklist items created yet.</p>
                )}
              </div>
            </div>
          )}

        </div>

        {/* Sidebar Info/Metadata Grid */}
        <aside className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4">Task Metadata</h3>
          
          <div className="flex flex-col gap-3">
            
            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col gap-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldAlert size={13} className="text-slate-400" />
                Priority
              </span>
              <div>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${
                  todo.priority === 'high' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                  todo.priority === 'medium' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                  'bg-emerald-50 text-emerald-700 border border-emerald-200'
                }`}>
                  {todo.priority}
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col gap-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Tag size={13} className="text-slate-400" />
                Category
              </span>
              <div>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                  {todo.category || 'General'}
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col gap-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Calendar size={13} className="text-slate-400" />
                Due Date
              </span>
              <span className="text-xs font-semibold text-slate-800">
                {todo.dueDate ? new Date(todo.dueDate).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }) : 'No Due Date'}
              </span>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col gap-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 size={13} className="text-slate-400" />
                Created At
              </span>
              <span className="text-xs text-slate-600">
                {new Date(todo.createdAt).toLocaleString()}
              </span>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col gap-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Clock size={13} className="text-slate-400" />
                Last Updated
              </span>
              <span className="text-xs text-slate-600">
                {new Date(todo.updatedAt).toLocaleString()}
              </span>
            </div>

          </div>
        </aside>
      </div>

    </div>
  );
}
