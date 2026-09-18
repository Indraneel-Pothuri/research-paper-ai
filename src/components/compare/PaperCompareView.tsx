import React, { useState, useEffect } from 'react';
import { Paper, CompareResult } from '../../types';
import { apiService } from '../../services/api';
import { Scale, ArrowRightLeft, FileText, CheckCircle2, Sparkles, Loader2 } from 'lucide-react';

interface PaperCompareViewProps {
  papers: Paper[];
}

export const PaperCompareView: React.FC<PaperCompareViewProps> = ({ papers }) => {
  const [paperAId, setPaperAId] = useState<string>(papers[0]?.id || '');
  const [paperBId, setPaperBId] = useState<string>(papers[1]?.id || papers[0]?.id || '');
  const [comparison, setComparison] = useState<CompareResult | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (paperAId && paperBId) {
      setLoading(true);
      apiService.comparePapers(paperAId, paperBId).then(res => {
        setComparison(res);
        setLoading(false);
      }).catch(() => setLoading(false));
    }
  }, [paperAId, paperBId]);

  return (
    <div className="flex-1 p-6 max-w-7xl mx-auto w-full space-y-6">
      {/* Header */}
      <div className="border-b border-academic-200 dark:border-academic-800 pb-5">
        <div className="flex items-center gap-2">
          <Scale className="w-6 h-6 text-brand-600 dark:text-brand-400" />
          <h1 className="text-2xl font-bold text-academic-900 dark:text-white tracking-tight">Paper Comparison Matrix</h1>
        </div>
        <p className="text-xs text-academic-500 dark:text-academic-400 mt-1">
          Side-by-side technical comparison of research problems, algorithms, datasets, and benchmark results.
        </p>
      </div>

      {/* Select Paper Pickers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white dark:bg-academic-900 p-4 rounded-2xl border border-academic-200 dark:border-academic-800 shadow-soft-sm">
        {/* Paper A Picker */}
        <div>
          <label className="block text-xs font-semibold text-brand-600 dark:text-brand-400 mb-1.5 uppercase tracking-wider">
            Paper A
          </label>
          <select
            value={paperAId}
            onChange={(e) => setPaperAId(e.target.value)}
            className="w-full p-2.5 bg-academic-50 dark:bg-academic-950 border border-academic-200 dark:border-academic-700 rounded-xl text-xs font-medium text-academic-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            {papers.map(p => (
              <option key={p.id} value={p.id}>📄 {p.title} ({p.year || 2026})</option>
            ))}
          </select>
        </div>

        {/* Paper B Picker */}
        <div>
          <label className="block text-xs font-semibold text-indigo-600 dark:text-indigo-400 mb-1.5 uppercase tracking-wider">
            Paper B
          </label>
          <select
            value={paperBId}
            onChange={(e) => setPaperBId(e.target.value)}
            className="w-full p-2.5 bg-academic-50 dark:bg-academic-950 border border-academic-200 dark:border-academic-700 rounded-xl text-xs font-medium text-academic-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            {papers.map(p => (
              <option key={p.id} value={p.id}>📄 {p.title} ({p.year || 2026})</option>
            ))}
          </select>
        </div>
      </div>

      {loading && (
        <div className="py-12 text-center text-xs text-brand-600 flex items-center justify-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-brand-500" />
          <span>Generating grounded paper comparison...</span>
        </div>
      )}

      {/* Side-by-Side Comparison Matrix */}
      {!loading && comparison && (
        <div className="bg-white dark:bg-academic-900 border border-academic-200 dark:border-academic-800 rounded-2xl overflow-hidden shadow-soft-md">
          {/* Header row */}
          <div className="grid grid-cols-12 bg-academic-100/70 dark:bg-academic-800/60 border-b border-academic-200 dark:border-academic-800 font-semibold text-xs text-academic-800 dark:text-academic-200 p-4">
            <div className="col-span-3 text-academic-500">Dimension</div>
            <div className="col-span-4 text-brand-600 dark:text-brand-400 font-bold truncate pr-2">
              {comparison.paperA.title}
            </div>
            <div className="col-span-5 text-indigo-600 dark:text-indigo-400 font-bold truncate pl-2 border-l border-academic-200 dark:border-academic-700">
              {comparison.paperB.title}
            </div>
          </div>

          {/* Rows */}
          <div className="divide-y divide-academic-100 dark:divide-academic-800/60">
            {comparison.dimensions.map((dim, idx) => (
              <div key={idx} className="grid grid-cols-12 p-4 text-xs gap-3 hover:bg-academic-50/50 dark:hover:bg-academic-800/30 transition-colors">
                <div className="col-span-3 font-semibold text-academic-700 dark:text-academic-300 flex items-start gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-brand-500 mt-0.5 flex-shrink-0" />
                  <span>{dim.category}</span>
                </div>

                <div className="col-span-4 text-academic-800 dark:text-academic-200 leading-relaxed font-sans">
                  {dim.paperAValue}
                </div>

                <div className="col-span-5 text-academic-800 dark:text-academic-200 leading-relaxed font-sans pl-3 border-l border-academic-200/80 dark:border-academic-800">
                  {dim.paperBValue}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
