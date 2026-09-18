import React, { useState } from 'react';
import { Source } from '../../types';
import { X, ChevronLeft, ChevronRight, FileText, ExternalLink, ZoomIn, ZoomOut, Search, MessageSquare, Sparkles } from 'lucide-react';

interface SourceViewerPanelProps {
  source: Source | null;
  sourcesList?: Source[];
  onClose: () => void;
  onAskAboutExcerpt?: (excerpt: string) => void;
  onOpenPdfReader?: (paperId: string) => void;
}

export const SourceViewerPanel: React.FC<SourceViewerPanelProps> = ({
  source,
  sourcesList = [],
  onClose,
  onAskAboutExcerpt,
  onOpenPdfReader,
}) => {
  const [zoomLevel, setZoomLevel] = useState(100);
  const [searchQuery, setSearchQuery] = useState('');

  if (!source) return null;

  const currentIndex = sourcesList.findIndex(s => s.id === source.id);
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex !== -1 && currentIndex < sourcesList.length - 1;

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-[480px] md:w-[540px] bg-white dark:bg-academic-900 border-l border-academic-200 dark:border-academic-800 shadow-2xl z-50 flex flex-col transition-all duration-300">
      {/* Top Header */}
      <div className="p-4 border-b border-academic-200 dark:border-academic-800 flex items-center justify-between bg-academic-50/70 dark:bg-academic-950/60">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-brand-100 dark:bg-brand-950 text-brand-600 dark:text-brand-400 flex items-center justify-center flex-shrink-0">
            <FileText className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h3 className="text-xs font-semibold text-academic-900 dark:text-white truncate">
              {source.paperTitle}
            </h3>
            <p className="text-[11px] text-academic-500 truncate">{source.filename}</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-academic-200 dark:hover:bg-academic-800 text-academic-500 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Source Navigation Bar */}
      <div className="px-4 py-2 bg-academic-100/60 dark:bg-academic-800/40 border-b border-academic-200 dark:border-academic-800 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-brand-600 dark:text-brand-400">Page {source.page}</span>
          <span className="text-academic-300 dark:text-academic-700">•</span>
          <span className="text-academic-600 dark:text-academic-400 truncate max-w-[200px]">{source.section}</span>
        </div>

        <div className="flex items-center gap-1">
          <button
            disabled={!hasPrev}
            onClick={() => {
              if (hasPrev && sourcesList[currentIndex - 1]) {
                // Navigate to previous source
              }
            }}
            className="p-1 rounded hover:bg-academic-200 dark:hover:bg-academic-700 disabled:opacity-30 text-academic-600 dark:text-academic-300"
            title="Previous Source"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-[11px] font-mono text-academic-500">
            {currentIndex >= 0 ? currentIndex + 1 : 1}/{sourcesList.length || 1}
          </span>
          <button
            disabled={!hasNext}
            onClick={() => {
              if (hasNext && sourcesList[currentIndex + 1]) {
                // Navigate to next source
              }
            }}
            className="p-1 rounded hover:bg-academic-200 dark:hover:bg-academic-700 disabled:opacity-30 text-academic-600 dark:text-academic-300"
            title="Next Source"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Content Excerpt Viewer */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {/* PDF Controls */}
        <div className="flex items-center justify-between bg-academic-50 dark:bg-academic-950 p-2 rounded-xl border border-academic-200 dark:border-academic-800 text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setZoomLevel(Math.max(70, zoomLevel - 10))}
              className="p-1 rounded hover:bg-academic-200 dark:hover:bg-academic-800 text-academic-600 dark:text-academic-300"
              title="Zoom out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="font-mono text-[11px] text-academic-600 dark:text-academic-400">{zoomLevel}%</span>
            <button
              onClick={() => setZoomLevel(Math.min(150, zoomLevel + 10))}
              className="p-1 rounded hover:bg-academic-200 dark:hover:bg-academic-800 text-academic-600 dark:text-academic-300"
              title="Zoom in"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-academic-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Find in page..."
              className="pl-7 pr-2 py-1 bg-white dark:bg-academic-900 border border-academic-200 dark:border-academic-700 rounded-lg text-xs w-36 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>
        </div>

        {/* Grounded Citation Passage Card */}
        <div className="p-4 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              Grounded Citation Passage
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-200/60 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 font-semibold">
              Page {source.page}
            </span>
          </div>

          <p className="text-sm font-serif leading-relaxed text-amber-950 dark:text-amber-100 italic bg-amber-100/50 dark:bg-amber-900/30 p-3 rounded-lg border-l-4 border-amber-500">
            "{source.excerpt}"
          </p>
        </div>

        {/* Simulated Document Context View */}
        <div className="border border-academic-200 dark:border-academic-800 rounded-xl p-4 bg-white dark:bg-academic-950 text-academic-800 dark:text-academic-200 font-serif text-xs leading-relaxed space-y-3 shadow-inner">
          <div className="text-center font-sans font-bold text-sm text-academic-900 dark:text-white border-b border-academic-100 dark:border-academic-800 pb-2">
            {source.paperTitle} — Page {source.page}
          </div>

          <h4 className="font-sans font-semibold text-xs text-brand-600 dark:text-brand-400 mt-2">
            {source.section}
          </h4>

          <p className="text-academic-500 dark:text-academic-400">
            [...preceding passage on page {source.page}...]
          </p>

          <p className="bg-brand-50 dark:bg-brand-950/60 border-l-2 border-brand-500 p-2 rounded text-academic-900 dark:text-white font-medium">
            {source.excerpt}
          </p>

          <p className="text-academic-500 dark:text-academic-400">
            [...subsequent mathematical derivation and experimental protocol continues...]
          </p>
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="p-4 border-t border-academic-200 dark:border-academic-800 bg-academic-50/80 dark:bg-academic-950/80 flex flex-col gap-2">
        <button
          onClick={() => onAskAboutExcerpt && onAskAboutExcerpt(`Explain this passage from page ${source.page}: "${source.excerpt}"`)}
          className="w-full py-2 px-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-soft-sm transition-colors"
        >
          <MessageSquare className="w-4 h-4" />
          <span>Ask AI about this passage</span>
        </button>

        <button
          onClick={() => onOpenPdfReader && onOpenPdfReader(source.paperId)}
          className="w-full py-2 px-3 rounded-xl bg-academic-100 dark:bg-academic-800 hover:bg-academic-200 dark:hover:bg-academic-700 text-academic-800 dark:text-academic-200 text-xs font-medium flex items-center justify-center gap-2 transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
          <span>Open Full PDF Reader</span>
        </button>
      </div>
    </div>
  );
};
