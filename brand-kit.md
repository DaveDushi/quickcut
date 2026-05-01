# Wellrox Creator Hub — Brand Design Kit

> Extracted from the live Creator Hub landing page. This document is the single source of truth for visual identity, design tokens, component patterns, and brand voice.

---

## 1. Brand Overview

| Attribute | Value |
|-----------|-------|
| **Brand Name** | Wellrox |
| **Tagline** | Move Well. Live Well. |
| **Pillar Words** | Balance. Strength. Movement. |
| **Positioning** | Toe to Head Wellness — wellness-focused, comfort, medically approved (APMA seal), trusted by professionals |
| **Visual Motif** | Stacked rocks — symbolizes balance, stability, and grounding (used in hero SVG and favicon) |

---

## 2. Logo & Assets

### Logo

- **Files:** `"C:\Users\david\Next Step Group Inc\Wellrox Wellness - Documents\Brand Assets\Logos"`
- **Navbar size:** 44px (mobile) → 52px (tablet+)
- **Footer size:** 48px height
- **Dark background treatment:** `filter: brightness(0) invert(1)` to render white

### Favicon

- **File:** `/Gray rocks.png`
- **Motif:** Stacked rocks icon

### Hero Motif (Decorative SVG)

- Stacked rocks illustration, positioned absolute in hero section
- Opacity: `0.06` (mobile) → `0.08` (desktop)
- Uses `currentColor` with `var(--taupe)` fill

---

## 3. Color Palette

### Primary (Dusty Rose / Mauve)

| Token | Hex | Usage |
|-------|-----|-------|
| `--primary` | `#b4918f` | CTA buttons, accents, active states, icons |
| `--primary-dark` | `#9a7573` | Button hover, emphasis |
| `--primary-light` | `#c9aead` | Borders, step indicators, focus outlines |

### Neutrals

| Token | Hex | Usage |
|-------|-----|-------|
| `--foreground` | `#1a1a1a` | Headings, primary text |
| `--muted` | `#6b6560` | Secondary text, descriptions |
| `--border` | `#e0dada` | Dividers, card borders |
| `--white` | `#ffffff` | Page background, button text |

### Cream / Blush Backgrounds

| Token | Hex | Usage |
|-------|-----|-------|
| `--cream` / `--blush` | `#f7f3ef` | Section backgrounds, warm tint |
| `--cream-dark` / `--blush-dark` | `#ede7e0` | Deeper section backgrounds |
| `--cream-subtle` / `--blush-subtle` | `#faf8f5` | Very subtle warm tint |

### Accent

| Token | Hex | Usage |
|-------|-----|-------|
| `--taupe` | `#c4b8b0` | Decorative elements, radial glow |

### Semantic

| Token | Hex | Usage |
|-------|-----|-------|
| `--success` | `#38a169` | Success states, confirmations |
| `--destructive` | `#e53e3e` | Errors, validation failures |

### Dark Mode (Footer)

| Token | Hex | Usage |
|-------|-----|-------|
| `--bg-dark` | `#1a1a1a` | Footer background |
| Text on dark | `rgba(255,255,255,0.85)` | Body text on dark bg |
| Muted on dark | `rgba(255,255,255,0.6)` | Secondary text on dark bg |

### Opacity Patterns

| Value | Usage |
|-------|-------|
| `rgba(180,145,143, 0.12)` | Badge backgrounds |
| `rgba(180,145,143, 0.18)` | Badge borders |
| `rgba(180,145,143, 0.10)` | Icon backgrounds |
| `rgba(180,145,143, 0.08)` | Checkbox checked state |
| `rgba(180,145,143, 0.04)` | Checkbox hover state |
| `rgba(180,145,143, 0.25)` | CTA button shadow |
| `rgba(180,145,143, 0.40)` | CTA button hover shadow |

---

## 4. Typography

### Font Stack

| Role | Family | Source |
|------|--------|--------|
| **Display / Headings** | `'Cormorant Garamond', serif` | Google Fonts — elegant serif for headlines, stats, form headings |
| **Body / UI** | `'DM Sans', sans-serif` | Google Fonts — clean sans-serif for all body text |
| **Admin UI** | `'Plus Jakarta Sans', sans-serif` | Google Fonts — bold sans for dashboard context |

### Type Scale

#### Display

