'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useElementDrag, type SnapGuide } from '@/hooks/useElementDrag';
import { useElementResize, type ResizeHandle, type ResizeResult } from '@/hooks/useElementResize';
import type { Position, Size, BaseElement } from '@/lib/v2/types';

// ============================================================================
// Types
// ============================================================================

export interface ElementWrapperProps {
  element: BaseElement;
  scale: number;
  canvasWidth: number;
  canvasHeight: number;
  isSelected: boolean;
  otherElements?: Array<{ id: string; position: Position; size: Size }>;
  snapEnabled?: boolean;
  snapGridSize?: number;
  onSelect: (elementId: string) => void;
  onPositionChange: (elementId: string, position: Position) => void;
  onSizeChange: (elementId: string, size: Size) => void;
  onPositionAndSizeChange?: (elementId: string, position: Position, size: Size) => void;
  onDragStart?: (elementId: string) => void;
  onDragEnd?: (elementId: string) => void;
  onResizeStart?: (elementId: string) => void;
  onResizeEnd?: (elementId: string) => void;
  onGuidesChange?: (guides: SnapGuide[]) => void;
  children: React.ReactNode;
}

// ============================================================================
// Constants
// ============================================================================

const HANDLE_SIZE = 10;
const NUDGE_AMOUNT = 1; // Pixels to move per arrow key press
const NUDGE_LARGE = 10; // Pixels to move with shift held

const RESIZE_HANDLES: ResizeHandle[] = [
  'top-left',
  'top-center',
  'top-right',
  'middle-left',
  'middle-right',
  'bottom-left',
  'bottom-center',
  'bottom-right',
];

// ============================================================================
// Helper Functions
// ============================================================================

function convertToPixels(value: number, unit: 'px' | '%', containerSize: number): number {
  return unit === '%' ? (value / 100) * containerSize : value;
}

function getHandleStyle(handle: ResizeHandle): React.CSSProperties {
  const base: React.CSSProperties = {
    position: 'absolute',
    width: HANDLE_SIZE,
    height: HANDLE_SIZE,
    backgroundColor: '#FFFFFF',
    border: '2px solid #3B82F6',
    borderRadius: 2,
    zIndex: 100,
    transform: 'translate(-50%, -50%)',
  };

  switch (handle) {
    case 'top-left':
      return { ...base, top: 0, left: 0, cursor: 'nwse-resize' };
    case 'top-center':
      return { ...base, top: 0, left: '50%', cursor: 'ns-resize' };
    case 'top-right':
      return { ...base, top: 0, left: '100%', cursor: 'nesw-resize' };
    case 'middle-left':
      return { ...base, top: '50%', left: 0, cursor: 'ew-resize' };
    case 'middle-right':
      return { ...base, top: '50%', left: '100%', cursor: 'ew-resize' };
    case 'bottom-left':
      return { ...base, top: '100%', left: 0, cursor: 'nesw-resize' };
    case 'bottom-center':
      return { ...base, top: '100%', left: '50%', cursor: 'ns-resize' };
    case 'bottom-right':
      return { ...base, top: '100%', left: '100%', cursor: 'nwse-resize' };
    default:
      return base;
  }
}

// ============================================================================
// Component
// ============================================================================

