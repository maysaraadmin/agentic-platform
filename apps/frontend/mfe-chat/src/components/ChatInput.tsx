import React, { useState } from 'react';

interface ChatInputProps {
  onSend: (message: string) => void;
  isStreaming: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSend, isStreaming }) => {
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isStreaming) return;
    onSend(input.trim());
    setInput('');
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px' }}>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Ask me anything..."
        disabled={isStreaming}
        style={{
          flex: 1,
          padding: '12px',
          borderRadius: '8px',
          border: '1px solid #ccc',
          fontSize: '14px',
        }}
      />
      <button
        type="submit"
        disabled={isStreaming || !input.trim()}
        style={{
          padding: '12px 24px',
          borderRadius: '8px',
          border: 'none',
          backgroundColor: isStreaming ? '#ccc' : '#007bff',
          color: '#fff',
          cursor: isStreaming ? 'not-allowed' : 'pointer',
          fontSize: '14px',
        }}
      >
        Send
      </button>
    </form>
  );
};

export default ChatInput;
