// Template System Types for Apparel Creative Generator V2
// Templates save EVERYTHING except the product/hero images

import type {
  StyleSettings,
  CalloutPrompt,
  CalloutType,
  ModelSceneStyle,
  CopySpace,
} from './index';

// ============================================================================
// Template Schema Version
// ============================================================================

export const CURRENT_TEMPLATE_VERSION = '1.0.0';

// ============================================================================
// Template Categories
// ============================================================================

export type TemplateCategory =
  | 'minimal'
  | 'bold'
  | 'sale'
  | 'new-arrival'
  | 'seasonal'
  | 'lifestyle'
  | 'premium'
  | 'custom';

// ============================================================================
// Aspect Ratio Types
// ============================================================================

export type AspectRatio =
  | '9:16'    // Instagram Story, TikTok (1080x1920)
  | '4:5'     // Instagram Feed (1080x1350)
  | '1:1'     // Square (1080x1080)
  | '16:9'    // YouTube Thumbnail (1920x1080)
  | '2:3'     // Pinterest (1000x1500)
  | 'custom';

export interface AspectRatioConfig {
  ratio: AspectRatio;
  width: number;
  height: number;
  label: string;
}

// Predefined aspect ratio configurations
export const ASPECT_RATIO_CONFIGS: Record<Exclude<AspectRatio, 'custom'>, AspectRatioConfig> = {
  '9:16': { ratio: '9:16', width: 1080, height: 1920, label: 'Story (9:16)' },
  '4:5': { ratio: '4:5', width: 1080, height: 1350, label: 'Feed (4:5)' },
  '1:1': { ratio: '1:1', width: 1080, height: 1080, label: 'Square (1:1)' },
  '16:9': { ratio: '16:9', width: 1920, height: 1080, label: 'Landscape (16:9)' },
  '2:3': { ratio: '2:3', width: 1000, height: 1500, label: 'Pinterest (2:3)' },
};

// ============================================================================
// Canvas Configuration
// ============================================================================

export interface CanvasConfig {
  width: number;
  height: number;
  aspectRatio: AspectRatio;
  backgroundColor: string;
}

// ============================================================================
// Element Position & Size
// ============================================================================

export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface ElementBounds {
  position: Position;
  size: Size;
}

// ============================================================================
// Hero Configuration (Settings saved, NOT the image)
// ============================================================================

export interface HeroTemplateConfig {
  // Position & size within canvas
  bounds: ElementBounds;

  // Zoom and focus settings (how the hero image is cropped/displayed)
  zoom: number;           // 1.0 = normal, 2.0 = 2x zoom
  focusX: number;         // 0-100, horizontal focus point
  focusY: number;         // 0-100, vertical focus point

  // Object fit
  fit: 'cover' | 'contain' | 'fill';

  // Optional overlay
  overlay?: {
    enabled: boolean;
    type: 'solid' | 'gradient';
    color?: string;
    gradientDirection?: 'to-top' | 'to-bottom' | 'to-left' | 'to-right';
    gradientStops?: Array<{ color: string; position: number }>;
    opacity: number;
  };

  // Image adjustments
  filters?: {
    brightness: number;   // 0-200, 100 = normal
    contrast: number;     // 0-200, 100 = normal
    saturation: number;   // 0-200, 100 = normal
    blur: number;         // 0-20px
  };
}

// ============================================================================
// Callout Configuration
// ============================================================================

export interface CalloutItemTemplateConfig {
  // Which slot this config applies to (0, 1, 2)
  slotIndex: number;

  // Position & size
  bounds: ElementBounds;

  // Zoom and focus (how the callout image is cropped)
  zoom: number;
  focusX: number;
  focusY: number;

  // Border styling
  borderRadius: number;
  borderWidth: number;
  borderColor: string;

  // Shadow
  shadow?: {
    enabled: boolean;
    offsetX: number;
    offsetY: number;
    blur: number;
    spread: number;
    color: string;
  };

  // Visibility
  visible: boolean;
}

export interface CalloutsTemplateConfig {
  // Number of callouts to show
  count: number;

  // Gap between callouts
  gap: number;

  // Starting position (x, y of first callout)
  startPosition: Position;

  // Global callout size (used if individual sizes not set)
  defaultSize: number;

  // Individual callout configurations
  items: CalloutItemTemplateConfig[];

  // Display order
  displayOrder: [CalloutType, CalloutType, CalloutType];
}

// ============================================================================
// Text Configuration
// ============================================================================

export interface TextElementConfig {
  position: Position;

  // Typography
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  lineHeight?: number;
  letterSpacing: number;

  // Color
  color: string;

  // Text shadow
  shadow?: {
    enabled: boolean;
    offsetX: number;
    offsetY: number;
    blur: number;
    color: string;
  };

  // Text transform
  textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';

  // Alignment
  textAlign?: 'left' | 'center' | 'right';

  // Max width for wrapping
  maxWidth?: number;

  // Placeholder content (optional - what to show as default)
  placeholder?: string;

  // Actual content (optional - saved if user wants to preserve text)
  content?: string;
}

export interface TextTemplateConfig {
  headline: TextElementConfig;
  subtitle: TextElementConfig;

  // Gap between headline and subtitle
  gap: number;
}

