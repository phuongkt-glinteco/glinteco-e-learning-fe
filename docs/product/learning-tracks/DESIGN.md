---
name: High-Velocity Engineering Portal
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#434655'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#737686'
  outline-variant: '#c3c6d7'
  surface-tint: '#0053db'
  primary: '#004ac6'
  on-primary: '#ffffff'
  primary-container: '#2563eb'
  on-primary-container: '#eeefff'
  inverse-primary: '#b4c5ff'
  secondary: '#712ae2'
  on-secondary: '#ffffff'
  secondary-container: '#8a4cfc'
  on-secondary-container: '#fffbff'
  tertiary: '#006329'
  on-tertiary: '#ffffff'
  tertiary-container: '#007f36'
  on-tertiary-container: '#c7ffca'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dbe1ff'
  primary-fixed-dim: '#b4c5ff'
  on-primary-fixed: '#00174b'
  on-primary-fixed-variant: '#003ea8'
  secondary-fixed: '#eaddff'
  secondary-fixed-dim: '#d2bbff'
  on-secondary-fixed: '#25005a'
  on-secondary-fixed-variant: '#5a00c6'
  tertiary-fixed: '#7ffc97'
  tertiary-fixed-dim: '#62df7d'
  on-tertiary-fixed: '#002109'
  on-tertiary-fixed-variant: '#005320'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
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
    fontWeight: '600'
    lineHeight: 20px
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.02em
  code:
    fontFamily: monospace
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  2xl: 48px
  3xl: 64px
  container-max: 1280px
  gutter: 24px
  margin-mobile: 16px
---

## Brand & Style
The design system is engineered for a high-performance internal onboarding experience. It balances the rigor of technical documentation with the kinetic energy of a growth-focused SaaS platform. The aesthetic is **Corporate Modern** with a bias toward clarity, speed, and subtle gamification.

The target audience consists of engineers who value efficiency and information density. The UI should evoke a sense of progress, reliability, and technical excellence. By utilizing a "clean-room" approach—heavy use of whitespace, crisp borders, and a logical information hierarchy—the design system ensures that the onboarding process feels like a guided launch rather than a chore.

## Colors
This design system utilizes a structured, high-contrast palette to differentiate between functional UI and motivational elements.

- **Primary Blue (#2563EB):** Reserved for core utility—primary actions, navigation states, and systemic progress.
- **Secondary Violet (#7C3AED):** Used exclusively for "The Experience Layer"—gamification, XP badges, and leveling mechanics to provide a distinct visual separation from task-based work.
- **Surface Strategy:** Use the Main Background for the application shell and the Surface/Card color for content containers to create a clear "layered" effect.
- **Semantic Logic:** Adhere strictly to the defined status colors for feedback loops. Use the Inactive Slate for locked modules to reduce visual noise on unavailable paths.

## Typography
**Inter** is the sole typeface for this design system, chosen for its exceptional legibility in technical contexts and its neutral, professional tone. 

- **Weight as Hierarchy:** Use Bold (700) for page titles and Semi-Bold (600) for sub-headers and labels to ensure a clear scannability.
- **Technical Content:** For code snippets or terminal outputs within the portal, utilize a standard system monospace font at 14px to maintain a familiar environment for engineers.
- **Readability:** Maintain a line height of 1.5x for body text to ensure high endurance during long reading sessions of technical documentation.

## Layout & Spacing
This design system uses a **12-column fluid grid** for desktop and a **single-column vertical stack** for mobile. 

- **The 8pt Grid:** All spacing (padding, margins, gutters) must be increments of 8px. Use 4px (base) only for extremely tight internal component spacing (e.g., icon next to text).
- **Rhythm:** Use `lg` (24px) for standard padding within cards and `2xl` (48px) for vertical section spacing.
- **Max Width:** Content should be constrained to 1280px to prevent excessive line lengths on ultra-wide monitors, maintaining readability for technical specs.

## Elevation & Depth
Depth is conveyed through **Tonal Layering** supplemented by extremely subtle ambient shadows. 

- **Level 0 (Background):** #F8FAFC. The lowest layer.
- **Level 1 (Cards/Surfaces):** #FFFFFF with a 1px solid border of #E2E8F0. 
- **Shadows:** Use a single, soft shadow for cards: `0px 1px 3px 0px rgba(15, 23, 42, 0.05), 0px 1px 2px -1px rgba(15, 23, 42, 0.05)`.
- **Interaction:** On hover, a card may transition to a slightly deeper shadow to indicate clickability, but avoid heavy "floating" effects to keep the interface grounded.

## Shapes
The shape language is defined by the **"Round Eight"** rule. A consistent radius of 8px (`0.5rem`) is applied to almost all UI containers to soften the technical nature of the content without appearing overly playful.

- **Standard (8px):** Buttons, Cards, Input Fields, and Modals.
- **Small (4px):** Internal elements like Checkboxes and Tags/Chips.
- **Full (Pill):** Progress bars and specific notification badges.

## Components
- **Buttons:** Primary buttons use the Primary Blue with white text. Secondary buttons use a ghost style (Primary Blue border and text) or the Secondary Violet for gamified actions (e.g., "Claim XP").
- **Chips/Badges:** Use a subtle background (10% opacity of the semantic color) with 100% opacity text. For example, a "Completed" chip has a light green background and dark green text.
- **Input Fields:** 1px border (#E2E8F0), 8px radius, and 16px horizontal padding. Active state uses a 2px Primary Blue border.
- **Progress Bars:** Use a thick 8px track. Use Primary Blue for course progress and Secondary Violet for XP/Leveling progress to reinforce the "Work vs. Play" distinction.
- **Cards:** White background, 1px border (#E2E8F0), 8px radius, and the subtle "Level 1" shadow. Headers within cards should have a subtle bottom border to separate titles from body content.
- **Lists:** Use "Zebra striping" with #F8FAFC on even rows for long data tables or task lists to aid horizontal eye-tracking.