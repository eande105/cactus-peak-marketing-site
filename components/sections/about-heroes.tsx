import Link from "next/link"
import { LinkButton } from "@/components/brand/atoms"
import {
  BrandMark,
  type ClubId,
  clubObjects,
  GymObject,
  type ObjectId,
} from "@/components/brand/graphics"
import { journalObject } from "@/components/brand/journal-art"
import { initials } from "@/lib/catalog"
import { fmtClock } from "@/lib/time"
import type { Club, Coach, Job, JournalEntry } from "@/lib/types"
import { cn } from "@/lib/utils"
import { Container } from "./common"
import { litFill, nightFill } from "./program-page"

/*
 * The heroes of the About pages (About, Coaches, Journal, Careers, FAQ, Contact). The Home, Classes and Clubs
 * heroes each have a layout of their own (the ascent panel, the paths to one disc, the orbits); these six follow
 * that idea, not the program pages' split hero. Each has its own layout, and each uses only the brand's objects on
 * discs: Night discs, pale passed-over discs, and one lit disc in Copper (VISUAL-IDENTITY.md, section 4).
 *
 * | Page    | Layout                                                            |
 * | ------- | ----------------------------------------------------------------- |
 * | About   | The Monument: the Rib Peak mark on a ground line, one club a rib  |
 * | Coaches | The Arch: coach discs in an arch over a centred headline          |
 * | Journal | The Masthead: the title across the page between rules, one note  |
 * | Careers | The Dial: the open roles on a ring around their count            |
 * | FAQ     | The Bubbles: real questions floating round a centred headline     |
 * | Contact | The Switchboard: a row of call cards, one tap to a person         |
 *
 * Contrast: white (`--neutral-1`) on Copper is 4.9:1 and Sand on Night is 12:1. Pale discs carry no text.
 */

/**
 * A disc: an object centred on a circle. `tone` picks the circle and the object's scheme together. `"mark"` puts
 * the Rib Peak mark in place of an object, for a disc that stands for the brand itself.
 */
function Disc({
  id,
  tone,
  className,
  style,
}: {
  id: ObjectId | "mark"
  tone: "lit" | "night" | "pale"
  className?: string
  style?: React.CSSProperties
}) {
  return (
    <span
      aria-hidden="true"
      style={style}
      className={cn(
        "grid shrink-0 place-items-center rounded-full",
        tone === "lit" && "bg-[var(--cat-strength)]",
        tone === "night" && "bg-night",
        tone === "pale" && "bg-muted",
        className
      )}
    >
      {id === "mark" ? (
        <BrandMark
          scheme={
            tone === "lit" ? "copper" : tone === "night" ? "night" : "sand"
          }
          className={cn("size-[58%]", tone === "pale" && "opacity-60")}
        />
      ) : (
        <GymObject
          id={id}
          scheme={
            tone === "lit" ? "copper" : tone === "night" ? "night" : "sand"
          }
          className={cn("size-[58%]", tone === "pale" && "opacity-60")}
        />
      )}
    </span>
  )
}

/* ---------- About: the Monument ---------- */

// The five ribs of the Rib Peak symbol (brand-guidelines.md), left to right, on its 256 × 256 grid. `x` is each
// rib's centre line and `edge` the height where that line meets the rib's top edge, where a connector lands.
const RIBS = [
  { d: "M12.53,230L12.53,222L42,170.96L42,230Z", x: 27.265, edge: 196.42 },
  { d: "M58,230L58,143.24L88,91.28L88,230Z", x: 73, edge: 117.26 },
  { d: "M104,230L104,63.57L128,22L152,63.57L152,230Z", x: 128, edge: 22 },
  { d: "M168,230L168,91.28L198,143.24L198,230Z", x: 183, edge: 117.26 },
  { d: "M214,230L214,170.96L243.47,222L243.47,230Z", x: 228.735, edge: 196.42 },
]
// The stage is one coordinate system for the disc row, the connectors and the mark. It is wider than the mark, so
// the row can spread past it: the mark sits in the middle 256 units, MARK_X from the left.
const STAGE_W = 340
const MARK_X = (STAGE_W - 256) / 2
const DISC_D = 40
// The row's centre line: far enough above the summit (y 22) that the shortest connector still reads as a path.
const ROW_Y = -42
// Each connector leaves its disc straight down to KNEE, runs at 45° to its rib's centre line, then drops to the rib.
const KNEE = -8
const STAGE_TOP = ROW_Y - DISC_D / 2 - 4
const STAGE_H = 230 - STAGE_TOP
const rowX = (i: number) => (STAGE_W * (i + 0.5)) / RIBS.length
const ribX = (i: number) => MARK_X + RIBS[i].x
const connector = (i: number) => {
  const from = rowX(i)
  const to = ribX(i)
  return `M${from},${ROW_Y + DISC_D / 2 + 3}V${KNEE}L${to},${KNEE + Math.abs(to - from)}V${RIBS[i].edge}`
}

