import React, { useState } from 'react';
import { Conversation, Paper, Collection, ActiveTab } from '../types';
import { Plus, Search, MessageSquare, FileText, Folder, Settings, Sparkles, MoreHorizontal, Edit2, Archive, Trash2, PanelLeftClose, ChevronRight, UserCheck } from 'lucide-react';

interface SidebarProps {
  conversations: Conversation[];
  activeConversationId?: string;
  onSelectConversation: (id: string) => void;
  onNewChat: () => void;
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onOpenSearch: () => void;
  onOpenSettings: () => void;
  onRenameConversation: (id: string) => void;
  onArchiveConversation: (id: string) => void;
  onDeleteConversation: (id: string) => void;
  papersCount: number;
  collectionsCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewChat,
  activeTab,
  onTabChange,
  isCollapsed,
  onToggleCollapse,
  onOpenSearch,
  onOpenSettings,
  onRenameConversation,
  onArchiveConversation,
  onDeleteConversation,
  papersCount,
  collectionsCount,
}) => {
  const [hoveredConvId, setHoveredConvId] = useState<string | null>(null);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  if (isCollapsed) {
    return (
      <aside className="w-16 h-full bg-[#f1f3f5] dark:bg-academic-900 border-r border-academic-200 dark:border-academic-800 flex flex-col items-center py-4 justify-between transition-all duration-300 z-20">
        <div className="flex flex-col items-center gap-4">
          <button
            onClick={onToggleCollapse}
            className="p-2 rounded-xl hover:bg-academic-200 dark:hover:bg-academic-800 text-academic-700 dark:text-academic-300"
            title="Expand Sidebar"
          >
            <Sparkles className="w-5 h-5 text-brand-600" />
          </button>

          <button
            onClick={onNewChat}
            className="w-10 h-10 rounded-xl bg-brand-600 hover:bg-brand-700 text-white flex items-center justify-center shadow-soft-sm"
            title="New Chat"
          >
            <Plus className="w-5 h-5" />
          </button>

          <div className="w-8 h-px bg-academic-200 dark:bg-academic-800 my-1" />

          <button
            onClick={() => onTabChange('chat')}
            className={`p-2.5 rounded-xl transition-colors ${activeTab === 'chat' ? 'bg-brand-50 dark:bg-brand-950 text-brand-600' : 'text-academic-500 hover:bg-academic-200 dark:hover:bg-academic-800'}`}
            title="Chats"
          >
            <MessageSquare className="w-5 h-5" />
          </button>

          <button
            onClick={() => onTabChange('papers')}
            className={`p-2.5 rounded-xl transition-colors ${activeTab === 'papers' ? 'bg-brand-50 dark:bg-brand-950 text-brand-600' : 'text-academic-500 hover:bg-academic-200 dark:hover:bg-academic-800'}`}
            title="My Papers"
          >
            <FileText className="w-5 h-5" />
          </button>

          <button
            onClick={() => onTabChange('collections')}
            className={`p-2.5 rounded-xl transition-colors ${activeTab === 'collections' ? 'bg-brand-50 dark:bg-brand-950 text-brand-600' : 'text-academic-500 hover:bg-academic-200 dark:hover:bg-academic-800'}`}
            title="Collections"
          >
            <Folder className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-col items-center gap-3">
          <button
            onClick={onOpenSettings}
            className="p-2.5 rounded-xl text-academic-500 hover:bg-academic-200 dark:hover:bg-academic-800"
            title="Settings"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </aside>
    );
  }

  return (
    <aside className="w-64 h-full bg-[#f1f3f5] dark:bg-academic-900 border-r border-academic-200/80 dark:border-academic-800 flex flex-col justify-between transition-all duration-300 z-20 font-sans select-none">
      {/* Top Branding & New Chat */}
      <div className="p-3.5 space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-brand-600 text-white flex items-center justify-center font-bold">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-xs font-bold text-academic-900 dark:text-white tracking-tight">
                Research Paper AI
              </h1>
              <p className="text-[10px] text-academic-500 font-medium">Research Workspace</p>
            </div>
          </div>

          <button
            onClick={onToggleCollapse}
            className="p-1 rounded-lg hover:bg-academic-200 dark:hover:bg-academic-800 text-academic-500 transition-colors"
            title="Collapse Sidebar"
          >
            <PanelLeftClose className="w-4 h-4" />
          </button>
        </div>

        {/* Primary "+ New Chat" Button */}
        <button
          onClick={onNewChat}
          className="w-full py-2.5 px-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-soft-sm transition-all duration-150"
        >
          <Plus className="w-4 h-4" />
          <span>New Chat</span>
        </button>

        {/* Quick Search trigger */}
        <button
          onClick={onOpenSearch}
          className="w-full py-2 px-3 rounded-xl bg-white/80 dark:bg-academic-950/60 border border-academic-200 dark:border-academic-800 text-left text-xs text-academic-400 hover:border-brand-400 dark:hover:border-brand-600 flex items-center justify-between transition-all shadow-soft-sm"
        >
          <div className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5" />
            <span>Search chats & papers...</span>
          </div>
          <span className="text-[10px] font-mono bg-academic-100 dark:bg-academic-800 px-1.5 py-0.5 rounded text-academic-500">
            ⌘K
          </span>
        </button>
      </div>

      {/* Main Navigation & Recent Conversations */}
      <div className="flex-1 overflow-y-auto px-3 py-1 space-y-4">
        {/* Navigation Sections */}
        <div className="space-y-0.5">
          <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-academic-400 dark:text-academic-500">
            Workspace
          </div>

          <button
            onClick={() => onTabChange('chat')}
            className={`w-full px-2.5 py-2 rounded-xl text-xs font-medium flex items-center justify-between transition-colors ${
              activeTab === 'chat'
                ? 'bg-white dark:bg-academic-800 text-brand-600 dark:text-brand-400 font-semibold shadow-soft-sm'
                : 'text-academic-700 dark:text-academic-300 hover:bg-academic-200/60 dark:hover:bg-academic-800/40'
            }`}
          >
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              <span>Research Chats</span>
            </div>
          </button>

          <button
            onClick={() => onTabChange('papers')}
            className={`w-full px-2.5 py-2 rounded-xl text-xs font-medium flex items-center justify-between transition-colors ${
              activeTab === 'papers'
                ? 'bg-white dark:bg-academic-800 text-brand-600 dark:text-brand-400 font-semibold shadow-soft-sm'
                : 'text-academic-700 dark:text-academic-300 hover:bg-academic-200/60 dark:hover:bg-academic-800/40'
            }`}
          >
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <span>My Papers</span>
            </div>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-academic-200 dark:bg-academic-700 text-academic-600 dark:text-academic-300 font-bold">
              {papersCount}
            </span>
          </button>

          <button
            onClick={() => onTabChange('collections')}
            className={`w-full px-2.5 py-2 rounded-xl text-xs font-medium flex items-center justify-between transition-colors ${
              activeTab === 'collections'
                ? 'bg-white dark:bg-academic-800 text-brand-600 dark:text-brand-400 font-semibold shadow-soft-sm'
                : 'text-academic-700 dark:text-academic-300 hover:bg-academic-200/60 dark:hover:bg-academic-800/40'
            }`}
          >
            <div className="flex items-center gap-2">
              <Folder className="w-4 h-4" />
              <span>Collections</span>
            </div>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-academic-200 dark:bg-academic-700 text-academic-600 dark:text-academic-300 font-bold">
              {collectionsCount}
            </span>
          </button>

          <button
            onClick={() => onTabChange('compare')}
            className={`w-full px-2.5 py-2 rounded-xl text-xs font-medium flex items-center justify-between transition-colors ${
              activeTab === 'compare'
                ? 'bg-white dark:bg-academic-800 text-brand-600 dark:text-brand-400 font-semibold shadow-soft-sm'
                : 'text-academic-700 dark:text-academic-300 hover:bg-academic-200/60 dark:hover:bg-academic-800/40'
            }`}
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              <span>Paper Compare</span>
            </div>
          </button>
        </div>

        {/* Recent Conversations List */}
        <div className="space-y-1 pt-2">
          <div className="px-2 text-[10px] font-bold uppercase tracking-wider text-academic-400 dark:text-academic-500">
            Recent Conversations
          </div>

          {conversations.length === 0 ? (
            <p className="px-2 text-[11px] text-academic-400 italic">No recent chats.</p>
          ) : (
            conversations.map(conv => {
              const isActive = conv.id === activeConversationId && activeTab === 'chat';
              const isHovered = hoveredConvId === conv.id;

              return (
                <div
                  key={conv.id}
                  onMouseEnter={() => setHoveredConvId(conv.id)}
                  onMouseLeave={() => { setHoveredConvId(null); if (menuOpenId === conv.id) setMenuOpenId(null); }}
                  className="relative group"
                >
                  <button
                    onClick={() => { onTabChange('chat'); onSelectConversation(conv.id); }}
                    className={`w-full px-2.5 py-2 rounded-xl text-xs flex items-center justify-between text-left transition-all ${
                      isActive
                        ? 'bg-white dark:bg-academic-800 text-brand-600 dark:text-brand-400 font-semibold shadow-soft-sm'
                        : 'text-academic-700 dark:text-academic-300 hover:bg-academic-200/60 dark:hover:bg-academic-800/40'
                    }`}
                  >
                    <span className="truncate pr-4">{conv.title}</span>
                  </button>

                  {/* Three dot menu on hover */}
                  {(isHovered || menuOpenId === conv.id) && (
                    <div className="absolute right-1 top-1/2 -translate-y-1/2">
                      <button
                        onClick={(e) => { e.stopPropagation(); setMenuOpenId(menuOpenId === conv.id ? null : conv.id); }}
                        className="p-1 rounded-lg hover:bg-academic-200 dark:hover:bg-academic-700 text-academic-500"
                      >
                        <MoreHorizontal className="w-3.5 h-3.5" />
                      </button>

                      {menuOpenId === conv.id && (
                        <div className="absolute right-0 mt-1 w-36 bg-white dark:bg-academic-900 border border-academic-200 dark:border-academic-800 rounded-xl shadow-soft-md py-1 z-30">
                          <button
                            onClick={() => { setMenuOpenId(null); onRenameConversation(conv.id); }}
                            className="w-full text-left px-3 py-1.5 text-xs text-academic-700 dark:text-academic-300 hover:bg-academic-100 flex items-center gap-2"
                          >
                            <Edit2 className="w-3 h-3" />
                            <span>Rename</span>
                          </button>
                          <button
                            onClick={() => { setMenuOpenId(null); onArchiveConversation(conv.id); }}
                            className="w-full text-left px-3 py-1.5 text-xs text-academic-700 dark:text-academic-300 hover:bg-academic-100 flex items-center gap-2"
                          >
                            <Archive className="w-3 h-3" />
                            <span>Archive</span>
                          </button>
                          <button
                            onClick={() => { setMenuOpenId(null); onDeleteConversation(conv.id); }}
                            className="w-full text-left px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-medium"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Delete</span>
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Bottom Footer Section */}
      <div className="p-3 border-t border-academic-200/80 dark:border-academic-800 space-y-2">
        <button
          onClick={onOpenSettings}
          className="w-full px-2.5 py-2 rounded-xl text-xs font-medium text-academic-700 dark:text-academic-300 hover:bg-academic-200/60 dark:hover:bg-academic-800/40 flex items-center gap-2 transition-colors"
        >
          <Settings className="w-4 h-4 text-academic-500" />
          <span>Settings & Preferences</span>
        </button>

        {/* User Profile Card */}
        <div className="p-2 rounded-xl bg-white/70 dark:bg-academic-950/60 border border-academic-200/60 dark:border-academic-800 flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold">
            AC
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-xs font-semibold text-academic-900 dark:text-white truncate">Researcher</h4>
            <p className="text-[10px] text-academic-400 truncate">Research Workspace</p>
          </div>
        </div>
      </div>
    </aside>
  );
};
