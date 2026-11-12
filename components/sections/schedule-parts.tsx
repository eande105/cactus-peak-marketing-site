"use client"

import { useMemo, useState } from "react"
import { TextLink } from "@/components/brand/atoms"
import { ScheduleList } from "@/components/brand/class-parts"
import { Toggle, ToggleGroup } from "@/components/graphical"
import {
  useCatalog,
  useClubNow,
  useSessions,
} from "@/components/site/catalog-context"
import { useMyClub } from "@/components/site/club-context"
import { ClubSwitcher } from "@/components/site/club-switcher"
import { Button } from "@/components/ui/button"
import { SelectBox } from "@/components/ui/controls"
import { filterSessions } from "@/lib/catalog"
import { countOf } from "@/lib/labels"
import { scheduleUrl } from "@/lib/links"
import { clubHours, dayInfo, fmtTimeShort } from "@/lib/time"
import type { ClubSlug, Session } from "@/lib/types"
import { cn } from "@/lib/utils"
import { EmptyState } from "./common"

export function ScheduleDayStrip({
  value,
  onChange,
  counts,
  className,
}: {
  value: number
  onChange: (d: number) => void
  counts?: number[]
  className?: string
}) {
  const { dayNum } = useClubNow()
  // Single choice on a Graphical ToggleGroup. Pressing the current day again keeps it on.
  return (
    <ToggleGroup
      aria-label="Pick a day"
      value={[String(value)]}
      onValueChange={(v) => {
        if (v[0] !== undefined) onChange(Number(v[0]))
      }}
      // A scroll box clips anything past its edge. The padding leaves room for the focus ring, and the
      // negative margin keeps the buttons where they were.
      className={cn(
        "-m-xxs max-w-[calc(100%+0.5rem)] overflow-x-auto p-xxs",
        className
      )}
    >
      {Array.from({ length: 7 }, (_, i) => {
        const d = dayInfo(i, dayNum)
        const on = value === i
        return (
          // One line per day. An empty day dims; the count lives in the list below (REDESIGN.md goal 7).
          // The dim is a data state, so its muted text stays on the unpressed toggle.
          <Toggle
            // biome-ignore lint/suspicious/noArrayIndexKey: seven fixed weekday buttons never reorder
            key={i}
            value={String(i)}
            aria-label={
              counts
                ? `${i === 0 ? "Today" : `${d.short} ${d.dom}`}, ${countOf(counts[i], "class", "classes")}`
                : undefined
            }
            className={cn(
              "tabular min-h-11 min-w-[76px] flex-1",
              !on && counts && counts[i] === 0 && "text-muted-foreground"
            )}
          >
            {i === 0 ? "Today" : `${d.short} ${d.dom}`}
          </Toggle>
        )
      })}
    </ToggleGroup>
  )
}

/** Sessions that have not started yet, and how many fall on each of the next 7 days. */
function useUpcoming(opts: {
  club: ClubSlug | "all"
  category?: string
  classSlug?: string
  coach?: string
}) {
  const { sessions, now } = useSessions()
  const { club, category, classSlug, coach } = opts
  return useMemo(() => {
    const upcoming = filterSessions(sessions, {
      club,
      category,
      classSlug,
      coach,
    }).filter((s) => s.day > 0 || s.start >= now.min)
    const counts = Array.from(
      { length: 7 },
      (_, d) => upcoming.filter((s) => s.day === d).length
    )
    return { upcoming, counts, now }
  }, [sessions, now, club, category, classSlug, coach])
}

export function ScheduleTeaser({
  club: fixedClub,
  category,
  classSlug,
  coach,
  coachSlug,
  allowAll,
  switcher = true,
  limit = 6,
  onOpen,
  hideClass,
}: {
  club?: ClubSlug | "all"
  category?: string
  classSlug?: string
  /** The coach's name. The sessions carry the name, so the filter matches on it. */
  coach?: string
  /** The coach's slug. The schedule link needs it, because the board looks a coach up by slug. */
  coachSlug?: string
  allowAll?: boolean
  switcher?: boolean
  limit?: number
  onOpen?: (s: Session) => void
  hideClass?: boolean
}) {
  const { club: mine } = useMyClub()
  const { clubs, clubBySlug } = useCatalog()
  const [day, setDay] = useState(0)
  const [picked, setPicked] = useState<ClubSlug | "all" | "">("")
  const club: ClubSlug | "all" =
    fixedClub ??
    (picked || mine?.slug || (allowAll ? "all" : "val-vista-warner"))
  const { upcoming, counts, now } = useUpcoming({
    club,
    category,
    classSlug,
    coach,
  })
  const rows = upcoming.filter((s) => s.day === day).slice(0, limit)
  const nextDay = counts.findIndex((c, i) => i > day && c > 0)
  const c = club === "all" ? null : clubBySlug(club)
  return (
    <div>
      {switcher && !fixedClub ? (
        <div className="mb-m flex flex-wrap items-center gap-s">
          {allowAll ? (
            <SelectBox
              inline
              label="Club"
              value={club}
              onChange={setPicked}
              options={[
                { value: "all", label: "All clubs" },
                ...clubs.map((x) => ({ value: x.slug, label: x.name })),
              ]}
            />
          ) : (
            <ClubSwitcher />
          )}
        </div>
      ) : null}
      <ScheduleDayStrip value={day} onChange={setDay} counts={counts} />
      <div className="mt-m" aria-live="polite">
        {rows.length ? (
          <ScheduleList
            sessions={rows}
            showClub={club === "all"}
            hideClass={hideClass}
            onOpen={onOpen}
            mobileFour
          />
        ) : (
          <EmptyState
            title={
              day === 0
                ? `No more classes today${c ? ` at ${c.name}` : ""}.`
                : "No classes that day."
            }
            text={
              day === 0 && now.min < clubHours(now.weekday)[1]
                ? // Times ("10 pm") carry no full stop, so the sentence adds its own.
                  `The club is open until ${fmtTimeShort(clubHours(now.weekday)[1])}.`
                : "Try another day."
            }
          >
            {nextDay > -1 ? (
              <Button variant="outline" onClick={() => setDay(nextDay)}>
                See {dayInfo(nextDay, now.dayNum).long}
              </Button>
            ) : null}
          </EmptyState>
        )}
      </div>
      <div className="mt-m flex flex-wrap items-center justify-between gap-x-l">
        <TextLink
          href={scheduleUrl({
            club: c ? c.slug : "all",
            category,
            class: classSlug,
            coach: coachSlug,
          })}
        >
          {classSlug
            ? "Open the full schedule for this class"
            : "See full schedule"}
        </TextLink>
        <p className="text-body-s text-muted-foreground">
          All times are Arizona time.
        </p>
      </div>
    </div>
  )
}
