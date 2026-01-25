'use client';

import { useEffect, useCallback } from 'react';
import { useElementsStore } from '@/store/useElementsStore';

// ============================================================================
// Types
// ============================================================================

interface KeyboardShortcutsOptions {
  /** Enable/disable shortcuts (useful when modal is open) */
  enabled?: boolean;
  /** Nudge distance for arrow keys in pixels */
  nudgeDistance?: number;
  /** Nudge distance when shift is held */
  shiftNudgeDistance?: number;
}

// ============================================================================
// Hook
// ============================================================================

/**
 * Keyboard shortcuts for element manipulation:
 *
 * - Delete/Backspace: Delete selected element
 * - Cmd/Ctrl + C: Copy selected element
 * - Cmd/Ctrl + V: Paste copied element
 * - Cmd/Ctrl + D: Duplicate selected element
 * - Escape: Deselect element
 * - Cmd/Ctrl + ]: Bring to front
 * - Cmd/Ctrl + [: Send to back
 * - Arrow keys: Nudge element position (1px, 10px with Shift)
 * - Cmd/Ctrl + A: Select all (prevented to avoid browser default)
 */
export function useElementKeyboardShortcuts(options: KeyboardShortcutsOptions = {}) {
  const {
    enabled = true,
    nudgeDistance = 1,
    shiftNudgeDistance = 10,
  } = options;

  const {
    selectedElementId,
    elements,
    deleteElement,
    copyElement,
    pasteElement,
    duplicateElement,
    updateElement,
    bringToFront,
    sendToBack,
    selectElement,
    moveUp,
    moveDown,
  } = useElementsStore();

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Skip if shortcuts are disabled
      if (!enabled) return;

      // Skip if user is typing in an input field
      const target = e.target as HTMLElement;
      const isInputField = ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName);
      const isContentEditable = target.isContentEditable;

      if (isInputField || isContentEditable) {
        // Only allow Escape to work in input fields
        if (e.key !== 'Escape') return;
      }

      const isMeta = e.metaKey || e.ctrlKey;
      const isShift = e.shiftKey;

      // Get selected element
      const selectedElement = elements.find((el) => el.id === selectedElementId);

      // -----------------------------------------------------------------------
      // Delete (Delete or Backspace)
      // -----------------------------------------------------------------------
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedElementId) {
        e.preventDefault();
        deleteElement(selectedElementId);
        return;
      }

      // -----------------------------------------------------------------------
      // Copy (Cmd/Ctrl + C)
      // -----------------------------------------------------------------------
      if (isMeta && e.key === 'c' && selectedElementId) {
        e.preventDefault();
        copyElement(selectedElementId);
        return;
      }

      // -----------------------------------------------------------------------
      // Paste (Cmd/Ctrl + V)
      // -----------------------------------------------------------------------
      if (isMeta && e.key === 'v') {
        e.preventDefault();
        pasteElement();
        return;
      }

      // -----------------------------------------------------------------------
      // Duplicate (Cmd/Ctrl + D)
      // -----------------------------------------------------------------------
      if (isMeta && e.key === 'd' && selectedElementId) {
        e.preventDefault();
        duplicateElement(selectedElementId);
        return;
      }

      // -----------------------------------------------------------------------
      // Deselect (Escape)
      // -----------------------------------------------------------------------
      if (e.key === 'Escape') {
        e.preventDefault();
        selectElement(null);
        return;
      }

      // -----------------------------------------------------------------------
      // Bring to Front (Cmd/Ctrl + ])
      // -----------------------------------------------------------------------
      if (isMeta && e.key === ']' && selectedElementId) {
        e.preventDefault();
        if (isShift) {
          bringToFront(selectedElementId);
        } else {
          moveUp(selectedElementId);
        }
        return;
      }

      // -----------------------------------------------------------------------
      // Send to Back (Cmd/Ctrl + [)
      // -----------------------------------------------------------------------
      if (isMeta && e.key === '[' && selectedElementId) {
        e.preventDefault();
        if (isShift) {
          sendToBack(selectedElementId);
        } else {
          moveDown(selectedElementId);
        }
        return;
      }

      // -----------------------------------------------------------------------
      // Arrow Key Nudge
      // -----------------------------------------------------------------------
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key) && selectedElementId) {
        if (!selectedElement || selectedElement.locked) return;

        e.preventDefault();
        const delta = isShift ? shiftNudgeDistance : nudgeDistance;
        const newPosition = { ...selectedElement.position };

        switch (e.key) {
          case 'ArrowUp':
            newPosition.y -= delta;
            break;
          case 'ArrowDown':
            newPosition.y += delta;
            break;
          case 'ArrowLeft':
            newPosition.x -= delta;
            break;
          case 'ArrowRight':
            newPosition.x += delta;
            break;
        }

        updateElement(selectedElementId, { position: newPosition });
        return;
      }

      // -----------------------------------------------------------------------
      // Select All Prevention (Cmd/Ctrl + A)
      // -----------------------------------------------------------------------
      if (isMeta && e.key === 'a') {
        // Prevent browser's select all behavior in canvas context
        // Could be extended to select all elements if needed
        e.preventDefault();
        return;
      }

      // -----------------------------------------------------------------------
      // Lock/Unlock (Cmd/Ctrl + L)
      // -----------------------------------------------------------------------
      if (isMeta && e.key === 'l' && selectedElementId && selectedElement) {
        e.preventDefault();
        updateElement(selectedElementId, { locked: !selectedElement.locked });
        return;
      }
    },
    [
      enabled,
      selectedElementId,
      elements,
      nudgeDistance,
      shiftNudgeDistance,
      deleteElement,
      copyElement,
      pasteElement,
      duplicateElement,
      updateElement,
      bringToFront,
      sendToBack,
      selectElement,
      moveUp,
      moveDown,
    ]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}

// ============================================================================
// Shortcut Reference
// ============================================================================

export const KEYBOARD_SHORTCUTS = [
  { key: 'Delete / Backspace', action: 'Delete selected element' },
  { key: 'Cmd/Ctrl + C', action: 'Copy selected element' },
  { key: 'Cmd/Ctrl + V', action: 'Paste copied element' },
  { key: 'Cmd/Ctrl + D', action: 'Duplicate selected element' },
  { key: 'Escape', action: 'Deselect element' },
  { key: 'Cmd/Ctrl + ]', action: 'Move element up one layer' },
  { key: 'Cmd/Ctrl + Shift + ]', action: 'Bring element to front' },
  { key: 'Cmd/Ctrl + [', action: 'Move element down one layer' },
  { key: 'Cmd/Ctrl + Shift + [', action: 'Send element to back' },
  { key: 'Arrow Keys', action: 'Nudge element (1px)' },
  { key: 'Shift + Arrow Keys', action: 'Nudge element (10px)' },
  { key: 'Cmd/Ctrl + L', action: 'Lock/unlock element' },
] as const;

export default useElementKeyboardShortcuts;