export function ElementWrapper({
  element,
  scale,
  canvasWidth,
  canvasHeight,
  isSelected,
  otherElements = [],
  snapEnabled = true,
  snapGridSize = 10,
  onSelect,
  onPositionChange,
  onSizeChange,
  onPositionAndSizeChange,
  onDragStart,
  onDragEnd,
  onResizeStart,
  onResizeEnd,
  onGuidesChange,
  children,
}: ElementWrapperProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  const isLocked = element.locked ?? false;

  // Drag hook
  const {
    dragState,
    dragHandlers,
    activeGuides,
    position: dragPosition,
  } = useElementDrag({
    elementId: element.id,
    initialPosition: element.position,
    elementSize: element.size,
    scale,
    isLocked,
    canvasWidth,
    canvasHeight,
    snapConfig: {
      enabled: snapEnabled,
      gridSize: snapGridSize,
      snapToElements: true,
      snapToCenter: true,
      snapToEdges: true,
      threshold: 8,
    },
    otherElements,
    onDragStart: (id) => {
      onDragStart?.(id);
    },
    onDragMove: (id, pos, guides) => {
      onPositionChange(id, pos);
      onGuidesChange?.(guides);
    },
    onDragEnd: (id, pos) => {
      onPositionChange(id, pos);
      onGuidesChange?.([]);
      onDragEnd?.(id);
    },
  });

  // Resize hook
  const {
    resizeState,
    position: resizePosition,
    size: resizeSize,
    getHandleProps,
  } = useElementResize({
    elementId: element.id,
    initialPosition: element.position,
    initialSize: element.size,
    scale,
    isLocked,
    canvasWidth,
    canvasHeight,
    constraints: {
      minWidth: 20,
      minHeight: 20,
      maxWidth: canvasWidth,
      maxHeight: canvasHeight,
      maintainAspectRatio: false,
    },
    onResizeStart: (id) => {
      onResizeStart?.(id);
    },
    onResizeMove: (id, result) => {
      if (onPositionAndSizeChange) {
        onPositionAndSizeChange(id, result.position, result.size);
      } else {
        onPositionChange(id, result.position);
        onSizeChange(id, result.size);
      }
    },
    onResizeEnd: (id, result) => {
      if (onPositionAndSizeChange) {
        onPositionAndSizeChange(id, result.position, result.size);
      } else {
        onPositionChange(id, result.position);
        onSizeChange(id, result.size);
      }
      onResizeEnd?.(id);
    },
  });

  // Determine current position and size
  const currentPosition = resizeState.isResizing ? resizePosition : dragPosition;
  const currentSize = resizeState.isResizing ? resizeSize : element.size;

  // Calculate pixel positions
  const posX = convertToPixels(currentPosition.x, currentPosition.unit, canvasWidth);
  const posY = convertToPixels(currentPosition.y, currentPosition.unit, canvasHeight);
  const width = convertToPixels(currentSize.width, currentSize.unit, canvasWidth);
  const height = convertToPixels(currentSize.height, currentSize.unit, canvasHeight);

  // Keyboard nudge handler
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!isSelected || isLocked) return;

      const nudgeAmount = e.shiftKey ? NUDGE_LARGE : NUDGE_AMOUNT;
      let newX = posX;
      let newY = posY;

      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          newY = Math.max(0, posY - nudgeAmount);
          break;
        case 'ArrowDown':
          e.preventDefault();
          newY = Math.min(canvasHeight - height, posY + nudgeAmount);
          break;
        case 'ArrowLeft':
          e.preventDefault();
          newX = Math.max(0, posX - nudgeAmount);
          break;
        case 'ArrowRight':
          e.preventDefault();
          newX = Math.min(canvasWidth - width, posX + nudgeAmount);
          break;
        case 'Delete':
        case 'Backspace':
          // Could trigger delete callback here if needed
          break;
        default:
          return;
      }

      if (newX !== posX || newY !== posY) {
        onPositionChange(element.id, { x: newX, y: newY, unit: 'px' });
      }
    },
    [isSelected, isLocked, posX, posY, width, height, canvasWidth, canvasHeight, onPositionChange, element.id]
  );

  // Click handler to select element
  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onSelect(element.id);
    },
    [element.id, onSelect]
  );

  // Focus management for keyboard events
  useEffect(() => {
    if (isSelected && wrapperRef.current) {
      wrapperRef.current.focus();
      setIsFocused(true);
    }
  }, [isSelected]);

  const handleFocus = useCallback(() => {
    setIsFocused(true);
  }, []);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
  }, []);

  // Update guides when dragging
  useEffect(() => {
    if (dragState.isDragging && activeGuides.length > 0) {
      onGuidesChange?.(activeGuides);
    }
  }, [dragState.isDragging, activeGuides, onGuidesChange]);

  // Styles
  const wrapperStyle: React.CSSProperties = {
    position: 'absolute',
    left: posX * scale,
    top: posY * scale,
    width: width * scale,
    height: height * scale,
    zIndex: element.zIndex + (dragState.isDragging || resizeState.isResizing ? 1000 : 0),
    opacity: element.opacity !== undefined ? element.opacity / 100 : 1,
    transform: element.rotation ? `rotate(${element.rotation}deg)` : undefined,
    visibility: element.enabled ? 'visible' : 'hidden',
    cursor: isLocked ? 'not-allowed' : dragState.isDragging ? 'grabbing' : 'grab',
    outline: 'none',
    userSelect: 'none',
    WebkitUserSelect: 'none',
    touchAction: 'none',
  };

  // Selection outline styles
  const selectionOutlineStyle: React.CSSProperties = {
    position: 'absolute',
    inset: -2,
    border: '2px solid #3B82F6',
    borderRadius: 2,
    pointerEvents: 'none',
    boxShadow: '0 0 0 1px rgba(59, 130, 246, 0.5)',
  };

  // Lock indicator style
  const lockIndicatorStyle: React.CSSProperties = {
    position: 'absolute',
    top: -24,
    left: '50%',
    transform: 'translateX(-50%)',
    padding: '2px 6px',
    backgroundColor: 'rgba(251, 191, 36, 0.9)',
    color: '#78350F',
    fontSize: 10,
    fontWeight: 600,
    borderRadius: 4,
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    whiteSpace: 'nowrap',
  };

  // Dragging indicator style
  const draggingIndicatorStyle: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    border: '2px dashed #3B82F6',
    borderRadius: 2,
    pointerEvents: 'none',
  };

  return (
    <div
      ref={wrapperRef}
      style={wrapperStyle}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onFocus={handleFocus}
      onBlur={handleBlur}
      tabIndex={isSelected ? 0 : -1}
      role="button"
      aria-label={`Canvas element: ${element.name || element.type}`}
      aria-selected={isSelected}
      data-element-id={element.id}
      data-element-type={element.type}
      data-locked={isLocked}
      {...(isLocked ? {} : dragHandlers)}
    >
      {/* Element content */}
      <div
        style={{
          width: '100%',
          height: '100%',
          pointerEvents: isLocked ? 'none' : 'auto',
        }}
      >
        {children}
      </div>

      {/* Selection outline */}
      {isSelected && <div style={selectionOutlineStyle} />}

      {/* Drag indicator */}
      {dragState.isDragging && <div style={draggingIndicatorStyle} />}

      {/* Lock indicator */}
      {isSelected && isLocked && (
        <div style={lockIndicatorStyle}>
          <LockIcon />
          <span>Locked</span>
        </div>
      )}

      {/* Resize handles - only show when selected and not locked */}
      {isSelected && !isLocked && (
        <>
          {RESIZE_HANDLES.map((handle) => {
            const handleProps = getHandleProps(handle);
            return (
              <div
                key={handle}
                {...handleProps}
                style={{
                  ...getHandleStyle(handle),
                  ...handleProps.style,
                  backgroundColor: resizeState.activeHandle === handle ? '#3B82F6' : '#FFFFFF',
                }}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  handleProps.onMouseDown(e);
                }}
                onTouchStart={(e) => {
                  e.stopPropagation();
                  handleProps.onTouchStart(e);
                }}
              />
            );
          })}
        </>
      )}

      {/* Position/Size indicator during drag/resize */}
      {(dragState.isDragging || resizeState.isResizing) && (
        <div
          style={{
            position: 'absolute',
            bottom: -24,
            left: '50%',
            transform: 'translateX(-50%)',
            padding: '2px 8px',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            color: '#FFFFFF',
            fontSize: 10,
            fontFamily: 'monospace',
            borderRadius: 4,
            whiteSpace: 'nowrap',
          }}
        >
          {resizeState.isResizing
            ? `${Math.round(width)}x${Math.round(height)}`
            : `${Math.round(posX)}, ${Math.round(posY)}`}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Icons
// ============================================================================

function LockIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

export default ElementWrapper;
