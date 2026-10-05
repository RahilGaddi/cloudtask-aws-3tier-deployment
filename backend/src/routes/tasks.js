import express from 'express';
import { query } from '../config/db.js';

const router = express.Router();

// Get all tasks with project & category information
router.get('/', async (req, res) => {
  try {
    const { status, priority, project_id, search } = req.query;

    let sql = `
      SELECT t.*, 
             p.name AS project_name, p.color AS project_color,
             c.name AS category_name, c.color AS category_color
      FROM tasks t
      LEFT JOIN projects p ON t.project_id = p.id
      LEFT JOIN categories c ON t.category_id = c.id
      WHERE 1=1
    `;
    const params = [];

    if (status && status !== 'all') {
      sql += ` AND t.status = ?`;
      params.push(status);
    }

    if (priority && priority !== 'all') {
      sql += ` AND t.priority = ?`;
      params.push(priority);
    }

    if (project_id && project_id !== 'all') {
      sql += ` AND t.project_id = ?`;
      params.push(parseInt(project_id));
    }

    if (search) {
      sql += ` AND (t.title LIKE ? OR t.description LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
    }

    sql += ` ORDER BY t.created_at DESC`;

    const [tasks] = await query(sql, params);

    // Fetch subtasks for each task to display completion counters
    const [subtasks] = await query('SELECT * FROM subtasks');

    const tasksWithSubtasks = tasks.map(t => {
      const taskSubs = subtasks.filter(s => s.task_id === t.id);
      return {
        ...t,
        subtasks: taskSubs,
        subtask_count: taskSubs.length,
        completed_subtasks: taskSubs.filter(s => s.completed).length
      };
    });

    res.json({ success: true, data: tasksWithSubtasks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get single task details with subtasks and logs
router.get('/:id', async (req, res) => {
  try {
    const taskId = parseInt(req.params.id);
    const [tasks] = await query(`
      SELECT t.*, 
             p.name AS project_name, p.color AS project_color,
             c.name AS category_name, c.color AS category_color
      FROM tasks t
      LEFT JOIN projects p ON t.project_id = p.id
      LEFT JOIN categories c ON t.category_id = c.id
      WHERE t.id = ?
    `, [taskId]);

    if (!tasks || tasks.length === 0) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    const task = tasks[0];
    const [subtasks] = await query('SELECT * FROM subtasks WHERE task_id = ? ORDER BY id ASC', [taskId]);
    const [logs] = await query('SELECT * FROM task_logs WHERE task_id = ? ORDER BY timestamp DESC', [taskId]);

    res.json({
      success: true,
      data: {
        ...task,
        subtasks,
        logs
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create new task
router.post('/', async (req, res) => {
  try {
    const {
      title,
      description,
      project_id,
      category_id,
      status,
      priority,
      due_date,
      estimated_hours,
      cloud_runner,
      memory_limit,
      cpu_cores,
      subtasks
    } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, message: 'Task title is required' });
    }

    const [result] = await query(`
      INSERT INTO tasks 
      (project_id, category_id, title, description, status, priority, due_date, estimated_hours, cloud_runner, memory_limit, cpu_cores)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      project_id ? parseInt(project_id) : null,
      category_id ? parseInt(category_id) : null,
      title,
      description || '',
      status || 'todo',
      priority || 'medium',
      due_date || null,
      estimated_hours ? parseFloat(estimated_hours) : 1.0,
      cloud_runner || 'US-East Node (Cluster A)',
      memory_limit || '512MB',
      cpu_cores || '1 vCPU'
    ]);

    const taskId = result.insertId;

    // Add subtasks if provided
    if (Array.isArray(subtasks) && subtasks.length > 0) {
      for (const st of subtasks) {
        if (st.title && st.title.trim()) {
          await query('INSERT INTO subtasks (task_id, title, completed) VALUES (?, ?, 0)', [taskId, st.title.trim()]);
        }
      }
    }

    // Add initial log
    await query('INSERT INTO task_logs (task_id, log_type, message) VALUES (?, ?, ?)', [
      taskId,
      'info',
      `Task "${title}" created and scheduled.`
    ]);

    res.status(201).json({ success: true, data: { id: taskId, title } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update task details
router.put('/:id', async (req, res) => {
  try {
    const taskId = parseInt(req.params.id);
    const {
      title,
      description,
      project_id,
      category_id,
      status,
      priority,
      due_date,
      estimated_hours,
      cloud_runner,
      memory_limit,
      cpu_cores
    } = req.body;

    await query(`
      UPDATE tasks 
      SET project_id = ?, category_id = ?, title = ?, description = ?, 
          status = ?, priority = ?, due_date = ?, estimated_hours = ?,
          cloud_runner = ?, memory_limit = ?, cpu_cores = ?
      WHERE id = ?
    `, [
      project_id ? parseInt(project_id) : null,
      category_id ? parseInt(category_id) : null,
      title,
      description,
      status,
      priority,
      due_date,
      estimated_hours,
      cloud_runner,
      memory_limit,
      cpu_cores,
      taskId
    ]);

    res.json({ success: true, message: 'Task updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update task status (quick update for Kanban/Matrix)
router.patch('/:id/status', async (req, res) => {
  try {
    const taskId = parseInt(req.params.id);
    const { status } = req.body;

    await query('UPDATE tasks SET status = ? WHERE id = ?', [status, taskId]);
    await query('INSERT INTO task_logs (task_id, log_type, message) VALUES (?, ?, ?)', [
      taskId,
      'info',
      `Task status moved to: ${status.replace('_', ' ').toUpperCase()}`
    ]);

    res.json({ success: true, message: 'Task status updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete task
router.delete('/:id', async (req, res) => {
  try {
    const taskId = parseInt(req.params.id);
    await query('DELETE FROM tasks WHERE id = ?', [taskId]);
    res.json({ success: true, message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Add subtask
router.post('/:id/subtasks', async (req, res) => {
  try {
    const taskId = parseInt(req.params.id);
    const { title } = req.body;
    if (!title) return res.status(400).json({ success: false, message: 'Title is required' });

    const [result] = await query('INSERT INTO subtasks (task_id, title, completed) VALUES (?, ?, 0)', [taskId, title]);
    res.status(201).json({ success: true, data: { id: result.insertId, task_id: taskId, title, completed: 0 } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Toggle subtask completion
router.patch('/subtasks/:subtaskId', async (req, res) => {
  try {
    const subtaskId = parseInt(req.params.subtaskId);
    const { completed } = req.body;
    await query('UPDATE subtasks SET completed = ? WHERE id = ?', [completed ? 1 : 0, subtaskId]);
    res.json({ success: true, message: 'Subtask updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete subtask
router.delete('/subtasks/:subtaskId', async (req, res) => {
  try {
    const subtaskId = parseInt(req.params.subtaskId);
    await query('DELETE FROM subtasks WHERE id = ?', [subtaskId]);
    res.json({ success: true, message: 'Subtask deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
