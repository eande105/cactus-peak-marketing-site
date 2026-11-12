# Persona tests: the single classes page (`/classes`)

Date: Nov 5, 2026 (a Thursday, evening). Mode: targeted check of the classes consolidation.
Method: `persona-ux-testing` skill. One tester drove one private browser tab (`tab-1`) on the dev server at
`http://localhost:3110`. No code was changed. No form was submitted. No sign-in.

Personas and class questions: `specs/marketing-site/classes-consolidation-brief.md` §1 and the persona files in
`.claude/skills/persona-ux-testing/personas/`.

## Test limits (read first)

- The Browser pane was hidden for the whole session. In a hidden pane, `requestAnimationFrame` does not run, and the
  smooth scroll (`html { scroll-behavior: smooth }`) does not move until a frame is painted. I took screenshots to
  paint frames. With frames, every deep link scrolled to the right place. Without frames, the page stayed at the top.
  This is a test artifact, not a site bug. The scroll timing and the scroll-spy state are not verified in a visible
  window. Re-check the items marked "verify visible" in a front tab.
- Another session edited `components/sections/class-explorer.tsx` during the test (the click listener moved to the
  capture phase and `closeRef` was added). I reloaded and re-tested the affected flow (F2) after the change.
- The shared browser holds a demo-member auth cookie from another session. The marketing header still showed
  "Sign in", so the cookie did not change what a visitor sees.
- `scripts/check-drift.mjs`: no failures, 1 review line ("schedule reachable from the header"). The script looks
  for `href="/schedule"`; the header now links to `/classes#schedule`. See F14.

## Entry points

| Entry | Lands on | Result |
|---|---|---|
| Header "Schedule" (desktop, from `/membership`) | `/classes#schedule`, board toolbar at the top, section nav hidden | Pass. The quick-path cards are cut in half above the toolbar (verify visible). The "Schedule" top link is not marked current; "Classes" is underlined. |
| Header Classes menu → "Cycle" | `/classes#type-cycle`, "Every class" head, Cycle tab selected | Pass |
| Classes menu → "All classes", "Full schedule" | `/classes`, `/classes#schedule` | Pass |
| `/schedule?club=dobson-southern` | 308 → `/classes?club=dobson-southern#schedule`. Club filter = Dobson & Southern | Pass |
| `/schedule?club=all&category=cycle&session=…` | 308 keeps the full query | Pass |
| `/classes/category/aqua` | 308 → `/classes#type-aqua`, Aqua tab selected, explorer head in view | Pass |
| `/classes/teen-strength` (phone) | 308 → `/classes#class-teen-strength`, Youth tab, row open, row at the top under the section nav | Pass |
| `/classes/nope` | 308 → `/classes#class-nope` (page top, no message) | Minor: an unknown class no longer gives a 404. |
| Club page `/clubs/val-vista-warner` "See full schedule" (phone) | `/classes?club=val-vista-warner#schedule`, board in view, section nav hidden | Pass |
| Schedule panel "See class details" | Nothing changes. Panel stays open, hash stays `#schedule` | **Fail** (F2) |

## Results by persona

### Ana, 39, nurse, parent (phone 375 px)

| Task | Result | Evidence |
|---|---|---|
| "Is there a 6 a.m. class at my club?" (from the club page, then "Before work") | Partial | Club entry kept Val Vista & Warner. "Before work" kept the club and set Early + Morning, but today's mornings were over: "No classes match those filters on Thursday." One more tap ("See Friday") showed 5:30 Rib Rack Strength, Masters Swim and 6:00 Climb Cycle. |
| "Is there something for my kid, and when?" ("For kids and teens") | Partial | Filter `club=all&category=youth` worked: Junior Pickleball 4:00 p.m. Swim School is in Aqua, so the kids path does not show it. The path also drops her club (`club=all`). |
| "Can I take a class while the kids are in kids club?" | Fail | The Kids Club row has no hours, no $19 add-on price and no link to `/kids`. It shows an effort meter ("Easy to light", "a light sweat") for child care. |
| Swim school level, price, non-member path | Pass | Swim School row: five levels with ages, $72 member child / $108 non-member, desk / phone / tour, "Book a tour to see swim school". But the row also offers "Try it with a free pass" (F1). |

Other: the "Tonight" card says "at any club" and sets `club=all`, so it drops the club she already picked (F5). On the
phone the schedule starts at about 4,100 px; the hero "Find a class" and the bottom bar "See times" both jump to it.
The mobile row truncates the club name ("Power & McK…"). The toolbar "Clear filters" link is cut at 375 px.

