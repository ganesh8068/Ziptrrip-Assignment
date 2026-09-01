const express = require('express');
const cors = require('cors');
const path = require('path');
const todoRoutes = require('./routes');

const app = express();
const PORT = process.env.PORT || 5050;

// Enable CORS for frontend integration
app.use(cors());

// Parse JSON request bodies
app.use(express.json());

// Set up Todo API routes
app.use('/api/todos', todoRoutes);

// Simple Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date() });
});

// Start the server
app.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(`  Todo API Server Running on port ${PORT}`);
  console.log(`  Health check: http://localhost:${PORT}/api/health`);
  console.log(`=========================================`);
});
