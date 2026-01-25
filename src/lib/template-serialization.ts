// Template Serialization for Apparel Creative Generator V2
// Converts between creative store state and template configuration
// IMPORTANT: Templates save EVERYTHING except the product/hero images

import type { CreativeStore, StyleSettings, CalloutType } from '@/types';
import { DEFAULT_STYLE_SETTINGS } from '@/types';
import type {
  TemplateConfig,
  CanvasConfig,
  HeroTemplateConfig,
  CalloutsTemplateConfig,
  CalloutItemTemplateConfig,
  TextTemplateConfig,
  TextElementConfig,
  AITemplateConfig,
  AIHeroTemplateConfig,
  AICalloutTemplateConfig,
  Position,
  ElementBounds,
} from '@/types/templates';

// ============================================================================
// Serialization Options
// ============================================================================

export interface SerializeOptions {
  /**
   * Whether to include actual text content in the template.
   * If false, only text styling is saved (positions, fonts, colors, etc.)
   */
  includeTextContent?: boolean;

  /**
   * Whether to include brand assets (logos, watermarks).
   * Default: true
   */
  includeBrandAssets?: boolean;
}

// ============================================================================
// Default Canvas Configuration
// ============================================================================

const DEFAULT_CANVAS_CONFIG: CanvasConfig = {
  width: 1080,
  height: 1920,
  aspectRatio: '9:16',
  backgroundColor: '#000000',
};

// ============================================================================
// Serialize Creative Store to Template Config
// ============================================================================

/**
 * Serializes the current creative store state into a template configuration.
 * This extracts all settings that should be saved in a template,
 * EXCLUDING the actual product and hero images.
 */
export function serializeCreativeToTemplate(
  store: CreativeStore,
  options: SerializeOptions = {}
): TemplateConfig {
  const { includeTextContent = false } = options;

  return {
    // Canvas settings (default for now, could be extended for multi-aspect-ratio support)
    canvas: serializeCanvas(),

    // Hero settings (zoom, focus, positioning - NOT the image)
    hero: serializeHero(store.styleSettings),

    // Callouts settings
    callouts: serializeCallouts(store.styleSettings, store.calloutOrder),

    // Text settings
    text: serializeText(store.styleSettings, store, includeTextContent),

    // AI generation settings
    ai: serializeAI(store),

    // Original style settings (for backwards compatibility)
    styleSettings: { ...store.styleSettings },
  };
}

// ============================================================================
// Canvas Serialization
// ============================================================================

function serializeCanvas(): CanvasConfig {
  // For V1, we use the default 9:16 aspect ratio (1080x1920)
  // Future versions can support multiple aspect ratios
  return { ...DEFAULT_CANVAS_CONFIG };
}

// ============================================================================
// Hero Serialization
// ============================================================================

function serializeHero(styleSettings: StyleSettings): HeroTemplateConfig {
  const { hero } = styleSettings;

  return {
    // Full canvas bounds for hero
    bounds: {
      position: { x: 0, y: 0 },
      size: { width: 1080, height: 1920 },
    },

    // Zoom and focus from hero style
    zoom: hero.zoom,
    focusX: hero.focusX,
    focusY: hero.focusY,

    // Default fit mode
    fit: 'cover',

    // No overlay by default
    overlay: {
      enabled: false,
      type: 'solid',
      opacity: 0,
    },

    // No filters by default
    filters: {
      brightness: 100,
      contrast: 100,
      saturation: 100,
      blur: 0,
    },
  };
}

// ============================================================================
// Callouts Serialization
// ============================================================================

function serializeCallouts(
  styleSettings: StyleSettings,
  calloutOrder: [CalloutType, CalloutType, CalloutType]
): CalloutsTemplateConfig {
  const { callout } = styleSettings;

  // Create individual callout configurations
  const items: CalloutItemTemplateConfig[] = [0, 1, 2].map((slotIndex) => {
    // Get the callout type for this slot based on order
    const calloutType = calloutOrder[slotIndex];

    // Get zoom settings for this callout type
    const zoomSettings = callout[calloutType] || { zoom: 1.0, focusX: 50, focusY: 50 };

    // Calculate position for this slot
    const yPosition = callout.y + slotIndex * (callout.size + callout.gap);

    return {
      slotIndex,
      bounds: {
        position: { x: callout.x, y: yPosition },
        size: { width: callout.size, height: callout.size },
      },
      zoom: zoomSettings.zoom,
      focusX: zoomSettings.focusX,
      focusY: zoomSettings.focusY,
      borderRadius: callout.borderRadius,
      borderWidth: callout.borderWidth,
      borderColor: callout.borderColor,
      shadow: {
        enabled: false,
        offsetX: 0,
        offsetY: 4,
        blur: 8,
        spread: 0,
        color: 'rgba(0, 0, 0, 0.25)',
      },
      visible: true,
    };
  });

  return {
    count: 3,
    gap: callout.gap,
    startPosition: { x: callout.x, y: callout.y },
    defaultSize: callout.size,
    items,
    displayOrder: [...calloutOrder],
  };
}

