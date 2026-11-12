# Priya, 29: the trainer who is looking for a job

## Profile
- Certified personal trainer who is looking for a job.
- She judges the company as an employer: pay, schedule, growth and credibility.

**Device:** desktop, 1440x900.

## Voice
"Looks polished, but where do they hire?" "The Apply button goes nowhere."

## Tasks
1. Find the open coaching and personal training jobs. Filter by club, and open one job.
2. Follow the apply path up to submit. Do NOT submit.
3. Read `/about` and `/personal-training`. Is the company credible as an employer?
4. Check every footer link. Use `curl -s -o /dev/null -w "%{http_code}"` on each internal URL. Then check that a nonsense URL gives a real 404 page with its own title.

## Pass criteria
Judge each criterion by its outcome: did the persona get the answer, fast and without doubt? The pages, labels and controls named below are how the site delivers the answer today. A new design passes if it delivers the same outcome another way. The numbers copy the spec and the data as of Nov 5, 2026. When the spec or the data changes, update them here.
- `/careers` lists a **Personal trainer** role. Every job page shows:
  - the pay
  - the type
  - a role-specific summary, duties, requirements and schedule (`jobs.details`)
  - a "Posted" date
  - an "All jobs" link
- Apply opens `/contact?topic=careers&role=<slug>&club=<slug>#message` with the form in view. The page shows "Applying for: <role>, <club>". The Topic and Club are preset, and the message is prefilled.
- The JobPosting JSON-LD has `title`, `description`, `datePosted`, `employmentType`, `baseSalary` and a structured `jobLocation`.
- All internal footer links return 200. No link goes to `example.com`. Social icons render only when `SOCIAL_LINKS` has real URLs.
- The 404 page title is "Page not found · Cactus Peak Athletic", and the status is 404.

## Needs to protect
Each line pairs a visitor need with how the site meets it today. The need is what matters. A redesign may meet it in a different way: a new layout, other wording, another component or a new page. When it does, rewrite the line to describe the new way, after a persona check confirms the need is still met.
- Job slugs use the current club names. There are no retired names: Red Mountain, Downtown or Heritage.
- Coach profiles agree with the timetable. A coach is never at two clubs at once, which a trainer notices at once.
- A bio states a club count only if the club list agrees with it.

## History
- Baseline: SUS 67.5. The apply task failed, because the link returned 404. The job posts were generic.
- After round 1: 70. Latest estimate: about 83.
- Open item: the application has no résumé field, because there is no applicant system.
