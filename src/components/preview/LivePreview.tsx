'use client';

// LivePreview Component
// Renders a scaled-down CSS-based preview of the 1080x1920 creative canvas
// Updates instantly as style props change - no server rendering needed

import React, { useRef, useEffect, useState, useMemo } from 'react';
import Image from 'next/image';
import type { TextStyle, CalloutStyle, CalloutImages, HeroStyle, CalloutZoomSettings } from '@/types';
import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  calculateSubtitleYFromStyle,
  calculateCalloutYPositions,
  wrapHeadlineText,
  calculateScaleFactor,
  getTextShadowCSS,
  calculateLineHeight,
} from '@/lib/preview-utils';
import { getFontFamilyCSS } from '@/lib/font-config';

// ============================================================================
// Types
// ============================================================================

interface LivePreviewProps {
  // Image data
  heroImage: string | null;
  calloutImages: CalloutImages;

  // Text content
  headline: string;
  subtitle: string;

  // Style settings
  heroStyle: HeroStyle;
  textStyle: TextStyle;
  calloutStyle: CalloutStyle;

  // Optional display settings
  maxHeight?: number;
  showBorder?: boolean;
  className?: string;
}

// ============================================================================
// Sub-Components
// ============================================================================

/**
 * Hero background layer - full bleed image with zoom support
 *
 * IMPORTANT: This must match the Sharp.js applyZoom() behavior exactly:
 * - When zoom=1: Sharp uses fit:'cover', position:'center' (ignores focusX/focusY)
 * - When zoom>1: Sharp extracts a region (1/zoom of the image), then resizes to cover
 *
 * CSS simulation:
 * - When zoom=1: Use object-fit:cover with object-position:center
 * - When zoom>1: Scale up the image and position it to show the same region Sharp would extract
 */
function HeroLayer({
  heroImage,
  heroStyle
}: {
  heroImage: string | null;
  heroStyle: HeroStyle;
}) {
  if (!heroImage) {
    return (
      <div
        className="absolute inset-0 bg-gradient-to-b from-zinc-800 to-zinc-900 flex items-center justify-center"
      >
        <span className="text-zinc-500 text-sm">No hero image</span>
      </div>
    );
  }

  const { zoom, focusX, focusY } = heroStyle;

  // When zoom is 1 or less, Sharp uses center positioning (ignores focusX/focusY)
  if (zoom <= 1) {
    return (
      <div className="absolute inset-0 overflow-hidden">
        <Image
          src={heroImage}
          alt="Hero background"
          fill
          className="object-cover"
          style={{
            objectPosition: 'center center',
          }}
          sizes="(max-width: 768px) 100vw, 400px"
          priority
        />
      </div>
    );
  }

  // When zoom > 1, simulate Sharp's crop-then-resize behavior:
  // Sharp calculates: cropSize = imageSize / zoom
  // Then positions based on focusX/focusY (0-100 maps to crop position)
  //
  // To match this in CSS:
  // 1. Scale the image by the zoom factor
  // 2. Calculate the offset needed to show the correct region
  //    - focusX=0: show left edge, focusX=100: show right edge
  //    - The total "extra" width after zoom is: (zoom - 1) * 100%
  //    - At focusX=0, offset = 0; at focusX=100, offset = -(zoom-1)*100%

  const offsetX = -((focusX / 100) * (zoom - 1) * 100);
  const offsetY = -((focusY / 100) * (zoom - 1) * 100);

  return (
    <div className="absolute inset-0 overflow-hidden">
      <Image
        src={heroImage}
        alt="Hero background"
        fill
        className="object-cover"
        style={{
          transform: `scale(${zoom})`,
          transformOrigin: 'top left',
          marginLeft: `${offsetX}%`,
          marginTop: `${offsetY}%`,
        }}
        sizes="(max-width: 768px) 100vw, 400px"
        priority
      />
    </div>
  );
}

/**
 * Text overlay layer - headline and subtitle
 * Uses direct X/Y positioning from textStyle for precise control
 */
