const fs = require('fs').promises;
const path = require('path');

const dbPath = path.join(__dirname, 'todos.json');

/**
 * Reads all todos from the local JSON database file.
 * Returns an empty array if the file does not exist or has invalid JSON.
 */
async function readTodos() {
  try {
    const data = await fs.readFile(dbPath, 'utf8');
    return JSON.parse(data || '[]');
  } catch (error) {
    if (error.code === 'ENOENT') {
      // File does not exist, return default empty array
      return [];
    }
    console.error('Error reading todos database file:', error);
    return [];
  }
}

/**
 * Writes the array of todos to the local JSON database file.
 */
async function writeTodos(todos) {
  try {
    await fs.writeFile(dbPath, JSON.stringify(todos, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Error writing to todos database file:', error);
    throw error;
  }
}

module.exports = {
  readTodos,
  writeTodos
};
