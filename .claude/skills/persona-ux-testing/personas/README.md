# The persona cast

These six personas are evidence-based archetypes from the Nov 5, 2026 study (`PERSONA-TESTS.md`). Each one stands for a real visitor segment. Each one covers a different device, goal and access need. Together they cover all three conversions: tour, 3-day pass and join. They also cover the two non-prospect visitors, members and job seekers.

| Persona | File | Segment | Device | Conversion | Baseline SUS | Latest SUS |
|---|---|---|---|---|---|---|
| Marcus, 34 | `marcus.md` | Skeptical price shopper | Desktop 1440x900 | Join or 3-day pass | 72.5 | ~85 |
| Ana, 39 | `ana.md` | Busy parent, family plan | Phone 375x812, one hand | Tour | 75 | ~85 |
| Linda, 67 | `linda.md` | Older adult, low vision, rehab | 1280x800, 200% zoom (640x400), keyboard | Phone call, then tour | 65 | ~80 |
| Jordan, 27 | `jordan.md` | Class-goer | Laptop 1280x800, tablet 768x1024 | 3-day pass | 62.5 | ~82 |
| Derek, 45 | `derek.md` | Existing member | Phone 375x812 | Self-service (no sale) | 72.5 | ~87 |
| Priya, 29 | `priya.md` | Job seeker (trainer) | Desktop 1440x900 | Job application | 67.5 | ~83 |

The baseline score is measured. The latest scores are tester estimates after two rounds of fixes. The target is SUS 80 or higher for every persona, with no task failure.

Note: the foundation spec (`FD §5`) has its own app personas (Maya, Daniel, Priya, Ron and Linda, Jordan the teen). These test personas are a separate set for the marketing site. They share some names. Do not merge the two sets.

## Areas: which personas to run for a change

| Area changed | Run |
|---|---|
| Header, nav, mobile drawer, footer | All. Derek and Linda first (sign in, keyboard). |
| `/clubs`, club pages, ZIP finder | Marcus, Ana, Derek |
| `/classes`, category pages, `/schedule`, class panel | Jordan, Linda (Aqua Fit) |
| `/coaches`, coach pages | Jordan, Linda, Priya |
| `/membership`, plan cards, family calculator, `/join/*` | Marcus, Ana, Derek (upgrade path) |
| `/kids`, `/aquatics`, swim school | Ana, Linda |
| `/courts` | Derek |
| `/tour`, `/trial` | Ana (tour), Jordan (trial) |
| `/contact`, `/faq` | Linda, Priya (apply) |
| `/careers/*`, `/about`, `/personal-training` | Priya |
| Search | Ana, Jordan, Derek |
| Seed data (coaches, schedule, FAQs, prices) | All personas whose needs or pass criteria use the changed data |

## Changing the cast

The cast is a tool for improving the site, not a fixed list.
- **Add a persona** when a new audience, feature or campaign appears, or when the site's content serves a visitor nobody tests. Examples: a corporate wellness buyer, a Spanish-speaking family, a visitor who only uses a screen reader. Copy the structure of an existing file: profile, device, voice, tasks, pass criteria, needs, history. Base the persona on evidence such as analytics, support questions or research, and say where the evidence comes from.
- **Change a persona** when the evidence changes: new devices, new goals, new questions people really ask.
- **Retire a persona** when its segment no longer matters. Move its needs that still apply to another persona, or note why they no longer apply.
- **Add or change tasks** for new work. A redesign of a page needs tasks that exercise the new design, not only the old ones.

Record each cast change in `PERSONA-TESTS.md`.

## Order to test in

1. Linda. Her keyboard, zoom and contrast checks find the defects that affect everyone.
2. Ana and Derek, the phone personas.
3. Marcus, Jordan and Priya, the desktop and laptop personas.

Run them in parallel when you can. Give each agent its own browser tab.
