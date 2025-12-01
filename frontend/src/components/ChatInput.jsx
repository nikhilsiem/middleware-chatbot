import React from 'react';
import { Send } from 'lucide-react';
import { MAX_MESSAGE_LENGTH } from '../utils/constants';

const ChatInput = ({
  input,
  setInput,
  onSend,
  loading,
  isOnline,
  userId,
  messageCount,
  inputRef
}) => {
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg">
      <div className="max-w-4xl mx-auto px-4 py-4">
        <div className="flex gap-3">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={isOnline ? "Type your message..." : "You are offline"}
            className="flex-1 px-5 py-3 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            disabled={loading || !isOnline}
            maxLength={MAX_MESSAGE_LENGTH}
            aria-label="Message input"
          />
          <button
            onClick={onSend}
            disabled={loading || !input.trim() || !isOnline}
            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-full hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg flex items-center gap-2"
            aria-label="Send message"
          >
            <Send className="w-5 h-5" />
            Send
          </button>
        </div>
        <div className="flex justify-between items-center mt-2 text-xs text-gray-500 dark:text-gray-400">
          <p>
            Messages: {messageCount} | User: {userId.substring(0, 12)}...
          </p>
          <p>
            {input.length}/{MAX_MESSAGE_LENGTH}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatInput;