// ============================================================================
// Text Serialization
// ============================================================================

function serializeText(
  styleSettings: StyleSettings,
  store: CreativeStore,
  includeContent: boolean
): TextTemplateConfig {
  const { text } = styleSettings;

  const headlineConfig: TextElementConfig = {
    position: { x: text.headlineX, y: text.headlineY },
    fontFamily: text.headlineFontFamily,
    fontSize: text.headlineFontSize,
    fontWeight: text.headlineFontWeight,
    lineHeight: 1.1,
    letterSpacing: 0,
    color: text.headlineColor,
    shadow: text.headlineShadow
      ? {
          enabled: true,
          offsetX: 2,
          offsetY: 2,
          blur: 4,
          color: 'rgba(0, 0, 0, 0.5)',
        }
      : {
          enabled: false,
          offsetX: 0,
          offsetY: 0,
          blur: 0,
          color: 'rgba(0, 0, 0, 0)',
        },
    textTransform: 'uppercase',
    textAlign: 'left',
    maxWidth: 600,
    placeholder: 'YOUR HEADLINE',
    content: includeContent ? store.headline : undefined,
  };

  const subtitleConfig: TextElementConfig = {
    position: {
      x: text.headlineX,
      // Calculate subtitle Y based on headline position + size + gap
      y: text.headlineY + text.headlineFontSize + text.subtitleGap,
    },
    fontFamily: text.subtitleFontFamily,
    fontSize: text.subtitleFontSize,
    fontWeight: text.subtitleFontWeight,
    lineHeight: 1.2,
    letterSpacing: text.subtitleLetterSpacing,
    color: text.subtitleColor,
    shadow: {
      enabled: false,
      offsetX: 0,
      offsetY: 0,
      blur: 0,
      color: 'rgba(0, 0, 0, 0)',
    },
    textTransform: 'uppercase',
    textAlign: 'left',
    placeholder: 'SUBTITLE TEXT',
    content: includeContent ? store.subtitle : undefined,
  };

  return {
    headline: headlineConfig,
    subtitle: subtitleConfig,
    gap: text.subtitleGap,
  };
}

// ============================================================================
// AI Settings Serialization
// ============================================================================

function serializeAI(store: CreativeStore): AITemplateConfig {
  const { modelScene } = store.styleSettings;

  const heroConfig: AIHeroTemplateConfig = {
    selectedHeroTemplate: modelScene.selectedHeroTemplate,
    customPromptAddition: modelScene.customPromptAddition,
    modelGender: modelScene.modelGender,
    modelAge: modelScene.modelAge,
    modelEthnicity: modelScene.modelEthnicity,
    pose: modelScene.pose,
    setting: modelScene.setting,
    mood: modelScene.mood,
    lighting: modelScene.lighting,
    copySpace: modelScene.copySpace,
  };

  const calloutsConfig: AICalloutTemplateConfig = {
    selectedCallouts: [...store.selectedCallouts],
    customCalloutPrompts: store.calloutPrompts.filter((p) => !p.isBuiltIn),
  };

  return {
    hero: heroConfig,
    callouts: calloutsConfig,
  };
}

// ============================================================================
// Deserialize Template Config to Creative Store
// ============================================================================

/**
 * Applies a template configuration to the creative store.
 * This restores all settings from the template WITHOUT affecting images.
 */
