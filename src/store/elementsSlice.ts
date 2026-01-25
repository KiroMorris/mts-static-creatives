// Elements Zustand Slice (V2)
// Manages canvas elements: add, update, delete, duplicate, copy/paste, z-index, lock/unlock

import { StateCreator } from 'zustand';
import { nanoid } from 'nanoid';
import type { CanvasElement, BaseElement } from '@/types/elements';

// ============================================================================
// State Interface
// ============================================================================

export interface ElementsState {
  elements: CanvasElement[];
  selectedElementId: string | null;
  clipboard: CanvasElement | null;
}

// ============================================================================
// Actions Interface
// ============================================================================

export interface ElementsActions {
  // CRUD
  addElement: (element: Omit<CanvasElement, 'id'>) => string;
  updateElement: (id: string, updates: Partial<CanvasElement>) => void;
  deleteElement: (id: string) => void;
  duplicateElement: (id: string) => string;

  // Selection
  selectElement: (id: string | null) => void;
  getSelectedOverlayElement: () => CanvasElement | null;

  // Ordering (z-index)
  bringToFront: (id: string) => void;
  sendToBack: (id: string) => void;
  moveUp: (id: string) => void;
  moveDown: (id: string) => void;

  // Clipboard
  copyElement: (id: string) => void;
  pasteElement: () => string | null;

  // Toggle & Lock
  toggleElement: (id: string) => void;
  lockElement: (id: string) => void;
  unlockElement: (id: string) => void;
  toggleLockElement: (id: string) => void;

  // Bulk Operations
  clearElements: () => void;
  setElements: (elements: CanvasElement[]) => void;

  // Helpers
  getSortedElements: () => CanvasElement[];
}

// ============================================================================
// Slice Type
// ============================================================================

export type ElementsSlice = ElementsState & ElementsActions;

// ============================================================================
// Initial State
// ============================================================================

const initialElementsState: ElementsState = {
  elements: [],
  selectedElementId: null,
  clipboard: null,
};

// ============================================================================
// Create Slice
// ============================================================================

export const createElementsSlice: StateCreator<
  ElementsSlice,
  [],
  [],
  ElementsSlice
