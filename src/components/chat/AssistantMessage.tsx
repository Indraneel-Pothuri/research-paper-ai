import React, { useState } from 'react';
import { Message, Source } from '../../types';
import { MarkdownRenderer } from './MarkdownRenderer';
import { SourcesList } from './SourcesList';
import { Sparkles, Copy, Check } from 'lucide-react';

interface AssistantMessageProps {
  message: Message;
  onSelectSource: (source: Source) => void;
}

export const AssistantMessage: React.FC<AssistantMessageProps> = ({ message, onSelectSource }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCitationClick = (citationIndex: number) => {
    if (message.sources && message.sources[citationIndex - 1]) {
      onSelectSource(message.sources[citationIndex - 1]);
    } else if (message.sources && message.sources.length > 0) {
      onSelectSource(message.sources[0]);
    }
  };

  return (
    <div className="py-5 px-4 sm:px-6 bg-white/70 dark:bg-academic-900/40 border-y border-academic-100/70 dark:border-academic-800/40">
      <div className="max-w-3xl mx-auto flex items-start gap-4">
        {/* Academic AI Avatar */}
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-600 to-indigo-600 text-white flex items-center justify-center flex-shrink-0 shadow-soft-sm">
          <Sparkles className="w-4 h-4" />
        </div>

        <div className="flex-1 min-w-0 pt-0.5">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-academic-900 dark:text-white">Research Paper AI</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-brand-50 dark:bg-brand-950/80 text-brand-700 dark:text-brand-300 border border-brand-200/60 dark:border-brand-800/60 font-medium">
                Grounded
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] text-academic-400 dark:text-academic-500">{message.timestamp}</span>
              <button
                onClick={handleCopy}
                className="p-1 rounded hover:bg-academic-100 dark:hover:bg-academic-800 text-academic-400 hover:text-academic-600 dark:hover:text-academic-200 transition-colors"
                title="Copy response"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Markdown & LaTeX Render */}
          <div className="prose dark:prose-invert max-w-none text-academic-900 dark:text-academic-100">
            <MarkdownRenderer content={message.content} onCitationClick={handleCitationClick} />
          </div>

          {/* Grounded Sources */}
          {message.sources && message.sources.length > 0 && (
            <SourcesList sources={message.sources} onSelectSource={onSelectSource} />
          )}
        </div>
      </div>
    </div>
  );
};
