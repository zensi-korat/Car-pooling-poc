# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Pool serves two kinds of trips equally:

- **Daily commuters**: colleagues sharing rides to and from work, usually checking on a phone shortly before leaving.
- **City-to-city travellers**: people sharing longer intercity trips, planned a day or more ahead.

Each person uses Pool in one of three roles:

- **Rider**: searches for a ride, books a seat, tracks their bookings.
- **Driver**: registers vehicles, posts rides (route, time, seats, price), edits or manages them.
- **Admin**: reviews users, rides and vehicles (approves or rejects vehicles), reads the audit log.

Riders and drivers are mostly on phones. Admins mostly work on desktop.

## Product Purpose

Pool connects drivers who have empty seats with riders going the same way. Success means a rider finds and books a fitting ride quickly, and a driver posts a ride with minimal effort.

## Positioning

No strong position yet: Pool is a plain, clean, practical tool. Do not invent claims about safety, savings or sustainability.

## Operating Context

- India: prices in INR, times shown in Asia/Kolkata, `en-IN` formatting.
- Sign-up includes phone verification. Vehicles are reviewed by an admin.
- Rides show a route on a map (Leaflet), with places searched through LocationIQ.
- Light and dark themes, plus a "system" setting.

## Capabilities and Constraints

- Built on Vite, React 19, Tailwind v4 and shadcn/ui (radix-nova, lucide icons). Theme tokens live in `src/index.css`.
- Backend: Ride Sharing POC API (cookie auth). The UI shows the server's own error messages.
- It is a learning project: the developer is new to React, so changes should stay simple and readable.
- Current focus is improving the existing UI, not adding new features.

## Brand Commitments

- Name: **Pool** (from `VITE_APP_NAME`). No logo or brand guidelines exist beyond the app's favicon.
- Brand colour: **terracotta `#B9532F`** with white text on it (chosen over softer shades, which need dark text).
- Look: a bold, modern Indian consumer app at the craft level of **Rapido and Zomato**: one bright brand colour,
  rounded cards with soft depth, big friendly type. Not themed (no tickets, signs or codes as decoration), not flashy.

## Evidence on Hand

No testimonials, user numbers, press or reviews exist. Do not fabricate any.

## Product Principles

1. Mobile first for riders and drivers. Admin screens can be desktop-led but must not break on phones.
2. The task comes first: route, time, seats and price are what people scan for.
3. Plain and trustworthy over flashy. Show real data and real server messages.
4. Keep it simple enough for a new React developer to read and maintain.
