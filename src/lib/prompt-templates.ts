// ============================================================================
// Fashion Photography Prompt Templates
// 90s/2000s Direct Flash Aesthetic - Raw, Unpolished, Authentic
// ============================================================================

// ============================================================================
// Type Definitions
// ============================================================================

export interface SubjectConfig {
  model: string;
  pose: string;
  expression: string;
}

export interface CameraConfig {
  lens: string;
  angle: string;
  distance: string;
  focus: string;
}

export interface LightingConfig {
  type: string;
  style: string;
  vibe: string;
}

export interface EnvironmentConfig {
  background: string;
  setting: string;
}

export interface StylingConfig {
  fit: string;
  details: string;
  retouching: string;
}

export interface AestheticConfig {
  look: string;
  grain: string;
  color_tone: string;
}

export interface HeroPromptTemplate {
  id: string;
  name: string;
  task: string;
  shot_type: string;
  orientation: string;
  subject: SubjectConfig;
  camera: CameraConfig;
  lighting: LightingConfig;
  environment: EnvironmentConfig;
  styling: StylingConfig;
  aesthetic: AestheticConfig;
  output: string;
}

export interface CalloutDetailCamera {
  lens: string;
  focus: string;
}

export interface CalloutDetailLighting {
  type: string;
  effect: string;
}

export interface CalloutDetailTemplate {
  id: string;
  name: string;
  task: string;
  shot_type: string;
  crop: string;
  focus: string;
  camera: CalloutDetailCamera;
  lighting: CalloutDetailLighting;
  style: string;
  retouching: string;
  output: string;
}

export interface CalloutMidBodyLighting {
  type: string;
  shadow: string;
}

export interface CalloutMidBodyTemplate {
  id: string;
  name: string;
  task: string;
  shot_type: string;
  crop: string;
  focus: string;
  composition: string;
  lighting: CalloutMidBodyLighting;
  details: string[];
  style: string;
  output: string;
}

export interface CalloutDynamicLighting {
  type: string;
  effect: string;
}

export interface CalloutDynamicAesthetic {
  vibe: string;
  feel: string;
}

export interface CalloutDynamicTemplate {
  id: string;
  name: string;
  task: string;
  shot_type: string;
  crop: string;
  focus: string;
  composition: string;
  lighting: CalloutDynamicLighting;
  aesthetic: CalloutDynamicAesthetic;
  output: string;
}

// ============================================================================
// HERO PROMPT TEMPLATES (5 Variations)
// 90s/2000s Flash Aesthetic - Different poses, angles, environments
// ============================================================================

