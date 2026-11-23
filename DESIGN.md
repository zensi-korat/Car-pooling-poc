---
name: Pool
description: A warm, readable car-pooling app built around the trip: time, route, seats and fare.
colors:
  terracotta: "oklch(0.565 0.141 39.3)"
  terracotta-bright: "oklch(0.661 0.141 40.4)"
  terracotta-deep: "oklch(0.452 0.117 39.1)"
  terracotta-tint: "oklch(0.937 0.023 45.6)"
  terracotta-wash: "oklch(0.955 0.015 45)"
  road-grey: "oklch(0.971 0.003 60)"
  card-white: "oklch(1 0 0)"
  ink: "oklch(0.21 0.012 40)"
  muted-ink: "oklch(0.5 0.012 40)"
  hairline: "oklch(0.91 0.006 50)"
  night-road: "oklch(0.17 0.006 40)"
  night-card: "oklch(0.215 0.008 40)"
  night-ink: "oklch(0.95 0.005 60)"
typography:
  headline:
    fontFamily: "Figtree Variable, sans-serif"
    fontSize: "1.875rem"
    fontWeight: 700
    letterSpacing: "-0.025em"
  title:
    fontFamily: "Figtree Variable, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 800
    letterSpacing: "-0.025em"
    fontFeature: "tnum"
  body:
    fontFamily: "Figtree Variable, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.43
  label:
    fontFamily: "Figtree Variable, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
rounded:
  md: "4.8px"
  lg: "6px"
  xl: "8.4px"
  full: "9999px"
spacing:
  card: "16px"
  page: "24px"
  gap: "16px"
  section: "24px"
components:
  button-primary:
    backgroundColor: "{colors.terracotta}"
    textColor: "{colors.card-white}"
    rounded: "{rounded.lg}"
  button-outline:
    backgroundColor: "{colors.card-white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
  card:
    backgroundColor: "{colors.card-white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.xl}"
    padding: "16px"
  chip-brand:
    backgroundColor: "{colors.terracotta-tint}"
    textColor: "{colors.terracotta-deep}"
    rounded: "{rounded.md}"
    padding: "2px 8px"
  nav-item-active:
    backgroundColor: "{colors.terracotta}"
    textColor: "{colors.card-white}"
    rounded: "{rounded.xl}"
    height: "40px"
---

# Design System: Pool

## Overview

**Creative North Star: "The Shared Road"**

Pool is built around the trip, not the app. Every screen answers the same questions a rider or driver asks before
leaving: when does it go, from where to where, how many seats are left, and what does it cost. Those facts are set
large and bold; everything else steps back. One warm terracotta carries the brand, the way a single brand colour
carries Rapido or Zomato, so the interface feels like a friendly consumer app rather than an admin template.

Surfaces are calm: a soft neutral grey ground, white rounded cards lifted by a soft shadow, and no grey boxes inside
grey boxes. The look is shared by every role (rider, driver, admin); only density changes, with admin tables denser
than rider cards. Light and dark themes are equal citizens.

**Key Characteristics:**

- One brand colour (terracotta) for actions, selection, active navigation and brand tints.
- Trip facts (departure time, fare) in extra-bold, tabular figures.
- White rounded cards on a soft grey ground, separated by shadow instead of borders.
- Figtree throughout, from page titles to labels.
- Not themed: no tickets, signs or codes used as decoration.

## Colors

A restrained palette: warm-tinted neutrals plus one terracotta that does real jobs.

### Primary

- **Terracotta** (`terracotta`): primary buttons, the active sidebar item, focus rings, the selected ride's ring,
  route dots, links that act. White text sits on it.
- **Bright Terracotta** (`terracotta-bright`): the same roles in dark mode. Dark text sits on it, because white
  fails contrast at that lightness.
- **Deep Terracotta** (`terracotta-deep`): text on terracotta tints (chips, secondary buttons, hover states).
- **Terracotta Tint** (`terracotta-tint`) and **Terracotta Wash** (`terracotta-wash`): secondary buttons, the seats
  pill, icon tiles in section headers and empty states, hover backgrounds.

### Neutral

- **Road Grey** (`road-grey`): the page background, so white cards stand out.
- **Card White** (`card-white`): cards, tables, the sidebar, popovers.
- **Ink** (`ink`): body text and headings; never pure black.
- **Muted Ink** (`muted-ink`): secondary text (dates under times, captions); passes 4.5:1 on white.
- **Hairline** (`hairline`): the few borders that remain (inputs, table rows, dividers).
- **Night Road / Night Card / Night Ink**: the dark-theme ground, card and text.

### Named Rules

**The One Colour Rule.** Terracotta is the only brand hue. Status colours (green, amber, red, blue, purple) appear
only inside status badges, where they carry meaning.

