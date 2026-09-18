import React from 'react';
import { Sparkles, ShieldCheck, FileText, Layers, FileCode, ArrowRight } from 'lucide-react';
import { Collection, Paper } from '../../types';

interface NewChatStateProps {
  onSelectSuggestion: (prompt: string) => void;
  collections: Collection[];
  papers: Paper[];
  selectedScope: { type: 'all' | 'collection' | 'paper'; id?: string; name: string };
  onScopeChange: (scope: { type: 'all' | 'collection' | 'paper'; id?: string; name: string }) => void;
}

const SUGGESTIONS = [
  { icon: FileText, text: 'Summarize this paper', category: 'Summary' },
  { icon: Sparkles, text: 'What is the main contribution?', category: 'Key Insight' },
  { icon: Layers, text: 'Explain the methodology', category: 'Methodology' },
  { icon: FileCode, text: 'What problem does this paper solve?', category: 'Problem' },
  { icon: Layers, text: 'Compare these papers', category: 'Comparison' },
  { icon: Sparkles, text: 'Find the limitations', category: 'Analysis' },
  { icon: FileText, text: 'Explain this concept simply', category: 'Explanation' },
];

export const NewChatState: React.FC<NewChatStateProps> = ({
  onSelectSuggestion,
  collections,
  papers,
  selectedScope,
  onScopeChange,
}) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-4xl mx-auto min-h-[75vh]">
      {/* Branding Hero */}
      <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white flex items-center justify-center shadow-soft-lg mb-4">
        <Sparkles className="w-7 h-7 animate-pulse-subtle" />
      </div>

      <h1 className="text-2xl sm:text-3xl font-bold text-academic-900 dark:text-white tracking-tight mb-2">
        Research Paper AI
      </h1>

      <p className="text-sm sm:text-base text-academic-600 dark:text-academic-300 font-medium max-w-xl mb-3">
        Your intelligent research companion.
      </p>

      <p className="text-xs sm:text-sm text-academic-500 dark:text-academic-400 max-w-md mb-6">
        Ask questions, explore papers, and discover grounded academic insights with exact page citations.
      </p>

      {/* RAG Context Scope Selector */}
      <div className="mb-8 flex flex-wrap items-center justify-center gap-2">
        <span className="text-xs font-medium text-academic-500 dark:text-academic-400">Research Scope:</span>

        <div className="relative inline-flex items-center">
          <select
            value={`${selectedScope.type}:${selectedScope.id || ''}`}
            onChange={(e) => {
              const [type, id] = e.target.value.split(':');
              if (type === 'all') {
                onScopeChange({ type: 'all', name: 'All Papers' });
              } else if (type === 'collection') {
                const col = collections.find(c => c.id === id);
                onScopeChange({ type: 'collection', id, name: col ? col.name : 'Collection' });
              } else if (type === 'paper') {
                const p = papers.find(p => p.id === id);
                onScopeChange({ type: 'paper', id, name: p ? p.filename : 'Paper' });
              }
            }}
            className="appearance-none bg-white dark:bg-academic-900 border border-academic-300 dark:border-academic-700 text-academic-800 dark:text-academic-200 text-xs rounded-lg pl-3 pr-8 py-1.5 font-medium shadow-soft-sm hover:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 cursor-pointer"
          >
            <option value="all:">📚 All Papers ({papers.length})</option>
            <optgroup label="Collections">
              {collections.map(col => (
                <option key={col.id} value={`collection:${col.id}`}>📁 {col.name} ({col.paperCount} papers)</option>
              ))}
            </optgroup>
            <optgroup label="Specific Papers">
              {papers.map(paper => (
                <option key={paper.id} value={`paper:${paper.id}`}>📄 {paper.title.substring(0, 35)}...</option>
              ))}
            </optgroup>
          </select>
          <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-academic-400 text-[10px]">
            ▼
          </div>
        </div>

        {/* Grounding Notice Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/80 dark:border-emerald-800/60 text-[11px] font-medium text-emerald-700 dark:text-emerald-300">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>Answers are grounded in your uploaded research papers.</span>
        </div>
      </div>

      {/* Suggestion Chips / Cards Grid */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-left">
        {SUGGESTIONS.map((item, index) => {
          const IconComp = item.icon;
          return (
            <button
              key={index}
              onClick={() => onSelectSuggestion(item.text)}
              className="group p-3.5 rounded-xl bg-white dark:bg-academic-900 border border-academic-200/80 dark:border-academic-800 hover:border-brand-400 dark:hover:border-brand-600 hover:shadow-soft-md transition-all duration-200 text-left flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] uppercase tracking-wider font-semibold text-brand-600 dark:text-brand-400">
                  {item.category}
                </span>
                <IconComp className="w-4 h-4 text-academic-400 group-hover:text-brand-500 transition-colors" />
              </div>

              <p className="text-xs font-medium text-academic-800 dark:text-academic-200 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors flex items-center justify-between">
                <span>"{item.text}"</span>
                <ArrowRight className="w-3.5 h-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-brand-500" />
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
};
