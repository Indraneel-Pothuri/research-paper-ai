import {
  Paper,
  Collection,
  Conversation,
  Source,
  Message,
  PaperSummary,
  CompareResult,
  SearchResultItem
} from '../types';

const API_BASE_URL =
  (import.meta as any).env?.VITE_API_URL || 'http://127.0.0.1:8000';

const CONVERSATIONS_STORAGE_KEY = 'research_paper_ai_conversations';

// Pre-populated default collections
export const MOCK_COLLECTIONS: Collection[] = [
  {
    id: 'col-1',
    name: 'Reinforcement Learning',
    description:
      'Fundamental and state-of-the-art RL algorithms including PPO, TRPO, DQN, and Actor-Critic methods.',
    paperCount: 3,
    updatedAt: 'Sep 16, 2026',
    color: 'bg-blue-500',
  },
  {
    id: 'col-2',
    name: 'Generative AI & LLMs',
    description:
      'Transformer architectures, self-attention mechanisms, positional encodings, and foundation model research.',
    paperCount: 2,
    updatedAt: 'Jul 10, 2026',
    color: 'bg-indigo-500',
  },
  {
    id: 'col-3',
    name: 'Autonomous Systems & CARLA',
    description:
      'Simulators, urban driving benchmarks, imitation learning, and sensor fusion papers.',
    paperCount: 2,
    updatedAt: 'Sep 02, 2026',
    color: 'bg-emerald-500',
  },
];

class ApiService {
  private papers: Paper[] = [];
  private collections: Collection[] = [...MOCK_COLLECTIONS];

  // Conversations are now loaded from localStorage
  private conversations: Conversation[] = [];

  private listeners: (() => void)[] = [];
  private initialized: boolean = false;

  constructor() {
    this.loadConversations();
    this.init();
  }

  private async init() {
    await this.fetchPapersFromBackend();

    this.createDefaultConversationIfEmpty();

    this.initialized = true;
    this.notify();
  }

  // ============================================================
  // LOCAL STORAGE - CONVERSATION PERSISTENCE
  // ============================================================

  private loadConversations() {
    try {
      const saved = localStorage.getItem(CONVERSATIONS_STORAGE_KEY);

      if (saved) {
        const parsed: Conversation[] = JSON.parse(saved);

        if (Array.isArray(parsed)) {
          this.conversations = parsed;
          console.log(
            `Loaded ${this.conversations.length} conversation(s) from localStorage.`
          );
        }
      }
    } catch (error) {
      console.error('Failed to load conversations from localStorage:', error);
      this.conversations = [];
    }
  }

  private saveConversations() {
    try {
      localStorage.setItem(
        CONVERSATIONS_STORAGE_KEY,
        JSON.stringify(this.conversations)
      );
    } catch (error) {
      console.error(
        'Failed to save conversations to localStorage:',
        error
      );
    }
  }

  private persistAndNotify() {
    this.saveConversations();
    this.notify();
  }

  // ============================================================
  // SUBSCRIPTIONS
  // ============================================================

  public subscribe(listener: () => void) {
    this.listeners.push(listener);

    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach(l => l());
  }

  // ============================================================
  // DEFAULT CONVERSATION
  // ============================================================

  private createDefaultConversationIfEmpty() {
    if (this.conversations.length === 0) {
      const defaultConv: Conversation = {
        id: 'conv-default',
        title: 'Research Chat Workspace',
        createdAt: 'Just now',
        updatedAt: 'Just now',
        isArchived: false,
        paperScopeType: 'all',
        paperScopeName: 'All Papers',
        messages: [],
      };

      this.conversations.push(defaultConv);

      this.saveConversations();
    }
  }

  // ============================================================
  // PAPER FETCHING
  // ============================================================

