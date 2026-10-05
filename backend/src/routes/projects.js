import express from 'express';
import { query } from '../config/db.js';

const router = express.Router();

// Get all projects with task counts
router.get('/', async (req, res) => {
  try {
    const [projects] = await query('SELECT * FROM projects ORDER BY created_at DESC');
    const [tasks] = await query('SELECT project_id, status FROM tasks');

    const projectsWithStats = projects.map(proj => {
      const projTasks = tasks.filter(t => t.project_id === proj.id);
      const completedCount = projTasks.filter(t => t.status === 'completed').length;
      return {
        ...proj,
        total_tasks: projTasks.length,
        completed_tasks: completedCount,
        progress_percentage: projTasks.length > 0 ? Math.round((completedCount / projTasks.length) * 100) : 0
      };
    });

    res.json({ success: true, data: projectsWithStats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create new project
router.post('/', async (req, res) => {
  try {
    const { name, description, color, icon } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: 'Project name is required' });
    }

    const [result] = await query(
      'INSERT INTO projects (name, description, color, icon) VALUES (?, ?, ?, ?)',
      [name, description || '', color || '#6366f1', icon || 'folder']
    );

    const [newProj] = await query('SELECT * FROM projects WHERE id = ?', [result.insertId]);

    res.status(201).json({ success: true, data: newProj[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
