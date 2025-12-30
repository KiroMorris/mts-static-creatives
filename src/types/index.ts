// Types for Apparel Creative Generator

export type Step = 1 | 2 | 3 | 4 | 5 | 6; // Added step 2 for style settings

export type CalloutType = 'detail' | 'fit' | 'pose';

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

// Model & Scene Style (AI Generation)
export interface ModelSceneStyle {
  modelGender: 'female' | 'male';
  modelAge: 'young' | 'middle' | 'mature';
  modelEthnicity: 'any' | 'caucasian' | 'african' | 'asian' | 'hispanic' | 'middle-eastern' | 'south-asian';
  pose: 'relaxed' | 'dynamic' | 'elegant' | 'casual' | 'confident';
  setting: 'studio' | 'outdoor' | 'urban' | 'home' | 'minimalist';
  mood: 'casual' | 'energetic' | 'elegant' | 'edgy' | 'cozy' | 'professional';
  lighting: 'natural' | 'studio' | 'golden-hour' | 'dramatic' | 'soft';
}

// Text Style
export interface TextStyle {
  headlineFontSize: number;
  headlineColor: string;
  headlineShadow: boolean;
  headlinePosition: 'top' | 'middle' | 'bottom';
  subtitleFontSize: number;
  subtitleColor: string;
  subtitleLetterSpacing: number;
}

// Callout Style
export interface CalloutStyle {
  size: number; // width & height (square)
  borderWidth: number;
  borderColor: string;
  borderRadius: number;
  gap: number;
  position: 'left' | 'right';
  verticalPosition: 'top' | 'middle' | 'bottom';
}

// Combined Style Settings
export interface StyleSettings {
  modelScene: ModelSceneStyle;
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
  },
  text: {
    headlineFontSize: 72,
    headlineColor: '#FFFFFF',
    headlineShadow: true,
    headlinePosition: 'middle',
    subtitleFontSize: 18,
    subtitleColor: 'rgba(255, 255, 255, 0.9)',
    subtitleLetterSpacing: 3,
  },
  callout: {
    size: 200,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    borderRadius: 8,
    gap: 16,
    position: 'left',
    verticalPosition: 'middle',
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
}

export type CreativeStore = CreativeState & CreativeActions;
