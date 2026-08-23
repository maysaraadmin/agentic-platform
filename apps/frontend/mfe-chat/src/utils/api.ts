const API_URL = process.env.NX_API_URL || 'http://localhost:8000';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface StreamResponse {
  chunk?: string;
  done?: boolean;
  error?: string;
}

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem('auth_token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

export const streamChat = async (
  messages: ChatMessage[],
  onChunk: (chunk: string) => void,
  onError: (error: string) => void,
  signal?: AbortSignal
): Promise<void> => {
  try {
    const response = await fetch(`${API_URL}/api/v1/agents/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify({ messages }),
      signal,
    });

    if (!response.ok) {
      if (response.status === 401) {
        onError('Unauthorized. Please log in.');
        localStorage.removeItem('auth_token');
        window.location.href = '/login';
        return;
      }
      onError(`HTTP error: ${response.status}`);
      return;
    }

    const reader = response.body?.getReader();
    if (!reader) {
      onError('No response body');
      return;
    }

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') return;
          try {
            const parsed = JSON.parse(data) as StreamResponse;
            if (parsed.chunk) onChunk(parsed.chunk);
            if (parsed.error) onError(parsed.error);
          } catch {
            // skip malformed JSON
          }
        }
      }
    }
  } catch (err) {
    if ((err as Error).name !== 'AbortError') {
      onError((err as Error).message);
    }
  }
};

export const fetchHealth = async (): Promise<{ status: string }> => {
  const response = await fetch(`${API_URL}/health`, { headers: getAuthHeaders() });
  if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
  return response.json();
};
