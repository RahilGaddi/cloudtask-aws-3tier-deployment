import React from 'react';
import { 
  Cloud, 
  LayoutDashboard, 
  Kanban, 
  TableProperties, 
  Terminal, 
  FolderKanban 
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'kanban', label: 'Kanban Board', icon: Kanban },
    { id: 'matrix', label: 'Task Matrix', icon: TableProperties },
    { id: 'runner', label: 'Cloud Pipelines', icon: Terminal },
    { id: 'projects', label: 'Projects', icon: FolderKanban },
  ];

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-icon">
          <Cloud size={22} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span className="brand-name">CloudTask</span>
          <span className="brand-badge">Enterprise v2.4</span>
        </div>
      </div>

      <nav className="nav-section">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <div
              key={item.id}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </div>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="user-pill">
          <div className="user-avatar">AD</div>
          <div className="user-info">
            <span className="user-name">Alex Dev</span>
            <span className="user-role">
              <span className="live-dot"></span> MySQL Connected
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