**The Readable Terracotta Rule.** Light theme puts white text on terracotta; dark theme puts dark text on bright
terracotta. Never lighten terracotta while keeping white text on it.

## Typography

**Body and display font:** Figtree Variable (with sans-serif fallback). One family does everything.

**Character:** friendly and round, confident in heavy weights, easy to read at small sizes.

### Hierarchy

- **Headline** (700, 1.5rem on phones, 1.875rem from `sm`): page titles in `PageHeader`.
- **Title** (800, 1.5rem, tabular figures): a ride's departure time and fare, the facts people scan for.
- **Body** (400, 0.875rem to 1rem): descriptions, route place names (500), table cells.
- **Label** (500, 0.75rem): captions under times and fares, form hints, badges.

### Named Rules

**The Trip Facts Rule.** Departure time and fare are always the largest, boldest text on a ride card, in tabular
figures. The day and the "total, split among riders" caption sit small beneath them.

## Layout

Pages are a header plus a padded content column: `PageHeader` with its title (no divider line), then content with 24px
padding and 16-24px gaps. Rider and driver lists are single-column cards on phones, two columns from `xl`. Find a Ride
stacks results and map on phones, side by side from `lg`. The sidebar collapses to icons on desktop and to a sheet on
phones. Mobile first for riders and drivers; admin screens are table-led but must not break on phones.

## Elevation & Depth

Depth comes from one soft, warm shadow, not from borders. Cards, tables and section boxes share it, with a near-
invisible ring for edge definition in light mode.

### Shadow Vocabulary

- **Card lift** (`box-shadow: 0 1px 2px oklch(0.3 0.03 40 / 6%), 0 4px 14px oklch(0.3 0.03 40 / 7%)`): every card,
  table and section box (`shadow-sm` plus `ring-1 ring-foreground/5`).
- **Floating** (Tailwind `shadow-xl`): only the route preview card on the login/signup panel.

### Named Rules

**The No Box-in-Box Rule.** A card never sits inside another card, and card footers have no grey strip or divider.

## Shapes

Softly rounded, tidy corners: about 4px for badges and chips, 6px for buttons and inputs, about 8px for cards, tables,
maps, empty states, icon tiles and nav items. Pills and avatars are fully round. Corners are never sharp, and never
rounder than about 8px (the user found larger radii too round).

## Components

### Buttons

- **Shape:** softly rounded (6px).
- **Primary:** terracotta with white text (dark text in dark mode).
- **Outline / secondary:** white with a hairline border, or terracotta tint with deep terracotta text.
- **Icons:** inline start or end, no size classes. A loading button shows a spinner and is disabled.

### Chips

- **Seats pill (`StatusBadge tone="brand"`):** terracotta tint with deep terracotta text and a people icon, e.g.
  "2 of 3 seats free".
- **Status badges:** live in `src/components/badges.tsx`; tinted backgrounds with matching text.

### Cards / Containers

- **Corner Style:** about 8px.
- **Background:** card white (night card in dark mode).
- **Shadow Strategy:** card lift (see Elevation).
- **Border:** none; a 5% ring only.
- **Internal Padding:** 16px.
- **Selected:** a 2px terracotta ring.

### Inputs / Fields

- **Style:** hairline border, white, 6px radius, label above (`LabeledField`).
- **Focus:** terracotta focus ring; terracotta caret.
- **Error:** destructive border and the first error message under the field.

### Navigation

- **Sidebar:** white panel; the brand tile (terracotta, about 8px radius) beside "Pool" in extra-bold. Items are 40px
  tall and rounded; the active item is solid terracotta with bold white text.

### Ride Card (signature)

The ride card is the heart of the system (Find a Ride, My Rides, My Bookings): `DepartureTime` (big time, small day)
top left, the fare big top right with a small caption, `RouteLine` (hollow start dot, line, filled end dot) beneath,
then info tiles or the seats pill, and actions on the right of a borderless footer.

### Empty States

A white, rounded box with a dashed hairline border, the icon in a terracotta-tinted rounded tile, a bold title and one
helpful sentence that says what to do next.

## Do's and Don'ts

### Do:

- **Do** use terracotta only for actions, selection, active navigation and brand tints.
- **Do** set departure times and fares in extra-bold tabular figures (`DepartureTime`, `text-2xl font-extrabold`).
- **Do** lift cards with the card-lift shadow on the road-grey ground.
- **Do** keep every new colour inside the theme tokens in `src/index.css` and every badge in `badges.tsx`.

### Don't:

- **Don't** add decorative themes (tickets, road signs, codes, dot patterns) to working screens.
- **Don't** put grey footer strips, divider lines or nested cards inside cards.
- **Don't** use heavy gradients, glow or animation everywhere; the user rejected "too flashy".
- **Don't** put white text on a lighter terracotta than `terracotta`.
- **Don't** add a small label above a heading; the heading carries itself.
