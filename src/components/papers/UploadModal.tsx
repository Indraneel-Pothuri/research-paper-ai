import React, { useState } from 'react';
import { X, UploadCloud, FileText, CheckCircle2, Loader2, ShieldCheck, AlertCircle } from 'lucide-react';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: (file: File) => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({ isOpen, onClose, onUploadSuccess }) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadingStage, setUploadingStage] = useState<string | null>(null);
  const [progressPercent, setProgressPercent] = useState(0);

  if (!isOpen) return null;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      alert('Please upload a valid PDF document.');
      return;
    }

    // Simulate multi-step RAG ingestion pipeline
    setUploadingStage('Uploading PDF document...');
    setProgressPercent(20);
    await new Promise(r => setTimeout(r, 600));

    setUploadingStage('Extracting text & page sections...');
    setProgressPercent(50);
    await new Promise(r => setTimeout(r, 700));

    setUploadingStage('Generating dense vector embeddings...');
    setProgressPercent(80);
    await new Promise(r => setTimeout(r, 600));

    setUploadingStage('Indexing chunks into RAG store...');
    setProgressPercent(100);
    await new Promise(r => setTimeout(r, 400));

    onUploadSuccess(file);
    setUploadingStage(null);
    setProgressPercent(0);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-academic-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-academic-900 border border-academic-200 dark:border-academic-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-academic-100 dark:border-academic-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold">
              <UploadCloud className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-academic-900 dark:text-white">Upload Research Papers</h3>
              <p className="text-[11px] text-academic-500">PDF documents up to 50MB</p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={uploadingStage !== null}
            className="p-1 rounded-lg hover:bg-academic-100 dark:hover:bg-academic-800 text-academic-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dropzone area */}
        {!uploadingStage ? (
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
              dragActive
                ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-950/40 scale-[0.99]'
                : 'border-academic-300 dark:border-academic-700 bg-academic-50/40 dark:bg-academic-950/40 hover:border-brand-400'
            }`}
          >
            <UploadCloud className="w-10 h-10 text-brand-500 mx-auto mb-3" />
            <h4 className="text-sm font-semibold text-academic-900 dark:text-white mb-1">
              Drop your research papers here
            </h4>
            <p className="text-xs text-academic-500 mb-4">or click to browse from your computer</p>

            <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-soft-sm cursor-pointer transition-colors">
              <span>Browse PDF Files</span>
              <input type="file" accept=".pdf" onChange={handleFileChange} className="hidden" />
            </label>
          </div>
        ) : (
          /* Multi-step pipeline progress */
          <div className="py-6 px-4 bg-academic-50 dark:bg-academic-950 rounded-2xl border border-academic-200 dark:border-academic-800 text-center space-y-4">
            <Loader2 className="w-8 h-8 text-brand-500 animate-spin mx-auto" />
            <div>
              <h4 className="text-xs font-semibold text-academic-900 dark:text-white">{uploadingStage}</h4>
              <p className="text-[11px] text-academic-500 mt-1 font-mono">{progressPercent}% Completed</p>
            </div>

            <div className="w-full bg-academic-200 dark:bg-academic-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-brand-500 h-full transition-all duration-300 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}

        {/* Info footer */}
        <div className="flex items-center gap-2 text-[11px] text-academic-500 dark:text-academic-400 bg-brand-50/50 dark:bg-brand-950/40 p-3 rounded-xl border border-brand-100 dark:border-brand-900/50">
          <ShieldCheck className="w-4 h-4 text-brand-500 flex-shrink-0" />
          <span>Extracted text will be automatically chunked and embedded for RAG vector queries.</span>
        </div>
      </div>
    </div>
  );
};
