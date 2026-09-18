import React, { useState } from 'react';
import { Paper, Collection } from '../../types';
import { FileText, Upload, Grid, List, Search, Plus, MoreVertical, MessageSquare, BookOpen, Edit2, Trash2, Layers, Sparkles, ShieldCheck } from 'lucide-react';

interface PaperLibraryProps {
  papers: Paper[];
  collections: Collection[];
  onOpenUploadModal: () => void;
  onStartPaperChat: (paper: Paper) => void;
  onOpenPdfReader: (paper: Paper) => void;
  onSummarizePaper: (paper: Paper) => void;
  onDeletePaper: (paperId: string) => void;
}

export const PaperLibrary: React.FC<PaperLibraryProps> = ({
  papers,
  collections,
  onOpenUploadModal,
  onStartPaperChat,
  onOpenPdfReader,
  onSummarizePaper,
  onDeletePaper,
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCollectionFilter, setSelectedCollectionFilter] = useState<string>('all');
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  // Filter papers
  const filteredPapers = papers.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.filename.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCollection = selectedCollectionFilter === 'all' || p.collectionIds.includes(selectedCollectionFilter);
    return matchesSearch && matchesCollection;
  });

  return (
    <div className="flex-1 p-6 max-w-7xl mx-auto w-full space-y-6">
      {/* Top Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-academic-200 dark:border-academic-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-academic-900 dark:text-white tracking-tight">My Papers</h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800">
              {papers.length} PDFs
            </span>
          </div>
          <p className="text-xs text-academic-500 dark:text-academic-400 mt-1">
            Manage your uploaded research papers, view extraction status, and launch grounded RAG conversations.
          </p>
        </div>

        <button
          onClick={onOpenUploadModal}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-soft-sm transition-all duration-150"
        >
          <Upload className="w-4 h-4" />
          <span>Upload Paper</span>
        </button>
      </div>

      {/* Filter & View Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-academic-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search papers by title or filename..."
            className="w-full pl-9 pr-3 py-2 bg-white dark:bg-academic-900 border border-academic-200 dark:border-academic-800 rounded-xl text-xs text-academic-900 dark:text-white placeholder-academic-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          {/* Collection Filter Dropdown */}
          <select
            value={selectedCollectionFilter}
            onChange={(e) => setSelectedCollectionFilter(e.target.value)}
            className="px-3 py-1.5 bg-white dark:bg-academic-900 border border-academic-200 dark:border-academic-800 rounded-xl text-xs font-medium text-academic-700 dark:text-academic-300 focus:outline-none"
          >
            <option value="all">All Collections</option>
            {collections.map(col => (
              <option key={col.id} value={col.id}>{col.name}</option>
            ))}
          </select>

          {/* Grid vs List Toggle */}
          <div className="flex items-center bg-white dark:bg-academic-900 border border-academic-200 dark:border-academic-800 rounded-xl p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-xs font-medium transition-colors ${
                viewMode === 'grid' ? 'bg-academic-100 dark:bg-academic-800 text-brand-600 dark:text-brand-400' : 'text-academic-400 hover:text-academic-600'
              }`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg text-xs font-medium transition-colors ${
                viewMode === 'list' ? 'bg-academic-100 dark:bg-academic-800 text-brand-600 dark:text-brand-400' : 'text-academic-400 hover:text-academic-600'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Empty State if no papers */}
      {filteredPapers.length === 0 && (
        <div className="py-16 text-center bg-white dark:bg-academic-900 border border-academic-200 dark:border-academic-800 rounded-2xl p-8">
          <FileText className="w-12 h-12 text-academic-300 dark:text-academic-700 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-academic-800 dark:text-academic-200">No papers found</h3>
          <p className="text-xs text-academic-500 mt-1 max-w-sm mx-auto">
            Upload your first research PDF to start asking grounded questions and receiving cited answers.
          </p>
          <button
            onClick={onOpenUploadModal}
            className="mt-4 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-semibold transition-colors"
          >
            Upload Research Paper
          </button>
        </div>
      )}

      {/* Grid View */}
      {viewMode === 'grid' && filteredPapers.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPapers.map(paper => (
            <div
              key={paper.id}
              className="group relative bg-white dark:bg-academic-900 border border-academic-200/80 dark:border-academic-800 rounded-2xl p-4 hover:border-brand-400 dark:hover:border-brand-600 hover:shadow-soft-md transition-all duration-200 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>

                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                    paper.status === 'Ready'
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                      : paper.status === 'Processing'
                      ? 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse'
                      : 'bg-rose-50 text-rose-700 border-rose-200'
                  }`}>
                    {paper.status}
                  </span>
                </div>

                <h3 className="text-sm font-semibold text-academic-900 dark:text-white line-clamp-2 mb-1 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                  {paper.title}
                </h3>

                <p className="text-[11px] text-academic-400 dark:text-academic-500 font-mono mb-3 truncate">
                  {paper.filename}
                </p>

                <div className="flex flex-wrap items-center gap-2 text-[11px] text-academic-500 dark:text-academic-400">
                  <span>{paper.pageCount} pages</span>
                  <span>•</span>
                  <span>{paper.fileSize}</span>
                  <span>•</span>
                  <span>{paper.uploadDate}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-3 border-t border-academic-100 dark:border-academic-800/60 flex items-center justify-between gap-2">
                <button
                  onClick={() => onStartPaperChat(paper)}
                  className="flex-1 py-1.5 px-2 rounded-lg bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300 hover:bg-brand-100 dark:hover:bg-brand-900 text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Ask AI</span>
                </button>

                <button
                  onClick={() => onOpenPdfReader(paper)}
                  className="py-1.5 px-2.5 rounded-lg bg-academic-100 dark:bg-academic-800 hover:bg-academic-200 text-academic-700 dark:text-academic-300 text-xs font-medium transition-colors"
                  title="Open PDF Reader"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => onSummarizePaper(paper)}
                  className="py-1.5 px-2.5 rounded-lg bg-academic-100 dark:bg-academic-800 hover:bg-academic-200 text-academic-700 dark:text-academic-300 text-xs font-medium transition-colors"
                  title="Summarize Paper"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => onDeletePaper(paper.id)}
                  className="py-1.5 px-2.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-500 text-xs transition-colors"
                  title="Delete Paper"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && filteredPapers.length > 0 && (
        <div className="bg-white dark:bg-academic-900 border border-academic-200 dark:border-academic-800 rounded-2xl overflow-hidden divide-y divide-academic-100 dark:divide-academic-800">
          {filteredPapers.map(paper => (
            <div key={paper.id} className="p-4 flex items-center justify-between gap-4 hover:bg-academic-50/60 dark:hover:bg-academic-800/40 transition-colors">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="w-9 h-9 rounded-xl bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-semibold text-academic-900 dark:text-white truncate">{paper.title}</h4>
                  <p className="text-[11px] text-academic-400 font-mono truncate">{paper.filename} • {paper.pageCount} pages • {paper.fileSize}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {paper.status}
                </span>

                <button
                  onClick={() => onStartPaperChat(paper)}
                  className="px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold flex items-center gap-1"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Ask AI</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
