import React from 'react';
import { Message } from '../../types';
import { User } from 'lucide-react';

interface UserMessageProps {
  message: Message;
}

export const UserMessage: React.FC<UserMessageProps> = ({ message }) => {
  return (
    <div className="py-4 px-4 sm:px-6 hover:bg-academic-50/50 dark:hover:bg-academic-900/30 transition-colors">
      <div className="max-w-3xl mx-auto flex items-start gap-4">
        <div className="w-8 h-8 rounded-full bg-academic-200 dark:bg-academic-800 text-academic-700 dark:text-academic-300 flex items-center justify-center flex-shrink-0 text-xs font-semibold">
          <User className="w-4 h-4" />
        </div>

        <div className="flex-1 min-w-0 pt-1">
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="text-xs font-semibold text-academic-900 dark:text-academic-100">You</span>
            <span className="text-[10px] text-academic-400 dark:text-academic-500">{message.timestamp}</span>
          </div>

          <div className="text-sm leading-relaxed text-academic-900 dark:text-academic-100 whitespace-pre-wrap font-sans">
            {message.content}
          </div>
        </div>
      </div>
    </div>
  );
};
