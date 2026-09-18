import React, { useState } from 'react';
import { X, Share2, Copy, Check, Lock, Globe } from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  conversationTitle?: string;
}

export const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, conversationTitle }) => {
  const [copied, setCopied] = useState(false);
  const shareUrl = `https://researchpaper.ai/c/${Math.random().toString(36).substring(7)}`;

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-academic-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-academic-900 border border-academic-200 dark:border-academic-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-academic-100 dark:border-academic-800 pb-3">
          <div className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-brand-600" />
            <h3 className="text-sm font-bold text-academic-900 dark:text-white">Share Conversation</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-academic-100 text-academic-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div>
          <p className="text-xs font-semibold text-academic-800 dark:text-academic-200 truncate mb-1">
            "{conversationTitle || 'Research Chat'}"
          </p>
          <p className="text-[11px] text-academic-500">
            Anyone with the link can view this grounded research conversation and citations.
          </p>
        </div>

        <div className="flex items-center gap-2 p-2 bg-academic-50 dark:bg-academic-950 border border-academic-200 dark:border-academic-800 rounded-xl">
          <Globe className="w-4 h-4 text-academic-400 ml-1 flex-shrink-0" />
          <input
            type="text"
            value={shareUrl}
            readOnly
            className="flex-1 bg-transparent text-xs font-mono text-academic-700 dark:text-academic-300 focus:outline-none truncate"
          />
          <button
            onClick={handleCopy}
            className="px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-soft-sm transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy link'}</span>
          </button>
        </div>

        <div className="flex justify-end">
          <button onClick={onClose} className="px-4 py-2 text-xs font-medium text-academic-600 hover:bg-academic-100 rounded-xl">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
