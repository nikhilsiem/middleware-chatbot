import React from 'react';
import { AlertCircle } from 'lucide-react';

const ErrorBanner = ({ error }) => {
  if (!error) return null;

  return (
    <div className="bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800 px-4 py-3">
      <div className="max-w-4xl mx-auto flex items-center gap-2 text-red-700 dark:text-red-400 text-sm">
        <AlertCircle className="w-4 h-4 flex-shrink-0" />
        <span>{error}</span>
      </div>
    </div>
  );
};

export default ErrorBanner;
