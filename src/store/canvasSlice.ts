import { StateCreator } from 'zustand';
import type {
  AspectRatioId,
  CanvasBackground,
  AnyCanvasElement,
  Position,
  Size,
  SnapConfig,
  LayerOperation,
  CanvasViewport,
  CanvasHistoryEntry,
} from '@/types/canvas';
import {
  DEFAULT_BACKGROUND,
  DEFAULT_SNAP_CONFIG,
  DEFAULT_VIEWPORT,
  ASPECT_RATIOS,
} from '@/types/canvas';

// ============================================================================
// Canvas Slice State Interface
// ============================================================================

export interface CanvasSliceState {
  // Canvas settings
  canvasAspectRatio: AspectRatioId;
  canvasBackground: CanvasBackground;

  // Elements
  canvasElements: AnyCanvasElement[];
  selectedCanvasElementId: string | null;

  // Editing state
  isDragging: boolean;
  isResizing: boolean;

  // Viewport (zoom/pan)
  viewport: CanvasViewport;

  // Snap settings
  snapConfig: SnapConfig;

  // History for undo/redo
  canvasHistory: CanvasHistoryEntry[];
  canvasHistoryIndex: number;
  maxCanvasHistoryLength: number;
}

// ============================================================================
// Canvas Slice Actions Interface
// ============================================================================

export interface CanvasSliceActions {
  // Aspect ratio
  setCanvasAspectRatio: (ratio: AspectRatioId) => void;

  // Background
  setCanvasBackground: (background: CanvasBackground) => void;

  // Element CRUD
  addCanvasElement: (element: Omit<AnyCanvasElement, 'id' | 'zIndex'>) => string;
  updateCanvasElement: (id: string, updates: Partial<AnyCanvasElement>) => void;
  removeCanvasElement: (id: string) => void;
  duplicateCanvasElement: (id: string) => string | null;

  // Selection
  selectCanvasElement: (id: string | null) => void;

  // Position & Size
  setCanvasElementPosition: (id: string, position: Position) => void;
  setCanvasElementSize: (id: string, size: Size) => void;
  setCanvasElementPositionAndSize: (id: string, position: Position, size: Size) => void;

  // Layer operations
  applyCanvasLayerOperation: (id: string, operation: LayerOperation) => void;
  toggleCanvasElementVisibility: (id: string) => void;
  toggleCanvasElementLock: (id: string) => void;

  // Drag state
  setIsDragging: (isDragging: boolean) => void;
  setIsResizing: (isResizing: boolean) => void;

  // Viewport
  setViewport: (viewport: Partial<CanvasViewport>) => void;
  resetViewport: () => void;
  zoomIn: () => void;
  zoomOut: () => void;
  zoomToFit: () => void;

  // Snap settings
  setSnapConfig: (config: Partial<SnapConfig>) => void;

  // History
  canvasUndo: () => void;
  canvasRedo: () => void;
  saveCanvasToHistory: () => void;

  // Reset
  resetCanvas: () => void;

  // Utility
  getCanvasDimensions: () => { width: number; height: number };
  getSelectedElement: () => AnyCanvasElement | null;
}

export type CanvasSlice = CanvasSliceState & CanvasSliceActions;

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Generate unique element ID
 */
