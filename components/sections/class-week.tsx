"use client"

import { useEffect, useState } from "react"
import {
  CategoryTile,
  categoryObject,
  classObjects,
  GymObject,
} from "@/components/brand/graphics"
import { X } from "@/components/icons"
import { useMyClub } from "@/components/site/club-context"
import { SelectBox } from "@/components/ui/controls"
import { timesByClub } from "@/lib/class-times"
import { fmtTimeShort } from "@/lib/time"
import type { Category, ClassType, Club, ClubSlug, Slot } from "@/lib/types"
import { cn } from "@/lib/utils"
import { FilterBar } from "./filter-bar"
import { type Init, SCHEDULE_FILTER_EVENT } from "./schedule-link"

/** The four parts of a day. A class belongs to the part its start time falls in. */
export const PARTS = [
  { key: "early", name: "Early", hours: "Before 7 am", from: 0, to: 420 },
  { key: "morning", name: "Morning", hours: "7–11 am", from: 420, to: 660 },
  {
    key: "midday",
    name: "Midday",
    hours: "11 am–4 pm",
    from: 660,
    to: 960,
  },
  {
    key: "evening",
    name: "Evening",
    hours: "After 4 pm",
    from: 960,
    to: 1440,
  },
] as const

export const DAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
export const DAYS_LONG = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
]

/** How often a type runs in one part of the day, in words a visitor reads at a glance. */
export function daysWord(days: number[]) {
  if (days.length === 7) return "Every day"
  const key = days.join()
  if (key === "1,2,3,4,5") return "Weekdays"
  if (key === "0,6") return "Weekends"
  if (days.length <= 3) return days.map((d) => DAY_SHORT[d]).join(", ")
  return `${days.length} days a week`
}

/** The same, short enough for a quarter of a phone's width. */
export function daysShort(days: number[]) {
  if (days.length === 7) return "Daily"
  const key = days.join()
  if (key === "1,2,3,4,5") return "Mon–Fri"
  if (key === "0,6") return "Sat–Sun"
  if (days.length === 1) return DAY_SHORT[days[0]]
  return `${days.length} days`
}

/** "6 am", "6 and 6:30 am" or "5:30–6:30 am": the starts in one part of the day, short. */
export function startsWord(starts: number[]) {
  const t = starts.map(fmtTimeShort)
  const half = (s: string) => s.slice(-4)
  const bare = (s: string) => s.slice(0, -5)
  if (t.length === 1) return t[0]
  const [a, b] = [t[0], t.at(-1)!]
  const join = t.length === 2 ? " and " : "–"
  return half(a) === half(b) ? `${bare(a)}${join}${b}` : `${a}${join}${b}`
}

type Cell = { days: number[]; starts: number[] }

/**
 * When classes run, by type: a calm picture of the week, not a timetable to book from. Each row is a class type,
 * each column a part of the day, and each cell says how often the type runs then ("Every day", "Weekdays",
 * "Tue, Thu") and when it starts. The cells take three tones, so the shape of the week shows before any word is
 * read: a Sand tint for five days a week or more, a strong outline for two to four, a light
 * outline for one. The tones stay quiet, so a full week does not turn the table into a block of colour. Members book in the app,
 * so the section has no booking controls.
 *
 * Links elsewhere still open it with a club, a type or a class (the schedule link's filter event and the
 * address). A club sets the picker, a type marks its row, and a class also shows that class's own times.
 */
