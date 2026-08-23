import React from 'react';

interface StatusCardProps {
  title: string;
  status: string;
  isLoading?: boolean;
}

const StatusCard: React.FC<StatusCardProps> = ({ title, status, isLoading }) => {
  return (
    <div
      style={{
        border: '1px solid #ccc',
        padding: '20px',
        borderRadius: '8px',
        backgroundColor: '#fff',
      }}
    >
      <h3>{title}</h3>
      <p>
        Status:{' '}
        {isLoading ? (
          <span style={{ color: '#999' }}>Loading...</span>
        ) : (
          <span style={{ color: '#28a745', fontWeight: 'bold' }}>{status}</span>
        )}
      </p>
    </div>
  );
};

export default StatusCard;