export const HERO_TEMPLATES: HeroPromptTemplate[] = [
  // 1. Standing Against Wall
  {
    id: 'hero-wall-lean',
    name: 'Wall Lean',
    task: 'Create editorial fashion hero image',
    shot_type: 'Editorial lifestyle fashion photography',
    orientation: 'Vertical',
    subject: {
      model: 'Model wearing the garment',
      pose: 'Standing against a textured wall, one shoulder pressed back, hip slightly cocked, arms naturally at sides or one hand in pocket',
      expression: 'Direct gaze at camera, confident but relaxed, hint of attitude'
    },
    camera: {
      lens: '35mm',
      angle: 'Straight-on, slightly lower than eye level',
      distance: 'Full body with slight headroom',
      focus: 'Sharp focus on face and garment details'
    },
    lighting: {
      type: 'Direct on-camera flash',
      style: 'Harsh flash with visible hard shadows on wall',
      vibe: '90s / early 2000s raw fashion photography'
    },
    environment: {
      background: 'Textured concrete or painted wall, neutral tones',
      setting: 'Urban indoor or alleyway entrance'
    },
    styling: {
      fit: 'Natural garment drape',
      details: 'Authentic wrinkles, lived-in feel, no steaming',
      retouching: 'Minimal retouching, real skin texture preserved'
    },
    aesthetic: {
      look: 'Unpolished, authentic, vintage flash snapshot',
      grain: 'Subtle film grain',
      color_tone: 'Slightly desaturated, natural colors with warm flash tint'
    },
    output: 'High-end fashion campaign hero image with raw 90s editorial feel'
  },

  // 2. Seated on Floor
  {
    id: 'hero-floor-seated',
    name: 'Floor Seated',
    task: 'Create editorial fashion hero image',
    shot_type: 'Editorial lifestyle fashion photography',
    orientation: 'Vertical',
    subject: {
      model: 'Model wearing the garment',
      pose: 'Seated on floor, knees pulled up casually, back against wall or nothing, arms resting on knees, body slightly angled',
      expression: 'Contemplative, looking slightly off-camera, natural and unforced'
    },
    camera: {
      lens: '35mm',
      angle: 'Slight high angle looking down at seated subject',
      distance: 'Full body in frame with floor visible',
      focus: 'Sharp focus on face and upper body garment'
    },
    lighting: {
      type: 'Direct on-camera flash',
      style: 'Harsh flash creating strong shadows on floor and behind subject',
      vibe: '90s / early 2000s raw fashion photography'
    },
    environment: {
      background: 'Bare floor - wood, concrete, or carpet texture',
      setting: 'Indoor casual space, minimal context'
    },
    styling: {
      fit: 'Garment naturally bunched and draped from seated position',
      details: 'Natural compression folds, relaxed fabric behavior',
      retouching: 'Minimal retouching, authentic skin and fabric texture'
    },
    aesthetic: {
      look: 'Intimate, unguarded, raw editorial moment',
      grain: 'Subtle film grain',
      color_tone: 'Natural with slight warm cast from flash'
    },
    output: 'High-end fashion campaign hero image with intimate raw aesthetic'
  },

  // 3. Walking/Movement
  {
    id: 'hero-walking',
    name: 'Walking Motion',
    task: 'Create editorial fashion hero image',
    shot_type: 'Editorial lifestyle fashion photography',
    orientation: 'Vertical',
    subject: {
      model: 'Model wearing the garment',
      pose: 'Mid-stride walking towards camera, natural arm swing, one foot forward, body in motion but face towards camera',
      expression: 'Confident, purposeful, eyes meeting camera mid-movement'
    },
    camera: {
      lens: '35mm',
      angle: 'Straight-on at chest height',
      distance: 'Full body capturing movement, slight motion in extremities',
      focus: 'Sharp focus on face and torso, slight motion blur acceptable on limbs'
    },
    lighting: {
      type: 'Direct on-camera flash',
      style: 'Harsh flash freezing movement, strong flash shadow trailing behind',
      vibe: '90s / early 2000s raw fashion photography'
    },
    environment: {
      background: 'Neutral corridor, empty street, or simple backdrop',
      setting: 'Indoor or urban outdoor with minimal distraction'
    },
    styling: {
      fit: 'Garment showing natural movement and flow',
      details: 'Fabric in motion, natural swing and drape',
      retouching: 'Minimal retouching, movement authenticity preserved'
    },
    aesthetic: {
      look: 'Candid paparazzi energy, caught in motion',
      grain: 'Subtle film grain',
      color_tone: 'Slightly cool with harsh flash highlights'
    },
    output: 'High-end fashion campaign hero image with dynamic movement energy'
  },

  // 4. Leaning Pose
  {
    id: 'hero-leaning',
    name: 'Casual Lean',
    task: 'Create editorial fashion hero image',
    shot_type: 'Editorial lifestyle fashion photography',
    orientation: 'Vertical',
    subject: {
      model: 'Model wearing the garment',
      pose: 'Leaning against doorframe or pillar, weight on one leg, arms crossed loosely or one hand touching frame, body creating diagonal line',
      expression: 'Laid-back confidence, slight knowing look, relaxed brow'
    },
    camera: {
      lens: '35mm',
      angle: 'Three-quarter angle, capturing lean depth',
      distance: 'Three-quarter body shot from thigh up',
      focus: 'Sharp focus on face and garment front'
    },
    lighting: {
      type: 'Direct on-camera flash',
      style: 'Harsh flash with shadow cast on doorframe/structure',
      vibe: '90s / early 2000s raw fashion photography'
    },
    environment: {
      background: 'Architectural element - doorway, pillar, window frame',
      setting: 'Indoor transitional space'
    },
    styling: {
      fit: 'Garment showing silhouette against lean',
      details: 'Natural stretch and pull from pose, authentic fit',
      retouching: 'Minimal retouching, real texture throughout'
    },
    aesthetic: {
      look: 'Effortlessly cool, off-duty model vibe',
      grain: 'Subtle film grain',
      color_tone: 'Warm tones with flash pop'
    },
    output: 'High-end fashion campaign hero image with effortless cool aesthetic'
  },

  // 5. Mirror Selfie Style
  {
    id: 'hero-mirror',
    name: 'Mirror Reflection',
    task: 'Create editorial fashion hero image',
    shot_type: 'Editorial lifestyle fashion photography',
    orientation: 'Vertical',
    subject: {
      model: 'Model wearing the garment',
      pose: 'Standing in front of large mirror, phone/camera not visible, capturing reflection, natural standing pose with slight angle to mirror',
      expression: 'Self-aware but unselfconscious, natural mirror-check expression'
    },
    camera: {
      lens: '35mm',
      angle: 'Capturing reflection in mirror, straight-on to mirror surface',
      distance: 'Full body in mirror reflection',
      focus: 'Sharp focus on reflection, slight depth on actual subject'
    },
    lighting: {
      type: 'Direct on-camera flash',
      style: 'Flash visible in mirror creating flash-spot, harsh light on subject',
      vibe: '90s / early 2000s raw fashion photography'
    },
    environment: {
      background: 'Simple room reflected in mirror, minimal clutter',
      setting: 'Bedroom, bathroom, or fitting room mirror'
    },
    styling: {
      fit: 'Full garment visible in reflection',
      details: 'How the piece looks in mirror context, everyday reality',
      retouching: 'Minimal retouching, mirror edge and frame visible'
    },
    aesthetic: {
      look: 'Meta, self-referential, intimate dressing room moment',
      grain: 'Subtle film grain',
      color_tone: 'Mixed lighting with dominant flash, slightly flat'
    },
    output: 'High-end fashion campaign hero image with intimate mirror aesthetic'
  }
];

