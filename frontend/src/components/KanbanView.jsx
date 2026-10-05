import React from 'react';
import { 
  Play, 
  CheckSquare, 
  Cpu, 
  Clock, 
  MoreVertical,
  Plus
} from 'lucide-react';

export default function KanbanView({ tasks, onStatusChange, onRunTask, onEditTask, onDeleteTask, onOpenModal }) {
  const columns = [
    { id: 'todo', title: 'To Do', color: '#9ca3af' },
    { id: 'in_progress', title: 'In Progress', color: '#6366f1' },
    { id: 'review', title: 'Under Review', color: '#8b5cf6' },
    { id: 'executing', title: 'Cloud Executing', color: '#06b6d4' },
    { id: 'completed', title: 'Completed', color: '#10b981' },
  ];

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ffffff' }}>Kanban Task Workflow</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Organize and transition tasks across cloud execution lifecycle stages.</p>
        </div>

        <button className="btn-primary" onClick={onOpenModal}>
          <Plus size={16} /> Add Task
        </button>
      </div>

      <div className="kanban-board">
        {columns.map(col => {
          const colTasks = tasks.filter(t => t.status === col.id);
          return (
            <div key={col.id} className="kanban-column">
              <div className="column-header">
                <div className="column-title-badge">
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: col.color }} />
                  <span>{col.title}</span>
                </div>
                <span className="task-count-pill">{colTasks.length}</span>
              </div>

              <div className="column-tasks">
                {colTasks.map(task => (
                  <div key={task.id} className="task-card" onClick={() => onEditTask(task)}>
                    <div className="task-card-header">
                      <span className="project-tag" style={{ background: `${task.project_color || '#6366f1'}20`, color: task.project_color || '#6366f1' }}>
                        {task.project_name || 'General'}
                      </span>
                      <span className={`priority-badge ${task.priority}`}>
                        {task.priority}
                      </span>
                    </div>

                    <h4 className="task-title">{task.title}</h4>
                    {task.description && <p className="task-desc">{task.description}</p>}

                    {/* Subtasks progress indicator */}
                    {task.subtask_count > 0 && (
                      <div style={{ marginBottom: '0.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <CheckSquare size={12} /> {task.completed_subtasks}/{task.subtask_count} subtasks
                          </span>
                          <span>{Math.round((task.completed_subtasks / task.subtask_count) * 100)}%</span>
                        </div>
                        <div className="progress-bar-bg">
                          <div className="progress-bar-fill" style={{ width: `${(task.completed_subtasks / task.subtask_count) * 100}%` }} />
                        </div>
                      </div>
                    )}

                    {/* Execution status indicator if running */}
                    {task.execution_status === 'running' && (
                      <div style={{ marginBottom: '0.5rem', background: 'rgba(6,182,212,0.1)', padding: '6px', borderRadius: '6px', border: '1px solid rgba(6,182,212,0.3)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#06b6d4', marginBottom: '2px' }}>
                          <span>Cloud Execution</span>
                          <span>{task.progress}%</span>
                        </div>
                        <div className="progress-bar-bg">
                          <div className="progress-bar-fill" style={{ width: `${task.progress}%`, background: '#06b6d4' }} />
                        </div>
                      </div>
                    )}

                    <div className="task-card-footer">
                      <div className="cloud-runner-info">
                        <Cpu size={12} />
                        <span>{task.memory_limit}</span>
                      </div>

                      <div style={{ display: 'flex', gap: '4px' }} onClick={(e) => e.stopPropagation()}>
                        <select 
                          style={{
                            background: 'rgba(255,255,255,0.06)',
                            border: '1px solid var(--border-color)',
                            color: '#d1d5db',
                            fontSize: '0.7rem',
                            borderRadius: '4px',
                            padding: '2px 4px',
                            outline: 'none'
                          }}
                          value={task.status}
                          onChange={(e) => onStatusChange(task.id, e.target.value)}
                        >
                          {columns.map(c => (
                            <option key={c.id} value={c.id} style={{ background: '#111827' }}>{c.title}</option>
                          ))}
                        </select>

                        {task.status !== 'executing' && (
                          <button 
                            className="btn-secondary"
                            style={{ padding: '2px 6px', fontSize: '0.7rem' }}
                            title="Run Cloud Execution"
                            onClick={() => onRunTask(task.id)}
                          >
                            <Play size={10} style={{ color: 'var(--accent-emerald)' }} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