export function ClassWeek({
  categories,
  classTypes,
  clubs,
  slots,
  className,
}: {
  categories: Category[]
  classTypes: ClassType[]
  clubs: Club[]
  slots: Slot[]
  className?: string
}) {
  const { club: mine } = useMyClub()
  const [picked, setPicked] = useState<ClubSlug | "all" | "">("")
  const club = picked || mine?.slug || "all"
  const [focusCat, setFocusCat] = useState("")
  const [focusClass, setFocusClass] = useState("")

  const byKey = new Map(classTypes.map((c) => [c.key, c]))
  const focus = classTypes.find((c) => c.slug === focusClass)

  // A filter from a link: a club, a type, or a class (which marks its type).
  const apply = (f: Init) => {
    if (f.club) setPicked(f.club as ClubSlug | "all")
    const c = classTypes.find((x) => x.slug === f.classSlug)
    setFocusClass(c?.slug ?? "")
    setFocusCat(c?.category ?? f.category ?? "")
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies: reads the address once, on the first render
  useEffect(() => {
    const q = new URLSearchParams(window.location.search)
    const f: Init = {
      club: q.get("club") ?? undefined,
      category: q.get("category") ?? undefined,
      classSlug: q.get("class") ?? undefined,
    }
    apply(f)
    // A link to the schedule lands on it, not on the top of a long page. The browser's own jump runs before the
    // sections above have their height, so scroll again once they settle.
    if (
      window.location.hash === "#schedule" ||
      f.club ||
      f.category ||
      f.classSlug
    ) {
      const go = () =>
        document
          .getElementById("schedule")
          ?.scrollIntoView({ block: "start", behavior: "instant" })
      go()
      setTimeout(go, 500)
    }
    const onFilter = (e: Event) => apply((e as CustomEvent<Init>).detail ?? {})
    window.addEventListener(SCHEDULE_FILTER_EVENT, onFilter)
    return () => window.removeEventListener(SCHEDULE_FILTER_EVENT, onFilter)
  }, [])

  const own = slots.filter((s) => club === "all" || s.club === club)
  const rows = categories
    .map((cat) => {
      const list = own.filter((s) => byKey.get(s.classKey)?.category === cat.id)
      const cells: Cell[] = PARTS.map((p) => {
        const inPart = list.filter((s) => s.start >= p.from && s.start < p.to)
        return {
          days: [...new Set(inPart.flatMap((s) => s.days))].sort(
            (a, b) => a - b
          ),
          starts: [...new Set(inPart.map((s) => s.start))].sort(
            (a, b) => a - b
          ),
        }
      })
      const weekly = list.reduce((n, s) => n + s.days.length, 0)
      return { cat, cells, weekly }
    })
    .filter((r) => r.weekly > 0)
  const clubName =
    club === "all"
      ? "all 5 clubs"
      : (clubs.find((c) => c.slug === club)?.name ?? club)
  const focusTimes = focus
    ? timesByClub(slots, focus.key, clubs).filter(
        (t) => club === "all" || t.club.slug === club
      )
    : []

  return (
    <div
      id="schedule-board"
      tabIndex={-1}
      className={cn("outline-none", className)}
    >
      <FilterBar
        filters={
          <SelectBox
            inline
            roomy
            label="Club"
            value={club}
            onChange={(v) => setPicked(v as ClubSlug | "all")}
            options={[
              { value: "all", label: "All clubs" },
              ...clubs.map((c) => ({ value: c.slug, label: c.name })),
            ]}
          />
        }
        results={
          <>
            {/* The key to the three tones, in the order the eye reads them: most to least. Each marker is a small
            copy of a table cell: wider than tall, with the cell's fill and edge. A square would read as a checkbox. */}
            <ul
              aria-label="Key"
              className="flex flex-wrap items-center gap-x-5 gap-y-2 text-caption text-muted-foreground"
            >
              <li className="flex items-center gap-2">
                <span
                  aria-hidden="true"
                  className="h-3.5 w-6 rounded-sm bg-muted ring-1 ring-border ring-inset"
                />
                5 days a week or more
              </li>
              <li className="flex items-center gap-2">
                <span
                  aria-hidden="true"
                  className="h-3.5 w-6 rounded-sm bg-card ring-1 ring-border-strong ring-inset"
                />
                2 to 4 days
              </li>
              <li className="flex items-center gap-2">
                <span
                  aria-hidden="true"
                  className="h-3.5 w-6 rounded-sm bg-card ring-1 ring-border ring-inset"
                />
                1 day
              </li>
            </ul>
          </>
        }
      />

      {focus ? (
        <div className="mt-6 flex items-start gap-4 rounded-lg bg-card p-4 edge ring-border sm:p-5">
          <GymObject
            id={classObjects[focus.slug] ?? categoryObject[focus.category]}
            className="mt-0.5 size-8 shrink-0"
          />
          <div className="min-w-0 flex-1">
            <p className="text-body-strong">Times for {focus.name}</p>
            {focusTimes.length ? (
              <ul className="mt-1 grid gap-0.5 text-body text-muted-foreground">
                {focusTimes.map((t) => (
                  <li key={t.club.slug}>
                    {club === "all" ? (
                      <span className="text-foreground">{t.club.name}: </span>
                    ) : null}
                    {t.text}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-1 text-body text-muted-foreground">
                Not on at {clubName}. Pick another club.
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={() => {
              setFocusClass("")
              setFocusCat("")
            }}
            aria-label={`Hide the times for ${focus.name}`}
            className="-m-2 grid size-11 shrink-0 place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        </div>
      ) : null}

      <div className="mt-8 rounded-lg bg-card p-2 edge ring-border sm:p-4">
        <table className="w-full border-collapse text-left">
          <caption className="sr-only">
            When each type of class runs at {clubName}, by part of the day
          </caption>
          <thead className="max-md:sr-only">
            <tr className="[&>*]:rule-b">
              <th
                scope="col"
                className="w-[30%] px-3 pb-3 text-label text-muted-foreground"
              >
                Class type
              </th>
              {PARTS.map((p) => (
                <th
                  key={p.key}
                  scope="col"
                  className="px-1.5 pb-3 align-bottom"
                >
                  <span className="block text-label">{p.name}</span>
                  <span className="block text-caption font-normal text-muted-foreground">
                    {p.hours}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(({ cat, cells, weekly }) => {
              const on = focusCat === cat.id
              return (
                <tr
                  key={cat.id}
                  className={cn(
                    "max-md:grid max-md:grid-cols-4 max-md:gap-1 max-md:px-0 max-md:py-4 [&>*]:rule-b last:[&>*]:rule-b-0",
                    on && "bg-background"
                  )}
                >
                  <th
                    scope="row"
                    className="px-3 py-3 font-normal max-md:col-span-4 max-md:px-1 max-md:pt-0 max-md:pb-2"
                  >
                    <a
                      href={`#type-${cat.id}`}
                      aria-current={on ? "true" : undefined}
                      className="group flex items-center gap-3 no-underline"
                    >
                      <CategoryTile
                        category={cat.id}
                        className="size-9 shrink-0"
                      />
                      <span className="min-w-0">
                        <span className="flex flex-wrap items-center gap-x-2 text-body-strong">
                          <span className="underline-offset-4 group-hover:underline">
                            {cat.name}
                          </span>
                          {/* The row a link opened is named in text too, not by its fill alone. */}
                          {on ? (
                            <span className="rounded-sm bg-night px-1.5 text-caption text-night-foreground">
                              Selected
                            </span>
                          ) : null}
                        </span>
                        <span className="block text-caption text-muted-foreground tabular-nums">
                          {weekly} classes a week
                        </span>
                      </span>
                    </a>
                  </th>
                  {cells.map((c, i) => {
                    const n = c.days.length
                    const part = PARTS[i]
                    return (
                      <td key={part.key} className="p-0.5 md:p-1.5">
                        {/* Below md the column heads are hidden, so each cell names its part of the day. */}
                        <span
                          className="mb-1 block text-caption text-muted-foreground md:hidden"
                          aria-hidden="true"
                        >
                          {part.name}
                        </span>
                        {n ? (
                          <span
                            className={cn(
                              "flex min-h-11 flex-col justify-center rounded-md px-0.5 py-1.5 md:min-h-14 md:px-3 md:py-2",
                              n >= 5
                                ? "bg-muted"
                                : n >= 2
                                  ? "ring-1 ring-border-strong ring-inset"
                                  : "ring-1 ring-border ring-inset"
                            )}
                          >
                            <span className="text-label text-pretty">
                              <span className="whitespace-nowrap md:hidden">
                                {daysShort(c.days)}
                              </span>
                              <span className="max-md:hidden">
                                {daysWord(c.days)}
                              </span>
                            </span>
                            <span className="text-caption text-muted-foreground tabular-nums max-md:hidden">
                              {startsWord(c.starts)}
                            </span>
                          </span>
                        ) : (
                          <span className="flex min-h-11 items-center px-1.5 text-muted-foreground md:min-h-14 md:px-3">
                            <span aria-hidden="true">–</span>
                            <span className="sr-only">Not on</span>
                          </span>
                        )}
                      </td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
