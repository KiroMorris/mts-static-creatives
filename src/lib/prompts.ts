// AI prompt templates for Gemini Nano Banana Pro
import type { ModelSceneStyle } from '@/types';

// ============================================================================
// Helper functions for prompt building
// ============================================================================

function getGenderText(gender: ModelSceneStyle['modelGender']): string {
  return gender === 'male' ? 'male' : 'female';
}

function getAgeText(age: ModelSceneStyle['modelAge']): string {
  switch (age) {
    case 'young': return 'young (early 20s)';
    case 'middle': return 'adult (30s)';
    case 'mature': return 'mature (40s+)';
    default: return 'young';
  }
}

function getEthnicityText(ethnicity: ModelSceneStyle['modelEthnicity']): string {
  if (ethnicity === 'any') return '';
  return `${ethnicity} `;
}

function getPoseText(pose: ModelSceneStyle['pose']): string {
  switch (pose) {
    case 'relaxed': return 'Relaxed lifestyle pose, natural and comfortable';
    case 'dynamic': return 'Dynamic energetic pose, showing movement';
    case 'elegant': return 'Elegant sophisticated pose, poised and graceful';
    case 'casual': return 'Casual everyday pose, authentic and approachable';
    case 'confident': return 'Confident powerful pose, strong presence';
    default: return 'Natural relaxed pose';
  }
}

function getSettingText(setting: ModelSceneStyle['setting']): string {
  switch (setting) {
    case 'studio': return 'Professional studio with neutral backdrop';
    case 'outdoor': return 'Beautiful outdoor natural environment';
    case 'urban': return 'Modern urban city setting, street style';
    case 'home': return 'Cozy home interior, warm and inviting';
    case 'minimalist': return 'Clean minimalist space, simple and modern';
    default: return 'Neutral setting';
  }
}

function getMoodText(mood: ModelSceneStyle['mood']): string {
  switch (mood) {
    case 'casual': return 'casual and approachable vibe';
    case 'energetic': return 'energetic and vibrant mood';
    case 'elegant': return 'elegant and sophisticated atmosphere';
    case 'edgy': return 'edgy and bold aesthetic';
    case 'cozy': return 'cozy and comfortable feeling';
    case 'professional': return 'professional and polished look';
    default: return 'natural mood';
  }
}

function getLightingText(lighting: ModelSceneStyle['lighting']): string {
  switch (lighting) {
    case 'natural': return 'Soft natural lighting';
    case 'studio': return 'Professional studio lighting';
    case 'golden-hour': return 'Warm golden hour lighting';
    case 'dramatic': return 'Dramatic contrasting lighting';
    case 'soft': return 'Soft diffused lighting';
    default: return 'Natural lighting';
  }
}

// ============================================================================
// Main prompt generators
// ============================================================================

