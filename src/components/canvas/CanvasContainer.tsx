'use client';

// CanvasContainer Component
// The main canvas wrapper that renders content at the selected aspect ratio
// Handles responsive scaling to fit the container while maintaining aspect ratio

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { AspectRatioId, ASPECT_RATIOS, CanvasBackground } from '@/types/canvas';
import {
  getCanvasDimensions,
  calculateCanvasScale,
  canvasToScreen,
  screenToCanvas,
} from '@/lib/canvas-utils';

// ============================================================================
// Types
// ============================================================================

interface CanvasContainerProps {
  /** The aspect ratio to render the canvas at */
  aspectRatio: AspectRatioId;

  /** Background configuration */
  background?: CanvasBackground;

  /** Additional padding around the canvas (default: 40) */
  padding?: number;

  /** Whether to show a border around the canvas */
  showBorder?: boolean;

  /** Whether to show a shadow effect */
  showShadow?: boolean;

  /** Optional CSS classes */
  className?: string;

  /** Canvas content to render */
  children?: React.ReactNode;

  /** Callback when canvas is clicked (with canvas coordinates) */
  onClick?: (canvasX: number, canvasY: number) => void;

  /** Callback when scale changes */
  onScaleChange?: (scale: number) => void;
}

// ============================================================================
// Background Renderer
// ============================================================================

function renderBackground(background: CanvasBackground): React.CSSProperties {
  switch (background.type) {
    case 'solid':
      return { backgroundColor: background.color };

    case 'gradient': {
      const stops = background.stops
        .sort((a, b) => a.position - b.position)
        .map((stop) => `${stop.color} ${stop.position}%`)
        .join(', ');

      const gradient =
        background.gradientType === 'radial'
          ? `radial-gradient(circle, ${stops})`
          : `linear-gradient(${background.angle}deg, ${stops})`;

      return { background: gradient };
    }

    case 'image': {
      const baseStyles: React.CSSProperties = {
        backgroundImage: `url(${background.imageUrl})`,
        backgroundPosition: `${background.position.x}% ${background.position.y}%`,
        opacity: background.opacity,
      };

      switch (background.fit) {
        case 'cover':
          return { ...baseStyles, backgroundSize: 'cover' };
        case 'contain':
          return { ...baseStyles, backgroundSize: 'contain', backgroundRepeat: 'no-repeat' };
        case 'fill':
          return { ...baseStyles, backgroundSize: '100% 100%' };
        case 'tile':
          return { ...baseStyles, backgroundSize: 'auto', backgroundRepeat: 'repeat' };
        default:
          return baseStyles;
      }
    }

    default:
      return { backgroundColor: '#18181b' };
  }
}

// ============================================================================
// Main Component
// ============================================================================

/**
 * CanvasContainer - The main canvas wrapper component
 *
 * Renders content at the selected aspect ratio, automatically scaling to fit
 * the container while maintaining the correct proportions. Uses ResizeObserver
 * for responsive scaling.
 *
 * Key features:
 * - Supports all 4 aspect ratios (9:16, 1:1, 4:5, 16:9)
 * - Auto-scales to fit container
 * - Handles background rendering (solid, gradient, image)
 * - Provides coordinate conversion for click events
 */
