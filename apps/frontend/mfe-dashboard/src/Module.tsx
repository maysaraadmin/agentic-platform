import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { API_URL, getAuthHeaders } from 'shared/auth';
import StatusCard from './components/StatusCard';
import AgentHealth from './components/AgentHealth';
import DocumentStats from './components/DocumentStats';

const DashboardModule: React.FC = () => {
  const { data: stats, isLoading, dataUpdatedAt } = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const response = await fetch(`${API_URL}/health/dashboard`, { headers: getAuthHeaders() });
      if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
      return response.json();
    },
    refetchInterval: 30000,
  });

  const metricCards = [
    {
      title: 'System Status',
      value: stats?.system_status || 'Unknown',
      icon: '✓',
      color: 'var(--color-success)',
      bgColor: '#dcfce7',
    },
    {
      title: 'Active Agents',
      value: stats?.agents?.filter((a: { active: boolean }) => a.active).length || 0,
      total: stats?.agents?.length || 0,
      icon: '⚡',
      color: 'var(--color-primary)',
      bgColor: 'var(--color-primary-light)',
    },
    {
      title: 'Documents',
      value: stats?.documents_total || 0,
      icon: '📄',
      color: 'var(--color-secondary)',
      bgColor: '#e0f2fe',
    },
    {
      title: 'Last Updated',
      value: stats?.documents_last_update
        ? new Date(stats.documents_last_update).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
        : 'Never',
      icon: '🕐',
      color: 'var(--color-warning)',
      bgColor: '#fef3c7',
    },
  ];

  return (
    <div className="animate-fade-in">
      {/* Metric Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '20px',
        marginBottom: '24px',
      }}>
        {metricCards.map((card, idx) => (
          <div
            key={idx}
            className="card animate-fade-in"
            style={{ animationDelay: `${idx * 50}ms` }}
          >
            <div className="card-body" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: card.bgColor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '22px',
                flexShrink: 0,
              }}>
                {card.icon}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '12px', fontWeight: '500', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>
                  {card.title}
                </div>
                <div style={{
                  fontSize: '20px',
                  fontWeight: '600',
                  color: card.color,
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: '4px',
                }}>
                  {card.value}
                  {'total' in card && (
                    <span style={{ fontSize: '13px', fontWeight: '400', color: 'var(--color-text-muted)' }}>/ {card.total}</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Detailed Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '20px',
      }}>
        <div className="card">
          <div className="card-header">
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
              System Health
            </span>
            <span className="badge badge-success">Live</span>
          </div>
          <div className="card-body">
            {isLoading ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 0' }}>
                <div className="spinner" />
                <span style={{ color: 'var(--color-text-secondary)', fontSize: '14px' }}>Loading status...</span>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: '#f0fdf4',
                }}>
                  <span style={{ fontSize: '14px', color: 'var(--color-text)' }}>Overall Status</span>
                  <span className="badge badge-success">{stats?.system_status || 'Unknown'}</span>
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: '#f8fafc',
                }}>
                  <span style={{ fontSize: '14px', color: 'var(--color-text)' }}>API Latency</span>
                  <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)', fontFamily: 'monospace' }}>~120ms</span>
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: '#f8fafc',
                }}>
                  <span style={{ fontSize: '14px', color: 'var(--color-text)' }}>Uptime</span>
                  <span style={{ fontSize: '13px', color: 'var(--color-success)', fontWeight: '500' }}>99.9%</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-secondary)" strokeWidth="2">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                <line x1="8" y1="21" x2="16" y2="21" />
                <line x1="12" y1="17" x2="12" y2="21" />
              </svg>
              Agent Health
            </span>
          </div>
          <div className="card-body">
            <AgentHealth
              agents={stats?.agents || []}
              isLoading={isLoading}
            />
          </div>
        </div>
      </div>

      {/* Footer info */}
      <div style={{
        marginTop: '24px',
        padding: '12px 16px',
        borderRadius: 'var(--radius-md)',
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '12px',
        color: 'var(--color-text-muted)',
      }}>
        <span>Data refreshes every 30 seconds automatically</span>
        {dataUpdatedAt && (
          <span>Last refresh: {new Date(dataUpdatedAt).toLocaleTimeString()}</span>
        )}
      </div>
    </div>
  );
};

export default DashboardModule;
