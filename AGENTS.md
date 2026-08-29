# AGENTS.md — UI/UX & Design System Rules

## 1. Purpose

This file defines the global UI/UX rules for this project.

The project uses a clean, modern administrative dashboard style based on the approved Stitch designs. These rules are GLOBAL and must be followed across all current and future pages.

Important:
- Do not treat the example screenshots as rules for only one or two pages.
- Treat them as the visual language of the entire application.
- Page-specific requirements should live in separate design/spec files.
- If a page-specific design conflicts with this file, follow the approved page-specific design for that page while preserving the global design system.

---

# 2. Source of Truth

Use this priority order when deciding how a UI should look:

1. Approved page-specific Stitch design
2. `docs/design/` design specifications
3. This `AGENTS.md`
4. Existing reusable components/design tokens
5. Reasonable UI/UX judgment

Never invent a new visual style when an existing design system already provides the answer.

If the Stitch design is ambiguous:
- inspect existing pages/components first;
- reuse established patterns;
- do not randomly invent colors, spacing, typography, or component behavior.

---

# 3. Overall Visual Direction

The application should feel:

- clean
- professional
- trustworthy
- modern
- lightweight
- easy to scan
- suitable for an administrative/public transparency application

Avoid:
- excessive gradients
- excessive shadows
- excessive rounded elements
- oversized typography
- highly saturated backgrounds
- unnecessary animations
- decorative elements that reduce information clarity
- inconsistent component styles

The interface should prioritize information hierarchy and usability over decoration.

---

# 4. Color System

The primary visual identity is purple.

The screenshots use a purple family approximately around:

- Primary: `#4A3499`
- Primary alternative/reference: `#634AB2`
- White: `#FFFFFF`
- Main page background: very light neutral, approximately `#F8F9FB`
- Main text: dark neutral, approximately `#1F2937`
- Secondary/muted text: approximately `#6B7280`
- Border: approximately `#E5E7EB`

Important:
These hex values are reference tokens derived from the approved visual direction. If the actual project design tokens already exist, use those tokens instead of hardcoding new values.

Do not introduce additional purple shades unnecessarily.

## Semantic colors

Use semantic colors consistently:

- Success: green
- Warning/Pending: amber/yellow
- Error/Rejected: red
- Info/Processing: blue

Semantic colors should normally appear as:
- status badges
- status indicators
- icons
- small accents

Do not use semantic colors as large page backgrounds unless the design explicitly requires it.

---

# 5. Typography

Use a clean sans-serif font.

Preferred hierarchy:

- Page title: strong, readable, approximately 20–24px
- Section title: approximately 14–18px
- Body text: approximately 13–14px
- Supporting/muted text: approximately 11–13px
- Table text: approximately 12–13px

Typography should prioritize readability.

Use font weight intentionally:
- Regular: body/supporting text
- Medium: labels/navigation
- Semibold: headings, important values, buttons
- Bold: only for strong emphasis

Do not use large display typography inside normal dashboard screens.

---

# 6. Layout

The application uses a persistent sidebar + main content layout for administrative pages.

General structure:

    ┌──────────── Sidebar ────────────┬──────────── Main Content ────────────┐
    │                                 │ Header / top bar                     │
    │ Logo / application identity     │                                      │
    │ Navigation                      │ Page title + description             │
    │                                 │                                      │
    │                                 │ Content / cards / tables / forms     │
    │                                 │                                      │
    │ Logout                          │                                      │
    └─────────────────────────────────┴──────────────────────────────────────┘

Sidebar:
- white/light surface
- visually separated from main content
- compact navigation
- active item uses the primary purple color
- active state should be obvious but not visually aggressive

Main content:
- generous but controlled whitespace
- consistent horizontal padding
- content should align to a common grid
- avoid arbitrary positioning

---

# 7. Spacing

Use a consistent spacing scale based around 4px.

Preferred values:

- 4px
- 8px
- 12px
- 16px
- 20px
- 24px
- 32px
- 40px
- 48px

Prefer existing spacing tokens/utilities.

Do not use random values such as:
- 13px
- 17px
- 23px
- 27px

unless the approved design clearly requires them.

Consistency is more important than making every element slightly different.

---

# 8. Cards

