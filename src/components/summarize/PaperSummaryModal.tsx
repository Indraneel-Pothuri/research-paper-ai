import React from 'react';
import { PaperSummary } from '../../types';
import { X, Sparkles, BookOpen, AlertCircle, CheckCircle2, MessageSquare } from 'lucide-react';

interface PaperSummaryModalProps {
  summary: PaperSummary | null;
  onClose: () => void;
  onAskAboutPaper: (paperTitle: string) => void;
}

export const PaperSummaryModal: React.FC<PaperSummaryModalProps> = ({ summary, onClose, onAskAboutPaper }) => {
  if (!summary) return null;

  return (
    <div className="fixed inset-0 bg-academic-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-academic-900 border border-academic-200 dark:border-academic-800 rounded-2xl w-full max-w-2xl max-h-[85vh] shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-academic-200 dark:border-academic-800 flex items-center justify-between bg-academic-50/70 dark:bg-academic-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-brand-500 text-white flex items-center justify-center font-bold">
              <Sparkles className="w-4.5 h-4.5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                Structured Executive Summary
              </span>
              <h3 className="text-sm font-bold text-academic-900 dark:text-white truncate max-w-md">
                {summary.paperTitle}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-academic-200 dark:hover:bg-academic-800 text-academic-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs font-sans text-academic-800 dark:text-academic-200 leading-relaxed">
          {/* Abstract */}
          <div className="p-3.5 bg-academic-50 dark:bg-academic-950 rounded-xl border border-academic-200 dark:border-academic-800">
            <h4 className="font-semibold text-academic-900 dark:text-white mb-1 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-brand-500" />
              <span>Abstract & Core Goal</span>
            </h4>
            <p className="text-academic-600 dark:text-academic-400 italic">"{summary.abstract}"</p>
          </div>

          {/* Key Problem */}
          <div>
            <h4 className="font-semibold text-academic-900 dark:text-white mb-1">Key Research Problem</h4>
            <p className="bg-white dark:bg-academic-900 p-2.5 rounded-lg border border-academic-200 dark:border-academic-800">
              {summary.keyProblem}
            </p>
          </div>

          {/* Methodology */}
          <div>
            <h4 className="font-semibold text-academic-900 dark:text-white mb-1">Methodology & Constraints</h4>
            <p className="bg-white dark:bg-academic-900 p-2.5 rounded-lg border border-academic-200 dark:border-academic-800">
              {summary.methodology}
            </p>
          </div>

          {/* Key Findings */}
          <div>
            <h4 className="font-semibold text-academic-900 dark:text-white mb-1">Key Empirical Findings</h4>
            <ul className="space-y-1">
              {summary.keyFindings.map((finding, idx) => (
                <li key={idx} className="flex items-start gap-2 bg-emerald-50/50 dark:bg-emerald-950/30 p-2 rounded-lg border border-emerald-200/60 dark:border-emerald-900/50 text-emerald-900 dark:text-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <span>{finding}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Limitations */}
          <div>
            <h4 className="font-semibold text-academic-900 dark:text-white mb-1">Limitations & Boundary Conditions</h4>
            <p className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 text-amber-950 dark:text-amber-200">
              {summary.limitations}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-academic-200 dark:border-academic-800 bg-academic-50/80 dark:bg-academic-950/80 flex items-center justify-between">
          <button
            onClick={() => {
              onAskAboutPaper(`Let's dive deeper into the summary of ${summary.paperTitle}.`);
              onClose();
            }}
            className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-soft-sm"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Ask Follow-up Questions</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-academic-600 hover:bg-academic-200 rounded-xl"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
