// Layer Manager for V2 Sharp Composer
// Handles element filtering, sorting, z-index management, and layer operations

import { BaseElement, CanvasElement } from './types';

// ============================================================================
// Element Filtering
// ============================================================================

/**
 * Filter elements by enabled state and sort by z-index
 * Returns elements in render order (lower z-index first = bottom layer)
 */
export function getActiveElements<T extends BaseElement>(elements: T[]): T[] {
  return elements
    .filter(el => el.enabled)
    .sort((a, b) => a.zIndex - b.zIndex);
}

/**
 * Get elements of a specific type
 */
export function getElementsByType<T extends CanvasElement>(
  elements: CanvasElement[],
  type: CanvasElement['type']
): T[] {
  return elements.filter(el => el.type === type) as T[];
}

/**
 * Get hero element (there should only be one)
 */
export function getHeroElement(elements: CanvasElement[]): CanvasElement | undefined {
  return elements.find(el => el.type === 'hero' && el.enabled);
}

/**
 * Get non-hero elements sorted by z-index
 */
export function getNonHeroElements(elements: CanvasElement[]): CanvasElement[] {
  return getActiveElements(elements.filter(el => el.type !== 'hero'));
}

// ============================================================================
// Element Toggle
// ============================================================================

/**
 * Toggle element visibility
 */
export function toggleElement<T extends BaseElement>(
  elements: T[],
  elementId: string,
  enabled?: boolean
): T[] {
  return elements.map(el => {
    if (el.id === elementId) {
      return { ...el, enabled: enabled ?? !el.enabled };
    }
    return el;
  });
}

/**
 * Enable all elements
 */
export function enableAllElements<T extends BaseElement>(elements: T[]): T[] {
  return elements.map(el => ({ ...el, enabled: true }));
}

/**
 * Disable all elements
 */
export function disableAllElements<T extends BaseElement>(elements: T[]): T[] {
  return elements.map(el => ({ ...el, enabled: false }));
}

/**
 * Toggle multiple elements at once
 */
export function toggleElements<T extends BaseElement>(
  elements: T[],
  elementIds: string[],
  enabled: boolean
): T[] {
  const idSet = new Set(elementIds);
  return elements.map(el => {
    if (idSet.has(el.id)) {
      return { ...el, enabled };
    }
    return el;
  });
}

// ============================================================================
// Z-Index Management
// ============================================================================

/**
 * Reorder elements by z-index
 */
export function reorderLayers<T extends BaseElement>(
  elements: T[],
  elementId: string,
  direction: 'up' | 'down' | 'top' | 'bottom'
): T[] {
  const sorted = [...elements].sort((a, b) => a.zIndex - b.zIndex);
  const index = sorted.findIndex(el => el.id === elementId);

  if (index === -1) return elements;

  const element = sorted[index];
  let newIndex: number;

  switch (direction) {
    case 'up':
      newIndex = Math.min(index + 1, sorted.length - 1);
      break;
    case 'down':
      newIndex = Math.max(index - 1, 0);
      break;
    case 'top':
      newIndex = sorted.length - 1;
      break;
    case 'bottom':
      newIndex = 0;
      break;
  }

  // Remove and reinsert
  sorted.splice(index, 1);
  sorted.splice(newIndex, 0, element);

  // Reassign z-index values
  return sorted.map((el, i) => ({ ...el, zIndex: i }));
}

/**
 * Move element to specific z-index
 */
export function moveToZIndex<T extends BaseElement>(
  elements: T[],
  elementId: string,
  targetZIndex: number
): T[] {
  const sorted = [...elements].sort((a, b) => a.zIndex - b.zIndex);
  const currentIndex = sorted.findIndex(el => el.id === elementId);

  if (currentIndex === -1) return elements;

  const newIndex = Math.max(0, Math.min(targetZIndex, sorted.length - 1));
  const element = sorted[currentIndex];

  // Remove and reinsert at new position
  sorted.splice(currentIndex, 1);
  sorted.splice(newIndex, 0, element);

  // Reassign z-index values
  return sorted.map((el, i) => ({ ...el, zIndex: i }));
}

/**
 * Swap z-index of two elements
 */
export function swapZIndex<T extends BaseElement>(
  elements: T[],
  elementId1: string,
  elementId2: string
): T[] {
  const el1 = elements.find(el => el.id === elementId1);
  const el2 = elements.find(el => el.id === elementId2);

  if (!el1 || !el2) return elements;

  const zIndex1 = el1.zIndex;
  const zIndex2 = el2.zIndex;

  return elements.map(el => {
    if (el.id === elementId1) {
      return { ...el, zIndex: zIndex2 };
    }
    if (el.id === elementId2) {
      return { ...el, zIndex: zIndex1 };
    }
    return el;
  });
}

/**
 * Normalize z-indices to be sequential starting from 0
 */
export function normalizeZIndices<T extends BaseElement>(elements: T[]): T[] {
  const sorted = [...elements].sort((a, b) => a.zIndex - b.zIndex);
  return sorted.map((el, i) => ({ ...el, zIndex: i }));
}

/**
 * Get the next available z-index (for new elements)
 */
export function getNextZIndex<T extends BaseElement>(elements: T[]): number {
  if (elements.length === 0) return 0;
  const maxZIndex = Math.max(...elements.map(el => el.zIndex));
  return maxZIndex + 1;
}

// ============================================================================
// Element CRUD Operations
// ============================================================================

/**
 * Add new element with proper z-index
 */
