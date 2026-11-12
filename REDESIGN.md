# Redesign goals

Started Oct 28, 2026. These goals come from the owner's critique and an audit with the `better-*` skills and the ui.sh design guidelines. References come from Mobbin.

## The critique

1. The site feels like a classic software landing page.
2. It has too many eyebrow labels, descriptions and captions.
3. Small components hold too much information. They have weak information architecture and a weak text hierarchy.

## What the audit measured (before)

| Page | Text elements in `main` | At 14 px or smaller | Eyebrows | Headings (h2 + h3) | Height at 1440 px |
| --- | --- | --- | --- | --- | --- |
| Home | 216 | 139 (64%) | 3 | 35 | 8,539 px |
| Club (Dobson & Southern) | 227 | 141 (62%) | 4 | 26 | 9,423 px |
| Class (Climb Cycle) | 131 | 98 (75%) | 6 | 14 | 5,045 px |
| Membership | 71 | 36 (51%) | 1 | 14 | 4,949 px |

Source counts: 79 `eyebrow` uses and 227 `text-caption` or `text-detail` uses in `app/` and `components/`.

The causes, by skill:

- **Layout (one primary action, order by importance).** Home has 10 sections and tries to be the whole site. Each section repeats one pattern: eyebrow, heading, lede, list, then a row of links.
- **Typography (fewer sizes and weights).** Most content sits in the 14 px caption role or the 13 px detail role. With so many small sizes, nothing reads as secondary, because almost everything is.
- **Surfaces (lightest separation that works).** Rows use a color bar, a top rule, a bottom rule, a meter, a status dot and a caption line together.
- **Writing (delete every word that does no work).** Photo captions describe placeholder art. Trust lines repeat the hero. Section ledes repeat their headings.

## References (Mobbin)