// ============================================================================
// CALLOUT DETAIL TEMPLATES (5 Variations)
// Focus on specific garment areas - Neckline, Sleeve, Hem, Back, Pocket
// ============================================================================

export const CALLOUT_DETAIL_TEMPLATES: CalloutDetailTemplate[] = [
  // 1. Neckline Detail
  {
    id: 'callout-detail-neckline',
    name: 'Neckline Detail',
    task: 'Create detail callout crop focusing on neckline',
    shot_type: 'Detail close-up',
    crop: 'Tight crop on neckline, collar area, and upper chest',
    focus: 'Neckline construction, collar shape, fabric at neck junction',
    camera: {
      lens: '50mm',
      focus: 'Tack sharp on neckline stitching and fabric edge'
    },
    lighting: {
      type: 'Direct flash',
      effect: 'Flash reveals texture of collar and neckband construction'
    },
    style: 'Raw e-commerce detail shot with editorial edge',
    retouching: 'None - authentic fabric texture',
    output: 'Neckline detail callout matching raw editorial aesthetic'
  },

  // 2. Sleeve Detail
  {
    id: 'callout-detail-sleeve',
    name: 'Sleeve Detail',
    task: 'Create detail callout crop focusing on sleeve',
    shot_type: 'Detail close-up',
    crop: 'Close crop of sleeve from shoulder to mid-forearm or cuff',
    focus: 'Sleeve construction, cuff detail, fabric drape along arm',
    camera: {
      lens: '50mm',
      focus: 'Sharp on cuff ribbing or hem and sleeve seam'
    },
    lighting: {
      type: 'Direct flash',
      effect: 'Flash highlights sleeve texture and seam details'
    },
    style: 'Raw e-commerce detail shot with editorial edge',
    retouching: 'None - authentic fabric and stitching visible',
    output: 'Sleeve detail callout matching raw editorial aesthetic'
  },

  // 3. Hem Detail
  {
    id: 'callout-detail-hem',
    name: 'Hem Detail',
    task: 'Create detail callout crop focusing on hem',
    shot_type: 'Detail close-up',
    crop: 'Tight crop on bottom hem and lower body of garment',
    focus: 'Hem construction, ribbing, how garment falls at waist/hip',
    camera: {
      lens: '50mm',
      focus: 'Sharp on hem edge and fabric weight'
    },
    lighting: {
      type: 'Direct flash',
      effect: 'Flash shows hem thickness and construction quality'
    },
    style: 'Raw e-commerce detail shot with editorial edge',
    retouching: 'None - natural hem behavior preserved',
    output: 'Hem detail callout matching raw editorial aesthetic'
  },

  // 4. Back Detail
  {
    id: 'callout-detail-back',
    name: 'Back Detail',
    task: 'Create detail callout crop focusing on back',
    shot_type: 'Detail close-up',
    crop: 'Close crop of upper back, shoulder blades area, back yoke',
    focus: 'Back panel construction, shoulder seams, back fit',
    camera: {
      lens: '50mm',
      focus: 'Sharp on back seam construction and fabric lay'
    },
    lighting: {
      type: 'Direct flash',
      effect: 'Flash reveals back texture and seam placement'
    },
    style: 'Raw e-commerce detail shot with editorial edge',
    retouching: 'None - authentic back construction visible',
    output: 'Back detail callout matching raw editorial aesthetic'
  },

  // 5. Pocket/Feature Detail
  {
    id: 'callout-detail-feature',
    name: 'Feature Detail',
    task: 'Create detail callout crop focusing on special feature or pocket',
    shot_type: 'Detail close-up',
    crop: 'Tight crop on pocket, kangaroo pouch, zipper, or key feature',
    focus: 'Pocket opening, feature construction, hardware if present',
    camera: {
      lens: '50mm',
      focus: 'Sharp on feature edge and functional detail'
    },
    lighting: {
      type: 'Direct flash',
      effect: 'Flash highlights feature depth and construction'
    },
    style: 'Raw e-commerce detail shot with editorial edge',
    retouching: 'None - authentic feature construction',
    output: 'Feature detail callout matching raw editorial aesthetic'
  }
];