export function addElement<T extends BaseElement>(
  elements: T[],
  newElement: Omit<T, 'zIndex'>
): T[] {
  const zIndex = getNextZIndex(elements);
  return [...elements, { ...newElement, zIndex } as T];
}

/**
 * Remove element by ID
 */
export function removeElement<T extends BaseElement>(
  elements: T[],
  elementId: string
): T[] {
  const filtered = elements.filter(el => el.id !== elementId);
  return normalizeZIndices(filtered);
}

/**
 * Update element properties
 */
export function updateElement<T extends BaseElement>(
  elements: T[],
  elementId: string,
  updates: Partial<T>
): T[] {
  return elements.map(el => {
    if (el.id === elementId) {
      return { ...el, ...updates };
    }
    return el;
  });
}

/**
 * Duplicate element
 */
export function duplicateElement<T extends BaseElement>(
  elements: T[],
  elementId: string,
  newId: string,
  positionOffset: { x: number; y: number } = { x: 20, y: 20 }
): T[] {
  const original = elements.find(el => el.id === elementId);
  if (!original) return elements;

  const duplicate: T = {
    ...original,
    id: newId,
    zIndex: getNextZIndex(elements),
    position: {
      ...original.position,
      x: original.position.x + positionOffset.x,
      y: original.position.y + positionOffset.y
    },
    name: original.name ? `${original.name} (copy)` : undefined
  };

  return [...elements, duplicate];
}

// ============================================================================
// Element Selection
// ============================================================================

/**
 * Find element by ID
 */
export function findElement<T extends BaseElement>(
  elements: T[],
  elementId: string
): T | undefined {
  return elements.find(el => el.id === elementId);
}

/**
 * Check if element exists
 */
export function hasElement<T extends BaseElement>(
  elements: T[],
  elementId: string
): boolean {
  return elements.some(el => el.id === elementId);
}

/**
 * Get elements at a specific position (for hit testing)
 */
export function getElementsAtPosition<T extends BaseElement>(
  elements: T[],
  x: number,
  y: number,
  canvasWidth: number,
  canvasHeight: number
): T[] {
  return getActiveElements(elements).filter(el => {
    // Resolve position and size to pixels
    const pos = {
      x: el.position.unit === 'px' ? el.position.x : (el.position.x / 100) * canvasWidth,
      y: el.position.unit === 'px' ? el.position.y : (el.position.y / 100) * canvasHeight
    };
    const size = {
      width: el.size.unit === 'px' ? el.size.width : (el.size.width / 100) * canvasWidth,
      height: el.size.unit === 'px' ? el.size.height : (el.size.height / 100) * canvasHeight
    };

    return (
      x >= pos.x &&
      x <= pos.x + size.width &&
      y >= pos.y &&
      y <= pos.y + size.height
    );
  }).reverse(); // Return in top-to-bottom order (highest z-index first)
}

/**
 * Get topmost element at position
 */
export function getTopmostElementAtPosition<T extends BaseElement>(
  elements: T[],
  x: number,
  y: number,
  canvasWidth: number,
  canvasHeight: number
): T | undefined {
  const elementsAtPos = getElementsAtPosition(elements, x, y, canvasWidth, canvasHeight);
  return elementsAtPos[0];
}

// ============================================================================
// Layer Grouping
// ============================================================================

/**
 * Group elements by type for organized rendering
 * Returns elements in recommended render order
 */
export function groupElementsByRenderOrder(elements: CanvasElement[]): Map<string, CanvasElement[]> {
  const renderOrder = [
    'hero',
    'shape',
    'image',
    'callout',
    'logo',
    'text',
    'badge',
    'price-tag',
    'cta-button'
  ];

  const groups = new Map<string, CanvasElement[]>();

  // Initialize all groups
  for (const type of renderOrder) {
    groups.set(type, []);
  }

  // Group elements
  for (const element of elements) {
    if (element.enabled) {
      const group = groups.get(element.type);
      if (group) {
        group.push(element);
      }
    }
  }

  // Sort each group by z-index
  for (const [, group] of groups) {
    group.sort((a, b) => a.zIndex - b.zIndex);
  }

  return groups;
}

/**
 * Flatten grouped elements back to array in render order
 */
export function flattenRenderOrder(groups: Map<string, CanvasElement[]>): CanvasElement[] {
  const result: CanvasElement[] = [];

  // Follow the render order from groupElementsByRenderOrder
  const renderOrder = [
    'hero',
    'shape',
    'image',
    'callout',
    'logo',
    'text',
    'badge',
    'price-tag',
    'cta-button'
  ];

  for (const type of renderOrder) {
    const group = groups.get(type);
    if (group) {
      result.push(...group);
    }
  }

  return result;
}

// ============================================================================
// Validation
// ============================================================================

/**
 * Check if z-indices are valid (no duplicates, sequential)
 */
export function validateZIndices<T extends BaseElement>(elements: T[]): {
  valid: boolean;
  hasDuplicates: boolean;
  hasGaps: boolean;
} {
  const zIndices = elements.map(el => el.zIndex).sort((a, b) => a - b);
  const uniqueZIndices = new Set(zIndices);

  const hasDuplicates = uniqueZIndices.size !== zIndices.length;
  const hasGaps = zIndices.some((z, i) => z !== i);

  return {
    valid: !hasDuplicates && !hasGaps,
    hasDuplicates,
    hasGaps
  };
}

/**
 * Fix z-index issues (duplicates, gaps)
 */
export function fixZIndexIssues<T extends BaseElement>(elements: T[]): T[] {
  return normalizeZIndices(elements);
}
