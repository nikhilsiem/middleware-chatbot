import { describe, test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Message from '../../components/Message';

describe('Message Component Tests', () => {
  test('should render user message', () => {
    const message = {
      role: 'user',
      content: 'Hello, AI!',
      timestamp: '2024-01-01T12:00:00.000Z'
    };
    
    render(<Message message={message} />);
    
    expect(screen.getByText('Hello, AI!')).toBeInTheDocument();
  });

  test('should render assistant message', () => {
    const message = {
      role: 'assistant',
      content: 'Hi there!',
      timestamp: '2024-01-01T12:00:00.000Z'
    };
    
    render(<Message message={message} />);
    
    expect(screen.getByText('Hi there!')).toBeInTheDocument();
  });

  test('should render error message', () => {
    const message = {
      role: 'assistant',
      content: 'An error occurred',
      timestamp: '2024-01-01T12:00:00.000Z',
      isError: true
    };
    
    render(<Message message={message} />);
    
    expect(screen.getByText('An error occurred')).toBeInTheDocument();
  });

  test('should display timestamp', () => {
    const message = {
      role: 'user',
      content: 'Test message',
      timestamp: '2024-01-01T12:00:00.000Z'
    };
    
    const { container } = render(<Message message={message} />);
    
    // Check that timestamp is rendered (format may vary by locale)
    const timestamps = container.querySelectorAll('.text-xs');
    expect(timestamps.length).toBeGreaterThan(0);
  });

  test('should apply correct styling for user messages', () => {
    const message = {
      role: 'user',
      content: 'User message',
      timestamp: '2024-01-01T12:00:00.000Z'
    };
    
    const { container } = render(<Message message={message} />);
    
    const messageDiv = container.querySelector('.flex-row-reverse');
    expect(messageDiv).toBeInTheDocument();
  });

  test('should apply correct styling for assistant messages', () => {
    const message = {
      role: 'assistant',
      content: 'Assistant message',
      timestamp: '2024-01-01T12:00:00.000Z'
    };
    
    const { container } = render(<Message message={message} />);
    
    const messageDiv = container.querySelector('.flex-row');
    expect(messageDiv).toBeInTheDocument();
  });

  test('should handle multiline content', () => {
    const message = {
      role: 'user',
      content: 'Line 1\nLine 2\nLine 3',
      timestamp: '2024-01-01T12:00:00.000Z'
    };
    
    render(<Message message={message} />);
    
    expect(screen.getByText(/Line 1/)).toBeInTheDocument();
  });
});
