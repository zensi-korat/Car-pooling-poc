---
version: 1
slug: "src-pages-rider-ridersearchpage-tsx"
primary_target: "src/pages/rider/RiderSearchPage.tsx"
related_targets: []
---

# Find a Ride (rider search)

Scope: rider search page, mode Operate, mobile first. Sets the look for the whole app; every other page follows it.
Task: enter From/To (+ optional dates), scan rides by time, seats and fare, see a route on the map, book a seat.
Constraints: keep every feature and flow, light + dark theme, the sidebar navigation, shadcn components.
Avoid: flashy, generic shadcn template, cramped, hard to read.

## Direction contract

THESIS: A warm, confident consumer app, not an admin template: one terracotta brand colour does the work that grey borders do in the stock shadcn look.
OWN-WORLD: Terracotta #B9532F (white text) as the brand; neutral light grey ground with white rounded cards (radius ~16-20px) and soft shadows instead of hard borders; Figtree in bold weights for headings, times and fares; terracotta tint pills for seats; dark theme on near-black with a brighter terracotta.
STORY: The rider sees where to search, gets rides soonest first, compares time, seats and fare at a glance, books a seat in one tap.
FIRST VIEWPORT: Page title in bold type, the search card (From, To, When, terracotta Search) on top; results as rounded cards with time large on the left, fare large on the right, route line beneath, a "seats left" pill and Book seat button in the footer; selected ride gets a terracotta ring and its route on the map.
FORM: canon, executed against Rapido and Zomato; seed: none (pinned) "Rapido / Zomato style", "Terracotta", "Back to the first one" (#B9532F).
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
