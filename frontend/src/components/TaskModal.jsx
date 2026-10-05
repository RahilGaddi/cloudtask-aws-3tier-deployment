import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';

export default function TaskModal({ isOpen, onClose, onSave, projects, categories, initialTask }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    project_id: '',
    category_id: '',
    status: 'todo',
    priority: 'medium',
    due_date: '',
    estimated_hours: 2.0,
    cloud_runner: 'US-East Node (Cluster A)',
    memory_limit: '512MB',
    cpu_cores: '1 vCPU',
    subtasks: []
  });

  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  useEffect(() => {
    if (initialTask) {
      setFormData({
        title: initialTask.title || '',
        description: initialTask.description || '',
        project_id: initialTask.project_id || '',
        category_id: initialTask.category_id || '',
        status: initialTask.status || 'todo',
        priority: initialTask.priority || 'medium',
        due_date: initialTask.due_date ? initialTask.due_date.substring(0, 10) : '',
        estimated_hours: initialTask.estimated_hours || 2.0,
        cloud_runner: initialTask.cloud_runner || 'US-East Node (Cluster A)',
        memory_limit: initialTask.memory_limit || '512MB',
        cpu_cores: initialTask.cpu_cores || '1 vCPU',
        subtasks: initialTask.subtasks || []
      });
    } else {
      setFormData({
        title: '',
        description: '',
        project_id: projects.length > 0 ? projects[0].id : '',
        category_id: categories.length > 0 ? categories[0].id : '',
        status: 'todo',
        priority: 'medium',
        due_date: new Date(Date.now() + 86400000 * 3).toISOString().substring(0, 10),
        estimated_hours: 2.0,
        cloud_runner: 'US-East Node (Cluster A)',
        memory_limit: '512MB',
        cpu_cores: '1 vCPU',
        subtasks: []
      });
    }
  }, [initialTask, isOpen, projects, categories]);

  if (!isOpen) return null;

  const handleAddSubtask = () => {
    if (!newSubtaskTitle.trim()) return;
    setFormData({
      ...formData,
      subtasks: [...formData.subtasks, { title: newSubtaskTitle.trim(), completed: 0 }]
    });
    setNewSubtaskTitle('');
  };

  const handleRemoveSubtask = (index) => {
    setFormData({
      ...formData,
      subtasks: formData.subtasks.filter((_, i) => i !== index)
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;
    onSave(formData);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <div className="modal-header">
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff' }}>
            {initialTask ? 'Edit Cloud Task' : 'Create New Cloud Task'}
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Task Title</label>
            <input 
              type="text" 
              className="form-input"
              placeholder="e.g. Deploy Kubernetes Ingress Controller"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea 
              className="form-textarea"
              rows={3}
              placeholder="Detailed description of task objectives and scope..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Project</label>
              <select 
                className="form-select"
                value={formData.project_id}
                onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}
              >
                <option value="">-- Select Project --</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Category</label>
              <select 
                className="form-select"
                value={formData.category_id}
                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
              >
                <option value="">-- Select Category --</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Priority</label>
              <select 
                className="form-select"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <div className="form-group">
              <label>Status</label>
              <select 
                className="form-select"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="review">Under Review</option>
                <option value="executing">Cloud Executing</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Due Date</label>
              <input 
                type="date"
                className="form-input"
                value={formData.due_date}
                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Estimated Hours</label>
              <input 
                type="number"
                step="0.5"
                className="form-input"
                value={formData.estimated_hours}
                onChange={(e) => setFormData({ ...formData, estimated_hours: e.target.value })}
              />
            </div>
          </div>

          {/* Cloud Specs */}
          <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '10px', border: '1px solid var(--border-color)', marginBottom: '1.25rem' }}>
            <h4 style={{ fontSize: '0.8rem', color: 'var(--accent-cyan)', marginBottom: '0.75rem', textTransform: 'uppercase' }}>
              Cloud Execution Profile
            </h4>
            <div className="form-row">
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Runner Cluster</label>
                <select 
                  className="form-select"
                  value={formData.cloud_runner}
                  onChange={(e) => setFormData({ ...formData, cloud_runner: e.target.value })}
                >
                  <option value="US-East Node (Cluster A)">US-East Node (Cluster A)</option>
                  <option value="US-West Node (Lambda-02)">US-West Node (Lambda-02)</option>
                  <option value="EU-Central Node (Spark-01)">EU-Central Node (Spark-01)</option>
                  <option value="CI/CD Runner (GitHub Cloud)">CI/CD Runner (GitHub Cloud)</option>
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>RAM Allocation</label>
                <select 
                  className="form-select"
                  value={formData.memory_limit}
                  onChange={(e) => setFormData({ ...formData, memory_limit: e.target.value })}
                >
                  <option value="512MB">512MB RAM</option>
                  <option value="1024MB">1024MB (1GB) RAM</option>
                  <option value="2048MB">2048MB (2GB) RAM</option>
                  <option value="4096MB">4096MB (4GB) RAM</option>
                </select>
              </div>
            </div>
          </div>

          {/* Subtasks Builder */}
          <div className="form-group">
            <label>Subtasks Checklist</label>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <input 
                type="text"
                className="form-input"
                placeholder="Add subtask item..."
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddSubtask(); } }}
              />
              <button type="button" className="btn-secondary" onClick={handleAddSubtask}>
                <Plus size={16} /> Add
              </button>
            </div>

            {formData.subtasks.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginTop: '0.5rem' }}>
                {formData.subtasks.map((st, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 10px', background: 'rgba(255,255,255,0.03)', borderRadius: '6px', fontSize: '0.85rem' }}>
                    <span>{st.title}</span>
                    <button type="button" onClick={() => handleRemoveSubtask(i)} style={{ background: 'none', border: 'none', color: '#f43f5e', cursor: 'pointer' }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              {initialTask ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