function generateElementId(): string {
  return `element-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Get the next z-index for a new element (on top of all others)
 */
function getNextZIndex(elements: AnyCanvasElement[]): number {
  if (elements.length === 0) return 1;
  return Math.max(...elements.map((el) => el.zIndex)) + 1;
}

/**
 * Sort elements by z-index (lowest first)
 */
function sortByZIndex(elements: AnyCanvasElement[]): AnyCanvasElement[] {
  return [...elements].sort((a, b) => a.zIndex - b.zIndex);
}

/**
 * Apply layer operation to elements
 */
function applyLayerOperation(
  elements: AnyCanvasElement[],
  targetId: string,
  operation: LayerOperation
): AnyCanvasElement[] {
  const sorted = sortByZIndex(elements);
  const targetIndex = sorted.findIndex((el) => el.id === targetId);

  if (targetIndex === -1) return elements;

  const newElements = [...sorted];
  const [target] = newElements.splice(targetIndex, 1);

  switch (operation) {
    case 'bring-to-front':
      newElements.push(target);
      break;
    case 'bring-forward':
      newElements.splice(Math.min(targetIndex + 1, newElements.length), 0, target);
      break;
    case 'send-backward':
      newElements.splice(Math.max(targetIndex - 1, 0), 0, target);
      break;
    case 'send-to-back':
      newElements.unshift(target);
      break;
  }

  // Reassign z-indices
  return newElements.map((el, index) => ({
    ...el,
    zIndex: index + 1,
  }));
}

// ============================================================================
// Initial State
// ============================================================================

const initialCanvasState: CanvasSliceState = {
  canvasAspectRatio: '9:16',
  canvasBackground: DEFAULT_BACKGROUND,
  canvasElements: [],
  selectedCanvasElementId: null,
  isDragging: false,
  isResizing: false,
  viewport: DEFAULT_VIEWPORT,
  snapConfig: DEFAULT_SNAP_CONFIG,
  canvasHistory: [],
  canvasHistoryIndex: -1,
  maxCanvasHistoryLength: 50,
};

// ============================================================================
// Canvas Slice Creator
// ============================================================================

export const createCanvasSlice: StateCreator<
  CanvasSlice,
  [],
  [],
  CanvasSlice
> = (set, get) => ({
  ...initialCanvasState,

  // ============================================================================
  // Aspect Ratio
  // ============================================================================

  setCanvasAspectRatio: (ratio) => {
    get().saveCanvasToHistory();
    set({ canvasAspectRatio: ratio });
  },

  // ============================================================================
  // Background
  // ============================================================================

  setCanvasBackground: (background) => {
    get().saveCanvasToHistory();
    set({ canvasBackground: background });
  },

  // ============================================================================
  // Element CRUD
  // ============================================================================

  addCanvasElement: (elementWithoutIdAndZ) => {
    const id = generateElementId();
    const zIndex = getNextZIndex(get().canvasElements);

    const element: AnyCanvasElement = {
      ...elementWithoutIdAndZ,
      id,
      zIndex,
    } as AnyCanvasElement;

    get().saveCanvasToHistory();
    set((state) => ({
      canvasElements: [...state.canvasElements, element],
      selectedCanvasElementId: id,
    }));

    return id;
  },

  updateCanvasElement: (id, updates) => {
    get().saveCanvasToHistory();
    set((state) => ({
      canvasElements: state.canvasElements.map((el) =>
        el.id === id ? { ...el, ...updates } : el
      ) as AnyCanvasElement[],
    }));
  },

  removeCanvasElement: (id) => {
    get().saveCanvasToHistory();
    set((state) => ({
      canvasElements: state.canvasElements.filter((el) => el.id !== id),
      selectedCanvasElementId:
        state.selectedCanvasElementId === id ? null : state.selectedCanvasElementId,
    }));
  },

  duplicateCanvasElement: (id) => {
    const element = get().canvasElements.find((el) => el.id === id);
    if (!element) return null;

    const newId = generateElementId();
    const newElement: AnyCanvasElement = {
      ...element,
      id: newId,
      position: {
        x: element.position.x + 20,
        y: element.position.y + 20,
      },
      zIndex: getNextZIndex(get().canvasElements),
    };

    get().saveCanvasToHistory();
    set((state) => ({
      canvasElements: [...state.canvasElements, newElement],
      selectedCanvasElementId: newId,
    }));

    return newId;
  },

  // ============================================================================
  // Selection
  // ============================================================================

  selectCanvasElement: (id) => {
    set({ selectedCanvasElementId: id });
  },

  // ============================================================================
  // Position & Size
  // ============================================================================

  setCanvasElementPosition: (id, position) => {
    set((state) => ({
      canvasElements: state.canvasElements.map((el) =>
        el.id === id ? { ...el, position } : el
      ) as AnyCanvasElement[],
    }));
  },

  setCanvasElementSize: (id, size) => {
    set((state) => ({
      canvasElements: state.canvasElements.map((el) =>
        el.id === id ? { ...el, size } : el
      ) as AnyCanvasElement[],
    }));
  },

  setCanvasElementPositionAndSize: (id, position, size) => {
    set((state) => ({
      canvasElements: state.canvasElements.map((el) =>
        el.id === id ? { ...el, position, size } : el
      ) as AnyCanvasElement[],
    }));
  },

  // ============================================================================
  // Layer Operations
  // ============================================================================

  applyCanvasLayerOperation: (id, operation) => {
    get().saveCanvasToHistory();
    set((state) => ({
      canvasElements: applyLayerOperation(state.canvasElements, id, operation),
    }));
  },

  toggleCanvasElementVisibility: (id) => {
    set((state) => ({
      canvasElements: state.canvasElements.map((el) =>
        el.id === id ? { ...el, visible: !el.visible } : el
      ) as AnyCanvasElement[],
    }));
  },

  toggleCanvasElementLock: (id) => {
    set((state) => ({
      canvasElements: state.canvasElements.map((el) =>
        el.id === id ? { ...el, locked: !el.locked } : el
      ) as AnyCanvasElement[],
    }));
  },

  // ============================================================================
  // Drag State
  // ============================================================================

  setIsDragging: (isDragging) => set({ isDragging }),
  setIsResizing: (isResizing) => set({ isResizing }),

  // ============================================================================
  // Viewport
  // ============================================================================

  setViewport: (viewportUpdates) => {
    set((state) => ({
      viewport: { ...state.viewport, ...viewportUpdates },
    }));
  },

  resetViewport: () => {
    set({ viewport: DEFAULT_VIEWPORT });
  },

  zoomIn: () => {
    set((state) => ({
      viewport: {
        ...state.viewport,
        zoom: Math.min(state.viewport.zoom * 1.25, 4), // Max 400%
      },
    }));
  },

  zoomOut: () => {
    set((state) => ({
      viewport: {
        ...state.viewport,
        zoom: Math.max(state.viewport.zoom / 1.25, 0.25), // Min 25%
      },
    }));
  },

  zoomToFit: () => {
    // Reset to 100% and center
    set({
      viewport: {
        zoom: 1,
        panX: 0,
        panY: 0,
      },
    });
  },

  // ============================================================================
  // Snap Settings
  // ============================================================================

  setSnapConfig: (config) => {
    set((state) => ({
      snapConfig: { ...state.snapConfig, ...config },
    }));
  },

  // ============================================================================
  // History (Undo/Redo)
  // ============================================================================

  saveCanvasToHistory: () => {
    set((state) => {
      const entry: CanvasHistoryEntry = {
        elements: [...state.canvasElements],
        background: state.canvasBackground,
        aspectRatio: state.canvasAspectRatio,
        timestamp: Date.now(),
      };

      const newHistory = state.canvasHistory.slice(0, state.canvasHistoryIndex + 1);
      newHistory.push(entry);

      // Limit history length
      if (newHistory.length > state.maxCanvasHistoryLength) {
        newHistory.shift();
      }

      return {
        canvasHistory: newHistory,
        canvasHistoryIndex: newHistory.length - 1,
      };
    });
  },

  canvasUndo: () => {
    set((state) => {
      if (state.canvasHistoryIndex <= 0) return state;

      const newIndex = state.canvasHistoryIndex - 1;
      const entry = state.canvasHistory[newIndex];

      return {
        canvasElements: [...entry.elements],
        canvasBackground: entry.background,
        canvasAspectRatio: entry.aspectRatio,
        canvasHistoryIndex: newIndex,
      };
    });
  },

  canvasRedo: () => {
    set((state) => {
      if (state.canvasHistoryIndex >= state.canvasHistory.length - 1) return state;

      const newIndex = state.canvasHistoryIndex + 1;
      const entry = state.canvasHistory[newIndex];

      return {
        canvasElements: [...entry.elements],
        canvasBackground: entry.background,
        canvasAspectRatio: entry.aspectRatio,
        canvasHistoryIndex: newIndex,
      };
    });
  },

  // ============================================================================
  // Reset
  // ============================================================================

  resetCanvas: () => {
    set(initialCanvasState);
  },

  // ============================================================================
  // Utility Functions
  // ============================================================================

  getCanvasDimensions: () => {
    const { canvasAspectRatio } = get();
    const config = ASPECT_RATIOS[canvasAspectRatio];
    return { width: config.width, height: config.height };
  },

  getSelectedElement: () => {
    const { canvasElements, selectedCanvasElementId } = get();
    if (!selectedCanvasElementId) return null;
    return canvasElements.find((el) => el.id === selectedCanvasElementId) || null;
  },
});

// ============================================================================
// Selector Hooks (for use with shallow comparison)
// ============================================================================

/**
 * Selector for canvas dimensions
 */
export const selectCanvasDimensions = (state: CanvasSlice) => {
  const config = ASPECT_RATIOS[state.canvasAspectRatio];
  return { width: config.width, height: config.height };
};

/**
 * Selector for selected element
 */
export const selectSelectedElement = (state: CanvasSlice) => {
  if (!state.selectedCanvasElementId) return null;
  return state.canvasElements.find((el) => el.id === state.selectedCanvasElementId) || null;
};

/**
 * Selector for visible elements sorted by z-index
 */
export const selectVisibleElementsSorted = (state: CanvasSlice) => {
  return sortByZIndex(state.canvasElements.filter((el) => el.visible));
};

/**
 * Selector for checking if undo is available
 */
export const selectCanUndo = (state: CanvasSlice) => state.canvasHistoryIndex > 0;

/**
 * Selector for checking if redo is available
 */
export const selectCanRedo = (state: CanvasSlice) =>
  state.canvasHistoryIndex < state.canvasHistory.length - 1;
