import React, { useState, useEffect } from 'react';
import { Conversation, Paper, Collection, Source, ActiveTab, SearchResultItem, PaperSummary } from '../types';
import { apiService } from '../services/api';
import { Sidebar } from './Sidebar';
import { ChatHeader } from './chat/ChatHeader';
import { NewChatState } from './chat/NewChatState';
import { UserMessage } from './chat/UserMessage';
import { AssistantMessage } from './chat/AssistantMessage';
import { ChatInput } from './chat/ChatInput';
import { SourceViewerPanel } from './pdf/SourceViewerPanel';
import { PdfSplitView } from './pdf/PdfSplitView';
import { PaperLibrary } from './papers/PaperLibrary';
import { UploadModal } from './papers/UploadModal';
import { CollectionsView } from './collections/CollectionsView';
import { PaperCompareView } from './compare/PaperCompareView';
import { PaperSummaryModal } from './summarize/PaperSummaryModal';
import { SettingsModal } from './settings/SettingsModal';
import { SearchModal } from './modals/SearchModal';
import { ShareModal } from './modals/ShareModal';
import { DeleteDialog } from './modals/DeleteDialog';

export const AppShell: React.FC = () => {
  // State management
  const [conversations, setConversations] = useState<Conversation[]>(apiService.getConversations());
  const [papers, setPapers] = useState<Paper[]>(apiService.getPapers());
  const [collections, setCollections] = useState<Collection[]>(apiService.getCollections());

  const [activeConversationId, setActiveConversationId] = useState<string>(conversations[0]?.id || '');
  const [activeTab, setActiveTab] = useState<ActiveTab>('chat');

  // RAG Context Scope Selector
  const [selectedScope, setSelectedScope] = useState<{ type: 'all' | 'collection' | 'paper'; id?: string; name: string }>({
    type: 'all',
    name: 'All Papers',
  });

  // UI Panels & Split Reader
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [selectedSource, setSelectedSource] = useState<Source | null>(null);
  const [isPdfSplitOpen, setIsPdfSplitOpen] = useState(false);
  const [pdfSplitPaperId, setPdfSplitPaperId] = useState<string | undefined>(papers[0]?.id);

  // Modals
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingConvId, setDeletingConvId] = useState<string | null>(null);
  const [summarizePaperId, setSummarizePaperId] = useState<string | null>(null);
  const [activeSummary, setActiveSummary] = useState<PaperSummary | null>(null);

  useEffect(() => {
    if (summarizePaperId) {
      apiService.summarizePaper(summarizePaperId).then(s => setActiveSummary(s));
    } else {
      setActiveSummary(null);
    }
  }, [summarizePaperId]);

  // Streaming / Loading
  const [isGenerating, setIsGenerating] = useState(false);
  const [statusText, setStatusText] = useState('');

  // Dark Mode State
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const unsubscribe = apiService.subscribe(() => {
      setConversations(apiService.getConversations());
      setPapers(apiService.getPapers());
      setCollections(apiService.getCollections());
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const activeConv = conversations.find(c => c.id === activeConversationId);
  const currentPaperForPdf = papers.find(p => p.id === pdfSplitPaperId) || papers[0];

  // Actions
  const handleNewChat = () => {
    const newConv = apiService.createConversation(selectedScope.type, selectedScope.id, selectedScope.name);
    setActiveConversationId(newConv.id);
    setActiveTab('chat');
  };

  const handleSendMessage = async (promptText: string) => {
    let targetConvId = activeConversationId;

    if (!targetConvId || !apiService.getConversation(targetConvId)) {
      const newConv = apiService.createConversation(selectedScope.type, selectedScope.id, selectedScope.name);
      targetConvId = newConv.id;
      setActiveConversationId(newConv.id);
    }

    setIsGenerating(true);
    setStatusText('Researching your papers...');

    try {
      await apiService.sendMessage(targetConvId, promptText, (status) => setStatusText(status));
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
      setStatusText('');
    }
  };

  const handleSelectSearchResult = (result: SearchResultItem) => {
    if (result.type === 'conversation') {
      setActiveConversationId(result.targetId);
      setActiveTab('chat');
    } else if (result.type === 'paper') {
      setPdfSplitPaperId(result.targetId);
      setIsPdfSplitOpen(true);
      setActiveTab('chat');
    } else if (result.type === 'collection') {
      setActiveTab('collections');
    }
  };

  return (
    <div className="h-screen w-screen flex bg-[#f8f9fa] dark:bg-academic-950 text-academic-900 dark:text-academic-100 overflow-hidden font-sans">
      {/* Left Sidebar Shell */}
      <Sidebar
        conversations={conversations}
        activeConversationId={activeConversationId}
        onSelectConversation={(id) => setActiveConversationId(id)}
        onNewChat={handleNewChat}
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onRenameConversation={(id) => {
          const title = prompt('Enter new conversation title:');
          if (title) apiService.renameConversation(id, title);
        }}
        onArchiveConversation={(id) => apiService.archiveConversation(id)}
        onDeleteConversation={(id) => {
          setDeletingConvId(id);
          setIsDeleteOpen(true);
        }}
        papersCount={papers.length}
        collectionsCount={collections.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 h-full relative">
        {/* Workspace router views */}
        {activeTab === 'chat' && (
          <div className="flex-1 flex flex-col h-full min-w-0">
            {/* Header */}
            <ChatHeader
              conversation={activeConv}
              onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              onShare={() => setIsShareOpen(true)}
              onRename={() => {
                if (activeConv) {
                  const title = prompt('Rename Chat:', activeConv.title);
                  if (title) apiService.renameConversation(activeConv.id, title);
                }
              }}
              onArchive={() => activeConv && apiService.archiveConversation(activeConv.id)}
              onDelete={() => {
                if (activeConv) {
                  setDeletingConvId(activeConv.id);
                  setIsDeleteOpen(true);
                }
              }}
              onTogglePdfSplitView={() => setIsPdfSplitOpen(!isPdfSplitOpen)}
              isPdfSplitOpen={isPdfSplitOpen}
              papers={papers}
              collections={collections}
              selectedScope={selectedScope}
              onScopeChange={setSelectedScope}
            />

            {/* Chat Body & Optional PDF Reader Split */}
            <div className="flex-1 flex min-h-0 overflow-hidden relative">
              {/* Optional PDF Reader Split Panel */}
              {isPdfSplitOpen && (
                <div className="w-1/2 h-full hidden md:block border-r border-academic-200 dark:border-academic-800">
                  <PdfSplitView
                    paper={currentPaperForPdf}
                    onClose={() => setIsPdfSplitOpen(false)}
                    onAskAboutText={(text) => handleSendMessage(text)}
                  />
                </div>
              )}

              {/* Chat Thread */}
              <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
                {!activeConv || activeConv.messages.length === 0 ? (
                  <NewChatState
                    onSelectSuggestion={(prompt) => handleSendMessage(prompt)}
                    collections={collections}
                    papers={papers}
                    selectedScope={selectedScope}
                    onScopeChange={setSelectedScope}
                  />
                ) : (
                  <div className="flex-1 overflow-y-auto divide-y divide-academic-100/40 dark:divide-academic-800/30">
                    {activeConv.messages.map(msg => (
                      msg.role === 'user' ? (
                        <UserMessage key={msg.id} message={msg} />
                      ) : (
                        <AssistantMessage
                          key={msg.id}
                          message={msg}
                          onSelectSource={(source) => setSelectedSource(source)}
                        />
                      )
                    ))}
                  </div>
                )}

                {/* Anchored Chat Input */}
                <ChatInput
                  onSendMessage={handleSendMessage}
                  isLoading={isGenerating}
                  statusText={statusText}
                  onStopGeneration={() => setIsGenerating(false)}
                  onOpenUploadModal={() => setIsUploadOpen(true)}
                />
              </div>
            </div>
          </div>
        )}

        {/* Paper Library View */}
        {activeTab === 'papers' && (
          <div className="flex-1 overflow-y-auto">
            <PaperLibrary
              papers={papers}
              collections={collections}
              onOpenUploadModal={() => setIsUploadOpen(true)}
              onStartPaperChat={(paper) => {
                setSelectedScope({ type: 'paper', id: paper.id, name: paper.filename });
                handleNewChat();
              }}
              onOpenPdfReader={(paper) => {
                setPdfSplitPaperId(paper.id);
                setIsPdfSplitOpen(true);
                setActiveTab('chat');
              }}
              onSummarizePaper={(paper) => setSummarizePaperId(paper.id)}
              onDeletePaper={(id) => apiService.deletePaper(id)}
            />
          </div>
        )}

        {/* Collections View */}
        {activeTab === 'collections' && (
          <div className="flex-1 overflow-y-auto">
            <CollectionsView
              collections={collections}
              papers={papers}
              onCreateCollection={(name, desc) => apiService.createCollection(name, desc)}
              onStartCollectionChat={(col) => {
                setSelectedScope({ type: 'collection', id: col.id, name: col.name });
                handleNewChat();
              }}
            />
          </div>
        )}

        {/* Paper Compare View */}
        {activeTab === 'compare' && (
          <div className="flex-1 overflow-y-auto">
            <PaperCompareView papers={papers} />
          </div>
        )}
      </main>

      {/* Slide-over Source Viewer Panel */}
      <SourceViewerPanel
        source={selectedSource}
        sourcesList={activeConv?.messages.flatMap(m => m.sources || []) || []}
        onClose={() => setSelectedSource(null)}
        onAskAboutExcerpt={(prompt) => {
          setSelectedSource(null);
          handleSendMessage(prompt);
        }}
        onOpenPdfReader={(paperId) => {
          setSelectedSource(null);
          setPdfSplitPaperId(paperId);
          setIsPdfSplitOpen(true);
          setActiveTab('chat');
        }}
      />

      {/* Structured Summary Modal */}
      <PaperSummaryModal
        summary={activeSummary}
        onClose={() => setSummarizePaperId(null)}
        onAskAboutPaper={(title) => {
          setSummarizePaperId(null);
          handleSendMessage(`Explain the methodology of ${title}`);
        }}
      />

      {/* Modals */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUploadSuccess={(file) => apiService.uploadPaper(file)}
      />

      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectResult={handleSelectSearchResult}
      />

      <ShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        conversationTitle={activeConv?.title}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        darkMode={darkMode}
        onToggleDarkMode={setDarkMode}
      />

      <DeleteDialog
        isOpen={isDeleteOpen}
        onClose={() => { setIsDeleteOpen(false); setDeletingConvId(null); }}
        onConfirmDelete={() => {
          if (deletingConvId) apiService.deleteConversation(deletingConvId);
        }}
      />
    </div>
  );
};
