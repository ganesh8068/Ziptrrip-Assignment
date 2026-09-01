import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, Plus, Calendar, Trash2, ExternalLink, Filter, 
  ArrowUpDown, ListChecks, CheckSquare, PlusCircle, Folder, AlertTriangle 
} from 'lucide-react';
import Header from '../components/Header';

const API_BASE = 'http://localhost:5050/api/todos';

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

  // Fetch all todos once to populate Header stats accurately, and update whenever todos state updates
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
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      {/* Dynamic Header Metrics Dashboard */}
      <Header todos={allTodosForStats} />

      {/* Main Page Layout */}
      <div className="dashboard-layout">
        
        {/* SIDEBAR: Create Task Form */}
        <aside className="glass-card">
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', fontSize: '20px', fontWeight: 600 }}>
            <PlusCircle size={22} className="logo-icon" />
            Create Task
          </h2>
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Task Title *</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="What needs to be done?"
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea 
                className="form-textarea" 
                placeholder="Add some details..."
                value={newDesc}
                onChange={e => setNewDesc(e.target.value)}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Category</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g., Work, Life"
                  value={newCategory}
                  onChange={e => setNewCategory(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Priority</label>
                <select 
                  className="form-select"
                  value={newPriority}
                  onChange={e => setNewPriority(e.target.value)}
                >
                  <option value="low">🟢 Low</option>
                  <option value="medium">🟡 Medium</option>
                  <option value="high">🔴 High</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Due Date</label>
              <input 
                type="date" 
                className="form-input"
                value={newDueDate}
                onChange={e => setNewDueDate(e.target.value)}
              />
            </div>

            {/* Subtask checklist builder */}
            <div className="checklist-builder">
              <label className="form-label" style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                <ListChecks size={16} /> Checklist Subtasks
              </label>
              <div className="checklist-input-group">
                <input 
                  type="text" 
                  className="form-input" 
                  style={{ padding: '8px 12px', fontSize: '13px' }}
                  placeholder="Add item..."
                  value={subtaskText}
                  onChange={e => setSubtaskText(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddSubtask(); } }}
                />
                <button type="button" className="btn btn-secondary" style={{ padding: '8px 12px' }} onClick={handleAddSubtask}>
                  Add
                </button>
              </div>

              {newSubtasks.length > 0 && (
                <div className="checklist-items-list">
                  {newSubtasks.map((st, idx) => (
                    <div key={idx} className="checklist-builder-item">
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '80%' }}>
                        {st.title}
                      </span>
                      <button 
                        type="button" 
                        style={{ border: 'none', background: 'transparent', color: 'var(--danger)', cursor: 'pointer' }}
                        onClick={() => handleRemoveSubtask(idx)}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
              <Plus size={18} /> Add Task
            </button>
          </form>
        </aside>

        {/* MAIN PANEL: Filters & Todo Grid */}
        <main style={{ display: 'flex', flexDirection: 'column' }}>
          
          {/* Filters Toolbar */}
          <div className="toolbar">
            <div className="search-wrapper">
              <Search className="search-icon" size={18} />
              <input 
                type="text" 
                className="search-input" 
                placeholder="Search title, description..." 
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>

            <div className="filters-group">
              {/* Category Filter */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Folder size={16} style={{ color: 'var(--text-muted)' }} />
                <select 
                  className="filter-select"
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
                className="filter-select"
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
                className="filter-select"
                value={status}
                onChange={e => setStatus(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="pending">⏳ Pending</option>
                <option value="completed">✅ Completed</option>
              </select>

              {/* Sort By Select */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ArrowUpDown size={16} style={{ color: 'var(--text-muted)' }} />
                <select 
                  className="filter-select"
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
                className="btn-icon-only"
                style={{ height: '38px', width: '38px' }}
                onClick={() => setOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                title={order === 'asc' ? 'Sort Ascending' : 'Sort Descending'}
              >
                {order === 'asc' ? '▲' : '▼'}
              </button>
            </div>
          </div>

          {/* Loading / Error States */}
          {loading && todos.length === 0 ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <span>Loading your task workflow...</span>
            </div>
          ) : error ? (
            <div className="no-todos-state" style={{ borderColor: 'var(--priority-high)' }}>
              <AlertTriangle size={48} style={{ color: 'var(--priority-high)' }} />
              <h3 className="no-todos-title" style={{ color: 'var(--priority-high)' }}>Database Error</h3>
              <p>{error}</p>
            </div>
          ) : todos.length === 0 ? (
            <div className="no-todos-state">
              <CheckSquare size={48} />
              <h3 className="no-todos-title">No tasks found</h3>
              <p>Try clearing filters or add a new task on the sidebar.</p>
            </div>
          ) : (
            
            /* Todos Grid rendering */
            <div className="todos-grid">
              {todos.map(todo => {
                const totalSubtasks = todo.subtasks?.length || 0;
                const completedSubtasks = todo.subtasks?.filter(s => s.completed).length || 0;
                const percentComplete = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0;
                
                return (
                  <div 
                    key={todo.id} 
                    className={`todo-card ${todo.completed ? 'completed-state' : ''}`}
                  >
                    
                    {/* Card Header (Checkbox + Title) */}
                    <div className="todo-card-header">
                      <label className="custom-checkbox-wrapper">
                        <input 
                          type="checkbox" 
                          className="custom-checkbox"
                          checked={todo.completed}
                          onChange={() => toggleComplete(todo.id, todo.completed)}
                        />
                        <span className="checkmark"></span>
                      </label>
                      
                      <div 
                        className="todo-card-title"
                        onClick={() => navigate(`/todo?id=${todo.id}`)}
                        title="Click to view details"
                      >
                        {todo.title}
                      </div>
                    </div>

                    {/* Card Description */}
                    {todo.description && (
                      <p className="todo-card-description">{todo.description}</p>
                    )}

                    {/* Progress Bar (Checklist subtasks) */}
                    {totalSubtasks > 0 && (
                      <div className="subtasks-progress-bar-container">
                        <div className="progress-label-row">
                          <span>Checklist Progress</span>
                          <span>{completedSubtasks}/{totalSubtasks} ({percentComplete}%)</span>
                        </div>
                        <div className="progress-track">
                          <div className="progress-fill" style={{ width: `${percentComplete}%` }}></div>
                        </div>
                      </div>
                    )}

                    {/* Card Footer badges */}
                    <div className="todo-card-footer">
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        <span className={`badge badge-${todo.priority}`}>
                          {todo.priority}
                        </span>
                        {todo.category && (
                          <span className="badge badge-category">
                            {todo.category}
                          </span>
                        )}
                      </div>

                      {todo.dueDate && (
                        <div className={`due-date-wrapper ${isOverdue(todo) ? 'overdue' : ''}`}>
                          <Calendar size={14} />
                          <span>{new Date(todo.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                        </div>
                      )}
                    </div>

                    {/* Float Actions */}
                    <div className="todo-card-actions" style={{ marginTop: '16px', alignSelf: 'flex-end' }}>
                      <button 
                        className="btn-icon-only" 
                        onClick={() => navigate(`/todo?id=${todo.id}`)}
                        title="View Details"
                        style={{ border: 'none', background: 'var(--primary-light)', color: 'var(--primary)' }}
                      >
                        <ExternalLink size={15} />
                      </button>
                      <button 
                        className="btn-icon-only" 
                        onClick={(e) => handleDelete(todo.id, e)}
                        title="Delete Task"
                        style={{ border: 'none', background: 'var(--danger-bg)', color: 'var(--danger)' }}
                      >
                        <Trash2 size={15} />
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