// ============================================================================
// CALLOUT MID-BODY TEMPLATES (5 Variations)
// Different crops and focus areas for mid-body shots
// ============================================================================

export const CALLOUT_MIDBODY_TEMPLATES: CalloutMidBodyTemplate[] = [
  // 1. Torso Comfort Focus
  {
    id: 'callout-midbody-comfort',
    name: 'Comfort Fit',
    task: 'Create mid-body callout emphasizing comfort',
    shot_type: 'Mid-body lifestyle crop',
    crop: 'Chest to hip, arms partially visible',
    focus: 'Overall comfort and relaxed fit of the garment',
    composition: 'Casual, slightly asymmetric framing',
    lighting: {
      type: 'On-camera flash',
      shadow: 'Visible natural shadows adding dimension'
    },
    details: [
      'Relaxed fabric drape',
      'Soft material feel',
      'Natural body-conforming folds'
    ],
    style: 'Early 2000s fashion editorial',
    output: 'Comfort-focused mid-body callout matching raw aesthetic'
  },

  // 2. Waist/Hip Focus
  {
    id: 'callout-midbody-waist',
    name: 'Waist Crop',
    task: 'Create mid-body callout focusing on waist area',
    shot_type: 'Mid-body lifestyle crop',
    crop: 'Lower chest to upper thigh, waist centered',
    focus: 'Waist fit, how garment sits on hips, length proportion',
    composition: 'Centered on waistband area, hands potentially visible',
    lighting: {
      type: 'On-camera flash',
      shadow: 'Hard shadow defining waist silhouette'
    },
    details: [
      'Waistband or hem placement',
      'Hip drape',
      'Length proportion on body'
    ],
    style: 'Early 2000s fashion editorial',
    output: 'Waist-focused mid-body callout matching raw aesthetic'
  },

  // 3. Arms/Side View
  {
    id: 'callout-midbody-side',
    name: 'Side Profile',
    task: 'Create mid-body callout from side angle',
    shot_type: 'Mid-body lifestyle crop',
    crop: 'Side profile from shoulder to hip, three-quarter turn',
    focus: 'Side silhouette, arm fit, profile drape',
    composition: 'Angled framing showing garment depth',
    lighting: {
      type: 'On-camera flash',
      shadow: 'Side shadow showing garment dimension'
    },
    details: [
      'Side seam placement',
      'Arm hole fit',
      'Profile silhouette'
    ],
    style: 'Early 2000s fashion editorial',
    output: 'Side-profile mid-body callout matching raw aesthetic'
  },

  // 4. Stretch/Movement
  {
    id: 'callout-midbody-stretch',
    name: 'Stretch Movement',
    task: 'Create mid-body callout showing fabric stretch',
    shot_type: 'Mid-body lifestyle crop',
    crop: 'Upper body with arms in motion or reaching',
    focus: 'Fabric flexibility, comfort in movement, natural stretch',
    composition: 'Capturing moment of casual stretch or reach',
    lighting: {
      type: 'On-camera flash',
      shadow: 'Flash freezing slight movement'
    },
    details: [
      'Fabric stretch behavior',
      'Comfort in motion',
      'Unrestricted movement feel'
    ],
    style: 'Early 2000s fashion editorial',
    output: 'Movement-focused mid-body callout matching raw aesthetic'
  },

  // 5. Layering/Styling
  {
    id: 'callout-midbody-styled',
    name: 'Styled Crop',
    task: 'Create mid-body callout showing styling potential',
    shot_type: 'Mid-body lifestyle crop',
    crop: 'Torso focus with hands adjusting or interacting with garment',
    focus: 'How the piece is worn, personal styling touches',
    composition: 'Intimate moment of wearing, hands in frame',
    lighting: {
      type: 'On-camera flash',
      shadow: 'Natural harsh shadows from hand position'
    },
    details: [
      'Personal wearing style',
      'Hand interaction with fabric',
      'Everyday styling moment'
    ],
    style: 'Early 2000s fashion editorial',
    output: 'Styling-focused mid-body callout matching raw aesthetic'
  }
];

