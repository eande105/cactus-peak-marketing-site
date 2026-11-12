# Marcus, 34: the comparison shopper

## Profile
- QA analyst. He just moved to the Chandler and Mesa border, ZIP **85224**.
- He pays $40 a month at a budget chain, and he is skeptical of "premium" gyms.
- He has three gym tabs open and gives each site about 5 minutes.
- He hates hidden fees, contracts and "call for pricing".
- He wants to lift and to take some cycle classes, after work from 6 to 7 pm.

**Device:** desktop, 1440x900. **Behavior:** he scans for numbers and reads the fine print. He leaves when a fact is vague.

## Voice
"No hidden fees, but show me the real first-year number." "Nice art. Where's the price?"

## Tasks
1. Find the club nearest ZIP 85224, and its distance.
2. Work out the first-year cost of the cheapest plan that opens two or more clubs, with all fees. Note where each number appears.
3. Find out how to cancel or freeze, and how much notice the club needs.
4. Find a strength class, or free lifting platforms, near 6 pm on a weekday at his nearest club.
5. Compare the three plans and pick one.
6. Go through `/join` up to payment. Do NOT press "Join and pay". Enter a bad email and leave a field empty, and judge the error handling and the price at each step.
7. Decide whether he books a tour, takes the pass, or leaves. Say why.

## Pass criteria
Judge each criterion by its outcome: did the persona get the answer, fast and without doubt? The pages, labels and controls named below are how the site delivers the answer today. A new design passes if it delivers the same outcome another way. The numbers copy the spec and the data as of Nov 5, 2026. When the spec or the data changes, update them here.
- Task 1 is done in 2 steps or fewer from `/clubs`. The result is Dobson & Southern, at about 4.6–4.8 mi.
- Task 2 gives Ridge at **$997**: 12 × $79, plus $49 facility fee, plus $0 enrollment through Nov 30. The plan cards show this total.
- Task 3 states the app or the front desk, 30 days' notice, and the effective date. It also gives the freeze terms: $10 a month, for 1 to 3 months.
- The join sidebar shows "First 12 months" on every step. The selected club in the sidebar matches the checked club.

## Needs to protect
Each line pairs a visitor need with how the site meets it today. The need is what matters. A redesign may meet it in a different way: a new layout, other wording, another component or a new page. When it does, rewrite the line to describe the new way, after a persona check confirms the need is still met.
- The plan cards show the price, "+ $49 annual facility fee (March)" and a first-year total.
- The join sidebar shows a "First 12 months" line, and its arithmetic is correct.
- `/clubs` has a ZIP finder at every width. The results sort by distance.
- The "How do I cancel?" answer is reachable from `/membership`.
- No testimonial makes a claim that the data contradicts. An example is free platforms at a club that has no platforms.
- A validation error clears as soon as the visitor fixes the field. On submit, focus moves to the error summary.

## History
- Baseline: SUS 72.5. Task 1 failed, because there was no desktop finder. The fee was hidden.
- After round 1: 82.5. Latest estimate: about 85.
