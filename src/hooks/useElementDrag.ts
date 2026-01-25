'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import type { Position, Size } from '@/lib/v2/types';

// ============================================================================
// Types
// ============================================================================

export interface DragState {
  isDragging: boolean;
  startPosition: { x: number; y: number } | null;
  currentPosition: { x: number; y: number } | null;
  delta: { x: number; y: number };
}

export interface DragConstraints {
  minX?: number;
  maxX?: number;
  minY?: number;
  maxY?: number;
}

export interface SnapGuide {
  type: 'horizontal' | 'vertical';
  position: number;
  label?: string;
}

export interface SnapConfig {
  enabled: boolean;
  gridSize: number;
  snapToElements: boolean;
  snapToCenter: boolean;
  snapToEdges: boolean;
  threshold: number; // Snap threshold in pixels
}

export interface UseElementDragOptions {
  elementId: string;
  initialPosition: Position;
  elementSize: Size;
  scale: number;
  isLocked: boolean;
  canvasWidth: number;
  canvasHeight: number;
  constraints?: DragConstraints;
  snapConfig?: Partial<SnapConfig>;
  otherElements?: Array<{ id: string; position: Position; size: Size }>;
  onDragStart?: (elementId: string) => void;
  onDragMove?: (elementId: string, newPosition: Position, guides: SnapGuide[]) => void;
  onDragEnd?: (elementId: string, finalPosition: Position) => void;
}

export interface UseElementDragReturn {
  dragState: DragState;
  dragHandlers: {
    onMouseDown: (e: React.MouseEvent) => void;
    onTouchStart: (e: React.TouchEvent) => void;
  };
  activeGuides: SnapGuide[];
  position: Position;
}

// ============================================================================
// Default Config
// ============================================================================

