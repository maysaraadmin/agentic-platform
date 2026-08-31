import { FC } from 'react';
import { useChatStream } from './hooks/useChatStream';
import MessageList from './components/MessageList';
import ChatInput from './components/ChatInput';

const ChatModule: FC = () => {
  const { messages, streamingContent, isStreaming, error, sendMessage, stopStreaming } =
    useChatStream();

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      maxWidth: '900px',
      margin: '0 auto',
    }}>
      {/* Chat Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 0',
        borderBottom: '1px solid var(--color-border)',
        marginBottom: '16px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #818cf8, #6366f1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '18px',
          }}>
            🤖
          </div>
          <div>
            <div style={{ fontWeight: '600', fontSize: '15px' }}>AI Assistant</div>
            <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-success)',
                display: 'inline-block',
              }} />
              Online • Powered by LangGraph
            </div>
          </div>
        </div>
        {messages.length > 0 && (
          <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
            {messages.length} messages
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div style={{
          padding: '12px 16px',
          marginBottom: '16px',
          backgroundColor: '#fef2f2',
          color: '#991b1b',
          borderRadius: 'var(--radius-md)',
          fontSize: '14px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          border: '1px solid #fecaca',
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
          {error}
        </div>
      )}

      {/* Messages */}
      <MessageList
        messages={messages}
        streamingContent={streamingContent}
        isStreaming={isStreaming}
      />

      {/* Input */}
      <div style={{ marginTop: '16px' }}>
        <ChatInput onSend={sendMessage} isStreaming={isStreaming} onStop={stopStreaming} />
      </div>

      {/* Quick Actions */}
      {messages.length === 0 && !isStreaming && (
        <div style={{
          marginTop: '24px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '12px',
        }}>
          {[
            { icon: '📋', text: 'Get company policies' },
            { icon: '👥', text: 'Find employee info' },
            { icon: '📊', text: 'Check system status' },
            { icon: '🔍', text: 'Search documents' },
          ].map((action, idx) => (
            <button
              key={idx}
              onClick={() => sendMessage(action.text)}
              style={{
                padding: '14px 16px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-surface)',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                fontSize: '13px',
                color: 'var(--color-text)',
                textAlign: 'left',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-primary)';
                e.currentTarget.style.backgroundColor = 'var(--color-primary-light)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-border)';
                e.currentTarget.style.backgroundColor = 'var(--color-surface)';
              }}
            >
              <span style={{ fontSize: '18px' }}>{action.icon}</span>
              {action.text}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ChatModule;
