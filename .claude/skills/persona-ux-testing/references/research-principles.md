# UI/UX research and testing principles

These principles are a baseline for good studies. They do not limit what you test or how the site may look. Pick the method that answers the question in front of you, and update this file when a better practice applies.

## 1. Study design

- **Task-based tests, not opinion surveys.** Each persona has realistic tasks with a clear end state. A task names the goal ("find the price for a 9-year-old's swim lessons"), not the path ("open /kids").
- **Five to six personas find most problems.** One agent for each persona is enough for a formative test. Add agents for coverage, not for repetition.
- **Cover devices and access needs on purpose.** The cast must cover:
  - a phone (375 px)
  - a tablet (768 px)
  - a laptop or desktop
  - 200% zoom (640x400)
  - keyboard-only use
- **Two phases for every agent.** First, act **in character**: skim, follow the information scent, and give up after about 3 failed attempts. Then act as a **researcher**: inspect and measure. Do not read the source code to find a page the persona could not find.
- **Re-test with the same tasks, plus new ones.** After fixes, the original problem list is the checklist. A fix counts only when a persona completes the task. Add tasks for anything new, so the test covers the new design and not only the old one.

## 2. Protocol for each persona agent

1. **5-second test.** Take one screenshot of the home page at the persona's viewport. Record what the site is, who it is for, and the first action.
2. **For each task, record:**
   - **First click.** Was it on the right path? First-click success predicts task success.
   - **Path,** and the steps taken against the shortest path.
   - **Outcome:** Success, Success with difficulty, or Fail.
   - **SEQ (Single Ease Question):** 1 = very difficult, 7 = very easy. A score under 5 needs an explanation.
   - **Think-aloud quotes,** in the persona's voice. Keep them short and specific.
3. **Expert pass.**
   - Check the screens against Nielsen's 10 heuristics.
   - Check them against WCAG 2.2 AA where the persona needs it.
   - Check content and conversion practice:
     - Is the value proposition clear?
     - Is the information scent strong?
     - Does the call-to-action order make sense?
     - Is the pricing transparent?
     - Are there trust signals?
     - Is the form UX good?
     - Is the page easy to use with a thumb?
4. **SUS.** Answer the 10 standard items (1–5). For odd items, the score is the answer minus 1. For even items, the score is 5 minus the answer. Add all the scores and multiply by 2.5. A score of 68 is average. A score of 80 or more is good. The target is 80.

## 3. Severity scale (Nielsen, 0–4)

| Score | Meaning | Rule of action |
|---|---|---|
| 4 | Catastrophe: the task fails, the visitor reaches a dead end, or a link goes to the wrong place | Fix before shipping |
| 3 | Major: a key task fails or needs a workaround; conflicting facts | Fix in this round |
| 2 | Minor: friction, confusion, a slow path | Fix soon |
| 1 | Cosmetic | Fix when nearby |
| 0 | Not a problem | Record only |

Rank by severity first. Then rank by how many personas the problem blocks. Then rank by conversion impact.

## 4. Heuristics, with what they mean on this site

| # | Heuristic | Typical failure here |
|---|---|---|
| H1 | Visibility of system status | A filter is active but hidden. A spots badge stays on "Loading" forever. The sidebar does not match the selection. |
| H2 | Match with the real world | Club names are cross streets with no distance. "Fall climb" is a name without a meaning. |
| H3 | User control and freedom | Back leaves the page instead of closing a panel. Tour progress is lost. |
| H4 | Consistency and standards | The same fact is worded three ways (kids club price, hours, swim ages). |
| H5 | Error prevention | A wrong phone number. A preselected default that the visitor did not choose. |
| H6 | Recognition rather than recall | The intensity key sits on another page. The schedule is only in the footer. |
| H7 | Flexibility and efficiency | No ZIP finder. No deep links. Search misses synonyms. |
| H8 | Aesthetic and minimalist design | Pages are too long on phones. Text is repeated. |
| H9 | Help users recover from errors | A validation message stays after the fix. There is no inline message. |
| H10 | Help and documentation | The FAQ is missing the question that decides the visit (Medicare, swim price). |

## 5. WCAG 2.2 AA checks to run

- **1.4.3 Contrast:** at least 4.5:1 for body text and 3:1 for large text. Measure with `javascript_tool`.
- **1.4.10 Reflow:** at 640x400 there is no horizontal page scroll. Wide tables scroll inside a focusable, labelled region.
- **1.4.4 and 1.4.12:** text resizes and spacing changes without loss of content.
- **2.1.1 and 2.1.2 Keyboard:** everything works with the keyboard, and nothing traps the keyboard except a dialog, which returns focus when it closes.
- **2.4.1:** a skip link exists. **2.4.3:** the focus order is logical, and focus never falls to `<body>` after a widget closes. **2.4.7, 2.4.11 and 2.4.13:** focus is visible and not hidden by sticky bars.
- **2.5.8 Target size:** the minimum is 24x24 px. The site standard is 44 px for primary controls.
- **3.3.1 and 3.3.3:** errors are identified in text, with a suggestion. **3.3.7:** a multi-step flow does not ask for the same data twice.
- **4.1.2:** each control has a name and a role. Live regions announce errors and changing counts.

## 6. Content and conversion principles

- Each page answers the question the persona came with, above the fold or one tap away. A collapsed FAQ item does not count as the only answer to a deciding question.
- Each fact appears in one wording everywhere. That wording comes from the spec and the shared helpers.
- A price is never vague. Show the true first-year cost next to the monthly price.
- Every dead end offers a next step: a phone number, a tour, or a related page.
- A member or a job seeker must not have to go through sales pages to reach a self-service answer.

## 7. Other methods to use when they fit

Persona agents find usability problems quickly. Other questions need other methods:
- **Design exploration:** run the same tasks on two or more versions and compare success rates, SEQ scores and quotes (an A/B or preference test).
- **IA and labels:** use a tree test (can a visitor find X in the menu?) and a card sort (how would a visitor group these pages?).
- **Copy:** a 5-second test or a first-click test on a single screen. Check readability for the audience.
- **Visual design:** a preference test with reasons. Check the result against the brand rules in `../VISUAL-IDENTITY.md` and `GUI.md`.
- **Real users:** analytics, search logs, support questions and real moderated sessions beat simulated personas. Use them to update the personas.

## 8. Agent operating rules

- Use the built-in browser tools (`mcp__Claude_Browser__*`).
  - Call `tabs_create` first.
  - Pass your `tabId` on every call, including `javascript_tool`.
  - Use `resize_window` on your own tab.
  - At the end, reset to "desktop" and close the tab.
- The browser is shared. A cookie or `sessionStorage` value can come from another agent, for example `cpa_club` or `cpa_tour`. Say so when a finding may depend on that state, and clear your own test state at the end.
- Never press a final submit button. Use test data: "Test Persona", `test+persona@example.com`, 480-555-0199. You may open the `/…/confirmed` pages directly.
- Do not sign in to the member app (`:3200`), and do not edit files.
- Return the report as your final message. Subagents cannot write report files.
- Do not invent problems. Report what works as well.
