# Implementation Plan: AUS VESTS product page

## Overview
Build an original, responsive standalone sale page for a made-to-measure Australian leather vest. The page includes a live SVG vest customizer, dynamic pricing, cart drawer, order request flow, product education, reviews, FAQ, and responsive navigation.

## Architecture Decisions
- Use semantic static HTML, CSS, and vanilla JavaScript so the page runs without a framework or build step.
- Render the vest as an original inline SVG and update its visible state from the customizer controls.
- Keep pricing and configuration in one JavaScript state object so the preview, summary, cart, and order form stay synchronized.
- Use no third-party product imagery, logos, copy, or code from the reference site.

## Task List

### Phase 1: Product system
- [ ] Task 1: Create the page shell, brand system, navigation, hero, and product metadata.
  - Acceptance: page has one clear product identity, responsive header, strong product thesis, and accessible landmarks.
- [ ] Task 2: Create the original SVG vest preview and visual state mapping.
  - Acceptance: leather, cut, closure, braid, collar, lining, and patch choices visibly change the preview.
- [ ] Task 3: Implement the customizer controls and dynamic pricing.
  - Acceptance: selecting options updates the price, summary, URL-independent state, and selected-state styling; controls work by keyboard and pointer.

### Phase 2: Sale and conversion flow
- [ ] Task 4: Add cart drawer, order request form, and success state.
  - Acceptance: Add to cart opens the drawer; quantity and configuration are visible; request submission validates required fields and returns a confirmation reference.
- [ ] Task 5: Add supporting sale content.
  - Acceptance: materials, fit, measurement, reviews, FAQ, delivery, and warranty sections are present and scannable.

### Phase 3: Verification
- [ ] Task 6: Run static checks and browser interaction checks at mobile and desktop widths.
  - Acceptance: page loads, all customizer controls update state, cart flow works, no console errors, no horizontal overflow, and key controls are keyboard reachable.

## Checkpoints
- After Tasks 1-3: customizer is usable and price is synchronized.
- After Tasks 4-5: sale page has a complete conversion path and supporting copy.
- After Task 6: artifact is ready for handoff.

## Risks and Mitigations
- No backend or payment provider is available: use a validated order-request flow and clearly mark checkout integration as the next deployment step.
- Browser automation may lack a local Chrome binary: use the available browser tooling or Playwright-compatible fallback and report the exact verification path.
- Scope creep from too many product options: keep seven high-value controls and expose “send a custom brief” for unusual builds.

## Open Questions
- Final AUD base price, production lead time, shipping policy, and real checkout endpoint can be replaced when supplied.
