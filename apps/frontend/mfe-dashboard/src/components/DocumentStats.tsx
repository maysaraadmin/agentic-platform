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
    <div
      style={{
        border: '1px solid #ccc',
        padding: '20px',
        borderRadius: '8px',
        backgroundColor: '#fff',
      }}
    >
      <h3>Documents</h3>
      <p>Total indexed: {totalIndexed.toLocaleString()}</p>
      <p>Last update: {lastUpdate}</p>
    </div>
  );
};

export default DocumentStats;
