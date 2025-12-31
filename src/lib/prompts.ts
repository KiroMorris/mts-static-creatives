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
// CALLOUT PROMPTS - Original 3 prompts
// ============================================================================

/**
 * Original Callout 1: Fabric Detail - texture and close-up
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
 * Original Callout 2: Fit and Comfort - mid-body focus
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
 * Original Callout 3: Dynamic Lifestyle - energy and movement
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
// NEW CALLOUT PROMPTS - Based on reference image layout
// ============================================================================

/**
 * New Callout 4: Waist/Hem Crop - showing skin peek and fabric edge
 */
export function buildCalloutWaistHemPrompt(): string {
  const prompt = {
    task: "Create a waist/hem detail callout from the hero image",
    source: "Crop from the generated hero image",
    crop: {
      area: "Lower torso - waist to hip area",
      focus: "Where garment hem meets skin",
      show: "Slight skin peek, fabric edge, relaxed fit on body"
    },
    composition: {
      framing: "Tight crop on waistband/hem area",
      include: ["Bottom edge of garment", "Hint of skin underneath", "Natural fabric drape"]
    },
    lighting: "Same direct flash as hero, consistent look",
    style: "90s editorial detail crop",
    output: "Waist/hem callout showing fit and fabric edge, matching hero aesthetic"
  };

  return JSON.stringify(prompt, null, 2);
}

/**
 * New Callout 5: Pocket/Feature Detail - kangaroo pocket or key feature
 */
export function buildCalloutPocketPrompt(): string {
  const prompt = {
    task: "Create a pocket/feature detail callout from the hero image",
    source: "Crop from the generated hero image",
    crop: {
      area: "Mid-torso focusing on pocket or key garment feature",
      focus: "Kangaroo pocket, hand placement, or central feature",
      show: "Pocket opening, fabric texture, hands resting or near pocket"
    },
    composition: {
      framing: "Centered on pocket or main garment feature",
      include: ["Pocket detail", "Fabric texture", "Natural hand position if visible"]
    },
    lighting: {
      type: "On-camera flash",
      effect: "Highlights pocket depth and fabric texture"
    },
    style: "Early 2000s fashion editorial detail",
    output: "Pocket/feature callout showing garment functionality, matching hero aesthetic"
  };

  return JSON.stringify(prompt, null, 2);
}

/**
 * New Callout 6: Alternate Pose/Angle - relaxed variation of full look
 */
export function buildCalloutAlternatePosePrompt(): string {
  const prompt = {
    task: "Create an alternate pose callout showing the full garment",
    source: "Generate variation based on hero image",
    subject: {
      model: "Same model from hero image",
      pose: "Different relaxed angle - lying down, shifted position, or alternate view",
      garment: "Same garment, full or 3/4 view visible"
    },
    composition: {
      framing: "Smaller full-body or 3/4 crop",
      angle: "Different perspective than hero - could be more overhead or shifted",
      vibe: "Candid, relaxed, lifestyle moment"
    },
    lighting: "Direct flash, freeze-frame look, consistent with hero",
    aesthetic: {
      style: "90s fashion campaign outtake",
      feel: "Spontaneous alternate shot, same session"
    },
    output: "Alternate pose callout showing garment from different angle, matching hero aesthetic"
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