/**
 * The Monument. The headline runs across the top with the line and the actions beside it. Under them the Rib Peak
 * mark stands on a ground line that crosses the whole column. Each rib is a club, in the order they opened. The
 * clubs' objects float in an even row above the mark, each on a Night disc, and a dashed connector runs from each
 * disc to its rib. The year and name sit under the ground line. The three Mesa clubs are on the left and the two
 * Gilbert clubs on the right, so each end of the line carries its city. No facts row: the mark carries the story.
 */
export function AboutHero({ clubs, lede }: { clubs: Club[]; lede: string }) {
  const byYear = [...clubs].sort((a, b) => a.opened - b.opened).slice(0, 5)
  const pctX = (x: number) => `${(x / STAGE_W) * 100}%`
  return (
    <section
      aria-labelledby="about-hero-title"
      className="overflow-hidden rule-b"
    >
      <Container className="pt-8 lg:pt-14">
        <div className="grid gap-6 lg:grid-cols-12 lg:items-end lg:gap-12">
          <h1
            id="about-hero-title"
            className="display-hero max-w-[12ch] text-balance lg:col-span-7"
          >
            Built for the East Valley.
          </h1>
          <div className="lg:col-span-5 lg:pb-2">
            <p className="lede max-w-[36ch] text-pretty text-muted-foreground">
              {lede}
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <LinkButton href="/clubs" size="lg" className="max-sm:flex-1">
                Find your club
              </LinkButton>
              <LinkButton
                href="/coaches"
                variant="outline"
                size="lg"
                className="max-sm:flex-1"
              >
                Meet the coaches
              </LinkButton>
            </div>
          </div>
        </div>

        <div
          role="img"
          aria-label={`The Cactus Peak mark: five ribs, one for each club, in the order they opened. ${byYear
            .map((c) => `${c.opened}, ${c.name}, ${c.city}`)
            .join("; ")}.`}
          className="relative mt-12 lg:mt-16"
        >
          {/* The ground line runs the whole column; the stage stands on it. */}
          <div aria-hidden="true" className="relative rule-b rule-heavy">
            <span className="absolute bottom-3 left-0 text-label text-muted-foreground max-sm:hidden">
              Mesa
            </span>
            <span className="absolute right-0 bottom-3 text-label text-muted-foreground max-sm:hidden">
              Gilbert
            </span>
            <div className="relative mx-auto w-full max-w-[40rem]">
              <svg
                viewBox={`0 ${STAGE_TOP} ${STAGE_W} ${STAGE_H}`}
                aria-hidden="true"
                className="block w-full"
              >
                <g transform={`translate(${MARK_X} 0)`}>
                  {RIBS.map((r) => (
                    <path key={r.x} d={r.d} fill="var(--color-1)" />
                  ))}
                </g>
                <g
                  fill="none"
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                  strokeLinejoin="round"
                  vectorEffect="non-scaling-stroke"
                  className="stroke-night"
                >
                  {RIBS.map((r, i) => (
                    <path
                      key={r.x}
                      d={connector(i)}
                      vectorEffect="non-scaling-stroke"
                    />
                  ))}
                </g>
                {/* A pin where each connector lands on its rib. */}
                {RIBS.map((r, i) => (
                  <circle
                    key={r.x}
                    cx={ribX(i)}
                    cy={r.edge}
                    r={2.5}
                    className="fill-night"
                  />
                ))}
              </svg>
              {byYear.map((c, i) => {
                const id =
                  clubObjects[c.slug as ClubId]?.[0] ?? ("location" as ObjectId)
                return (
                  <Disc
                    key={c.slug}
                    id={id}
                    tone="night"
                    className="absolute aspect-square -translate-1/2 ring-4 ring-background"
                    style={{
                      left: pctX(rowX(i)),
                      top: `${((ROW_Y - STAGE_TOP) / STAGE_H) * 100}%`,
                      width: pctX(DISC_D),
                    }}
                  />
                )
              })}
            </div>
          </div>
          {/* Each club under its rib. */}
          <ol
            aria-hidden="true"
            className="relative mx-auto h-20 max-w-[40rem] sm:h-24"
          >
            {byYear.map((c, i) => (
              <li
                key={c.slug}
                style={{ left: pctX(ribX(i)) }}
                className="absolute top-3 w-[13%] -translate-x-1/2 text-center"
              >
                <span className="tabular block font-data text-label font-bold sm:text-h3">
                  {c.opened}
                </span>
                <span className="mt-0.5 block text-caption text-balance text-muted-foreground max-sm:hidden">
                  {c.short}
                </span>
              </li>
            ))}
          </ol>
        </div>
      </Container>
    </section>
  )
}

