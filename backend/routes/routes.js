const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { readTodos, writeTodos } = require('../config/db');

// helper function to generate uuid
function generateId() {
  return crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 9);
}

/**
 * GET /api/todos
 * Returns list of todos with optional filtering, search, and sorting.
 */
router.get('/', async (req, res) => {
  try {
    let todos = await readTodos();
    const { search, status, category, priority, sortBy, order } = req.query;

    // 1. Filter by Search Query (Title or Description)
    if (search) {
      const searchLower = search.toLowerCase();
      todos = todos.filter(todo => 
        (todo.title && todo.title.toLowerCase().includes(searchLower)) ||
        (todo.description && todo.description.toLowerCase().includes(searchLower))
      );
    }

    // 2. Filter by Completion Status
    if (status) {
      if (status === 'completed') {
        todos = todos.filter(todo => todo.completed === true);
      } else if (status === 'pending') {
        todos = todos.filter(todo => todo.completed === false);
      }
    }

    // 3. Filter by Category
    if (category && category !== 'all') {
      todos = todos.filter(todo => todo.category && todo.category.toLowerCase() === category.toLowerCase());
    }

    // 4. Filter by Priority
    if (priority && priority !== 'all') {
      todos = todos.filter(todo => todo.priority && todo.priority.toLowerCase() === priority.toLowerCase());
    }

    // 5. Sorting
    if (sortBy) {
      const direction = order === 'desc' ? -1 : 1;
      todos.sort((a, b) => {
        let valA = a[sortBy];
        let valB = b[sortBy];

        // Handle case-insensitive sorting for strings
        if (typeof valA === 'string') valA = valA.toLowerCase();
        if (typeof valB === 'string') valB = valB.toLowerCase();

        // Handle null / undefined values
        if (!valA && valA !== 0) return 1 * direction;
        if (!valB && valB !== 0) return -1 * direction;

        if (valA < valB) return -1 * direction;
        if (valA > valB) return 1 * direction;
        return 0;
      });
    } else {
      // Default sort: newest first
      todos.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    res.json(todos);
  } catch (error) {
    console.error('Error fetching todos:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * GET /api/todos/:id
 * Returns a single todo item.
 */
router.get('/:id', async (req, res) => {
  try {
    const todos = await readTodos();
    const todo = todos.find(t => t.id === req.params.id);
    
    if (!todo) {
      return res.status(404).json({ error: 'Todo not found' });
    }
    
    res.json(todo);
  } catch (error) {
    console.error('Error fetching single todo:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * POST /api/todos
 * Creates a new todo item.
 */
router.post('/', async (req, res) => {
  try {
    const { title, description, priority, category, dueDate, subtasks } = req.body;
    
    if (!title || typeof title !== 'string' || title.trim() === '') {
      return res.status(400).json({ error: 'Title is required' });
    }

    const todos = await readTodos();
    
    const newTodo = {
      id: generateId(),
      title: title.trim(),
      description: (description || '').trim(),
      completed: false,
      priority: priority || 'medium',
      category: category || 'General',
      dueDate: dueDate || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      subtasks: Array.isArray(subtasks) 
        ? subtasks.map(st => ({
            id: generateId(),
            title: st.title ? st.title.trim() : 'Subtask',
            completed: !!st.completed
          }))
        : []
    };

    todos.push(newTodo);
    await writeTodos(todos);
    
    res.status(201).json(newTodo);
  } catch (error) {
    console.error('Error creating todo:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * PUT /api/todos/:id
 * Updates an existing todo item.
 */
router.put('/:id', async (req, res) => {
  try {
    const todos = await readTodos();
    const index = todos.findIndex(t => t.id === req.params.id);
    
    if (index === -1) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    const currentTodo = todos[index];
    const { title, description, completed, priority, category, dueDate, subtasks } = req.body;

    // Validate details if updated
    if (title !== undefined) {
      if (typeof title !== 'string' || title.trim() === '') {
        return res.status(400).json({ error: 'Title cannot be empty' });
      }
      currentTodo.title = title.trim();
    }

    if (description !== undefined) {
      currentTodo.description = (description || '').trim();
    }

    if (completed !== undefined) {
      currentTodo.completed = !!completed;
    }

    if (priority !== undefined) {
      currentTodo.priority = priority;
    }

    if (category !== undefined) {
      currentTodo.category = category || 'General';
    }

    if (dueDate !== undefined) {
      currentTodo.dueDate = dueDate || null;
    }

    if (subtasks !== undefined && Array.isArray(subtasks)) {
      currentTodo.subtasks = subtasks.map(st => ({
        id: st.id || generateId(),
        title: st.title ? st.title.trim() : 'Subtask',
        completed: !!st.completed
      }));
    }

    currentTodo.updatedAt = new Date().toISOString();
    todos[index] = currentTodo;
    
    await writeTodos(todos);
    res.json(currentTodo);
  } catch (error) {
    console.error('Error updating todo:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * DELETE /api/todos/:id
 * Deletes a todo item.
 */
router.delete('/:id', async (req, res) => {
  try {
    let todos = await readTodos();
    const initialLength = todos.length;
    todos = todos.filter(t => t.id !== req.params.id);

    if (todos.length === initialLength) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    await writeTodos(todos);
    res.json({ success: true, message: 'Todo deleted successfully' });
  } catch (error) {
    console.error('Error deleting todo:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
