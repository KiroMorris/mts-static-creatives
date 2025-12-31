# Apparel Creative Generator - Callout Image Prompts

A collection of JSON prompt templates for generating authentic, raw callout crops for e-commerce apparel photography. These prompts maintain a consistent flash photography aesthetic inspired by early 2000s fashion editorials.

---

## Overview

Callout images are supporting crops that highlight specific details, fit characteristics, or lifestyle moments from a hero shot. They create visual variety while maintaining brand consistency across product pages and marketing materials.

**Core Aesthetic Principles:**
- Direct/on-camera flash lighting
- Raw, unretouched feel
- Authentic, slightly imperfect framing
- 90s/early 2000s editorial vibe
- Natural shadows and textures

---

## Category 1: Fabric/Texture Details

Close-up shots that showcase material quality, construction details, and tactile elements.

### 1.1 Fabric Weave Close-Up

```json
{
  "task": "Create a fabric texture callout crop",
  "shot_type": "Extreme detail close-up",
  "crop": "Tight frame on fabric surface, 2-3 inch area",
  "focus": "Individual thread weave and material texture",
  "camera": {
    "lens": "100mm macro",
    "focus": "Razor sharp on fabric fibers",
    "depth_of_field": "Shallow, fabric edges soft"
  },
  "lighting": {
    "type": "Direct flash with slight angle",
    "effect": "Reveals texture depth and fiber direction"
  },
  "style": "Technical product detail",
  "retouching": "None - show authentic material",
  "output": "Texture-focused callout showing fabric quality"
}
```

**When to use:** Product pages where material quality is a key selling point. Great for premium basics, technical fabrics, or natural fibers.

---

### 1.2 Stitching Detail

```json
{
  "task": "Create a construction detail callout",
  "shot_type": "Detail close-up",
  "crop": "Seam line with 1 inch margin on each side",
  "focus": "Stitch quality, thread color, seam flatness",
  "camera": {
    "lens": "85mm",
    "focus": "Sharp on stitch line",
    "angle": "Slightly angled to show dimension"
  },
  "lighting": {
    "type": "Direct flash",
    "effect": "Hard light reveals stitch depth and consistency"
  },
  "details": [
    "Clean stitch lines",
    "Thread tension visible",
    "Seam allowance quality"
  ],
  "style": "Quality control aesthetic",
  "retouching": "None",
  "output": "Construction-focused callout highlighting craftsmanship"
}
```

**When to use:** Emphasizing build quality, justifying premium pricing, or highlighting unique construction methods.

---

### 1.3 Label/Tag Shot

```json
{
  "task": "Create a brand label callout crop",
  "shot_type": "Detail close-up",
  "crop": "Neck label or woven tag centered in frame",
  "focus": "Brand identity and label quality",
  "camera": {
    "lens": "50mm",
    "focus": "Sharp on label text and logo",
    "framing": "Label fills 60% of frame"
  },
  "lighting": {
    "type": "On-camera flash",
    "effect": "Flat, documentary lighting"
  },
  "composition": "Straight-on, slightly casual alignment",
  "style": "Vintage catalog reference shot",
  "retouching": "None - authentic wear acceptable",
  "output": "Brand-focused callout for authenticity and identity"
}
```

**When to use:** Brand storytelling, authenticity verification, or highlighting care instructions.

---

### 1.4 Hem and Edge Detail

```json
{
  "task": "Create a hem detail callout crop",
  "shot_type": "Detail close-up",
  "crop": "Bottom hem or sleeve edge with body context",
  "focus": "Hem finish quality and weight",
  "camera": {
    "lens": "50mm",
    "focus": "Sharp on hem edge",
    "angle": "Slightly below eye level"
  },
  "lighting": {
    "type": "Direct flash",
    "effect": "Shows hem thickness and fold quality"
  },
  "details": [
    "Ribbed or raw edge finish",
    "Hem weight and drape",
    "Color consistency at edges"
  ],
  "style": "Raw e-commerce detail shot",
  "retouching": "None",
  "output": "Finish-quality callout showing attention to detail"
}
```

**When to use:** Highlighting premium finishing, ribbed cuffs, raw hems, or unique edge treatments.

---

## Category 2: Fit Shots

Mid-body and silhouette crops that communicate how the garment fits and moves on the body.

### 2.1 Shoulder Drop

```json
{
  "task": "Create a shoulder fit callout crop",
  "shot_type": "Upper body detail crop",
  "crop": "Shoulder to mid-chest, one shoulder emphasized",
  "focus": "Shoulder seam placement and drop",
  "camera": {
    "lens": "50mm",
    "focus": "Sharp on shoulder seam",
    "angle": "Slight three-quarter view"
  },
  "lighting": {
    "type": "On-camera flash",
    "shadow": "Natural shadow defines shoulder shape"
  },
  "composition": "Model relaxed, natural arm position",
  "details": [
    "Seam position relative to shoulder bone",
    "Fabric drape from shoulder",
    "Oversized vs fitted indication"
  ],
  "style": "Early 2000s fashion editorial",
  "output": "Fit-focused callout showing shoulder construction"
}
```

