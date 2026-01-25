// Background preset system for AI Background Replacement
// Part of V2 Hero & Product System

export type BackgroundPreset =
  | 'studio-white'
  | 'studio-gradient'
  | 'studio-dark'
  | 'lifestyle-bedroom'
  | 'lifestyle-outdoor'
  | 'lifestyle-urban'
  | 'lifestyle-cafe'
  | 'abstract-geometric'
  | 'abstract-gradient'
  | 'abstract-minimal'
  | 'seasonal-summer'
  | 'seasonal-winter'
  | 'seasonal-fall'
  | 'seasonal-spring';

export type BackgroundCategory = 'studio' | 'lifestyle' | 'abstract' | 'seasonal';

export interface ProductPlacement {
  scale: number;
  x: number;
  y: number;
  shadow: boolean;
  reflection: boolean;
}

export interface BackgroundPresetConfig {
  id: BackgroundPreset;
  name: string;
  category: BackgroundCategory;
  prompt: string;
  description: string;
  lighting: 'natural' | 'studio' | 'dramatic' | 'soft' | 'golden-hour';
  defaultPlacement: ProductPlacement;
  suggestedColors?: string[];
}

export const BACKGROUND_CATEGORIES: { id: BackgroundCategory; name: string; description: string }[] = [
  { id: 'studio', name: 'Studio', description: 'Clean, professional studio backgrounds' },
  { id: 'lifestyle', name: 'Lifestyle', description: 'Real-world settings and environments' },
  { id: 'abstract', name: 'Abstract', description: 'Creative and artistic backgrounds' },
  { id: 'seasonal', name: 'Seasonal', description: 'Season-themed backgrounds for campaigns' },
];

