import React, { useState, useEffect } from 'react';
import { Terminal, Play, Square, RefreshCw, Cpu, Server, HardDrive, ShieldCheck } from 'lucide-react';

export default function CloudRunnerView({ tasks, onRunTask, onStopTask }) {
  const [selectedTaskId, setSelectedTaskId] = useState(tasks.length > 0 ? tasks[0].id : null);
  const [logs, setLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  const selectedTask = tasks.find(t => t.id === selectedTaskId) || tasks[0];

  const fetchLogs = async (taskId) => {
    if (!taskId) return;
    setLoadingLogs(true);
    try {
      const res = await fetch(`/api/runner/tasks/${taskId}/logs`);
      const data = await res.json();
      if (data.success) {
        setLogs(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch task logs:', err);
    } finally {
      setLoadingLogs(false);
    }
  };

  useEffect(() => {
    if (selectedTask) {
      fetchLogs(selectedTask.id);
      const interval = setInterval(() => {
        if (selectedTask.execution_status === 'running' || selectedTask.status === 'executing') {
          fetchLogs(selectedTask.id);
        }
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [selectedTaskId, selectedTask?.execution_status]);

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ffffff' }}>Cloud Pipeline & Runner Inspector</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Live telemetry terminal console and serverless container metrics.</p>
        </div>
      </div>

      {/* Cluster Nodes Overview Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="card" style={{ padding: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Server size={20} style={{ color: 'var(--accent-cyan)' }} />
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Primary Cluster</div>
              <div style={{ fontWeight: 700, color: '#fff' }}>US-East Node (Cluster A)</div>
            </div>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--accent-emerald)', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <ShieldCheck size={12} /> Status: Online (Latency: 12ms)
          </div>
        </div>

        <div className="card" style={{ padding: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Cpu size={20} style={{ color: 'var(--accent-primary)' }} />
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Worker Pool Utilization</div>
              <div style={{ fontWeight: 700, color: '#fff' }}>4 / 16 Cores Allocated</div>
            </div>
          </div>
          <div className="progress-bar-bg" style={{ marginTop: '0.75rem' }}>
            <div className="progress-bar-fill" style={{ width: '25%' }} />
          </div>
        </div>

        <div className="card" style={{ padding: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <HardDrive size={20} style={{ color: 'var(--accent-amber)' }} />
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Container Memory Pool</div>
              <div style={{ fontWeight: 700, color: '#fff' }}>4.5 GB / 16.0 GB Used</div>
            </div>
          </div>
          <div className="progress-bar-bg" style={{ marginTop: '0.75rem' }}>
            <div className="progress-bar-fill" style={{ width: '28%', background: 'var(--accent-amber)' }} />
          </div>
        </div>
      </div>

      {/* Main Runner Console Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '1.5rem' }}>
        {/* Left List of Tasks */}
        <div className="card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '500px', overflowY: 'auto' }}>
          <h3 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
            Select Task to Inspect
          </h3>

          {tasks.map(t => (
            <div 
              key={t.id}
              onClick={() => setSelectedTaskId(t.id)}
              style={{
                padding: '0.75rem',
                borderRadius: '8px',
                background: (selectedTask && selectedTask.id === t.id) ? 'rgba(99, 102, 241, 0.18)' : 'rgba(255, 255, 255, 0.02)',
                border: (selectedTask && selectedTask.id === t.id) ? '1px solid var(--accent-primary)' : '1px solid transparent',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#fff', marginBottom: '4px' }}>
                {t.title}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                <span>{t.cloud_runner.split(' ')[0]}</span>
                <span style={{ color: t.execution_status === 'running' ? 'var(--accent-cyan)' : 'inherit' }}>
                  {t.execution_status.toUpperCase()}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Right Terminal Console */}
        <div>
          {selectedTask ? (
            <div>
              {/* Controls bar above terminal */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>{selectedTask.title}</h3>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', gap: '1rem', marginTop: '2px' }}>
                    <span>Runner: <strong style={{ color: 'var(--accent-cyan)' }}>{selectedTask.cloud_runner}</strong></span>
                    <span>Allocated Memory: <strong style={{ color: '#fff' }}>{selectedTask.memory_limit}</strong></span>
                    <span>CPU: <strong style={{ color: '#fff' }}>{selectedTask.cpu_cores}</strong></span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {selectedTask.execution_status === 'running' ? (
                    <button className="btn-secondary" style={{ color: '#f43f5e', borderColor: 'rgba(244,63,94,0.4)' }} onClick={() => onStopTask(selectedTask.id)}>
                      <Square size={14} /> Cancel Execution
                    </button>
                  ) : (
                    <button className="btn-primary" onClick={() => onRunTask(selectedTask.id)}>
                      <Play size={14} /> Run Cloud Pipeline
                    </button>
                  )}

                  <button className="btn-secondary" onClick={() => fetchLogs(selectedTask.id)}>
                    <RefreshCw size={14} className={loadingLogs ? 'spin' : ''} /> Sync Logs
                  </button>
                </div>
              </div>

              {/* Terminal Box */}
              <div className="terminal-window">
                <div className="terminal-header">
                  <div className="terminal-dots">
                    <span className="dot red" />
                    <span className="dot yellow" />
                    <span className="dot green" />
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    bash - cloudtask-agent --task-id={selectedTask.id}
                  </span>
                  <div />
                </div>

                <div className="terminal-body">
                  {logs.length === 0 ? (
                    <div style={{ color: 'var(--text-dim)', fontStyle: 'italic' }}>
                      No execution logs recorded yet for this task. Click "Run Cloud Pipeline" above to trigger container execution.
                    </div>
                  ) : (
                    logs.map(log => (
                      <div key={log.id} className="log-row">
                        <span className="log-time">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                        <span className={`log-type ${log.log_type}`}>[{log.log_type.toUpperCase()}]</span>
                        <span className="log-msg">{log.message}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div style={{ color: 'var(--text-muted)' }}>Select a task to inspect execution details.</div>
          )}
        </div>
      </div>
    </div>
  );
}