| Element | Size (mobile → desktop) | Weight | Line Height | Letter Spacing |
|---------|--------------------------|--------|-------------|----------------|
| Hero title | 44px → 64px → 72px | 700 | 1.08 | -0.025em |
| Section title | 32px → 40px → 44px | 700 | 1.2 | -0.01em |
| Form section title | 26px → 34px | 700 | — | — |
| Stat number | 36px → 44px | 700 | 1.2 | — |

#### Body

| Element | Size | Weight | Line Height |
|---------|------|--------|-------------|
| Hero subtitle | 17px → 20px | 300 | 1.7 |
| Section subtitle | 17px | 300 | 1.7 |
| Card title | 20px | 600 | — |
| Card description | 15px | 400 | 1.6 |
| Form body | 15px | 400 | 1.6 |

#### UI / Small

| Element | Size | Weight | Letter Spacing | Transform |
|---------|------|--------|----------------|-----------|
| Section label | 13px | 600 | 0.15em | uppercase |
| Badge text | 13px | 600 | 0.08em | uppercase |
| Navbar link | 14px | 500 | — | — |
| CTA button | 17px | 600 | — | — |
| Trust badge | 13px | 500 | — | — |
| Stat label | 14px | 500 | — | — |
| Footer tagline | 14px italic | — | — | — |
| Footer pillars | 10px | 500 | 0.18em | uppercase |
| Scroll hint | 11px | 500 | 0.1em | uppercase |

---

## 5. Spacing & Layout

### Section Padding

| Breakpoint | Padding |
|------------|---------|
| Mobile | `80px 24px` |
| Tablet (768px+) | `112px 48px` |
| Desktop (1024px+) | `120px 64px` |

### Max Widths

| Token | Value | Usage |
|-------|-------|-------|
| `--max-w-form` | `520px` | Form container |
| `--max-w-content` | `720px` | Hero / centered content |
| `--max-w-section` | `1080px` | Main content sections |

### Fixed Heights

| Token | Value |
|-------|-------|
| `--nav-height` | `76px` |

### Grid Patterns

| Component | Mobile | Tablet (640px+) | Desktop (1024px+) |
|-----------|--------|-----------------|-------------------|
| Steps | `1fr` | `repeat(3, 1fr)` | `repeat(3, 1fr)` |
| Benefits | `1fr` | `repeat(2, 1fr)` | `repeat(3, 1fr)` |
| Stats | `1fr` | `repeat(3, 1fr)` | `repeat(3, 1fr)` |
| Checkboxes | `1fr` | `1fr 1fr` | `1fr 1fr` |

### Common Gaps

| Value | Usage |
|-------|-------|
| `8px` | Tight inline spacing |
| `16px` | Form field gaps |
| `24px` | Card grid gaps, footer link gaps |
| `32px` | Navbar link gaps, stat gaps |
| `40px` | Step grid gap (tablet) |
| `48px` | Step grid gap (mobile) |
| `56px` | Section header bottom margin (mobile) |
| `72px` | Section header bottom margin (tablet) |

---

## 6. Components

### Buttons

**Primary CTA (Hero)**
```
padding: 18px 48px
border-radius: 9999px (pill)
font: 17px / 600 weight
background: var(--primary)
color: white
shadow: 0 4px 24px rgba(180,145,143,0.25)
hover: background var(--primary-dark), translateY(-2px), shadow 0 8px 40px rgba(180,145,143,0.4)
active: translateY(0)
transition: background 0.2s, transform 0.15s, box-shadow 0.2s
```

**Navbar CTA**
```
padding: 10px 28px
border-radius: 9999px
font: 14px / 600 weight
hover: translateY(-1px)
```

**Form Submit**
```
width: 100%
padding: 14px 24px
border-radius: 9999px
disabled: opacity 0.5
```

### Cards

**Benefit Card**
```
padding: 36px 28px
border-radius: 20px
border: 1.5px solid rgba(224,218,218,0.5)
background: white
hover: translateY(-4px), shadow 0 12px 40px -8px rgba(180,145,143,0.2)
transition: transform 0.25s, box-shadow 0.25s
```

**Icon Container (inside card)**
```
width: 56px, height: 56px
border-radius: 14px
background: rgba(180,145,143,0.1)
color: var(--primary)
icon-size: 28px
```

**Form Card**
```
border-radius: 20px
shadow: 0 2px 40px -12px rgba(180,145,143,0.15)
```

### Badges

