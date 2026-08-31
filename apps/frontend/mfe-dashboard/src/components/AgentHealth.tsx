import React from 'react';

interface AgentHealthProps {
  agents: Array<{ name: string; active: boolean }>;
  isLoading?: boolean;
}

const AgentHealth: React.FC<AgentHealthProps> = ({ agents, isLoading }) => {
  if (isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 0' }}>
        <div className="spinner" />
        <span style={{ color: 'var(--color-text-secondary)', fontSize: '14px' }}>Checking agents...</span>
      </div>
    );
  }

  if (agents.length === 0) {
    return (
      <div style={{ padding: '20px 0', textAlign: 'center' }}>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>No agents configured</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {agents.map((agent, idx) => (
        <div
          key={idx}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 14px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: agent.active ? '#f0fdf4' : '#fef2f2',
            transition: 'transform var(--transition)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: agent.active ? 'var(--color-success)' : 'var(--color-danger)',
              boxShadow: agent.active ? '0 0 8px var(--color-success)' : '0 0 8px var(--color-danger)',
            }} />
            <span style={{ fontSize: '14px', fontWeight: '500' }}>{agent.name}</span>
          </div>
          <span className={`badge ${agent.active ? 'badge-success' : 'badge-danger'}`}>
            {agent.active ? 'Active' : 'Inactive'}
          </span>
        </div>
      ))}
    </div>
  );
};

export default AgentHealth;