export function deserializeTemplateToCreative(
  config: TemplateConfig,
  store: CreativeStore
): void {
  // Apply style settings
  const restoredStyleSettings = deserializeStyleSettings(config);
  store.setStyleSettings(restoredStyleSettings);

  // Apply text content if present
  if (config.text.headline.content || config.text.subtitle.content) {
    store.setText(
      config.text.headline.content || '',
      config.text.subtitle.content || ''
    );
  }

  // Apply callout selections
  if (config.ai.callouts.selectedCallouts) {
    store.setAllSelectedCallouts(config.ai.callouts.selectedCallouts);
  }

  // Add custom callout prompts from template
  const existingPromptIds = store.calloutPrompts.map((p) => p.id);
  for (const customPrompt of config.ai.callouts.customCalloutPrompts) {
    if (!existingPromptIds.includes(customPrompt.id)) {
      store.addCalloutPrompt({
        name: customPrompt.name,
        promptText: customPrompt.promptText,
        isBuiltIn: false,
      });
    }
  }

  // Apply callout order
  if (config.callouts.displayOrder) {
    store.reorderCallouts(config.callouts.displayOrder);
  }
}

// ============================================================================
// Style Settings Deserialization
// ============================================================================

function deserializeStyleSettings(config: TemplateConfig): StyleSettings {
  // If the template has the original styleSettings, use those directly
  if (config.styleSettings) {
    return deepMergeStyleSettings(DEFAULT_STYLE_SETTINGS, config.styleSettings);
  }

  // Otherwise, reconstruct from individual config sections
  return {
    modelScene: {
      modelGender: config.ai.hero.modelGender,
      modelAge: config.ai.hero.modelAge,
      modelEthnicity: config.ai.hero.modelEthnicity,
      pose: config.ai.hero.pose,
      setting: config.ai.hero.setting,
      mood: config.ai.hero.mood,
      lighting: config.ai.hero.lighting,
      selectedHeroTemplate: config.ai.hero.selectedHeroTemplate,
      customPromptAddition: config.ai.hero.customPromptAddition,
      copySpace: config.ai.hero.copySpace,
    },
    hero: {
      zoom: config.hero.zoom,
      focusX: config.hero.focusX,
      focusY: config.hero.focusY,
    },
    text: deserializeTextStyle(config.text),
    callout: deserializeCalloutStyle(config.callouts),
  };
}

function deserializeTextStyle(textConfig: TextTemplateConfig): StyleSettings['text'] {
  return {
    headlineFontSize: textConfig.headline.fontSize,
    headlineColor: textConfig.headline.color,
    headlineShadow: textConfig.headline.shadow?.enabled ?? false,
    headlineX: textConfig.headline.position.x,
    headlineY: textConfig.headline.position.y,
    headlineFontFamily: textConfig.headline.fontFamily as StyleSettings['text']['headlineFontFamily'],
    headlineFontWeight: textConfig.headline.fontWeight as StyleSettings['text']['headlineFontWeight'],
    subtitleFontSize: textConfig.subtitle.fontSize,
    subtitleColor: textConfig.subtitle.color,
    subtitleLetterSpacing: textConfig.subtitle.letterSpacing,
    subtitleGap: textConfig.gap,
    subtitleFontFamily: textConfig.subtitle.fontFamily as StyleSettings['text']['subtitleFontFamily'],
    subtitleFontWeight: textConfig.subtitle.fontWeight as StyleSettings['text']['subtitleFontWeight'],
  };
}

function deserializeCalloutStyle(calloutsConfig: CalloutsTemplateConfig): StyleSettings['callout'] {
  const firstItem = calloutsConfig.items[0];

  // Extract per-callout zoom settings
  const zoomSettingsMap: Record<CalloutType, { zoom: number; focusX: number; focusY: number }> = {
    detail: { zoom: 1.0, focusX: 50, focusY: 50 },
    fit: { zoom: 1.0, focusX: 50, focusY: 50 },
    pose: { zoom: 1.0, focusX: 50, focusY: 50 },
  };

  // Map slot zoom settings back to callout types based on display order
  calloutsConfig.items.forEach((item, index) => {
    const calloutType = calloutsConfig.displayOrder[index];
    if (calloutType) {
      zoomSettingsMap[calloutType] = {
        zoom: item.zoom,
        focusX: item.focusX,
        focusY: item.focusY,
      };
    }
  });

  return {
    size: calloutsConfig.defaultSize,
    borderWidth: firstItem?.borderWidth ?? 3,
    borderColor: firstItem?.borderColor ?? '#FFFFFF',
    borderRadius: firstItem?.borderRadius ?? 8,
    gap: calloutsConfig.gap,
    x: calloutsConfig.startPosition.x,
    y: calloutsConfig.startPosition.y,
    detail: zoomSettingsMap.detail,
    fit: zoomSettingsMap.fit,
    pose: zoomSettingsMap.pose,
  };
}

