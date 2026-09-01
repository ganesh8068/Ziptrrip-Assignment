import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import TodoListPage from './pages/TodoListPage';
import TodoDetailPage from './pages/TodoDetailPage';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<TodoListPage />} />
        <Route path="/todo" element={<TodoDetailPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
