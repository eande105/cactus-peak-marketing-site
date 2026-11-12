#!/usr/bin/env node
// Smoke check for the needs in references/drift-guard.md. It is fast and shallow: it reads server HTML,
// the seed JSON and seed.sql. Persona agents still test behavior.
//
//   cd marketing-site && node .claude/skills/persona-ux-testing/scripts/check-drift.mjs [baseUrl]
//
// Two kinds of result:
//   FAIL    broken whatever the design is: a dead route or link, a wrong number, bad data, a grammar slip.
//   review  today's way of meeting a need was not found. After a redesign that can be fine: confirm the need
//           is still met (run the persona), then update this script and drift-guard.md.
// Exit code 1 only when something FAILs. A review never fails the run, so it never blocks a design change.

import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const BASE = (process.argv[2] ?? "http://localhost:3110").replace(/\/$/, "")
const here = path.dirname(fileURLToPath(import.meta.url))
const repo = path.resolve(here, "../../../../..") // .../cactus-peak
const seedDir = path.join(repo, "supabase/seed-data")

let failed = 0
const ok = (name) => console.log(`  ok    ${name}`)
const bad = (name, why) => {
  failed++
  console.log(`  FAIL  ${name}${why ? ` — ${why}` : ""}`)
}
const check = (name, cond, why) => (cond ? ok(name) : bad(name, why))
let reviews = 0
const review = (name, cond, hint) => {
  if (cond) return ok(name)
  reviews++
  console.log(`  review ${name}${hint ? ` — ${hint}` : ""}`)
}

const cache = new Map()
async function get(route) {
  if (cache.has(route)) return cache.get(route)
  const res = await fetch(BASE + route, { redirect: "follow" })
  const out = { status: res.status, html: await res.text() }
  cache.set(route, out)
  return out
}
// Visible-ish text: drop scripts and styles so copy checks do not match code.
const text = (html) =>
  html
    .replace(/<script[\s\S]*?<\/script>/g, " ")
    .replace(/<style[\s\S]*?<\/style>/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/\s+/g, " ")
    // Prices render as <span>$</span><span>79</span>; join them so "$79" matches.
    .replace(/\$ (?=\d)/g, "$")

const ROUTES = [
  "/", "/clubs", "/clubs/main-center", "/clubs/val-vista-warner", "/clubs/dobson-southern", "/schedule",
  "/classes", "/classes/category/aqua", "/classes/category/cycle", "/classes/category/court", "/coaches",
  "/membership", "/join/plan", "/kids", "/aquatics", "/courts", "/tour", "/trial", "/contact", "/faq",
  "/careers", "/about", "/personal-training", "/app",
]

console.log(`Persona drift check against ${BASE}\n`)

// Expected values come from the seed, so a price or rule change in the data never needs a script edit.
const W = JSON.parse(fs.readFileSync(path.join(seedDir, "web-app.json"), "utf8"))
const M = JSON.parse(fs.readFileSync(path.join(seedDir, "marketing-site.json"), "utf8"))
const seedSql = fs.readFileSync(path.join(repo, "supabase/seed.sql"), "utf8")
const constant = (key) => Number(seedSql.match(new RegExp(`\\('${key}', (\\d+)`))?.[1])

// ---------- 1. Routes respond ----------
console.log("Routes")
try {
  await get("/")
} catch {
  console.log(`  FAIL  dev server not reachable at ${BASE}. Start it first.`)
  process.exit(1)
}
for (const r of ROUTES) {
  const { status } = await get(r)
  check(`${r} → 200`, status === 200, `got ${status}`)
}
const nf = await get("/this-page-does-not-exist")
check("unknown URL → 404", nf.status === 404, `got ${nf.status}`)
check("404 has its own title", /<title>[^<]*not found/i.test(nf.html))

