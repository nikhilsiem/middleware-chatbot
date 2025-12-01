import { useEffect } from 'react';
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
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  // Auto-resize textarea based on content
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 150)}px`;
    }
  }, [input, inputRef]);

  return (
    <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg">
      <div className="max-w-4xl mx-auto px-4 py-4">
        <div className="flex gap-3 items-end">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isOnline ? "Type your message... (Shift+Enter for new line)" : "You are offline"}
            className="flex-1 px-5 py-3 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-3xl focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none overflow-y-auto min-h-[48px] max-h-[150px]"
            disabled={loading || !isOnline}
            maxLength={MAX_MESSAGE_LENGTH}
            aria-label="Message input"
            rows={1}
          />
          <button
            onClick={onSend}
            disabled={loading || !input.trim() || !isOnline}
            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-full hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg flex items-center gap-2 flex-shrink-0"
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
