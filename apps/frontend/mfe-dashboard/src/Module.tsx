import React from 'react';
import { useQuery } from '@tanstack/react-query';
import StatusCard from './components/StatusCard';
import AgentHealth from './components/AgentHealth';
import DocumentStats from './components/DocumentStats';

const API_URL = process.env.NX_API_URL || 'http://localhost:8000';

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem('auth_token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

const DashboardModule: React.FC = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const response = await fetch(`${API_URL}/health/dashboard`, { headers: getAuthHeaders() });
      if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
      return response.json();
    },
  });

  return (
    <div style={{ padding: '20px' }}>
      <h1>Admin Dashboard</h1>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '20px',
        }}
      >
        <StatusCard
          title="System Status"
          status={stats?.system_status || 'Unknown'}
          isLoading={isLoading}
        />
        <AgentHealth
          agents={stats?.agents || []}
          isLoading={isLoading}
        />
        <DocumentStats
          totalIndexed={stats?.documents_total || 0}
          lastUpdate={stats?.documents_last_update || 'Never'}
        />
      </div>
    </div>
  );
};

export default DashboardModule;
