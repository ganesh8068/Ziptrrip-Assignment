const fs = require('fs').promises;
const path = require('path');
const mongoose = require('mongoose');
const Todo = require('../model/Todo');

// Path to fallback local JSON database
const fallbackDbPath = path.join(__dirname, '..', 'todos.json');

let isConnectedToMongo = false;

/**
 * Initialize Database Connection (MongoDB with automatic JSON fallback)
 */
async function initDB() {
  const uri = process.env.MONGODB_URI;

  if (!uri || uri.trim() === '') {
    console.log('[DB] No MONGODB_URI provided in .env. Using local todos.json file storage.');
    return;
  }

  try {
    console.log('[DB] Attempting connection to MongoDB...');
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000
    });
    isConnectedToMongo = true;
    console.log('[DB] Successfully connected to MongoDB.');
  } catch (error) {
    isConnectedToMongo = false;
    console.warn('[DB] Could not connect to MongoDB:', error.message);
    console.log('[DB] Falling back to local todos.json file storage.');
  }
}

/**
 * Reads all todos from MongoDB (if connected) or from local JSON file.
 */
async function readTodos() {
  if (isConnectedToMongo) {
    try {
      const todos = await Todo.find().lean();
      return todos;
    } catch (err) {
      console.error('[DB] Error querying MongoDB todos, trying fallback:', err.message);
    }
  }

  // Fallback: Read local JSON file
  try {
    const data = await fs.readFile(fallbackDbPath, 'utf8');
    return JSON.parse(data || '[]');
  } catch (error) {
    if (error.code === 'ENOENT') {
      return [];
    }
    console.error('[DB] Error reading todos.json:', error);
    return [];
  }
}

/**
 * Writes todos to MongoDB (if connected) or to local JSON file.
 */
async function writeTodos(todos) {
  if (isConnectedToMongo) {
    try {
      // In MongoDB, writeTodos can sync the list if called directly
      await Todo.deleteMany({});
      if (todos && todos.length > 0) {
        await Todo.insertMany(todos);
      }
      return true;
    } catch (err) {
      console.error('[DB] Error syncing to MongoDB:', err.message);
    }
  }

  // Fallback: Write to local JSON file
  try {
    await fs.writeFile(fallbackDbPath, JSON.stringify(todos, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('[DB] Error writing to todos.json:', error);
    throw error;
  }
}

/**
 * Helper to get connection status
 */
function getDbStatus() {
  return {
    type: isConnectedToMongo ? 'mongodb' : 'json_file',
    connected: isConnectedToMongo,
    storagePath: isConnectedToMongo ? 'MongoDB Cluster' : fallbackDbPath
  };
}

module.exports = {
  initDB,
  readTodos,
  writeTodos,
  getDbStatus
};
