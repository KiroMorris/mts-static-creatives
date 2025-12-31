import type { CalloutPrompt } from '@/types';
import {
  buildCalloutDetailPrompt,
  buildCalloutMidBodyPrompt,
  buildCalloutDynamicPrompt,
  buildCalloutWaistHemPrompt,
  buildCalloutPocketPrompt,
  buildCalloutAlternatePosePrompt,
} from './prompts';

/**
 * Default built-in callout prompts for the Apparel Creative Generator.
 * These prompts are pre-configured and cannot be deleted by users.
 * Users can create additional custom prompts alongside these.
 */
export const DEFAULT_CALLOUT_PROMPTS: CalloutPrompt[] = [
  // Original 3 prompts (JSON format)
  {
    id: 'builtin-detail',
    name: 'Fabric Detail',
    promptText: buildCalloutDetailPrompt(),
    isBuiltIn: true,
  },
  {
    id: 'builtin-fit',
    name: 'Fit & Comfort',
    promptText: buildCalloutMidBodyPrompt(),
    isBuiltIn: true,
  },
  {
    id: 'builtin-pose',
    name: 'Dynamic Lifestyle',
    promptText: buildCalloutDynamicPrompt(),
    isBuiltIn: true,
  },
  // New 3 prompts based on reference image
  {
    id: 'builtin-waist-hem',
    name: 'Waist/Hem Crop',
    promptText: buildCalloutWaistHemPrompt(),
    isBuiltIn: true,
  },
  {
    id: 'builtin-pocket',
    name: 'Pocket Detail',
    promptText: buildCalloutPocketPrompt(),
    isBuiltIn: true,
  },
  {
    id: 'builtin-alternate-pose',
    name: 'Alternate Pose',
    promptText: buildCalloutAlternatePosePrompt(),
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
