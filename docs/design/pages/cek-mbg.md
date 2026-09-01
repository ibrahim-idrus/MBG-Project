# Cek MBG — mobile-first report story

## Approved direction

The user requested a Duolingo-inspired report-card journey: full-screen on all
devices, mobile-first, short Indonesian narration, and restrained interactive
animation. This page deliberately does **not** use the administrative sidebar,
top bar, or dashboard card layout. Other pages retain the global design system.
No page-specific Stitch reference was supplied.

## Layout and interaction

- Route: `/cek-mbg`, with existing `?kitchen_id=` and `/cek-mbg/:id` entry points.
- A lightweight brand/exit header, four-segment reading progress, one visible
  scene, and a sticky bottom action bar. Desktop centers the same journey in a
  520px reading column rather than stretching it into a dashboard.
- Intro → GPS or manual location → matched kitchen → four report chapters →
  summary. Changing location resets progress. Back preserves reading progress;
  summary tiles revisit individual chapters and return to the summary.
- Chapters: budget (animated ring), nutrition (illustrated plate), hygiene
  (animated ring), and food safety (shield). Each has one headline result, short
  text narration, and an expandable detail section. Narration is written, not audio.
- The summary celebrates understanding the report, not an unverified safety or
  anti-corruption verdict. The final action returns to the selected kitchen in
  the existing location dashboard.
- The existing location-page Cek MBG entry now opens this standalone journey.

## Visual rules

Reuse `design-tokens.ts` colors, Plus Jakarta Sans, and Material Symbols. White
canvas, purple accents, subtle bordered cards. Mobile headings are 24px; larger
numbers are limited to the principal report metric. No gradients, confetti,
new icon library, animation dependency, or dashboard sidebar.

Next/Back use directional 350ms entrance transitions; metrics settle over
650ms and rings over 800ms. Buttons have a small pressed offset. The report
illustration has a brief entrance animation, not continuous decorative motion.
`prefers-reduced-motion` disables all transitions/animations and number tweening.

## Data and recovery

Existing location and insight APIs remain unchanged. Current insight scores are
synthetic and some financial amounts fall back to example values, so the UI
explicitly labels the experience and report data as a demo. Missing metrics
display a dash. No guessed coordinates are submitted after location denial.

Location and insight requests have timeouts, visible failure/empty feedback,
retry where appropriate, and guards against late results replacing a new manual
choice. Reports remain unavailable until the insight request succeeds. Location
selections are retained on failure.

## Accessibility and verification

One visible, named scene; focus moves to the new scene; live announcements;
accessible reading progress; labeled native selects; native keyboard-operable
details; visible focus; 44–48px touch controls; safe-area bottom padding. Summary
tiles associate their scores with their accessible descriptions.

Run `npm test` and `npm run test:ui`. Browser tests use a separate in-memory seeded
database. Windows uses installed Edge; other platforms need Playwright Chromium
(`npx playwright install chromium`). Tests cover desktop/mobile, complete report
navigation, denied and late GPS, API recovery, direct links, summary review,
keyboard details, and reduced motion. Visual QA must also inspect actual
rendered intro, chapters, and summary at desktop and mobile sizes.
