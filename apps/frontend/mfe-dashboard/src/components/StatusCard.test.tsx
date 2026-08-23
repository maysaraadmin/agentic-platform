import React from 'react';
import { render, screen } from '@testing-library/react';
import StatusCard from './StatusCard';

describe('StatusCard', () => {
  it('renders the title', () => {
    render(<StatusCard title="System Status" status="healthy" />);
    expect(screen.getByText('System Status')).toBeInTheDocument();
  });

  it('renders the status when not loading', () => {
    render(<StatusCard title="System Status" status="healthy" />);
    expect(screen.getByText('healthy')).toBeInTheDocument();
  });

  it('renders loading indicator when isLoading is true', () => {
    render(<StatusCard title="System Status" status="healthy" isLoading />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('does not render loading when isLoading is false', () => {
    render(<StatusCard title="System Status" status="healthy" isLoading={false} />);
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
  });
});
