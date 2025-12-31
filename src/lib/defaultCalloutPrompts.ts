import type { CalloutPrompt } from '@/types';

/**
 * Default built-in callout prompts for the Apparel Creative Generator.
 * These prompts are pre-configured and cannot be deleted by users.
 * Users can create additional custom prompts alongside these.
 */
export const DEFAULT_CALLOUT_PROMPTS: CalloutPrompt[] = [
  {
    id: 'builtin-detail',
    name: 'Detail Shot',
    promptText: `Close-up fashion photography shot focusing on the fabric texture and quality.
Show: Soft cotton/fleece texture, quality stitching details, fabric drape
Framing: SQUARE 1:1 aspect ratio, tight crop on shoulder/chest area
Lighting: Soft diffused lighting
IMPORTANT: Output must be SQUARE (1:1 ratio). Focus on texture and material quality.`,
    isBuiltIn: true,
  },
  {
    id: 'builtin-fit',
    name: 'Fit Shot',
    promptText: `Fashion photography showing the fit of the garment on the same model.
Show: Cropped view of torso/waist area showing how the garment fits
Framing: SQUARE 1:1 aspect ratio, mid-body crop, casual relaxed pose
Lighting: Natural lighting
IMPORTANT: Output must be SQUARE (1:1 ratio). Emphasize the comfortable, flattering fit.`,
    isBuiltIn: true,
  },
  {
    id: 'builtin-pose',
    name: 'Pose Shot',
    promptText: `Alternative lifestyle shot of the same model wearing the garment.
Pose: Natural relaxed pose, different angle from hero
Expression: Natural expression
Framing: SQUARE 1:1 aspect ratio, head and upper body visible
IMPORTANT: Output must be SQUARE (1:1 ratio). Show versatility and lifestyle context.`,
    isBuiltIn: true,
  },
  {
    id: 'builtin-back',
    name: 'Back View',
    promptText: `Fashion photography showing the back of the garment.
Show: Back view of the model wearing the garment, showing back design and fit
Framing: SQUARE 1:1 aspect ratio, upper body from behind
IMPORTANT: Output must be SQUARE (1:1 ratio). Show the back design clearly.`,
    isBuiltIn: true,
  },
  {
    id: 'builtin-lifestyle',
    name: 'Lifestyle Action',
    promptText: `Dynamic lifestyle shot of the model in motion or activity.
Show: Model in natural activity (walking, stretching, casual movement)
Framing: SQUARE 1:1 aspect ratio, action-oriented composition
IMPORTANT: Output must be SQUARE (1:1 ratio). Show the garment in real-life context.`,
    isBuiltIn: true,
  },
];

/**
 * Default selection for the 3 callout slots.
 * Uses the first 3 built-in prompts (Detail, Fit, Pose).
 */
export const DEFAULT_SELECTED_CALLOUTS: [string, string, string] = [
  'builtin-detail',
  'builtin-fit',
  'builtin-pose',
];

/**
 * Generate a unique ID for custom callout prompts.
 */
export function generateCalloutPromptId(): string {
  return `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
