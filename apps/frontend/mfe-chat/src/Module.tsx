import React from 'react';
import { useChatStream } from '../hooks/useChatStream';
import MessageList from './components/MessageList';
import ChatInput from './components/ChatInput';

const ChatModule: React.FC = () => {
  const { messages, streamingContent, isStreaming, error, sendMessage } =
    useChatStream();

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>AI Assistant</h1>
      {error && (
        <div
          style={{
            padding: '10px',
            marginBottom: '10px',
            backgroundColor: '#fee',
            color: '#c00',
            borderRadius: '8px',
          }}
        >
          Error: {error}
        </div>
      )}
      <MessageList
        messages={messages}
        streamingContent={streamingContent}
        isStreaming={isStreaming}
      />
      <ChatInput onSend={sendMessage} isStreaming={isStreaming} />
    </div>
  );
};

export default ChatModule;