export const PROMPTS = {
  hero: (
    productColor: string = 'the shown',
    productType: string = 'hoodie',
    style?: ModelSceneStyle
  ) => {
    const s = style || {
      modelGender: 'female',
      modelAge: 'young',
      modelEthnicity: 'any',
      pose: 'relaxed',
      setting: 'home',
      mood: 'cozy',
      lighting: 'natural',
    };

    return `
Generate a professional fashion photography image of a ${getAgeText(s.modelAge)} attractive ${getEthnicityText(s.modelEthnicity)}${getGenderText(s.modelGender)} model wearing this ${productColor} ${productType}.

Model: ${getGenderText(s.modelGender)}, ${getAgeText(s.modelAge)}${s.modelEthnicity !== 'any' ? `, ${s.modelEthnicity} ethnicity` : ''}
Pose: ${getPoseText(s.pose)}
Setting: ${getSettingText(s.setting)}
Mood: ${getMoodText(s.mood)}
Lighting: ${getLightingText(s.lighting)}
Framing: Portrait orientation (9:16 aspect ratio), model from waist up, face clearly visible
Expression: Natural expression matching the ${s.mood} mood
Quality: Sharp focus, professional lighting, fashion magazine quality

IMPORTANT: Maintain exact color and design details of the garment. The ${productType} should be the focal point.
`.trim();
  },

  calloutDetail: (
    productColor: string = 'the shown',
    productType: string = 'hoodie',
    style?: ModelSceneStyle
  ) => {
    const s = style || { lighting: 'soft', mood: 'cozy' };
    return `
Close-up fashion photography shot focusing on the fabric texture and quality of a ${productColor} ${productType}.

Show: Soft cotton/fleece texture, quality stitching details, fabric drape
Framing: SQUARE 1:1 aspect ratio, tight crop on shoulder/chest area of the garment
Lighting: ${getLightingText(s.lighting as ModelSceneStyle['lighting'])}
Mood: ${getMoodText(s.mood as ModelSceneStyle['mood'])}
Subject Consistency: Use the exact same model from the hero shot

IMPORTANT: Output must be SQUARE (1:1 ratio). Focus on texture and material quality. Professional product detail shot.
`.trim();
  },

  calloutFit: (
    productColor: string = 'the shown',
    productType: string = 'hoodie',
    style?: ModelSceneStyle
  ) => {
    const s = style || { lighting: 'natural', mood: 'casual' };
    return `
Fashion photography showing the fit of a ${productColor} ${productType} on the same model.

Show: Cropped view of torso/waist area showing how the garment fits
Framing: SQUARE 1:1 aspect ratio, mid-body crop, casual relaxed pose
Lighting: ${getLightingText(s.lighting as ModelSceneStyle['lighting'])}
Mood: ${getMoodText(s.mood as ModelSceneStyle['mood'])}
Subject Consistency: Use the exact same model from the hero shot

IMPORTANT: Output must be SQUARE (1:1 ratio). Emphasize the comfortable, flattering fit of the garment.
`.trim();
  },

  calloutPose: (
    productColor: string = 'the shown',
    productType: string = 'hoodie',
    style?: ModelSceneStyle
  ) => {
    const s = style || { pose: 'relaxed', lighting: 'natural', mood: 'cozy' };
    return `
Alternative lifestyle shot of the same model wearing the ${productColor} ${productType}.

Pose: ${getPoseText(s.pose as ModelSceneStyle['pose'])} - different angle from hero
Expression: Natural expression matching the ${s.mood} mood
Framing: SQUARE 1:1 aspect ratio, head and upper body visible, different composition than hero
Lighting: ${getLightingText(s.lighting as ModelSceneStyle['lighting'])}
Subject Consistency: Use the exact same model from the hero shot

IMPORTANT: Output must be SQUARE (1:1 ratio). Show versatility and lifestyle context of the garment.
`.trim();
  },

  // Combined prompt for generating all images with subject consistency
  fullCreative: (productColor: string = 'the shown', productType: string = 'hoodie') => `
Generate a cohesive set of 4 fashion photography images featuring the SAME model wearing this ${productColor} ${productType}:

1. HERO IMAGE (main, large):
   - Full lifestyle shot, model with arm raised above head, lying down
   - Portrait 9:16 orientation, face clearly visible, looking at camera
   - Soft natural indoor lighting, cozy atmosphere

2. DETAIL CALLOUT (small, square):
   - Close-up of fabric texture on shoulder/chest area
   - Show material quality and stitching

3. FIT CALLOUT (small, square):
   - Mid-body crop showing fit around waist/torso
   - Casual pose, authentic feel

4. POSE CALLOUT (small, square):
   - Alternative angle, model relaxed/eyes closed
   - Different composition, same cozy vibe

CRITICAL REQUIREMENTS:
- ALL 4 images must feature the EXACT SAME MODEL for consistency
- Maintain exact garment color and design across all shots
- Professional fashion campaign quality
- Cohesive lighting and mood throughout
`.trim(),
};

export type PromptType = keyof typeof PROMPTS;