**When to use:** Oversized fits, drop shoulder designs, or when shoulder placement is a key design element.

---

### 2.2 Torso Silhouette

```json
{
  "task": "Create a silhouette fit callout crop",
  "shot_type": "Mid-body lifestyle crop",
  "crop": "Chest to hip, full torso width",
  "focus": "Overall body fit and drape",
  "composition": "Casual stance, arms slightly away from body",
  "camera": {
    "lens": "35mm",
    "focus": "Overall sharpness, slight background blur"
  },
  "lighting": {
    "type": "On-camera flash",
    "shadow": "Visible natural shadows define body shape"
  },
  "details": [
    "Boxy vs tapered silhouette",
    "Fabric weight indication",
    "Natural fold patterns"
  ],
  "style": "90s catalog aesthetic",
  "output": "Silhouette callout showing overall fit character"
}
```

**When to use:** Communicating fit style (relaxed, slim, oversized), showing how garment hangs naturally.

---

### 2.3 Sleeve Length and Fit

```json
{
  "task": "Create a sleeve fit callout crop",
  "shot_type": "Arm detail crop",
  "crop": "Shoulder to fingertips, full arm length",
  "focus": "Sleeve length, cuff position, arm room",
  "camera": {
    "lens": "50mm",
    "focus": "Sharp from shoulder to cuff",
    "angle": "Side view, arm naturally extended"
  },
  "lighting": {
    "type": "Direct flash",
    "effect": "Defines sleeve volume and shape"
  },
  "composition": "Arm relaxed at side or slightly bent",
  "details": [
    "Cuff position on wrist",
    "Sleeve width at bicep",
    "Overall sleeve proportion"
  ],
  "style": "Functional fit reference",
  "output": "Sleeve-focused callout for fit guidance"
}
```

**When to use:** Long sleeve items, showing cuff details, or when sleeve fit is a distinguishing feature.

---

## Category 3: Lifestyle/Movement

Dynamic and candid crops that show the garment in natural, lived-in contexts.

### 3.1 Walking Motion

```json
{
  "task": "Create a movement callout crop",
  "shot_type": "Dynamic lifestyle crop",
  "crop": "Mid-thigh to chest, capturing stride",
  "focus": "Natural garment movement and flow",
  "composition": "Model mid-step, slight motion blur acceptable",
  "camera": {
    "lens": "35mm",
    "focus": "Sharp on torso, slight motion in limbs",
    "shutter": "1/125 for subtle motion"
  },
  "lighting": {
    "type": "Direct flash",
    "effect": "Freeze-frame editorial look with movement"
  },
  "aesthetic": {
    "vibe": "Paparazzi candid",
    "feel": "Caught in motion, unstaged"
  },
  "style": "Street style photography",
  "output": "Movement callout showing garment in action"
}
```

**When to use:** Activewear, casual pieces, showing fabric flexibility and real-world wearability.

---

### 3.2 Reaching/Arm Raised

```json
{
  "task": "Create an arm movement callout crop",
  "shot_type": "Dynamic lifestyle crop",
  "crop": "Waist up, arm reaching or raised",
  "focus": "Garment behavior during movement",
  "composition": "Natural reach, not posed",
  "camera": {
    "lens": "50mm",
    "focus": "Sharp on torso and raised arm"
  },
  "lighting": {
    "type": "On-camera flash",
    "effect": "Captures underarm and side panel"
  },
  "details": [
    "Hem rise during movement",
    "Armhole comfort",
    "Side seam behavior"
  ],
  "aesthetic": {
    "vibe": "90s campaign outtake",
    "feel": "Spontaneous, real moment"
  },
  "output": "Mobility callout showing garment freedom"
}
```

**When to use:** Demonstrating mobility, showing garment doesn't ride up, or highlighting stretch properties.

---

### 3.3 Casual Lean/Relaxed Pose

```json
{
  "task": "Create a relaxed pose callout crop",
  "shot_type": "Lifestyle crop",
  "crop": "Three-quarter body, natural lean",
  "focus": "Relaxed drape and everyday comfort",
  "composition": "Model leaning, weight shifted, casual body language",
  "camera": {
    "lens": "35mm",
    "focus": "Overall sharpness",
    "angle": "Slight low angle for editorial feel"
  },
  "lighting": {
    "type": "Direct flash",
    "shadow": "Strong shadows from lean angle"
  },
  "aesthetic": {
    "vibe": "Between-shots moment",
    "feel": "Effortless, unforced cool"
  },
  "style": "90s fashion magazine candid",
  "output": "Lifestyle callout showing relaxed wearability"
}
```

**When to use:** Loungewear, casual basics, or conveying effortless style and comfort.

---