/* ---------- Coaches: the Arch ---------- */

/**
 * The Arch. Coaches stand in an arch over the headline, like a team photo: the most experienced in the middle,
 * each as their initials on a Night disc, the discs overlapping a little, with the Rib Peak mark lit at the top of
 * the arch. The copy and the actions are centred under it. The counts that matter sit in the lede, so no stats line
 * closes the hero.
 */
export function CoachesHero({
  coaches,
  years,
}: {
  coaches: Coach[]
  /** Years of coaching across every coach. */
  years: number
}) {
  // The middle of the arch is the whistle, then the coaches alternate out from it, most experienced first.
  const side = coaches.slice(0, 12)
  const left = side.filter((_, i) => i % 2 === 1).reverse()
  const right = side.filter((_, i) => i % 2 === 0)
  const arch: (Coach | null)[] = [...left, null, ...right]
  const mid = left.length
  return (
    <section
      aria-labelledby="coaches-hero-title"
      className="overflow-hidden rule-b"
    >
      <Container className="pt-10 pb-12 text-center lg:pt-14 lg:pb-16">
        <div
          role="img"
          aria-label={`${coaches.length} coaches, including ${side
            .slice(0, 3)
            .map((c) => c.name)
            .join(", ")}.`}
          className="flex h-[calc(var(--a)*2.6)] items-start justify-center"
          style={
            { "--a": "clamp(2.75rem, 6.5vw, 4.75rem)" } as React.CSSProperties
          }
        >
          {arch.map((c, i) => {
            const off = Math.abs(i - mid)
            const y = `calc(var(--a) * ${(off * off * 0.045).toFixed(3)})`
            const scale = Math.max(0.7, 1 - off * 0.05)
            const style = {
              marginTop: y,
              width: `calc(var(--a) * ${c ? scale : 1.45})`,
              height: `calc(var(--a) * ${c ? scale : 1.45})`,
            }
            // Below sm only the middle seven show, so the arch keeps its shape on a phone.
            const hide =
              off > 5 ? "max-lg:hidden" : off > 3 ? "max-sm:hidden" : ""
            return c ? (
              <span
                key={c.slug}
                aria-hidden="true"
                style={style}
                className={cn(
                  "font-display-wide -mx-1 grid shrink-0 place-items-center rounded-full bg-night text-night-foreground ring-4 ring-background",
                  hide
                )}
              >
                <span className="text-[calc(var(--a)*0.3)] leading-none">
                  {initials(c.name)}
                </span>
              </span>
            ) : (
              <Disc
                key="mark"
                id="mark"
                tone="lit"
                style={style}
                className="relative z-10 -mx-1 ring-4 ring-background"
              />
            )
          })}
        </div>
        <h1
          id="coaches-hero-title"
          className="display-hero mx-auto mt-6 max-w-[14ch] text-balance"
        >
          Coaches who know your name.
        </h1>
        <p className="lede mx-auto mt-5 max-w-[40ch] text-pretty text-muted-foreground">
          {coaches.length} coaches, with {years} years of coaching between them.
          Every class has one, not a screen.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <LinkButton href="#coaches" size="lg" className="max-sm:flex-1">
            Find your coach
          </LinkButton>
          <LinkButton
            href="/tour"
            variant="outline"
            size="lg"
            className="max-sm:flex-1"
          >
            Book a free tour
          </LinkButton>
        </div>
      </Container>
    </section>
  )
}

