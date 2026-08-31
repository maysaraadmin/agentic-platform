import React from 'react';

interface DocumentStatsProps {
  totalIndexed: number;
  lastUpdate: string;
}

const DocumentStats: React.FC<DocumentStatsProps> = ({
  totalIndexed,
  lastUpdate,
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 16px',
        borderRadius: 'var(--radius-md)',
        backgroundColor: '#e0f2fe',
      }}>
        <span style={{ fontSize: '14px', color: 'var(--color-text)' }}>Total Indexed</span>
        <span style={{ fontSize: '18px', fontWeight: '600', color: 'var(--color-secondary)' }}>
          {totalIndexed.toLocaleString()}
        </span>
      </div>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 16px',
        borderRadius: 'var(--radius-md)',
        backgroundColor: '#fef3c7',
      }}>
        <span style={{ fontSize: '14px', color: 'var(--color-text)' }}>Last Update</span>
        <span style={{ fontSize: '13px', fontWeight: '500', color: 'var(--color-warning)' }}>
          {lastUpdate !== 'Never' ? new Date(lastUpdate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Never'}
        </span>
      </div>
    </div>
  );
};

export default DocumentStats;
