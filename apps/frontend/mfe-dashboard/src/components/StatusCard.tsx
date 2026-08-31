import React from 'react';

interface StatusCardProps {
  title: string;
  status: string;
  isLoading?: boolean;
}

const StatusCard: React.FC<StatusCardProps> = ({ title, status, isLoading }) => {
  const isHealthy = status?.toLowerCase() === 'healthy' || status?.toLowerCase() === 'online';

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '14px 16px',
      borderRadius: 'var(--radius-md)',
      backgroundColor: isHealthy ? '#f0fdf4' : '#fef2f2',
    }}>
      <span style={{ fontSize: '14px', color: 'var(--color-text)' }}>{title}</span>
      {isLoading ? (
        <div className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }} />
      ) : (
        <span className={`badge ${isHealthy ? 'badge-success' : 'badge-danger'}`}>
          {status || 'Unknown'}
        </span>
      )}
    </div>
  );
};

export default StatusCard;
