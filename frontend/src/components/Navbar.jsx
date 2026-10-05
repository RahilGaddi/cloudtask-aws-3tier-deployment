import React from 'react';
import { Search, Plus, RefreshCw, Cpu } from 'lucide-react';

export default function Navbar({ search, setSearch, onOpenModal, onRefresh, executingCount }) {
  return (
    <header className="top-header">
      <div className="search-box">
        <Search className="search-icon" size={16} />
        <input 
          type="text" 
          placeholder="Search tasks, pipelines, descriptions..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="header-actions">
        {executingCount > 0 && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(6, 182, 212, 0.15)',
            border: '1px solid rgba(6, 182, 212, 0.4)',
            padding: '6px 12px',
            borderRadius: '20px',
            fontSize: '0.8rem',
            color: '#06b6d4',
            fontFamily: 'var(--font-mono)'
          }}>
            <Cpu size={14} className="spin" />
            <span>{executingCount} Active Cloud Job{executingCount > 1 ? 's' : ''}</span>
          </div>
        )}

        <button className="btn-secondary" onClick={onRefresh} title="Refresh Data">
          <RefreshCw size={16} />
          <span>Sync</span>
        </button>

        <button className="btn-primary" onClick={onOpenModal}>
          <Plus size={18} />
          <span>New Task</span>
        </button>
      </div>
    </header>
  );
}
