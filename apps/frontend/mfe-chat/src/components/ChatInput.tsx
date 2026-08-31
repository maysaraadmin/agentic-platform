import React, { useState } from 'react';

interface ChatInputProps {
  onSend: (message: string) => void;
  isStreaming: boolean;
  onStop?: () => void;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSend, isStreaming, onStop }) => {
  const [input, setInput] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isStreaming) return;
    onSend(input.trim());
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const focusStyle = isFocused
    ? { borderColor: 'var(--color-primary)', boxShadow: '0 0 0 3px var(--color-primary-light)' }
    : { borderColor: 'var(--color-border)', boxShadow: 'var(--shadow-sm)' };

  if (isStreaming) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px 16px',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--color-border)',
        backgroundColor: 'var(--color-surface)',
      }}>
        <div className="spinner" style={{ width: '18px', height: '18px', borderWidth: '2px' }} />
        <span style={{ flex: 1, fontSize: '14px', color: 'var(--color-text-secondary)' }}>
          AI is thinking...
        </span>
        {onStop && (
          <button
            onClick={onStop}
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-md)',
              fontSize: '13px',
              fontWeight: '500',
              backgroundColor: '#fee2e2',
              color: '#991b1b',
            }}
          >
            Stop
          </button>
        )}
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        display: 'flex',
        alignItems: 'flex-end',
        gap: '12px',
        padding: '8px',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid',
        backgroundColor: 'var(--color-surface)',
        transition: 'border-color var(--transition), box-shadow var(--transition)',
        ...focusStyle,
      }}
    >
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder="Ask anything... (Shift+Enter for new line)"
        rows={1}
        style={{
          flex: 1,
          padding: '10px 14px',
          borderRadius: 'var(--radius-md)',
          border: 'none',
          backgroundColor: 'transparent',
          fontSize: '14px',
          resize: 'none',
          minHeight: '42px',
          maxHeight: '120px',
          lineHeight: '1.5',
        }}
      />
      <button
        type="submit"
        disabled={!input.trim()}
        style={{
          padding: '10px 20px',
          borderRadius: 'var(--radius-md)',
          backgroundColor: input.trim() ? 'var(--color-primary)' : '#e2e8f0',
          color: input.trim() ? 'white' : '#94a3b8',
          fontWeight: '500',
          fontSize: '14px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="22" y1="2" x2="11" y2="13" />
          <polygon points="22 2 15 22 11 13 2 9 22 2" />
        </svg>
        Send
      </button>
    </form>
  );
};

export default ChatInput;
