import { GymObject, type ObjectId } from "@/components/brand/graphics"
import type { Club, Pack } from "@/lib/types"
import { cn } from "@/lib/utils"
import { litFill, nightFill } from "./program-page"

/*
 * The hero pictures of the program pages. Each one draws the page's own data as the image, as the membership
 * Steps do (VISUAL-IDENTITY.md: objects in compositions, never scenes). Each has one lit part in Copper and the
 * rest in Night, with the objects in the matching scheme. A picture is one image to assistive tech: its
 * `aria-label` says what it shows, and the parts inside are hidden.
 *
 * Contrast: white (`--neutral-1`) on Copper is 4.9:1 and Sand on Night is 12:1, so every word on a lit part
 * keeps the full white and every word on a Night part keeps Sand or the muted Sand (9:1).
 */

/** A tile's quiet fill on a Night or Copper part: a mix of the part's own text colour. */
const tileFill = "fill-quiet"

/* ---------- Personal training: the 12-pack as a plan ---------- */

// The objects a plan works through, in order. The first session is the meeting, so it is the whistle.
const PLAN_OBJECTS: readonly ObjectId[] = [
  "kettlebell",
  "resistance-band",
  "dumbbell",
  "medicine-ball",
  "plate",
  "jump-rope",
]

/**
 * The Plan: the biggest pack as one tile for each session, four to a row. Every fourth session is the plan
 * check (lit, the heart-rate watch), because the page's promise is that a coach reviews the plan every four
 * sessions. The first session is the meeting (the whistle). A ruled head names the pack and, when `each` is
 * given, what one session in it costs, so the hero answers the price without a facts row.
 */
export function SessionPlan({ pack, each }: { pack: Pack; each?: number }) {
  const sessions = Array.from({ length: pack.n }, (_, i) => i + 1)
  let k = 0
  return (
    <figure
      role="img"
      aria-label={`A pack of ${pack.n} sessions${each ? ` at $${each} a session` : ""}. Your coach checks the plan every 4 sessions.`}
      className="m-0"
    >
      <div
        aria-hidden="true"
        className="mb-4 flex items-baseline justify-between gap-4 pb-3 rule-b rule-heavy sm:mb-5"
      >
        <span className="font-display-wide text-lead sm:text-h3">
          {pack.n}-pack
        </span>
        {each ? (
          <span className="tabular font-data text-h3 font-bold sm:text-h2">
            ${each}
            <span className="text-body font-normal text-muted-foreground">
              {" "}
              a session
            </span>
          </span>
        ) : null}
      </div>
      <div className="grid grid-cols-4 gap-2 sm:gap-3">
        {sessions.map((n) => {
          const check = n % 4 === 0
          const id: ObjectId = check
            ? "heart-watch"
            : n === 1
              ? "whistle"
              : PLAN_OBJECTS[k++ % PLAN_OBJECTS.length]
          return (
            <div
              key={n}
              aria-hidden="true"
              className={cn(
                "flex aspect-square flex-col justify-between rounded-lg p-2.5 sm:rounded-2xl sm:p-4",
                check ? litFill : nightFill
              )}
            >
              <span className="flex items-start justify-between gap-1">
                <GymObject
                  id={id}
                  scheme={check ? "copper" : "night"}
                  className="size-7 sm:size-10"
                />
                {check ? (
                  <span className="text-right text-caption font-semibold max-md:hidden">
                    Plan
                    <br />
                    check
                  </span>
                ) : null}
              </span>
              <span className="tabular font-data text-h3 leading-none font-bold sm:text-h2">
                {n}
              </span>
            </div>
          )
        })}
      </div>
    </figure>
  )
}

/* ---------- Recovery: the suite as a cairn ---------- */

/** A part of the suite. `time` is how long to stay; leave it empty when there is no set time. */
export type Stone = { name: string; time: string; icon: ObjectId }

// The stones narrow toward the top, as a cairn does. The first stone (the top) is the first step of a visit.
// Phones get a gentler taper, so every stone keeps room for its full name next to the time.
const STONE_WIDTH = [
  "w-[84%] sm:w-[64%]",
  "w-[90%] sm:w-[76%]",
  "w-[95%] sm:w-[88%]",
  "w-full",
]

/**
 * The Cairn: the suite as stacked stones, in the order of a visit (warm, then cool, then rest). The spa stones
 * are the recovery object, so the picture is the object at page size, built from the suite itself. The sauna
 * is lit; the last stone, the stretch area, is open to every member, so it is the plain card.
 */