- [Squarespace, fitness template hero](https://mobbin.com/sites/sections/88798f15-ebe6-4c02-9864-9f2d7b3190a1): one headline, one short line, one button.
- [BLOK on Framer](https://mobbin.com/sites/sections/933f929a-d118-4b5d-834d-c60a0f488cae): a headline, one sentence and one action, next to one large image. No eyebrow.
- [ClassPass, studio fitness](https://mobbin.com/sites/sections/8adaef9a-d647-4e38-9541-c886bdb6742b): a large image, and the headline is the only label.
- [Function membership](https://mobbin.com/sites/sections/f5d5c740-7af0-4718-9893-3b8e80e39eed) and [Superpower](https://mobbin.com/sites/sections/6116ce47-e74a-4afc-a67f-fa7496e8579f): one price, one button, one list.

## Goals

1. **The heading is the only label.** No eyebrow above a section heading, a hero or a page title. A heading that needs an eyebrow to make sense gets a better heading. The `eyebrow` style stays only for table column labels and form summaries.
2. **Three text levels on marketing pages.**
   - Display: the page title and section headings.
   - Body: 16 px (18 px for a section's single supporting line), in the foreground color.
   - Small: 14 px muted, only for true metadata, such as a time, a price unit or an address on a detail page.

   Use one supporting line under a section heading at most, and only when it adds a fact.
3. **One job per section, one primary action per page.** Home becomes six sections: hero, clubs, classes, plans, members, tour. Each of the other content blocks already has its own page, so Home links there.
4. **Rows show a name, one line and one action.** Leave the address, busyness, signature list, intensity meter and example classes to the detail page.
5. **No captions on photos.** The shot brief stays as the image's accessible name. Visible captions only on editorial photos in journal articles.
6. **Space separates groups.** Use one rule per list, not a rule plus a color bar plus a meter. Use larger gaps between groups than inside them.
7. **Bigger type, fewer elements.** Headlines and prices carry the page. When something is removed, the space stays.

## Pass 1 (Oct 28): what changed

Foundation, which reaches every page:

- `.eyebrow` is now a quiet sentence-case label (14 px, weight 600, muted). It is no longer uppercase with 0.2em tracking. ui.sh allows uppercase eyebrows only in a monospace face.
- `SectionHead`, `HeroSplit`, `PageHead` and `FaqSection` no longer take an `eyebrow`. `HeroSplit` no longer takes `trust`, and its photo has no caption.
- New `text-lead` role (18 px / 28 px) for the one supporting line under a section heading.
- `PhotoSlot` captions are gone everywhere except the journal article hero. The shot brief stays as the accessible name.
- `CategoryIndex` shows a name and one line. `PlanColumns` drops the rib meter. The Home club rows show a name, one line and today's status.
- I deleted the eyebrows above headings on the club, offer, journal, aquatics and class pages. The mega menu loses its one-line descriptions and the class counts.

Home was rebuilt on six sections. The club page lost its busyness meter, amenity chips, aside captions, "Popular here" list, amenity sub-lists, two of its three address lines and the "Other clubs" list.

| Page | Text elements | At 14 px or smaller | Headings | Height at 1440 px |
| --- | --- | --- | --- | --- |
| Home | 216 → 66 | 64% → 23% | 35 → 8 | 8,539 → 5,309 px |
| Club (Dobson & Southern) | 225 → 179 | 62% → 66% | 26 → 24 | 9,410 → 8,189 px |

Home on a phone went from 9,153 px to 6,307 px. The club page's small-text share rose because I removed body text, while the schedule and hours tables remain. Those tables are the next target.

Checks: `tsc` passes. axe (WCAG 2.2 AA and best practice) finds no violations on Home, the club page, Journal, Climb Cycle, the Offer page and Aquatics at the widths tested. No tested page scrolls sideways at 375 px.

## Pass 1b (Oct 28): links and buttons

- Links in `main` are underlined at rest (40% of the link color, full color on hover). Quiet labels share the link's 14 px semibold step, so color alone did not separate them. Menus, the drawer and the footer keep plain links.
- `TextLink` underlines its label only, so the line stops before the arrow.
- Text ghost buttons rest on the muted fill. Icon ghost buttons keep none.
- The "Most popular" badge is a neutral tag, not link-colored text.

## Pass 2 (Oct 28): schedule rows and class pages

- `ScheduleRow` (`components/brand/class-parts.tsx`) is now the time, the class (16 px), one muted line (coach and studio) and Book. Spots show only when 5 or fewer are left. The duration, category icon, category, color bar, coach avatar and intensity word moved to the booking sheet, which already shows them.
- The day strip is one line per day. An empty day dims. The count is in the button's accessible name.
- Time-of-day groups on `/schedule` are `h3`-size headings, not eyebrows.
- Class detail: the hero has no badge and one link, not two. The facts are three (length, intensity, level) at heading size, not five at 14 px. The "Next class" card that repeated the schedule is gone. "Who it is for" and "Bring and provided" are one section, "Is it for you?", at body size.

| Page | Text elements | Height at 1440 px |
| --- | --- | --- |
| Class (Climb Cycle) | 130 → 97 | 5,045 → 4,964 px |
| Club (Dobson & Southern) | 179 → 170 | 8,189 → 8,236 px |

Counts now include button labels. Most remaining 14 px text is one muted line per schedule row and each "Book" label. axe finds no violations on the class, club, schedule and coach pages at 1440 px and 375 px.

## Pass 3 (Oct 28): club page and mega menu

- Club page: Coaches and "What members say" are one section, "People at …", with coaches on the left and two quotes on the right. The coach rows show specialties only, without credentials. The club FAQ is gone, because its answers repeated "What this club has" and the hero. The stroller-bay answer was the only fact not shown elsewhere. `faqClub` is deleted. The Plans action moved into the section heading. The section nav now reads Classes, Amenities, Hours and map, People.
- The club page is 7,261 px at 1440 px (it was 9,410 px before pass 1) and has 7 sections after the hero (it had 11).
- Mega menu: the "Next up" panel repeated the schedule column. It is now one line and one action: "Try any class free." with "Get a 3-day pass". The "Popular now" items lost their intensity meters.
- axe finds no violations on Home and two club pages at 1440 px and 375 px.

## Pass 4 (Oct 28): join and tour flows

- Join plan step: each card shows the name, a "Most popular" tag where it applies, the price and who it is for. The rib meter and the feature line are gone, and "Compare every detail" holds the features.
- Join club step: each card shows the name and cross street at body size. The status line and the signature list are gone. The Trailhead "No pool at this club." warning stays.
- The order summary rows, the "Today" total, the family add-on total and all consent and option checkbox labels are now 16 px.
- Payment: I removed the line "Payments are processed by our payment provider. We never see your card number." It contradicted the sample-checkout note above it, which says nothing leaves the browser.
- Join confirmation: the "1, 2, 3" eyebrows above the step headings are gone. The `<ol>` carries the order.
- Tour flow: club cards, the coach note, the summary panel, the address card and the consent label are at body size. "Your tour" and "What to bring" are headings, not eyebrows. The filler line "Not sure? Pick the nearest." is gone. Small-text uses fell from 17 to 7.
- **Bug fixed:** at 375 px, the tour day strip sat in a `<fieldset>`, which defaults to its content's width. The strip grew to 1,200 px, never scrolled, and `body` clipped the later days, so users could not reach them. A base rule `fieldset { min-inline-size: 0 }` fixes it for every fieldset.

Checks: both flows ran end to end, including the 0002 decline, the join confirmation and the tour confirmation. axe finds no violations on every join and tour step at 1440 px or 375 px. All 30 routes fit 375 px, and every sideways scroller scrolls.

## Pass 5 (Oct 28): type scale

- `--text-h3` is now 20 px / 28 px, its own step below h2 (24 px). Before, both were 24 px, so a subordinate heading matched its parent. There are 66 `text-h3` uses.
- `text-detail` is folded into `text-caption`. The two roles had the same size, line height and weight. 86 uses changed, and the `--text-detail` tokens are deleted. The scale is now display, h1, h2, h3, lead, body, body-strong, label and caption.
- The club amenity h3s are `text-h3 lg:text-h2`. On a phone they had matched their 24 px h2.
- `/faq` has a visually hidden h2 naming the current group or search. Before, the questions sat in the outline under the nav's "Question groups" heading.

Checks: on 22 routes at 1440 px and 375 px, every visible h3 is smaller than the h2 above it, and nothing overflows. axe finds no violations on 16 routes at 1440 px and on Home at 375 px.

## Pass 6 (Oct 28): remaining pages

- **Membership.** The intro no longer repeats the freeze fee, which the money FAQ answers. One action follows the plans, not two. The guest rules are one line and a policy link. The paragraph that linked to personal training and kids club is gone, because the main navigation has both.
- **Coach pages.** The hero is the name, one muted line (credential, specialties and years) and two actions. It lost the specialty chips, category badges, three stat tiles, the "Favorite class" line, Share and the reply note. "Clubs." became "Where {name} coaches.", a list of links that replaces compact club cards. "Other coaches" is an h3, not an eyebrow.
- **Kids.** Nine sections became seven. "Parents say" is gone, because Home carries member quotes. The family calculator is now a link to the full calculator on Membership. The teen section lost its category badge, and "Which clubs" is an h3.
- **Aquatics.** The warm-pool feature list and the class pitches that repeated the swim classes table are gone. The lanes lede is one sentence. The six-tile rules grid is one sentence. "Pool hours" is an h3.
- **Personal training, Courts and Recovery** already met the goals (22% to 48% small text, mostly tables and controls), so they did not change.

| Page | Text elements | Sections | Height at 1440 px |
| --- | --- | --- | --- |
| Membership | 110 → 102 | 6 → 5 | 4,949 → 4,701 px |
| Coach (Marisol Vega) | 78 → 63 | 5 | 3,452 → 3,543 px |
| Kids | 102 → 89 | 9 → 7 | 6,172 → 5,233 px |
| Aquatics | 105 → 94 | 5 | 4,563 → 4,377 px |

The coach page is a little taller because the clubs list now uses full-width rows. Outside data tables and schedule rows, what remains at 14 px is controls and data: button labels, day buttons, slot times and prices. That matches the label and caption roles.

Checks: axe finds no violations on all nine pages at 1440 px and 375 px. Nothing overflows at 375 px.

## Status

All passes listed in this file are done. `pnpm build` passed on Oct 28: it compiled with no errors and prerendered 107 pages. Not done and not verified:

- A screen-reader pass.
- The pages the passes did not touch directly (About, Careers, App, Contact, Search, Legal, Offer, the class category pages and the 404 page) received the foundation changes only. They had no page-level review.

## Pass 7 (Oct 28): brand graphics

The brand is fictional, so the site no longer shows placeholder "photos". A new vector system replaces them: `components/brand/graphics/`, with a specimen at `/graphics` (noindex). `node scripts/export-graphics.mjs` writes 322 standalone SVGs, in light and dark, to `../brand-graphics/svg/` for the web app and the iOS app. `../brand-graphics/README.md` has the rules.

- **Space graphics (15) and class graphics (8):** one collection of duotone line drawings, each modelled on a real object (see `components/brand/graphics/references.md`). Each has a flat, very light tint of its tone, one subject with strong-tone strokes (about 2 px at 96 px and 3 px at 400 px) and a mid-tint fill on its main surfaces, and the same margins at any ratio. No subject appears in both sets. Kids club is a slide and turf is an agility ladder with cones.
- **Coach marks (8):** a bespoke portrait of each coach's interests, never a person silhouette.
- **Space art (13):** scene illustrations of each space and club exterior in the same line and duotone style, recomposed for every ratio from 21:9 to 4:5.
- **Bespoke graphics (8):** decorative compositions for bands and callouts, still in the earlier filled style.
- **Club pages:** one "Spaces" section (3 or 4 primary spaces with their amenities, then club-wide amenity tiles) replaces the gallery dialog and the amenities section. The mapping is in `lib/data/club-spaces.ts` so the apps can reuse it. The hero is the club exterior (16:9 on phones, 21:9 from `sm`).
- **Home "Eight ways to move.":** a shadcn/ui carousel of six featured classes beside a 4 × 2 grid of class-type cards.
- **Personal training "Find a coach.":** coach marks as profile images. `CoachCard` and `InstructorChip` use them everywhere.
- **Everywhere else:** `PhotoSlot`, `PhotoThumb` and `ClassPhotoTile` are deleted. Each place uses `ClubArt`, `SpaceArt`, `SpaceGraphic`, `ClassGraphic`, `CoachMark` or `JournalArt`. The trial page's person photo and the journal photo caption were removed.

Checks: axe finds no violations and nothing overflows on 24 routes at 1440 px and 375 px. `tsc` passes, ESLint shows 0 errors and 13 warnings, and `pnpm build` prerenders 108 pages.

Open:
- The coach marks (bold line emblems with solid parts) and the 13 space art scenes now follow the base line and duotone style. The bespoke graphics still use the earlier filled style with the rib skyline.
- The web app and the iOS app do not use the exported SVGs yet.
- The club-space one-liners that are not in the club data need a copy review.

## Pass 8 (Nov 3): class detail pages

The class pages and the class-type pages are now the detail pages for `/classes`, as a club page is for `/clubs`. The type cards on `/classes` open the type page ("Explore Strength"), not an anchor further down. Every class name on either page opens the class page. The shared parts are in `components/sections/class-page.tsx`.

Both pages use the club page's forms, in the same order of questions:

| Club page | Class page | Type page |
| --- | --- | --- |
| Hero: name, city, Board, signature row | Hero: name, type and reach, Night orbit lit on the class's object, four facts (length, effort, group, first-class fit) | Hero: name, reach, Night hub of the type's class objects, four facts (classes, effort range, a week, first-class picks) |
| Section nav | Section nav (About, Times, Coaches, Plans, Questions, Similar) | Section nav (Classes, Times, Coaches, Plans, Questions, More types) |
| Spaces: sticky split | About: sticky split with a climb Rack, the class as a timed list of blocks, then "Bring" and "The club has" | Classes: sticky split with a cluster Rack, one row for each class |
| Classes: timetable and an aside | Times: timetable and an aside (clubs with weekly counts, the clubs without it, when in the day) | Times: the same, for the type |
| People | Coaches: the coach whose favourite this class is gives the quote | Coaches |
| Plans | Plans: the free first step, then each plan with one line for this class. A recovery slot lists Summit only | Plans |
| — | Questions | Questions |
| Nearby | Similar: four classes, same type first | More types |

A time slot (Lap Swim, Sauna + Plunge, Compression, Kids Club) has no timetable, no coaches and no 3-day pass action. Its page says how to book a time and leads with the tour.

Checks: `tsc` and Biome pass. All 28 class pages and 8 type pages fit 375 px with no sideways scroll. axe (WCAG 2.2 AA and best practice) finds no violations on two class pages and a type page at 1440 px, on one of each at 375 px, and on `/classes`.

## Nov 4: retired brand graphics removed

This note follows Pass 7. Pass 7 stays as a record.

- The `/graphics` specimen page is deleted. The route now gives 404.
- `components/brand/graphics/` now holds only the gym objects. These files are deleted: `lines.ts`, `sets.ts`, `art.ts`, `marks.ts`, `bespoke.ts` and `references.md`.
- These components are deleted: `SpaceGraphic`, `ClassGraphic`, `SpaceArt`, `CoachMark` and `BrandGraphic`. `engine.ts`, `paint.ts`, `serialize.ts` and `types.ts` keep only the parts that the objects use.
- `spaceObjects` in `objects.ts` now defines the space id type, `SpaceId`. `lib/club-spaces.ts` uses it. The stored ids did not change.
- `scripts/export-graphics.mjs` writes only `objects/` and `category/`. It no longer deletes the other folders in `../brand-graphics/svg/`.
- `../brand-graphics/svg/bespoke/` is deleted. The `space/`, `class/`, `coach/` and `art/` folders stay, because the iOS app still uses them.

Nov 4, later: the web app and the iOS app moved to the live graphics. The export script now also writes Night
Racks to `brand-graphics/svg/rack/` for iOS. The frozen `space/`, `class/`, `coach/` and `art/` folders and the
`SpaceGraphicId` alias are deleted.

## Nov 6: membership page

The membership page now uses the same parts as the clubs and classes pages: a hero with a row of four facts, the
section nav, lead-size heads, Sand and tint bands that alternate, and the Copper tour panel. The sections are in
`components/sections/membership-overview.tsx`.

| Section | Form | Job |
| --- | --- | --- |
| Hero | Split: copy, and the Steps (the three plans as rising steps, Ridge lit in Copper) | Every plan includes every class; move up when ready |
| Plans | `ClubsPlanCards` (no club key; the Clubs section shows it) | Price, where each plan works, what it holds |
| Clubs | Table: five clubs by classes, pool, courts, recovery, kids club, with the plan that opens each | Where each plan takes you |
| Classes | One big number, the eight types, each club's week as a bar | No class fees; what Trailhead and Ridge give |
| Family | Split with the family calculator | Add-ons and kids club clubs |
| Costs | Ledger: when you join, each year, only when you need it | Every fee up front |
| Compare | `PlanComparisonTable` | Exact rows |

Data (Supabase `plans` and `plan_comparison`, seed and live): Trailhead no longer promises a pool at the two clubs
without one. Courts and recovery name how many clubs have them. The comparison gained "Cancel" and names the kids
club clubs. The web app's change-plan table, the iOS perks and compare sheet, the trial page and the clubs page use
the same words. The footer's day pass link now goes to `#costs`.

Nov 6, later: an accessibility and layout pass on the membership page.

- **Hero steps:** the lit Ridge step had near-black text on Copper (3.5:1), because the theme clears Tailwind's
  palette and `text-white` did nothing. It now uses `--neutral-1` (4.9:1). Every step has a 2 px focus ring in the
  text colour, outside the step.
- **Plan columns:** the three plans sit in one card, so the Ridge fill ends inside rounded corners. Ridge has a
  Copper top bar and a 5% Copper wash. This also changes the plans on the club pages.
- **Clubs table:** the empty corner now labels the two head rows ("At the club", "Opens with"). Each object sits
  over its column name, and the club names keep to one line. Below lg each club is a short list, so nothing
  scrolls sideways.
- **Comparison table:** the head was `sticky` inside an `overflow-x-auto` box, so it stuck to the box and covered
  the first two rows. From md the table fits and does not scroll, so the head sticks to the window. Below md each
  row is a block with the three plans labelled. Not-included cells show a dash.
- **Class bars:** the track was `bg-muted` on the muted band, so it did not show. It is now a 12% mix of the text
  colour.

Checks: no text under WCAG AA contrast at 375, 768, 1024 and 1440 px (a computed scan of every text node in
`main`, with see-through backgrounds composited). No sideways scroll at those widths. axe did not run.

Nov 6, later still: the same fixes on the pages with matching sections.

- **`FactTable` and `FactStack`** (`components/sections/fact-table.tsx`): a table by row that never scrolls
  sideways. From its breakpoint it is a table with a labelled corner. Below it, each row is a block with each value
  under its column's name. Recovery by club (md) and Pools by club (lg) use it. Both tables scrolled sideways on a
  phone before, and the pools cells wrapped one word to a line.
- **Clubs, "Compare the clubs side by side":** the empty corner now says "At the club". From lg the table fits its
  card, so the sticky first column and the sideways scroll are gone. Below lg each club is a `FactStack` card.
- **Classes, "Every plan includes classes":** the four access cells sit in one card, as the membership plans do.
  Ridge has the Copper bar and wash. Its "Most popular" badge was `bg-muted` on the muted band and did not show; it
  is now the Copper tint.
- **"Most popular" and "Your club" badges** (clubs plans list, club rows, the header menu): link-coloured text on
  the Copper tint was 4.3:1. They now use the text colour.

Checks: the contrast scan finds nothing under AA on Home, Clubs, a club page, Classes, Membership, Recovery and
Aquatics at 1440 px, and on Clubs, Classes and Recovery at 375 px. No page scrolls sideways at 375, 1024 or 1440 px.

## Nov 7: Train pages

The five pages in the footer's Train column that the Nov 6 work did not reach (Personal training, Kids & family,
Pools & swim, Courts, Recovery) now use the parts of the membership, clubs and classes pages: a split hero with a
picture made for the page's claim and a row of four facts, the section nav, lead-size heads, Sand and tint bands
that alternate, the FAQ on a band, and the Copper tour panel to close. The old mix of `HeroSplit`, `LeadSection`,
`DenseSection`, `SplitSection`, `ClosingRow` and the Sand closing block is gone from these pages.

Shared parts, in `components/sections/program-page.tsx`: `ProgramHero`, `HeroFacts`, `NumberedSteps` (how it
works, at section size), `ProgramRows` (object, name, one line, a quiet aside, as on the clubs page),
`OfferColumns` (prices in one card, the lit one with the Copper bar and wash, as the plan columns) and `RuleList`.

Hero pictures, in `components/sections/program-heroes.tsx`. Each draws the page's data, with one part lit in Copper:

| Page | Picture | Lit |
| --- | --- | --- |
| Personal training | The Plan: the 12-pack as 12 session tiles | Every fourth session, the plan check |
| Recovery | The Cairn: the suite as stacked stones, in visit order | The sauna |
| Aquatics | The Gauge: each pool as a column as tall as its water temperature | The warm-water pool |
| Courts | The Count: every court as a tile, by club | The club with the most pickleball courts |
| Kids & family | The Span: each program as a bar on one age line | Kids club |

Data: the pool, court and kids club facts now come from the club data, and the program clubs from the class data,
so the pages agree with the club pages. Two lines changed because of this: Junior Pickleball now says 2 clubs and
Teen Strength says Val Vista & Warner (the old copy said 3 clubs and 2 clubs).

Checks: `tsc` and Biome pass. All five pages return 200 and none scrolls sideways at 375 px. I looked at each page at
1440 px and the heroes at 375 px.

- axe 4.11 (WCAG 2.2 A and AA, and best practice) finds no violations on the five pages at 1440 px and 375 px.
- The contrast scan (every text node in `main`, with see-through backgrounds composited) finds nothing under AA in
  light mode at 1440 px and 375 px.
- Dark mode was not checked as a pass. The site is light only (`defaultTheme="light"`, `enableSystem={false}`, no
  toggle). With the `dark` class forced on, the scan fails on these pages and on the membership page alike: the
  Night parts, the FAQ triggers and the Copper tour panel. Fix those before the site turns dark mode on.

Nov 7, later: the personal training page's "Find a coach" section is now `CoachFinder`
(`components/sections/coach-finder.tsx`). Every coach who takes clients shows at once as a visual card, with no
quote and no paragraphs: a coach mark (the initials on Night, or Copper for the first card, with the coach's object
cropped at the edge and a years tag), the name and credential, the specialties as chips (the category Tile in colour
when the specialty is a class category), "Trains at" with only the clubs the coach trains at, as a location list: the club map's pin with its number, then the club name, then
one "View profile" button. The per-card "Meet [name] free" action is gone: it read like a free session, and the
tour flow only knew coaches with a profile. One "Not sure who fits?" panel under the cards holds the tour action. The
hero and closing actions now say "Book a free tour" and link to `/tour` (the old `?coach=any` did nothing). A
visitor compares coaches by scrolling, with no clicks. The goals above the cards are an optional filter in the club
page's week form (one track, "Every coach" first, each goal with its object and count); a goal with no coach is left
out. One line under the track says what the picked goal is and how many coaches fit it. This replaces the separate
"Start with a goal" rows and the old four-card specialty filter, so the page has one less section. A first version
(a goal rail with one coach at full size and the rest as rows to click) was dropped: it took too many clicks to see
the coaches. axe finds no violations and the contrast scan finds nothing under AA in the section at 1440 px and
375 px, with every coach shown and with a goal picked.

## Nov 7: coach profile pages

The coach pages (`/coaches/<slug>`) are a profile, not one more program page: no hero facts and no section nav.
They keep the site's bands, heads, chips, plan columns and Copper tour panel. Parts are in
`components/sections/coach-profile.tsx`.

The order follows how a visitor sizes up a coach:

| Section | Form | Action |
| --- | --- | --- |
| Profile header | A Night cover with the coach's object oversized and cut by the frame, over the same object scattered at random, dimmed (seeded by the coach, so stable; about 0.4 of the cover's height each, at least 1.7 sizes apart, kept left of the oversized object; a scatter for each ratio: 2:1, 3:1, 4:1), the initials on a Copper badge over its lower edge, the name, credential and years, and the clubs as map pins | "Book a free tour" (asks for the coach), "See plans", a line to message the coach |
| How [name] coaches | The bio and the quote (when there is one) on the left; on the right, the specialties, each with its mark and one line on what it means for you. This is the only place the specialties are listed | — |
| Ways to train with [name] | The classes they lead (one row each, with the days and clubs from the timetable, the favorite tagged), then the steps: "One-on-one with [name]" (meet, plan, train, review) for a coach who takes clients, or "Your first class with [name]" (from the classes page's answers). Under the steps, only what they do not say: the packs and the price, or a line pointing to coaches who take clients | "See [name]'s week", "See the packs" |
| Where to find [name] | A card per club: pin, name, city and the club's line. No heading line: the header and the tour panel already say the tour asks for the coach | "Book a tour at [club]" (asks for the coach) |
| Join to train with [name] | The three plans, Ridge lit. The line names the clubs where the coach leads classes, because Trailhead covers one home club | "Join [plan]", "Compare plans" |
| More coaches | Up to three coach cards from the same clubs | "View profile", "See every coach" |
| Tour panel | Copper, with the tour link asking for this coach (`TourCTABand` takes a `tourHref`) | "Book a free tour" |

Band tones come from the section list, so they alternate for every coach. The old "Next with [name]" schedule strip
is gone: the class rows already say when.

Checks: `tsc` and Biome pass. All 31 coach pages return 200. axe finds no violations and the contrast scan finds
nothing under AA on Nadia Kowalski (classes and clients), Aisha Brooks (classes only) and Marcus Hale (clients only)
at 1440 px and 375 px, with no sideways scroll.

## Nov 10: am and pm

Times are written "8 am", "4:30 pm" and "10 am–12 pm" everywhere: the three apps' formatters and copy, the seed
data and the live Supabase rows, the specs and the persona checks. A time no longer ends in a full stop, so a
sentence that ends with one adds its own ("The club is open until 10 pm."). The web app's `endSentence` and iOS's
`endingSentence` do this; the drift check now flags any "a.m."/"p.m." that returns and any "pm..". Review and build
notes keep the old style, because they record what was true then.

## Nov 10: kids club hours

The hours band on `/kids` is `KidsClubHours` (`components/sections/kids-hours.tsx`): the week as day tiles (Sunday
dashed and marked closed), the day as a line of the four 2-hour blocks with the 12–4 pm break drawn as a hatched
gap (narrower than its four hours, so each block's time fits on one line; on a phone, two rows with the break
between), and the three clubs with a kids club as map pins. The rules are the headers of the parts they describe: "Monday
to Saturday" (playground) heads the day tiles, "Four 2-hour blocks" (stopwatch) heads the day line, and "Up to 2 per
child a day" (schedule) sits beside it. Day tiles and blocks share one tile: 56 px tall, 14 px semibold, same corners
and gaps. No explanatory lines under the rules or the clubs. The paragraph under the blocks is gone. "A parent stays in the building" stays in the next band's rules,
not repeated here. axe and the contrast scan pass at 1440 px and 375 px; no time label wraps or clips.

## Nov 10: kids club visit and swim school

- **How kids club works** (`KidsClubVisit` in `components/sections/kids-hours.tsx`): one real block, 4–6 pm, drawn
  as a line: a Copper 15-minute check-in window, the play time in Night, and a Copper 15-minute pick-up window after
  the reminder text. Under it, the three phases with their clock times: "Check in by 4:15" (a booked block with no
  check-in by then is released), "Play" (4:15–5:45), "Pick up by 6:00" (the text comes at 5:45). Beside it, "1:8" as a
  figure and the care checks as an icon list. This replaces three short steps that left the 15-minute and 1 hour 45
  rules abstract.
- **Swim school** (`SwimSchoolGuide` in `components/sections/swim-school.tsx`, on `/kids` and `/aquatics`): how
  lessons run as four figures (30 min a week, 6-week session, 4–6 children per coach, 1 club); the five levels as
  bars on one age line from 3 to 12, so a parent reads down from a child's age to the levels that fit, with the goal
  level lit; the two prices side by side with the note that the $19 add-on does not cover it; and how to start as
  three steps (ask for a spot, the free level check places the child, weekly lessons for the session). The class
  explorer keeps the compact `SwimFacts` and `SwimLevels`.

Checks: `tsc` and Biome pass. axe and the contrast scan pass on `/kids` and `/aquatics` at 1440 px and 375 px. On a
phone the block line shows only its start and end times; the phases give the rest.

## Nov 10: teens on /kids

`TeensGuide` (`components/sections/teens.tsx`), in the same form as the kids club and swim school bands above it:
"What opens up with age" as rising steps (13: Teen OK classes, courts if a parent allows; 14: lap lanes if a parent
allows; 16: the strength floor without a coach; 18: sauna and cold plunge, lit), from the teen rules in
00-foundation.md section 4 and the site FAQ. On a phone the steps turn sideways and widen with age, because four
columns are too narrow there. Beside them, the Teen Strength card (blurb; ages, length and group size; times by club
from the timetable). Under both, "Getting started" in three steps: add your teen to your plan (the child add-on
price), sign the waiver, your teen books Teen OK classes in the app. The share, tour and teen rules actions stay.
axe and the contrast scan pass at 1440 px and 375 px.

## Nov 10: About pages

The six pages in the footer's About column (About, Coaches, Journal, Careers, FAQ, Contact) now use the parts of the
Train and Membership pages: `ProgramHero` with a picture made for the page's claim and a row of four facts, the
section nav on the longer pages, lead-size heads, Sand and tint bands that alternate, and the Copper tour panel to
close. Careers ends on its hiring steps instead, because its reader is applying, not joining.

Hero pictures, in `components/sections/about-heroes.tsx`. Each draws the page's data, with one part lit in Copper:

| Page | Picture | Lit |
| --- | --- | --- |
| About | The Mark: the Rib Peak symbol, each rib labelled with its club and the year it opened | The ribs |
| Coaches | The Roster: coaches as initials and their object, most experienced first, with a count of the rest | The most experienced coach |
| Journal | The Cover: the latest note, which opens it | — (Night cover) |
| Careers | The Board: each open role with its department object and top rate | The newest role |
| FAQ | The Stack: each question group as a bar as long as its count | Getting started |
| Contact | The Day: club hours and, inside them, the hours a person answers | The desk hours |

Other changes:

- **About:** the story is a timeline of the five clubs (pin, name, city, the club's one line, its objects). "The rule
  we kept" is four `NumberedSteps`. The three leaders use the coach card's form. Neighbors are `ObjectTiles` (new in
  `program-page.tsx`: object and title only). The separate mark section and the stat tiles are gone; the hero holds both.
- **Coaches:** the grid uses the personal training `CoachCard`. The club filter is a track with the map pins; the
  specialty, class and "takes clients" filters stay. A new band compares classes ($0 with every plan) and one-on-one packs.
- **Journal:** every note is a card (`JournalCard`, also used under an article). The hero's note is left out under "All".
- **Careers:** roles are ruled rows with the department object, club, type, pay and "View role".
- **FAQ:** `FAQ_GROUPS` moved to `lib/labels.ts`, so the server page and the client explorer share the group order.
- **Contact:** each club is a card with its pin, address, phone and directions, after a lit member services card.
  The form sits in a card beside the other ways in.

Checks: `tsc` and Biome pass. No page scrolls sideways at 375 px. No text in a hero picture clips at 375 px or
1440 px. Each page has one h1 and no skipped heading levels. I looked at each page at 1440 px. axe and the contrast
scan did not run. Dark mode was not checked.

Nov 10, later: the two detail pages, in the same form. Parts are in `components/sections/detail-parts.tsx`.

- **Role (`/careers/<slug>`):** a split hero (back link, title, type, club and schedule, Apply and Share) beside the
  Role picture: the department object cropped on Night, and the role's pay as a Copper span on the line of every
  open role's pay. Facts: pay, type, team, posted date. Then "The work." (summary and duties), "What you bring" and
  "What you get" (`ObjectTiles`), "How we hire." (`HIRE_STEPS`, shared with `/careers`), "Other open roles."
  (`ProgramRows`) and one apply card.
- **Note (`/journal/<slug>`):** a split hero (back link, title, dek, author, Share) beside the note's object in a
  rounded frame. Facts: read time, parts, topic, date. The body keeps one reading column; each part has a large
  number over a rule, as `NumberedSteps` do, and the contents list uses the same numbers. The author card is the coach
  card's form, the 3-day pass is one Copper card, "Keep reading." uses the Journal cards, and the Copper tour panel
  closes the page.

Checks: `tsc` and Biome pass. All 8 role pages and all 6 notes return 200, with one h1 and no skipped heading levels.
No page scrolls sideways and no text or fact clips at 375 px or 1440 px. I looked at one role and one note at
1440 px. axe and the contrast scan did not run.

## Nov 10: About heroes, coach filters, Journal email panel

The owner asked for the About heroes to differ from the program pages' split hero and from each other, as the Home,
Classes and Clubs heroes do. `components/sections/about-heroes.tsx` now holds six heroes, each with its own layout,
built only from objects on discs (Night, pale, and one lit Copper disc):

| Page | Hero | Layout |
| --- | --- | --- |
| About | The Monument | Headline and line across the top; the Rib Peak mark itself on a ground line across the column, each club's object on a Night disc in an even row above the mark, joined to its rib by a dashed connector (straight, 45°, then straight down to a pin on the rib), its year and name under the line, Mesa and Gilbert at the two ends; no facts row (replaced the first "Ridge" of disc columns at the owner's request, keeping the logo) |
| Coaches | The Arch | Coach initials in an arch round a lit whistle, over a centred headline; the counts as one quiet line |
| Journal | The Masthead | A dateline between rules, "The Journal." across the column, the latest note as the cover story |
| Careers | The Dial | Copy and chips (clubs hiring, pay range, role types) on the left; the open roles on a ring round their count |
| FAQ | The Bubbles | Six real questions round a centred headline from xl (a list under it below xl); each opens its answer |
| Contact | The Switchboard | Headline and line side by side, then six call cards (member services lit, then each club) |

- **Contact:** the hours picture moved from the hero to its own band, "When a person answers.". "Visit a club."
  shows the address and directions only, because the hero now holds every phone number.
- **FAQ:** the explorer now follows `hashchange`, so a question link on the same page opens its group and answer.
  The bubbles are plain `<a>` links, because Next's `Link` changes the hash without a `hashchange` event.
- **Coaches:** the "N coaches, the most experienced first" line is gone. Under the club track is one toolbar:
  specialty, class and "Takes clients" on the left; "N of 31 coaches" and a sort (most experience, or name) on the
  right. Each active filter is a chip that removes it, with "Clear all".
- **Journal:** the tour panel and the email band are replaced by `NewsletterPanel`
  (`components/sections/newsletter-panel.tsx`): the tour panel's inset shape on Night, the promise, one line, the
  field and Subscribe on one line, three perks, and a preview of the next email (sender, subject, the lead note and
  three more). `NewsletterStrip` is now styled for that panel; it has no other user.
- `JournalCover`, `RibMark`, `CoachRoster`, `RoleBoard` and `QuestionStack` are deleted. `journalObject` is exported
  from `journal-art.tsx` for the discs.

Checks: `tsc` and Biome pass. On all six pages at 375, 768, 1024 and 1440 px, nothing scrolls sideways, nothing in
the hero clips or leaves the screen, and no heading level is skipped. From 1280 px to 1920 px the FAQ bubbles
overlap neither the copy nor each other. I tried the coach filters (club and "Takes clients": 5 of 31, two chips)
and a FAQ bubble (it opened "How do I cancel or freeze?" in Memberships). I looked at each hero at 1440 px. axe and
the contrast scan did not run, and I did not look at the heroes at phone width by eye.

## Nov 10: Journal article pages

- **Header:** a blog header in one reading column (back link, topic chip, title, line, byline with credential and Share), then the note's picture wide (21:9, 3:2 on a phone). The facts panel (`HeroFacts`) is gone.
- **Reading line:** under the picture, in place of the panel: the date, a hairline, one rib mark for each part (each a link to its part) and "N parts · N min read". See `ReadingLine` in `components/sections/detail-parts.tsx`.
- **Outline:** the "In this note" column shows only on a long note (more than 6 parts, or 10 min or more). Every current note is short, so each reads in one column with the reading line's marks as its outline.
- **Figures:** each note has two small figures between its parts, built from gym objects on discs, Night and Copper fills and the data face (`components/sections/journal-figures.tsx`, keyed by slug). Each repeats facts the note already states and has a one-sentence summary for screen readers. A new note with no entry reads as plain text.
- **In-note cards:** `NoteClass` (no category bar) and `NoteAuthor` (rounded Night tile, even padding) replace the compact class card and the flush author card.

## Nov 10: Careers role page

- **Header:** a posting header in the Journal note's form: back link, team and type chips, title, the role summary as the line, a posting line, then Apply and Share. The facts panel (`HeroFacts`) is gone.
- **Posting line:** `PostingLine` in `components/sections/detail-parts.tsx`: club, schedule and posted date as label-and-value pairs on one row, split by hairlines; two columns on a phone, with a long schedule on its own row.
- **Pay picture:** `RolePay` runs wide under the header: the department's object on the left and the pay on the line of every open role's pay on the right (stacked on a phone).
- **The work band:** the summary moved to the header, so the band no longer repeats it.

## Nov 10: One results toolbar

- **Shared part:** `components/sections/filter-bar.tsx` holds the coaches page's toolbar as parts: `FilterBar` (filters left behind a filter icon; count, sort, key or note right; between two hairlines), `ResultCount`, `SortSelect` and `ActiveFilters` (removable chips and "Clear all").
- **Moved onto it:**
  - Coaches (`coaches-client.tsx`): same look, now from the shared parts.
  - Careers roles (`careers-client.tsx`): club, department and type on the left; "N of M open roles" and a new sort (Newest, Highest pay) on the right; chips. The loose count line is gone.
  - Personal training coaches (`coach-finder.tsx`): the goal track stays; the bar carries the goal's line, "N of M coaches" and a new sort (Most experience, Name A to Z). The loose count sentence is gone.
  - Journal index (`journal-parts.tsx`): the topic tabs stay; the bar carries "N notes" and a new sort (Newest, Shortest read).
  - Class timetables: the schedule board's club select and tone key (`class-week.tsx`), and the "Next times at" select with its "Showing …" note (`club-class-table.tsx`, aquatics and recovery).

## Nov 10: Graphical and better-interface pass

- **Select edge, in the theme:** `select:default:part:control` rest `borderColor: neutral-6` and hover `neutral-8` in `components/graphical/theme.ts` (mirrored in `GUI.md`), so selects match the text fields. No override in `components/ui/controls.tsx`.
- **Contact topic chips:** the toggle group's own pressed fill; no `!important` override.
- **Review fixes:** the opened class row on the schedule board carries a "Selected" tag and `aria-current` (it was a fill only); filter chips hand focus on when removed; one "Clear filters" name; the job-alert and newsletter fields link their status line; the contact thank-you heading takes focus; the shared `Honeypot`; the city on its own line in the posting line; numbered part marks in the reading line; hiring steps as single titles; `text-lead` and a 16 px scroll margin in notes; `rounded-lg` for the figures and the newsletter preview (`rounded-xl` makes no CSS in this theme).
- **Radius:** the last `rounded-xl` uses are gone: `trial-flow.tsx` and `app-phone.tsx` take `rounded-lg`, and the no-op `sm:rounded-xl` in `club-page.tsx` is deleted.

## Nov 11: Hero stat rows

The owner asked which heroes need the row of facts at the foot. Home keeps its three facts: it is the one hero where they answer "what is it, and what does it cost to start". Every other row is gone. Each fact either repeated the hero or the page below, or now sits in the lede or the picture.

| Page | Where the facts went | Layout |
| --- | --- | --- |
| Membership | Prices are on the Steps; reach is in the lede; the offer heads the copy | Split; the Steps stand on the bottom rule |
| Classes | Class count in the lede; "208 classes a week" and "First at 5:30 am" pinned as tags on the Pick's schedule | Full-bleed Pick, taller |
| Kids | Clubs and price per child on the kids club bar | `mirror`: the Span left, the copy right |
| Aquatics | Lane and club counts in the lede | `band`: headline and copy side by side, the Gauge across the column on the floor |
| Courts | Slot length in the lede | `banner`: headline across, copy beside the Count |
| Recovery | Summit price and club count in the lede | `panel`: copy and Cairn in one tint panel |
| Personal training | Pack price heads the Plan; coach count in the lede | `split` |
| Fall offer | All four were in the headline, the lede or the terms | A ticket: the copy on a card, a Copper stub with the price, a perforation between |
| Coaches | Coach count and years in the lede; the stats line is gone | The Arch, unchanged |
| Club | The signature row repeated the Spaces section under it | Split, the copy set low against the Board |

`HeroFacts` and the `facts` prop of `ProgramHero` are deleted. `ProgramHero` takes `layout` (`split`, `mirror`, `band`, `banner`, `panel`).

## Nov 11: Home shows the whole site

The owner found that Home introduced the clubs, classes and plans well, but said little about kids club, the pools,
personal training, the app, the coaches, the brand or the Journal. Each gap now has a small place on Home that links
to its page. No gap got a large section of its own.

| Band | Change | Links to |
| --- | --- | --- |
| Classes (tint) | `HomeCoachLine` (`home-coaches.tsx`) closes the band: the six most experienced coaches as initials on Night, a Copper "+25" disc, and "Every class has a coach. 31 of them, with 225 years of coaching between them." | `/coaches` |
| New: "More than the gym floor." (Sand) | `HomeServices` (`home-services.tsx`): five cut object tiles in a stagger, kids club lit in Copper. Each has the name and one line of facts from the club data (lanes, courts, clubs, the lowest pack price). Below sm each is a row with the whole object | `/kids`, `/aquatics`, `/personal-training`, `/courts`, `/recovery` |
| Plans (now tint) | One line under the member pass: "Your pass, bookings and kids club live in the app." | `/app` |
| New: "Built for the East Valley since 2014." (Sand, top rule) | `HomeStory` (`home-story.tsx`): the four About rules as titles, the open roles, and the three newest Journal notes as rows | `/about`, `/careers`, `/journal`, each note |

The plans band is now tint, so the bands alternate again. The story band uses the `muted` tone (a top rule on Sand),
because the voices band above it is Sand and the band next to the tour panel stays Sand.

Checks: `tsc` and Biome pass. Home does not scroll sideways at 375 px. No heading level is skipped. Every new link
returns 200. I looked at the new parts at 1440 px and 375 px. axe and the contrast scan did not run.

Clubs hero, the same day: it keeps the centred copy and the Pull, but now takes the other heroes' measure. It is about 42rem tall from lg (it filled the first screen), its copy starts at the same top space as the split heroes, the objects are Night discs with Sand objects (they were pale tints), and the rings are hairlines in the border colour. The key stays the one lit disc, cut by the bottom rule. The wide field is placed again for the shorter box.
