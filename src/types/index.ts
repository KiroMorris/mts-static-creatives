// Types for Apparel Creative Generator

export type Step = 1 | 2 | 3 | 4 | 5;

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