### Jordan, 27, class-goer (laptop 1280, tablet 768)

| Task | Result | Evidence |
|---|---|---|
| Cycle at or before 6 a.m. next Tuesday at Main & Center, and the coach | Pass | Header "Schedule" → club Main & Center → Tue 10 → Early: 6:00 a.m. Climb Cycle, Lena Ortiz. 4 clicks. |
| Judge the effort scale | Pass | Panel: "Intensity Hard, 4 of 5" + "What the numbers mean". Type header: "Light to hard". |
| Non-member books | Pass | Row "Book" opens "Sign in to book" with "Sign in", "New here? Try a free 3-day pass", "Join Cactus Peak". The panel's only button is "Book in the app"; it does not offer the pass. |
| Panel → coach → class details | Fail | Coach link goes to `/coaches/lena-ortiz` (pass). "See class details" does nothing (F2). |
| Spots | Partial | Panel says "Spots: Plenty". The persona voice rejects this ("'Plenty' doesn't tell me if I get a spot"). |
| Tablet 768: Week view, filters, URL state, Escape | Pass | `view=week` shows the Main & Center cycle grid with full times ("6 a.m. Climb Cycle"). Escape closes the panel and removes `session` from the URL. |
| Section nav hides while the schedule is in view | Pass | With the board in view the "On this page" bar is hidden; at "Every class" it shows with "Every class" current. (Scroll-spy timing: verify visible.) |

