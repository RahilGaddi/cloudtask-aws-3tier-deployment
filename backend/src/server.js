import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDB } from './config/db.js';

import projectsRouter from './routes/projects.js';
import categoriesRouter from './routes/categories.js';
import tasksRouter from './routes/tasks.js';
import runnerRouter from './routes/runner.js';
import statsRouter from './routes/stats.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Healthcheck Route
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    service: 'CloudTask Backend REST API Service',
    timestamp: new Date().toISOString()
  });
});

// Register API Routes
app.use('/api/projects', projectsRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/tasks', tasksRouter);
app.use('/api/runner', runnerRouter);
app.use('/api/stats', statsRouter);

// Start server and initialize database connection
async function startServer() {
  try {
    await initDB();
    app.listen(PORT, () => {
      console.log(`=======================================================`);
      console.log(`🚀 CloudTask Express API Server running on port ${PORT}`);
      console.log(`👉 Health check: http://localhost:${PORT}/api/health`);
      console.log(`=======================================================`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
