import express from 'express';
import { query } from '../config/db.js';

const router = express.Router();

// Trigger Cloud Task Execution simulation
router.post('/tasks/:id/run', async (req, res) => {
  try {
    const taskId = parseInt(req.params.id);

    // Check if task exists
    const [tasks] = await query('SELECT * FROM tasks WHERE id = ?', [taskId]);
    if (!tasks || tasks.length === 0) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    const task = tasks[0];

    // Update execution status to 'running' and status to 'executing'
    await query('UPDATE tasks SET execution_status = ?, status = ?, progress = ? WHERE id = ?', ['running', 'executing', 15, taskId]);

    // Insert log entry
    await query('INSERT INTO task_logs (task_id, log_type, message) VALUES (?, ?, ?)', [
      taskId,
      'info',
      `[Cloud Runner] Triggered container execution on ${task.cloud_runner} (Allocated: ${task.cpu_cores}, ${task.memory_limit}).`
    ]);

    // Send immediate response acknowledging start
    res.json({
      success: true,
      message: 'Task execution started',
      data: { taskId, execution_status: 'running', progress: 15 }
    });

    // Simulate asynchronous execution steps
    setTimeout(async () => {
      try {
        await query('UPDATE tasks SET progress = 50 WHERE id = ?', [taskId]);
        await query('INSERT INTO task_logs (task_id, log_type, message) VALUES (?, ?, ?)', [
          taskId,
          'info',
          `[Cloud Runner] Compiling assets & running unit test pipeline...`
        ]);
      } catch (err) {
        console.error('Async execution step 1 error:', err);
      }
    }, 2500);

    setTimeout(async () => {
      try {
        await query('UPDATE tasks SET progress = 85 WHERE id = ?', [taskId]);
        await query('INSERT INTO task_logs (task_id, log_type, message) VALUES (?, ?, ?)', [
          taskId,
          'info',
          `[Cloud Runner] Deploying artifacts to staging environment & running health checks.`
        ]);
      } catch (err) {
        console.error('Async execution step 2 error:', err);
      }
    }, 5000);

    setTimeout(async () => {
      try {
        await query('UPDATE tasks SET execution_status = ?, status = ?, progress = 100 WHERE id = ?', ['success', 'completed', taskId]);
        await query('INSERT INTO task_logs (task_id, log_type, message) VALUES (?, ?, ?)', [
          taskId,
          'success',
          `[Cloud Runner] Task completed successfully with exit code 0. Duration: 7.2s.`
        ]);
      } catch (err) {
        console.error('Async execution finish error:', err);
      }
    }, 7500);

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Stop or Cancel Cloud Task Execution
router.post('/tasks/:id/stop', async (req, res) => {
  try {
    const taskId = parseInt(req.params.id);
    await query('UPDATE tasks SET execution_status = ?, status = ? WHERE id = ?', ['failed', 'todo', taskId]);
    await query('INSERT INTO task_logs (task_id, log_type, message) VALUES (?, ?, ?)', [
      taskId,
      'warning',
      `[Cloud Runner] Execution aborted by user request.`
    ]);

    res.json({ success: true, message: 'Execution cancelled' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get task execution logs
router.get('/tasks/:id/logs', async (req, res) => {
  try {
    const taskId = parseInt(req.params.id);
    const [logs] = await query('SELECT * FROM task_logs WHERE task_id = ? ORDER BY timestamp DESC', [taskId]);
    res.json({ success: true, data: logs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
