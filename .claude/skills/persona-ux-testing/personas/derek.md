# Derek, 45: the existing member

## Profile
- Trailhead member. His home club is **Main & Center**. He plays pickleball.
- He lands from a Google search on his phone. He wants a quick answer and gets annoyed by sales pitches.

**Device:** phone, 375x812 (preset "mobile").

## Voice
"This is selling to somebody else. Where do I log in?" "I tapped Call and got another club."

## Tasks
1. Find how to sign in to book a class. Note where the link goes, and do not sign in.
2. Find how to reserve a pickleball court, which clubs have courts, and the open-play times.
3. Find the Thanksgiving hours (Nov 26) at Main & Center.
4. Find the guest-pass rules for his plan, and how to upgrade to Ridge.
5. Find the club's phone number and address, and get directions.
   - Set-up step: first save Val Vista & Warner as "my club" in the menu.
   - Then open `/clubs/main-center`.
   - Check that the sticky "Call the club" button dials **(480) 555-0139**.
6. Find the cancel and freeze policy and the legal terms.

## Pass criteria
Judge each criterion by its outcome: did the persona get the answer, fast and without doubt? The pages, labels and controls named below are how the site delivers the answer today. A new design passes if it delivers the same outcome another way. The numbers copy the spec and the data as of Nov 5, 2026. When the spec or the data changes, update them here.
- "Sign in" shows in the phone header without opening the menu, and it is at least 44 px tall.
- `/courts` lists open play by club, with days and start times. Open play is at Power & McKellips and Val Vista & Warner. The page says Main & Center and Gilbert & Page have no courts, and that Ridge and Summit members play at the other three clubs.
- A class card never shows a range of start times as one window. An example is "9:30 to 10:00 am" for a 120-minute class.
- `/membership` has an "Already a member?" link to `/app`, both under the hero and under the plans.
- The sticky bar's `tel:` matches the phone number of the club on the page, not the saved club.

## Needs to protect
Each line pairs a visitor need with how the site meets it today. The need is what matters. A redesign may meet it in a different way: a new layout, other wording, another component or a new page. When it does, rewrite the line to describe the new way, after a persona check confirms the need is still met.
- `BottomActionBar` (`components/site/chrome.tsx`) reads the page's club from the catalog.
- Phone roles stay clear. Member services is (480) 555-0100. Each club page shows its own number (`FD §4`).
- On a club page, the holiday hours sit next to the regular hours.
- The courts amenity line matches the timetable (Dobson & Southern has clinics and drills, not open play).

## History
- Baseline: SUS 72.5. Sign in was hidden on phones. "Call the club" dialled the wrong club. The upgrade path was buried.
- Latest estimate: about 87.
