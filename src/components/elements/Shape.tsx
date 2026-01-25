'use client';

// Shape Element Component
// Renders geometric shapes: rectangle, circle, line, and triangle
// Supports fill, stroke, border radius, and stroke width customization

import React from 'react';
import type { ShapeElement, ShapeType } from '@/types/elements';

// ============================================================================
// Types
// ============================================================================

interface ShapeProps {
  element: ShapeElement;
  isPreview?: boolean;  // When true, no interactive features
}

// ============================================================================
// Sub-Components
// ============================================================================

/**
 * Rectangle shape with optional border radius
 */
function RectangleShape({
  fillColor,
  strokeColor,
  strokeWidth,
  borderRadius,
}: {
  fillColor: string;
  strokeColor: string;
  strokeWidth: number;
  borderRadius: number;
}) {
  return (
    <div
      className="w-full h-full"
      style={{
        backgroundColor: fillColor,
        border: strokeWidth > 0 ? `${strokeWidth}px solid ${strokeColor}` : 'none',
        borderRadius: borderRadius,
        boxSizing: 'border-box',
      }}
    />
  );
}

/**
 * Circle shape (uses 50% border radius)
 */
function CircleShape({
  fillColor,
  strokeColor,
  strokeWidth,
}: {
  fillColor: string;
  strokeColor: string;
  strokeWidth: number;
}) {
  return (
    <div
      className="w-full h-full"
      style={{
        backgroundColor: fillColor,
        border: strokeWidth > 0 ? `${strokeWidth}px solid ${strokeColor}` : 'none',
        borderRadius: '50%',
        boxSizing: 'border-box',
      }}
    />
  );
}

/**
 * Horizontal line shape
 */
function LineShape({
  strokeColor,
  strokeWidth,
}: {
  strokeColor: string;
  strokeWidth: number;
}) {
  return (
    <div
      className="w-full absolute"
      style={{
        height: Math.max(1, strokeWidth),
        backgroundColor: strokeColor,
        top: '50%',
        transform: 'translateY(-50%)',
      }}
    />
  );
}

/**
 * Triangle shape using SVG
 */
function TriangleShape({
  fillColor,
  strokeColor,
  strokeWidth,
}: {
  fillColor: string;
  strokeColor: string;
  strokeWidth: number;
}) {
  // Calculate inset for stroke to keep triangle within bounds
  const inset = strokeWidth / 2;
  const viewBoxSize = 100;
  
  // Triangle points with stroke inset
  const topX = viewBoxSize / 2;
  const topY = inset;
  const bottomLeftX = inset;
  const bottomLeftY = viewBoxSize - inset;
  const bottomRightX = viewBoxSize - inset;
  const bottomRightY = viewBoxSize - inset;
  
  const points = `${topX},${topY} ${bottomRightX},${bottomRightY} ${bottomLeftX},${bottomLeftY}`;

  return (
    <svg 
      viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`} 
      className="w-full h-full"
      preserveAspectRatio="none"
    >
      <polygon
        points={points}
        fill={fillColor}
        stroke={strokeWidth > 0 ? strokeColor : 'none'}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function Shape({ element }: ShapeProps) {
  const { shapeType, fillColor, strokeColor, strokeWidth, borderRadius } = element;

  const renderShape = () => {
    switch (shapeType) {
      case 'rectangle':
        return (
          <RectangleShape
            fillColor={fillColor}
            strokeColor={strokeColor}
            strokeWidth={strokeWidth}
            borderRadius={borderRadius}
          />
        );

      case 'circle':
        return (
          <CircleShape
            fillColor={fillColor}
            strokeColor={strokeColor}
            strokeWidth={strokeWidth}
          />
        );

      case 'line':
        return (
          <LineShape
            strokeColor={strokeColor}
            strokeWidth={strokeWidth}
          />
        );

      case 'triangle':
        return (
          <TriangleShape
            fillColor={fillColor}
            strokeColor={strokeColor}
            strokeWidth={strokeWidth}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="w-full h-full relative">
      {renderShape()}
    </div>
  );
}

// ============================================================================
// Shape Type Labels (for UI)
// ============================================================================

export const SHAPE_TYPE_LABELS: Record<ShapeType, string> = {
  rectangle: 'Rectangle',
  circle: 'Circle',
  line: 'Line',
  triangle: 'Triangle',
};

export const SHAPE_TYPE_ICONS: Record<ShapeType, string> = {
  rectangle: '\u25A0', // Black square
  circle: '\u25CF',    // Black circle
  line: '\u2014',      // Em dash
  triangle: '\u25B2',  // Black up-pointing triangle
};

export default Shape;