export function CanvasContainer({
  aspectRatio,
  background = { type: 'solid', color: '#18181b' },
  padding = 40,
  showBorder = true,
  showShadow = true,
  className = '',
  children,
  onClick,
  onScaleChange,
}: CanvasContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [scale, setScale] = useState(0);

  // Get canvas dimensions for the selected aspect ratio
  const { width: canvasWidth, height: canvasHeight } = getCanvasDimensions(aspectRatio);
  const config = ASPECT_RATIOS[aspectRatio];

  // Calculate scale factor when container or aspect ratio changes
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateSize = () => {
      const { clientWidth, clientHeight } = container;
      setContainerSize({ width: clientWidth, height: clientHeight });

      const newScale = calculateCanvasScale(
        aspectRatio,
        clientWidth,
        clientHeight,
        padding
      );
      setScale(newScale);

      if (onScaleChange) {
        onScaleChange(newScale);
      }
    };

    // Initial calculation
    updateSize();

    // Setup ResizeObserver for responsive scaling
    const resizeObserver = new ResizeObserver(() => {
      updateSize();
    });

    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
    };
  }, [aspectRatio, padding, onScaleChange]);

  // Handle click events with coordinate conversion
  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!onClick || scale === 0) return;

      const canvasElement = e.currentTarget.querySelector('[data-canvas-surface]');
      if (!canvasElement) return;

      const rect = canvasElement.getBoundingClientRect();
      const screenX = e.clientX - rect.left;
      const screenY = e.clientY - rect.top;

      const { x: canvasX, y: canvasY } = screenToCanvas(screenX, screenY, scale);

      // Only trigger if click is within canvas bounds
      if (canvasX >= 0 && canvasX <= canvasWidth && canvasY >= 0 && canvasY <= canvasHeight) {
        onClick(canvasX, canvasY);
      }
    },
    [onClick, scale, canvasWidth, canvasHeight]
  );

  // Background styles
  const backgroundStyles = renderBackground(background);

  // Apply blur filter for image backgrounds if specified
  const blurFilter =
    background.type === 'image' && background.blur > 0
      ? { filter: `blur(${background.blur}px)` }
      : {};

  return (
    <div
      ref={containerRef}
      className={`
        relative w-full h-full
        flex items-center justify-center
        ${className}
      `}
      onClick={handleClick}
    >
      {/* Canvas Surface */}
      {scale > 0 && (
        <div
          data-canvas-surface
          className={`
            relative overflow-hidden
            ${showBorder ? 'border border-zinc-700' : ''}
            ${showShadow ? 'shadow-2xl' : ''}
            rounded-lg
          `}
          style={{
            width: canvasWidth * scale,
            height: canvasHeight * scale,
          }}
        >
          {/* Background Layer */}
          <div
            className="absolute inset-0"
            style={{
              ...backgroundStyles,
              ...blurFilter,
            }}
          />

          {/* Content Layer (scaled) */}
          <div
            className="absolute top-0 left-0 origin-top-left"
            style={{
              width: canvasWidth,
              height: canvasHeight,
              transform: `scale(${scale})`,
            }}
          >
            {children}
          </div>
        </div>
      )}

      {/* Loading state while calculating scale */}
      {scale === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-zinc-600 border-t-zinc-400 rounded-full animate-spin" />
        </div>
      )}

      {/* Canvas Info Overlay (optional, for debugging) */}
      {process.env.NODE_ENV === 'development' && false && (
        <div className="absolute bottom-2 left-2 text-xs text-zinc-500 bg-zinc-900/80 px-2 py-1 rounded">
          {config.name}: {canvasWidth} x {canvasHeight} @ {(scale * 100).toFixed(0)}%
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Utility Hook
// ============================================================================

/**
 * Hook to get canvas dimensions and scale information
 */
export function useCanvasMetrics(
  containerRef: React.RefObject<HTMLDivElement>,
  aspectRatio: AspectRatioId,
  padding: number = 40
) {
  const [metrics, setMetrics] = useState({
    canvasWidth: 0,
    canvasHeight: 0,
    scale: 0,
    containerWidth: 0,
    containerHeight: 0,
  });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateMetrics = () => {
      const { clientWidth, clientHeight } = container;
      const { width, height } = getCanvasDimensions(aspectRatio);
      const scale = calculateCanvasScale(aspectRatio, clientWidth, clientHeight, padding);

      setMetrics({
        canvasWidth: width,
        canvasHeight: height,
        scale,
        containerWidth: clientWidth,
        containerHeight: clientHeight,
      });
    };

    updateMetrics();

    const resizeObserver = new ResizeObserver(updateMetrics);
    resizeObserver.observe(container);

    return () => resizeObserver.disconnect();
  }, [containerRef, aspectRatio, padding]);

  return metrics;
}

export default CanvasContainer;
