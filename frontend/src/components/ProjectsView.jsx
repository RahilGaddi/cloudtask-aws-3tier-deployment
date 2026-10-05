import React, { useState } from 'react';
import { FolderKanban, Plus, CheckCircle2, Clock } from 'lucide-react';

export default function ProjectsView({ projects, categories, onCreateProject }) {
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#6366f1');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    onCreateProject({ name: name.trim(), description, color });
    setName('');
    setDescription('');
    setShowModal(false);
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ffffff' }}>Project Management</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Group workloads into active enterprise projects and track execution metrics.</p>
        </div>

        <button className="btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={16} /> New Project
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
        {projects.map(proj => (
          <div key={proj.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    backgroundColor: `${proj.color || '#6366f1'}25`,
                    border: `1px solid ${proj.color || '#6366f1'}50`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: proj.color || '#6366f1'
                  }}>
                    <FolderKanban size={20} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff' }}>{proj.name}</h3>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Status: Active</span>
                  </div>
                </div>
              </div>

              {proj.description && (
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1.25rem', lineHeight: '1.4' }}>
                  {proj.description}
                </p>
              )}
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                <span>Tasks Completed: {proj.completed_tasks || 0}/{proj.total_tasks || 0}</span>
                <span style={{ fontWeight: 700, color: '#fff' }}>{proj.progress_percentage || 0}%</span>
              </div>
              <div className="progress-bar-bg">
                <div className="progress-bar-fill" style={{ width: `${proj.progress_percentage || 0}%`, background: proj.color || '#6366f1' }} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ maxWidth: '450px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff', marginBottom: '1rem' }}>Create New Project</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Project Name</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. Core API Infrastructure"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea 
                  className="form-textarea"
                  rows={3}
                  placeholder="Scope and deliverables..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Theme Color</label>
                <input 
                  type="color" 
                  style={{ width: '100%', height: '40px', background: 'none', border: 'none', cursor: 'pointer' }}
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Create Project</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