// ============================================================================
// CALLOUT DYNAMIC TEMPLATES (5 Variations)
// Different energy levels and dynamic compositions
// ============================================================================

export const CALLOUT_DYNAMIC_TEMPLATES: CalloutDynamicTemplate[] = [
  // 1. High Energy Movement
  {
    id: 'callout-dynamic-energy',
    name: 'High Energy',
    task: 'Create dynamic callout with high energy',
    shot_type: 'Dynamic lifestyle crop',
    crop: 'Full or three-quarter body with movement blur potential',
    focus: 'Energy, vitality, garment in active motion',
    composition: 'Off-center, dynamic diagonal composition',
    lighting: {
      type: 'Direct flash',
      effect: 'Freeze-frame capturing peak action moment'
    },
    aesthetic: {
      vibe: '90s campaign energy',
      feel: 'Electric, alive, caught mid-motion'
    },
    output: 'High-energy dynamic callout matching raw aesthetic'
  },

  // 2. Relaxed Casual
  {
    id: 'callout-dynamic-relaxed',
    name: 'Casual Ease',
    task: 'Create dynamic callout with relaxed energy',
    shot_type: 'Dynamic lifestyle crop',
    crop: 'Upper body or three-quarter, natural casual pose',
    focus: 'Effortless vibe, weekend ease, natural comfort',
    composition: 'Slightly off-center, intimate casual framing',
    lighting: {
      type: 'Direct flash',
      effect: 'Snapshot quality, caught in casual moment'
    },
    aesthetic: {
      vibe: '90s campaign intimacy',
      feel: 'Unguarded, real, between-moments'
    },
    output: 'Relaxed dynamic callout matching raw aesthetic'
  },

  // 3. Playful/Fun
  {
    id: 'callout-dynamic-playful',
    name: 'Playful Spirit',
    task: 'Create dynamic callout with playful energy',
    shot_type: 'Dynamic lifestyle crop',
    crop: 'Varied crop capturing playful gesture or expression',
    focus: 'Joy, playfulness, personality shining through',
    composition: 'Spontaneous framing, might be slightly tilted',
    lighting: {
      type: 'Direct flash',
      effect: 'Party snapshot energy, fun flash moment'
    },
    aesthetic: {
      vibe: '90s party photo',
      feel: 'Joyful, unscripted, personality-forward'
    },
    output: 'Playful dynamic callout matching raw aesthetic'
  },

  // 4. Moody/Editorial
  {
    id: 'callout-dynamic-moody',
    name: 'Moody Editorial',
    task: 'Create dynamic callout with moody editorial energy',
    shot_type: 'Dynamic lifestyle crop',
    crop: 'Tight crop with dramatic angle or shadow play',
    focus: 'Mood, atmosphere, editorial intensity',
    composition: 'Dramatic framing, intentional shadow use',
    lighting: {
      type: 'Direct flash',
      effect: 'Hard light creating dramatic contrast'
    },
    aesthetic: {
      vibe: '90s editorial moodiness',
      feel: 'Intense, atmospheric, editorial weight'
    },
    output: 'Moody dynamic callout matching raw aesthetic'
  },

  // 5. Spontaneous Candid
  {
    id: 'callout-dynamic-candid',
    name: 'Candid Moment',
    task: 'Create dynamic callout with candid spontaneous feel',
    shot_type: 'Dynamic lifestyle crop',
    crop: 'Natural crop as if caught unaware',
    focus: 'Authenticity, unposed reality, genuine moment',
    composition: 'Imperfect framing, real-life spontaneity',
    lighting: {
      type: 'Direct flash',
      effect: 'Paparazzi-style catch, raw flash moment'
    },
    aesthetic: {
      vibe: '90s candid street style',
      feel: 'Unstaged, real, documentary fashion'
    },
    output: 'Candid dynamic callout matching raw aesthetic'
  }
];

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get a random hero template
 */