## Category 4: Feature Highlights

Focused shots that draw attention to specific garment features and functional details.

### 4.1 Pocket Detail

```json
{
  "task": "Create a pocket feature callout crop",
  "shot_type": "Feature detail crop",
  "crop": "Pocket and surrounding area, hand interaction",
  "focus": "Pocket size, placement, and functionality",
  "camera": {
    "lens": "50mm",
    "focus": "Sharp on pocket opening and hand",
    "angle": "Natural viewing angle"
  },
  "lighting": {
    "type": "On-camera flash",
    "effect": "Defines pocket depth and shape"
  },
  "composition": "Hand in pocket or touching pocket edge",
  "details": [
    "Pocket depth indication",
    "Opening size",
    "Stitching and reinforcement"
  ],
  "style": "Functional product photography",
  "output": "Feature callout highlighting pocket utility"
}
```

**When to use:** Kangaroo pockets, side pockets, hidden pockets, or any pocket that's a selling point.

---

### 4.2 Hood and Drawstring

```json
{
  "task": "Create a hood feature callout crop",
  "shot_type": "Feature detail crop",
  "crop": "Head and shoulders, hood up or down",
  "focus": "Hood shape, volume, and drawstring detail",
  "camera": {
    "lens": "50mm",
    "focus": "Sharp on hood and drawstring ends",
    "angle": "Slightly above eye level"
  },
  "lighting": {
    "type": "Direct flash",
    "effect": "Shows hood interior and depth"
  },
  "details": [
    "Hood coverage and shape",
    "Drawstring quality and tips",
    "Lining visibility if present"
  ],
  "composition": "Model looking slightly down or to side",
  "style": "Raw e-commerce feature shot",
  "output": "Hood-focused callout showing design and function"
}
```

**When to use:** Hoodies, hooded jackets, or any piece where the hood design is distinctive.

---

### 4.3 Zipper/Closure Detail

```json
{
  "task": "Create a closure detail callout crop",
  "shot_type": "Feature close-up",
  "crop": "Zipper track or button area, hardware centered",
  "focus": "Closure quality and operation",
  "camera": {
    "lens": "85mm",
    "focus": "Razor sharp on hardware",
    "depth_of_field": "Shallow, fabric soft"
  },
  "lighting": {
    "type": "Direct flash with angle",
    "effect": "Highlights metal/hardware shine"
  },
  "details": [
    "Zipper teeth quality",
    "Pull tab design",
    "Tape color and finish"
  ],
  "style": "Hardware catalog reference",
  "retouching": "None - show authentic hardware",
  "output": "Hardware callout emphasizing quality components"
}
```

**When to use:** Premium zippers, custom pulls, snap buttons, or branded hardware.

---

### 4.4 Cuff and Ribbing

```json
{
  "task": "Create a cuff detail callout crop",
  "shot_type": "Feature detail crop",
  "crop": "Wrist area, cuff and lower sleeve",
  "focus": "Ribbing quality, cuff fit, and stretch",
  "camera": {
    "lens": "50mm",
    "focus": "Sharp on ribbing texture",
    "angle": "Wrist level, straight on"
  },
  "lighting": {
    "type": "On-camera flash",
    "effect": "Reveals rib depth and texture"
  },
  "composition": "Natural wrist position, slight bend",
  "details": [
    "Rib width and density",
    "Cuff height",
    "Color match to body"
  ],
  "style": "Technical detail shot",
  "output": "Cuff-focused callout showing finish quality"
}
```

**When to use:** Sweatshirts, hoodies, bomber jackets, or any piece with distinctive cuff treatment.

---

## Usage Guidelines

### Selecting Callouts by Product Type

| Product Type | Recommended Callouts |
|-------------|---------------------|
| Basic Tees | Fabric Weave, Hem Detail, Torso Silhouette |
| Hoodies | Hood Detail, Pocket Detail, Shoulder Drop, Cuff Ribbing |
| Jackets | Zipper Detail, Sleeve Fit, Walking Motion |
| Pants | Pocket Detail, Hem Detail, Walking Motion |
| Premium Items | Stitching Detail, Label Shot, All texture shots |

### Best Practices

1. **Maintain Consistency** - Use the same lighting setup across all callouts in a set
2. **Match the Hero** - Callouts should feel like natural crops from the same session
3. **Show Reality** - Avoid over-retouching; authenticity sells
4. **Consider Context** - E-commerce callouts differ from social media crops
5. **Balance Detail and Context** - Include enough garment to orient the viewer

### Output Specifications

- **Resolution:** Minimum 2000px on longest edge
- **Format:** PNG for transparency needs, JPEG for standard use
- **Aspect Ratios:** 1:1 for thumbnails, 4:5 for product pages, 16:9 for banners
- **Color Space:** sRGB for web, Adobe RGB for print

---

## Version History

- **v1.0** - Initial prompt collection with 12 callout variations across 4 categories
