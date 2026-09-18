import React, { useState } from 'react';
import { Collection, Paper } from '../../types';
import { Folder, Plus, MessageSquare, BookOpen, Layers, Clock } from 'lucide-react';

interface CollectionsViewProps {
  collections: Collection[];
  papers: Paper[];
  onCreateCollection: (name: string, description: string) => void;
  onStartCollectionChat: (collection: Collection) => void;
}

export const CollectionsView: React.FC<CollectionsViewProps> = ({
  collections,
  papers,
  onCreateCollection,
  onStartCollectionChat,
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    onCreateCollection(newName.trim(), newDesc.trim());
    setNewName('');
    setNewDesc('');
    setShowCreateModal(false);
  };

  return (
    <div className="flex-1 p-6 max-w-7xl mx-auto w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-academic-200 dark:border-academic-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-academic-900 dark:text-white tracking-tight">Paper Collections</h1>
          <p className="text-xs text-academic-500 dark:text-academic-400 mt-1">
            Organize research papers by field, literature review topic, or benchmark dataset.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-soft-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Collection</span>
        </button>
      </div>

      {/* Grid of Collections */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {collections.map(col => {
          const colPapers = papers.filter(p => p.collectionIds.includes(col.id));

          return (
            <div
              key={col.id}
              className="bg-white dark:bg-academic-900 border border-academic-200/80 dark:border-academic-800 rounded-2xl p-5 shadow-soft-sm hover:shadow-soft-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                    <Folder className="w-5 h-5" />
                  </div>

                  <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-academic-100 dark:bg-academic-800 text-academic-700 dark:text-academic-300">
                    {colPapers.length} Papers
                  </span>
                </div>

                <h3 className="text-base font-bold text-academic-900 dark:text-white mb-1">{col.name}</h3>
                <p className="text-xs text-academic-500 dark:text-academic-400 leading-relaxed mb-4 line-clamp-2">
                  {col.description}
                </p>

                <div className="flex items-center gap-1.5 text-[11px] text-academic-400 font-mono mb-4">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Updated {col.updatedAt}</span>
                </div>
              </div>

              <button
                onClick={() => onStartCollectionChat(col)}
                className="w-full py-2 px-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-soft-sm transition-colors"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Start Chat with Collection</span>
              </button>
            </div>
          );
        })}
      </div>

      {/* Modal for creating a new collection */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-academic-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-academic-900 border border-academic-200 dark:border-academic-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-academic-900 dark:text-white">Create New Collection</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-academic-700 dark:text-academic-300 mb-1">
                  Collection Name
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Reinforcement Learning Benchmarks"
                  required
                  className="w-full px-3 py-2 bg-academic-50 dark:bg-academic-950 border border-academic-300 dark:border-academic-700 rounded-xl text-xs text-academic-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-academic-700 dark:text-academic-300 mb-1">
                  Description
                </label>
                <textarea
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Brief description of research papers in this collection..."
                  rows={3}
                  className="w-full px-3 py-2 bg-academic-50 dark:bg-academic-950 border border-academic-300 dark:border-academic-700 rounded-xl text-xs text-academic-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-academic-600 hover:bg-academic-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-semibold shadow-soft-sm"
                >
                  Create Collection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
