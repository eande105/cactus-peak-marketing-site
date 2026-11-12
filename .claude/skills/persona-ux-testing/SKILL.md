---
name: persona-ux-testing
description: Run persona-based usability tests on the Cactus Peak marketing site, use the findings to improve its content and design, and check that new work keeps meeting what the visitors need. Use when asked to test the site with users or personas, run a usability or UX review, explore or validate a redesign or new content, check a change against visitor needs, re-test after fixes, or before shipping a change to navigation, pricing, schedule, clubs, kids, aquatics, membership, join, tour, trial, contact or careers pages.
---

# Persona usability testing for the marketing site

This skill helps the site get better. It has three jobs:

1. **Test.** Sonnet agents play the visitor personas and test the running site, a branch, or a new design.
2. **Improve.** Combine the findings, check them against the specs, and turn them into better content, design and data.
3. **Check alignment.** Make sure new work still meets each persona's needs, or meets them better.

The personas are fictional visitors. The facts they rely on come from `../specs/00-foundation.md`, mainly §4 and §4.1.
The baseline study is in `PERSONA-TESTS.md` (Nov 5, 2026).

## How to read these files

- **The needs are the contract. The current site is not.** Each persona file names what a visitor must be able to do or learn. For example, Marcus must be able to find his true first-year cost.
  - The pages, components, layouts, wording and nav labels named in these files describe how the site meets each need today. They are examples, not requirements.
  - You may redesign a page, rewrite copy, restructure the IA, or replace a component freely, as long as the visitor need is still met, or is met better.
- **Everything here can change on purpose.** You can edit a persona, add one, or retire one. You can update a task, a pass criterion, a need, a facts value, or a checklist line.
  - When a change replaces how a need is met, update the matching lines in the same change.
  - Run the affected personas, and record the reason in `PERSONA-TESTS.md`.
  - Drift means a need is lost by accident. It does not mean the site changed.
- **Facts follow the spec.** A price, an hour or a policy can change. Change it in the spec first, then in the data and on the site. The values written in these files are a snapshot from Nov 5, 2026.
- **Evidence beats these files.** If a new test, real-user data or a better method shows that a need or a principle here is wrong, follow the evidence. Then update the file.

## Files

| File | Use it for |
|---|---|
| `personas/README.md` | The cast, which personas suit which area, the test order, and how to add or change a persona. |
| `personas/marcus.md` … `personas/priya.md` | One persona each: profile, device, tasks, pass criteria, and the needs to protect. |
| `references/research-principles.md` | Method, metrics (SEQ, SUS, severity), heuristics, WCAG 2.2 checks, the agent protocol, and other methods you can use. |
| `references/report-template.md` | The report a test agent returns, and the synthesis format. |
| `references/drift-guard.md` | Where facts live, the change order, the needs checklist, and how to change a need on purpose. |
| `scripts/check-drift.mjs` | A fast smoke check against a running dev server. Broken links and bad data fail the check. Missing copy produces a "review" note, not a failure. |

## Choose the mode

- **Full study**: a new feature, a redesign, new content, or "test the site". Run all the personas. Follow the workflow below.
- **Design exploration**: compare two or more designs or copy versions.
  - Give each persona agent the same tasks on each version: a branch, a URL or a prototype.
  - Compare the task success rates, the SEQ scores and the quotes.
  - Let the result decide, not the current site.
- **Targeted check**: a change to one area. Look up the affected personas in the "Areas" table in `personas/README.md`. Run those personas on their tasks for that area. Add new tasks when the change adds something new.
- **Alignment check**: any change before a commit. Run `scripts/check-drift.mjs`, then walk the checklist in `references/drift-guard.md`. A "review" line is a prompt to check the need, not an error.

## Workflow

1. **Read** `references/research-principles.md`, `references/drift-guard.md` and the persona files you need.
2. **Start the site.** The dev server runs on port 3110 (`.claude/launch.json` at the git480 root). If a server already runs, use it. Open `/api/dev/revalidate` after any data change.
3. **Brief the agents.** Give each persona agent:
   - its persona file, and any new tasks for the work under test
   - the protocol in `research-principles.md`
   - the report template

   Send all the agents in one message, so they run in parallel. Use model `sonnet`.
4. **Wait for the reports.** Do not predict the results. Test agents return their report as text.
5. **Verify** the high-severity claims in the code, the data or the spec before you act on them.
   - Agents share one browser and one `cpa_club` cookie, so a "default club" finding can come from another agent's test.
   - A missing fact can be a spec gap, not a site bug.
6. **Combine the findings.** Deduplicate them. Rank them by severity and by how many personas they block. Then decide where each improvement goes:
   - **Content or design**: change `marketing-site/`. Choose the best solution. A finding names a problem; the fix it suggests is one option among several.
   - **Data**: change `../supabase/seed-data/*.json`, then regenerate `seed.sql`. Apply only the changed rows to the live project, because the full seed resets the demo households.
   - **Spec**: a business fact is missing or needs to change. Update `../specs/00-foundation.md` §4.1 first. Ask the user before you invent a price or a policy, unless the user already gave you that authority.
7. **Send an implementer agent** with a numbered plan and the working constraints in `drift-guard.md` §5.
8. **Review the diff yourself.** Then re-test with the affected personas. Use the original problem list as the checklist (Fixed, Partly, Not fixed, Regressed), and add new problems you find.
9. **Update the records.** Update `PERSONA-TESTS.md` and the scores. Update the persona files and `drift-guard.md` so they describe the new way each need is met.

## Safety rules (these protect shared systems, not the design)

- Do not press a final submit button in the tour, trial, join, contact, newsletter or job-alert forms. These forms insert rows into the shared live Supabase project. If you need to test a submit, use a test backend, or ask the user first.
- Each browser agent first calls `tabs_create`, then passes its own `tabId` on every call. At the end it resets the viewport and closes its tab.
- Test agents do not sign in, and they do not edit files. Only the implementer edits files.
- Do not run `git checkout`, `git stash`, `git reset` or `git clean`. The tree often holds the owner's uncommitted work.
