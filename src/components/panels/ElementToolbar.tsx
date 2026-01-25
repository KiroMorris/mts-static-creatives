'use client';

import React from 'react';
import { useElementsStore } from '@/store/useElementsStore';
import type { FontFamily, FontWeight } from '@/types';
import type {
  ElementType,
  CanvasElement,
  TextElement,
  CTAButtonElement,
  BadgeElement,
  PriceTagElement,
  ShapeElement,
  LogoElement,
} from '@/types/elements';

// ============================================================================
// Element Tool Configuration
// ============================================================================

interface ElementTool {
  type: ElementType;
  label: string;
  description: string;
}

const ELEMENT_TOOLS: ElementTool[] = [
  { type: 'text', label: 'Text', description: 'Add text block' },
  { type: 'cta-button', label: 'CTA Button', description: 'Add call-to-action button' },
  { type: 'badge', label: 'Badge', description: 'Add promotional badge' },
  { type: 'price-tag', label: 'Price Tag', description: 'Add price display' },
  { type: 'shape', label: 'Shape', description: 'Add geometric shape' },
  { type: 'logo', label: 'Logo', description: 'Add brand logo' },
];

// ============================================================================
// Icons
// ============================================================================

function TextIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h8m-8 6h16" />
    </svg>
  );
}

function ButtonIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
    </svg>
  );
}

function BadgeIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
    </svg>
  );
}

function PriceIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function ShapeIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 7.5A2.25 2.25 0 017.5 5.25h9a2.25 2.25 0 012.25 2.25v9a2.25 2.25 0 01-2.25 2.25h-9a2.25 2.25 0 01-2.25-2.25v-9z" />
    </svg>
  );
}

function LogoIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
    </svg>
  );
}

function getElementIcon(type: ElementType): React.ReactNode {
  switch (type) {
    case 'text':
      return <TextIcon />;
    case 'cta-button':
      return <ButtonIcon />;
    case 'badge':
      return <BadgeIcon />;
    case 'price-tag':
      return <PriceIcon />;
    case 'shape':
      return <ShapeIcon />;
    case 'logo':
      return <LogoIcon />;
    default:
      return <ShapeIcon />;
  }
}

// ============================================================================
// Default Element Generators
// ============================================================================

type ElementWithoutIdZIndex<T extends CanvasElement> = Omit<T, 'id' | 'zIndex'>;

