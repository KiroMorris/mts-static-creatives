// Combined Elements Store (V2)
// Combines elements slice and brand slice into a single store for the canvas editor

import { create } from 'zustand';
import { createElementsSlice, type ElementsSlice } from './elementsSlice';
import { createBrandSlice, type BrandSlice } from './brandSlice';

// ============================================================================
// Combined Store Type
// ============================================================================

export type ElementsStore = ElementsSlice & BrandSlice;

// ============================================================================
// Create Combined Store
// ============================================================================

export const useElementsStore = create<ElementsStore>()((...args) => ({
  ...createElementsSlice(...args),
  ...createBrandSlice(...args),
}));
