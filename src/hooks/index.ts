// Canvas & Layout System Hooks
// Part 3: Drag-Drop and Resize System
// Part 4: Keyboard Shortcuts

export { useElementDrag } from './useElementDrag';
export type {
  DragState,
  DragConstraints,
  SnapGuide,
  SnapConfig,
  UseElementDragOptions,
  UseElementDragReturn,
} from './useElementDrag';

export { useElementResize } from './useElementResize';
export type {
  ResizeHandle,
  ResizeState,
  ResizeConstraints,
  ResizeResult,
  UseElementResizeOptions,
  UseElementResizeReturn,
} from './useElementResize';

export {
  useElementKeyboardShortcuts,
  KEYBOARD_SHORTCUTS,
} from './useElementKeyboardShortcuts';