function TextLayer({
  headline,
  subtitle,
  textStyle,
}: {
  headline: string;
  subtitle: string;
  textStyle: TextStyle;
}) {
  // Wrap headline into lines
  const headlineLines = useMemo(
    () => wrapHeadlineText(headline, textStyle.headlineFontSize),
    [headline, textStyle.headlineFontSize]
  );

  // Use direct X/Y from style
  const headlineX = textStyle.headlineX;
  const headlineY = textStyle.headlineY;
  const lineHeight = calculateLineHeight(textStyle.headlineFontSize);

  // Calculate subtitle Y position based on headline position + lines + gap
  const subtitleY = calculateSubtitleYFromStyle(textStyle, headlineLines.length);

  // Text shadow CSS
  const textShadow = getTextShadowCSS(textStyle.headlineShadow);

  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Headline lines */}
      {headlineLines.map((line, index) => (
        <div
          key={index}
          style={{
            position: 'absolute',
            left: headlineX,
            top: headlineY + (index * lineHeight),
            fontFamily: getFontFamilyCSS(textStyle.headlineFontFamily),
            fontSize: textStyle.headlineFontSize,
            fontWeight: textStyle.headlineFontWeight,
            color: textStyle.headlineColor,
            letterSpacing: '-0.02em',
            textShadow,
            whiteSpace: 'nowrap',
          }}
        >
          {line}
        </div>
      ))}

      {/* Subtitle */}
      <div
        style={{
          position: 'absolute',
          left: headlineX,
          top: subtitleY,
          fontFamily: getFontFamilyCSS(textStyle.subtitleFontFamily),
          fontSize: textStyle.subtitleFontSize,
          fontWeight: textStyle.subtitleFontWeight,
          color: textStyle.subtitleColor,
          letterSpacing: `${textStyle.subtitleLetterSpacing}px`,
          textTransform: 'uppercase',
          whiteSpace: 'nowrap',
        }}
      >
        {subtitle.toUpperCase()}
      </div>
    </div>
  );
}

/**
 * Single callout image with border, rounded corners, and zoom support
 *
 * IMPORTANT: This must match the Sharp.js prepareCallout() zoom behavior:
 * - When zoom<=1: Sharp uses fit:'cover', position:'center' (ignores focusX/focusY)
 * - When zoom>1: Sharp extracts a square region (minDimension/zoom), then resizes to cover
 */
