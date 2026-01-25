'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { TemplateCard } from './TemplateCard';
import { loadTemplatesFromStorage, type Template, type TemplateCategory } from './TemplateSaveModal';

interface TemplateLibraryProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: Template) => void;
  activeTemplateId?: string;
}

type FilterCategory = TemplateCategory | 'all' | 'my-templates';

const CATEGORY_TABS: { value: FilterCategory; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'minimal', label: 'Minimal' },
  { value: 'bold', label: 'Bold' },
  { value: 'sale', label: 'Sale' },
  { value: 'new-arrival', label: 'New Arrival' },
  { value: 'lifestyle', label: 'Lifestyle' },
  { value: 'my-templates', label: 'My Templates' },
];

const STORAGE_KEY = 'acg-templates';

// Delete template from storage
function deleteTemplateFromStorage(templateId: string): void {
  const templates = loadTemplatesFromStorage();
  const filtered = templates.filter(t => t.id !== templateId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}

// Duplicate template
function duplicateTemplate(template: Template): Template {
  const now = Date.now();
  const newTemplate: Template = {
    ...template,
    id: `template_${now}_${Math.random().toString(36).substring(2, 9)}`,
    name: `${template.name} (Copy)`,
    createdAt: now,
    updatedAt: now,
    isPreset: false,
  };

  const templates = loadTemplatesFromStorage();
  templates.push(newTemplate);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));

  return newTemplate;
}

export function TemplateLibrary({
  isOpen,
  onClose,
  onSelectTemplate,
  activeTemplateId,
}: TemplateLibraryProps) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<FilterCategory>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Load templates on mount/open
  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      try {
        const loaded = loadTemplatesFromStorage();
        setTemplates(loaded);
      } catch (error) {
        console.error('Failed to load templates:', error);
      } finally {
        setIsLoading(false);
      }
    }
  }, [isOpen]);

  // Close on escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        if (deleteConfirmId) {
          setDeleteConfirmId(null);
        } else {
          onClose();
        }
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose, deleteConfirmId]);

  // Filter templates based on search and category
  const filteredTemplates = useMemo(() => {
    let result = templates;

    // Filter by category
    if (selectedCategory === 'my-templates') {
      result = result.filter(t => !t.isPreset);
    } else if (selectedCategory !== 'all') {
      result = result.filter(t => t.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(t =>
        t.name.toLowerCase().includes(query) ||
        t.description?.toLowerCase().includes(query) ||
        t.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Sort by updated date, newest first
    return result.sort((a, b) => b.updatedAt - a.updatedAt);
  }, [templates, selectedCategory, searchQuery]);

  const presetTemplates = useMemo(() =>
    filteredTemplates.filter(t => t.isPreset),
    [filteredTemplates]
  );

  const userTemplates = useMemo(() =>
    filteredTemplates.filter(t => !t.isPreset),
    [filteredTemplates]
  );

  const handleDelete = useCallback((template: Template) => {
    setDeleteConfirmId(template.id);
  }, []);

  const confirmDelete = useCallback(() => {
    if (deleteConfirmId) {
      deleteTemplateFromStorage(deleteConfirmId);
      setTemplates(prev => prev.filter(t => t.id !== deleteConfirmId));
      setDeleteConfirmId(null);
    }
  }, [deleteConfirmId]);

  const handleDuplicate = useCallback((template: Template) => {
    const newTemplate = duplicateTemplate(template);
    setTemplates(prev => [...prev, newTemplate]);
  }, []);

  const handleSelect = useCallback((template: Template) => {
    onSelectTemplate(template);
  }, [onSelectTemplate]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-4xl mx-4 bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
          <div>
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
              Template Library
            </h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
              {templates.length} template{templates.length !== 1 ? 's' : ''} available
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Search and Filters */}
        <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 space-y-4">
          {/* Search */}
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search templates by name, description, or tags..."
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-zinc-900/20 dark:focus:ring-white/20 focus:border-zinc-900 dark:focus:border-white"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Category tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 -mx-1 px-1">
            {CATEGORY_TABS.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setSelectedCategory(tab.value)}
                className={`
                  px-3 py-1.5 text-sm font-medium rounded-full whitespace-nowrap transition-colors
                  ${selectedCategory === tab.value
                    ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                  }
                `}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-zinc-300 dark:border-zinc-600 border-t-zinc-900 dark:border-t-white" />
            </div>
          ) : filteredTemplates.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <svg className="w-16 h-16 text-zinc-300 dark:text-zinc-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <h3 className="text-lg font-medium text-zinc-900 dark:text-white mb-1">
                No templates found
              </h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                {searchQuery
                  ? 'Try adjusting your search or filters'
                  : 'Save your first template to get started'}
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Preset templates section */}
              {presetTemplates.length > 0 && selectedCategory !== 'my-templates' && (
                <div>
                  <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-4">
                    Preset Templates ({presetTemplates.length})
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {presetTemplates.map((template) => (
                      <TemplateCard
                        key={template.id}
                        template={template}
                        isActive={template.id === activeTemplateId}
                        onSelect={handleSelect}
                        onDuplicate={handleDuplicate}
                        showActions={true}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* User templates section */}
              {userTemplates.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-4">
                    {selectedCategory === 'my-templates' ? 'My Templates' : 'Saved Templates'} ({userTemplates.length})
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {userTemplates.map((template) => (
                      <TemplateCard
                        key={template.id}
                        template={template}
                        isActive={template.id === activeTemplateId}
                        onSelect={handleSelect}
                        onDuplicate={handleDuplicate}
                        onDelete={handleDelete}
                        showActions={true}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Click a template to apply it to your current design
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors"
          >
            Close
          </button>
        </div>
      </div>

      {/* Delete confirmation dialog */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => setDeleteConfirmId(null)}
          />
          <div className="relative bg-white dark:bg-zinc-800 rounded-xl shadow-2xl p-6 max-w-sm mx-4">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-2">
              Delete Template?
            </h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">
              This action cannot be undone. The template will be permanently removed.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors"
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