**Hero Badge**
```
padding: 10px 22px
border-radius: 9999px
background: rgba(180,145,143,0.12)
border: 1.5px solid rgba(180,145,143,0.18)
font: 13px / 600, uppercase, 0.08em letter-spacing
color: var(--primary-dark)
```

### Form Inputs

```
padding: 12px 16px
border-radius: 12px
border: 1.5px solid var(--border)
font: 15px DM Sans
placeholder: #a0a0a0, weight 300
focus: border var(--primary), shadow 0 0 0 4px rgba(180,145,143,0.1)
error: border var(--destructive), shadow 0 0 0 4px rgba(229,62,62,0.08)
transition: border-color 0.2s, box-shadow 0.2s
```

### Checkboxes (Custom)

```
layout: grid 1fr 1fr (2 columns)
label padding: 10px 14px
border-radius: 10px
border: 1.5px solid var(--border)
hover: border var(--primary-light), background rgba(180,145,143,0.04)
checked: border var(--primary), background rgba(180,145,143,0.08)
```

### Navbar

```
position: fixed
height: var(--nav-height) = 76px
default: transparent background
scrolled (>80px): background rgba(255,255,255,0.95), backdrop-filter blur(16px), shadow 0 1px 12px rgba(180,145,143,0.08)
transition: background 0.4s ease, border-color 0.4s ease, backdrop-filter 0.4s ease
```

### Footer

```
background: var(--bg-dark) = #1a1a1a
text: rgba(255,255,255,0.85)
logo: brightness(0) invert(1) filter
social icon gap: 20px
link gap: 24px
```

### Step Indicators

```
circle: 64px diameter
border: 2px solid var(--primary-light)
number font: 24px / 700, Cormorant Garamond
hover: background fills var(--primary), text goes white
transition: background 0.3s, color 0.3s, border-color 0.3s
```

---

## 7. Visual Effects

### Shadows

| Context | Value |
|---------|-------|
| CTA default | `0 4px 24px rgba(180,145,143,0.25)` |
| CTA hover | `0 8px 40px rgba(180,145,143,0.4)` |
| Navbar scrolled | `0 1px 12px rgba(180,145,143,0.08)` |
| Benefit card hover | `0 12px 40px -8px rgba(180,145,143,0.2)` |
| Form card | `0 2px 40px -12px rgba(180,145,143,0.15)` |
| Button hover | `0 4px 16px rgba(180,145,143,0.3)` |

### Gradients

**Hero Background (layered):**
1. Top layer: `linear-gradient(180deg, #ffffff 0%, #faf8f5 100%)`
2. Bottom angled: `linear-gradient(168deg, transparent 0%, #f7f3ef 30%, #ede7e0 100%)` with `clip-path: polygon(0 25%, 100% 0%, 100% 100%, 0% 100%)`
3. Radial glow: `radial-gradient(circle, rgba(196,184,176,0.15) 0%, transparent 65%)` — positioned top-right

### Animations

| Name | Effect | Duration | Easing |
|------|--------|----------|--------|
| `fadeUp` | `opacity 0→1, translateY(20px→0)` | 0.6s | ease-out |
| `scrollPulse` | `opacity 0.2↔0.5, scaleY(0.6↔1)` | 2s | ease-in-out infinite |
| `scaleIn` | `scale(0→1), opacity 0→1` | 0.4s | ease-out |
| `drawCheck` | `stroke-dashoffset 30→0` | 0.4s + 0.3s delay | ease-out |
| `stepIn` | `opacity 0→1, translateX(-12px→0)` | 0.25s | ease-out |
| `spin` | `rotate(0→360deg)` | 0.6s | linear infinite |

**Stagger pattern (hero):** Elements fade in with delays: 0s, 0.1s, 0.2s, 0.3s, 0.35s, 0.4s, 0.5s, 0.6s

### Transitions

| Component | Properties | Duration |
|-----------|-----------|----------|
| Buttons | `background, transform, box-shadow` | 0.2s, 0.15s, 0.2s |
| Navbar | `background, border-color, backdrop-filter` | 0.4s ease |
| Benefit cards | `transform, box-shadow` | 0.25s |
| Form inputs | `border-color, box-shadow` | 0.2s |
| Reveal elements | `opacity, transform` | 0.6s ease-out |
| Step numbers | `background, color, border-color` | 0.3s |

### Backdrop Blur

