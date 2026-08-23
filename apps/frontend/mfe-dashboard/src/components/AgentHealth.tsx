import React from 'react';

interface AgentHealthProps {
  agents: Array<{ name: string; active: boolean }>;
}

const AgentHealth: React.FC<AgentHealthProps> = ({ agents }) => {
  return (
    <div
      style={{
        border: '1px solid #ccc',
        padding: '20px',
        borderRadius: '8px',
        backgroundColor: '#fff',
      }}
    >
      <h3>Agents</h3>
      {agents.map((agent, idx) => (
        <p key={idx}>
          {agent.name}:{' '}
          <span
            style={{
              color: agent.active ? '#28a745' : '#dc3545',
              fontWeight: 'bold',
            }}
          >
            {agent.active ? 'Active' : 'Inactive'}
          </span>
        </p>
      ))}
    </div>
  );
};

export default AgentHealth;
