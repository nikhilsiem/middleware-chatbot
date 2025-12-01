import React from 'react';
import { Sparkles } from 'lucide-react';

const EmptyState = () => {
  return (
    <div className="text-center py-12">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 inline-block">
        <Sparkles className="w-16 h-16 text-purple-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
          Start a Conversation
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Chat with me and I'll learn about you!
        </p>
        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 text-sm text-gray-700 dark:text-gray-300 space-y-2">
          <p className="font-semibold">💡 Try these:</p>
          <ul className="text-left space-y-1 ml-4">
            <li>• Tell me about your hobbies</li>
            <li>• What's your profession?</li>
            <li>• What do you enjoy doing?</li>
          </ul>
          <p className="text-purple-700 dark:text-purple-400 font-semibold mt-3">
            After chatting, ask "Who am I?" for your personality profile!
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmptyState;
