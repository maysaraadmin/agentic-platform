import React from 'react';
import { ChatMessage } from '../utils/api';

interface ChatMessageProps {
  message: ChatMessage;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === 'user';

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: isUser ? 'flex-end' : 'flex-start',
        animation: 'fadeIn 0.3s ease',
      }}
    >
      <div style={{
        display: 'flex',
        flexDirection: isUser ? 'row-reverse' : 'row',
        alignItems: 'flex-start',
        gap: '10px',
        maxWidth: '75%',
      }}>
        {/* Avatar */}
        <div style={{
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          backgroundColor: isUser ? 'var(--color-primary)' : '#e0e7ff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '14px',
          flexShrink: 0,
          color: isUser ? 'white' : 'var(--color-primary)',
          fontWeight: '600',
        }}>
          {isUser ? 'U' : 'AI'}
        </div>

        {/* Message bubble */}
        <div
          style={{
            padding: '12px 16px',
            borderRadius: 'var(--radius-lg)',
            backgroundColor: isUser ? 'var(--color-primary)' : 'var(--color-surface)',
            color: isUser ? 'white' : 'var(--color-text)',
            border: isUser ? 'none' : '1px solid var(--color-border)',
            borderTopRightRadius: isUser ? '4px' : 'var(--radius-lg)',
            borderTopLeftRadius: isUser ? 'var(--radius-lg)' : '4px',
            fontSize: '14px',
            lineHeight: '1.6',
            boxShadow: 'var(--shadow-sm)',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}
        >
          {message.content}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