// ============================================================================
// AI Generation Settings (Prompt templates, NOT generated images)
// ============================================================================

export interface AIHeroTemplateConfig {
  // The selected hero template ID (from prompt-templates.ts)
  selectedHeroTemplate: string | null;

  // Custom prompt addition
  customPromptAddition: string;

  // Model/scene style preferences - using types from ModelSceneStyle
  modelGender: ModelSceneStyle['modelGender'];
  modelAge: ModelSceneStyle['modelAge'];
  modelEthnicity: ModelSceneStyle['modelEthnicity'];
  pose: ModelSceneStyle['pose'];
  setting: ModelSceneStyle['setting'];
  mood: ModelSceneStyle['mood'];
  lighting: ModelSceneStyle['lighting'];

  // Copy space preference
  copySpace: CopySpace;
}

export interface AICalloutTemplateConfig {
  // Selected callout prompt IDs for each slot
  selectedCallouts: [string, string, string];

  // Custom callout prompts (user-created)
  customCalloutPrompts: CalloutPrompt[];
}

export interface AITemplateConfig {
  hero: AIHeroTemplateConfig;
  callouts: AICalloutTemplateConfig;
}

// ============================================================================
// Brand Assets Configuration
// ============================================================================

export interface BrandAssetConfig {
  id: string;
  type: 'logo' | 'watermark' | 'badge' | 'icon';

  // Position & size
  bounds: ElementBounds;

  // The asset URL/data (base64 or URL)
  assetUrl?: string;

  // Opacity
  opacity: number;

  // Visibility
  visible: boolean;
}

export interface BrandAssetsTemplateConfig {
  assets: BrandAssetConfig[];
}

// ============================================================================
// Complete Template Configuration
// ============================================================================

export interface TemplateConfig {
  // Canvas settings
  canvas: CanvasConfig;

  // Hero settings (zoom, focus, position - NOT the image)
  hero: HeroTemplateConfig;

  // Callouts settings
  callouts: CalloutsTemplateConfig;

  // Text settings
  text: TextTemplateConfig;

  // AI generation settings (prompts, styles - NOT generated images)
  ai: AITemplateConfig;

  // Brand assets (logos, watermarks)
  brandAssets?: BrandAssetsTemplateConfig;

  // Original style settings from the creative store (for backwards compat)
  styleSettings: StyleSettings;
}

// ============================================================================
// Template Metadata
// ============================================================================

export interface TemplateMetadata {
  // Unique identifier
  id: string;

  // Schema version for migrations
  version: string;

  // User-provided name
  name: string;

  // Optional description
  description?: string;

  // Category for organization
  category: TemplateCategory;

  // Searchable tags
  tags: string[];

  // Timestamps (ISO 8601)
  createdAt: string;
  updatedAt: string;

  // Thumbnail preview (base64 or URL)
  thumbnail?: string;
  thumbnailSmall?: string;

  // Source tracking
  isPreset: boolean;      // Is this a built-in template?
  isCustom: boolean;      // Was this user-created?
  basedOn?: string;       // Parent template ID if derived from another
}

// ============================================================================
// Complete Template Interface
// ============================================================================

export interface Template extends TemplateMetadata {
  // The actual configuration
  config: TemplateConfig;
}

// ============================================================================
// Template Store State
// ============================================================================

export interface TemplateState {
  // All templates (presets + user-created)
  templates: Template[];

  // Currently active/selected template
  activeTemplateId: string | null;

  // Loading state
  isLoading: boolean;

  // Error state
  error: string | null;

  // Search/filter state
  searchQuery: string;
  categoryFilter: TemplateCategory | 'all';
}

// ============================================================================
// Template Store Actions
// ============================================================================

export interface TemplateActions {
  // Load templates from storage
  loadTemplates: () => Promise<void>;

  // Save a new template from current creative state
  saveTemplate: (
    name: string,
    options?: {
      description?: string;
      category?: TemplateCategory;
      tags?: string[];
      includeTextContent?: boolean;
      thumbnail?: string;
    }
  ) => Promise<Template>;

  // Update an existing template
  updateTemplate: (id: string, updates: Partial<Template>) => void;

  // Delete a template
  deleteTemplate: (id: string) => void;

  // Duplicate a template
  duplicateTemplate: (id: string, newName: string) => Template;

  // Apply a template to the current creative
  applyTemplate: (id: string) => void;

  // Export template to JSON file
  exportTemplate: (id: string) => void;

  // Import templates from file
  importTemplates: (file: File) => Promise<number>;

  // Set active template
  setActiveTemplateId: (id: string | null) => void;

  // Search/filter
  setSearchQuery: (query: string) => void;
  setCategoryFilter: (category: TemplateCategory | 'all') => void;

  // Get filtered templates
  getFilteredTemplates: () => Template[];
}

export type TemplateStore = TemplateState & TemplateActions;

// ============================================================================
// Save Template Options
// ============================================================================

export interface SaveTemplateOptions {
  // Include text content or just styling
  includeTextContent: boolean;

  // Include AI generation settings
  includeAISettings: boolean;

  // Include brand assets
  includeBrandAssets: boolean;
}

// ============================================================================
// Template Export Format
// ============================================================================

export interface TemplateExportData {
  version: string;
  exportedAt: string;
  templates: Template[];
}
