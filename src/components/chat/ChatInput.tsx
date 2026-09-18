import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Square, Sparkles, FileText, Scale, Microscope, AlertTriangle, BarChart3, BookOpen } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  statusText?: string;
  onStopGeneration?: () => void;
  onOpenUploadModal?: () => void;
}

const RESEARCH_CHIPS = [
  { label: 'Summarize', icon: FileText, prompt: 'Summarize the core findings and contributions of this paper.' },
  { label: 'Explain simply', icon: Sparkles, prompt: 'Explain the main concepts in this paper simply for a beginner.' },
  { label: 'Compare papers', icon: Scale, prompt: 'Compare the methodology and findings across my papers.' },
  { label: 'Methodology', icon: Microscope, prompt: 'Explain the detailed mathematical methodology and architecture.' },
  { label: 'Limitations', icon: AlertTriangle, prompt: 'What are the main limitations and edge cases noted by the authors?' },
  { label: 'Key results', icon: BarChart3, prompt: 'List the quantitative experimental results and baseline comparisons.' },
  { label: 'Literature review', icon: BookOpen, prompt: 'Generate literature review notes summarizing these papers.' },
];

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  isLoading,
  statusText,
  onStopGeneration,
  onOpenUploadModal,
}) => {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  }, [input]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;
    onSendMessage(input.trim());
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="sticky bottom-0 bg-gradient-to-t from-[#f8f9fa] via-[#f8f9fa]/95 to-transparent dark:from-academic-950 dark:via-academic-950/95 pt-4 pb-3 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto flex flex-col gap-2">
        {/* Quick Research Action Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {RESEARCH_CHIPS.map((chip, idx) => {
            const Icon = chip.icon;
            return (
              <button
                key={idx}
                onClick={() => onSendMessage(chip.prompt)}
                disabled={isLoading}
                className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white dark:bg-academic-900 border border-academic-200 dark:border-academic-800 text-[11px] font-medium text-academic-700 dark:text-academic-300 hover:border-brand-400 dark:hover:border-brand-600 hover:text-brand-600 dark:hover:text-brand-400 shadow-soft-sm whitespace-nowrap transition-all disabled:opacity-50"
              >
                <Icon className="w-3 h-3 text-brand-500" />
                <span>{chip.label}</span>
              </button>
            );
          })}
        </div>

        {/* Input Box */}
        <div className="relative rounded-2xl bg-white dark:bg-academic-900 border border-academic-200/90 dark:border-academic-800 shadow-soft-md focus-within:border-brand-500 dark:focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-500/20 transition-all">
          {/* RAG Status Bar when Loading */}
          {isLoading && (
            <div className="px-4 py-2 border-b border-academic-100 dark:border-academic-800 flex items-center justify-between text-xs text-brand-600 dark:text-brand-400 font-medium">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-brand-500 animate-ping" />
                <span>{statusText || 'Researching your papers...'}</span>
              </div>
              <button
                onClick={onStopGeneration}
                className="text-[11px] font-semibold text-rose-500 hover:text-rose-600 flex items-center gap-1"
              >
                <Square className="w-3 h-3 fill-current" />
                <span>Stop</span>
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex items-end p-2.5 gap-2">
            <button
              type="button"
              onClick={onOpenUploadModal}
              className="p-2 rounded-xl text-academic-400 hover:text-academic-600 dark:hover:text-academic-200 hover:bg-academic-100 dark:hover:bg-academic-800 transition-colors"
              title="Attach research PDF"
            >
              <Paperclip className="w-5 h-5" />
            </button>

            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything about your research papers... (Press Enter to send, Shift+Enter for new line)"
              rows={1}
              className="flex-1 bg-transparent border-0 resize-none text-sm text-academic-900 dark:text-white placeholder-academic-400 focus:outline-none focus:ring-0 max-h-44 py-1.5 px-1 font-sans"
            />

            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className={`p-2 rounded-xl transition-all ${
                input.trim() && !isLoading
                  ? 'bg-brand-600 hover:bg-brand-700 text-white shadow-soft-sm'
                  : 'bg-academic-100 dark:bg-academic-800 text-academic-400 cursor-not-allowed'
              }`}
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Disclaimer */}
        <p className="text-[11px] text-center text-academic-400 dark:text-academic-500 font-normal">
          Research Paper AI can make mistakes. Verify important information in the original papers.
        </p>
      </div>
    </div>
  );
};
