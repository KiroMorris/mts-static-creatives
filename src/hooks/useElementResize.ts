'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import type { Position, Size } from '@/lib/v2/types';

// ============================================================================
// Types
// ============================================================================

export type ResizeHandle =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'middle-left'
  | 'middle-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right';

export interface ResizeState {
  isResizing: boolean;
  activeHandle: ResizeHandle | null;
  startPosition: { x: number; y: number } | null;
  originalBounds: { x: number; y: number; width: number; height: number } | null;
}

export interface ResizeConstraints {
  minWidth: number;
  minHeight: number;
  maxWidth: number;
  maxHeight: number;
  maintainAspectRatio: boolean;
  aspectRatio?: number; // width / height
}

export interface ResizeResult {
  position: Position;
  size: Size;
}

export interface UseElementResizeOptions {
  elementId: string;
  initialPosition: Position;
  initialSize: Size;
  scale: number;
  isLocked: boolean;
  canvasWidth: number;
  canvasHeight: number;
  constraints?: Partial<ResizeConstraints>;
  onResizeStart?: (elementId: string, handle: ResizeHandle) => void;
  onResizeMove?: (elementId: string, result: ResizeResult) => void;
  onResizeEnd?: (elementId: string, result: ResizeResult) => void;
}

export interface UseElementResizeReturn {
  resizeState: ResizeState;
  position: Position;
  size: Size;
  getHandleProps: (handle: ResizeHandle) => {
    onMouseDown: (e: React.MouseEvent) => void;
    onTouchStart: (e: React.TouchEvent) => void;
    style: React.CSSProperties;
    'data-handle': ResizeHandle;
  };
}

// ============================================================================
// Constants
// ============================================================================

const DEFAULT_CONSTRAINTS: ResizeConstraints = {
  minWidth: 20,
  minHeight: 20,
  maxWidth: 10000,
  maxHeight: 10000,
  maintainAspectRatio: false,
};

// Handle positions and cursors
const HANDLE_CONFIG: Record<
  ResizeHandle,
  {
    cursor: string;
    position: React.CSSProperties;
    affects: { x: boolean; y: boolean; width: boolean; height: boolean };
    xDir: -1 | 0 | 1;
    yDir: -1 | 0 | 1;
  }