/* ---------- Journal: the Masthead ---------- */

/**
 * The Masthead, as a magazine's cover page: a dateline between rules, the title across the whole column at poster
 * size, then the latest note as the cover story (its object on a large Night disc, the topic and date, the title
 * and its line). No picture box and no facts: the type is the picture.
 */
export function JournalHero({
  latest,
  author,
  count,
}: {
  latest?: JournalEntry
  author: string
  count: number
}) {
  return (
    <section aria-labelledby="journal-hero-title" className="rule-b">
      <Container className="pt-8 pb-12 lg:pt-12 lg:pb-16">
        <p className="tabular flex flex-wrap justify-between gap-x-6 gap-y-1 py-3 text-label rule-y rule-heavy">
          <span>No. {count}</span>
          <span className="max-sm:hidden">Training notes from our coaches</span>
          <span>Mesa and Gilbert</span>
        </p>
        <h1
          id="journal-hero-title"
          className="display-poster mt-4 whitespace-nowrap"
        >
          The Journal.
        </h1>
        <div className="mt-6 grid gap-10 pt-8 rule-t lg:mt-8 lg:grid-cols-12 lg:gap-12 lg:pt-10">
          <div className="lg:col-span-4">
            <p className="lede max-w-[32ch] text-pretty text-muted-foreground">
              Written in Mesa and Gilbert, in the heat. One note a month, by
              email if you want it.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <LinkButton
                href="#notes"
                variant="outline"
                size="lg"
                className="max-sm:flex-1"
              >
                Every note
              </LinkButton>
              <LinkButton
                href="#email"
                variant="ghost"
                size="lg"
                className="max-sm:flex-1"
              >
                Get it by email
              </LinkButton>
            </div>
          </div>
          {latest ? (
            <article className="relative grid gap-6 sm:grid-cols-[auto_minmax(0,1fr)] sm:items-center lg:col-span-8">
              <Disc
                id={journalObject(latest.slug)}
                tone="night"
                className="size-28 sm:size-40 lg:size-48"
              />
              <div>
                <p className="tabular text-label text-muted-foreground">
                  Latest · {latest.cat} · {latest.date}
                </p>
                <h2 className="font-display-wide mt-2 text-h2 text-balance lg:text-h1">
                  <Link
                    href={`/journal/${latest.slug}`}
                    className="no-underline after:absolute after:inset-0 hover:underline"
                  >
                    {latest.title}
                  </Link>
                </h2>
                <p className="mt-3 max-w-[52ch] text-body text-pretty text-muted-foreground">
                  {latest.dek}
                </p>
                <p className="mt-3 text-label">
                  By {author} · {latest.min} min read
                </p>
              </div>
            </article>
          ) : null}
        </div>
      </Container>
    </section>
  )
}

/* ---------- Careers: the Dial ---------- */

/** The object for each department. A new department falls back to the whistle. */
export const DEPT_OBJECT: Record<string, ObjectId> = {
  Coaching: "whistle",
  Aquatics: "pool",
  "Kids club": "playground",
  "Front desk": "key",
  Facilities: "towel",
}

/** The pay range's low and high ends, from "$22–$30 an hour". Undefined when the text has another shape. */
export function payEnds(pay: string): [number, number] | undefined {
  const m = pay.match(/\$(\d+(?:\.\d+)?)\s*[–-]\s*\$(\d+(?:\.\d+)?)/)
  return m ? [Number(m[1]), Number(m[2])] : undefined
}