const DEFAULT_SNAP_CONFIG: SnapConfig = {
  enabled: true,
  gridSize: 10,
  snapToElements: true,
  snapToCenter: true,
  snapToEdges: true,
  threshold: 8,
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Snap a value to the nearest grid point
 */
function snapToGrid(value: number, gridSize: number): number {
  return Math.round(value / gridSize) * gridSize;
}

/**
 * Convert position based on unit type (px or %)
 */
function convertToPixels(value: number, unit: 'px' | '%', containerSize: number): number {
  return unit === '%' ? (value / 100) * containerSize : value;
}

/**
 * Calculate alignment guides and snap position
 */
function calculateSnapPosition(
  currentPos: { x: number; y: number },
  elementSize: Size,
  canvasWidth: number,
  canvasHeight: number,
  snapConfig: SnapConfig,
  otherElements: Array<{ id: string; position: Position; size: Size }>
): { position: { x: number; y: number }; guides: SnapGuide[] } {
  const guides: SnapGuide[] = [];
  let snappedX = currentPos.x;
  let snappedY = currentPos.y;

  const elWidth = convertToPixels(elementSize.width, elementSize.unit, canvasWidth);
  const elHeight = convertToPixels(elementSize.height, elementSize.unit, canvasHeight);

  // Element bounds
  const left = currentPos.x;
  const right = currentPos.x + elWidth;
  const top = currentPos.y;
  const bottom = currentPos.y + elHeight;
  const centerX = currentPos.x + elWidth / 2;
  const centerY = currentPos.y + elHeight / 2;

  // Grid snapping
  if (snapConfig.enabled && snapConfig.gridSize > 0) {
    const gridSnappedX = snapToGrid(currentPos.x, snapConfig.gridSize);
    const gridSnappedY = snapToGrid(currentPos.y, snapConfig.gridSize);

    if (Math.abs(gridSnappedX - currentPos.x) < snapConfig.threshold) {
      snappedX = gridSnappedX;
    }
    if (Math.abs(gridSnappedY - currentPos.y) < snapConfig.threshold) {
      snappedY = gridSnappedY;
    }
  }

  // Canvas center snapping
  if (snapConfig.snapToCenter) {
    const canvasCenterX = canvasWidth / 2;
    const canvasCenterY = canvasHeight / 2;

    // Horizontal center
    if (Math.abs(centerX - canvasCenterX) < snapConfig.threshold) {
      snappedX = canvasCenterX - elWidth / 2;
      guides.push({ type: 'vertical', position: canvasCenterX, label: 'Center' });
    }

    // Vertical center
    if (Math.abs(centerY - canvasCenterY) < snapConfig.threshold) {
      snappedY = canvasCenterY - elHeight / 2;
      guides.push({ type: 'horizontal', position: canvasCenterY, label: 'Center' });
    }
  }

  // Canvas edge snapping
  if (snapConfig.snapToEdges) {
    // Left edge
    if (Math.abs(left) < snapConfig.threshold) {
      snappedX = 0;
      guides.push({ type: 'vertical', position: 0, label: 'Left Edge' });
    }
    // Right edge
    if (Math.abs(right - canvasWidth) < snapConfig.threshold) {
      snappedX = canvasWidth - elWidth;
      guides.push({ type: 'vertical', position: canvasWidth, label: 'Right Edge' });
    }
    // Top edge
    if (Math.abs(top) < snapConfig.threshold) {
      snappedY = 0;
      guides.push({ type: 'horizontal', position: 0, label: 'Top Edge' });
    }
    // Bottom edge
    if (Math.abs(bottom - canvasHeight) < snapConfig.threshold) {
      snappedY = canvasHeight - elHeight;
      guides.push({ type: 'horizontal', position: canvasHeight, label: 'Bottom Edge' });
    }
  }

  // Element-to-element snapping
  if (snapConfig.snapToElements && otherElements.length > 0) {
    for (const other of otherElements) {
      const otherX = convertToPixels(other.position.x, other.position.unit, canvasWidth);
      const otherY = convertToPixels(other.position.y, other.position.unit, canvasHeight);
      const otherWidth = convertToPixels(other.size.width, other.size.unit, canvasWidth);
      const otherHeight = convertToPixels(other.size.height, other.size.unit, canvasHeight);

      const otherLeft = otherX;
      const otherRight = otherX + otherWidth;
      const otherTop = otherY;
      const otherBottom = otherY + otherHeight;
      const otherCenterX = otherX + otherWidth / 2;
      const otherCenterY = otherY + otherHeight / 2;

      // Left-to-left alignment
      if (Math.abs(left - otherLeft) < snapConfig.threshold) {
        snappedX = otherLeft;
        guides.push({ type: 'vertical', position: otherLeft });
      }
      // Right-to-right alignment
      if (Math.abs(right - otherRight) < snapConfig.threshold) {
        snappedX = otherRight - elWidth;
        guides.push({ type: 'vertical', position: otherRight });
      }
      // Left-to-right alignment
      if (Math.abs(left - otherRight) < snapConfig.threshold) {
        snappedX = otherRight;
        guides.push({ type: 'vertical', position: otherRight });
      }
      // Right-to-left alignment
      if (Math.abs(right - otherLeft) < snapConfig.threshold) {
        snappedX = otherLeft - elWidth;
        guides.push({ type: 'vertical', position: otherLeft });
      }
      // Center-X alignment
      if (Math.abs(centerX - otherCenterX) < snapConfig.threshold) {
        snappedX = otherCenterX - elWidth / 2;
        guides.push({ type: 'vertical', position: otherCenterX });
      }

      // Top-to-top alignment
      if (Math.abs(top - otherTop) < snapConfig.threshold) {
        snappedY = otherTop;
        guides.push({ type: 'horizontal', position: otherTop });
      }
      // Bottom-to-bottom alignment
      if (Math.abs(bottom - otherBottom) < snapConfig.threshold) {
        snappedY = otherBottom - elHeight;
        guides.push({ type: 'horizontal', position: otherBottom });
      }
      // Top-to-bottom alignment
      if (Math.abs(top - otherBottom) < snapConfig.threshold) {
        snappedY = otherBottom;
        guides.push({ type: 'horizontal', position: otherBottom });
      }
      // Bottom-to-top alignment
      if (Math.abs(bottom - otherTop) < snapConfig.threshold) {
        snappedY = otherTop - elHeight;
        guides.push({ type: 'horizontal', position: otherTop });
      }
      // Center-Y alignment
      if (Math.abs(centerY - otherCenterY) < snapConfig.threshold) {
        snappedY = otherCenterY - elHeight / 2;
        guides.push({ type: 'horizontal', position: otherCenterY });
      }
    }
  }

  return { position: { x: snappedX, y: snappedY }, guides };
}

// ============================================================================
// Hook Implementation
// ============================================================================

export function useElementDrag(options: UseElementDragOptions): UseElementDragReturn {
  const {
    elementId,
    initialPosition,
    elementSize,
    scale,
    isLocked,
    canvasWidth,
    canvasHeight,
    constraints,
    snapConfig: userSnapConfig,
    otherElements = [],
    onDragStart,
    onDragMove,
    onDragEnd,
  } = options;

  const snapConfig = { ...DEFAULT_SNAP_CONFIG, ...userSnapConfig };

  // State
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    startPosition: null,
    currentPosition: null,
    delta: { x: 0, y: 0 },
  });

  const [position, setPosition] = useState<Position>(initialPosition);
  const [activeGuides, setActiveGuides] = useState<SnapGuide[]>([]);

  // Refs for event handling
  const startPosRef = useRef<{ x: number; y: number } | null>(null);
  const elementStartRef = useRef<{ x: number; y: number } | null>(null);

  // Update position when initialPosition changes
  useEffect(() => {
    setPosition(initialPosition);
  }, [initialPosition]);

  // Handle mouse move during drag
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!startPosRef.current || !elementStartRef.current || isLocked) return;

      const deltaX = (e.clientX - startPosRef.current.x) / scale;
      const deltaY = (e.clientY - startPosRef.current.y) / scale;

      let newX = elementStartRef.current.x + deltaX;
      let newY = elementStartRef.current.y + deltaY;

      // Apply constraints
      if (constraints) {
        if (constraints.minX !== undefined) newX = Math.max(constraints.minX, newX);
        if (constraints.maxX !== undefined) newX = Math.min(constraints.maxX, newX);
        if (constraints.minY !== undefined) newY = Math.max(constraints.minY, newY);
        if (constraints.maxY !== undefined) newY = Math.min(constraints.maxY, newY);
      }

      // Constrain to canvas bounds
      const elWidth = convertToPixels(elementSize.width, elementSize.unit, canvasWidth);
      const elHeight = convertToPixels(elementSize.height, elementSize.unit, canvasHeight);
      newX = Math.max(0, Math.min(newX, canvasWidth - elWidth));
      newY = Math.max(0, Math.min(newY, canvasHeight - elHeight));

      // Calculate snap position and guides
      const { position: snappedPos, guides } = calculateSnapPosition(
        { x: newX, y: newY },
        elementSize,
        canvasWidth,
        canvasHeight,
        snapConfig,
        otherElements.filter((el) => el.id !== elementId)
      );

      const newPosition: Position = {
        x: snappedPos.x,
        y: snappedPos.y,
        unit: 'px',
      };

      setPosition(newPosition);
      setActiveGuides(guides);
      setDragState((prev) => ({
        ...prev,
        currentPosition: { x: e.clientX, y: e.clientY },
        delta: { x: deltaX, y: deltaY },
      }));

      onDragMove?.(elementId, newPosition, guides);
    },
    [
      isLocked,
      scale,
      constraints,
      elementSize,
      canvasWidth,
      canvasHeight,
      snapConfig,
      otherElements,
      elementId,
      onDragMove,
    ]
  );

  // Handle mouse up to end drag
  const handleMouseUp = useCallback(() => {
    if (startPosRef.current) {
      setDragState({
        isDragging: false,
        startPosition: null,
        currentPosition: null,
        delta: { x: 0, y: 0 },
      });
      setActiveGuides([]);
      onDragEnd?.(elementId, position);
    }

    startPosRef.current = null;
    elementStartRef.current = null;

    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mouseup', handleMouseUp);
  }, [elementId, position, onDragEnd, handleMouseMove]);

  // Handle mouse down to start drag
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (isLocked) return;

      e.preventDefault();
      e.stopPropagation();

      const x = convertToPixels(position.x, position.unit, canvasWidth);
      const y = convertToPixels(position.y, position.unit, canvasHeight);

      startPosRef.current = { x: e.clientX, y: e.clientY };
      elementStartRef.current = { x, y };

      setDragState({
        isDragging: true,
        startPosition: { x: e.clientX, y: e.clientY },
        currentPosition: { x: e.clientX, y: e.clientY },
        delta: { x: 0, y: 0 },
      });

      onDragStart?.(elementId);

      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    },
    [isLocked, position, canvasWidth, canvasHeight, elementId, onDragStart, handleMouseMove, handleMouseUp]
  );

  // Handle touch events for mobile support
  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!startPosRef.current || !elementStartRef.current || isLocked) return;

      const touch = e.touches[0];
      const deltaX = (touch.clientX - startPosRef.current.x) / scale;
      const deltaY = (touch.clientY - startPosRef.current.y) / scale;

      let newX = elementStartRef.current.x + deltaX;
      let newY = elementStartRef.current.y + deltaY;

      // Apply constraints
      if (constraints) {
        if (constraints.minX !== undefined) newX = Math.max(constraints.minX, newX);
        if (constraints.maxX !== undefined) newX = Math.min(constraints.maxX, newX);
        if (constraints.minY !== undefined) newY = Math.max(constraints.minY, newY);
        if (constraints.maxY !== undefined) newY = Math.min(constraints.maxY, newY);
      }

      // Constrain to canvas bounds
      const elWidth = convertToPixels(elementSize.width, elementSize.unit, canvasWidth);
      const elHeight = convertToPixels(elementSize.height, elementSize.unit, canvasHeight);
      newX = Math.max(0, Math.min(newX, canvasWidth - elWidth));
      newY = Math.max(0, Math.min(newY, canvasHeight - elHeight));

      const { position: snappedPos, guides } = calculateSnapPosition(
        { x: newX, y: newY },
        elementSize,
        canvasWidth,
        canvasHeight,
        snapConfig,
        otherElements.filter((el) => el.id !== elementId)
      );

      const newPosition: Position = {
        x: snappedPos.x,
        y: snappedPos.y,
        unit: 'px',
      };

      setPosition(newPosition);
      setActiveGuides(guides);
      onDragMove?.(elementId, newPosition, guides);
    },
    [
      isLocked,
      scale,
      constraints,
      elementSize,
      canvasWidth,
      canvasHeight,
      snapConfig,
      otherElements,
      elementId,
      onDragMove,
    ]
  );

  const handleTouchEnd = useCallback(() => {
    if (startPosRef.current) {
      setDragState({
        isDragging: false,
        startPosition: null,
        currentPosition: null,
        delta: { x: 0, y: 0 },
      });
      setActiveGuides([]);
      onDragEnd?.(elementId, position);
    }

    startPosRef.current = null;
    elementStartRef.current = null;

    window.removeEventListener('touchmove', handleTouchMove);
    window.removeEventListener('touchend', handleTouchEnd);
  }, [elementId, position, onDragEnd, handleTouchMove]);

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (isLocked) return;

      const touch = e.touches[0];
      const x = convertToPixels(position.x, position.unit, canvasWidth);
      const y = convertToPixels(position.y, position.unit, canvasHeight);

      startPosRef.current = { x: touch.clientX, y: touch.clientY };
      elementStartRef.current = { x, y };

      setDragState({
        isDragging: true,
        startPosition: { x: touch.clientX, y: touch.clientY },
        currentPosition: { x: touch.clientX, y: touch.clientY },
        delta: { x: 0, y: 0 },
      });

      onDragStart?.(elementId);

      window.addEventListener('touchmove', handleTouchMove, { passive: false });
      window.addEventListener('touchend', handleTouchEnd);
    },
    [isLocked, position, canvasWidth, canvasHeight, elementId, onDragStart, handleTouchMove, handleTouchEnd]
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

  return {
    dragState,
    dragHandlers: {
      onMouseDown: handleMouseDown,
      onTouchStart: handleTouchStart,
    },
    activeGuides,
    position,
  };
}

export default useElementDrag;
