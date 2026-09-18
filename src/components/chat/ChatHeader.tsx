import React, { useState } from 'react';
import { PanelLeft, Share2, MoreVertical, Edit2, Archive, Trash2, BookOpen, Layers } from 'lucide-react';
import { Conversation, Paper, Collection } from '../../types';

interface ChatHeaderProps {
  conversation?: Conversation;
  onToggleSidebar: () => void;
  onShare: () => void;
  onRename: () => void;
  onArchive: () => void;
  onDelete: () => void;
  onTogglePdfSplitView: () => void;
  isPdfSplitOpen: boolean;
  papers: Paper[];
  collections: Collection[];
  selectedScope: { type: 'all' | 'collection' | 'paper'; id?: string; name: string };
  onScopeChange: (scope: { type: 'all' | 'collection' | 'paper'; id?: string; name: string }) => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  conversation,
  onToggleSidebar,
  onShare,
  onRename,
  onArchive,
  onDelete,
  onTogglePdfSplitView,
  isPdfSplitOpen,
  papers,
  collections,
  selectedScope,
  onScopeChange,
}) => {
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  return (
    <header className="h-14 px-4 bg-white/90 dark:bg-academic-900/90 border-b border-academic-200/80 dark:border-academic-800 backdrop-blur-md flex items-center justify-between sticky top-0 z-20">
      {/* Left side: Sidebar Toggle & Title & Scope Selector */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onToggleSidebar}
          className="p-1.5 rounded-lg hover:bg-academic-100 dark:hover:bg-academic-800 text-academic-600 dark:text-academic-400 transition-colors"
          title="Toggle Sidebar"
        >
          <PanelLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 min-w-0">
          <h2 className="text-sm font-semibold text-academic-900 dark:text-white truncate max-w-[200px] sm:max-w-xs md:max-w-md">
            {conversation ? conversation.title : 'New Research Chat'}
          </h2>

          {/* Scope Selector Badge */}
          <div className="relative group">
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
              className="appearance-none bg-academic-100/80 dark:bg-academic-800 text-academic-700 dark:text-academic-300 text-[11px] font-medium rounded-full px-2.5 py-0.5 pr-5 hover:bg-academic-200 dark:hover:bg-academic-700 border border-academic-200 dark:border-academic-700 cursor-pointer focus:outline-none"
            >
              <option value="all:">Sources: All Papers ({papers.length})</option>
              {collections.map(col => (
                <option key={col.id} value={`collection:${col.id}`}>📁 {col.name}</option>
              ))}
              {papers.map(p => (
                <option key={p.id} value={`paper:${p.id}`}>📄 {p.filename}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[9px] text-academic-500">
              ▼
            </div>
          </div>
        </div>
      </div>

      {/* Right side Actions */}
      <div className="flex items-center gap-1.5">
        {/* PDF Split View Reader Button */}
        <button
          onClick={onTogglePdfSplitView}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            isPdfSplitOpen
              ? 'bg-brand-500 text-white shadow-soft-sm'
              : 'hover:bg-academic-100 dark:hover:bg-academic-800 text-academic-700 dark:text-academic-300'
          }`}
          title="Toggle PDF Document Split Viewer"
        >
          <BookOpen className="w-4 h-4" />
          <span className="hidden sm:inline">{isPdfSplitOpen ? 'Hide PDF View' : 'PDF Reader'}</span>
        </button>

        {/* Share Button */}
        <button
          onClick={onShare}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-academic-100 dark:hover:bg-academic-800 text-academic-700 dark:text-academic-300 text-xs font-medium transition-colors"
          title="Share conversation"
        >
          <Share2 className="w-4 h-4" />
          <span className="hidden sm:inline">Share</span>
        </button>

        {/* More Dropdown Menu */}
        <div className="relative">
          <button
            onClick={() => setShowMoreMenu(!showMoreMenu)}
            className="p-1.5 rounded-lg hover:bg-academic-100 dark:hover:bg-academic-800 text-academic-600 dark:text-academic-400 transition-colors"
            title="More actions"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {showMoreMenu && (
            <div className="absolute right-0 mt-1 w-44 rounded-xl bg-white dark:bg-academic-900 border border-academic-200 dark:border-academic-800 shadow-soft-lg py-1 z-30">
              <button
                onClick={() => { setShowMoreMenu(false); onRename(); }}
                className="w-full text-left px-3 py-2 text-xs text-academic-700 dark:text-academic-300 hover:bg-academic-50 dark:hover:bg-academic-800 flex items-center gap-2"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Rename Chat</span>
              </button>
              <button
                onClick={() => { setShowMoreMenu(false); onArchive(); }}
                className="w-full text-left px-3 py-2 text-xs text-academic-700 dark:text-academic-300 hover:bg-academic-50 dark:hover:bg-academic-800 flex items-center gap-2"
              >
                <Archive className="w-3.5 h-3.5" />
                <span>Archive Chat</span>
              </button>
              <div className="my-1 border-t border-academic-100 dark:border-academic-800" />
              <button
                onClick={() => { setShowMoreMenu(false); onDelete(); }}
                className="w-full text-left px-3 py-2 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2 font-medium"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Chat</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