Other: "See times for X" always sets `club=all`, so it drops the club in view (F5). With a class filter the board
opens on today even if the class does not run today ("No classes match those filters on Thursday", button "See
Tuesday") (F4). The explorer rail does not follow the board's category (board on Cycle, rail on Strength).

### Linda, 67, keyboard only, 200% zoom (640 × 400)

| Task | Result | Evidence |
|---|---|---|
| Find a warm-water class: club, pool, when | Partial | Aqua Fit row: "Dobson & Southern: warm-water pool", Mon/Tue/Wed/Fri 9:00 a.m. The 90–92°F temperature is gone from the row (it is still in the schedule panel). Needs-to-protect drift (F6). |
| Keyboard path | Partial | The skip link is the first stop. The type cards add about 36 Tab stops before the schedule. After a quick path, focus goes to the `#schedule` section, so the next Tab is the first quick path again, not the results. After a deep link, focus stays on `<body>`. |
| Sticky chrome at 200% zoom | Fail (structural) | At 640 × 450: header 64 px + section nav 58 px on top, quick-actions bar 69 px at the bottom = 42% of the height. On the board: header 64 + toolbar 58 + sticky day-part heading 52 + bottom bar 69 = 54%. `scroll-padding-top` is 80 px (`globals.css:314`) and there is no `scroll-padding-bottom`, so a focused item can sit under the bars (WCAG 2.4.11). Verify visible. |
| No sideways scroll at 640 | Pass | `scrollWidth` = 640. |
| Find a coach for return to training | Partial | Rows say "Coached by Hannah Cole" as plain text. No coach section and no coach links on the class rows. Only the schedule panel links to a coach. |
| Tabs semantics | Minor fail | Each explorer tab's `aria-controls` points to an ID that does not exist (the panels were given `id="type-…"`). The tablist says `horizontal` but shows as a vertical rail from `lg`. |

### Daniel, 52, after knee surgery (desktop)

| Task | Result | Evidence |
|---|---|---|
| Which classes are gentle? | Pass | Effort key above the type cards; "Easy on the body" path (effort 1–2); Mobility 30 row: "Good before a lift or after surgery", "Pick this if you are coming back from an injury", times at all 5 clubs. |
| Is a first class safe for me? | Partial | "Good for a first class" lists Climb Cycle at "Hard, 4 of 5" next to Aqua Fit and Stretch & Release. A Hard class in this list sends a mixed message (F8). |
| Who will coach me? | Partial | See Linda. The type pages' coach section (`ClassPeople`) has no replacement (F9). |
| Phone number | Pass | "Call (480) 555-0100" in Questions; header phone on desktop. |

### Marcus, 34, price shopper (desktop 1440)

| Task | Result | Evidence |
|---|---|---|
| Are classes included, and where? | Pass | "Every plan includes classes." Trailhead "At your home club", Ridge "At all 5 clubs", Summit "+ recovery suite". FAQ repeats it. |
| True first-year cost from this page | Fail | `#plans` shows $54 / $79 / $129 per month only. No "+ $49 annual facility fee", no first-year total, no "Compare plans" link. Needs-to-protect: "The plan cards show the price, + $49 annual facility fee (March) and a first-year total" (F7). |
| Pushiness | Pass | One "Try a class free" in the section nav, one pass link per class row, three Join buttons in `#plans`. It reads as available, not pushed. |

### Jordan, 16, teen (phone)

| Task | Result | Evidence |
|---|---|---|
| "What is Teen Strength? Can I do it?" from an old shared link | Pass | `/classes/teen-strength` opens the row: ages 13 to 17, Hannah Cole, "Light to hard, 2 to 4 of 5", "Good first class", Val Vista & Warner Tue/Wed 4:30 p.m., what to bring. |
| Send it to a parent | Fail | No share or copy-link control on the row. The URL `/classes#class-teen-strength` works if copied by hand. |
| Next step | Partial | "Try it with a free pass" → `/trial`. The spec has no pass rule for under-18s (guest passes need 18+, or 16–17 with a waiver). The family path (`/kids`, `/join/family`) is not linked from the youth rows. |

### Derek, 45, member (phone)

| Task | Result | Evidence |
|---|---|---|
| Book a class | Pass | "Sign in" in the phone header. "Members book in the app" link (→ `/app`) above the board. "Book" opens "Sign in to book". |

### Pass / partial / fail summary

| Persona | Pass | Partial | Fail |
|---|---|---|---|
| Ana | 1 | 2 | 1 |
| Jordan 27 | 4 | 1 | 1 |
| Linda 67 | 1 | 3 | 2 |
| Daniel | 2 | 2 | 0 |
| Marcus | 2 | 0 | 1 |
| Jordan 16 | 1 | 1 | 1 |
| Derek | 1 | 0 | 0 |

## Fixes, by priority

Severity uses the scale in `references/research-principles.md` (3 = major, 2 = minor, 1 = cosmetic).

### Severity 3

1. **F1. The free pass is offered where the pass does not apply.** `components/sections/class-explorer.tsx:201`
   shows "Try it with a free pass" for every bookable class. The spec (`00-foundation.md` §4.1, "3-day pass") excludes
   courts and the recovery suite, and `/trial` says so. Wrong rows: Pickleball Open Play, Pickleball Clinic, Tennis
   Drills, Hoops Run, Junior Pickleball, Swim School, Teen Strength (and Stretch & Release, if it counts as recovery).
   Fix: derive the second action from the category and the age: courts → "See it on a free tour"; swim school → the
   existing "Book a tour to see swim school" only; youth → "Ask about a family plan" → `/kids`. The same applies to
   the "Good for a first class" pick Pickleball Clinic (`firstTimerShelf` in
   `supabase/seed-data/marketing-site.json:694`).
2. **F2. "See class details" in the schedule panel does nothing.** Evidence: after a click, the panel stays open and
   the hash stays `#schedule`; a capture listener sees `defaultPrevented = true`. The explorer's capture handler in
   `class-explorer.tsx` (`onClick`) calls `closeRef.current()` and sets `location.hash`, but the schedule panel is
   driven by the `session` URL param, and the board rewrites the URL with `#schedule`. Fix: in the handler, also clear
   the board's `session` (or let `ScheduleBoard` close its panel on `hashchange`), and do not let the board's URL sync
   rewrite a `#type-`/`#class-` hash. Re-test: the panel closes, the row opens, Back returns to the board.
3. **F7. Marcus loses the fee and the first-year cost.** `ClassAccess` in `components/sections/class-page.tsx:83`
   shows monthly prices only. Fix: add "+ $49 annual facility fee (March)" and the first-year total (from the same
   helper that `/membership` uses), and a "Compare plans" link → `/membership#compare`.
4. **F3. Sticky chrome covers too much at 200% zoom.** `app/globals.css:314` sets `scroll-pt-20` (80 px), but the
   chrome above content is 122 px (header + section nav) and 64 + 58 + 52 px on the board, plus a 69 px bottom bar.
   Fix: set `scroll-padding-top` from the real chrome height (a CSS variable that `SectionNav` and the board toolbar
   set), add `scroll-padding-bottom` for the quick-actions bar, and drop the sticky day-part heading
   (`schedule-board.tsx`, `sticky top-[112px]`) below `md` or at short heights. Verify in a visible window.

### Severity 2

5. **F4. Quick paths and "See times" can land on an empty day.** "Before work" in the evening and "See times for
   Teen Strength" on a Thursday both show "No classes match those filters". Fix in `ScheduleLink` /
   `ScheduleBoard`: when a filter is set from a link and today has no match left, open the next day with a match
   and say so ("Next: Friday").
6. **F5. Some links drop the club the visitor picked.** `class-paths.tsx` sets `club: mine?.slug ?? "all"` for
   "Tonight" and `club: "all"` for kids and water; `class-explorer.tsx` "See times for X" uses `club=all`. Fix: keep
   the board's current club when one is set; fall back to the saved club, then to all. Change the "Tonight" line to
   name the club in view.
7. **F6. Aqua Fit lost "90–92°F".** `poolLine` in `class-page.tsx` returns early in the per-studio branch (about
   line 55) and never adds the `warm` sentence. Fix: append the warm-water line in both branches, or write
   "warm-water pool (90–92°F)" in the per-club text.
8. **F9. No coach discovery on the page.** The type pages had `ClassPeople`. Fix: link the coach name in each class
   row to `/coaches/{slug}`, or add the brief's "Who leads classes" strip (§1.3 row 8) with a "Their times" link →
   `?coach={slug}#schedule`.
9. **F10. Kids Club row is not useful to a parent.** In `class-explorer.tsx`, for `kids-club`: show the hours
   (Mon–Sat 8 a.m.–12 p.m. and 4–8 p.m., Sunday closed), the $19 child add-on, and a link to `/kids`; hide the effort
   meter and the talk-test line. Hide the effort meter for Swim School too.
10. **F11. Kids path misses swim school.** Change "For kids and teens" to include Swim School (a `class` list or
    category `youth,aqua` limited to youth classes), or add Swim School to the line and the filter.
11. **F12. No share link for a class.** Add a "Copy link" / Web Share button to each open row in
    `class-explorer.tsx` with `/classes#class-{slug}` (Jordan 16 "Send this to a parent").
12. **F8. "Good for a first class" includes a Hard class.** Remove Climb Cycle from `firstTimerShelf`
    (`supabase/seed-data/marketing-site.json:694`) or label its effort beside a note that the coach scales it. Also fix
    the step "Book a spot. Classes open for booking 7 days ahead": a pass holder books at the desk or by phone up to
    1 day ahead (`00-foundation.md` §4.1). The FAQ "q-book" answer ("a coach books your first class with you") does
    not match that rule either (`app/(site)/classes/page.tsx`, `QUESTIONS`).
13. **F13. Keyboard focus after jumps.** After a quick path, move focus to the board results (or the toolbar), not
    to the `#schedule` section start. After a hash deep link, focus the target row's `<summary>`.

### Severity 1

14. **F14. Drift script.** `scripts/check-drift.mjs:96` checks for `href="/schedule"`. Update it to accept
    `/classes#schedule`, and drop `/schedule` from the route list at line 57 (it is now a 308).
15. **F15. Tab semantics.** In `class-explorer.tsx`, do not override the Base UI panel `id`; put `id="type-…"` on a
    wrapper, so `aria-controls` resolves. Set the tablist orientation to vertical from `lg`, so Up/Down move between
    types.
16. **F16. Small polish.** Mark the header "Schedule" link current on `/classes#schedule`. Land the "Schedule" jump
    so no half card shows above the toolbar. Let the explorer rail follow the board's category. Do not truncate the
    club name in phone rows. Keep "Clear filters" inside 375 px. Return a 404 for `/classes/<unknown>` (match the
    slug in a `has`-less redirect list, or keep `app/(site)/classes/[slug]` as a redirect page with `notFound()`).
17. **Spec question (ask the owner).** Can a 13–17-year-old use the 3-day pass? `00-foundation.md` §4.1 does not say.

## Needs-to-protect lines to update after the fixes

- `linda.md`: "Aqua Fit at Dobson & Southern says warm-water pool (90–92°F)… on the category page" → "on the Aqua Fit
  row in `/classes#class-aqua-fit`".
- `jordan.md`: "Schedule is a top-level nav item" → link is `/classes#schedule`; "Open a class panel… Back closes
  the panel" still holds; add "'See class details' opens the row".
- `drift-guard.md` line 39: the Classes menu has "Full schedule" → `/classes#schedule`.
