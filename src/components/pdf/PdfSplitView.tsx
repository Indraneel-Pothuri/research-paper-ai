import React, { useState } from 'react';
import { Paper } from '../../types';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Search, FileText, Sparkles, MessageSquare, Download } from 'lucide-react';

interface PdfSplitViewProps {
  paper?: Paper;
  onClose: () => void;
  onAskAboutText: (text: string) => void;
}

export const PdfSplitView: React.FC<PdfSplitViewProps> = ({ paper, onClose, onAskAboutText }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState(100);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPassage, setSelectedPassage] = useState<string | null>(null);

  const totalPages = paper ? paper.pageCount : 12;
  const paperTitle = paper ? paper.title : 'Proximal Policy Optimization Algorithms';
  const fileName = paper ? paper.filename : '2509.08221v1.pdf';

  return (
    <div className="h-full flex flex-col bg-academic-100 dark:bg-academic-950 border-r border-academic-200 dark:border-academic-800 overflow-hidden">
      {/* Reader Toolbar */}
      <div className="h-12 px-3 bg-white dark:bg-academic-900 border-b border-academic-200 dark:border-academic-800 flex items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 min-w-0">
          <FileText className="w-4 h-4 text-brand-600 dark:text-brand-400 flex-shrink-0" />
          <span className="font-semibold text-academic-900 dark:text-white truncate max-w-[150px] sm:max-w-xs">
            {fileName}
          </span>
        </div>

        {/* Page & Zoom Controls */}
        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-1 bg-academic-100 dark:bg-academic-800 rounded-lg px-2 py-0.5">
            <button
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              className="p-1 hover:text-brand-500 disabled:opacity-30"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="font-mono text-[11px] font-medium text-academic-700 dark:text-academic-300">
              {currentPage} / {totalPages}
            </span>
            <button
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              className="p-1 hover:text-brand-500 disabled:opacity-30"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-1 bg-academic-100 dark:bg-academic-800 rounded-lg px-2 py-0.5">
            <button onClick={() => setZoom(z => Math.max(75, z - 15))} className="p-1 hover:text-brand-500">
              <ZoomOut className="w-3.5 h-3.5" />
            </button>

            <button onClick={() => setZoom(z => Math.min(150, z + 15))} className="p-1 hover:text-brand-500">
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1 rounded hover:bg-academic-100 dark:hover:bg-academic-800 text-academic-500"
          title="Close Reader"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Main Document Preview Box */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex justify-center">
        <div
          className="w-full max-w-2xl bg-white dark:bg-academic-900 border border-academic-200 dark:border-academic-800 shadow-soft-lg rounded-xl p-6 sm:p-8 space-y-4 font-serif transition-transform duration-200"
          style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}
        >
          {/* Paper Title Header */}
          <div className="text-center font-sans border-b border-academic-200 dark:border-academic-800 pb-4">
            <h1 className="text-base sm:text-lg font-bold text-academic-900 dark:text-white tracking-tight">
              {paperTitle}
            </h1>
            <p className="text-xs text-academic-500 mt-1">
              John Schulman, Filip Wolski, Prafulla Dhariwal, Alec Radford, Oleg Klimov
            </p>
            <p className="text-[11px] text-academic-400 mt-0.5 font-mono">OpenAI • Page {currentPage} of {totalPages}</p>
          </div>

          {/* Section Heading */}
          <div className="font-sans font-semibold text-xs text-brand-600 dark:text-brand-400 uppercase tracking-wider">
            {currentPage === 1 ? '1. Abstract & Introduction' : currentPage === 3 ? '3. Clipped Surrogate Objective' : `Section ${currentPage}`}
          </div>

          {/* Document Content */}
          <p className="text-xs text-academic-800 dark:text-academic-200 leading-relaxed">
            We propose a new family of policy gradient methods for reinforcement learning, which alternate between sampling data through interaction with the environment, and optimizing a surrogate objective function using stochastic gradient ascent.
          </p>

          {/* Highlighted Passage Citation */}
          <div
            onClick={() => setSelectedPassage(`PPO clips the probability ratio r_t(theta) within [1-epsilon, 1+epsilon] to stabilize policy gradient steps.`)}
            className="p-3 bg-amber-50 dark:bg-amber-950/40 border-l-4 border-amber-500 rounded-r-lg cursor-pointer hover:bg-amber-100/60 dark:hover:bg-amber-900/40 transition-colors"
          >
            <div className="flex items-center justify-between text-[10px] font-bold text-amber-800 dark:text-amber-300 font-sans mb-1">
              <span>Grounded Excerpt [Highlight]</span>
              <Sparkles className="w-3 h-3 text-amber-500" />
            </div>
            <p className="text-xs font-serif italic text-amber-950 dark:text-amber-100">
              "PPO clips the probability ratio $r_t(\theta)$ within $[1-\epsilon, 1+\epsilon]$ to stabilize policy gradient steps."
            </p>
          </div>

          <p className="text-xs text-academic-800 dark:text-academic-200 leading-relaxed">
            Whereas standard policy gradient methods perform one gradient update per data sample, we propose a novel objective function that enables multiple epochs of minibatch updates. PPO offers the stability and reliability of TRPO while being much simpler to implement and tune.
          </p>

          {/* Prompt Action trigger when passage clicked */}
          {selectedPassage && (
            <div className="mt-4 p-3 bg-brand-50 dark:bg-brand-950 border border-brand-200 dark:border-brand-800 rounded-xl font-sans flex items-center justify-between">
              <span className="text-xs font-medium text-brand-900 dark:text-brand-100 truncate max-w-xs">
                Selected passage ready for AI analysis
              </span>
              <button
                onClick={() => {
                  onAskAboutText(`Explain this excerpt from ${fileName}: "${selectedPassage}"`);
                  setSelectedPassage(null);
                }}
                className="px-2.5 py-1 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold flex items-center gap-1"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Ask AI</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
