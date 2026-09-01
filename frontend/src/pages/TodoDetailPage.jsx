import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, Calendar, Tag, ShieldAlert, CheckCircle2, 
  Trash2, Edit, Save, Plus, X, ListTodo, FileText, CheckSquare, Clock 
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
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <span>Retrieving task detail information...</span>
      </div>
    );
  }

  if (error || !todo) {
    return (
      <div style={{ padding: '24px 0' }}>
        <Link to="/" className="back-btn" style={{ marginBottom: '24px' }}>
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>
        <div className="no-todos-state" style={{ borderColor: 'var(--priority-high)' }}>
          <ShieldAlert size={48} style={{ color: 'var(--priority-high)' }} />
          <h3 className="no-todos-title" style={{ color: 'var(--priority-high)' }}>Unable to Load Task</h3>
          <p>{error || 'Todo item not found.'}</p>
        </div>
      </div>
    );
  }

  // Calculate checklist percentage
  const totalSubtasks = todo.subtasks?.length || 0;
  const completedSubtasks = todo.subtasks?.filter(s => s.completed).length || 0;
  const percentComplete = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0;

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      
      {/* Back button link */}
      <div style={{ marginBottom: '16px' }}>
        <Link to="/" className="back-btn">
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>
      </div>

      <div className="detail-container">
        {/* Main description and details panel */}
        <div className="glass-card detail-main-card">
          
          {editMode ? (
            /* EDIT MODE INTERFACE */
            <form onSubmit={saveEdits}>
              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label className="form-label">Task Title</label>
                <input 
                  type="text" 
                  className="form-input" 
                  style={{ fontSize: '20px', fontWeight: 600 }}
                  value={editTitle}
                  onChange={e => setEditTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label className="form-label">Description</label>
                <textarea 
                  className="form-textarea" 
                  style={{ minHeight: '150px' }}
                  value={editDesc}
                  onChange={e => setEditDesc(e.target.value)}
                />
              </div>

              <div className="form-row" style={{ marginBottom: '20px' }}>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={editCategory}
                    onChange={e => setEditCategory(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Priority</label>
                  <select 
                    className="form-select"
                    value={editPriority}
                    onChange={e => setEditPriority(e.target.value)}
                  >
                    <option value="low">🟢 Low</option>
                    <option value="medium">🟡 Medium</option>
                    <option value="high">🔴 High</option>
                  </select>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '24px' }}>
                <label className="form-label">Due Date</label>
                <input 
                  type="date" 
                  className="form-input"
                  value={editDueDate}
                  onChange={e => setEditDueDate(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="submit" className="btn btn-primary">
                  <Save size={18} /> Save Changes
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => setEditMode(false)}>
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            /* VIEW MODE INTERFACE */
            <div>
              <div className="detail-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <label className="custom-checkbox-wrapper">
                    <input 
                      type="checkbox" 
                      className="custom-checkbox"
                      checked={todo.completed}
                      onChange={toggleCompleted}
                    />
                    <span className="checkmark"></span>
                  </label>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: todo.completed ? 'var(--success)' : 'var(--text-secondary)' }}>
                    {todo.completed ? 'COMPLETED' : 'PENDING'}
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '14px' }} onClick={() => setEditMode(true)}>
                    <Edit size={16} /> Edit Task
                  </button>
                  <button className="btn btn-danger" style={{ padding: '8px 16px', fontSize: '14px' }} onClick={deleteTodo}>
                    <Trash2 size={16} /> Delete Task
                  </button>
                </div>
              </div>

              <h1 className="detail-title" style={{ textDecoration: todo.completed ? 'line-through' : 'none', opacity: todo.completed ? 0.7 : 1 }}>
                {todo.title}
              </h1>

              {todo.description ? (
                <div style={{ margin: '24px 0' }}>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                    <FileText size={14} /> DESCRIPTION
                  </div>
                  <p className="detail-description">{todo.description}</p>
                </div>
              ) : (
                <p style={{ fontStyle: 'italic', color: 'var(--text-muted)', margin: '24px 0' }}>No description provided for this task.</p>
              )}

              {/* Progress bar */}
              {totalSubtasks > 0 && (
                <div className="subtasks-progress-bar-container" style={{ margin: '32px 0 16px' }}>
                  <div className="progress-label-row">
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
                      <ListTodo size={14} /> Checklist Completion Progress
                    </span>
                    <span style={{ fontSize: '12px' }}>{completedSubtasks}/{totalSubtasks} Items ({percentComplete}%)</span>
                  </div>
                  <div className="progress-track" style={{ height: '8px' }}>
                    <div className="progress-fill" style={{ width: `${percentComplete}%` }}></div>
                  </div>
                </div>
              )}

              {/* Checklist Section */}
              <div className="subtasks-section">
                <h3 className="subtasks-section-title">Task Checklist</h3>
                
                {/* Subtask input creator */}
                <div className="checklist-input-group" style={{ maxWidth: '450px', marginBottom: '20px' }}>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="Add subtask details..."
                    value={subtaskText}
                    onChange={e => setSubtaskText(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSubtask(); } }}
                  />
                  <button type="button" className="btn btn-primary" style={{ padding: '10px 16px' }} onClick={addSubtask}>
                    <Plus size={16} /> Add Item
                  </button>
                </div>

                {totalSubtasks > 0 ? (
                  <div>
                    {todo.subtasks.map(st => (
                      <div key={st.id} className={`subtask-item ${st.completed ? 'completed' : ''}`}>
                        <label className="custom-checkbox-wrapper">
                          <input 
                            type="checkbox" 
                            className="custom-checkbox"
                            checked={st.completed}
                            onChange={() => toggleSubtask(st.id)}
                          />
                          <span className="checkmark"></span>
                        </label>
                        <span className="subtask-text">{st.title}</span>
                        <button 
                          type="button" 
                          style={{ border: 'none', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', padding: '4px' }}
                          onClick={() => deleteSubtask(st.id)}
                          title="Delete checklist item"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ fontStyle: 'italic', color: 'var(--text-muted)', fontSize: '14px' }}>No checklist items created yet.</p>
                )}
              </div>
            </div>
          )}

        </div>

        {/* Sidebar Info/Metadata Grid */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="glass-card">
            <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '20px' }}>Task Metadata</h3>
            
            <div className="meta-grid">
              
              <div className="meta-item">
                <span className="meta-item-label">
                  <ShieldAlert size={14} style={{ verticalAlign: 'text-bottom', marginRight: '4px' }} />
                  PRIORITY
                </span>
                <div>
                  <span className={`badge badge-${todo.priority}`} style={{ marginTop: '4px' }}>
                    {todo.priority}
                  </span>
                </div>
              </div>

              <div className="meta-item">
                <span className="meta-item-label">
                  <Tag size={14} style={{ verticalAlign: 'text-bottom', marginRight: '4px' }} />
                  CATEGORY
                </span>
                <div>
                  <span className="badge badge-category" style={{ marginTop: '4px' }}>
                    {todo.category || 'General'}
                  </span>
                </div>
              </div>

              <div className="meta-item">
                <span className="meta-item-label">
                  <Calendar size={14} style={{ verticalAlign: 'text-bottom', marginRight: '4px' }} />
                  DUE DATE
                </span>
                <span className="meta-item-value" style={{ marginTop: '4px' }}>
                  {todo.dueDate ? new Date(todo.dueDate).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'No Due Date'}
                </span>
              </div>

              <div className="meta-item">
                <span className="meta-item-label">
                  <CheckCircle2 size={14} style={{ verticalAlign: 'text-bottom', marginRight: '4px' }} />
                  CREATED AT
                </span>
                <span className="meta-item-value" style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                  {new Date(todo.createdAt).toLocaleString()}
                </span>
              </div>

              <div className="meta-item">
                <span className="meta-item-label">
                  <Clock size={14} style={{ verticalAlign: 'text-bottom', marginRight: '4px' }} />
                  LAST UPDATED
                </span>
                <span className="meta-item-value" style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                  {new Date(todo.updatedAt).toLocaleString()}
                </span>
              </div>

            </div>
          </div>
        </aside>
      </div>

    </div>
  );
}