// ---------- 2. Links and chrome ----------
console.log("\nLinks and chrome")
for (const r of ROUTES) {
  const { html } = await get(r)
  if (/href="https?:\/\/(www\.)?example\.com/.test(html)) bad(`placeholder example.com link on ${r}`)
}
ok("no placeholder example.com links (every route)")
const home = await get("/")
const header = home.html.match(/<header[\s\S]*?<\/header>/)?.[0] ?? ""
review("schedule reachable from the header", header.includes('href="/schedule"'), "Jordan needs the schedule in one click")
review("sign-in reachable from the header", /sign in/i.test(header), "Derek needs sign-in without opening a menu")
review("a phone number on the home page", /\(\d{3}\) \d{3}-\d{4}/.test(text(home.html)), "Linda needs a person to call")

// ---------- 3. Facts ----------
console.log("\nFacts")
const t = async (r) => text((await get(r)).html)
const fee = constant("facility_fee")
const child = constant("child_addon")
const mem = await t("/membership")
// A first-year total that is shown must be right. Showing one at all is today's way to meet Marcus's need.
const expected = Object.values(W.plans).map((p) => 12 * p.price + fee)
const shown = [...mem.matchAll(/First year:? \$([\d,]+)/gi)].map((m) => Number(m[1].replace(/,/g, "")))
if (shown.length) {
  const wrong = shown.filter((n) => !expected.includes(n))
  check("first-year totals equal 12 × plan price + facility fee", !wrong.length, `wrong: ${wrong}; expected ${expected}`)
} else review("first-year cost visible on /membership", false, "Marcus needs the true first-year cost")
review(`facility fee ($${fee}) visible on /membership`, mem.includes(`$${fee}`), "Marcus needs every fee before payment")
review("Medicare or senior answer reachable from /membership", /medicare|senior/i.test(mem), "Linda's deciding question")
review("a self-service path for members on /membership", /already a member/i.test(mem), "Derek")
const kids = await t("/kids")
review(`child add-on price ($${child}) on /kids`, kids.includes(`$${child}`), "Ana")
review("a swim school price on /kids", /swim[\s\S]{0,600}\$\d+/i.test(kids), "Ana needs a swim price")
const noCourts = M.clubs.filter((c) => !c.has?.courts).map((c) => c.name)
const courtsText = await t("/courts")
review("/courts names the clubs without courts", noCourts.every((n) => courtsText.includes(n)), noCourts.join(", "))
review("/trial says how a pass holder books", /book/i.test(await t("/trial")), "Jordan")
review("phone hours stated on /contact", /\bam\b.{0,40}\bpm\b/.test(await t("/contact")), "Linda")

// ---------- 4. Copy errors across routes ----------
console.log("\nCopy")
const COPY = [
  [/\ba aqua\b/i, "'a aqua'"],
  [/\b1 (lanes|classes|spots|clubs)\b/, "plural after 1"],
  [/\b\d{1,2}(:\d{2})? [ap]\.m\./, "old a.m./p.m. style (use am and pm)"],
  [/\b[ap]m\.\./, "double period after am/pm"],
  [/\b(Red Mountain|Heritage)\b/, "retired club name"],
]
for (const r of ROUTES) {
  const s = await t(r)
  for (const [re, label] of COPY) if (re.test(s)) bad(`${label} on ${r}`, s.match(re)?.[0])
}
ok("copy patterns checked on every route")

// ---------- 5. Seed data integrity ----------
console.log("\nSeed data")
const dur = Object.fromEntries(Object.entries(W.classTypes).map(([k, v]) => [k, v.duration]))
const nameOf = Object.fromEntries(W.instructors.map((i) => [i.id, i.name]))
const profiles = new Map(M.coaches.map((c) => [c.name, c]))
const used = new Set()
const busy = new Map()
const studios = new Map()
for (const [club, rows] of Object.entries(W.schedules)) {
  for (const [key, time, days, studio, coach] of rows) {
    used.add(coach)
    const [h, m] = time.split(":").map(Number)
    const s = h * 60 + m
    const e = s + dur[key]
    for (const d of days) {
      const k = `${coach}|${d}`
      for (const [s2, e2, c2] of busy.get(k) ?? []) {
        const gap = c2 === club ? 0 : 30
        if (s < e2 + gap && s2 < e + gap) bad(`coach conflict: ${nameOf[coach]} day ${d} ${time} ${club} vs ${c2}`)
      }
      busy.set(k, [...(busy.get(k) ?? []), [s, e, club]])
      if (!/pool|court/i.test(studio)) {
        const sk = `${club}|${studio}|${d}`
        for (const [s2, e2] of studios.get(sk) ?? [])
          if (s < e2 && s2 < e) bad(`studio double-booked: ${club} ${studio} day ${d} ${time}`)
        studios.set(sk, [...(studios.get(sk) ?? []), [s, e]])
      }
    }
  }
}
ok("timetable conflicts checked")
for (const id of used) {
  const p = profiles.get(nameOf[id])
  if (!p || !p.bio) bad(`coach without a profile: ${nameOf[id]}`)
}
ok("every timetable coach checked for a profile")
for (const c of M.categories) {
  const xs = M.classTypes.filter((x) => x.category === c.id).map((x) => x.intensity)
  if (!xs.length) continue
  const lo = Math.min(...xs.map((x) => x[0]))
  const hi = Math.max(...xs.map((x) => x[1]))
  if (c.intensity[0] !== lo || c.intensity[1] !== hi) bad(`category range ${c.id}`, `${c.intensity} vs ${lo}–${hi}`)
}
ok("category intensity ranges checked")
const raw = JSON.stringify(M) + JSON.stringify(W.instructors)
check("no retired club names in seed copy", !/Red Mountain|Heritage/.test(raw))

// ---------- 6. Coach and job pages exist ----------
console.log("\nProfile and job pages")
for (const c of M.coaches) {
  const { status } = await get(`/coaches/${c.slug}`)
  if (status !== 200) bad(`/coaches/${c.slug} → ${status}`, "touch app/(site)/coaches/[slug]/page.tsx in dev")
}
ok(`${M.coaches.length} coach pages checked`)
for (const j of M.jobs) {
  const { status, html } = await get(`/careers/${j.slug}`)
  if (status !== 200) bad(`/careers/${j.slug} → ${status}`)
  else if (!/\/contact\?topic=careers/.test(html)) bad(`/careers/${j.slug} Apply does not open the contact form`)
}
ok(`${M.jobs.length} job pages checked`)

const tail = reviews ? ` ${reviews} item(s) to review: confirm each need another way, then update this script.` : ""
console.log(`\n${failed ? `${failed} check(s) failed.` : "No failures."}${tail}`)
process.exit(failed ? 1 : 0)