/**
 * The Dial. The copy is on the left with the perks as chips under the actions. On the right, each open role is a
 * disc with its department's object on a ring, like the hours on a clock, around the number of open roles. The
 * newest role is lit.
 */
export function CareersHero({
  jobs,
  perks,
}: {
  jobs: Job[]
  perks: { label: string; icon: ObjectId }[]
}) {
  const ring = jobs.slice(0, 12)
  return (
    <section
      aria-labelledby="careers-hero-title"
      className="overflow-hidden rule-b"
    >
      <Container className="grid gap-12 pt-8 pb-12 lg:grid-cols-12 lg:items-center lg:gap-16 lg:pt-14 lg:pb-16">
        <div className="lg:col-span-6">
          <h1
            id="careers-hero-title"
            className="display-hero max-w-[10ch] text-balance"
          >
            Help people climb.
          </h1>
          <p className="lede mt-5 max-w-[38ch] text-pretty text-muted-foreground lg:mt-6">
            We hire coaches, lifeguards, kids club staff and front desk teams
            for 5 clubs in Mesa and Gilbert.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <LinkButton href="#roles" size="lg" className="max-sm:flex-1">
              See open roles
            </LinkButton>
            <LinkButton
              href="#hire"
              variant="outline"
              size="lg"
              className="max-sm:flex-1"
            >
              How we hire
            </LinkButton>
          </div>
          <ul aria-label="What you get" className="mt-10 flex flex-wrap gap-2">
            {perks.map((p) => (
              <li
                key={p.label}
                className="flex items-center gap-2 rounded-full bg-muted py-1 pr-3.5 pl-1 text-label"
              >
                <span className="grid size-7 place-items-center rounded-full bg-card">
                  <GymObject id={p.icon} className="size-5" />
                </span>
                {p.label}
              </li>
            ))}
          </ul>
        </div>
        <div
          role="img"
          aria-label={`${jobs.length} open roles: ${ring.map((j) => j.title).join(", ")}.`}
          className="relative mx-auto aspect-square w-full max-w-[30rem] lg:col-span-6"
        >
          <span
            aria-hidden="true"
            className="absolute inset-[11%] rounded-full border-2 border-dashed border-border"
          />
          <span
            aria-hidden="true"
            className={cn(
              "absolute inset-[30%] flex flex-col items-center justify-center rounded-full text-center",
              nightFill
            )}
          >
            <span className="tabular font-data text-figure-lg">
              {jobs.length}
            </span>
            <span className="mt-1 text-label text-night-muted">open roles</span>
          </span>
          {ring.map((j, i) => {
            const a = (-90 + (i * 360) / ring.length) * (Math.PI / 180)
            return (
              <Disc
                key={j.slug}
                id={DEPT_OBJECT[j.dept] ?? "whistle"}
                tone={i === 0 ? "lit" : "night"}
                className="absolute size-[17%] -translate-1/2 ring-4 ring-background"
                style={{
                  left: `${50 + 39 * Math.cos(a)}%`,
                  top: `${50 + 39 * Math.sin(a)}%`,
                }}
              />
            )
          })}
        </div>
      </Container>
    </section>
  )
}

/* ---------- FAQ: the Bubbles ---------- */

export type HeroQuestion = { id: string; q: string; icon: ObjectId }

// Where each question sits from xl, as a share of the hero: three down the left, three down the right, clear of
// the centred copy.
const BUBBLE_AT = [
  { side: "left", x: "0%", y: "10%" },
  { side: "right", x: "1%", y: "6%" },
  { side: "left", x: "3%", y: "42%" },
  { side: "right", x: "0%", y: "40%" },
  { side: "left", x: "0%", y: "74%" },
  { side: "right", x: "3%", y: "76%" },
] as const

/**
 * The Bubbles. The headline and the actions are centred, and real questions float round them as speech bubbles,
 * each with its group's object on a disc. Each bubble opens its answer below, so the picture is also the fastest
 * way in. Below xl the bubbles line up under the actions.
 */
