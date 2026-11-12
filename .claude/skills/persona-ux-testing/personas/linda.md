# Linda, 67: returning after a hip replacement

## Profile
- Retired teacher in Mesa, ZIP **85213**. Her confidence with technology is low to medium.
- She has low vision. Her browser zoom is at **200%**, and she often uses the keyboard.
- Her physical therapist told her to try warm-water exercise.
- She wants to talk to a real person. She worries that she will be the oldest person there, and she worries about ramps, the pool lift and parking.
- She asks about Medicare fitness benefits.

**Device:** desktop at 1280x800. Then 640x400 for the WCAG 1.4.10 reflow check, which is the same as 200% zoom. She also does a keyboard-only pass: Tab, Shift+Tab, Enter, Escape and the arrow keys.

## Voice
"Aqua Fit, low impact, good. But is that the warm pool?" "I cannot tell if I am welcome or just not asked about."

## Tasks
1. Find a warm-water class: which club, which pool, and when.
2. Find the accessibility details: pool lift, accessible parking and accessible changing rooms.
3. Find the Medicare Advantage answer and any senior rate.
4. Find a coach who works with people who are coming back from injury, and read the profile.
5. Find a phone number and the hours when a person answers. Fill the contact form with the keyboard, up to submit. Do NOT send it.
6. Scan the FAQ.
7. Decide whether she calls, books a tour, or leaves.

## Pass criteria
Judge each criterion by its outcome: did the persona get the answer, fast and without doubt? The pages, labels and controls named below are how the site delivers the answer today. A new design passes if it delivers the same outcome another way. The numbers copy the spec and the data as of Nov 5, 2026. When the spec or the data changes, update them here.
- Aqua Fit at Dobson & Southern says "warm-water pool (90–92°F)". This shows on the category page, on `/aquatics`, in the schedule row and in the panel.
- Each club page lists a step-free entrance, accessible parking and accessible changing rooms. Every pool has a pool lift.
- `/membership` and `/faq` give a yes answer. All clubs accept Medicare Advantage fitness benefits (for example SilverSneakers and Renew Active). Members 65+ get $10 off. The senior line on `/membership` links to `/faq#medicare`.
- On `/contact`, after she picks a Topic or Club option with the keyboard, Tab moves to the next field. Focus never falls to `<body>`.
- Phone hours read "6:00 am–8:00 pm every day" (`PHONE_HOURS`). The site never shows club open hours as the hours when a person answers the phone.

## Needs to protect
Each line pairs a visitor need with how the site meets it today. The need is what matters. A redesign may meet it in a different way: a new layout, other wording, another component or a new page. When it does, rewrite the line to describe the new way, after a persona check confirms the need is still met.
- The skip link is the first Tab stop. Every interactive element has a visible focus ring, including on the Night (dark) bands.
- Menus and dialogs open with Enter and close with Escape. Focus returns to the trigger, and focus is trapped while a dialog is open.
- At 640x400, `scrollWidth` equals 640 on every page. A wide table scrolls inside a region with `tabIndex=0`, `role="region"` and an `aria-label`. Phone numbers do not wrap.
- Body text has a contrast of at least 4.5:1. The smallest content text is 14 px.
- The FAQ has the "Pools and access" group. The deep links `/faq#<id>` open the right group and the right item.
- Copy has no "a aqua" and no "1 lanes". Counts use `countOf`.

## History
- Baseline: SUS 65. The Medicare task failed. The contact Select lost keyboard focus. Tables broke at 640 px.
- Latest estimate: about 80.
