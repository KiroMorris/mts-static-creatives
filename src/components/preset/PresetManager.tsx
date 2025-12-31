'use client';

import React, { useState, useEffect, useRef } from 'react';
import { usePresetStore } from '@/store/usePresetStore';
import { PresetCard } from './PresetCard';
import { exportPresetsToJSON } from '@/lib/presetStorage';

interface PresetManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

type Tab = 'all' | 'system' | 'custom';

export function PresetManager({ isOpen, onClose }: PresetManagerProps) {
  const [activeTab, setActiveTab] = useState<Tab>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [duplicateName, setDuplicateName] = useState('');
  const [duplicatingId, setDuplicatingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    presets,
    activePresetId,
    applyPreset,
    updatePreset,
    deletePreset,
    duplicatePreset,
    exportPreset,
    importPresets,
    isLoading,
    error,
  } = usePresetStore();

  // Close on escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        if (editingId || duplicatingId || deleteConfirmId) {
          setEditingId(null);
          setDuplicatingId(null);
          setDeleteConfirmId(null);
        } else {
          onClose();
        }
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose, editingId, duplicatingId, deleteConfirmId]);

  // Filter presets
  const filteredPresets = presets.filter((preset) => {
    // Tab filter
    if (activeTab === 'system' && !preset.isDefault) return false;
    if (activeTab === 'custom' && preset.isDefault) return false;

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        preset.name.toLowerCase().includes(query) ||
        preset.description?.toLowerCase().includes(query) ||
        preset.tags?.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    return true;
  });

  const systemCount = presets.filter((p) => p.isDefault).length;
  const customCount = presets.filter((p) => !p.isDefault).length;

  const handleEdit = (id: string) => {
    const preset = presets.find((p) => p.id === id);
    if (preset && !preset.isDefault) {
      setEditingId(id);
      setEditName(preset.name);
    }
  };

  const handleSaveEdit = () => {
    if (editingId && editName.trim()) {
      updatePreset(editingId, { name: editName.trim() });
      setEditingId(null);
      setEditName('');
    }
  };

  const handleStartDuplicate = (id: string) => {
    const preset = presets.find((p) => p.id === id);
    if (preset) {
      setDuplicatingId(id);
      setDuplicateName(`${preset.name} (Copy)`);
    }
  };

  const handleConfirmDuplicate = () => {
    if (duplicatingId && duplicateName.trim()) {
      duplicatePreset(duplicatingId, duplicateName.trim());
      setDuplicatingId(null);
      setDuplicateName('');
    }
  };

  const handleDelete = (id: string) => {
    setDeleteConfirmId(id);
  };

  const handleConfirmDelete = () => {
    if (deleteConfirmId) {
      deletePreset(deleteConfirmId);
      setDeleteConfirmId(null);
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const count = await importPresets(file);
      if (count > 0) {
        // Show success message (you could add a toast here)
        console.log(`Imported ${count} preset(s)`);
      }
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleExportAll = () => {
    const customPresets = presets.filter((p) => !p.isDefault);
    if (customPresets.length > 0) {
      exportPresetsToJSON(customPresets);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-3xl max-h-[85vh] mx-4 bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
            Manage Presets
          </h2>
          <button
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Toolbar */}
        <div className="px-6 py-3 border-b border-zinc-200 dark:border-zinc-800 flex items-center gap-4">
          {/* Tabs */}
          <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'all'
                  ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              All ({presets.length})
            </button>
            <button
              onClick={() => setActiveTab('system')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'system'
                  ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              System ({systemCount})
            </button>
            <button
              onClick={() => setActiveTab('custom')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'custom'
                  ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              My Presets ({customCount})
            </button>
          </div>

          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search presets..."
                className="w-full pl-10 pr-4 py-2 text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-zinc-900/20 dark:focus:ring-white/20"
              />
            </div>
          </div>

          {/* Import/Export */}
          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors flex items-center gap-1.5"
              disabled={isLoading}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Import
            </button>
            <button
              onClick={handleExportAll}
              className="px-3 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors flex items-center gap-1.5"
              disabled={customCount === 0}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export All
            </button>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin w-8 h-8 border-2 border-zinc-300 dark:border-zinc-700 border-t-zinc-900 dark:border-t-white rounded-full" />
            </div>
          ) : filteredPresets.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 mx-auto mb-4 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <p className="text-zinc-600 dark:text-zinc-400">
                {searchQuery ? 'No presets match your search' : 'No presets yet'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredPresets.map((preset) => (
                <PresetCard
                  key={preset.id}
                  preset={preset}
                  isActive={preset.id === activePresetId}
                  onApply={applyPreset}
                  onEdit={handleEdit}
                  onDuplicate={handleStartDuplicate}
                  onDelete={handleDelete}
                  onExport={exportPreset}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-zinc-200 dark:border-zinc-800">
          <p className="text-xs text-zinc-500 dark:text-zinc-400 text-center">
            Presets are stored in your browser. Export to keep a backup.
          </p>
        </div>
      </div>

      {/* Edit Modal */}
      {editingId && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setEditingId(null)} />
          <div className="relative w-full max-w-sm mx-4 bg-white dark:bg-zinc-900 rounded-xl shadow-2xl p-6">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">
              Rename Preset
            </h3>
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit()}
              className="w-full px-4 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-900/20 dark:focus:ring-white/20"
              autoFocus
            />
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setEditingId(null)}
                className="px-4 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-400"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-zinc-900 dark:bg-white text-white dark:text-zinc-900"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Duplicate Modal */}
      {duplicatingId && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setDuplicatingId(null)} />
          <div className="relative w-full max-w-sm mx-4 bg-white dark:bg-zinc-900 rounded-xl shadow-2xl p-6">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">
              Duplicate Preset
            </h3>
            <input
              type="text"
              value={duplicateName}
              onChange={(e) => setDuplicateName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleConfirmDuplicate()}
              className="w-full px-4 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-900/20 dark:focus:ring-white/20"
              autoFocus
            />
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setDuplicatingId(null)}
                className="px-4 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-400"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDuplicate}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-zinc-900 dark:bg-white text-white dark:text-zinc-900"
              >
                Duplicate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setDeleteConfirmId(null)} />
          <div className="relative w-full max-w-sm mx-4 bg-white dark:bg-zinc-900 rounded-xl shadow-2xl p-6">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-2">
              Delete Preset?
            </h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
              This action cannot be undone. The preset will be permanently deleted.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-400"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-red-600 text-white hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