export const BACKGROUND_PRESETS: Record<BackgroundPreset, BackgroundPresetConfig> = {
  'studio-white': {
    id: 'studio-white',
    name: 'Clean White Studio',
    category: 'studio',
    description: 'Minimalist white backdrop with soft professional lighting',
    prompt: 'Clean white studio background with soft shadows, professional product photography lighting, minimalist aesthetic, high-end commercial look, even diffused lighting, subtle gradient from pure white',
    lighting: 'studio',
    defaultPlacement: { scale: 0.8, x: 50, y: 50, shadow: true, reflection: false },
    suggestedColors: ['#FFFFFF', '#F5F5F5', '#FAFAFA'],
  },
  'studio-gradient': {
    id: 'studio-gradient',
    name: 'Gradient Studio',
    category: 'studio',
    description: 'Smooth gradient backdrop for elegant presentations',
    prompt: 'Smooth gradient background transitioning from light gray to pure white, professional studio lighting, clean and modern aesthetic, soft shadows, commercial photography style',
    lighting: 'studio',
    defaultPlacement: { scale: 0.8, x: 50, y: 50, shadow: true, reflection: true },
    suggestedColors: ['#E5E5E5', '#FFFFFF', '#F0F0F0'],
  },
  'studio-dark': {
    id: 'studio-dark',
    name: 'Dark Studio',
    category: 'studio',
    description: 'Dramatic dark background for premium products',
    prompt: 'Dark charcoal gray to black studio background, dramatic rim lighting, luxury product photography aesthetic, subtle highlights, deep shadows creating depth, high-end fashion photography mood',
    lighting: 'dramatic',
    defaultPlacement: { scale: 0.75, x: 50, y: 50, shadow: false, reflection: true },
    suggestedColors: ['#1A1A1A', '#2D2D2D', '#0D0D0D'],
  },
  'lifestyle-bedroom': {
    id: 'lifestyle-bedroom',
    name: 'Cozy Bedroom',
    category: 'lifestyle',
    description: 'Warm bedroom setting with natural morning light',
    prompt: 'Cozy bedroom setting with soft natural light streaming through sheer curtains, warm neutral tones, comfortable lifestyle aesthetic, unmade white linen bed in soft focus background, morning glow atmosphere',
    lighting: 'natural',
    defaultPlacement: { scale: 0.7, x: 50, y: 60, shadow: false, reflection: false },
    suggestedColors: ['#F5E6D3', '#FFFFFF', '#E8DED5'],
  },
  'lifestyle-outdoor': {
    id: 'lifestyle-outdoor',
    name: 'Outdoor Natural',
    category: 'lifestyle',
    description: 'Fresh outdoor setting with soft daylight',
    prompt: 'Beautiful outdoor setting with soft natural daylight, blurred green nature and trees in background, fresh and airy atmosphere, lifestyle photography feel, bokeh effect on foliage, golden hour hints',
    lighting: 'natural',
    defaultPlacement: { scale: 0.75, x: 50, y: 55, shadow: false, reflection: false },
    suggestedColors: ['#8FBC8F', '#87CEEB', '#F0FFF0'],
  },
  'lifestyle-urban': {
    id: 'lifestyle-urban',
    name: 'Urban Street',
    category: 'lifestyle',
    description: 'Modern city vibes with street aesthetics',
    prompt: 'Urban street setting with concrete and exposed brick textures, modern city vibes, fashion photography aesthetic, blurred graffiti art in background, industrial chic atmosphere, natural street lighting',
    lighting: 'natural',
    defaultPlacement: { scale: 0.8, x: 50, y: 50, shadow: true, reflection: false },
    suggestedColors: ['#808080', '#A0522D', '#696969'],
  },
  'lifestyle-cafe': {
    id: 'lifestyle-cafe',
    name: 'Coffee Shop',
    category: 'lifestyle',
    description: 'Warm cafe atmosphere with ambient lighting',
    prompt: 'Trendy coffee shop interior background, warm ambient lighting, wooden tables and exposed brick, blurred coffee cups and plants, cozy hipster cafe aesthetic, soft bokeh lights, inviting atmosphere',
    lighting: 'soft',
    defaultPlacement: { scale: 0.7, x: 45, y: 55, shadow: false, reflection: false },
    suggestedColors: ['#8B4513', '#DEB887', '#D2691E'],
  },
  'abstract-geometric': {
    id: 'abstract-geometric',
    name: 'Geometric Abstract',
    category: 'abstract',
    description: 'Modern geometric shapes and bold lines',
    prompt: 'Abstract geometric shapes background, modern and artistic, clean lines with bold complementary colors, 3D geometric forms, contemporary art aesthetic, Memphis design inspired, soft gradients between shapes',
    lighting: 'studio',
    defaultPlacement: { scale: 0.85, x: 50, y: 50, shadow: false, reflection: false },
    suggestedColors: ['#FF6B6B', '#4ECDC4', '#45B7D1'],
  },
  'abstract-gradient': {
    id: 'abstract-gradient',
    name: 'Colorful Gradient',
    category: 'abstract',
    description: 'Vibrant flowing color gradients',
    prompt: 'Smooth colorful gradient background, vibrant but harmonious colors flowing together, modern aesthetic, aurora-like color transitions, soft and dreamy atmosphere, professional yet creative',
    lighting: 'soft',
    defaultPlacement: { scale: 0.8, x: 50, y: 50, shadow: false, reflection: false },
    suggestedColors: ['#667EEA', '#764BA2', '#F093FB'],
  },
  'abstract-minimal': {
    id: 'abstract-minimal',
    name: 'Minimal Shapes',
    category: 'abstract',
    description: 'Simple shapes with subtle textures',
    prompt: 'Minimalist abstract background with simple organic shapes, subtle paper texture, muted earthy tones, Scandinavian design inspired, clean and serene, understated elegance, soft natural shadows',
    lighting: 'soft',
    defaultPlacement: { scale: 0.8, x: 50, y: 50, shadow: true, reflection: false },
    suggestedColors: ['#E8E4E1', '#D4C5B9', '#C4B7A6'],
  },
  'seasonal-summer': {
    id: 'seasonal-summer',
    name: 'Summer Vibes',
    category: 'seasonal',
    description: 'Bright and sunny beach atmosphere',
    prompt: 'Bright summer beach setting with warm golden sunlight, soft sandy tones, palm trees and ocean hints in blurred background, vacation mood, tropical paradise feeling, lens flare accents',
    lighting: 'golden-hour',
    defaultPlacement: { scale: 0.75, x: 50, y: 55, shadow: true, reflection: false },
    suggestedColors: ['#FFD700', '#87CEEB', '#F4A460'],
  },
  'seasonal-winter': {
    id: 'seasonal-winter',
    name: 'Winter Cozy',
    category: 'seasonal',
    description: 'Cozy winter indoor setting',
    prompt: 'Cozy winter indoor setting with soft snow visible through frosted windows, warm indoor lighting, holiday candles and blankets in soft focus, hygge atmosphere, warm and inviting contrast to cold outside',
    lighting: 'soft',
    defaultPlacement: { scale: 0.8, x: 50, y: 50, shadow: false, reflection: false },
    suggestedColors: ['#FFFAFA', '#E0FFFF', '#B0C4DE'],
  },
  'seasonal-fall': {
    id: 'seasonal-fall',
    name: 'Autumn Warmth',
    category: 'seasonal',
    description: 'Rich autumn colors and golden light',
    prompt: 'Warm autumn outdoor setting with fall foliage in rich orange and red tones, golden hour lighting creating long shadows, cozy sweater weather atmosphere, scattered fallen leaves, nostalgic mood',
    lighting: 'golden-hour',
    defaultPlacement: { scale: 0.75, x: 50, y: 55, shadow: true, reflection: false },
    suggestedColors: ['#CD853F', '#D2691E', '#8B4513'],
  },
  'seasonal-spring': {
    id: 'seasonal-spring',
    name: 'Spring Fresh',
    category: 'seasonal',
    description: 'Fresh pastels with blooming flowers',
    prompt: 'Fresh spring garden setting with soft pastel colors, cherry blossoms and spring flowers in blurred background, bright and airy atmosphere, new beginnings feeling, morning dew sparkles, renewal energy',
    lighting: 'natural',
    defaultPlacement: { scale: 0.75, x: 50, y: 55, shadow: false, reflection: false },
    suggestedColors: ['#FFB7C5', '#98FB98', '#E6E6FA'],
  },
};