export function getRandomHeroTemplate(): HeroPromptTemplate {
  const index = Math.floor(Math.random() * HERO_TEMPLATES.length);
  return HERO_TEMPLATES[index];
}

/**
 * Get a random detail callout template
 */
export function getRandomDetailTemplate(): CalloutDetailTemplate {
  const index = Math.floor(Math.random() * CALLOUT_DETAIL_TEMPLATES.length);
  return CALLOUT_DETAIL_TEMPLATES[index];
}

/**
 * Get a random mid-body callout template
 */
export function getRandomMidBodyTemplate(): CalloutMidBodyTemplate {
  const index = Math.floor(Math.random() * CALLOUT_MIDBODY_TEMPLATES.length);
  return CALLOUT_MIDBODY_TEMPLATES[index];
}

/**
 * Get a random dynamic callout template
 */
export function getRandomDynamicTemplate(): CalloutDynamicTemplate {
  const index = Math.floor(Math.random() * CALLOUT_DYNAMIC_TEMPLATES.length);
  return CALLOUT_DYNAMIC_TEMPLATES[index];
}

/**
 * Get template by ID
 */
export function getHeroTemplateById(id: string): HeroPromptTemplate | undefined {
  return HERO_TEMPLATES.find(t => t.id === id);
}

export function getDetailTemplateById(id: string): CalloutDetailTemplate | undefined {
  return CALLOUT_DETAIL_TEMPLATES.find(t => t.id === id);
}

export function getMidBodyTemplateById(id: string): CalloutMidBodyTemplate | undefined {
  return CALLOUT_MIDBODY_TEMPLATES.find(t => t.id === id);
}

export function getDynamicTemplateById(id: string): CalloutDynamicTemplate | undefined {
  return CALLOUT_DYNAMIC_TEMPLATES.find(t => t.id === id);
}

/**
 * Convert hero template to prompt string for AI generation
 */
export function heroTemplateToPrompt(template: HeroPromptTemplate): string {
  return JSON.stringify(template, null, 2);
}

/**
 * Convert detail template to prompt string for AI generation
 */
export function detailTemplateToPrompt(template: CalloutDetailTemplate): string {
  return JSON.stringify(template, null, 2);
}

/**
 * Convert mid-body template to prompt string for AI generation
 */
export function midBodyTemplateToPrompt(template: CalloutMidBodyTemplate): string {
  return JSON.stringify(template, null, 2);
}

/**
 * Convert dynamic template to prompt string for AI generation
 */
export function dynamicTemplateToPrompt(template: CalloutDynamicTemplate): string {
  return JSON.stringify(template, null, 2);
}

// ============================================================================
// Export All Templates
// ============================================================================

export const ALL_TEMPLATES = {
  hero: HERO_TEMPLATES,
  detail: CALLOUT_DETAIL_TEMPLATES,
  midBody: CALLOUT_MIDBODY_TEMPLATES,
  dynamic: CALLOUT_DYNAMIC_TEMPLATES
};

export default ALL_TEMPLATES;