| Context | Value |
|---------|-------|
| Navbar (scrolled) | `blur(16px)` |
| Hero trust items | `blur(4px)` |

---

## 8. Brand Voice & Messaging

### Tone

| Attribute | Description |
|-----------|-------------|
| **Warmth** | Welcoming and community-oriented — "Creator Family", not "Creator Network" |
| **Honesty** | Straightforward about the value exchange — free products in return for content |
| **Aspiration** | Wellness-forward language — "vitality", "movement", "intentional living" |
| **Simplicity** | Short, direct CTAs — "Apply Now", "Continue", not flowery |
| **Supportiveness** | Partnership framing — "We invest in your growth", not transactional |

### Key Brand Phrases

| Phrase | Context |
|--------|---------|
| "Join the Wellrox Creator Family" | Hero headline — belonging |
| "Move Well. Live Well." | Core tagline — wellness mantra |
| "Balance. Strength. Movement." | Footer pillars — brand values |
| "More than free products — we invest in your growth" | Benefits section — partnership |
| "authentic content" | What creators produce — genuineness |
| "curated wellness products" | What Wellrox provides — quality |

### CTA Patterns

- **Action-first:** "Apply Now", "Submit Application", "Continue"
- **Low friction:** "Quick 2-minute application"
- **Social proof:** "100+ Creators", "Free Shipping", "Premium Wellness Products"
- **No false promises:** Avoid "no strings attached" or "zero commitments" — the program requires content creation

### Copy Principles

1. **Be honest about expectations.** Creators get free products; in exchange they create content. Never imply otherwise.
2. **Lead with community.** Frame the program as joining a family, not receiving a transaction.
3. **Keep it practical.** The audience (TikTok Shop creators) already has context — don't oversell.
4. **Use wellness vocabulary.** Words like vitality, movement, intentional, practice, balance.
5. **Specificity earns trust.** Concrete details ("2-minute application", "100+ Creators") over vague promises.

### Meta / SEO Copy

| Field | Copy |
|-------|------|
| Title | Wellrox Creator Program — Apply for Free Products |
| Meta description | Apply to the Wellrox Creator Program and receive free wellness products to feature in your content. |
| OG title | Wellrox Creator Program |
| OG description | Join the Wellrox Creator Family. Get free wellness products to feature in your TikTok content. |

---

## 9. Accessibility

### Focus States

```
outline: 3px solid var(--primary-light)  (#c9aead)
outline-offset: 2px
```

### Skip Link

```
position: absolute (sr-only until focused)
on focus: padding 12px 24px, border-radius 9999px, background var(--primary), color white
position: top 8px left 8px
```

### Reduced Motion

All animations disabled via `prefers-reduced-motion: reduce`:
- Keyframe animations → `none !important`
- Reveal transforms → `opacity: 1, transform: none`
- Scroll indicator → static `opacity: 0.4`

### Color Contrast

| Pairing | Foreground | Background | Ratio (approx) |
|---------|-----------|------------|-----------------|
| Headings on white | `#1a1a1a` | `#ffffff` | 16.6:1 |
| Body on white | `#6b6560` | `#ffffff` | 5.1:1 |
| Primary on white | `#b4918f` | `#ffffff` | 3.2:1 (decorative only) |
| White on primary | `#ffffff` | `#b4918f` | 3.2:1 (large text / buttons) |
| White on dark | `rgba(255,255,255,0.85)` | `#1a1a1a` | ~14:1 |

---

## 10. Quick Reference — CSS Custom Properties

```css
:root {
  /* Primary */
  --primary: #b4918f;
  --primary-dark: #9a7573;
  --primary-light: #c9aead;

  /* Neutrals */
  --white: #ffffff;
  --foreground: #1a1a1a;
  --muted: #6b6560;
  --border: #e0dada;

  /* Cream / Blush */
  --cream: #f7f3ef;
  --cream-dark: #ede7e0;
  --cream-subtle: #faf8f5;
  --blush: #f7f3ef;
  --blush-dark: #ede7e0;
  --blush-subtle: #faf8f5;

  /* Accent */
  --taupe: #c4b8b0;

  /* Semantic */
  --destructive: #e53e3e;
  --success: #38a169;

  /* Dark */
  --bg-dark: #1a1a1a;

  /* Layout */
  --nav-height: 76px;
  --max-w-form: 520px;
  --max-w-content: 720px;
  --max-w-section: 1080px;
}
```
