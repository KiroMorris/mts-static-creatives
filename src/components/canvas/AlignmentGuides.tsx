'use client';

import React, { useMemo } from 'react';
import type { SnapGuide } from '@/hooks/useElementDrag';

// ============================================================================
// Types
// ============================================================================

export interface AlignmentGuidesProps {
  guides: SnapGuide[];
  scale: number;
  canvasWidth: number;
  canvasHeight: number;
  guideColor?: string;
  guideWidth?: number;
  showLabels?: boolean;
  labelBackgroundColor?: string;
  labelTextColor?: string;
}

// ============================================================================
// Constants
// ============================================================================

const DEFAULT_GUIDE_COLOR = '#3B82F6';
const DEFAULT_GUIDE_WIDTH = 1;
const DEFAULT_LABEL_BG = 'rgba(59, 130, 246, 0.9)';
const DEFAULT_LABEL_TEXT = '#FFFFFF';

// ============================================================================
// Component
// ============================================================================

export function AlignmentGuides({
  guides,
  scale,
  canvasWidth,
  canvasHeight,
  guideColor = DEFAULT_GUIDE_COLOR,
  guideWidth = DEFAULT_GUIDE_WIDTH,
  showLabels = true,
  labelBackgroundColor = DEFAULT_LABEL_BG,
  labelTextColor = DEFAULT_LABEL_TEXT,
}: AlignmentGuidesProps) {
  // Don't render if no guides
  if (guides.length === 0) {
    return null;
  }

  // Deduplicate guides that are at the same position
  const uniqueGuides = useMemo(() => {
    const seen = new Set<string>();
    return guides.filter((guide) => {
      const key = `${guide.type}-${Math.round(guide.position)}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [guides]);

  const scaledWidth = canvasWidth * scale;
  const scaledHeight = canvasHeight * scale;

  return (
    <svg
      className="absolute inset-0 pointer-events-none"
      style={{
        width: scaledWidth,
        height: scaledHeight,
        zIndex: 9999,
        overflow: 'visible',
      }}
      aria-hidden="true"
    >
      <defs>
        {/* Dashed line pattern */}
        <pattern
          id="guide-dash-pattern"
          patternUnits="userSpaceOnUse"
          width="8"
          height="8"
        >
          <line
            x1="0"
            y1="0"
            x2="4"
            y2="0"
            stroke={guideColor}
            strokeWidth={guideWidth}
          />
        </pattern>

        {/* Glow filter for guide lines */}
        <filter id="guide-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Render guide lines */}
      {uniqueGuides.map((guide, index) => (
        <GuideLineWithLabel
          key={`${guide.type}-${guide.position}-${index}`}
          guide={guide}
          scale={scale}
          canvasWidth={canvasWidth}
          canvasHeight={canvasHeight}
          guideColor={guideColor}
          guideWidth={guideWidth}
          showLabel={showLabels && !!guide.label}
          labelBackgroundColor={labelBackgroundColor}
          labelTextColor={labelTextColor}
        />
      ))}
    </svg>
  );
}

// ============================================================================
// Sub-Components
// ============================================================================

interface GuideLineWithLabelProps {
  guide: SnapGuide;
  scale: number;
  canvasWidth: number;
  canvasHeight: number;
  guideColor: string;
  guideWidth: number;
  showLabel: boolean;
  labelBackgroundColor: string;
  labelTextColor: string;
}

function GuideLineWithLabel({
  guide,
  scale,
  canvasWidth,
  canvasHeight,
  guideColor,
  guideWidth,
  showLabel,
  labelBackgroundColor,
  labelTextColor,
}: GuideLineWithLabelProps) {
  const scaledPosition = guide.position * scale;

  if (guide.type === 'vertical') {
    // Vertical guide (x-axis alignment)
    return (
      <g>
        {/* Main guide line */}
        <line
          x1={scaledPosition}
          y1={0}
          x2={scaledPosition}
          y2={canvasHeight * scale}
          stroke={guideColor}
          strokeWidth={guideWidth}
          strokeDasharray="4 4"
          strokeOpacity={0.8}
        />

        {/* Extended glow line for visibility */}
        <line
          x1={scaledPosition}
          y1={0}
          x2={scaledPosition}
          y2={canvasHeight * scale}
          stroke={guideColor}
          strokeWidth={guideWidth * 3}
          strokeOpacity={0.2}
        />

        {/* Label */}
        {showLabel && guide.label && (
          <g>
            <rect
              x={scaledPosition + 4}
              y={8}
              width={getLabelWidth(guide.label)}
              height={18}
              rx={4}
              fill={labelBackgroundColor}
            />
            <text
              x={scaledPosition + 8}
              y={21}
              fill={labelTextColor}
              fontSize={10}
              fontWeight={600}
              fontFamily="system-ui, -apple-system, sans-serif"
            >
              {guide.label}
            </text>
          </g>
        )}
      </g>
    );
  }

  // Horizontal guide (y-axis alignment)
  return (
    <g>
      {/* Main guide line */}
      <line
        x1={0}
        y1={scaledPosition}
        x2={canvasWidth * scale}
        y2={scaledPosition}
        stroke={guideColor}
        strokeWidth={guideWidth}
        strokeDasharray="4 4"
        strokeOpacity={0.8}
      />

      {/* Extended glow line for visibility */}
      <line
        x1={0}
        y1={scaledPosition}
        x2={canvasWidth * scale}
        y2={scaledPosition}
        stroke={guideColor}
        strokeWidth={guideWidth * 3}
        strokeOpacity={0.2}
      />

      {/* Label */}
      {showLabel && guide.label && (
        <g>
          <rect
            x={8}
            y={scaledPosition + 4}
            width={getLabelWidth(guide.label)}
            height={18}
            rx={4}
            fill={labelBackgroundColor}
          />
          <text
            x={12}
            y={scaledPosition + 17}
            fill={labelTextColor}
            fontSize={10}
            fontWeight={600}
            fontFamily="system-ui, -apple-system, sans-serif"
          >
            {guide.label}
          </text>
        </g>
      )}
    </g>
  );
}

// Helper function to estimate label width
function getLabelWidth(label: string): number {
  // Approximate width based on character count (10px font)
  return Math.max(40, label.length * 6 + 16);
}

// ============================================================================
// Additional Guide Components
// ============================================================================

export interface GridOverlayProps {
  gridSize: number;
  scale: number;
  canvasWidth: number;
  canvasHeight: number;
  gridColor?: string;
  gridOpacity?: number;
  showSubgrid?: boolean;
  subgridDivisions?: number;
}

export function GridOverlay({
  gridSize,
  scale,
  canvasWidth,
  canvasHeight,
  gridColor = '#E5E7EB',
  gridOpacity = 0.5,
  showSubgrid = false,
  subgridDivisions = 4,
}: GridOverlayProps) {
  const scaledGridSize = gridSize * scale;
  const scaledWidth = canvasWidth * scale;
  const scaledHeight = canvasHeight * scale;

  const gridLines = useMemo(() => {
    const lines: React.ReactNode[] = [];
    const subgridSize = scaledGridSize / subgridDivisions;

    // Vertical lines
    for (let x = 0; x <= scaledWidth; x += scaledGridSize) {
      lines.push(
        <line
          key={`v-${x}`}
          x1={x}
          y1={0}
          x2={x}
          y2={scaledHeight}
          stroke={gridColor}
          strokeWidth={1}
          strokeOpacity={gridOpacity}
        />
      );

      // Subgrid
      if (showSubgrid) {
        for (let i = 1; i < subgridDivisions; i++) {
          const subX = x + i * subgridSize;
          if (subX < scaledWidth) {
            lines.push(
              <line
                key={`vs-${subX}`}
                x1={subX}
                y1={0}
                x2={subX}
                y2={scaledHeight}
                stroke={gridColor}
                strokeWidth={0.5}
                strokeOpacity={gridOpacity * 0.5}
              />
            );
          }
        }
      }
    }

    // Horizontal lines
    for (let y = 0; y <= scaledHeight; y += scaledGridSize) {
      lines.push(
        <line
          key={`h-${y}`}
          x1={0}
          y1={y}
          x2={scaledWidth}
          y2={y}
          stroke={gridColor}
          strokeWidth={1}
          strokeOpacity={gridOpacity}
        />
      );

      // Subgrid
      if (showSubgrid) {
        for (let i = 1; i < subgridDivisions; i++) {
          const subY = y + i * subgridSize;
          if (subY < scaledHeight) {
            lines.push(
              <line
                key={`hs-${subY}`}
                x1={0}
                y1={subY}
                x2={scaledWidth}
                y2={subY}
                stroke={gridColor}
                strokeWidth={0.5}
                strokeOpacity={gridOpacity * 0.5}
              />
            );
          }
        }
      }
    }

    return lines;
  }, [scaledGridSize, scaledWidth, scaledHeight, gridColor, gridOpacity, showSubgrid, subgridDivisions]);

  return (
    <svg
      className="absolute inset-0 pointer-events-none"
      style={{
        width: scaledWidth,
        height: scaledHeight,
        zIndex: 1,
      }}
      aria-hidden="true"
    >
      {gridLines}
    </svg>
  );
}

// ============================================================================
// Center Cross Guides
// ============================================================================

export interface CenterGuidesProps {
  scale: number;
  canvasWidth: number;
  canvasHeight: number;
  color?: string;
  opacity?: number;
  alwaysShow?: boolean;
}

export function CenterGuides({
  scale,
  canvasWidth,
  canvasHeight,
  color = '#9CA3AF',
  opacity = 0.3,
  alwaysShow = false,
}: CenterGuidesProps) {
  const centerX = (canvasWidth / 2) * scale;
  const centerY = (canvasHeight / 2) * scale;
  const scaledWidth = canvasWidth * scale;
  const scaledHeight = canvasHeight * scale;

  if (!alwaysShow) {
    return null;
  }

  return (
    <svg
      className="absolute inset-0 pointer-events-none"
      style={{
        width: scaledWidth,
        height: scaledHeight,
        zIndex: 2,
      }}
      aria-hidden="true"
    >
      {/* Vertical center line */}
      <line
        x1={centerX}
        y1={0}
        x2={centerX}
        y2={scaledHeight}
        stroke={color}
        strokeWidth={1}
        strokeOpacity={opacity}
        strokeDasharray="8 8"
      />

      {/* Horizontal center line */}
      <line
        x1={0}
        y1={centerY}
        x2={scaledWidth}
        y2={centerY}
        stroke={color}
        strokeWidth={1}
        strokeOpacity={opacity}
        strokeDasharray="8 8"
      />

      {/* Center cross marker */}
      <circle
        cx={centerX}
        cy={centerY}
        r={4}
        fill="none"
        stroke={color}
        strokeWidth={1}
        strokeOpacity={opacity}
      />
    </svg>
  );
}

// ============================================================================
// Ruler Guides (for margins/safe areas)
// ============================================================================

export interface SafeAreaGuidesProps {
  scale: number;
  canvasWidth: number;
  canvasHeight: number;
  margin?: number;
  color?: string;
  opacity?: number;
  show?: boolean;
}

export function SafeAreaGuides({
  scale,
  canvasWidth,
  canvasHeight,
  margin = 48,
  color = '#F59E0B',
  opacity = 0.3,
  show = false,
}: SafeAreaGuidesProps) {
  if (!show) {
    return null;
  }

  const scaledWidth = canvasWidth * scale;
  const scaledHeight = canvasHeight * scale;
  const scaledMargin = margin * scale;

  return (
    <svg
      className="absolute inset-0 pointer-events-none"
      style={{
        width: scaledWidth,
        height: scaledHeight,
        zIndex: 3,
      }}
      aria-hidden="true"
    >
      {/* Safe area rectangle */}
      <rect
        x={scaledMargin}
        y={scaledMargin}
        width={scaledWidth - scaledMargin * 2}
        height={scaledHeight - scaledMargin * 2}
        fill="none"
        stroke={color}
        strokeWidth={1}
        strokeOpacity={opacity}
        strokeDasharray="4 4"
      />

      {/* Corner markers */}
      {[
        { x: scaledMargin, y: scaledMargin }, // Top-left
        { x: scaledWidth - scaledMargin, y: scaledMargin }, // Top-right
        { x: scaledMargin, y: scaledHeight - scaledMargin }, // Bottom-left
        { x: scaledWidth - scaledMargin, y: scaledHeight - scaledMargin }, // Bottom-right
      ].map((corner, index) => (
        <g key={index}>
          <line
            x1={corner.x - 8}
            y1={corner.y}
            x2={corner.x + 8}
            y2={corner.y}
            stroke={color}
            strokeWidth={1}
            strokeOpacity={opacity * 2}
          />
          <line
            x1={corner.x}
            y1={corner.y - 8}
            x2={corner.x}
            y2={corner.y + 8}
            stroke={color}
            strokeWidth={1}
            strokeOpacity={opacity * 2}
          />
        </g>
      ))}
    </svg>
  );
}

export default AlignmentGuides;
