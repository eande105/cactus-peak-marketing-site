# Report templates

## A. Persona agent report (first test)

```
# Persona: <name> (<device, viewport>)
## 5-second test
- What it is / who it is for / first action / quote
## Task results
| # | Task | First click | Path | Steps (actual/shortest) | Outcome | SEQ |
## What worked well
- <item> (<URL>)
## Problems
1. **<title>** (<URL> + element). What happened. Why it matters for <persona>.
   Heuristic/WCAG: <ref>. Severity: <0–4>. Evidence: <measurement or quote>. Fix: <suggestion>.
## Navigation & IA notes
## Section content notes
## User-flow notes (tour / trial / join / contact)
## SUS: <score> (items: a,b,c,d,e,f,g,h,i,j) — <one-line reason>
## Top 3 changes for this persona
## Not tested / caveats
```

Aim for 8–15 problems backed by evidence. Leave out nitpicks.

## B. Re-test report

```
| # | Original problem | Status now (Fixed / Partly / Not fixed / Regressed) | Evidence (URL, what you saw, measurement) |
## New problems found
| Sev | Problem | Fix |
## Updated SUS per persona — one line why
```

## C. Synthesis (written by the coordinator)

```
## Scores (table: persona | device | SUS before | after)
## Findings → change (table: finding (sev) | change | where: code / data / spec)
## Needs a business answer (facts missing from 00-foundation.md)
## Needs a seed change
## Open items (sev 0–2 leftovers)
```

Add the synthesis to `PERSONA-TESTS.md`. Update the "History" section of each persona file.
