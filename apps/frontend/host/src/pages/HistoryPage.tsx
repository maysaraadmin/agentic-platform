import { FC, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { API_URL, getAuthHeaders } from 'shared/auth';

interface ConversationItem {
  id: number;
  agent_type: string;
  query: string;
  response: string;
  created_at: string;
  user_id: string;
}

const HistoryPage: FC = () => {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const { data: conversations, isLoading } = useQuery({
    queryKey: ['conversations'],
    queryFn: async (): Promise<ConversationItem[]> => {
      const response = await fetch(`${API_URL}/api/v1/conversations/history`, { headers: getAuthHeaders() });
      if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
      return response.json();
    },
  });

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '24px' }}>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px' }}>
          View past AI agent interactions and responses
        </p>
      </div>

      <div className="card">
        <div className="card-header">
          <span>Conversation History</span>
          <span className="badge badge-info">{conversations?.length || 0} conversations</span>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          {isLoading ? (
            <div style={{ padding: '40px', textAlign: 'center' }}>
              <div className="spinner" style={{ margin: '0 auto' }} />
              <p style={{ marginTop: '12px', color: 'var(--color-text-secondary)', fontSize: '14px' }}>Loading history...</p>
            </div>
          ) : conversations && conversations.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {conversations.map((item, idx) => (
                <div
                  key={item.id}
                  style={{
                    padding: '0',
                    borderBottom: idx < conversations.length - 1 ? '1px solid var(--color-border)' : 'none',
                  }}
                >
                  <button
                    onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                    style={{
                      width: '100%',
                      padding: '16px 20px',
                      textAlign: 'left',
                      backgroundColor: 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '16px',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-surface-hover)')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontWeight: '500',
                        fontSize: '14px',
                        marginBottom: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                      }}>
                        <span className="badge badge-info" style={{ fontSize: '10px', padding: '2px 8px' }}>
                          {item.agent_type}
                        </span>
                        <span style={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          color: 'var(--color-text)',
                        }}>
                          {item.query}
                        </span>
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                        {new Date(item.created_at).toLocaleDateString('en-US', {
                          year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                        })}
                      </div>
                    </div>
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      style={{
                        transform: expandedId === item.id ? 'rotate(180deg)' : 'rotate(0)',
                        transition: 'transform var(--transition)',
                        color: 'var(--color-text-muted)',
                        flexShrink: 0,
                      }}
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>
                  {expandedId === item.id && (
                    <div style={{
                      padding: '0 20px 20px',
                      animation: 'fadeIn 0.2s ease',
                    }}>
                      <div style={{
                        backgroundColor: 'var(--color-primary-light)',
                        borderRadius: 'var(--radius-md)',
                        padding: '14px 16px',
                        marginBottom: '12px',
                      }}>
                        <div style={{ fontSize: '11px', fontWeight: '600', color: 'var(--color-primary)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          Query
                        </div>
                        <div style={{ fontSize: '14px', color: 'var(--color-text)' }}>{item.query}</div>
                      </div>
                      <div style={{
                        backgroundColor: '#f0fdf4',
                        borderRadius: 'var(--radius-md)',
                        padding: '14px 16px',
                      }}>
                        <div style={{ fontSize: '11px', fontWeight: '600', color: 'var(--color-success)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          Response
                        </div>
                        <div style={{ fontSize: '14px', color: 'var(--color-text)', whiteSpace: 'pre-wrap' }}>{item.response}</div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: '60px 40px', textAlign: 'center' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>💬</div>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '15px' }}>No conversation history</p>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '13px', marginTop: '4px' }}>Start chatting with the AI assistant to build your history</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HistoryPage;
