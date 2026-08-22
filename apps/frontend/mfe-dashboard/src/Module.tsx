import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

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
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
        <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '8px' }}>
          <h3>System Status</h3>
          <p>API: {isLoading ? 'Loading...' : health?.status || 'Unknown'}</p>
        </div>
        <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '8px' }}>
          <h3>Agents</h3>
          <p>LangGraph: Active</p>
          <p>A2A Orchestrator: Active</p>
        </div>
        <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '8px' }}>
          <h3>Documents</h3>
          <p>Total indexed: 1,234</p>
          <p>Last update: 2026-08-18</p>
        </div>
      </div>
    </div>
  );
};

export default DashboardModule;