Cards should follow the style visible in the approved Stitch designs:

- white/light surface
- subtle border or very subtle shadow
- small-to-medium border radius
- comfortable internal padding
- clear hierarchy
- no excessive decoration

Cards should not become visually heavy.

Use cards to group related information, not simply because a component can be placed inside a card.

---

# 9. Buttons

Buttons are important and must remain visually consistent throughout the application.

## Primary button

Use the primary purple.

Characteristics:
- clear contrast
- medium border radius
- compact height
- readable semibold text
- adequate horizontal padding

Example purpose:
- Simpan
- Tambah
- Submit
- Export
- Confirm

## Secondary button

Use a light/white surface with:
- neutral border
- dark text
- same height and radius family as primary buttons

Example purpose:
- Batal
- Kembali
- Reset

## Destructive button

Use the semantic error color only when the action is destructive.

Example:
- Hapus
- Tolak
- Delete

Do not use red simply to attract attention.

## Button rules

Every button should have appropriate:
- default state
- hover state
- active/pressed state
- focus state
- disabled state
- loading state when applicable

Do not create different button heights/radii on different pages without a design reason.

---

# 10. Inputs & Forms

Forms should look clean and compact like the approved designs.

Use:
- clear labels
- consistent input height
- subtle borders
- readable placeholder text
- consistent border radius
- visible focus state

Labels should not be replaced by placeholders when the field needs a persistent explanation.

Validation:
- show errors close to the relevant field
- use clear language
- do not rely on color alone

File upload areas may use a dashed border when appropriate, matching the established visual language.

---

# 11. Tables

Tables should be optimized for scanning.

Use:
- clear column headings
- compact rows
- subtle separators
- consistent alignment
- appropriate whitespace

For numeric values:
- use consistent alignment
- make important amounts visually distinct

For status:
- use compact badges/pills
- semantic colors
- short readable labels

Avoid overly large table rows.

---

# 12. Status Badges

Status badges should be compact and visually light.

Examples:

- Pending → amber/yellow
- Processing → blue
- Completed/Success → green
- Rejected/Error → red

The badge should not dominate the row.

Use both:
- color
- text

Never rely on color alone to communicate status.

---

# 13. Icons

Icons should be:
- simple
- consistent
- visually lightweight
- approximately the same visual weight

Do not mix multiple icon libraries unless the project already requires it.

Avoid using icons purely as decoration when they do not improve comprehension.

Icons inside buttons should align naturally with the text.

---

# 14. Navigation

Sidebar navigation must have:

Default:
- neutral text
- subtle icon

Hover:
- subtle background/foreground change

Active:
- primary purple background or visual treatment
- clear contrast
- matching icon/text treatment

The active navigation state must be immediately recognizable.

Keep navigation labels short and consistent.

---

# 15. Header / Top Bar

The top bar should remain lightweight.

Possible elements:
- page/application title
- search
- notifications
- help
- user/avatar

Do not overcrowd the header.

Elements should align vertically and use consistent icon sizes.

---

# 16. Responsive Design

Every new page must be considered for:

- desktop
- tablet
- mobile

Do not simply shrink the desktop layout.

On smaller screens:
- navigation may collapse
- cards may stack
- tables may become horizontally scrollable or transform into a mobile-friendly layout
- form columns should stack when necessary
- buttons should remain usable
- text should not overflow

Never allow:
- horizontal page overflow
- clipped buttons
- overlapping text
- unusably small touch targets

---

# 17. UX Principles

Before implementing a screen, verify:

1. What is the user's primary task?
2. Is the most important information visually dominant?
3. Is the next action obvious?
4. Are related elements grouped together?
5. Is the information density reasonable?
6. Is the hierarchy understandable without reading every word?
7. Does the page behave consistently with other pages?

Do not blindly copy visual positions if doing so creates an obvious usability problem.

If a Stitch design appears inconsistent with the rest of the application, flag the inconsistency before making a major change.

---

# 18. Reuse Existing Components

Before creating a new component:

1. Search the project for an existing equivalent.
2. Check whether it can be reused.
3. Extend it only if necessary.
4. Create a new component only when the existing component is not appropriate.

Prefer:

    Button
    Card
    Badge
    Input
    Select
    Modal
    Table
    Sidebar
    Header

