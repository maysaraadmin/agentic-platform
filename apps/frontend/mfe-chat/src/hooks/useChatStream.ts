import { useCallback, useRef, useState } from 'react';
import { streamChat, ChatMessage } from '../utils/api';

export const useChatStream = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [streamingContent, setStreamingContent] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(async (content: string) => {
    const userMessage: ChatMessage = { role: 'user', content };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setStreamingContent('');
    setIsStreaming(true);
    setError(null);

    abortRef.current = new AbortController();

    await streamChat(
      updatedMessages,
      (chunk) => {
        setStreamingContent((prev) => prev + chunk);
      },
      (err) => {
        setError(err);
      },
      abortRef.current.signal
    );

    setStreamingContent((prev) => {
      if (prev) {
        setMessages((msgs) => [...msgs, { role: 'assistant', content: prev }]);
      }
      return '';
    });
    setIsStreaming(false);
  }, [messages]);

  const stopStreaming = useCallback(() => {
    abortRef.current?.abort();
    setIsStreaming(false);
    setStreamingContent((prev) => {
      if (prev) {
        setMessages((msgs) => [...msgs, { role: 'assistant', content: prev }]);
      }
      return '';
    });
  }, []);

  return {
    messages,
    streamingContent,
    isStreaming,
    error,
    sendMessage,
    stopStreaming,
  };
};