export function RecoveryCairn({ stones }: { stones: Stone[] }) {
  return (
    <div
      role="img"
      aria-label={`The recovery suite, in the order of a visit: ${stones
        .map((s) => (s.time ? `${s.name}, ${s.time}` : s.name))
        .join("; ")}.`}
      className="flex flex-col items-center gap-2 sm:gap-3"
    >
      {stones.map((s, i) => {
        const lit = i === 0
        const last = i === stones.length - 1
        return (
          <div
            key={s.name}
            aria-hidden="true"
            className={cn(
              "flex h-16 items-center justify-between gap-3 rounded-full px-5 sm:h-24 sm:px-8",
              STONE_WIDTH[i] ?? "w-full",
              lit ? litFill : last ? "bg-card edge ring-border" : nightFill
            )}
          >
            <span className="flex min-w-0 items-center gap-3">
              <GymObject
                id={s.icon}
                scheme={lit ? "copper" : last ? "sand" : "night"}
                className="size-7 shrink-0 sm:size-10"
              />
              <span className="font-display-wide min-w-0 text-label sm:text-h3">
                {s.name}
              </span>
            </span>
            {s.time ? (
              <span className="tabular font-data text-label font-bold whitespace-nowrap sm:text-h3">
                {s.time}
              </span>
            ) : null}
          </div>
        )
      })}
    </div>
  )
}

/* ---------- Aquatics: the pools by water temperature ---------- */

export type PoolColumn = {
  key: string
  name: string
  line: string
  /** The top of the pool's range, in °F. It sets the column's height. */
  temp: number
  range: string
  icon: ObjectId
  lit?: boolean
}

// The lowest temperature the scale shows. The columns rise from it, so the warm pool stands clear of the rest.
const TEMP_FLOOR = 60

/**
 * The Gauge: each pool as a column whose height is its water temperature, so the warm-water pool stands
 * above the lap pools, the way the page's point (water at any pace, warm when you need it) reads. The warm
 * pool is lit. Each column names its club and its lanes. The columns have square feet: the hero sets them on
 * its bottom rule, so they rise from the floor.
 */
export function PoolGauge({ pools }: { pools: PoolColumn[] }) {
  const top = Math.max(...pools.map((p) => p.temp))
  return (
    <ul
      aria-label="Water temperature at each pool"
      className="grid aspect-[5/4] items-end gap-2 sm:aspect-[2/1] sm:gap-3 lg:aspect-[3/1]"
      style={{ gridTemplateColumns: `repeat(${pools.length}, minmax(0, 1fr))` }}
    >
      {pools.map((p) => (
        <li
          key={p.key}
          className="min-h-0"
          style={{
            height: `${((p.temp - TEMP_FLOOR) / (top - TEMP_FLOOR)) * 100}%`,
          }}
        >
          <div
            className={cn(
              "flex h-full flex-col justify-between rounded-t-2xl p-2.5 sm:p-5",
              p.lit ? litFill : nightFill
            )}
          >
            <GymObject
              id={p.icon}
              scheme={p.lit ? "copper" : "night"}
              className="size-6 sm:size-9"
            />
            <span className="min-w-0">
              <span className="tabular block font-data text-h3 leading-none font-bold sm:text-h1">
                {p.range}
                <span className="sr-only"> degrees Fahrenheit</span>
              </span>
              <span className="mt-2 block text-caption font-semibold text-balance sm:text-label">
                {p.name}
              </span>
              <span
                className={cn(
                  "mt-0.5 block text-caption text-pretty max-sm:hidden",
                  p.lit ? "text-[var(--neutral-1)]" : "text-night-muted"
                )}
              >
                {p.line}
              </span>
            </span>
          </div>
        </li>
      ))}
    </ul>
  )
}

/* ---------- Courts: every court, by club ---------- */

const COURT_KINDS = [
  ["pickleball", "paddle", "pickleball"],
  ["tennis", "tennis-ball", "tennis"],
  ["basketball", "basketball", "basketball"],
] as const

/** The courts at a club as a flat list of objects, pickleball first. */
export function courtTiles(c: Club): ObjectId[] {
  return COURT_KINDS.flatMap(([k, icon]) =>
    Array.from({ length: c.courts?.[k] ?? 0 }, () => icon as ObjectId)
  )
}

/** "4 pickleball, 2 tennis". */
export function courtLine(c: Club) {
  return COURT_KINDS.map(([k, , word]) =>
    c.courts?.[k] ? `${c.courts[k]} ${word}` : null
  )
    .filter(Boolean)
    .join(", ")
}

