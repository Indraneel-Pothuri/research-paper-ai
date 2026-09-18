import React from 'react';
import { X, Moon, Sun, Monitor, Check } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  darkMode: boolean;
  onToggleDarkMode: (enabled: boolean) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  darkMode,
  onToggleDarkMode,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-academic-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-academic-900 border border-academic-200 dark:border-academic-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-academic-100 dark:border-academic-800 pb-3">
          <h3 className="text-base font-bold text-academic-900 dark:text-white">Settings & Preferences</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-academic-100 dark:hover:bg-academic-800 text-academic-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sections */}
        <div className="space-y-5 text-xs">
          {/* Theme / Appearance */}
          <div>
            <h4 className="font-semibold text-academic-900 dark:text-white mb-2 uppercase tracking-wider text-[11px] text-academic-400">
              Appearance
            </h4>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => onToggleDarkMode(false)}
                className={`p-3 rounded-xl border flex flex-col items-center gap-2 font-medium transition-all ${
                  !darkMode
                    ? 'border-brand-500 bg-brand-50/50 text-brand-600 dark:bg-brand-950'
                    : 'border-academic-200 dark:border-academic-800 text-academic-600 dark:text-academic-400'
                }`}
              >
                <Sun className="w-5 h-5" />
                <span>Light</span>
              </button>

              <button
                onClick={() => onToggleDarkMode(true)}
                className={`p-3 rounded-xl border flex flex-col items-center gap-2 font-medium transition-all ${
                  darkMode
                    ? 'border-brand-500 bg-brand-950 text-brand-400'
                    : 'border-academic-200 dark:border-academic-800 text-academic-600 dark:text-academic-400'
                }`}
              >
                <Moon className="w-5 h-5" />
                <span>Dark</span>
              </button>

              <button
                onClick={() => onToggleDarkMode(false)}
                className="p-3 rounded-xl border border-academic-200 dark:border-academic-800 text-academic-600 dark:text-academic-400 flex flex-col items-center gap-2 font-medium"
              >
                <Monitor className="w-5 h-5" />
                <span>System</span>
              </button>
            </div>
          </div>

          {/* Research & RAG Preferences */}
          <div className="space-y-3 pt-2 border-t border-academic-100 dark:border-academic-800">
            <h4 className="font-semibold text-academic-900 dark:text-white uppercase tracking-wider text-[11px] text-academic-400">
              Research Preferences
            </h4>

            <div className="flex items-center justify-between p-3 rounded-xl bg-academic-50 dark:bg-academic-950 border border-academic-200 dark:border-academic-800">
              <div>
                <div className="font-semibold text-academic-800 dark:text-academic-200">Show Exact Citation Snippets</div>
                <div className="text-[11px] text-academic-400">Display page numbers and section headers in source cards</div>
              </div>
              <input type="checkbox" defaultChecked className="rounded text-brand-600 focus:ring-brand-500" />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-academic-50 dark:bg-academic-950 border border-academic-200 dark:border-academic-800">
              <div>
                <div className="font-semibold text-academic-800 dark:text-academic-200">LaTeX Math Formatting</div>
                <div className="text-[11px] text-academic-400">Render KaTeX equations inline and in display blocks</div>
              </div>
              <input type="checkbox" defaultChecked className="rounded text-brand-600 focus:ring-brand-500" />
            </div>
          </div>

          {/* Version Info */}
          <div className="pt-2 text-center text-academic-400 text-[11px]">
            Research Paper AI v1.0.0 • Powered by RAG Embeddings & Fallback LLM Chain
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-semibold"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
