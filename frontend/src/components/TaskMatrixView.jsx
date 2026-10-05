import React, { useState } from 'react';
import { 
  Play, 
  Edit3, 
  Trash2, 
  Filter, 
  Cpu, 
  CheckCircle2, 
  Clock, 
  Calendar 
} from 'lucide-react';

export default function TaskMatrixView({ 
  tasks, 
  projects, 
  categories, 
  onRunTask, 
  onEditTask, 
  onDeleteTask, 
  onStatusChange 
}) {
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterProject, setFilterProject] = useState('all');

  const filteredTasks = tasks.filter(t => {
    if (filterStatus !== 'all' && t.status !== filterStatus) return false;
    if (filterPriority !== 'all' && t.priority !== filterPriority) return false;
    if (filterProject !== 'all' && t.project_id !== parseInt(filterProject)) return false;
    return true;
  });

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ffffff' }}>Task Matrix & Table Directory</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Full record list with execution details, filters, and batch actions.</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        padding: '1rem',
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: '12px',
        marginBottom: '1.5rem',
        flexWrap: 'wrap'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          <Filter size={16} /> Filters:
        </div>

        <select 
          className="form-select" 
          style={{ width: 'auto', padding: '0.4rem 0.75rem', fontSize: '0.82rem' }}
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="all">All Statuses</option>
          <option value="todo">To Do</option>
          <option value="in_progress">In Progress</option>
          <option value="review">Review</option>
          <option value="executing">Executing</option>
          <option value="completed">Completed</option>
        </select>

        <select 
          className="form-select" 
          style={{ width: 'auto', padding: '0.4rem 0.75rem', fontSize: '0.82rem' }}
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value)}
        >
          <option value="all">All Priorities</option>
          <option value="urgent">Urgent</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>

        <select 
          className="form-select" 
          style={{ width: 'auto', padding: '0.4rem 0.75rem', fontSize: '0.82rem' }}
          value={filterProject}
          onChange={(e) => setFilterProject(e.target.value)}
        >
          <option value="all">All Projects</option>
          {projects.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>

        <div style={{ marginLeft: 'auto', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
          Showing <strong>{filteredTasks.length}</strong> of {tasks.length} tasks
        </div>
      </div>

      {/* Custom Data Table */}
      <div className="table-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Task Title & Project</th>
              <th>Status</th>
              <th>Priority</th>
              <th>Cloud Spec</th>
              <th>Progress / Subtasks</th>
              <th>Est. Hours</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTasks.map(task => (
              <tr key={task.id}>
                <td>
                  <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.92rem' }}>{task.title}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', gap: '0.5rem', marginTop: '2px' }}>
                    <span style={{ color: task.project_color || '#6366f1' }}>● {task.project_name || 'General'}</span>
                    {task.category_name && <span>• {task.category_name}</span>}
                  </div>
                </td>

                <td>
                  <select 
                    style={{
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid var(--border-color)',
                      color: '#fff',
                      padding: '4px 8px',
                      borderRadius: '6px',
                      fontSize: '0.78rem'
                    }}
                    value={task.status}
                    onChange={(e) => onStatusChange(task.id, e.target.value)}
                  >
                    <option value="todo" style={{ background: '#111827' }}>To Do</option>
                    <option value="in_progress" style={{ background: '#111827' }}>In Progress</option>
                    <option value="review" style={{ background: '#111827' }}>Under Review</option>
                    <option value="executing" style={{ background: '#111827' }}>Executing</option>
                    <option value="completed" style={{ background: '#111827' }}>Completed</option>
                  </select>
                </td>

                <td>
                  <span className={`priority-badge ${task.priority}`}>{task.priority}</span>
                </td>

                <td>
                  <div style={{ fontSize: '0.78rem', fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)' }}>
                    {task.cloud_runner}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                    {task.cpu_cores} | {task.memory_limit}
                  </div>
                </td>

                <td style={{ minWidth: '140px' }}>
                  {task.subtask_count > 0 ? (
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '3px' }}>
                        {task.completed_subtasks}/{task.subtask_count} Done
                      </div>
                      <div className="progress-bar-bg">
                        <div className="progress-bar-fill" style={{ width: `${(task.completed_subtasks / task.subtask_count) * 100}%` }} />
                      </div>
                    </div>
                  ) : (
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>No subtasks</span>
                  )}
                </td>

                <td style={{ fontSize: '0.85rem' }}>
                  {task.estimated_hours} hrs
                </td>

                <td>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button 
                      className="btn-secondary" 
                      style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                      title="Run Cloud Simulation"
                      onClick={() => onRunTask(task.id)}
                    >
                      <Play size={12} style={{ color: 'var(--accent-emerald)' }} />
                    </button>

                    <button 
                      className="btn-secondary" 
                      style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                      title="Edit Task"
                      onClick={() => onEditTask(task)}
                    >
                      <Edit3 size={12} />
                    </button>

                    <button 
                      className="btn-secondary" 
                      style={{ padding: '4px 8px', fontSize: '0.75rem', color: '#f43f5e' }}
                      title="Delete Task"
                      onClick={() => onDeleteTask(task.id)}
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