export function FaqHero({ questions }: { questions: HeroQuestion[] }) {
  return (
    <section aria-labelledby="faq-hero-title" className="rule-b">
      <Container className="relative py-12 lg:py-16 xl:min-h-[36rem] xl:py-24">
        <div className="relative z-10 mx-auto max-w-[34rem] text-center">
          <h1 id="faq-hero-title" className="display-hero text-balance">
            Questions, answered.
          </h1>
          <p className="lede mt-5 text-pretty text-muted-foreground">
            Short answers on tours, passes, fees, booking rules and kids club.
            If yours is not here, a person answers.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <LinkButton href="#questions" size="lg" className="max-sm:flex-1">
              Find an answer
            </LinkButton>
            <LinkButton
              href="/contact"
              variant="outline"
              size="lg"
              className="max-sm:flex-1"
            >
              Talk to a person
            </LinkButton>
          </div>
        </div>
        <ul
          aria-label="Common questions"
          className="mx-auto mt-12 flex max-w-2xl flex-col gap-3 xl:static xl:mt-0 xl:max-w-none"
        >
          {questions.slice(0, BUBBLE_AT.length).map((q, i) => {
            const at = BUBBLE_AT[i]
            return (
              <li
                key={q.id}
                style={
                  {
                    "--x": at.x,
                    "--y": at.y,
                  } as React.CSSProperties
                }
                className={cn(
                  "xl:absolute xl:top-(--y) xl:w-[17rem]",
                  at.side === "left" ? "xl:left-(--x)" : "xl:right-(--x)"
                )}
              >
                <a
                  href={`#${q.id}`}
                  className={cn(
                    "group relative flex items-center gap-3 rounded-2xl bg-card py-2.5 pr-4 pl-2.5 text-label text-pretty no-underline edge ring-border hover:bg-muted",
                    at.side === "left" ? "xl:rounded-bl-sm" : "xl:rounded-br-sm"
                  )}
                >
                  <Disc
                    id={q.icon}
                    tone={i === 0 ? "lit" : "night"}
                    className="size-10"
                  />
                  <span className="group-hover:underline">{q.q}</span>
                </a>
              </li>
            )
          })}
        </ul>
      </Container>
    </section>
  )
}

/* ---------- Contact: the Switchboard ---------- */

export type Line = {
  key: string
  name: string
  sub: string
  phone: string
  tel: string
  /** `"mark"` for a line that is the brand itself (member services) rather than one club. */
  icon: ObjectId | "mark"
  lit?: boolean
}

/**
 * The Switchboard. The headline and the line sit side by side, and under them every number is a card in one row:
 * member services lit first, then each club with its first object. A card is the call link, so a visitor on a
 * phone reaches a person in one tap. One quiet line under the row says when a person answers.
 */
export function ContactHero({ lines, note }: { lines: Line[]; note: string }) {
  return (
    <section aria-labelledby="contact-hero-title" className="rule-b">
      <Container className="pt-8 pb-12 lg:pt-14 lg:pb-16">
        <div className="grid gap-6 lg:grid-cols-12 lg:items-end lg:gap-12">
          <h1
            id="contact-hero-title"
            className="display-hero max-w-[10ch] text-balance lg:col-span-7"
          >
            Talk to a person.
          </h1>
          <p className="lede max-w-[36ch] text-pretty text-muted-foreground lg:col-span-5 lg:pb-3">
            Call your club for the fastest answer. After hours, send a message
            and we reply within 1 business day.
          </p>
        </div>
        <ul className="mt-10 grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 lg:mt-14 lg:grid-cols-6">
          {lines.map((l) => (
            <li key={l.key}>
              <a
                href={`tel:${l.tel}`}
                className={cn(
                  "flex h-full flex-col gap-6 rounded-2xl p-4 no-underline sm:p-5",
                  l.lit
                    ? `${litFill} [&:focus-visible]:outline-[var(--night)]`
                    : "bg-card edge ring-border hover:bg-muted"
                )}
              >
                <Disc id={l.icon} tone="night" className="size-11" />
                <span className="mt-auto">
                  <span
                    className={cn(
                      "block text-caption",
                      l.lit ? "" : "text-muted-foreground"
                    )}
                  >
                    {l.sub}
                  </span>
                  <span className="font-display-wide block text-label text-balance sm:text-body-strong">
                    {l.name}
                  </span>
                  <span className="tabular mt-2 block font-data text-body-strong font-bold underline decoration-[color-mix(in_oklab,currentColor_40%,transparent)] underline-offset-4">
                    {l.phone}
                  </span>
                </span>
              </a>
            </li>
          ))}
        </ul>
        <p className="mt-6 text-body text-muted-foreground">{note}</p>
      </Container>
    </section>
  )
}

