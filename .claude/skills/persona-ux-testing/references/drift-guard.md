# Keep improvements aligned with the personas

This file helps the site change without losing what visitors need. **Drift** is a need that is lost by accident. Some examples:
- A price shows a different number on two pages.
- A coach is added to the timetable without a profile.
- A fix in code hides wrong data.
- A redesign removes the only path to an answer.

A deliberate change to the content, the design or the IA is not drift. The checklist in §3 describes how the site meets each need **today**. When you replace one of those ways with a better one, update the line (see §4).

## 1. Where facts live

| Kind of thing | Where it lives now | Read by |
|---|---|---|
| Business facts (prices, hours, rules, ages, policies) | `../specs/00-foundation.md` §4 and §4.1 | Everything below |
| Catalog data (clubs, coaches, timetable, FAQs, jobs, testimonials) | `../supabase/seed-data/*.json` → `seed.sql` → live Supabase | `lib/catalog/*` |
| Copy that repeats a fact on many pages | `lib/labels.ts` today: `kidsCostLine`, `PHONE_HOURS`, `SENIOR_LINE`, `SWIM`, `EFFORT`, `countOf` | Pages and components |
| Class times by club | `lib/class-times.ts` (from the timetable) | `/courts`, class pages |
| IA and nav decisions | `../specs/marketing-site/01-strategy-and-ia.md` §9.1, `02-navigation.md` | `components/site/nav-tree.tsx` |

You can reorganize these places. For example, you can move copy into the CMS or the seed, or split `labels.ts`. The principle to keep: **one fact, one place**. Then a change to a price or an hour reaches every page at once, and two pages cannot disagree.

## 2. Change order for facts and data

Copy, layout and design changes go straight into the code. A **fact** follows this order, so the spec, the data and the site stay in step:

1. Change the fact in the foundation spec. If the change is a new or different business decision, ask the user first.
2. Change the seed JSON, then regenerate the seed: `node supabase/scripts/generate-seed.mjs`. Upsert only the changed rows to the live project, because the full `seed.sql` truncates the demo households.
3. Refresh the dev cache (`/api/dev/revalidate`). If the slug list changed, touch `app/(site)/coaches/[slug]/page.tsx` or `careers/[slug]/page.tsx`.
4. Change how the site presents the fact, if needed.

Fix wrong data in the data, not with a `.replace()` in `lib/catalog/map.ts`. A code patch hides the error from the web app and the iOS app, which read the same database.

## 3. Needs checklist (how the site meets them today)

Each line names a need, then how the site meets it now. Check the **need**. A different design can meet it in another way.

### Finding things
- [ ] A class-goer finds the schedule in one click. *(Today: "Schedule" is a top-level nav item, and the Classes menu has "Full schedule".)*
- [ ] A member finds sign-in without opening the menu, on any device. *(Today: "Sign in" is in the header at every width.)*
- [ ] A visitor who wants a person finds a phone number and the hours it is answered. *(Today: member services in the desktop top bar, a club number on each club page, and `PHONE_HOURS`.)*
- [ ] A visitor finds the nearest club from a ZIP code, on any device, and sees what each club has. *(Today: the finder on `/clubs` and in the drawer, with amenity chips.)*
- [ ] A member has a self-service path that avoids sales pages. *(Today: "Already a member?" on `/membership`, and links to `/app`.)*
- [ ] Every link goes somewhere real, and an unknown URL gets a helpful 404 page with its own title. *(Today: no `example.com` links; social icons render only when `SOCIAL_LINKS` has real URLs.)*
- [ ] A call button calls the club the visitor is looking at. *(Today: `chrome.tsx` reads the club on the page.)*

### Facts are clear and consistent
- [ ] The kids price reads the same everywhere, and nobody can read it as both "extra" and "included". *(Today: `kidsCostLine`.)*
- [ ] The kids club hours show the midday gap and the closed day.
- [ ] Swim school: where it runs, the ages, the level by age, the price for members and non-members, and how a non-member enrolls. *(Today: `SWIM` and `components/sections/swim-school.tsx`.)*
- [ ] A price shopper sees the true first-year cost, with fees, before the payment step. *(Today: plan cards and the join sidebar.)*
- [ ] An older visitor finds the Medicare and senior-rate answer from the membership page. *(Today: `SENIOR_LINE` links to `/faq#medicare`.)*
- [ ] A pass holder knows how to book. *(Today: desk or phone, up to 1 day ahead, on `/trial`.)*
- [ ] A rehab visitor knows which pool each Aqua Fit class uses.
- [ ] A member knows which clubs have courts, and when open play runs at each club.

### Data integrity (these needs do not depend on design)
- [ ] Every coach in the timetable has a profile, and coach names lead to it.
- [ ] No coach is booked at two clubs less than 30 minutes apart (`FD §4.1`). No studio is double-booked.
- [ ] Each coach's classes and clubs match the timetable. Each bio makes only true claims.
- [ ] A category's intensity range equals the range of its classes.
- [ ] Testimonials make no claim that the data contradicts.
- [ ] The current club names are used everywhere. Red Mountain, Downtown and Heritage are retired.

### Interaction
- [ ] A visitor can share or reload a filtered schedule and get the same view. Back behaves the way the visitor expects. *(Today: URL state, and a pushed history entry for the open panel.)*
- [ ] The schedule's week view is readable on a tablet, and each item shows its time.
- [ ] Loading states end. A spots badge resolves or hides.
- [ ] A long form on a phone keeps its main action in reach and keeps progress when the visitor leaves. *(Today: a sticky Back/Next bar and `cpa_tour`.)*
- [ ] Errors appear when they help: inline after a field, and as a summary after a submit attempt. An error clears when the visitor fixes the field.
- [ ] Keyboard users never lose focus after a choice in a Select.
- [ ] A job seeker can apply without losing the role context.

### Layout and access (WCAG 2.2 AA)
- [ ] No horizontal page scroll at 375 px or at 640 px (200% zoom). Wide content scrolls in a focusable, labelled region.
- [ ] Tap targets are at least 24 px. Primary controls are about 44 px.
- [ ] The skip link works. Focus is always visible. Menus and dialogs return focus.

## 4. Changing a need, or how a need is met

1. Say what the change improves, and for which personas.
2. Run the affected personas on the new design, with tasks that exercise it. For a big change, compare the old and new designs (design exploration mode in `SKILL.md`).
3. If the need is still met, or met better, rewrite the matching "Today" note here and in the persona files.
4. If the evidence shows a need no longer matters, remove it. Write the reason in `PERSONA-TESTS.md`.
5. If `scripts/check-drift.mjs` checks the old way, update the script in the same change.

## 5. Working constraints for an implementer brief

These rules protect shared systems and other people's work. They do not limit the design.
- Read `AGENTS.md`, `GUI.md`, and `../specs/00-foundation.md` §4 and §4.1.
- Data changes go through the coordinator: report the problem, or follow §2 when the brief allows it.
- Do not run `git checkout`, `stash`, `reset` or `clean`. Do not commit unless the brief says so. Run `biome check --write` only on the files you changed.
- Use the running dev server on :3110 and your own browser tab. Do not press a final submit button.
- If a business fact is missing, report it. Do not invent it.
