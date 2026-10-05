import React from 'react';
import { 
  CheckCircle2, 
  Clock, 
  Cpu, 
  ListTodo, 
  Play, 
  TrendingUp, 
  Activity,
  AlertCircle
} from 'lucide-react';

export default function DashboardView({ tasks, stats, onRunTask, onSelectTask, setActiveTab }) {
  if (!stats) return <div style={{ color: '#9ca3af', padding: '2rem' }}>Loading dashboard analytics...</div>;

  const { summary, priority_counts, status_counts, recent_logs } = stats;

  return (
    <div>
      {/* Title Header */}
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.5px' }}>
          Operations & Executive Dashboard
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
          Real-time metrics, cloud task execution status, and priority workloads.
        </p>
      </div>

      {/* Summary Stat Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-info">
            <h4>Total Tasks</h4>
            <div className="stat-value">{summary.total_tasks}</div>
          </div>
          <div className="stat-icon indigo">
            <ListTodo size={24} />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <h4>Completed Tasks</h4>
            <div className="stat-value">{summary.completed_tasks}</div>
          </div>
          <div className="stat-icon emerald">
            <CheckCircle2 size={24} />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <h4>Active Cloud Jobs</h4>
            <div className="stat-value">{summary.executing_tasks}</div>
          </div>
          <div className="stat-icon cyan">
            <Cpu size={24} />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <h4>Completion Rate</h4>
            <div className="stat-value">{summary.completion_rate}%</div>
          </div>
          <div className="stat-icon amber">
            <TrendingUp size={24} />
          </div>
        </div>
      </div>

      {/* Grid Content */}
      <div className="dashboard-grid">
        {/* Left Side: Active Pipeline & Status Breakdown */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Active Cloud Tasks Section */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">
                <Cpu size={18} style={{ color: 'var(--accent-cyan)' }} />
                Cloud Execution Workloads
              </span>
              <button 
                className="btn-secondary" 
                style={{ fontSize: '0.78rem', padding: '4px 10px' }}
                onClick={() => setActiveTab('runner')}
              >
                View Pipeline Inspector
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {tasks.filter(t => t.status === 'executing' || t.execution_status === 'running' || t.priority === 'urgent').slice(0, 4).map(task => (
                <div 
                  key={task.id} 
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.85rem 1rem',
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '10px'
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.9rem', color: '#fff' }}>{task.title}</span>
                      <span className={`priority-badge ${task.priority}`}>{task.priority}</span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', gap: '1rem' }}>
                      <span>Cluster: <strong style={{ color: 'var(--accent-cyan)' }}>{task.cloud_runner}</strong></span>
                      <span>Alloc: {task.cpu_cores} | {task.memory_limit}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    {task.execution_status === 'running' ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-cyan)', fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }}>
                        <Activity size={16} className="spin" />
                        <span>Executing {task.progress}%</span>
                      </div>
                    ) : (
                      <button 
                        className="btn-secondary"
                        style={{ fontSize: '0.78rem', padding: '4px 10px' }}
                        onClick={() => onRunTask(task.id)}
                      >
                        <Play size={12} style={{ color: 'var(--accent-emerald)' }} /> Run Cloud
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Status Breakdown Bar */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Task Pipeline Velocity</span>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                <span>To Do ({status_counts.todo})</span>
                <span>In Progress ({status_counts.in_progress})</span>
                <span>Review ({status_counts.review})</span>
                <span>Executing ({status_counts.executing})</span>
                <span>Completed ({status_counts.completed})</span>
              </div>

              <div style={{ height: '10px', width: '100%', borderRadius: '6px', overflow: 'hidden', display: 'flex', background: 'rgba(255,255,255,0.05)' }}>
                <div style={{ width: `${(status_counts.todo / summary.total_tasks) * 100}%`, background: '#9ca3af' }} />
                <div style={{ width: `${(status_counts.in_progress / summary.total_tasks) * 100}%`, background: '#6366f1' }} />
                <div style={{ width: `${(status_counts.review / summary.total_tasks) * 100}%`, background: '#8b5cf6' }} />
                <div style={{ width: `${(status_counts.executing / summary.total_tasks) * 100}%`, background: '#06b6d4' }} />
                <div style={{ width: `${(status_counts.completed / summary.total_tasks) * 100}%`, background: '#10b981' }} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              <span>Est. Hours: <strong style={{ color: '#fff' }}>{summary.total_est_hours}h</strong></span>
              <span>Logged Hours: <strong style={{ color: '#fff' }}>{summary.total_act_hours}h</strong></span>
            </div>
          </div>
        </div>

        {/* Right Side: Priority Breakdown & Recent Audit Logs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Priority Breakdown */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Priority Matrix</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div style={{ background: 'rgba(244, 63, 94, 0.1)', border: '1px solid rgba(244,63,94,0.2)', padding: '0.75rem', borderRadius: '10px' }}>
                <span style={{ fontSize: '0.75rem', color: '#f43f5e', fontWeight: 700 }}>URGENT</span>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff' }}>{priority_counts.urgent}</div>
              </div>

              <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245,158,11,0.2)', padding: '0.75rem', borderRadius: '10px' }}>
                <span style={{ fontSize: '0.75rem', color: '#f59e0b', fontWeight: 700 }}>HIGH</span>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff' }}>{priority_counts.high}</div>
              </div>

              <div style={{ background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99,102,241,0.2)', padding: '0.75rem', borderRadius: '10px' }}>
                <span style={{ fontSize: '0.75rem', color: '#6366f1', fontWeight: 700 }}>MEDIUM</span>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff' }}>{priority_counts.medium}</div>
              </div>

              <div style={{ background: 'rgba(156, 163, 175, 0.1)', border: '1px solid rgba(156,163,175,0.2)', padding: '0.75rem', borderRadius: '10px' }}>
                <span style={{ fontSize: '0.75rem', color: '#9ca3af', fontWeight: 700 }}>LOW</span>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff' }}>{priority_counts.low}</div>
              </div>
            </div>
          </div>

          {/* Recent Activity Audit Logs */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">System Activity Log</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {recent_logs.map(log => (
                <div key={log.id} style={{ display: 'flex', gap: '0.5rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  <div className={`log-type ${log.log_type}`} style={{ fontWeight: 700, textTransform: 'uppercase', minWidth: '55px' }}>
                    [{log.log_type}]
                  </div>
                  <div style={{ flex: 1, color: '#e5e7eb', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {log.message}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