/**
 * The Count: every court as one tile, grouped by club, so the number in the headline is the picture. The club
 * with the most pickleball courts is lit, because pickleball is what most visitors come to the courts for.
 */
export function CourtCount({ clubs }: { clubs: Club[] }) {
  const most = Math.max(...clubs.map((c) => c.courts?.pickleball ?? 0))
  const litClub = clubs.find((c) => (c.courts?.pickleball ?? 0) === most)?.slug
  return (
    <ul
      aria-label="The courts at each club"
      className="grid gap-2 sm:gap-3"
      style={{ gridTemplateColumns: `repeat(${clubs.length}, minmax(0, 1fr))` }}
    >
      {clubs.map((c) => {
        const lit = c.slug === litClub
        const tiles = courtTiles(c)
        return (
          <li
            key={c.slug}
            className={cn(
              "flex flex-col gap-3 rounded-2xl p-2.5 sm:gap-4 sm:p-4",
              lit ? litFill : nightFill
            )}
          >
            <p>
              <span className="tabular block font-data text-h2 leading-none font-bold sm:text-h1">
                {tiles.length}
              </span>
              <span className="mt-2 block text-caption font-semibold text-balance sm:text-label">
                {c.short}
              </span>
              <span className="sr-only">: {courtLine(c)}</span>
            </p>
            <span
              aria-hidden="true"
              className="grid grid-cols-2 gap-1.5 sm:gap-2"
            >
              {tiles.map((id, i) => (
                <span
                  // Tiles of one kind repeat, so the place in the list is the key.
                  // biome-ignore lint/suspicious/noArrayIndexKey: fixed order from the club data
                  key={i}
                  className={cn(
                    "grid aspect-square place-items-center rounded-md",
                    tileFill
                  )}
                >
                  <GymObject
                    id={id}
                    scheme={lit ? "copper" : "night"}
                    className="size-[62%]"
                  />
                </span>
              ))}
            </span>
          </li>
        )
      })}
    </ul>
  )
}

/* ---------- Kids: the programs by age ---------- */

export type AgeBand = {
  key: string
  name: string
  /** Ages in years. Half a year is 0.5. */
  from: number
  to: number
  ages: string
  icon: ObjectId
  lit?: boolean
  /** One fact at the end of the band's label line, such as what it costs. */
  note?: string
}

const AGE_MAX = 18
const AGE_TICKS = [0, 3, 6, 9, 12, 15, 18]

/**
 * The Span: each program as a bar on one age line, from 6 months to 17 years, so a parent finds a child's age
 * and reads down to what fits. Kids club, the widest, is lit.
 */
export function AgeSpan({ bands }: { bands: AgeBand[] }) {
  const pct = (age: number) => `${(age / AGE_MAX) * 100}%`
  return (
    <figure className="m-0">
      <ul aria-label="Programs by age" className="flex flex-col gap-4 sm:gap-5">
        {bands.map((b) => (
          <li key={b.key}>
            <p className="flex items-center gap-2 text-label">
              <GymObject id={b.icon} className="size-6 shrink-0" />
              {b.name}
              <span className="sr-only">, ages {b.ages}</span>
              {b.note ? (
                <span className="ml-auto text-right text-muted-foreground tabular-nums">
                  <span className="sr-only">, </span>
                  {b.note}
                </span>
              ) : null}
            </p>
            <div
              aria-hidden="true"
              className="relative mt-2 h-11 rounded-full bg-[color-mix(in_oklab,var(--foreground)_8%,transparent)] sm:h-14"
            >
              <span
                className={cn(
                  "absolute inset-y-0 flex items-center justify-end rounded-full px-3 sm:px-4",
                  b.lit ? litFill : nightFill
                )}
                style={{ left: pct(b.from), width: pct(b.to - b.from) }}
              >
                <span className="tabular font-data text-label font-bold whitespace-nowrap sm:text-h3">
                  {b.ages}
                </span>
              </span>
            </div>
          </li>
        ))}
      </ul>
      {/* The age scale under the bars. */}
      <div
        aria-hidden="true"
        className="relative mt-3 h-6 text-caption text-muted-foreground tabular-nums rule-t"
      >
        {AGE_TICKS.map((t) => (
          <span
            key={t}
            className={cn(
              "absolute top-1.5 whitespace-nowrap",
              t === 0
                ? ""
                : t === AGE_MAX
                  ? "-translate-x-full"
                  : "-translate-x-1/2"
            )}
            style={{ left: pct(t) }}
          >
            {t === 0 ? "Birth" : t === AGE_MAX ? "18 yr" : t}
          </span>
        ))}
      </div>
    </figure>
  )
}
