// AI prompt templates for Gemini Nano Banana Pro

export const PROMPTS = {
  hero: (productColor: string = 'the shown', productType: string = 'hoodie') => `
Generate a professional fashion photography image of a young attractive female model wearing this ${productColor} ${productType}.

Style: Editorial fashion photography, high-end campaign quality
Pose: Relaxed lifestyle pose with one arm raised above head, lying down looking up at camera
Setting: Neutral indoor setting with soft natural lighting, cozy atmosphere
Framing: Portrait orientation (9:16 aspect ratio), model from waist up, face clearly visible
Expression: Natural, relaxed, slight smile, looking at camera
Quality: Sharp focus, professional lighting, fashion magazine quality

IMPORTANT: Maintain exact color and design details of the garment. The hoodie should be the focal point.
`.trim(),

  calloutDetail: (productColor: string = 'the shown', productType: string = 'hoodie') => `
Close-up fashion photography shot focusing on the fabric texture and quality of a ${productColor} ${productType}.

Show: Soft cotton/fleece texture, quality stitching details, fabric drape
Framing: SQUARE 1:1 aspect ratio, tight crop on shoulder/chest area of the garment
Lighting: Soft diffused light to emphasize fabric texture
Style: Same model and aesthetic from previous hero image
Subject Consistency: Use the exact same model from the hero shot

IMPORTANT: Output must be SQUARE (1:1 ratio). Focus on texture and material quality. Professional product detail shot.
`.trim(),

  calloutFit: (productColor: string = 'the shown', productType: string = 'hoodie') => `
Fashion photography showing the fit of a ${productColor} ${productType} on the same model.

Show: Cropped view of torso/waist area showing how the garment fits
Framing: SQUARE 1:1 aspect ratio, mid-body crop, casual relaxed pose
Include: Small glimpse of skin at waistline showing the crop/fit
Style: Relaxed, authentic lifestyle feel
Subject Consistency: Use the exact same model from the hero shot

IMPORTANT: Output must be SQUARE (1:1 ratio). Emphasize the comfortable, flattering fit of the garment.
`.trim(),

  calloutPose: (productColor: string = 'the shown', productType: string = 'hoodie') => `
Alternative lifestyle shot of the same model wearing the ${productColor} ${productType}.

Pose: Different angle - lying down, relaxed, eyes closed or looking away
Expression: Content, peaceful, comfortable
Framing: SQUARE 1:1 aspect ratio, head and upper body visible, different composition than hero
Style: Intimate, authentic lifestyle photography
Subject Consistency: Use the exact same model from the hero shot

IMPORTANT: Output must be SQUARE (1:1 ratio). Show versatility and lifestyle context of the garment.
`.trim(),

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
