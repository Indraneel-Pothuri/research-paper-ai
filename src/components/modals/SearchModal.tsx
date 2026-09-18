import React, { useState, useEffect } from 'react';
import { SearchResultItem } from '../../types';
import { apiService } from '../../services/api';
import { Search, X, MessageSquare, FileText, Folder, ArrowRight } from 'lucide-react';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectResult: (result: SearchResultItem) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose, onSelectResult }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResultItem[]>([]);

  useEffect(() => {
    if (query.trim()) {
      setResults(apiService.searchContent(query));
    } else {
      setResults([]);
    }
  }, [query]);

  // Handle Cmd+K keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-academic-950/60 backdrop-blur-sm z-50 flex items-start justify-center pt-20 p-4">
      <div className="bg-white dark:bg-academic-900 border border-academic-200 dark:border-academic-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[70vh]">
        {/* Input Bar */}
        <div className="p-3.5 border-b border-academic-200 dark:border-academic-800 flex items-center gap-3">
          <Search className="w-5 h-5 text-brand-500" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search conversations, research papers, collections... (e.g. PPO)"
            autoFocus
            className="flex-1 bg-transparent text-sm text-academic-900 dark:text-white placeholder-academic-400 focus:outline-none"
          />
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-academic-100 text-academic-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Results */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {query.trim() && results.length === 0 && (
            <div className="py-8 text-center text-xs text-academic-400">
              No results found for "{query}".
            </div>
          )}

          {results.map(res => (
            <button
              key={res.id}
              onClick={() => { onSelectResult(res); onClose(); }}
              className="w-full text-left p-3 rounded-xl hover:bg-academic-50 dark:hover:bg-academic-800/60 transition-colors flex items-center justify-between group"
            >
              <div className="flex items-start gap-3 min-w-0">
                <div className="p-2 rounded-lg bg-academic-100 dark:bg-academic-800 text-brand-600 dark:text-brand-400 mt-0.5">
                  {res.type === 'conversation' && <MessageSquare className="w-4 h-4" />}
                  {res.type === 'paper' && <FileText className="w-4 h-4" />}
                  {res.type === 'collection' && <Folder className="w-4 h-4" />}
                </div>

                <div className="min-w-0">
                  <h4 className="text-xs font-semibold text-academic-900 dark:text-white truncate group-hover:text-brand-600 transition-colors">
                    {res.title}
                  </h4>
                  <p className="text-[11px] text-academic-500 truncate">{res.snippet}</p>
                </div>
              </div>

              <ArrowRight className="w-4 h-4 text-academic-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
