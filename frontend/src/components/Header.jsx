import React from 'react';
import { Link } from 'react-router-dom';
import { CheckSquare, ClipboardList, CheckCircle2, AlertCircle, Clock } from 'lucide-react';

export default function Header({ todos = [] }) {
  // Compute dashboard metrics
  const total = todos.length;
  const completed = todos.filter(t => t.completed).length;
  const pending = total - completed;
  
  const todayStr = new Date().toISOString().split('T')[0];
  const overdue = todos.filter(t => !t.completed && t.dueDate && t.dueDate < todayStr).length;

  return (
    <header style={{ width: '100%' }}>
      {/* Navigation bar */}
      <div className="app-navbar">
        <Link to="/" className="logo-container">
          <CheckSquare className="logo-icon" size={28} />
          <span className="logo-text">FlowTask</span>
        </Link>
        <div style={{ fontSize: '14px', fontWeight: 500, opacity: 0.8 }}>
          {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
        </div>
      </div>

      {/* Stats Dashboard Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon-wrapper">
            <ClipboardList size={22} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{total}</span>
            <span className="stat-label">Total Tasks</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper success">
            <CheckCircle2 size={22} />
          </div>
          <div className="stat-info">
            <span className="stat-value">
              {completed} <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-muted)' }}>({total > 0 ? Math.round((completed / total) * 100) : 0}%)</span>
            </span>
            <span className="stat-label">Completed</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}>
            <Clock size={22} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{pending}</span>
            <span className="stat-label">Pending</span>
          </div>
        </div>

        <div className="stat-card" style={{ borderColor: overdue > 0 ? 'var(--priority-high)' : 'var(--border-color)' }}>
          <div className={`stat-icon-wrapper ${overdue > 0 ? 'danger' : ''}`}>
            <AlertCircle size={22} />
          </div>
          <div className="stat-info">
            <span className="stat-value" style={{ color: overdue > 0 ? 'var(--priority-high)' : 'inherit' }}>{overdue}</span>
            <span className="stat-label">Overdue</span>
          </div>
        </div>
      </div>
    </header>
  );
}
