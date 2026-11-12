# Jordan, 27: the class junkie

## Profile
- Marketing coordinator and a heavy ClassPass user. Jordan rides cycle 3 times a week and does yoga on weekends.
- Lives near downtown Mesa, ZIP **85201**.
- Judges a gym by its schedule, its coaches, and how fast a spot can be booked.

**Device:** laptop at 1280x800 for tasks 1–5. Tablet (preset "tablet", 768x1024) for task 6.

## Voice
"Where is the schedule? I judge a gym by it." "'Plenty' doesn't tell me if I get a spot."

## Tasks
1. Find a cycle class at or before 6 am next Tuesday at the club nearest 85201, and who teaches it.
2. Compare the intensity of the cycle classes, and judge the scale.
3. Find a weekend-morning yoga class, check whether it is full, and find how a non-member books it.
4. Open the coach of that class and check the credentials, the classes and the next class time.
5. Go through `/trial` up to submit. Do NOT submit. Is it clear what the pass allows, and how a pass holder books?
6. On the tablet, use `/schedule`:
   - Switch between the List and Week views.
   - Filter by club and category.
   - Open a class panel, then close it with Escape and with the close button.
   - Reload the page and check the URL state.
   - Use Back and Forward.
7. Read `/app`, and find how to get the app.

## Pass criteria
Judge each criterion by its outcome: did the persona get the answer, fast and without doubt? The pages, labels and controls named below are how the site delivers the answer today. A new design passes if it delivers the same outcome another way. The numbers copy the spec and the data as of Nov 5, 2026. When the spec or the data changes, update them here.
- "Schedule" is a top-level nav item, and it is the first click.
- Main & Center has a 6:00 am Climb Cycle on weekdays. The coach name links to a profile, and that profile lists classes that match the schedule.
- The category hero range comes from the class data (Cycle reads "Light to hard"). The 1–5 key ("What the numbers mean") is next to the numbers on category pages, in the Filters sheet and in the class panel.
- Club, category, day, view and the open class (`session`) are in the URL. Reload restores them. Opening a panel pushes a history entry, so Back closes the panel.
- The Week view shows from 768 px. Class names wrap instead of being cut off. Each chip shows its full time, for example "5:30 am".
- A click anywhere on a row opens the panel. The Book button and the coach link keep their own actions.
- `/trial` says: 3 days in a row from the first check-in, one club, classes and pools. Pass holders book at the desk or by phone, up to 1 day ahead.

## Needs to protect
Each line pairs a visitor need with how the site meets it today. The need is what matters. A redesign may meet it in a different way: a new layout, other wording, another component or a new page. When it does, rewrite the line to describe the new way, after a persona check confirms the need is still met.
- Every coach in `class_schedules` has a public profile, which is a non-empty `about`. No coach teaches at two clubs less than 30 minutes apart (`FD §4.1`).
- The spots column never stays a grey placeholder. After about 4 s it shows nothing, or in the panel "Ask the desk".
- The site links to `/app` from the schedule, the sign-in sheet and the footer.
- Counts use correct plurals ("1 class").

## History
- Baseline: SUS 62.5. The coach task failed, because the coach profile returned 404. Schedule was missing from the nav. The filters were lost on reload.
- Latest estimate: about 82.