> = {
  'top-left': {
    cursor: 'nwse-resize',
    position: { top: 0, left: 0 },
    affects: { x: true, y: true, width: true, height: true },
    xDir: -1,
    yDir: -1,
  },
  'top-center': {
    cursor: 'ns-resize',
    position: { top: 0, left: '50%' },
    affects: { x: false, y: true, width: false, height: true },
    xDir: 0,
    yDir: -1,
  },
  'top-right': {
    cursor: 'nesw-resize',
    position: { top: 0, right: 0 },
    affects: { x: false, y: true, width: true, height: true },
    xDir: 1,
    yDir: -1,
  },
  'middle-left': {
    cursor: 'ew-resize',
    position: { top: '50%', left: 0 },
    affects: { x: true, y: false, width: true, height: false },
    xDir: -1,
    yDir: 0,
  },
  'middle-right': {
    cursor: 'ew-resize',
    position: { top: '50%', right: 0 },
    affects: { x: false, y: false, width: true, height: false },
    xDir: 1,
    yDir: 0,
  },
  'bottom-left': {
    cursor: 'nesw-resize',
    position: { bottom: 0, left: 0 },
    affects: { x: true, y: false, width: true, height: true },
    xDir: -1,
    yDir: 1,
  },
  'bottom-center': {
    cursor: 'ns-resize',
    position: { bottom: 0, left: '50%' },
    affects: { x: false, y: false, width: false, height: true },
    xDir: 0,
    yDir: 1,
  },
  'bottom-right': {
    cursor: 'nwse-resize',
    position: { bottom: 0, right: 0 },
    affects: { x: false, y: false, width: true, height: true },
    xDir: 1,
    yDir: 1,
  },
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Convert position based on unit type (px or %)
 */
function convertToPixels(value: number, unit: 'px' | '%', containerSize: number): number {
  return unit === '%' ? (value / 100) * containerSize : value;
}

/**
 * Calculate new bounds based on resize handle and delta
 */
function calculateResizeBounds(
  handle: ResizeHandle,
  originalBounds: { x: number; y: number; width: number; height: number },
  deltaX: number,
  deltaY: number,
  constraints: ResizeConstraints,
  canvasWidth: number,
  canvasHeight: number
): { x: number; y: number; width: number; height: number } {
  const config = HANDLE_CONFIG[handle];
  let { x, y, width, height } = originalBounds;

  // Calculate new dimensions based on handle direction
  if (config.affects.width) {
    if (config.xDir === -1) {
      // Left handles - move left edge
      const newX = originalBounds.x + deltaX;
      const newWidth = originalBounds.width - deltaX;
      if (newWidth >= constraints.minWidth && newWidth <= constraints.maxWidth) {
        x = newX;
        width = newWidth;
      }
    } else if (config.xDir === 1) {
      // Right handles - expand right edge
      width = originalBounds.width + deltaX;
    }
  }

  if (config.affects.height) {
    if (config.yDir === -1) {
      // Top handles - move top edge
      const newY = originalBounds.y + deltaY;
      const newHeight = originalBounds.height - deltaY;
      if (newHeight >= constraints.minHeight && newHeight <= constraints.maxHeight) {
        y = newY;
        height = newHeight;
      }
    } else if (config.yDir === 1) {
      // Bottom handles - expand bottom edge
      height = originalBounds.height + deltaY;
    }
  }

  // Maintain aspect ratio if required
  if (constraints.maintainAspectRatio && constraints.aspectRatio) {
    const ratio = constraints.aspectRatio;

    // Determine primary direction based on handle
    if (handle === 'middle-left' || handle === 'middle-right') {
      // Width-based resize
      height = width / ratio;
      if (config.yDir === -1) {
        y = originalBounds.y + originalBounds.height - height;
      }
    } else if (handle === 'top-center' || handle === 'bottom-center') {
      // Height-based resize
      width = height * ratio;
      if (config.xDir === -1) {
        x = originalBounds.x + originalBounds.width - width;
      }
    } else {
      // Corner handles - use the larger delta
      const aspectDeltaX = Math.abs(deltaX);
      const aspectDeltaY = Math.abs(deltaY);

      if (aspectDeltaX > aspectDeltaY) {
        height = width / ratio;
        if (config.yDir === -1) {
          y = originalBounds.y + originalBounds.height - height;
        }
      } else {
        width = height * ratio;
        if (config.xDir === -1) {
          x = originalBounds.x + originalBounds.width - width;
        }
      }
    }
  }

  // Apply constraints
  width = Math.max(constraints.minWidth, Math.min(width, constraints.maxWidth));
  height = Math.max(constraints.minHeight, Math.min(height, constraints.maxHeight));

  // Keep within canvas bounds
  if (x < 0) {
    width += x;
    x = 0;
  }
  if (y < 0) {
    height += y;
    y = 0;
  }
  if (x + width > canvasWidth) {
    width = canvasWidth - x;
  }
  if (y + height > canvasHeight) {
    height = canvasHeight - y;
  }

  // Re-apply minimum constraints after canvas bounds
  width = Math.max(constraints.minWidth, width);
  height = Math.max(constraints.minHeight, height);

  return { x, y, width, height };
}

// ============================================================================
// Hook Implementation
// ============================================================================

export function useElementResize(options: UseElementResizeOptions): UseElementResizeReturn {
  const {
    elementId,
    initialPosition,
    initialSize,
    scale,
    isLocked,
    canvasWidth,
    canvasHeight,
    constraints: userConstraints,
    onResizeStart,
    onResizeMove,
    onResizeEnd,
  } = options;

  const constraints = { ...DEFAULT_CONSTRAINTS, ...userConstraints };

  // State
  const [resizeState, setResizeState] = useState<ResizeState>({
    isResizing: false,
    activeHandle: null,
    startPosition: null,
    originalBounds: null,
  });

  const [position, setPosition] = useState<Position>(initialPosition);
  const [size, setSize] = useState<Size>(initialSize);

  // Refs
  const activeHandleRef = useRef<ResizeHandle | null>(null);
  const startPosRef = useRef<{ x: number; y: number } | null>(null);
  const originalBoundsRef = useRef<{ x: number; y: number; width: number; height: number } | null>(null);

  // Update state when initial values change
  useEffect(() => {
    setPosition(initialPosition);
  }, [initialPosition]);

  useEffect(() => {
    setSize(initialSize);
  }, [initialSize]);

  // Handle mouse move during resize
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!startPosRef.current || !originalBoundsRef.current || !activeHandleRef.current || isLocked) {
        return;
      }

      const deltaX = (e.clientX - startPosRef.current.x) / scale;
      const deltaY = (e.clientY - startPosRef.current.y) / scale;

      const newBounds = calculateResizeBounds(
        activeHandleRef.current,
        originalBoundsRef.current,
        deltaX,
        deltaY,
        constraints,
        canvasWidth,
        canvasHeight
      );

      const newPosition: Position = {
        x: newBounds.x,
        y: newBounds.y,
        unit: 'px',
      };

      const newSize: Size = {
        width: newBounds.width,
        height: newBounds.height,
        unit: 'px',
      };

      setPosition(newPosition);
      setSize(newSize);

      onResizeMove?.(elementId, { position: newPosition, size: newSize });
    },
    [isLocked, scale, constraints, canvasWidth, canvasHeight, elementId, onResizeMove]
  );

  // Handle mouse up to end resize
  const handleMouseUp = useCallback(() => {
    if (startPosRef.current) {
      const result: ResizeResult = { position, size };
      setResizeState({
        isResizing: false,
        activeHandle: null,
        startPosition: null,
        originalBounds: null,
      });
      onResizeEnd?.(elementId, result);
    }

    activeHandleRef.current = null;
    startPosRef.current = null;
    originalBoundsRef.current = null;

    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mouseup', handleMouseUp);
  }, [elementId, position, size, onResizeEnd, handleMouseMove]);

  // Handle mouse down on resize handle
  const handleMouseDown = useCallback(
    (handle: ResizeHandle) => (e: React.MouseEvent) => {
      if (isLocked) return;

      e.preventDefault();
      e.stopPropagation();

      const x = convertToPixels(position.x, position.unit, canvasWidth);
      const y = convertToPixels(position.y, position.unit, canvasHeight);
      const width = convertToPixels(size.width, size.unit, canvasWidth);
      const height = convertToPixels(size.height, size.unit, canvasHeight);

      activeHandleRef.current = handle;
      startPosRef.current = { x: e.clientX, y: e.clientY };
      originalBoundsRef.current = { x, y, width, height };

      setResizeState({
        isResizing: true,
        activeHandle: handle,
        startPosition: { x: e.clientX, y: e.clientY },
        originalBounds: { x, y, width, height },
      });

      onResizeStart?.(elementId, handle);

      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    },
    [isLocked, position, size, canvasWidth, canvasHeight, elementId, onResizeStart, handleMouseMove, handleMouseUp]
  );

  // Touch event handlers
  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!startPosRef.current || !originalBoundsRef.current || !activeHandleRef.current || isLocked) {
        return;
      }

      const touch = e.touches[0];
      const deltaX = (touch.clientX - startPosRef.current.x) / scale;
      const deltaY = (touch.clientY - startPosRef.current.y) / scale;

      const newBounds = calculateResizeBounds(
        activeHandleRef.current,
        originalBoundsRef.current,
        deltaX,
        deltaY,
        constraints,
        canvasWidth,
        canvasHeight
      );

      const newPosition: Position = {
        x: newBounds.x,
        y: newBounds.y,
        unit: 'px',
      };

      const newSize: Size = {
        width: newBounds.width,
        height: newBounds.height,
        unit: 'px',
      };

      setPosition(newPosition);
      setSize(newSize);

      onResizeMove?.(elementId, { position: newPosition, size: newSize });
    },
    [isLocked, scale, constraints, canvasWidth, canvasHeight, elementId, onResizeMove]
  );

  const handleTouchEnd = useCallback(() => {
    if (startPosRef.current) {
      const result: ResizeResult = { position, size };
      setResizeState({
        isResizing: false,
        activeHandle: null,
        startPosition: null,
        originalBounds: null,
      });
      onResizeEnd?.(elementId, result);
    }

    activeHandleRef.current = null;
    startPosRef.current = null;
    originalBoundsRef.current = null;

    window.removeEventListener('touchmove', handleTouchMove);
    window.removeEventListener('touchend', handleTouchEnd);
  }, [elementId, position, size, onResizeEnd, handleTouchMove]);

  const handleTouchStart = useCallback(
    (handle: ResizeHandle) => (e: React.TouchEvent) => {
      if (isLocked) return;

      const touch = e.touches[0];
      const x = convertToPixels(position.x, position.unit, canvasWidth);
      const y = convertToPixels(position.y, position.unit, canvasHeight);
      const width = convertToPixels(size.width, size.unit, canvasWidth);
      const height = convertToPixels(size.height, size.unit, canvasHeight);

      activeHandleRef.current = handle;
      startPosRef.current = { x: touch.clientX, y: touch.clientY };
      originalBoundsRef.current = { x, y, width, height };

      setResizeState({
        isResizing: true,
        activeHandle: handle,
        startPosition: { x: touch.clientX, y: touch.clientY },
        originalBounds: { x, y, width, height },
      });

      onResizeStart?.(elementId, handle);

      window.addEventListener('touchmove', handleTouchMove, { passive: false });
      window.addEventListener('touchend', handleTouchEnd);
    },
    [isLocked, position, size, canvasWidth, canvasHeight, elementId, onResizeStart, handleTouchMove, handleTouchEnd]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);

  // Generate props for each resize handle
  const getHandleProps = useCallback(
    (handle: ResizeHandle) => {
      const config = HANDLE_CONFIG[handle];
      return {
        onMouseDown: handleMouseDown(handle),
        onTouchStart: handleTouchStart(handle),
        style: {
          cursor: isLocked ? 'not-allowed' : config.cursor,
          ...config.position,
        } as React.CSSProperties,
        'data-handle': handle,
      };
    },
    [handleMouseDown, handleTouchStart, isLocked]
  );

  return {
    resizeState,
    position,
    size,
    getHandleProps,
  };
}

export default useElementResize;
