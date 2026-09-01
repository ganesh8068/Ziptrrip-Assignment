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
    <header className="w-full">
      {/* Navigation bar */}
      <div className="flex justify-between items-center mb-6 px-6 py-4 bg-white border border-slate-200 rounded-2xl shadow-xs">
        <Link to="/" className="flex items-center gap-3 no-underline group">
          <CheckSquare className="text-indigo-600 group-hover:scale-105 transition-transform" size={28} />
          <span className="text-2xl font-bold tracking-tight bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">
            FlowTask
          </span>
        </Link>
        <div className="text-sm font-medium text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
          {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
        </div>
      </div>

      {/* Stats Dashboard Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="flex items-center gap-4 p-5 bg-white border border-slate-200 rounded-2xl shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 shrink-0">
            <ClipboardList size={22} />
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-bold text-slate-900 leading-tight">{total}</span>
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-0.5">Total Tasks</span>
          </div>
        </div>

        <div className="flex items-center gap-4 p-5 bg-white border border-slate-200 rounded-2xl shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 shrink-0">
            <CheckCircle2 size={22} />
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-bold text-slate-900 leading-tight">
              {completed} <span className="text-sm font-normal text-slate-400">({total > 0 ? Math.round((completed / total) * 100) : 0}%)</span>
            </span>
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-0.5">Completed</span>
          </div>
        </div>

        <div className="flex items-center gap-4 p-5 bg-white border border-slate-200 rounded-2xl shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-amber-50 text-amber-600 shrink-0">
            <Clock size={22} />
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-bold text-slate-900 leading-tight">{pending}</span>
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-0.5">Pending</span>
          </div>
        </div>

        <div className={`flex items-center gap-4 p-5 bg-white border rounded-2xl shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 ${overdue > 0 ? 'border-rose-300' : 'border-slate-200'}`}>
          <div className={`flex items-center justify-center w-12 h-12 rounded-xl shrink-0 ${overdue > 0 ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-slate-400'}`}>
            <AlertCircle size={22} />
          </div>
          <div className="flex flex-col">
            <span className={`text-2xl font-bold leading-tight ${overdue > 0 ? 'text-rose-600' : 'text-slate-900'}`}>{overdue}</span>
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-0.5">Overdue</span>
          </div>
        </div>
      </div>
    </header>
  );
}
