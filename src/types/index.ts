// Types for Apparel Creative Generator

export type Step = 1 | 2 | 3 | 4 | 5 | 6 | 7; // 7 steps: Upload, Model/Scene, Hero, Callouts, Text, Layout, Export

export type CalloutType = 'detail' | 'fit' | 'pose';

// ============================================================================
// Callout Prompt Types (Prompt Control Feature)
// ============================================================================

// Callout prompt definition
export interface CalloutPrompt {
  id: string;                    // Unique identifier
  name: string;                  // Display name (e.g., "Detail Shot", "Fit Shot")
  promptText: string;            // The actual prompt template
  isBuiltIn: boolean;            // true for default prompts, false for user-created
  createdAt?: number;            // Timestamp for user-created prompts
}

// Slot types for callout images
export type CalloutSlot = 'slot0' | 'slot1' | 'slot2';

export interface CalloutImages {
  detail: string | null;
  fit: string | null;
  pose: string | null;
}

export interface TextContent {
  headline: string;
  subtitle: string;
}

// ============================================================================
// Style Settings Types
// ============================================================================

// Copy space options for hero composition
export type CopySpace = 'left' | 'right' | 'top' | 'bottom' | 'center';

// Model & Scene Style (AI Generation)
export interface ModelSceneStyle {
  modelGender: 'female' | 'male';
  modelAge: 'young' | 'middle' | 'mature';
  modelEthnicity: 'any' | 'caucasian' | 'african' | 'asian' | 'hispanic' | 'middle-eastern' | 'south-asian';
  pose: 'relaxed' | 'dynamic' | 'elegant' | 'casual' | 'confident';
  setting: 'studio' | 'outdoor' | 'urban' | 'home' | 'minimalist';
  mood: 'casual' | 'energetic' | 'elegant' | 'edgy' | 'cozy' | 'professional';
  lighting: 'natural' | 'studio' | 'golden-hour' | 'dramatic' | 'soft';
  // Hero template selection (90s/2000s flash aesthetic)
  selectedHeroTemplate: string | null; // Template ID from prompt-templates.ts, null = use dropdowns
  customPromptAddition: string; // Additional custom prompt text to append
  // Copy space - where to leave room for text/callouts overlay
  copySpace: CopySpace;
}

// Hero Style
export interface HeroStyle {
  zoom: number;      // Zoom level (1.0 = normal, 2.0 = 2x zoom)
  focusX: number;    // Horizontal focus point (0-100, 50 = center)
  focusY: number;    // Vertical focus point (0-100, 50 = center)
}

// Text Style
export interface TextStyle {
  headlineFontSize: number;
  headlineColor: string;
  headlineShadow: boolean;
  headlineX: number;        // X position (0-1080)
  headlineY: number;        // Y position (0-1920)
  subtitleFontSize: number;
  subtitleColor: string;
  subtitleLetterSpacing: number;
  subtitleGap: number;      // Gap between headline and subtitle
}

// Individual callout zoom/focus settings
export interface CalloutZoomSettings {
  zoom: number;    // Zoom level (1.0 = normal, 2.0 = 2x zoom)
  focusX: number;  // Horizontal focus point (0-100, 50 = center)
  focusY: number;  // Vertical focus point (0-100, 50 = center)
}

// Callout Style
export interface CalloutStyle {
  size: number; // width & height (square)
  borderWidth: number;
  borderColor: string;
  borderRadius: number;
  gap: number;
  x: number;    // X position (0-1080)
  y: number;    // Y position for first callout (0-1920)
  // Per-callout zoom and focus settings
  detail: CalloutZoomSettings;
  fit: CalloutZoomSettings;
  pose: CalloutZoomSettings;
}

// Combined Style Settings
export interface StyleSettings {
  modelScene: ModelSceneStyle;
  hero: HeroStyle;
  text: TextStyle;
  callout: CalloutStyle;
}

// Default Style Settings
export const DEFAULT_STYLE_SETTINGS: StyleSettings = {
  modelScene: {
    modelGender: 'female',
    modelAge: 'young',
    modelEthnicity: 'any',
    pose: 'relaxed',
    setting: 'home',
    mood: 'cozy',
    lighting: 'natural',
    selectedHeroTemplate: null, // null = use dropdown settings, or template ID
    customPromptAddition: '', // Additional custom text to append to prompt
    copySpace: 'left', // Default: leave left side clear for callouts
  },
  hero: {
    zoom: 1.0,
    focusX: 50,
    focusY: 50,
  },
  text: {
    headlineFontSize: 72,
    headlineColor: '#FFFFFF',
    headlineShadow: true,
    headlineX: 48,
    headlineY: 820,
    subtitleFontSize: 18,
    subtitleColor: 'rgba(255, 255, 255, 0.9)',
    subtitleLetterSpacing: 3,
    subtitleGap: 20,
  },
  callout: {
    size: 200,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    borderRadius: 8,
    gap: 16,
    x: 48,
    y: 760,
    detail: { zoom: 1.0, focusX: 50, focusY: 50 },
    fit: { zoom: 1.0, focusX: 50, focusY: 50 },
    pose: { zoom: 1.0, focusX: 50, focusY: 50 },
  },
};