over duplicating nearly identical implementations per page.

---

# 19. Do Not Over-Abstract

Reuse is important, but do not create complicated abstractions for simple one-off UI.

Good:
- shared Button component
- shared Card component
- shared StatusBadge
- shared form controls

Avoid:
- giant universal component with dozens of unrelated props
- deeply nested abstractions for simple pages
- generic components that make page-specific design difficult

---

# 20. Stitch Implementation Workflow

When implementing a new Stitch page:

## Step 1 — Inspect

Before coding:
- inspect the repository
- read this `AGENTS.md`
- inspect existing components
- inspect `docs/design/` if available
- identify the relevant Stitch design

## Step 2 — Analyze

Identify:
- page structure
- component hierarchy
- spacing
- colors
- typography
- buttons
- forms
- tables
- cards
- responsive behavior
- interaction states

## Step 3 — Plan

Create a short implementation plan before modifying code.

The plan should mention:
- files/components to create or modify
- reusable components
- responsive behavior
- any design ambiguity

## Step 4 — Implement

Implement the page using:
- existing design tokens
- reusable components
- established layout patterns
- the approved Stitch design

Do not make unrelated refactors.

## Step 5 — Run

Run the application and verify the actual rendered page.

Do not consider a UI task complete merely because:
- TypeScript compiles
- tests pass
- the build succeeds

The rendered UI must also be checked.

## Step 6 — Visual QA

Compare the implementation against the approved Stitch design.

Check:

- overall layout
- spacing
- alignment
- colors
- typography
- component size
- button placement
- icon placement
- card dimensions
- table density
- sidebar
- header
- responsive behavior

## Step 7 — Fix

Fix visual inconsistencies before declaring the task complete.

---

# 21. Visual Fidelity Rules

The goal is not merely "similar."

The implementation should preserve the design's:

- hierarchy
- proportions
- spacing
- alignment
- color relationships
- component relationships
- interaction intent

Do not:
- move elements arbitrarily
- change primary colors
- enlarge buttons unnecessarily
- add gradients that are not present
- add shadows everywhere
- replace a compact UI with oversized components
- introduce random border radii

If an element must differ because of technical limitations or responsive requirements, preserve the original design intent.

---

# 22. Accessibility

Every interactive element should have:
- keyboard accessibility
- visible focus state
- readable contrast
- meaningful accessible names where needed

Do not communicate important information through color alone.

Form controls should have proper labels.

---

# 23. Performance

Avoid unnecessary:
- large UI libraries
- duplicated components
- excessive animations
- expensive rendering
- unnecessary client-side state

Prefer the simplest implementation that reproduces the approved design accurately.

---

# 24. Page-Specific Design Files

This file is GLOBAL.

Do NOT create a separate `AGENTS.md` for every page.

For pages with unique layouts or special requirements, create a page-specific specification such as:

    docs/design/pages/dashboard.md
    docs/design/pages/keuangan.md
    docs/design/pages/aspirasi.md

A page-specific file should contain only details that are unique to that page:

- exact layout
- specific components
- content hierarchy
- special interactions
- page-specific responsive behavior
- exact design decisions

Global rules remain in this `AGENTS.md`.

---

# 25. Definition of Done — UI

A UI task is complete only when:

- [ ] Design requirements were inspected
- [ ] Existing components were reused where appropriate
- [ ] Layout matches the approved design
- [ ] Colors match the design system
- [ ] Typography matches the design system
- [ ] Spacing is consistent
- [ ] Buttons are consistent
- [ ] Icons are consistent
- [ ] Responsive behavior was considered
- [ ] Loading/empty/error states were considered where applicable
- [ ] Application runs successfully
- [ ] Visual QA was performed
- [ ] No unrelated code was changed
- [ ] No unnecessary visual styles were invented

---

# 26. Important Instruction to the Coding Agent

DO NOT start by writing code immediately.

For UI tasks, first:

    READ → INSPECT → ANALYZE → PLAN → IMPLEMENT → RUN → VISUAL QA → FIX

The final result must be both:

1. technically correct, and
2. visually faithful to the approved design system and Stitch reference.

If the design is unclear, inspect existing project patterns before inventing a new solution.