> = (set, get) => ({
  ...initialElementsState,

  // -------------------------------------------------------------------------
  // CRUD Operations
  // -------------------------------------------------------------------------

  addElement: (element) => {
    const id = nanoid();
    const maxZIndex = Math.max(0, ...get().elements.map((e) => e.zIndex));

    const newElement = {
      ...element,
      id,
      zIndex: maxZIndex + 1,
    } as CanvasElement;

    set((state) => ({
      elements: [...state.elements, newElement],
      selectedElementId: id,
    }));

    return id;
  },

  updateElement: (id, updates) => {
    set((state) => ({
      elements: state.elements.map((el) =>
        el.id === id ? { ...el, ...updates } as CanvasElement : el
      ),
    }));
  },

  deleteElement: (id) => {
    set((state) => ({
      elements: state.elements.filter((el) => el.id !== id),
      selectedElementId:
        state.selectedElementId === id ? null : state.selectedElementId,
    }));
  },

  duplicateElement: (id) => {
    const element = get().elements.find((el) => el.id === id);
    if (!element) return '';

    const newId = nanoid();
    const maxZIndex = Math.max(0, ...get().elements.map((e) => e.zIndex));

    const duplicatedElement = {
      ...element,
      id: newId,
      zIndex: maxZIndex + 1,
      position: {
        x: element.position.x + 20,
        y: element.position.y + 20,
      },
    } as CanvasElement;

    set((state) => ({
      elements: [...state.elements, duplicatedElement],
      selectedElementId: newId,
    }));

    return newId;
  },

  // -------------------------------------------------------------------------
  // Selection
  // -------------------------------------------------------------------------

  selectElement: (id) => set({ selectedElementId: id }),

  getSelectedOverlayElement: () => {
    const { elements, selectedElementId } = get();
    return elements.find((el) => el.id === selectedElementId) || null;
  },

  // -------------------------------------------------------------------------
  // Z-Index Ordering
  // -------------------------------------------------------------------------

  bringToFront: (id) => {
    const maxZIndex = Math.max(0, ...get().elements.map((e) => e.zIndex));
    set((state) => ({
      elements: state.elements.map((el) =>
        el.id === id ? { ...el, zIndex: maxZIndex + 1 } : el
      ),
    }));
  },

  sendToBack: (id) => {
    const minZIndex = Math.min(...get().elements.map((e) => e.zIndex));
    set((state) => ({
      elements: state.elements.map((el) =>
        el.id === id ? { ...el, zIndex: minZIndex - 1 } : el
      ),
    }));
  },

  moveUp: (id) => {
    const elements = get().elements;
    const element = elements.find((el) => el.id === id);
    if (!element) return;

    // Find the element immediately above (next higher zIndex)
    const above = elements
      .filter((el) => el.zIndex > element.zIndex)
      .sort((a, b) => a.zIndex - b.zIndex)[0];

    if (above) {
      // Swap z-indices
      set((state) => ({
        elements: state.elements.map((el) => {
          if (el.id === id) return { ...el, zIndex: above.zIndex };
          if (el.id === above.id) return { ...el, zIndex: element.zIndex };
          return el;
        }),
      }));
    }
  },

  moveDown: (id) => {
    const elements = get().elements;
    const element = elements.find((el) => el.id === id);
    if (!element) return;

    // Find the element immediately below (next lower zIndex)
    const below = elements
      .filter((el) => el.zIndex < element.zIndex)
      .sort((a, b) => b.zIndex - a.zIndex)[0];

    if (below) {
      // Swap z-indices
      set((state) => ({
        elements: state.elements.map((el) => {
          if (el.id === id) return { ...el, zIndex: below.zIndex };
          if (el.id === below.id) return { ...el, zIndex: element.zIndex };
          return el;
        }),
      }));
    }
  },

  // -------------------------------------------------------------------------
  // Clipboard
  // -------------------------------------------------------------------------

  copyElement: (id) => {
    const element = get().elements.find((el) => el.id === id);
    if (element) {
      set({ clipboard: { ...element } });
    }
  },

  pasteElement: () => {
    const clipboard = get().clipboard;
    if (!clipboard) return null;

    // Create a new element from clipboard with offset position
    const { id, ...elementWithoutId } = clipboard;
    return get().addElement({
      ...elementWithoutId,
      position: {
        x: clipboard.position.x + 20,
        y: clipboard.position.y + 20,
      },
    });
  },

  // -------------------------------------------------------------------------
  // Toggle & Lock
  // -------------------------------------------------------------------------

  toggleElement: (id) => {
    set((state) => ({
      elements: state.elements.map((el) =>
        el.id === id ? { ...el, enabled: !el.enabled } : el
      ),
    }));
  },

  lockElement: (id) => {
    set((state) => ({
      elements: state.elements.map((el) =>
        el.id === id ? { ...el, locked: true } : el
      ),
    }));
  },

  unlockElement: (id) => {
    set((state) => ({
      elements: state.elements.map((el) =>
        el.id === id ? { ...el, locked: false } : el
      ),
    }));
  },

  toggleLockElement: (id) => {
    set((state) => ({
      elements: state.elements.map((el) =>
        el.id === id ? { ...el, locked: !el.locked } : el
      ),
    }));
  },

  // -------------------------------------------------------------------------
  // Bulk Operations
  // -------------------------------------------------------------------------

  clearElements: () => set({ elements: [], selectedElementId: null }),

  setElements: (elements) => set({ elements, selectedElementId: null }),

  // -------------------------------------------------------------------------
  // Helpers
  // -------------------------------------------------------------------------

  getSortedElements: () => {
    return [...get().elements]
      .filter((el) => el.enabled)
      .sort((a, b) => a.zIndex - b.zIndex);
  },
});
