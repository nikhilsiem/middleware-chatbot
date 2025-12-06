import { useState, useEffect, useRef, useCallback } from 'react';
import Header from './components/Header';
import Message from './components/Message';
import LoadingIndicator from './components/LoadingIndicator';
import EmptyState from './components/EmptyState';
import ErrorBanner from './components/ErrorBanner';
import ChatInput from './components/ChatInput';
import { chatAPI } from './services/api.service';
import { useOnlineStatus } from './hooks/useOnlineStatus';
import { getUserId, getErrorMessage } from './utils/helpers';
import { MAX_MESSAGE_LENGTH, RETRY_DELAY, MAX_RETRIES, ERROR_MESSAGES } from './utils/constants';

export default function AIChatbot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [userId] = useState(getUserId);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const isOnline = useOnlineStatus();
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Load history from server on mount
  useEffect(() => {
    loadConversationHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle offline status
  useEffect(() => {
    if (!isOnline) {
      setError(ERROR_MESSAGES.OFFLINE);
    } else {
      setError(null);
    }
  }, [isOnline]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const loadConversationHistory = async () => {
    try {
      const data = await chatAPI.getHistory(userId);
      if (data.conversations && data.conversations.length > 0) {
        setMessages(data.conversations);
      }
    } catch (error) {
      console.error('Error loading history:', error);
      // Keep existing localStorage messages if server fails
    }
  };

  const handleSend = async () => {
    if (!input.trim() || loading || !isOnline) return;

    const userMessage = input.trim();

    if (userMessage.length > MAX_MESSAGE_LENGTH) {
      setError(ERROR_MESSAGES.TOO_LONG(MAX_MESSAGE_LENGTH));
      return;
    }

    setInput('');
    setError(null);
    setRetryCount(0);

    const newUserMessage = {
      role: 'user',
      content: userMessage,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, newUserMessage]);
    setLoading(true);

    try {
      await sendMessageWithRetry(userMessage, newUserMessage);
    } catch (error) {
      handleSendError(error);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const sendMessageWithRetry = async (userMessage, newUserMessage, attempt = 1) => {
    try {
      // Create placeholder assistant message for streaming
      const assistantMessageId = Date.now();
      const assistantMessage = {
        id: assistantMessageId,
        role: 'assistant',
        content: '',
        timestamp: new Date().toISOString(),
        isStreaming: true
      };

      setMessages(prev => [...prev, assistantMessage]);

      let fullContent = '';

      await chatAPI.sendMessageStream(
        userId,
        userMessage,
        // onChunk
        (chunk) => {
          fullContent += chunk;
          setMessages(prev => prev.map(msg => 
            msg.id === assistantMessageId 
              ? { ...msg, content: fullContent }
              : msg
          ));
        },
        // onComplete
        () => {
          setMessages(prev => prev.map(msg => 
            msg.id === assistantMessageId 
              ? { ...msg, content: fullContent, isStreaming: false }
              : msg
          ));
          setRetryCount(0);
        },
        // onError
        (error) => {
          if (attempt < MAX_RETRIES && error.message?.includes('500')) {
            console.log(`Retry attempt ${attempt} of ${MAX_RETRIES}`);
            setRetryCount(attempt);
            // Remove the failed message
            setMessages(prev => prev.filter(msg => msg.id !== assistantMessageId));
            setTimeout(() => {
              sendMessageWithRetry(userMessage, newUserMessage, attempt + 1);
            }, RETRY_DELAY * attempt);
          } else {
            // Remove the failed message and show error
            setMessages(prev => prev.filter(msg => msg.id !== assistantMessageId));
            throw error;
          }
        }
      );
    } catch (error) {
      if (attempt < MAX_RETRIES && error.message?.includes('500')) {
        console.log(`Retry attempt ${attempt} of ${MAX_RETRIES}`);
        setRetryCount(attempt);
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * attempt));
        return sendMessageWithRetry(userMessage, newUserMessage, attempt + 1);
      }
      throw error;
    }
  };

  const handleSendError = (error) => {
    console.error('Error sending message:', error);
    const errorMessage = getErrorMessage(error);
    setError(errorMessage);

    const errorResponseMessage = {
      role: 'assistant',
      content: `Sorry, I encountered an error: ${errorMessage}`,
      timestamp: new Date().toISOString(),
      isError: true
    };
    setMessages(prev => [...prev, errorResponseMessage]);
  };

  const clearHistory = async () => {
    if (!window.confirm('Are you sure you want to clear all conversation history?')) {
      return;
    }

    try {
      await chatAPI.clearHistory(userId);
      setMessages([]);
      setError(null);
    } catch (error) {
      console.error('Error clearing history:', error);
      setMessages([]);
      setError('History cleared locally, but server sync failed');
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <Header
        isOnline={isOnline}
        onClearHistory={clearHistory}
        loading={loading}
        messageCount={messages.length}
      />

      <ErrorBanner error={error} />

      {retryCount > 0 && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border-b border-yellow-200 dark:border-yellow-800 px-4 py-2">
          <div className="max-w-4xl mx-auto text-yellow-700 dark:text-yellow-400 text-sm">
            Retrying... (Attempt {retryCount} of {MAX_RETRIES})
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.length === 0 && <EmptyState />}

          {messages.map((msg, idx) => (
            <Message 
              key={idx} 
              message={msg} 
              isLatest={idx === messages.length - 1}
            />
          ))}

          {loading && <LoadingIndicator />}

          <div ref={messagesEndRef} />
        </div>
      </div>

      <ChatInput
        input={input}
        setInput={setInput}
        onSend={handleSend}
        loading={loading}
        isOnline={isOnline}
        userId={userId}
        messageCount={messages.length}
        inputRef={inputRef}
      />
    </div>
  );
}
