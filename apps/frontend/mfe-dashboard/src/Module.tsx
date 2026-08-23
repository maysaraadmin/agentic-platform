import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import StatusCard from './components/StatusCard';
import AgentHealth from './components/AgentHealth';
import DocumentStats from './components/DocumentStats';

const API_BASE = 'http://localhost:8000/api/v1';

const DashboardModule: React.FC = () => {
  const { data: health, isLoading } = useQuery({
    queryKey: ['health'],
    queryFn: async () => {
      const response = await axios.get(`${API_BASE}/health`);
      return response.data;
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
          status={health?.status || 'Unknown'}
          isLoading={isLoading}
        />
        <AgentHealth
          agents={[
            { name: 'LangGraph', active: true },
            { name: 'A2A Orchestrator', active: true },
          ]}
        />
        <DocumentStats totalIndexed={1234} lastUpdate="2026-08-18" />
      </div>
    </div>
  );
};

export default DashboardModule;
