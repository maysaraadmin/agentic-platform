import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';

const API_BASE = 'http://localhost:8000/api/v1';

const ChatModule: React.FC = () => {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<Array<{role: string, content: string}>>([]);

  const mutation = useMutation({
    mutationFn: async (q: string) => {
      const response = await axios.post(`${API_BASE}/agents/invoke`, { query: q });
      return response.data;
    },
    onSuccess: (data) => {
      setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setMessages(prev => [...prev, { role: 'user', content: query }]);
    mutation.mutate(query);
    setQuery('');
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>AI Assistant</h1>
      <div style={{ border: '1px solid #ccc', height: '400px', overflowY: 'auto', padding: '10px', marginBottom: '20px' }}>
        {messages.map((msg, idx) => (
          <div key={idx} style={{ textAlign: msg.role === 'user' ? 'right' : 'left', margin: '5px 0' }}>
            <strong>{msg.role === 'user' ? 'You' : 'AI'}:</strong> {msg.content}
          </div>
        ))}
        {mutation.isPending && <div>Thinking...</div>}
      </div>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask me anything..."
          style={{ width: '80%', padding: '10px' }}
        />
        <button type="submit" style={{ padding: '10px 20px' }}>Send</button>
      </form>
    </div>
  );
};

export default ChatModule;
