import React from 'react';
import { Source } from '../../types';
import { FileText, ExternalLink, Bookmark } from 'lucide-react';

interface SourcesListProps {
  sources: Source[];
  onSelectSource: (source: Source) => void;
}

export const SourcesList: React.FC<SourcesListProps> = ({ sources, onSelectSource }) => {
  if (!sources || sources.length === 0) return null;

  return (
    <div className="mt-4 pt-3 border-t border-academic-100 dark:border-academic-800/60">
      <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-academic-500 dark:text-academic-400 mb-2.5">
        <Bookmark className="w-3.5 h-3.5 text-brand-500" />
        <span>Grounded Sources ({sources.length})</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {sources.map((source, index) => (
          <div
            key={source.id || index}
            onClick={() => onSelectSource(source)}
            className="group flex flex-col justify-between p-3 rounded-xl bg-academic-50/80 dark:bg-academic-900/60 border border-academic-200/80 dark:border-academic-800/70 hover:border-brand-300 dark:hover:border-brand-700/70 hover:shadow-soft-sm transition-all duration-200 cursor-pointer"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-1.5 min-w-0">
                  <FileText className="w-4 h-4 text-brand-600 dark:text-brand-400 flex-shrink-0" />
                  <span className="text-xs font-medium text-academic-800 dark:text-academic-200 truncate group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                    {source.filename}
                  </span>
                </div>
                <span className="flex-shrink-0 text-[10px] font-semibold px-1.5 py-0.5 rounded bg-academic-200/70 dark:bg-academic-800 text-academic-700 dark:text-academic-300">
                  Page {source.page}
                </span>
              </div>

              <div className="text-[11px] font-medium text-academic-600 dark:text-academic-400 mb-1">
                {source.section}
              </div>

              <p className="text-[11px] text-academic-500 dark:text-academic-400 line-clamp-2 italic leading-relaxed">
                "{source.excerpt}"
              </p>
            </div>

            <div className="mt-2 pt-1.5 flex items-center justify-between text-[11px] text-brand-600 dark:text-brand-400 font-medium border-t border-academic-200/40 dark:border-academic-800/40 opacity-80 group-hover:opacity-100 transition-opacity">
              <span>Inspect Source Passage</span>
              <ExternalLink className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