function CalloutImage({
  src,
  style,
  zoomSettings,
  top,
  left,
}: {
  src: string | null;
  style: CalloutStyle;
  zoomSettings: CalloutZoomSettings;
  top: number;
  left: number;
}) {
  const { size, borderWidth, borderColor, borderRadius } = style;
  const { zoom, focusX, focusY } = zoomSettings;

  if (!src) {
    return (
      <div
        style={{
          position: 'absolute',
          top,
          left,
          width: size,
          height: size,
          borderRadius,
          border: `${borderWidth}px solid ${borderColor}`,
          backgroundColor: '#27272a', // zinc-800
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span style={{ color: '#71717a', fontSize: 12 }}>No image</span>
      </div>
    );
  }

  // When zoom <= 1, Sharp uses center positioning
  if (zoom <= 1) {
    return (
      <div
        style={{
          position: 'absolute',
          top,
          left,
          width: size,
          height: size,
          borderRadius,
          border: `${borderWidth}px solid ${borderColor}`,
          overflow: 'hidden',
          boxSizing: 'border-box',
        }}
      >
        <Image
          src={src}
          alt="Callout"
          fill
          className="object-cover"
          style={{
            objectPosition: 'center center',
          }}
          sizes="200px"
        />
      </div>
    );
  }

  // When zoom > 1, simulate Sharp's crop-then-resize behavior:
  // Sharp crops a smaller region then resizes to fill the callout.
  // To match in CSS: scale up the image and offset it based on focus point.
  const offsetX = -((focusX / 100) * (zoom - 1) * 100);
  const offsetY = -((focusY / 100) * (zoom - 1) * 100);

  return (
    <div
      style={{
        position: 'absolute',
        top,
        left,
        width: size,
        height: size,
        borderRadius,
        border: `${borderWidth}px solid ${borderColor}`,
        overflow: 'hidden',
        boxSizing: 'border-box',
      }}
    >
      <Image
        src={src}
        alt="Callout"
        fill
        className="object-cover"
        style={{
          transform: `scale(${zoom})`,
          transformOrigin: 'top left',
          marginLeft: `${offsetX}%`,
          marginTop: `${offsetY}%`,
        }}
        sizes="200px"
      />
    </div>
  );
}

/**
 * Callout stack layer - 3 vertically stacked callout images
 * Uses direct X/Y positioning from calloutStyle
 */
function CalloutLayer({
  calloutImages,
  calloutStyle,
}: {
  calloutImages: CalloutImages;
  calloutStyle: CalloutStyle;
}) {
  // Use direct X from style
  const calloutX = calloutStyle.x;
  const [callout1Y, callout2Y, callout3Y] = calculateCalloutYPositions(calloutStyle);

  return (
    <div className="absolute inset-0 pointer-events-none">
      <CalloutImage
        src={calloutImages.detail}
        style={calloutStyle}
        zoomSettings={calloutStyle.detail}
        top={callout1Y}
        left={calloutX}
      />
      <CalloutImage
        src={calloutImages.fit}
        style={calloutStyle}
        zoomSettings={calloutStyle.fit}
        top={callout2Y}
        left={calloutX}
      />
      <CalloutImage
        src={calloutImages.pose}
        style={calloutStyle}
        zoomSettings={calloutStyle.pose}
        top={callout3Y}
        left={calloutX}
      />
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

/**
 * LivePreview - Real-time CSS-based preview of the creative canvas
 *
 * Renders a scaled-down version of the 1080x1920 canvas using CSS transforms.
 * All positioning calculations mirror the server-side sharp-compose.ts logic
 * to ensure WYSIWYG accuracy.
 *
 * Uses ResizeObserver to dynamically calculate the scale factor based on
 * container width, maintaining the 9:16 aspect ratio.
 */
export function LivePreview({
  heroImage,
  calloutImages,
  headline,
  subtitle,
  heroStyle,
  textStyle,
  calloutStyle,
  maxHeight,
  showBorder = true,
  className = '',
}: LivePreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scaleFactor, setScaleFactor] = useState(0);

  // Calculate scale factor on mount and resize
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateScale = () => {
      const containerWidth = container.clientWidth;
      const newScale = calculateScaleFactor(containerWidth);
      setScaleFactor(newScale);
    };

    // Initial calculation
    updateScale();

    // Setup ResizeObserver for responsive scaling
    const resizeObserver = new ResizeObserver(() => {
      updateScale();
    });

    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <div className={`w-full ${className}`}>
      {/* Preview label */}
      <div className="text-xs text-zinc-500 mb-2 text-center">Live Preview</div>

      {/* Container with aspect ratio */}
      <div
        ref={containerRef}
        className={`
          relative w-full overflow-hidden bg-zinc-900
          ${showBorder ? 'border border-zinc-700 rounded-xl' : 'rounded-xl'}
        `}
        style={{
          aspectRatio: '9 / 16',
          maxHeight: maxHeight || undefined,
        }}
      >
        {/* Scaled inner canvas */}
        {scaleFactor > 0 && (
          <div
            className="absolute top-0 left-0 origin-top-left"
            style={{
              width: CANVAS_WIDTH,
              height: CANVAS_HEIGHT,
              transform: `scale(${scaleFactor})`,
            }}
          >
            {/* Layer 1: Hero background */}
            <HeroLayer heroImage={heroImage} heroStyle={heroStyle} />

            {/* Layer 2: Text overlay */}
            <TextLayer
              headline={headline}
              subtitle={subtitle}
              textStyle={textStyle}
            />

            {/* Layer 3: Callout images */}
            <CalloutLayer
              calloutImages={calloutImages}
              calloutStyle={calloutStyle}
            />
          </div>
        )}

        {/* Loading state while calculating scale */}
        {scaleFactor === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-4 h-4 border-2 border-zinc-600 border-t-zinc-400 rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Dimensions info */}
      <div className="text-xs text-zinc-600 mt-2 text-center">
        1080 x 1920 px (9:16)
      </div>
    </div>
  );
}

export default LivePreview;
