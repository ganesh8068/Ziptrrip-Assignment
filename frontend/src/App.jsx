import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import TodoListPage from './pages/TodoListPage';
import TodoDetailPage from './pages/TodoDetailPage';

function App() {
  return (
    <BrowserRouter>
      <div className="max-w-[1400px] mx-auto min-h-screen flex flex-col p-4 sm:p-6 lg:p-8 text-slate-900">
        <Routes>
          <Route path="/" element={<TodoListPage />} />
          <Route path="/todo" element={<TodoDetailPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
