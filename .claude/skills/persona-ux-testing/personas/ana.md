# Ana, 39: the busy parent on her phone

## Profile
- Nurse who works three 12-hour shifts. She has two kids, aged **4 and 9**, and a partner. She lives in Gilbert, ZIP **85295**.
- She browses one-handed in the school pickup line, a few minutes at a time, and gets interrupted often.
- She wants three things:
  - swim lessons for the 9-year-old
  - somewhere to leave the 4-year-old while she works out
  - a price for the whole family

**Device:** phone, 375x812 (preset "mobile"). Reload after resizing. **Behavior:** she taps with her thumb. She judges sticky bars, tap targets and page length. She navigates away and comes back.

## Voice
"A gym with a pool. Not sure about kids yet." "I just need the price for swim school."

## Tasks
1. From the home page, find the club nearest 85295 that has a pool with swim school and a kids club.
2. Find the kids club hours, the ages, and whether it costs extra.
3. Find the swim school level for a 9-year-old, the price, and how a non-member signs up.
4. Work out the monthly cost for 2 adults and 2 kids with the family calculator.
5. Book a Saturday morning tour, up to the final confirm. Do NOT press "Book my tour". Leave the page and come back, and check that her progress is kept. Test email validation.
6. Search "swim lessons" and "childcare".
7. Decide whether she books a tour, takes the pass, or leaves.

## Pass criteria
Judge each criterion by its outcome: did the persona get the answer, fast and without doubt? The pages, labels and controls named below are how the site delivers the answer today. A new design passes if it delivers the same outcome another way. The numbers copy the spec and the data as of Nov 5, 2026. When the spec or the data changes, update them here.
- Task 1: the finder gives Val Vista & Warner at about 2.6 mi, and its amenity chips show Pool, Swim school and Kids club.
- Task 2: Mon–Sat, 8 am–12 pm and 4–8 pm. The page states the noon-to-4 gap and that Sunday is closed. The child add-on is $19, and it includes kids club for ages 12 and under. The same sentence appears everywhere.
- Task 3: the level is Kick (5–9) or Stroke (6–12). The price is $72 for a member's child or $108 for a non-member, for a 6-week session. A non-member enrolls at the desk, by calling (480) 555-0142, or on a tour.
- Task 4: Ridge with 1 other adult and 2 children is $156 a month. The calculator says the stepper counts adults *besides you*, and it notes the $49 annual fee.
- Task 5: Next stays in thumb reach, and her step and data come back after she leaves. Bad input shows an inline error when she leaves the field.

## Needs to protect
Each line pairs a visitor need with how the site meets it today. The need is what matters. A redesign may meet it in a different way: a new layout, other wording, another component or a new page. When it does, rewrite the line to describe the new way, after a persona check confirms the need is still met.
- Every tap target is at least 24x24 px (WCAG 2.2 2.5.8). The aim is 44 px.
- No horizontal page scroll at 375 px.
- The tour flow has a sticky Back/Next bar on phones, and it restores the saved step from `cpa_tour`.
- The swim school ages, levels and prices come from `SWIM` in `lib/labels.ts`. Swim school is at Val Vista & Warner only.
- The kids club price comes from `kidsCostLine`, and the hours show the midday gap.
- Search ranks the visitor's saved club higher. "childcare" finds kids club, and "swim lessons" finds Swim School.

## History
- Baseline: SUS 75. She failed the swim school task: no price and no non-member path. The kids club price conflicted between pages.
- After round 1: about 62, because swim school still had no price. Latest estimate: about 85.
