'use client';

import React, { useState } from 'react';
import type { CalloutPrompt } from '@/types';
import { Button } from '@/components/ui/Button';

interface CalloutPromptManagerProps {
  prompts: CalloutPrompt[];
  onAdd: (prompt: { name: string; promptText: string; isBuiltIn: boolean }) => void;
  onUpdate: (id: string, updates: Partial<CalloutPrompt>) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

interface PromptFormData {
  name: string;
  promptText: string;
}

export function CalloutPromptManager({
  prompts,
  onAdd,
  onUpdate,
  onDelete,
  onClose,
}: CalloutPromptManagerProps) {
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [formData, setFormData] = useState<PromptFormData>({ name: '', promptText: '' });

  const handleStartAdd = () => {
    setFormData({ name: '', promptText: '' });
    setIsAddingNew(true);
    setEditingId(null);
  };

  const handleStartEdit = (prompt: CalloutPrompt) => {
    setFormData({ name: prompt.name, promptText: prompt.promptText });
    setEditingId(prompt.id);
    setIsAddingNew(false);
  };

  const handleCancelEdit = () => {
    setFormData({ name: '', promptText: '' });
    setEditingId(null);
    setIsAddingNew(false);
  };

  const handleSaveNew = () => {
    if (formData.name.trim() && formData.promptText.trim()) {
      onAdd({
        name: formData.name.trim(),
        promptText: formData.promptText.trim(),
        isBuiltIn: false,
      });
      setFormData({ name: '', promptText: '' });
      setIsAddingNew(false);
    }
  };

  const handleSaveEdit = () => {
    if (editingId && formData.name.trim() && formData.promptText.trim()) {
      onUpdate(editingId, {
        name: formData.name.trim(),
        promptText: formData.promptText.trim(),
      });
      setFormData({ name: '', promptText: '' });
      setEditingId(null);
    }
  };

  const handleConfirmDelete = (id: string) => {
    onDelete(id);
    setDeleteConfirmId(null);
  };

  const builtInPrompts = prompts.filter((p) => p.isBuiltIn);
  const customPrompts = prompts.filter((p) => !p.isBuiltIn);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-xl bg-white dark:bg-zinc-900 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-700 px-6 py-4">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
            Manage Callout Prompts
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            aria-label="Close"
          >
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-6" style={{ maxHeight: 'calc(90vh - 140px)' }}>
          {/* Built-in Prompts Section */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-3">
              Built-in Prompts
            </h3>
            <div className="space-y-2">
              {builtInPrompts.map((prompt) => (
                <PromptItem
                  key={prompt.id}
                  prompt={prompt}
                  isBuiltIn
                />
              ))}
            </div>
          </div>

          {/* Custom Prompts Section */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
                Custom Prompts
              </h3>
              {!isAddingNew && !editingId && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleStartAdd}
                  leftIcon={<PlusIcon className="w-4 h-4" />}
                >
                  Add New
                </Button>
              )}
            </div>

            {/* Add New Form */}
            {isAddingNew && (
              <PromptForm
                formData={formData}
                onChange={setFormData}
                onSave={handleSaveNew}
                onCancel={handleCancelEdit}
                submitLabel="Add Prompt"
              />
            )}

            {/* Custom Prompts List */}
            <div className="space-y-2">
              {customPrompts.length === 0 && !isAddingNew && (
                <p className="text-sm text-zinc-500 dark:text-zinc-400 py-4 text-center">
                  No custom prompts yet. Click "Add New" to create one.
                </p>
              )}
              {customPrompts.map((prompt) => (
                <React.Fragment key={prompt.id}>
                  {editingId === prompt.id ? (
                    <PromptForm
                      formData={formData}
                      onChange={setFormData}
                      onSave={handleSaveEdit}
                      onCancel={handleCancelEdit}
                      submitLabel="Save Changes"
                    />
                  ) : deleteConfirmId === prompt.id ? (
                    <DeleteConfirmation
                      promptName={prompt.name}
                      onConfirm={() => handleConfirmDelete(prompt.id)}
                      onCancel={() => setDeleteConfirmId(null)}
                    />
                  ) : (
                    <PromptItem
                      prompt={prompt}
                      onEdit={() => handleStartEdit(prompt)}
                      onDelete={() => setDeleteConfirmId(prompt.id)}
                    />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-zinc-200 dark:border-zinc-700 px-6 py-4">
          <Button variant="secondary" onClick={onClose} fullWidth>
            Done
          </Button>
        </div>
      </div>
    </div>
  );
}

// Prompt Item Component
interface PromptItemProps {
  prompt: CalloutPrompt;
  isBuiltIn?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

function PromptItem({ prompt, isBuiltIn, onEdit, onDelete }: PromptItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {isBuiltIn && (
            <LockIcon className="w-4 h-4 text-zinc-400 flex-shrink-0" />
          )}
          <span className="font-medium text-zinc-900 dark:text-white truncate">
            {prompt.name}
          </span>
        </div>
        <div className="flex items-center gap-1 ml-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
            aria-label={isExpanded ? 'Collapse' : 'Expand'}
          >
            <ChevronIcon className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
          </button>
          {!isBuiltIn && (
            <>
              <button
                onClick={onEdit}
                className="p-1.5 rounded text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                aria-label="Edit"
              >
                <EditIcon className="w-4 h-4" />
              </button>
              <button
                onClick={onDelete}
                className="p-1.5 rounded text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                aria-label="Delete"
              >
                <TrashIcon className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>
      {isExpanded && (
        <div className="px-4 pb-3 border-t border-zinc-200 dark:border-zinc-700 pt-3">
          <p className="text-sm text-zinc-600 dark:text-zinc-400 whitespace-pre-wrap">
            {prompt.promptText}
          </p>
        </div>
      )}
    </div>
  );
}

// Prompt Form Component
interface PromptFormProps {
  formData: PromptFormData;
  onChange: (data: PromptFormData) => void;
  onSave: () => void;
  onCancel: () => void;
  submitLabel: string;
}

function PromptForm({ formData, onChange, onSave, onCancel, submitLabel }: PromptFormProps) {
  const isValid = formData.name.trim() && formData.promptText.trim();

  return (
    <div className="rounded-lg border-2 border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 p-4 mb-2">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            Prompt Name
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => onChange({ ...formData, name: e.target.value })}
            placeholder="e.g., Close-up Texture"
            className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            Prompt Text
          </label>
          <textarea
            value={formData.promptText}
            onChange={(e) => onChange({ ...formData, promptText: e.target.value })}
            placeholder="Describe the shot you want to generate..."
            rows={5}
            className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500 resize-none"
          />
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            {formData.promptText.length} characters
          </p>
        </div>
        <div className="flex gap-2 justify-end">
          <Button variant="ghost" size="sm" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" onClick={onSave} disabled={!isValid}>
            {submitLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}

// Delete Confirmation Component
interface DeleteConfirmationProps {
  promptName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

function DeleteConfirmation({ promptName, onConfirm, onCancel }: DeleteConfirmationProps) {
  return (
    <div className="rounded-lg border-2 border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20 p-4">
      <p className="text-sm text-zinc-900 dark:text-white mb-3">
        Delete <strong>"{promptName}"</strong>? This action cannot be undone.
      </p>
      <div className="flex gap-2 justify-end">
        <Button variant="ghost" size="sm" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="danger" size="sm" onClick={onConfirm}>
          Delete
        </Button>
      </div>
    </div>
  );
}

// Icons
function CloseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function LockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  );
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
    </svg>
  );
}

function EditIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  );
}

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  );
}

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );
}

export default CalloutPromptManager;
