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
        textAlign: isUser ? 'right' : 'left',
        margin: '8px 0',
      }}
    >
      <div
        style={{
          display: 'inline-block',
          padding: '10px 14px',
          borderRadius: '12px',
          maxWidth: '70%',
          backgroundColor: isUser ? '#007bff' : '#f0f0f0',
          color: isUser ? '#fff' : '#333',
          textAlign: 'left',
        }}
      >
        <strong>{isUser ? 'You' : 'AI'}:</strong> {message.content}
      </div>
    </div>
  );
};

export default ChatMessage;
