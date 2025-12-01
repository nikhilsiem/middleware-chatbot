import React from 'react';
import { User, Bot, AlertCircle } from 'lucide-react';
import { formatTimestamp } from '../utils/helpers';

const Message = ({ message }) => {
  const { role, content, timestamp, isError } = message;

  const getMessageClassName = () => {
    if (isError) {
      return 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-800';
    }
    return role === 'user'
      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
      : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 shadow-md';
  };

  const getIconBgClassName = () => {
    if (role === 'user') {
      return 'bg-gradient-to-r from-blue-500 to-purple-500';
    }
    if (isError) {
      return 'bg-red-500';
    }
    return 'bg-gradient-to-r from-purple-500 to-pink-500';
  };

  const getTimestampClassName = () => {
    if (isError) return 'text-red-500 dark:text-red-400';
    if (role === 'user') return 'text-blue-100';
    return 'text-gray-400 dark:text-gray-500';
  };

  return (
    <div className={`flex gap-3 ${role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
      <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${getIconBgClassName()}`}>
        {role === 'user' ? (
          <User className="w-5 h-5 text-white" />
        ) : isError ? (
          <AlertCircle className="w-5 h-5 text-white" />
        ) : (
          <Bot className="w-5 h-5 text-white" />
        )}
      </div>
      <div className={`flex-1 max-w-2xl ${getMessageClassName()} rounded-2xl px-5 py-4`}>
        <p className="whitespace-pre-wrap leading-relaxed">{content}</p>
        <p className={`text-xs mt-2 ${getTimestampClassName()}`}>
          {formatTimestamp(timestamp)}
        </p>
      </div>
    </div>
  );
};

export default Message;