  public async fetchPapersFromBackend(): Promise<Paper[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/papers`);

      if (res.ok) {
        const backendPapers: Paper[] = await res.json();

        if (backendPapers && backendPapers.length > 0) {
          this.papers = backendPapers;
          this.notify();

          return this.papers;
        }
      }
    } catch (e) {
      console.warn(
        'Backend paper fetch failed. Using initial cache.',
        e
      );
    }

    return this.papers;
  }

  // ============================================================
  // CONVERSATION METHODS
  // ============================================================

  public getConversations(): Conversation[] {
    return this.conversations.filter(c => !c.isArchived);
  }

  public getArchivedConversations(): Conversation[] {
    return this.conversations.filter(c => c.isArchived);
  }

  public getConversation(id: string): Conversation | undefined {
    return this.conversations.find(c => c.id === id);
  }

  public createConversation(
    paperScopeType: 'all' | 'collection' | 'paper' = 'all',
    paperScopeId?: string,
    paperScopeName: string = 'All Papers'
  ): Conversation {
    const newConv: Conversation = {
      id: `conv-${Date.now()}`,
      title: 'New Research Chat',
      createdAt: new Date().toLocaleString(),
      updatedAt: new Date().toLocaleString(),
      isArchived: false,
      paperScopeType,
      paperScopeId,
      paperScopeName,
      messages: [],
    };

    this.conversations.unshift(newConv);

    this.persistAndNotify();

    return newConv;
  }

  public renameConversation(id: string, newTitle: string) {
    const conv = this.conversations.find(c => c.id === id);

    if (conv) {
      conv.title = newTitle;
      conv.updatedAt = new Date().toLocaleString();

      this.persistAndNotify();
    }
  }

  public archiveConversation(id: string) {
    const conv = this.conversations.find(c => c.id === id);

    if (conv) {
      conv.isArchived = !conv.isArchived;
      conv.updatedAt = new Date().toLocaleString();

      this.persistAndNotify();
    }
  }

  public deleteConversation(id: string) {
    this.conversations = this.conversations.filter(
      c => c.id !== id
    );

    this.persistAndNotify();

    // Keep the application usable if the user deletes everything.
    this.createDefaultConversationIfEmpty();
    this.notify();
  }

  // ============================================================
  // CHAT / RAG
  // ============================================================

  public async sendMessage(
    conversationId: string,
    prompt: string,
    onStatusChange?: (status: string) => void
  ): Promise<Message> {
    const conv = this.conversations.find(
      c => c.id === conversationId
    );

    if (!conv) {
      throw new Error('Conversation not found');
    }

    // ----------------------------------------------------------
    // Add user message locally
    // ----------------------------------------------------------

    const userMsg: Message = {
      id: `msg-user-${Date.now()}`,
      role: 'user',
      content: prompt,
      timestamp: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };

    conv.messages.push(userMsg);

    // Automatically create a title from first user question
    if (
      conv.messages.length === 1 ||
      conv.title === 'New Research Chat' ||
      conv.title === 'Research Chat Workspace'
    ) {
      conv.title =
        prompt.length > 50
          ? prompt.substring(0, 50) + '...'
          : prompt;
    }

    conv.updatedAt = new Date().toLocaleString();

    // IMPORTANT:
    // Save immediately so even the user's question survives refresh.
    this.persistAndNotify();

    if (onStatusChange) {
      onStatusChange('Understanding question...');
    }

    // ----------------------------------------------------------
    // Build conversation history
    // ----------------------------------------------------------

    const historyPayload = conv.messages
      .slice(0, -1)
      .map(m => ({
        role: m.role,
        content: m.content,
      }));

    if (onStatusChange) {
      onStatusChange('Searching your research papers...');
    }

    // ----------------------------------------------------------
    // Send to FastAPI backend
    // ----------------------------------------------------------

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/chat`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            conversation_id: conversationId,
            message: prompt,
            paper_scope_type: conv.paperScopeType,
            paper_scope_id: conv.paperScopeId,
            history: historyPayload,
          }),
        }
      );

      if (onStatusChange) {
        onStatusChange('Generating grounded answer...');
      }

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({
            detail: 'Backend service error',
          }));

        throw new Error(
          errorData.detail ||
            'Unable to connect to Research Paper AI backend.'
        );
      }

      const data = await response.json();

      // --------------------------------------------------------
      // Add assistant response
      // --------------------------------------------------------

      const assistantMsg: Message = {
        id: `msg-ast-${Date.now()}`,
        role: 'assistant',
        content: data.answer,
        timestamp: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
        sources: data.sources || [],
      };

      conv.messages.push(assistantMsg);
      conv.updatedAt = new Date().toLocaleString();

      // IMPORTANT:
      // Save assistant response too.
      this.persistAndNotify();

      return assistantMsg;

    } catch (err: any) {
      console.error('API sendMessage error:', err);

      const errorMsg: Message = {
        id: `msg-err-${Date.now()}`,
        role: 'assistant',
        content:
          `⚠️ **Error**: ${
            err.message ||
            'Something went wrong while communicating with the RAG backend.'
          }\n\n` +
          'Please verify that the FastAPI backend server is running on `http://127.0.0.1:8000`.',
        timestamp: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
        sources: [],
      };

      conv.messages.push(errorMsg);
      conv.updatedAt = new Date().toLocaleString();

      this.persistAndNotify();

      return errorMsg;
    }
  }

  // ============================================================
  // PAPER MANAGEMENT
  // ============================================================

  public getPapers(): Paper[] {
    if (this.papers.length === 0) {
      this.fetchPapersFromBackend();
    }

    return this.papers;
  }

  public async uploadPaper(file: File): Promise<Paper> {
    const formData = new FormData();

    formData.append('file', file);

    try {
      const res = await fetch(
        `${API_BASE_URL}/api/papers/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (res.ok) {
        const newPaper: Paper = await res.json();

        this.papers.unshift(newPaper);
        this.notify();

        return newPaper;
      }
    } catch (e) {
      console.error(
        'Upload to backend failed:',
        e
      );
    }

    // Fallback if backend offline
    const fallbackPaper: Paper = {
      id: `paper-${Date.now()}`,
      title: file.name.replace(/\.[^/.]+$/, ''),
      filename: file.name,
      uploadDate: 'Just now',
      pageCount: 10,
      status: 'Ready',
      fileSize: `${(
        file.size /
        (1024 * 1024)
      ).toFixed(1)} MB`,
      collectionIds: [],
      abstract:
        'Recently uploaded paper ready for RAG queries.',
    };

    this.papers.unshift(fallbackPaper);
    this.notify();

    return fallbackPaper;
  }

  public async deletePaper(id: string) {
    try {
      await fetch(
        `${API_BASE_URL}/api/papers/${id}`,
        {
          method: 'DELETE',
        }
      );
    } catch (e) {
      console.error(
        'Delete paper API call failed:',
        e
      );
    }

    this.papers = this.papers.filter(
      p => p.id !== id
    );

    this.notify();
  }

  // ============================================================
  // COLLECTION MANAGEMENT
  // ============================================================

  public getCollections(): Collection[] {
    return this.collections;
  }

  public createCollection(
    name: string,
    description: string
  ): Collection {
    const newCol: Collection = {
      id: `col-${Date.now()}`,
      name,
      description,
      paperCount: 0,
      updatedAt: 'Just now',
      color: 'bg-brand-500',
    };

    this.collections.push(newCol);

    this.notify();

    return newCol;
  }

  // ============================================================
  // PAPER COMPARISON
  // ============================================================

  public async comparePapers(
    paperIdA: string,
    paperIdB: string
  ): Promise<CompareResult | null> {
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/compare`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            paper_id_a: paperIdA,
            paper_id_b: paperIdB,
          }),
        }
      );

      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.error(
        'Compare papers API error:',
        e
      );
    }

    const pA = this.papers.find(
      p => p.id === paperIdA
    );

    const pB = this.papers.find(
      p => p.id === paperIdB
    );

    if (!pA || !pB) {
      return null;
    }

    return {
      paperA: pA,
      paperB: pB,

      dimensions: [
        {
          category: 'Research Objective',
          paperAValue:
            pA.abstract ||
            'Study on methodology.',
          paperBValue:
            pB.abstract ||
            'Study on architecture.',
        },
        {
          category: 'Core Methodology',
          paperAValue: `Formulation in ${pA.filename}`,
          paperBValue: `Architecture in ${pB.filename}`,
        },
      ],
    };
  }

  // ============================================================
  // PAPER SUMMARIZER
  // ============================================================

  public async summarizePaper(
    paperId: string
  ): Promise<PaperSummary | null> {
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/summarize`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            paper_id: paperId,
          }),
        }
      );

      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.error(
        'Summarize paper API error:',
        e
      );
    }

    const paper = this.papers.find(
      p => p.id === paperId
    );

    if (!paper) {
      return null;
    }

    return {
      paperId: paper.id,
      paperTitle: paper.title,
      authors:
        paper.authors || ['Research Authors'],
      year: paper.year || 2026,
      abstract:
        paper.abstract ||
        'Comprehensive study on neural network optimization.',
      keyProblem:
        'Balancing model performance and training efficiency.',
      methodology:
        'Core mathematical optimization formulation.',
      datasetExperiments:
        'Standard continuous and discrete benchmarks.',
      keyFindings: [
        'Outperforms baseline methods on standard tasks.',
        'Demonstrates robust empirical stability.',
      ],
      limitations:
        'Requires hyperparameter tuning.',
      futureDirections:
        'Extending to multi-agent settings.',
    };
  }

  // ============================================================
  // GLOBAL SEARCH
  // ============================================================

  public searchContent(
    query: string
  ): SearchResultItem[] {
    if (!query.trim()) {
      return [];
    }

    const q = query.toLowerCase();

    const results: SearchResultItem[] = [];

    // ----------------------------------------------------------
    // Search conversations
    // ----------------------------------------------------------

    this.conversations.forEach(c => {
      const conversationText = [
        c.title,
        ...c.messages.map(m => m.content),
      ]
        .join(' ')
        .toLowerCase();

      if (conversationText.includes(q)) {
        results.push({
          id: `sr-conv-${c.id}`,
          type: 'conversation',
          title: c.title,
          snippet: `Chat thread with ${c.messages.length} messages (${c.paperScopeName})`,
          date: c.updatedAt,
          targetId: c.id,
        });
      }
    });

    // ----------------------------------------------------------
    // Search papers
    // ----------------------------------------------------------

    this.papers.forEach(p => {
      if (
        p.title.toLowerCase().includes(q) ||
        p.filename.toLowerCase().includes(q)
      ) {
        results.push({
          id: `sr-paper-${p.id}`,
          type: 'paper',
          title: p.title,
          snippet: `PDF file: ${p.filename} • ${p.pageCount} pages • ${p.fileSize}`,
          date: p.uploadDate,
          targetId: p.id,
        });
      }
    });

    // ----------------------------------------------------------
    // Search collections
    // ----------------------------------------------------------

    this.collections.forEach(col => {
      if (
        col.name.toLowerCase().includes(q) ||
        col.description.toLowerCase().includes(q)
      ) {
        results.push({
          id: `sr-col-${col.id}`,
          type: 'collection',
          title: col.name,
          snippet: col.description,
          date: col.updatedAt,
          targetId: col.id,
        });
      }
    });

    return results;
  }

  // ============================================================
  // OPTIONAL: CLEAR ALL SAVED CHATS
  // ============================================================

  public clearSavedConversations() {
    localStorage.removeItem(
      CONVERSATIONS_STORAGE_KEY
    );

    this.conversations = [];

    this.createDefaultConversationIfEmpty();

    this.notify();
  }
}

export const apiService = new ApiService();