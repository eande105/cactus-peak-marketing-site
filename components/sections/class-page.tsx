import { LinkButton } from "@/components/brand/atoms"
import {
  categoryObject,
  classObjects,
  type ObjectId,
} from "@/components/brand/graphics"
import { Check } from "@/components/icons"
import { runsAt } from "@/lib/catalog"
import { timesByClub } from "@/lib/class-times"
import { countOf, LEVEL_WORD } from "@/lib/labels"
import type { ClassType, Club, Level, Plan, Slot } from "@/lib/types"
import { cn } from "@/lib/utils"
import { effort } from "./classes-overview"

/*
 * Shared class facts and the plan row for the classes page. The type and class pages are gone: every class
 * now lives in the explorer on /classes (class-explorer.tsx), which uses these helpers.
 */

/** The class's own object (VISUAL-IDENTITY.md, section 6), or its category's when it has none. */
export const classObject = (c: ClassType): ObjectId =>
  classObjects[c.slug] ?? categoryObject[c.category]

/** "All 5 clubs", "3 clubs" or "1 club". */
export function whereLabel(c: ClassType, clubs: Club[]) {
  const n = clubs.filter((club) => runsAt(c, club.slug)).length
  if (n === clubs.length) return `All ${n} clubs`
  return n === 1 ? "1 club" : `${n} clubs`
}

/** "Hard" or "Moderate to all-out". */
export function effortWord([lo, hi]: [Level, Level]) {
  return lo === hi
    ? LEVEL_WORD[hi]
    : `${LEVEL_WORD[lo]} to ${LEVEL_WORD[hi].toLowerCase()}`
}

const lowerFirst = (t: string) => `${t[0].toLowerCase()}${t.slice(1)}`

/** The talk test for the hardest part, the one cue a first-timer can check in class. */
export function effortLine([lo, hi]: [Level, Level]) {
  const t = effort[hi]
  return lo === hi ? t : `At its hardest: ${lowerFirst(t)}`
}

/**
 * The pool for each club that runs an Aqua class. Aqua Fit names its own pool per club, from the
 * timetable. The warm-water note shows only if the class runs at Dobson & Southern.
 */
export function poolLine(c: ClassType, clubs: Club[], slots: Slot[]) {
  const here = clubs.filter((club) => runsAt(c, club.slug) && club.pool)
  if (!here.length) return null
  const warm = here.some((club) => club.pool!.therapy)
    ? " The warm-water pool (90–92°F) is at Dobson & Southern only."
    : ""
  if (c.slug === "aqua-fit") {
    const per = timesByClub(slots, c.key, clubs).filter((p) => p.studio)
    if (per.length)
      return `${per
        .map((p) => `${p.club.short}: ${p.studio.toLowerCase()}.`)
        .join(" ")}${warm}`
  }
  const pools = here.map(
    (club) =>
      `${club.short}: ${club.pool!.label.toLowerCase()}, ${countOf(club.pool!.lanes, "lane")}.`
  )
  return `${pools.join(" ")}${warm}`
}

/** Class starts in one week for the given classes, at one club or at all of them. */
export function weekly(slots: Slot[], keys: Set<string>, club?: string) {
  return slots
    .filter((s) => keys.has(s.classKey) && (!club || s.club === club))
    .reduce((n, s) => n + s.days.length, 0)
}

/**
 * The ways to start, from free to member, as one ruled row: the free first step, then each plan that
 * covers the class with its price and the one line that says what it adds for this class. The free step
 * leads, because a class page's job is a first visit. A recovery slot is a Summit benefit, so it lists
 * Summit only. Each column ends in its own action, which opens its flow with the plan already picked.
 */
