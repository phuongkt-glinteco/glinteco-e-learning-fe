---
name: RAMP UP Neutral
colors:
  surface: '#f9f9fa'
  surface-dim: '#dadadb'
  surface-bright: '#f9f9fa'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f3f4'
  surface-container: '#eeeeef'
  surface-container-high: '#e8e8e9'
  surface-container-highest: '#e2e2e3'
  on-surface: '#1a1c1d'
  on-surface-variant: '#47464a'
  inverse-surface: '#2f3132'
  inverse-on-surface: '#f0f1f2'
  outline: '#78767b'
  outline-variant: '#c8c5ca'
  surface-tint: '#5f5e60'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#1c1b1d'
  on-primary-container: '#858386'
  inverse-primary: '#c8c6c8'
  secondary: '#5d5e66'
  on-secondary: '#ffffff'
  secondary-container: '#e3e1ec'
  on-secondary-container: '#63646c'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#1f1a1a'
  on-tertiary-container: '#8a8282'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e5e1e4'
  primary-fixed-dim: '#c8c6c8'
  on-primary-fixed: '#1c1b1d'
  on-primary-fixed-variant: '#474649'
  secondary-fixed: '#e3e1ec'
  secondary-fixed-dim: '#c6c5cf'
  on-secondary-fixed: '#1a1b22'
  on-secondary-fixed-variant: '#46464e'
  tertiary-fixed: '#ebe0df'
  tertiary-fixed-dim: '#cec4c4'
  on-tertiary-fixed: '#1f1a1a'
  on-tertiary-fixed-variant: '#4c4545'
  background: '#f9f9fa'
  on-background: '#1a1c1d'
  surface-variant: '#e2e2e3'
typography:
  h1:
    fontFamily: Inter
    fontSize: 30px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.02em
  h2:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.02em
  h3:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  body-base:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
  h1-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  container-max: 1200px
  sidebar-width: 280px
  gutter: 24px
  margin-mobile: 16px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 32px
---

## Brand & Style
The design system focuses on utility, clarity, and rapid information processing for internal onboarding. It adopts a **Modern Corporate Minimalism** style, drawing heavily from functional aesthetics and systematic layouts. By removing the distraction of color, the interface prioritizes content hierarchy and progress tracking.

The aesthetic is characterized by:
- **Quiet Authority:** A monochromatic palette that feels professional and unbiased.
- **Systematic Order:** Rigorous alignment and consistent spacing inspired by high-end documentation and developer tools.
- **Intentional Whitespace:** Generous margins to prevent cognitive overload during the onboarding process.

## Colors
The palette is strictly grayscale to maintain a "low-fidelity" but high-polish feel. 
- **Primary/Foreground:** Black (#09090b) used for text and primary actions.
- **Surface/Background:** White (#ffffff) for the main canvas, with Zinc/Gray 50 (#fafafa) for secondary surfaces like sidebars.
- **Borders:** Zinc 200 (#e4e4e7) is the standard for hair-line dividers and component strokes.
- **Status Indicators:** Muted, low-saturation tones are used only for functional feedback (success/warning), ensuring they stand out against the neutral backdrop without breaking the grayscale theme.

## Typography
The system uses **Inter** for all roles to ensure maximum legibility and a contemporary, "system-default" appearance. 

- **Hierarchy:** Established through weight and tight tracking on headings.
- **Tracking:** Headings use slight negative letter spacing (-0.01em to -0.02em) to feel tighter and more authoritative.
- **Contrast:** High contrast is maintained by using pure black for headings and Zinc 600 (#52525b) for secondary body text or metadata.

## Layout & Spacing
The layout follows a **Hybrid Grid** model:
- **Sidebar:** A fixed-width navigation rail (280px) on the left for desktop, providing a persistent anchor for the onboarding journey.
- **Main Canvas:** A fluid content area with a maximum width of 1200px to ensure line lengths remain readable.
- **Spacing Logic:** Based on an 8px (0.5rem) rhythm. Use 16px for internal component padding and 32px or 48px for section vertical rhythm.
- **Responsive:** On mobile, the sidebar collapses into a bottom sheet or a hidden drawer, and margins reduce from 24px to 16px.

## Elevation & Depth
In alignment with the minimalist style, depth is created through **Tonal Layering** and **Low-contrast Outlines** rather than heavy shadows.

- **Level 0 (Background):** White (#ffffff) or Zinc 50 (#fafafa) for the global backdrop.
- **Level 1 (Cards/Containers):** White background with a 1px solid border (#e4e4e7). 
- **Level 2 (Active States/Popovers):** A very soft, subtle shadow (0 4px 6px -1px rgb(0 0 0 / 0.05)) may be used for floating elements like dropdowns.
- **Skeletons:** Use a subtle pulse animation on a Zinc 100 (#f4f4f5) background to indicate loading states without visual jar.

## Shapes
This design system uses a **standardized roundedness** (8px/0.5rem) to soften the technical feel of a grayscale interface. This level of curvature balances professional structure with modern approachability.

- **Buttons & Inputs:** 0.5rem (8px).
- **Cards & Sidebar Active States:** 0.5rem (8px).
- **Badges/Chips:** Large radius (rounded-full) to differentiate them from interactive buttons.

## Components
Consistent implementation of core elements is vital for the portal’s usability.

- **Sidebar:** Transparent background for items. Active items use a light gray background (#f4f4f5) and bold text. Icons should be simple, 20px outlines.
- **Buttons:** 
    - *Primary:* Solid Black background with White text. 
    - *Secondary:* White background with Zinc 200 border.
- **Forms:** Labels are strictly placed above inputs in `label-sm` weight. Inputs use a 1px border (#e4e4e7) and transition to a 1px black border on focus.
- **Progress Bars:** A 4px or 8px height track (#f4f4f5) with a solid black fill indicating completion percentage.
- **Badges:** Small, uppercase text with a Zinc 100 background and Zinc 600 text for a "pill" look.
- **Tabs:** Horizontal list with a 2px black bottom border on the active item, or a "segmented control" pill style for secondary navigation.
- **Cards:** No-shadow, 1px border containers with 24px internal padding.