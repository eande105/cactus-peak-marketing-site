# Cactus Peak Athletic marketing site: persona usability tests

Date: Nov 5, 2026. Site: dev server on port 3110. Testers: Sonnet agents in role, one agent for each persona.

## Method

Each persona ran a moderated-style test in the built-in browser, at its own viewport:

1. A 5-second test on the home page.
2. Task-based think-aloud tests. Each task recorded the first click, the path, the steps against the shortest path, the outcome and an SEQ score (1–7).
3. An expert pass against Nielsen's 10 heuristics, WCAG 2.2 AA and conversion best practice.
4. A System Usability Scale (SUS) score.

No tester pressed a final submit button, because the forms write to the live Supabase project.

The tests ran in three rounds: a baseline test, a re-test after round 1, and a final check after round 2. The SUS figures after the baseline are the testers' own estimates.

## Personas and scores

| Persona | Device | Main goal | SUS baseline | After round 1 | Final |
|---|---|---|---|---|---|
| Marcus, 34, price shopper (85224) | Desktop 1440 | Nearest club, true first-year cost, cancel terms, join flow | 72.5 | 82.5 | ~85 |
| Ana, 39, nurse with two kids (85295) | Phone 375 | Swim school, kids club, family price, Saturday tour | 75 | ~62 | ~85 |
| Linda, 67, after hip surgery, low vision | 1280 and 640 (200% zoom), keyboard | Warm-water class, accessibility, Medicare, a person to call | 65 | ~80 | ~80 |
| Jordan, 27, class-goer (85201) | Laptop 1280, tablet 768 | Schedule, coaches, intensity, 3-day pass | 62.5 | ~82 | ~82 |
| Derek, 45, Trailhead member | Phone 375 | Sign in, courts, holiday hours, call the club | 72.5 | ~80 | ~87 |
| Priya, 29, trainer looking for a job | Desktop 1440 | Jobs, apply, employer credibility | 67.5 | 70 | ~83 |

Ana's score fell after round 1 because swim school still had no price. The score rose after round 2, when the price was set in the spec and shown on the site.

## Main baseline findings, and what changed

| Finding (severity) | Change |
|---|---|
| "Call the club" on a club page dialled the visitor's saved club (3) | The sticky bar uses the phone number of the club on the page. |
| The Apply link went to `example.com` and returned 404 (4) | Apply opens the contact form with "Applying for…", the topic, the club and the message prefilled. Job posts are role-specific, show a posted date and have complete JSON-LD. There is a new personal trainer role. |
| Schedule coaches were missing from `/coaches`, and their profile links returned 404 (4) | Every group-class coach has a profile, and coach names link to it. The timetable no longer books a coach at two clubs at once. |
| There was no ZIP finder on desktop (3) | A ZIP finder is on `/clubs` at every width, with amenity chips. |
| Schedule was not in the main nav (3) | Schedule is a top-level item (six items: a deliberate deviation, see spec 01 §9.1). |
| The facility fee was hidden, and there was no first-year cost (3) | The plan cards and the join sidebar show the $49 fee and the first-year total. |
| Kids club price and hours conflicted between pages (3) | One sentence and one hours line, from `lib/labels.ts`. |
| Swim school, Medicare and pass booking had no answer (3) | New facts are in `../specs/00-foundation.md` §4.1. The site shows them on `/kids`, `/aquatics`, `/membership`, `/trial` and `/faq`. |
| The contact Select lost keyboard focus (3) | The trigger takes focus again as soon as the visitor makes a choice. |
| Tables broke at 200% zoom (2) | Contact rows stack as cards. Scroll regions are focusable and labelled. |
| Schedule state was not in the URL, and tablets had no week view (3) | Club, category, day, view and class are in the URL. Back closes the panel. The week view shows from 768 px. |
| Tour on phones: the Next button was far below the slots, and validation was weak (2) | There is a sticky Back/Next bar, the visitor's step is restored, and fields are validated when the visitor leaves them. |
| The phone header had no Sign in (3) | A Sign in link is in the header at every width. |

## Data and spec changes

- `../supabase/seed-data/*.json` and `seed.sql` changed. The live catalog was updated with targeted upserts. The demo households were not reset.
  - **Coaches:** 31 profiles. 22 timetable slots were reassigned, and there are 6 new instructors.
  - **Other data:** jobs, FAQs (including the new "Pools and access" group), club access lines, which pool each Aqua Fit class uses, the Cycle intensity range and one testimonial.
- `../specs/00-foundation.md` §4.1 "Visitor facts" is new. It covers:
  - swim school prices
  - Medicare and the senior rate
  - pass booking
  - phone hours
  - access
  - courts by club
  - the coach scheduling rule
- `../specs/marketing-site/01-strategy-and-ia.md` §9 and §9.1, and `02-navigation.md`, record the new facts and the IA deviations. The retired club names (Red Mountain, Downtown, Heritage) are gone from the marketing specs.

## Dev note

`/api/dev/revalidate` refreshes the cached catalog in development only. In production the route returns 404.

The routes `/coaches/[slug]` and `/careers/[slug]` use `dynamicParams = false`. To see a new slug in dev, touch the page file after the data changes.

## Open items

- **Business choices:** the facts in §4.1 are decisions made for the fictional brand during this test. Change them in the spec first, then in the seed and on the site.
- **Low-severity leftovers:**
  - Staff-name links in the schedule rows on club pages are 28 px tall. They pass the 24 px minimum but not the 44 px target.
  - The job application has no résumé field. There is no applicant system.
  - The mobile search dialog lets page text show through.
  - The accessible names of the category cards may include text from an inline style rule. This is not confirmed.
