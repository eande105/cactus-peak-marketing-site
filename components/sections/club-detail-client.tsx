"use client"

import { useEffect, useState } from "react"
import { Toggle, ToggleGroup } from "@/components/graphical"
import { useClubNow } from "@/components/site/catalog-context"
import { BUSY_WORD } from "@/lib/labels"
import { clubHours, clubStatus, fmtClock } from "@/lib/time"
import type { Club, Level } from "@/lib/types"
import { cn } from "@/lib/utils"

const WEEK = [1, 2, 3, 4, 5, 6, 0] // Monday first
const DAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
const DAY_LONG = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
]

/** Typical busyness by hour from the club row (index 0 = 4 am), for a weekday (0 = Sunday). */
function typical(club: Club, weekday: number) {
  const weekend = weekday === 0 || weekday === 6
  const [open, close] = clubHours(weekday)
  return (weekend ? club.typicalWeekend : club.typicalWeekday)
    .map((v, i) => [i + 4, v] as const)
    .filter(([h]) => h * 60 >= open - 30 && h * 60 < close)
}

export function PopularTimesChart({ club }: { club: Club }) {
  const now = useClubNow()
  const [pick, setPick] = useState<number | null>(null)
  const day = pick ?? now.weekday
  const data = typical(club, day)
  const nowH = Math.floor(now.min / 60)
  const status = clubStatus(now)
  const usual = typical(club, now.weekday).find(([h]) => h === nowH)?.[1]
  return (
    <div>
      <h3 className="font-display-wide mb-4 text-h3">Popular times</h3>
      {/* The toggles pick the day the chart shows. The chart redraws in place, so no tab panel exists. */}
      <ToggleGroup
        aria-label="Day of week"
        value={[String(day)]}
        onValueChange={(v) => {
          if (v[0] !== undefined) setPick(Number(v[0]))
        }}
        className="-m-1 mb-3 max-w-[calc(100%+0.5rem)] overflow-x-auto p-1"
      >
        {WEEK.map((d) => (
          <Toggle key={d} value={String(d)} className="min-h-11 min-w-11">
            {DAY_SHORT[d]}
          </Toggle>
        ))}
      </ToggleGroup>
      <ul
        className="mt-8 flex h-40 items-end gap-1 rule-b rule-strong"
        aria-label={`Typical busyness, ${DAY_LONG[day]}`}
      >
        {data.map(([h, v]) => {
          const isNow = day === now.weekday && h === nowH && status.open
          const label = `${DAY_LONG[day]} ${fmtClock(h * 60)}: ${BUSY_WORD[(v || 1) as Level]}${isNow ? ". Now" : ""}`
          return (
            <li
              key={h}
              className="relative flex h-full flex-1 flex-col justify-end"
            >
              {/* The bars are chart art, not controls. Each hour's value is text for screen readers, and the
                  current hour has a visible "Now" label, so the fill colour is never the only cue. */}
              <span className="sr-only">{label}</span>
              {isNow ? (
                <span
                  aria-hidden="true"
                  className="absolute -top-6 left-1/2 -translate-x-1/2 text-caption font-semibold text-foreground"
                >
                  Now
                </span>
              ) : null}
              <span
                aria-hidden="true"
                className={cn(
                  "block w-full min-w-1 rounded-t-sm transition-[height] motion-reduce:transition-none",
                  isNow ? "bg-primary" : "bg-night/70"
                )}
                style={{ height: `${(v || 0.3) * 20}%` }}
              />
            </li>
          )
        })}
      </ul>
      <div
        className="tabular mt-1 flex justify-between text-caption text-muted-foreground"
        aria-hidden="true"
      >
        {data
          .filter(([h]) => h % 3 === 0)
          .map(([h]) => (
            <span key={h}>{fmtClock(h * 60)}</span>
          ))}
      </div>
      <p className="mt-3 text-body text-muted-foreground">
        Typical busyness. Quietest: weekdays 1–3 pm and after 8 pm.{" "}
        {status.open && usual ? (
          <>
            Usually at this hour at {club.short}:{" "}
            <span className="font-semibold text-foreground">
              {BUSY_WORD[usual as Level]}
            </span>
            .
          </>
        ) : (
          <>{club.short} is closed now.</>
        )}
      </p>
    </div>
  )
}

/** The club page's section links. It has no tour action: the site header already has one. */
export function SectionNav({
  items,
}: {
  items: { id: string; label: string }[]
}) {
  const [active, setActive] = useState(items[0].id)
  // The active section is the last one whose top has passed 35% of the window. It is worked out from the scroll
  // position, not from intersection events, so a jump (a hash link, a filter link) never leaves a stale section on.
  useEffect(() => {
    let frame = 0
    const update = () => {
      frame = 0
      const line = window.innerHeight * 0.35
      let id = items[0].id
      for (const i of items) {
        const el = document.getElementById(i.id)
        if (el && el.getBoundingClientRect().top <= line) id = i.id
      }
      setActive(id)
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    update()
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onScroll)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onScroll)
    }
  }, [items])
  return (
    <nav
      aria-label="On this page"
      // On a short window (200% zoom on a laptop) the nav scrolls away with the page, so the fixed bars do not
      // cover half the screen. It always shows otherwise: a section with its own sticky bar (the schedule
      // toolbar) sticks below it, at --sticky-top.
      className="sticky top-(--header-height) z-40 bg-background rule-y [@media(max-height:32rem)]:static"
    >
      <div className="mx-auto flex max-w-[1200px] items-center gap-4 px-4 sm:px-6 lg:px-8">
        <ul className="-mx-4 flex min-w-0 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          {items.map((i) => (
            <li key={i.id}>
              <a
                href={`#${i.id}`}
                aria-current={active === i.id ? "true" : undefined}
                className={cn(
                  "relative inline-flex min-h-14 items-center px-4 text-label whitespace-nowrap hover:bg-muted",
                  active === i.id &&
                    "after:absolute after:inset-x-4 after:bottom-0 after:h-0.5 after:bg-primary"
                )}
              >
                {i.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  )
}