function getDefaultElement(
  type: ElementType,
  brand: { primaryColor: string; fontPrimary: FontFamily; logo: string | null }
): ElementWithoutIdZIndex<CanvasElement> {
  const baseDefaults = {
    enabled: true,
    position: { x: 100, y: 100 },
    opacity: 1,
    rotation: 0,
    locked: false,
  };

  switch (type) {
    case 'text':
      return {
        ...baseDefaults,
        type: 'text' as const,
        size: { width: 400, height: 60 },
        content: 'Your Text Here',
        fontFamily: brand.fontPrimary,
        fontSize: 48,
        fontWeight: 700 as FontWeight,
        color: '#ffffff',
        textAlign: 'left' as const,
        letterSpacing: 0,
        lineHeight: 1.2,
        textTransform: 'none' as const,
        shadow: null,
        background: null,
      } as ElementWithoutIdZIndex<TextElement>;

    case 'cta-button':
      return {
        ...baseDefaults,
        type: 'cta-button' as const,
        size: { width: 200, height: 56 },
        text: 'Shop Now',
        fontFamily: brand.fontPrimary,
        fontSize: 18,
        fontWeight: 600 as FontWeight,
        textColor: '#ffffff',
        backgroundColor: brand.primaryColor,
        borderRadius: 8,
        borderWidth: 0,
        borderColor: 'transparent',
        paddingX: 24,
        paddingY: 12,
        shadow: null,
      } as ElementWithoutIdZIndex<CTAButtonElement>;

    case 'badge':
      return {
        ...baseDefaults,
        type: 'badge' as const,
        size: { width: 80, height: 32 },
        text: 'NEW',
        preset: 'new' as const,
        fontFamily: brand.fontPrimary,
        fontSize: 14,
        fontWeight: 700 as FontWeight,
        textColor: '#ffffff',
        backgroundColor: '#22c55e',
        borderRadius: 16,
        paddingX: 12,
        paddingY: 4,
      } as ElementWithoutIdZIndex<BadgeElement>;

    case 'price-tag':
      return {
        ...baseDefaults,
        type: 'price-tag' as const,
        size: { width: 200, height: 60 },
        currentPrice: '49.99',
        originalPrice: '79.99',
        discountPercent: 37,
        currency: '$',
        fontFamily: brand.fontPrimary,
        currentPriceFontSize: 32,
        currentPriceColor: '#ffffff',
        originalPriceFontSize: 18,
        originalPriceColor: '#9ca3af',
        discountBadgeColor: '#ef4444',
        layout: 'horizontal' as const,
      } as ElementWithoutIdZIndex<PriceTagElement>;

    case 'shape':
      return {
        ...baseDefaults,
        type: 'shape' as const,
        size: { width: 100, height: 100 },
        shapeType: 'rectangle' as const,
        fillColor: brand.primaryColor,
        strokeColor: 'transparent',
        strokeWidth: 0,
        borderRadius: 8,
      } as ElementWithoutIdZIndex<ShapeElement>;

    case 'logo':
      return {
        ...baseDefaults,
        type: 'logo' as const,
        size: { width: 120, height: 60 },
        imageUrl: brand.logo || '',
        fit: 'contain' as const,
      } as ElementWithoutIdZIndex<LogoElement>;

    default:
      return {
        ...baseDefaults,
        type: 'shape' as const,
        size: { width: 100, height: 100 },
        shapeType: 'rectangle' as const,
        fillColor: brand.primaryColor,
        strokeColor: 'transparent',
        strokeWidth: 0,
        borderRadius: 8,
      } as ElementWithoutIdZIndex<ShapeElement>;
  }
}

// ============================================================================
// Main Component
// ============================================================================

interface ElementToolbarProps {
  className?: string;
  orientation?: 'horizontal' | 'vertical';
}

export function ElementToolbar({
  className = '',
  orientation = 'horizontal',
}: ElementToolbarProps) {
  const { addElement, primaryColor, fontPrimary, logo } = useElementsStore();

  const handleAddElement = (type: ElementType) => {
    const brand = { primaryColor, fontPrimary: fontPrimary as FontFamily, logo };
    const defaults = getDefaultElement(type, brand);
    addElement(defaults as Omit<CanvasElement, 'id'>);
  };

  const isVertical = orientation === 'vertical';

  return (
    <div
      className={`
        ${isVertical ? 'flex flex-col' : 'flex flex-wrap'}
        gap-2 p-4
        bg-zinc-50 dark:bg-zinc-800/50
        rounded-xl
        ${className}
      `}
    >
      <h3 className={`
        ${isVertical ? 'mb-2' : 'w-full mb-2'}
        text-sm font-semibold text-zinc-700 dark:text-zinc-300
      `}>
        Add Element
      </h3>

      {ELEMENT_TOOLS.map(({ type, label, description }) => (
        <button
          key={type}
          onClick={() => handleAddElement(type)}
          className={`
            flex items-center gap-2
            ${isVertical ? 'w-full justify-start px-3 py-2' : 'flex-col p-3 min-w-[70px]'}
            bg-white dark:bg-zinc-700
            rounded-lg
            border border-zinc-200 dark:border-zinc-600
            hover:border-violet-500 hover:bg-violet-50 dark:hover:bg-violet-500/20
            transition-all duration-200
            group
          `}
          title={description}
        >
          <span className="text-zinc-600 dark:text-zinc-400 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
            {getElementIcon(type)}
          </span>
          <span className="text-xs text-zinc-600 dark:text-zinc-400 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
            {label}
          </span>
        </button>
      ))}
    </div>
  );
}

export default ElementToolbar;
