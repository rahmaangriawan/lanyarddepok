# PrimaGraphia

## Mission
Create implementation-ready, token-driven UI guidance for PrimaGraphia that is optimized for consistency, accessibility, and fast delivery across e-commerce storefront.

## Brand
- Product/brand: PrimaGraphia
- URL: https://www.primagraphia.co.id/
- Audience: online shoppers and consumers
- Product surface: e-commerce storefront

## Style Foundations
- Visual style: clean, functional, implementation-oriented
- Main font style: `font.family.primary=Rubik`, `font.family.stack=Rubik, sans-serif`, `font.size.base=14px`, `font.weight.base=500`, `font.lineHeight.base=16.8px`
- Typography scale: `font.size.xs=13px`, `font.size.sm=14px`, `font.size.md=15px`, `font.size.lg=16px`, `font.size.xl=17px`, `font.size.2xl=18px`, `font.size.3xl=20px`, `font.size.4xl=28px`
- Color palette: `color.text.primary=#373f50`, `color.text.secondary=#ffffff`, `color.text.tertiary=#fe696a`, `color.text.inverse=#4b566b`, `color.surface.base=#000000`, `color.surface.strong=#f3f5f9`, `color.border.default=#e5e7eb`
- Spacing scale: `space.1=4px`, `space.2=8px`, `space.3=10px`, `space.4=10.5px`, `space.5=12px`, `space.6=14px`, `space.7=16px`, `space.8=18px`
- Radius/shadow/motion tokens: `radius.xs=5px`, `radius.sm=6px`, `radius.md=50px` | `motion.duration.instant=250ms`, `motion.duration.fast=450ms`

## Accessibility
- Target: WCAG 2.2 AA
- Keyboard-first interactions required.
- Focus-visible rules required.
- Contrast constraints required.

## Writing Tone
Concise, confident, implementation-focused.

## Rules: Do
- Use semantic tokens, not raw hex values, in component guidance.
- Every component must define states for default, hover, focus-visible, active, disabled, loading, and error.
- Component behavior should specify responsive and edge-case handling.
- Interactive components must document keyboard, pointer, and touch behavior.
- Accessibility acceptance criteria must be testable in implementation.

## Rules: Don't
- Do not allow low-contrast text or hidden focus indicators.
- Do not introduce one-off spacing or typography exceptions.
- Do not use ambiguous labels or non-descriptive actions.
- Do not ship component guidance without explicit state rules.

## Guideline Authoring Workflow
1. Restate design intent in one sentence.
2. Define foundations and semantic tokens.
3. Define component anatomy, variants, interactions, and state behavior.
4. Add accessibility acceptance criteria with pass/fail checks.
5. Add anti-patterns, migration notes, and edge-case handling.
6. End with a QA checklist.

## Required Output Structure
- Context and goals.
- Design tokens and foundations.
- Component-level rules (anatomy, variants, states, responsive behavior).
- Accessibility requirements and testable acceptance criteria.
- Content and tone standards with examples.
- Anti-patterns and prohibited implementations.
- QA checklist.

## Component Rule Expectations
- Include keyboard, pointer, and touch behavior.
- Include spacing and typography token requirements.
- Include long-content, overflow, and empty-state handling.
- Include known page component density: links (376), cards (370), buttons (202), lists (22), inputs (20), navigation (2).


## Quality Gates
- Every non-negotiable rule must use "must".
- Every recommendation should use "should".
- Every accessibility rule must be testable in implementation.
- Teams should prefer system consistency over local visual exceptions.
