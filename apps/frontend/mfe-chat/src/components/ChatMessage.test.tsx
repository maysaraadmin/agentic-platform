import React from 'react';
import { render, screen } from '@testing-library/react';
import ChatMessage from './ChatMessage';

describe('ChatMessage', () => {
  it('renders user message correctly', () => {
    render(<ChatMessage message={{ role: 'user', content: 'Hello' }} />);
    expect(screen.getByText('You:')).toBeInTheDocument();
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('renders assistant message correctly', () => {
    render(<ChatMessage message={{ role: 'assistant', content: 'Hi there!' }} />);
    expect(screen.getByText('AI:')).toBeInTheDocument();
    expect(screen.getByText('Hi there!')).toBeInTheDocument();
  });

  it('aligns user messages to the right', () => {
    const { container } = render(
      <ChatMessage message={{ role: 'user', content: 'Test' }} />
    );
    const wrapper = container.querySelector('div')!;
    expect(wrapper.style.textAlign).toBe('right');
  });

  it('aligns assistant messages to the left', () => {
    const { container } = render(
      <ChatMessage message={{ role: 'assistant', content: 'Test' }} />
    );
    const wrapper = container.querySelector('div')!;
    expect(wrapper.style.textAlign).toBe('left');
  });
});
