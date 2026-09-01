require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { initDB, getDbStatus } = require('./config/db');
const todoRoutes = require('./routes');

const app = express();
const PORT = process.env.PORT || 5050;

// Enable CORS for frontend integration
app.use(cors());

// Parse JSON request bodies
app.use(express.json());

// Set up Todo API routes
app.use('/api/todos', todoRoutes);

// Health Check Endpoint with Database status
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date(),
    db: getDbStatus()
  });
});

// Start the server and initialize Database connection
app.listen(PORT, async () => {
  console.log(`=========================================`);
  console.log(`  Todo API Server Running on port ${PORT}`);
  console.log(`  Health check: http://localhost:${PORT}/api/health`);
  await initDB();
  console.log(`=========================================`);
});