/* ---------- Contact: when a person answers ---------- */

export type DayRow = {
  day: string
  open: readonly [number, number]
  desk: readonly [number, number]
}

// The day line runs from 4 am to 10 pm, the earliest opening to the latest close.
const DAY_START = 4 * 60
const DAY_END = 22 * 60
const pos = (min: number) =>
  `${((min - DAY_START) / (DAY_END - DAY_START)) * 100}%`

/**
 * The Day: for weekdays and weekends, the hours the club is open and, inside them, the hours a person answers the
 * phone (lit). It answers the question the contact page gets most: "why did nobody pick up at 5 am?"
 */
export function DeskDay({ rows }: { rows: DayRow[] }) {
  return (
    <div
      role="img"
      aria-label={rows
        .map(
          (r) =>
            `${r.day}: the club is open ${fmtClock(r.open[0])} to ${fmtClock(r.open[1])}, and a person answers ${fmtClock(r.desk[0])} to ${fmtClock(r.desk[1])}.`
        )
        .join(" ")}
      className={cn("rounded-2xl p-5 sm:p-8", nightFill)}
    >
      <div aria-hidden="true" className="flex flex-col gap-8 sm:gap-10">
        {rows.map((r) => (
          <div key={r.day}>
            <p className="font-display-wide text-h3">{r.day}</p>
            <div className="relative mt-4 h-14 rounded-full fill-quiet sm:h-16">
              <div
                className="absolute inset-y-0 rounded-full fill-quiet-strong"
                style={{
                  left: pos(r.open[0]),
                  right: `calc(100% - ${pos(r.open[1])})`,
                }}
              />
              <div
                className={cn(
                  "absolute inset-y-1.5 flex items-center justify-center rounded-full px-3",
                  litFill
                )}
                // Where the desk hours reach an end of the open hours, the lit bar keeps the same 0.375rem inset
                // there as at its top and bottom, so the open band shows as an even rim around it.
                style={{
                  left: `calc(${pos(r.desk[0])} + ${r.desk[0] <= r.open[0] ? "0.375rem" : "0px"})`,
                  right: `calc(100% - ${pos(r.desk[1])} + ${r.desk[1] >= r.open[1] ? "0.375rem" : "0px"})`,
                }}
              >
                <span className="tabular truncate text-label font-semibold sm:text-body-strong">
                  {fmtClock(r.desk[0])}–{fmtClock(r.desk[1])}
                </span>
              </div>
            </div>
            <div className="tabular relative mt-2 h-5 text-caption whitespace-nowrap text-night-muted">
              <span className="absolute" style={{ left: pos(r.open[0]) }}>
                {fmtClock(r.open[0])}
              </span>
              <span
                className="absolute -translate-x-full"
                style={{ left: pos(r.open[1]) }}
              >
                {fmtClock(r.open[1])}
              </span>
            </div>
          </div>
        ))}
        <ul className="flex flex-wrap gap-x-6 gap-y-2 pt-5 text-label rule-t rule-night">
          <li className="flex items-center gap-2">
            <span className="size-3 rounded-full bg-[color-mix(in_oklab,currentColor_40%,transparent)]" />
            Club open
          </li>
          <li className="flex items-center gap-2">
            <span className="size-3 rounded-full bg-[var(--cat-strength)]" />A
            person answers
          </li>
        </ul>
      </div>
    </div>
  )
}