export function ClassAccess({
  plans,
  ct,
  clubs,
  facilityFee,
}: {
  plans: Plan[]
  /** The yearly fee every plan adds, shown as a small label under each plan's price. */
  facilityFee: number
  /** The class. Without it the row speaks for the whole type. */
  ct?: ClassType
  clubs: Club[]
}) {
  const summitOnly = ct ? ct.category === "recovery" && !ct.bookable : false
  const n = ct ? clubs.filter((c) => runsAt(ct, c.slug)).length : clubs.length
  const free =
    ct && !ct.bookable
      ? {
          name: "Free tour",
          price: "$0",
          line: "See it with a coach before you join. No card.",
          href: "/tour",
          action: "Book a free tour",
        }
      : {
          name: "3-day pass",
          price: "$0",
          line: "Any class with room at one club. No card.",
          href: "/trial",
          action: "Try a free 3-day pass",
        }
  const planLine: Record<Plan["slug"], string> = {
    trailhead:
      ct && n < clubs.length
        ? "At your home club, if it runs this class."
        : "At your home club. Book 7 days ahead.",
    ridge:
      n === clubs.length
        ? `At all ${n} clubs. Book 7 days ahead.`
        : `At all ${n} clubs that run it.`,
    summit: summitOnly
      ? "The recovery suite at every club that has one."
      : "Book 9 days ahead, plus the recovery suite.",
  }
  const cells = [
    { ...free, highlight: false },
    ...plans
      .filter((p) => !summitOnly || p.slug === "summit")
      .map((p) => ({
        name: p.name,
        price: `$${p.price}`,
        line: planLine[p.slug],
        href: `/join/plan?plan=${p.slug}`,
        action: `Join ${p.name}`,
        highlight: Boolean(p.badge),
        badge: p.badge,
      })),
  ]
  return (
    // One card, as the membership plan columns: it closes every column, so the featured plan's fill ends
    // inside the card's corners. The dividers follow the grid: a top rule between stacked cells, a left rule
    // between cells side by side.
    <ul
      className={cn(
        "grid overflow-hidden rounded-lg bg-card edge ring-border",
        cells.length === 2 ? "md:grid-cols-2" : "md:grid-cols-2 lg:grid-cols-4"
      )}
    >
      {cells.map((c, i) => (
        <li
          key={c.name}
          className={cn(
            "relative flex flex-col gap-3 p-6 lg:py-8",
            i > 0 && "max-md:rule-t",
            cells.length === 2
              ? i > 0 && "md:rule-l"
              : [
                  i % 2 === 1 && "md:max-lg:rule-l",
                  i >= 2 && "md:max-lg:rule-t",
                  i > 0 && "lg:rule-l",
                ],
            c.highlight &&
              "bg-[color-mix(in_oklab,var(--cat-strength)_5%,var(--card))] before:absolute before:inset-x-0 before:top-0 before:h-1 before:bg-primary"
          )}
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="font-display-wide text-h3">{c.name}</h3>
            {"badge" in c && c.badge ? (
              // The Copper tint shows on the card; the muted fill matched the tint band and vanished.
              <span className="rounded-sm bg-accent px-2 py-0.5 text-caption font-semibold text-foreground">
                {c.badge}
              </span>
            ) : null}
          </div>
          <p className="flex items-baseline gap-1">
            <span className="tabular font-data text-h1 leading-none font-bold">
              {c.price}
            </span>
            {i > 0 ? (
              <span className="text-body text-muted-foreground">/mo</span>
            ) : null}
          </p>
          {i > 0 ? (
            <p className="-mt-1 text-caption text-muted-foreground tabular-nums">
              + ${facilityFee} facility fee each March
            </p>
          ) : null}
          <p className="flex gap-2 text-body text-pretty">
            <Check className="mt-1 size-4 shrink-0" aria-hidden="true" />
            {c.line}
          </p>
          <LinkButton
            href={c.href}
            variant={i === 0 ? "primary" : "outline"}
            className="mt-auto w-full"
          >
            {c.action}
          </LinkButton>
        </li>
      ))}
    </ul>
  )
}
