export interface Paper {
  id: string;
  title: string;
  filename: string;
  uploadDate: string;
  pageCount: number;
  status: 'Ready' | 'Processing' | 'Failed';
  fileSize: string;
  collectionIds: string[];
  authors?: string[];
  venue?: string;
  year?: number;
  abstract?: string;
  pdfUrl?: string;
}

export interface Collection {
  id: string;
  name: string;
  description: string;
  paperCount: number;
  updatedAt: string;
  color?: string;
}

export interface Source {
  id: string;
  paperId: string;
  paperTitle: string;
  filename: string;
  page: number;
  section: string;
  excerpt: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  sources?: Source[];
  isStreaming?: boolean;
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  isArchived: boolean;
  paperScopeType: 'all' | 'collection' | 'paper';
  paperScopeId?: string;
  paperScopeName: string;
  messages: Message[];
}

export interface PaperSummary {
  paperId: string;
  paperTitle: string;
  authors: string[];
  year: number;
  abstract: string;
  keyProblem: string;
  methodology: string;
  datasetExperiments: string;
  keyFindings: string[];
  limitations: string;
  futureDirections: string;
}

export interface ComparisonDimension {
  category: string;
  paperAValue: string;
  paperBValue: string;
}

export interface CompareResult {
  paperA: Paper;
  paperB: Paper;
  dimensions: ComparisonDimension[];
}

export interface SearchResultItem {
  id: string;
  type: 'conversation' | 'paper' | 'collection';
  title: string;
  snippet: string;
  date: string;
  targetId: string;
}

export type ActiveTab = 'chat' | 'papers' | 'collections' | 'compare' | 'settings';
