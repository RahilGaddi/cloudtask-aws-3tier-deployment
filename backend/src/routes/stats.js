import express from 'express';
import { query } from '../config/db.js';

const router = express.Router();

// Get dashboard high-level metrics & status distribution
router.get('/', async (req, res) => {
  try {
    const [tasks] = await query('SELECT * FROM tasks');
    const [projects] = await query('SELECT * FROM projects');
    const [logs] = await query('SELECT * FROM task_logs');

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const executingTasks = tasks.filter(t => t.status === 'executing' || t.execution_status === 'running').length;
    const pendingTasks = tasks.filter(t => t.status === 'todo' || t.status === 'in_progress').length;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Calculate priority distribution
    const priorityCounts = {
      urgent: tasks.filter(t => t.priority === 'urgent').length,
      high: tasks.filter(t => t.priority === 'high').length,
      medium: tasks.filter(t => t.priority === 'medium').length,
      low: tasks.filter(t => t.priority === 'low').length
    };

    // Calculate status distribution
    const statusCounts = {
      todo: tasks.filter(t => t.status === 'todo').length,
      in_progress: tasks.filter(t => t.status === 'in_progress').length,
      review: tasks.filter(t => t.status === 'review').length,
      executing: tasks.filter(t => t.status === 'executing').length,
      completed: tasks.filter(t => t.status === 'completed').length
    };

    // Total estimated hours vs actual hours
    const totalEstHours = tasks.reduce((sum, t) => sum + (parseFloat(t.estimated_hours) || 0), 0);
    const totalActHours = tasks.reduce((sum, t) => sum + (parseFloat(t.actual_hours) || 0), 0);

    // Recent activity logs (last 5)
    const recentLogs = logs.sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 5);

    res.json({
      success: true,
      data: {
        summary: {
          total_tasks: totalTasks,
          completed_tasks: completedTasks,
          executing_tasks: executingTasks,
          pending_tasks: pendingTasks,
          total_projects: projects.length,
          completion_rate: completionRate,
          total_est_hours: Math.round(totalEstHours * 10) / 10,
          total_act_hours: Math.round(totalActHours * 10) / 10
        },
        priority_counts: priorityCounts,
        status_counts: statusCounts,
        recent_logs: recentLogs
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
