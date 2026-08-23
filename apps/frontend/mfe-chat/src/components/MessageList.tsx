import React, { useEffect, useRef } from 'react';
import ChatMessage from './ChatMessage';
import { ChatMessage as ChatMessageType } from '../utils/api';

interface MessageListProps {
  messages: ChatMessageType[];
  streamingContent: string;
  isStreaming: boolean;
}

const MessageList: React.FC<MessageListProps> = ({
  messages,
  streamingContent,
  isStreaming,
}) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent]);

  return (
    <div
      style={{
        border: '1px solid #ccc',
        borderRadius: '8px',
        height: '400px',
        overflowY: 'auto',
        padding: '16px',
        marginBottom: '20px',
        backgroundColor: '#fafafa',
      }}
    >
      {messages.length === 0 && !isStreaming && (
        <p style={{ color: '#999', textAlign: 'center' }}>
          No messages yet. Start a conversation!
        </p>
      )}
      {messages.map((msg, idx) => (
        <ChatMessage key={idx} message={msg} />
      ))}
      {isStreaming && streamingContent && (
        <ChatMessage message={{ role: 'assistant', content: streamingContent }} />
      )}
      {isStreaming && !streamingContent && (
        <div style={{ color: '#999', margin: '8px 0' }}>
          <span className="streaming-indicator">●●●</span> Thinking...
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  );
};

export default MessageList;