// Legacy type for backwards compatibility
export interface GenerationStyle {
  modelGender?: 'female' | 'male' | 'neutral';
  setting?: 'studio' | 'outdoor' | 'lifestyle';
  mood?: 'casual' | 'professional' | 'energetic';
}

// API Response Types
export interface ApiError {
  code: string;
  message: string;
  retryAfter?: number;
}

export interface UploadResponse {
  success: boolean;
  data?: {
    imageUrl: string;
    imageId: string;
    dimensions: { width: number; height: number };
    fileSize: number;
  };
  error?: ApiError;
}

export interface HeroGenerationResponse {
  success: boolean;
  data?: {
    heroImageUrl: string;
    heroImageId: string;
    promptUsed: string;
    generationTime: number;
    generatedPrompt?: string;  // The auto-generated prompt (before any customization)
  };
  error?: ApiError;
}

export interface CalloutImage {
  type: CalloutType;
  imageUrl: string;
  imageId: string;
  promptUsed: string;
}

export interface CalloutsGenerationResponse {
  success: boolean;
  data?: {
    callouts: CalloutImage[];
    totalGenerationTime: number;
  };
  error?: ApiError;
}

export interface CollageResponse {
  success: boolean;
  data?: {
    collageUrl: string;
    collageId: string;
    dimensions: { width: number; height: number };
    downloadUrl: string;
    compositionTime: number;
  };
  error?: ApiError;
}

// Store State
export interface CreativeState {
  // Step tracking
  currentStep: Step;

  // Uploaded product
  productImage: string | null;
  productImageFile: File | null;

  // Style settings
  styleSettings: StyleSettings;

  // Generated images
  heroImage: string | null;
  heroPrompt: string;
  calloutImages: CalloutImages;

  // Hero prompt control
  heroGeneratedPrompt: string;           // The auto-generated prompt (read-only display)
  heroCustomPrompt: string;              // User-edited prompt
  useCustomHeroPrompt: boolean;          // Toggle between auto/custom

  // Callout prompts management
  calloutPrompts: CalloutPrompt[];       // All available prompts (built-in + custom)

  // Callout selection for generation (array of 3 promptIds for slots 0,1,2)
  selectedCallouts: [string, string, string];

  // Text content
  headline: string;
  subtitle: string;

  // Final output
  finalCollage: string | null;

  // Loading states
  isUploading: boolean;
  isGeneratingHero: boolean;
  isGeneratingCallouts: boolean;
  isComposing: boolean;

  // Error state
  error: string | null;
}

export interface CreativeActions {
  setProductImage: (url: string, file: File) => void;
  setStyleSettings: (settings: Partial<StyleSettings>) => void;
  setModelSceneStyle: (style: Partial<ModelSceneStyle>) => void;
  setHeroStyle: (style: Partial<HeroStyle>) => void;
  setTextStyle: (style: Partial<TextStyle>) => void;
  setCalloutStyle: (style: Partial<CalloutStyle>) => void;
  setHeroImage: (url: string) => void;
  setCalloutImage: (type: CalloutType, url: string) => void;
  setText: (headline: string, subtitle: string) => void;
  setFinalCollage: (url: string) => void;
  setLoading: (key: 'isUploading' | 'isGeneratingHero' | 'isGeneratingCallouts' | 'isComposing', value: boolean) => void;
  setError: (error: string | null) => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: Step) => void;
  reset: () => void;

  // Hero prompt control actions
  setHeroGeneratedPrompt: (prompt: string) => void;
  setHeroCustomPrompt: (prompt: string) => void;
  setUseCustomHeroPrompt: (use: boolean) => void;

  // Callout prompt management actions
  addCalloutPrompt: (prompt: Omit<CalloutPrompt, 'id' | 'createdAt'>) => void;
  updateCalloutPrompt: (id: string, updates: Partial<CalloutPrompt>) => void;
  deleteCalloutPrompt: (id: string) => void;

  // Callout selection actions
  setSelectedCallout: (slotIndex: 0 | 1 | 2, promptId: string) => void;
  setAllSelectedCallouts: (promptIds: [string, string, string]) => void;
}

export type CreativeStore = CreativeState & CreativeActions;