// ============================================================================
// Deep Merge Utility
// ============================================================================

function deepMergeStyleSettings(
  defaults: StyleSettings,
  partial: Partial<StyleSettings>
): StyleSettings {
  return {
    modelScene: { ...defaults.modelScene, ...partial.modelScene },
    hero: { ...defaults.hero, ...partial.hero },
    text: { ...defaults.text, ...partial.text },
    callout: {
      ...defaults.callout,
      ...partial.callout,
      detail: { ...defaults.callout.detail, ...partial.callout?.detail },
      fit: { ...defaults.callout.fit, ...partial.callout?.fit },
      pose: { ...defaults.callout.pose, ...partial.callout?.pose },
    },
  };
}

// ============================================================================
// Template Thumbnail Generation
// ============================================================================

export interface ThumbnailOptions {
  width: number;
  height: number;
  quality?: number;
}

/**
 * Generates a thumbnail image from a source image (e.g., final collage).
 * This is used when saving a template to create a preview.
 */
export async function generateTemplateThumbnail(
  sourceImage: string,
  options: ThumbnailOptions
): Promise<string> {
  const { width, height, quality = 80 } = options;

  return new Promise((resolve, reject) => {
    // Handle case where we're not in a browser environment
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      reject(new Error('Thumbnail generation requires a browser environment'));
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }

      // Calculate scaling to cover the thumbnail area
      const scale = Math.max(width / img.width, height / img.height);
      const scaledWidth = img.width * scale;
      const scaledHeight = img.height * scale;
      const offsetX = (width - scaledWidth) / 2;
      const offsetY = (height - scaledHeight) / 2;

      // Draw scaled image
      ctx.drawImage(img, offsetX, offsetY, scaledWidth, scaledHeight);

      // Convert to base64
      const thumbnail = canvas.toDataURL('image/jpeg', quality / 100);
      resolve(thumbnail);
    };

    img.onerror = () => reject(new Error('Failed to load image for thumbnail'));
    img.src = sourceImage;
  });
}

/**
 * Generates a smaller thumbnail for grid/list views.
 */
export async function generateSmallThumbnail(sourceImage: string): Promise<string> {
  return generateTemplateThumbnail(sourceImage, { width: 150, height: 200, quality: 70 });
}

// ============================================================================
// Template Validation
// ============================================================================

/**
 * Validates a template configuration to ensure it's complete and valid.
 */
export function validateTemplateConfig(config: unknown): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!config || typeof config !== 'object') {
    return { valid: false, errors: ['Template config is not an object'] };
  }

  const templateConfig = config as Record<string, unknown>;

  // Check required sections
  const requiredSections = ['canvas', 'hero', 'callouts', 'text', 'ai', 'styleSettings'];
  for (const section of requiredSections) {
    if (!templateConfig[section] || typeof templateConfig[section] !== 'object') {
      errors.push(`Missing or invalid section: ${section}`);
    }
  }

  // Validate canvas
  if (templateConfig.canvas && typeof templateConfig.canvas === 'object') {
    const canvas = templateConfig.canvas as Record<string, unknown>;
    if (typeof canvas.width !== 'number' || canvas.width <= 0) {
      errors.push('Invalid canvas width');
    }
    if (typeof canvas.height !== 'number' || canvas.height <= 0) {
      errors.push('Invalid canvas height');
    }
  }

  // Validate hero
  if (templateConfig.hero && typeof templateConfig.hero === 'object') {
    const hero = templateConfig.hero as Record<string, unknown>;
    if (typeof hero.zoom !== 'number') {
      errors.push('Invalid hero zoom');
    }
  }

  return { valid: errors.length === 0, errors };
}

// ============================================================================
// Export Helpers
// ============================================================================

/**
 * Exports a template configuration to a JSON string.
 */
export function exportTemplateToJSON(config: TemplateConfig): string {
  return JSON.stringify(config, null, 2);
}

/**
 * Parses a template configuration from a JSON string.
 */
export function parseTemplateFromJSON(json: string): TemplateConfig | null {
  try {
    const parsed = JSON.parse(json);
    const validation = validateTemplateConfig(parsed);

    if (!validation.valid) {
      console.error('Template validation errors:', validation.errors);
      return null;
    }

    return parsed as TemplateConfig;
  } catch (error) {
    console.error('Failed to parse template JSON:', error);
    return null;
  }
}
