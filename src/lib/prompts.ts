// AI prompt templates for Gemini - JSON structured prompts
// 90s/2000s direct flash aesthetic - raw, unpolished, authentic
import type { ModelSceneStyle, CopySpace } from '@/types';

// ============================================================================
// Helper functions
// ============================================================================

function getModelDescription(style: ModelSceneStyle): string {
  const gender = style.modelGender === 'male' ? 'Male' : 'Female';
  const age = style.modelAge === 'young' ? 'early 20s' : style.modelAge === 'middle' ? '30s' : '40s+';
  const ethnicity = style.modelEthnicity !== 'any' ? `, ${style.modelEthnicity}` : '';
  return `${gender} model${ethnicity}, ${age}`;
}

function getCopySpaceComposition(copySpace: CopySpace): { subject_placement: string; negative_space: string } {
  switch (copySpace) {
    case 'left':
      return {
        subject_placement: "Position model/subject on the RIGHT side of frame",
        negative_space: "Leave LEFT 30% of frame clear and empty for text and graphic overlays"
      };
    case 'right':
      return {
        subject_placement: "Position model/subject on the LEFT side of frame",
        negative_space: "Leave RIGHT 30% of frame clear and empty for text and graphic overlays"
      };
    case 'top':
      return {
        subject_placement: "Position model/subject in the LOWER portion of frame",
        negative_space: "Leave TOP 30% of frame clear and empty for text and graphic overlays"
      };
    case 'bottom':
      return {
        subject_placement: "Position model/subject in the UPPER portion of frame",
        negative_space: "Leave BOTTOM 30% of frame clear and empty for text and graphic overlays"
      };
    case 'center':
    default:
      return {
        subject_placement: "Center model/subject in frame",
        negative_space: "No specific copy space required, subject centered"
      };
  }
}

// ============================================================================
// HERO PROMPT - Your exact JSON with conditional logic + copy space
// ============================================================================

export function generateHeroPrompt(style: ModelSceneStyle): string {
  const copySpaceComposition = getCopySpaceComposition(style.copySpace || 'left');

  const prompt: Record<string, unknown> = {
    task: "Transform the uploaded product into a 90s flash fashion hero image",
    input_handling: {
      if_flat_lay: "Lift the product and naturally place it on a model",
      if_model: "Keep the same model and garment",
      if_white_background: "Replace background with a neutral textured surface"
    },
    subject: {
      product: "Uploaded hoodie / sweatshirt / apparel",
      model: getModelDescription(style),
      pose: "Relaxed lying-down pose, top-down composition",
      emotion: "Effortless, cozy, confident"
    },
    composition: {
      copy_space: style.copySpace || 'left',
      subject_placement: copySpaceComposition.subject_placement,
      negative_space: copySpaceComposition.negative_space,
      framing: "Shoot for layout - leave room for text and callout overlays"
    },
    camera: {
      lens: "35mm",
      angle: "Top-down overhead",
      focus: "Sharp on fabric and overall silhouette"
    },
    lighting: {
      type: "Direct on-camera flash",
      style: "Raw, slightly harsh",
      era: "90s / early 2000s fashion"
    },
    styling: {
      fit: "Oversized or natural fit based on original product",
      fabric_behavior: "Allow natural wrinkles and folds",
      retouching: "Minimal, realistic texture"
    },
    environment: {
      background: "Neutral carpet or fabric texture"
    },
    aesthetic: {
      grain: "Subtle film grain",
      polish: "Unpolished, authentic"
    },
    output: "Hero fashion image matching the reference style exactly"
  };

  // Add custom additions if provided
  if (style.customPromptAddition) {
    prompt.custom_additions = style.customPromptAddition;
  }

  return JSON.stringify(prompt, null, 2);
}

// ============================================================================
// CALLOUT PROMPTS - Your exact JSON prompts
// ============================================================================

/**
 * Fabric Detail Callout - texture and close-up
 */
export function buildCalloutDetailPrompt(): string {
  const prompt = {
    task: "Generate a fabric detail callout from the uploaded product",
    source: "Extract directly from the uploaded image",
    crop: "Close-up on fabric, seams, or sleeve area",
    lighting: "Direct flash to emphasize texture",
    camera: {
      lens: "50mm macro feel",
      focus: "Fabric fibers and softness"
    },
    style: "Raw e-commerce texture detail",
    output: "Zoomed-in callout matching the hero aesthetic"
  };

  return JSON.stringify(prompt, null, 2);
}

/**
 * Fit and Comfort Callout - mid-body focus
 */
export function buildCalloutMidBodyPrompt(): string {
  const prompt = {
    task: "Generate a fit and comfort callout",
    logic: {
      if_model_present: "Crop mid-body area showing fit",
      if_no_model: "Simulate natural drape and gravity"
    },
    focus: [
      "Oversized or relaxed fit",
      "Natural folds",
      "Comfort-driven silhouette"
    ],
    lighting: {
      type: "On-camera flash",
      shadow: "Visible natural shadows"
    },
    style: "Early 2000s lifestyle editorial",
    output: "Comfort-focused callout image"
  };

  return JSON.stringify(prompt, null, 2);
}

/**
 * Dynamic Lifestyle Callout - energy and movement
 */
export function buildCalloutDynamicPrompt(): string {
  const prompt = {
    task: "Create a lifestyle energy callout",
    logic: {
      if_model: "Capture relaxed movement or pose",
      if_no_model: "Create dynamic composition using rotation or folds"
    },
    lighting: "Direct flash, freeze-frame look",
    aesthetic: {
      vibe: "90s fashion campaign",
      feel: "Spontaneous and real"
    },
    output: "Dynamic callout consistent with the hero image"
  };

  return JSON.stringify(prompt, null, 2);
}

// ============================================================================
// PROMPTS export object (for API routes)
// ============================================================================

export const PROMPTS = {
  // Hero prompt - uses your exact JSON with conditional logic
  hero: (
    _productColor: string = 'the shown',
    _productType: string = 'hoodie',
    style?: ModelSceneStyle
  ) => {
    const defaultStyle: ModelSceneStyle = {
      modelGender: 'female',
      modelAge: 'young',
      modelEthnicity: 'any',
      pose: 'relaxed',
      setting: 'home',
      mood: 'cozy',
      lighting: 'natural',
      selectedHeroTemplate: null,
      customPromptAddition: '',
      copySpace: 'left',
    };

    return generateHeroPrompt(style || defaultStyle);
  },

  // Callout prompts - your exact JSON prompts
  calloutDetail: buildCalloutDetailPrompt,
  calloutFit: buildCalloutMidBodyPrompt,
  calloutPose: buildCalloutDynamicPrompt,
};

export type PromptType = keyof typeof PROMPTS;
