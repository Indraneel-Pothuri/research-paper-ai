import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface DeleteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmDelete: () => void;
  title?: string;
}

export const DeleteDialog: React.FC<DeleteDialogProps> = ({
  isOpen,
  onClose,
  onConfirmDelete,
  title = 'Delete conversation?',
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-academic-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-academic-900 border border-academic-200 dark:border-academic-800 rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-academic-900 dark:text-white">{title}</h3>
            <p className="text-xs text-academic-500 mt-0.5">This action cannot be undone. All messages and citations in this thread will be permanently deleted.</p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-academic-600 hover:bg-academic-100 dark:hover:bg-academic-800"
          >
            Cancel
          </button>

          <button
            onClick={() => {
              onConfirmDelete();
              onClose();
            }}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-soft-sm flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete</span>
          </button>
        </div>
      </div>
    </div>
  );
};
