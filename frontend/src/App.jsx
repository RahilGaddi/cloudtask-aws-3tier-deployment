import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import DashboardView from './components/DashboardView';
import KanbanView from './components/KanbanView';
import TaskMatrixView from './components/TaskMatrixView';
import CloudRunnerView from './components/CloudRunnerView';
import ProjectsView from './components/ProjectsView';
import TaskModal from './components/TaskModal';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState(null);
  const [search, setSearch] = useState('');
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [toasts, setToasts] = useState([]);

  // Toast Helper
  const addToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  // Fetch All Data from Backend API
  const loadData = async () => {
    try {
      const [tasksRes, projectsRes, categoriesRes, statsRes] = await Promise.all([
        fetch('/api/tasks'),
        fetch('/api/projects'),
        fetch('/api/categories'),
        fetch('/api/stats')
      ]);

      const tasksData = await tasksRes.json();
      const projectsData = await projectsRes.json();
      const categoriesData = await categoriesRes.json();
      const statsData = await statsRes.json();

      if (tasksData.success) setTasks(tasksData.data);
      if (projectsData.success) setProjects(projectsData.data);
      if (categoriesData.success) setCategories(categoriesData.data);
      if (statsData.success) setStats(statsData.data);
    } catch (err) {
      console.error('API Sync Error:', err);
    }
  };

  useEffect(() => {
    loadData();

    // Auto refresh active execution states
    const timer = setInterval(() => {
      loadData();
    }, 3000);

    return () => clearInterval(timer);
  }, []);

  // Save Task (Create or Edit)
  const handleSaveTask = async (formData) => {
    try {
      let url = '/api/tasks';
      let method = 'POST';

      if (editingTask) {
        url = `/api/tasks/${editingTask.id}`;
        method = 'PUT';
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (data.success) {
        addToast(editingTask ? 'Task updated successfully' : 'New task scheduled', 'success');
        loadData();
        setEditingTask(null);
      } else {
        addToast(data.message || 'Failed to save task', 'error');
      }
    } catch (err) {
      addToast('Network error saving task', 'error');
    }
  };

  // Quick Status Transition
  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        addToast(`Task moved to ${newStatus.replace('_', ' ').toUpperCase()}`, 'info');
        loadData();
      }
    } catch (err) {
      addToast('Failed to update status', 'error');
    }
  };

  // Trigger Cloud Execution Simulation
  const handleRunTask = async (taskId) => {
    try {
      const res = await fetch(`/api/runner/tasks/${taskId}/run`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        addToast('Cloud Task container launched on node!', 'info');
        loadData();
      }
    } catch (err) {
      addToast('Failed to start cloud execution', 'error');
    }
  };

  // Stop Cloud Execution
  const handleStopTask = async (taskId) => {
    try {
      const res = await fetch(`/api/runner/tasks/${taskId}/stop`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        addToast('Cloud Task execution aborted', 'warning');
        loadData();
      }
    } catch (err) {
      addToast('Failed to stop cloud execution', 'error');
    }
  };

  // Delete Task
  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      const res = await fetch(`/api/tasks/${taskId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        addToast('Task deleted', 'info');
        loadData();
      }
    } catch (err) {
      addToast('Failed to delete task', 'error');
    }
  };

  // Create Project
  const handleCreateProject = async (projData) => {
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projData)
      });
      const data = await res.json();
      if (data.success) {
        addToast(`Project "${projData.name}" created`, 'success');
        loadData();
      }
    } catch (err) {
      addToast('Failed to create project', 'error');
    }
  };

  // Filter tasks by navbar search box
  const searchFilteredTasks = tasks.filter(t => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return t.title.toLowerCase().includes(q) || (t.description && t.description.toLowerCase().includes(q));
  });

  const executingCount = tasks.filter(t => t.execution_status === 'running' || t.status === 'executing').length;

  return (
    <div className="app-container">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="main-content">
        <Navbar 
          search={search}
          setSearch={setSearch}
          onOpenModal={() => { setEditingTask(null); setIsTaskModalOpen(true); }}
          onRefresh={loadData}
          executingCount={executingCount}
        />

        <div className="view-wrapper">
          {activeTab === 'dashboard' && (
            <DashboardView 
              tasks={searchFilteredTasks}
              stats={stats}
              onRunTask={handleRunTask}
              onSelectTask={(t) => { setEditingTask(t); setIsTaskModalOpen(true); }}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === 'kanban' && (
            <KanbanView 
              tasks={searchFilteredTasks}
              onStatusChange={handleStatusChange}
              onRunTask={handleRunTask}
              onEditTask={(t) => { setEditingTask(t); setIsTaskModalOpen(true); }}
              onDeleteTask={handleDeleteTask}
              onOpenModal={() => { setEditingTask(null); setIsTaskModalOpen(true); }}
            />
          )}

          {activeTab === 'matrix' && (
            <TaskMatrixView 
              tasks={searchFilteredTasks}
              projects={projects}
              categories={categories}
              onRunTask={handleRunTask}
              onEditTask={(t) => { setEditingTask(t); setIsTaskModalOpen(true); }}
              onDeleteTask={handleDeleteTask}
              onStatusChange={handleStatusChange}
            />
          )}

          {activeTab === 'runner' && (
            <CloudRunnerView 
              tasks={searchFilteredTasks}
              onRunTask={handleRunTask}
              onStopTask={handleStopTask}
            />
          )}

          {activeTab === 'projects' && (
            <ProjectsView 
              projects={projects}
              categories={categories}
              onCreateProject={handleCreateProject}
            />
          )}
        </div>
      </main>

      {/* Task Creation & Edit Modal */}
      <TaskModal 
        isOpen={isTaskModalOpen}
        onClose={() => { setIsTaskModalOpen(false); setEditingTask(null); }}
        onSave={handleSaveTask}
        projects={projects}
        categories={categories}
        initialTask={editingTask}
      />

      {/* Floating Toast Notification Container */}
      <div className="toast-container">
        {toasts.map(toast => (
          <div key={toast.id} className="toast">
            <span>●</span>
            <span>{toast.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
