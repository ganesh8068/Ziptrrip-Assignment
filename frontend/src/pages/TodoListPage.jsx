import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, Plus, Calendar, Trash2, ExternalLink, 
  ArrowUpDown, ListChecks, CheckSquare, PlusCircle, Folder, AlertTriangle 
} from 'lucide-react';
import Header from '../components/Header';
import { API_BASE } from '../config/api';

export default function TodoListPage() {
  const navigate = useNavigate();
  
  // State for data
  const [todos, setTodos] = useState([]);
  const [allTodosForStats, setAllTodosForStats] = useState([]); // Needed for navbar stats
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters & Sorting state
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [category, setCategory] = useState('all');
  const [priority, setPriority] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [order, setOrder] = useState('desc');

  // New Todo form state
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newPriority, setNewPriority] = useState('medium');
  const [newCategory, setNewCategory] = useState('General');
  const [newDueDate, setNewDueDate] = useState('');
  
  // Subtasks checklist state for creation form
  const [subtaskText, setSubtaskText] = useState('');
  const [newSubtasks, setNewSubtasks] = useState([]);

  // Fetch todos on filter/sort changes
  useEffect(() => {
    fetchTodos();
  }, [search, status, category, priority, sortBy, order]);

  // Fetch all todos once to populate Header stats accurately
  const fetchAllTodosForStats = async () => {
    try {
      const response = await fetch(API_BASE);
      if (response.ok) {
        const data = await response.json();
        setAllTodosForStats(data);
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const fetchTodos = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (status !== 'all') params.append('status', status);
      if (category !== 'all') params.append('category', category);
      if (priority !== 'all') params.append('priority', priority);
      if (sortBy) params.append('sortBy', sortBy);
      if (order) params.append('order', order);

      const response = await fetch(`${API_BASE}?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch todos');
      const data = await response.json();
      setTodos(data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Could not load tasks. Please verify the backend is running.');
    } finally {
      setLoading(false);
      fetchAllTodosForStats();
    }
  };

  // Toggle quick completion on card
  const toggleComplete = async (id, currentCompleted) => {
    try {
      const response = await fetch(`${API_BASE}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !currentCompleted })
      });
      if (response.ok) {
        // Optimistic UI update
        setTodos(prev => prev.map(t => t.id === id ? { ...t, completed: !currentCompleted } : t));
        setAllTodosForStats(prev => prev.map(t => t.id === id ? { ...t, completed: !currentCompleted } : t));
      }
    } catch (err) {
      console.error('Error updating todo:', err);
    }
  };

  // Delete Todo
  const handleDelete = async (id, e) => {
    e.stopPropagation();
    try {
      const response = await fetch(`${API_BASE}/${id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        setTodos(prev => prev.filter(t => t.id !== id));
        setAllTodosForStats(prev => prev.filter(t => t.id !== id));
      } else {
        console.error('Failed to delete task from server');
      }
    } catch (err) {
      console.error('Error deleting todo:', err);
    }
  };

  // Add subtask to creation checklist array
  const handleAddSubtask = () => {
    if (!subtaskText.trim()) return;
    setNewSubtasks(prev => [...prev, { title: subtaskText.trim(), completed: false }]);
    setSubtaskText('');
  };

  // Remove subtask from creation checklist array
  const handleRemoveSubtask = (index) => {
    setNewSubtasks(prev => prev.filter((_, i) => i !== index));
  };

  // Submit new Todo
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    try {
      const response = await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle.trim(),
          description: newDesc.trim(),
          priority: newPriority,
          category: newCategory.trim() || 'General',
          dueDate: newDueDate || null,
          subtasks: newSubtasks
        })
      });

      if (response.ok) {
        // Reset form
        setNewTitle('');
        setNewDesc('');
        setNewPriority('medium');
        setNewCategory('General');
        setNewDueDate('');
        setNewSubtasks([]);
        
        // Refresh list
        fetchTodos();
      } else {
        alert('Failed to save task.');
      }
    } catch (err) {
      console.error('Error creating todo:', err);
      alert('Error connecting to backend.');
    }
  };

  // Get distinct categories in backend for filter selection
  const uniqueCategories = ['all', ...new Set(allTodosForStats.map(t => t.category).filter(Boolean))];

  // Helper to determine if item is overdue
  const isOverdue = (todo) => {
    if (todo.completed || !todo.dueDate) return false;
    const todayStr = new Date().toISOString().split('T')[0];
    return todo.dueDate < todayStr;
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Dynamic Header Metrics Dashboard */}
      <Header todos={allTodosForStats} />

      {/* Main Page Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-6 items-start">
        
        {/* SIDEBAR: Create Task Form */}
        <aside className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
          <h2 className="flex items-center gap-2.5 mb-5 text-lg font-bold text-slate-900">
            <PlusCircle size={20} className="text-indigo-600" />
            Create Task
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                Task Title *
              </label>
              <input 
                type="text" 
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400"
                placeholder="What needs to be done?"
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                Description
              </label>
              <textarea 
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400 min-h-[90px] resize-y"
                placeholder="Add some details..."
                value={newDesc}
                onChange={e => setNewDesc(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                  Category
                </label>
                <input 
                  type="text" 
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400"
                  placeholder="Work, Life"
                  value={newCategory}
                  onChange={e => setNewCategory(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                  Priority
                </label>
                <select 
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer"
                  value={newPriority}
                  onChange={e => setNewPriority(e.target.value)}
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
                className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer"
                value={newDueDate}
                onChange={e => setNewDueDate(e.target.value)}
              />
            </div>

            {/* Subtask checklist builder */}
            <div className="border border-dashed border-slate-200 bg-slate-50/50 p-3.5 rounded-xl">
              <label className="text-xs font-semibold text-slate-600 flex items-center gap-1.5 mb-2">
                <ListChecks size={15} className="text-indigo-600" /> Checklist Subtasks
              </label>
              <div className="flex gap-2 mb-2.5">
                <input 
                  type="text" 
                  className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-900 text-xs focus:outline-hidden focus:border-indigo-500"
                  placeholder="Add item..."
                  value={subtaskText}
                  onChange={e => setSubtaskText(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddSubtask(); } }}
                />
                <button 
                  type="button" 
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                  onClick={handleAddSubtask}
                >
                  Add
                </button>
              </div>

              {newSubtasks.length > 0 && (
                <div className="flex flex-col gap-1.5 max-h-40 overflow-y-auto">
                  {newSubtasks.map((st, idx) => (
                    <div key={idx} className="flex items-center justify-between px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700">
                      <span className="truncate max-w-[80%]">
                        {st.title}
                      </span>
                      <button 
                        type="button" 
                        className="text-slate-400 hover:text-rose-500 cursor-pointer text-sm leading-none"
                        onClick={() => handleRemoveSubtask(idx)}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button 
              type="submit" 
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-sm font-semibold rounded-xl transition-all shadow-xs hover:shadow-sm cursor-pointer"
            >
              <Plus size={18} /> Add Task
            </button>
          </form>
        </aside>

        {/* MAIN PANEL: Filters & Todo Grid */}
        <main className="flex flex-col">
          
          {/* Filters Toolbar */}
          <div className="flex flex-wrap gap-4 items-center justify-between mb-6 p-4 bg-white border border-slate-200 rounded-2xl shadow-xs">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
              <input 
                type="text" 
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-hidden focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder:text-slate-400" 
                placeholder="Search title, description..." 
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {/* Category Filter */}
              <div className="flex items-center gap-1.5">
                <Folder size={15} className="text-slate-400" />
                <select 
                  className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-hidden focus:border-indigo-500 cursor-pointer transition-colors"
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                >
                  <option value="all">All Categories</option>
                  {uniqueCategories.filter(cat => cat !== 'all').map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Priority Filter */}
              <select 
                className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-hidden focus:border-indigo-500 cursor-pointer transition-colors"
                value={priority}
                onChange={e => setPriority(e.target.value)}
              >
                <option value="all">All Priorities</option>
                <option value="low">🟢 Low</option>
                <option value="medium">🟡 Medium</option>
                <option value="high">🔴 High</option>
              </select>

              {/* Status Filter */}
              <select 
                className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-hidden focus:border-indigo-500 cursor-pointer transition-colors"
                value={status}
                onChange={e => setStatus(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="pending">⏳ Pending</option>
                <option value="completed">✅ Completed</option>
              </select>

              {/* Sort By Select */}
              <div className="flex items-center gap-1.5">
                <ArrowUpDown size={15} className="text-slate-400" />
                <select 
                  className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-hidden focus:border-indigo-500 cursor-pointer transition-colors"
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value)}
                >
                  <option value="createdAt">Date Created</option>
                  <option value="dueDate">Due Date</option>
                  <option value="title">Alphabetical</option>
                  <option value="priority">Priority</option>
                </select>
              </div>

              {/* Order Toggle */}
              <button 
                type="button" 
                className="flex items-center justify-center w-8 h-8 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-bold transition-colors cursor-pointer"
                onClick={() => setOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                title={order === 'asc' ? 'Sort Ascending' : 'Sort Descending'}
              >
                {order === 'asc' ? '▲' : '▼'}
              </button>
            </div>
          </div>

          {/* Loading / Error States */}
          {loading && todos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4 text-slate-500">
              <div className="w-10 h-10 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin"></div>
              <span className="text-sm font-medium">Loading your task workflow...</span>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center bg-white rounded-2xl border border-rose-200 shadow-xs text-rose-600">
              <AlertTriangle size={44} className="text-rose-500 mb-3" />
              <h3 className="text-lg font-bold text-slate-900 mb-1">Database Error</h3>
              <p className="text-sm text-slate-500">{error}</p>
            </div>
          ) : todos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-6 text-center bg-white rounded-2xl border border-dashed border-slate-300 shadow-xs text-slate-400">
              <CheckSquare size={48} className="text-slate-300 mb-3" />
              <h3 className="text-lg font-semibold text-slate-700 mb-1">No tasks found</h3>
              <p className="text-sm text-slate-400">Try clearing filters or create a new task using the sidebar.</p>
            </div>
          ) : (
            
            /* Todos Grid rendering */
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {todos.map(todo => {
                const totalSubtasks = todo.subtasks?.length || 0;
                const completedSubtasks = todo.subtasks?.filter(s => s.completed).length || 0;
                const percentComplete = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0;
                
                return (
                  <div 
                    key={todo.id} 
                    className={`flex flex-col bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 relative group ${todo.completed ? 'bg-slate-50/70 border-slate-200' : ''}`}
                  >
                    
                    {/* Card Header (Checkbox + Title) */}
                    <div className="flex items-start gap-3 mb-2.5">
                      <label className="custom-checkbox-wrapper shrink-0 mt-0.5">
                        <input 
                          type="checkbox" 
                          className="custom-checkbox"
                          checked={todo.completed}
                          onChange={() => toggleComplete(todo.id, todo.completed)}
                        />
                        <span className="checkmark"></span>
                      </label>
                      
                      <div 
                        className={`text-base font-semibold flex-1 cursor-pointer transition-colors hover:text-indigo-600 ${todo.completed ? 'line-through text-slate-400' : 'text-slate-900'}`}
                        onClick={() => navigate(`/todo?id=${todo.id}`)}
                        title="Click to view details"
                      >
                        {todo.title}
                      </div>
                    </div>

                    {/* Card Description */}
                    {todo.description && (
                      <p className="text-xs text-slate-500 mb-4 line-clamp-2 leading-relaxed">
                        {todo.description}
                      </p>
                    )}

                    {/* Progress Bar (Checklist subtasks) */}
                    {totalSubtasks > 0 && (
                      <div className="flex flex-col gap-1.5 mb-4">
                        <div className="flex justify-between text-[11px] font-semibold text-slate-400">
                          <span>Checklist Progress</span>
                          <span>{completedSubtasks}/{totalSubtasks} ({percentComplete}%)</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 transition-all duration-300"
                            style={{ width: `${percentComplete}%` }}
                          ></div>
                        </div>
                      </div>
                    )}

                    {/* Card Footer badges */}
                    <div className="flex items-center justify-between mt-auto pt-3 border-t border-slate-100">
                      <div className="flex gap-1.5 flex-wrap items-center">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold capitalize ${
                          todo.priority === 'high' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                          todo.priority === 'medium' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                          'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}>
                          {todo.priority}
                        </span>
                        {todo.category && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                            {todo.category}
                          </span>
                        )}
                      </div>

                      {todo.dueDate && (
                        <div className={`flex items-center gap-1 text-xs ${isOverdue(todo) ? 'text-rose-600 font-semibold' : 'text-slate-400'}`}>
                          <Calendar size={13} />
                          <span>{new Date(todo.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                        </div>
                      )}
                    </div>

                    {/* Float Actions */}
                    <div className="flex gap-1.5 self-end mt-3 pt-2 border-t border-slate-50 w-full justify-end">
                      <button 
                        className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors cursor-pointer" 
                        onClick={() => navigate(`/todo?id=${todo.id}`)}
                        title="View Details"
                      >
                        <ExternalLink size={14} />
                      </button>
                      <button 
                        className="flex items-center justify-center w-8 h-8 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors cursor-pointer" 
                        onClick={(e) => handleDelete(todo.id, e)}
                        title="Delete Task"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