// Get all presets for a category
export function getPresetsByCategory(category: BackgroundCategory): BackgroundPresetConfig[] {
  return Object.values(BACKGROUND_PRESETS).filter(preset => preset.category === category);
}

// Get all presets as array
export function getAllPresets(): BackgroundPresetConfig[] {
  return Object.values(BACKGROUND_PRESETS);
}

// Build a custom prompt from base prompt with additional modifications
export function buildBackgroundPrompt(
  basePrompt: string,
  customAdditions?: string,
  colorScheme?: string
): string {
  let prompt = basePrompt;

  if (colorScheme) {
    prompt += `, using ${colorScheme} color palette`;
  }

  if (customAdditions) {
    prompt += `. ${customAdditions}`;
  }

  // Add technical requirements
  prompt += '. High resolution, 8K quality, professional photography, suitable for apparel product placement.';

  return prompt;
}

// Suggested custom prompt templates for user inspiration
export const CUSTOM_PROMPT_SUGGESTIONS = [
  'Luxury marble surface with gold accents',
  'Neon-lit cyberpunk city at night',
  'Rustic wooden farmhouse table setting',
  'Tropical rainforest with exotic plants',
  'Modern art gallery with white walls',
  'Sunset beach with palm tree silhouettes',
  'Minimalist Japanese zen garden',
  'Retro 80s disco floor with lights',
  'Cozy library with old books',
  'Mountain peak with dramatic clouds',
];

export default BACKGROUND_PRESETS;
