"use client"

import { Fragment, useMemo, useState } from "react"
import { TextLink } from "@/components/brand/atoms"
import { CategoryTile } from "@/components/brand/graphics"
import { Toggle, ToggleGroup } from "@/components/graphical"
import { CalendarDays, X } from "@/components/icons"
import {
  useCatalog,
  useClubNow,
  useSessions,
} from "@/components/site/catalog-context"
import { classHref, scheduleUrl, typeHref } from "@/lib/links"
import { dayInfo, fmtTimeShort } from "@/lib/time"
import type { Category, ClassType, Club, Slot } from "@/lib/types"
import { cn } from "@/lib/utils"
import {
  DAY_SHORT,
  DAYS_LONG,
  daysShort,
  daysWord,
  PARTS,
  startsWord,
} from "./class-week"

/** The day picker runs Monday to Sunday, the way a week reads on a gym timetable. */
const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0]

type Day = "week" | number

/**
 * How often a type runs, short enough for a cell beside the panel: "Daily", "Mon–Fri", "Tue, Thu" or
 * "4 days". The panel gives the exact days, so a count is enough here.
 */
function daysCompact(days: number[]) {
  const key = days.join()
  if (days.length === 7) return "Daily"
  if (key === "1,2,3,4,5") return "Mon–Fri"
  if (key === "0,6") return "Sat–Sun"
  if (days.length <= 2) return days.map((d) => DAY_SHORT[d]).join(", ")
  return `${days.length} days`
}
/** A picked cell: a type, and one part of the day or the whole row. */
type Pick = { cat: string; part: number | "all" }

type Row = {
  cat: Category
  /** This club's slots of the type, on the picked day when there is one. */
  slots: Slot[]
  cells: { days: number[]; starts: number[]; n: number }[]
  /** Classes a week, or classes on the picked day. */
  total: number
}

/**
 * The classes at one club, in the form of the classes page's "When classes run" table (ClassWeek): a row for
 * each type, a column for each part of the day and a toned cell for how often it runs. It is that table for
 * one club, with two controls on it. The day picker turns the week into one day, so each cell shows the start
 * times. A cell or a type name opens the classes behind it: each class, its days, times, studio and coach.
 * With nothing picked, the panel shows the next classes here, so the section opens on what a visitor can
 * come to today. On a wide screen the panel sits beside the table; on a narrow one it opens under the row.
 */
export function ClubClassWeek({
  club,
  categories,
  classTypes,
  slots,
  className,
}: {
  club: Club
  categories: Category[]
  classTypes: ClassType[]
  slots: Slot[]
  className?: string
}) {
  const { weekday } = useClubNow()
  const [day, setDay] = useState<Day>("week")
  const [pick, setPick] = useState<Pick | null>(null)

  const byKey = useMemo(
    () => new Map(classTypes.map((c) => [c.key, c])),
    [classTypes]
  )
  const rows: Row[] = useMemo(() => {
    const here = slots.filter(
      (s) => s.club === club.slug && (day === "week" || s.days.includes(day))
    )
    return categories
      .map((cat) => {
        const list = here.filter(
          (s) => byKey.get(s.classKey)?.category === cat.id
        )
        const cells = PARTS.map((p) => {
          const inPart = list.filter((s) => s.start >= p.from && s.start < p.to)
          return {
            days: [...new Set(inPart.flatMap((s) => s.days))].sort(
              (a, b) => a - b
            ),
            starts: [...new Set(inPart.map((s) => s.start))].sort(
              (a, b) => a - b
            ),
            n: inPart.length,
          }
        })
        const total =
          day === "week"
            ? list.reduce((n, s) => n + s.days.length, 0)
            : list.length
        return { cat, slots: list, cells, total }
      })
      .filter((r) => r.total > 0)
  }, [slots, club.slug, day, categories, byKey])

  // A pick that the new day empties closes, so the panel never names classes the table does not show.
  const picked = pick
    ? rows.find(
        (r) =>
          r.cat.id === pick.cat &&
          (pick.part === "all" || r.cells[pick.part].n > 0)
      )
    : undefined
  const active = picked ? pick : null

  const toggle = (next: Pick) =>
    setPick((p) =>
      p && p.cat === next.cat && p.part === next.part ? null : next
    )
  const dayWord = day === "week" ? "" : DAYS_LONG[day]

  const detail =
    picked && active ? (
      <PickDetail
        row={picked}
        part={active.part}
        day={day}
        byKey={byKey}
        onClose={() => setPick(null)}
      />
    ) : null

  return (
    <div className={cn("grid gap-8 lg:grid-cols-12 lg:gap-12", className)}>
      <div className="flex flex-wrap items-center justify-between gap-x-8 gap-y-4 lg:col-span-12">
        {/* No scroll box here: a scroll box clips the focus ring. On a phone the days take their own full-width
            line under the week button, so all seven fit and the picked day stays in view. */}
        <ToggleGroup
          aria-label="Show the whole week or one day"
          value={[String(day)]}
          onValueChange={(v) => {
            if (v[0] !== undefined)
              setDay(v[0] === "week" ? "week" : Number(v[0]))
          }}
          className="flex flex-wrap items-center gap-3 max-sm:w-full"
        >
          {/* The week is the overview, not one more day, so it stands on its own beside the seven days.
              It is as tall as the day track (44 px buttons plus the track's 4 px padding on each side). */}
          <Toggle
            value="week"
            className="min-h-13 shrink-0 gap-2 rounded-lg px-4 edge ring-border not-data-pressed:bg-card"
          >
            <CalendarDays className="size-4" aria-hidden="true" />
            Whole week
          </Toggle>
          <div className="flex gap-0.5 rounded-lg bg-card p-1 edge ring-border max-sm:w-full sm:gap-1">
            {WEEK_ORDER.map((d) => (
              <Toggle
                key={d}
                value={String(d)}
                aria-label={`${DAYS_LONG[d]}${d === weekday ? ", today" : ""}`}
                className="relative min-h-11 min-w-0 flex-1 px-0 sm:min-w-12 sm:px-3"
              >
                {DAY_SHORT[d]}
                {/* Today keeps its place in the week, so a dot under the name marks it. The dot is out of
                    the flow, so the name stays on the same line as the other days. */}
                {d === weekday ? (
                  <span
                    aria-hidden="true"
                    className="absolute bottom-1.5 left-1/2 size-1 -translate-x-1/2 rounded-full bg-current"
                  />
                ) : null}
              </Toggle>
            ))}
          </div>
        </ToggleGroup>
        {day === "week" ? (
          <ul
            aria-label="Key"
            className="flex flex-wrap items-center gap-x-5 gap-y-2 text-caption text-muted-foreground"
          >
            <li className="flex items-center gap-2">
              <span
                aria-hidden="true"
                className="h-3.5 w-6 rounded-sm bg-muted ring-1 ring-border ring-inset"
              />
              5 days or more
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
        ) : (
          <p className="text-caption text-muted-foreground">
            Start times on {dayWord}. All times are Arizona time.
          </p>
        )}
      </div>

      <div className="min-w-0 lg:col-span-8">
        <div className="rounded-lg bg-card p-2 edge ring-border sm:p-4">
          <table className="w-full border-collapse text-left">
            <caption className="sr-only">
              When each type of class runs at {club.name}
              {dayWord ? ` on ${dayWord}` : ""}, by part of the day. Pick a cell
              to see its classes.
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
              {rows.map((row) => {
                const { cat, cells, total } = row
                const rowOn = active?.cat === cat.id
                return (
                  <Fragment key={cat.id}>
                    <tr
                      className={cn(
                        "max-md:grid max-md:grid-cols-4 max-md:gap-1.5 max-md:px-1 max-md:py-4 [&>*]:rule-b last:[&>*]:rule-b-0",
                        rowOn && "bg-background"
                      )}
                    >
                      <th
                        scope="row"
                        className="px-1.5 py-1.5 font-normal max-md:col-span-4 max-md:px-0 max-md:pt-0 max-md:pb-1"
                      >
                        <button
                          type="button"
                          aria-pressed={rowOn && active?.part === "all"}
                          aria-label={`${cat.name}, every class`}
                          onClick={() => toggle({ cat: cat.id, part: "all" })}
                          className={cn(
                            "group flex w-full items-center gap-3 rounded-md px-1.5 py-1.5 text-left hover:bg-muted",
                            rowOn &&
                              active?.part === "all" &&
                              "ring-2 ring-foreground ring-inset"
                          )}
                        >
                          <CategoryTile
                            category={cat.id}
                            className="size-9 shrink-0"
                          />
                          <span className="min-w-0">
                            <span className="block text-body-strong underline-offset-4 group-hover:underline">
                              {cat.name}
                            </span>
                            <span className="block text-caption text-muted-foreground tabular-nums">
                              {total} {total === 1 ? "class" : "classes"}{" "}
                              {day === "week" ? "a week" : "that day"}
                            </span>
                          </span>
                        </button>
                      </th>
                      {cells.map((c, i) => {
                        const part = PARTS[i]
                        const on = rowOn && active?.part === i
                        const strong = day === "week" ? c.days.length : c.n
                        return (
                          <td key={part.key} className="p-1 md:p-1.5">
                            {/* Below md the column heads are hidden, so each cell names its part of the day. */}
                            <span
                              className="mb-1 block text-caption text-muted-foreground md:hidden"
                              aria-hidden="true"
                            >
                              {part.name}
                            </span>
                            {c.n ? (
                              <button
                                type="button"
                                aria-pressed={on}
                                aria-label={`${cat.name}, ${part.name.toLowerCase()}: ${
                                  day === "week"
                                    ? daysWord(c.days)
                                    : `${c.n} ${c.n === 1 ? "class" : "classes"}`
                                }, ${startsWord(c.starts)}`}
                                onClick={() => toggle({ cat: cat.id, part: i })}
                                className={cn(
                                  "flex min-h-11 w-full flex-col justify-center rounded-md px-1.5 py-1.5 text-left transition-[box-shadow,background-color] hover:ring-2 hover:ring-foreground/40 motion-reduce:transition-none md:min-h-14 md:px-3 md:py-2",
                                  day === "week" && strong >= 5
                                    ? "bg-muted ring-1 ring-border ring-inset"
                                    : strong >= 2
                                      ? "ring-1 ring-border-strong ring-inset"
                                      : "ring-1 ring-border ring-inset",
                                  day !== "week" && "bg-muted",
                                  on &&
                                    "ring-2 ring-foreground hover:ring-foreground"
                                )}
                              >
                                <span className="text-label text-pretty">
                                  <span className="whitespace-nowrap md:hidden">
                                    {day === "week"
                                      ? daysShort(c.days)
                                      : `${c.n} ${c.n === 1 ? "class" : "classes"}`}
                                  </span>
                                  <span className="max-md:hidden">
                                    {day === "week"
                                      ? daysCompact(c.days)
                                      : startsWord(c.starts)}
                                  </span>
                                </span>
                                <span className="text-caption text-muted-foreground tabular-nums max-md:hidden">
                                  {day === "week"
                                    ? startsWord(c.starts)
                                    : `${c.n} ${c.n === 1 ? "class" : "classes"}`}
                                </span>
                              </button>
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
                    {/* Below lg the panel opens under its row, where the tap was. */}
                    {rowOn && detail ? (
                      <tr className="max-md:block lg:hidden">
                        <td colSpan={5} className="pb-3 max-md:block">
                          {detail}
                        </td>
                      </tr>
                    ) : null}
                  </Fragment>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      <aside
        aria-label={picked ? "Classes in the picked cell" : "Next classes"}
        className="min-w-0 lg:col-span-4"
      >
        <div className="lg:sticky lg:top-[calc(var(--sticky-top)+1.5rem)]">
          {detail ? <div className="max-lg:hidden">{detail}</div> : null}
          <div className={cn(detail && "lg:hidden")}>
            <UpNext club={club} />
          </div>
        </div>
      </aside>
    </div>
  )
}

/** The classes behind a picked cell or row: one entry per class, with each of its times as a line. */
function PickDetail({
  row,
  part,
  day,
  byKey,
  onClose,
}: {
  row: Row
  part: number | "all"
  day: Day
  byKey: Map<string, ClassType>
  onClose: () => void
}) {
  const { coachById } = useCatalog()
  const p = part === "all" ? null : PARTS[part]
  const inPick = row.slots
    .filter((s) => !p || (s.start >= p.from && s.start < p.to))
    .sort((a, b) => a.start - b.start)
  const classes = [...new Set(inPick.map((s) => s.classKey))]
    .map((k) => ({
      ct: byKey.get(k),
      times: inPick.filter((s) => s.classKey === k),
    }))
    .filter((x): x is { ct: ClassType; times: Slot[] } => Boolean(x.ct))
  const when = [
    p ? `${p.name}, ${p.hours.charAt(0).toLowerCase()}${p.hours.slice(1)}` : "",
    day === "week" ? "" : DAYS_LONG[day],
  ]
    .filter(Boolean)
    .join(" · ")
  return (
    <div className="rounded-lg bg-card p-5 edge ring-border">
      <div className="flex items-start gap-3">
        <CategoryTile category={row.cat.id} className="size-10 shrink-0" />
        <div className="min-w-0 flex-1">
          <h3 className="font-display-wide text-h3">{row.cat.name}</h3>
          <p className="text-caption text-muted-foreground">
            {when || "Every class this week"}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label={`Close ${row.cat.name}`}
          className="-m-2 grid size-11 shrink-0 place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <X className="size-4" aria-hidden="true" />
        </button>
      </div>
      <ul className="mt-4 rule-t">
        {classes.map(({ ct, times }) => (
          <li key={ct.key} className="py-4 rule-b">
            <a
              href={classHref(ct)}
              className="text-body-strong underline-offset-4 hover:underline"
            >
              {ct.name}
            </a>
            <p className="text-caption text-muted-foreground">
              {ct.duration} min
              {ct.firstTimer ? " · Good for a first class" : ""}
            </p>
            <ul className="mt-3 grid gap-2 text-body">
              {times.map((s) => {
                const coach = coachById(s.coachId)
                return (
                  <li
                    key={`${s.start}-${s.days.join()}`}
                    className="grid grid-cols-[4.5rem_minmax(0,1fr)] gap-x-3"
                  >
                    <span className="text-body-strong tabular-nums">
                      {fmtTimeShort(s.start)}
                    </span>
                    <span className="min-w-0">
                      {day === "week" ? (
                        <span className="block">{daysWord(s.days)}</span>
                      ) : null}
                      <span className="block text-caption text-muted-foreground">
                        {s.studio}
                        {coach ? ` · ${coach.name}` : ""}
                      </span>
                    </span>
                  </li>
                )
              })}
            </ul>
          </li>
        ))}
      </ul>
      <div className="mt-4">
        <TextLink href={typeHref(row.cat.id)}>About {row.cat.name}</TextLink>
      </div>
    </div>
  )
}

/** The next classes at the club, from now: what a visitor could come to today or tomorrow. */
function UpNext({ club }: { club: Club }) {
  const { sessions, now } = useSessions()
  const next = sessions
    .filter(
      (s) => s.clubSlug === club.slug && (s.day > 0 || s.start >= now.min)
    )
    .slice(0, 5)
  return (
    <div className="rounded-lg bg-card p-5 edge ring-border">
      <h3 className="font-display-wide text-h3">Up next</h3>
      <p className="text-caption text-muted-foreground">
        Pick a cell in the table to see its classes.
      </p>
      <ol className="mt-4 rule-t" aria-live="polite">
        {next.map((s) => {
          const d = dayInfo(s.day, now.dayNum)
          return (
            <li
              key={s.id}
              className="grid grid-cols-[5.5rem_minmax(0,1fr)] gap-x-3 py-3 rule-b"
            >
              <span className="tabular-nums">
                <span className="block text-body-strong">
                  {fmtTimeShort(s.start)}
                </span>
                <span className="block text-caption text-muted-foreground">
                  {s.day === 0 ? "Today" : s.day === 1 ? "Tomorrow" : d.long}
                </span>
              </span>
              <span className="min-w-0">
                <a
                  href={classHref({ slug: s.classSlug })}
                  className="block text-body-strong underline-offset-4 hover:underline"
                >
                  {s.className}
                </a>
                <span className="block text-caption text-muted-foreground">
                  {s.room}
                  {s.coach ? ` · ${s.coach}` : ""}
                </span>
              </span>
            </li>
          )
        })}
      </ol>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-x-6">
        <TextLink href={scheduleUrl({ club: club.slug })}>
          See full schedule
        </TextLink>
      </div>
    </div>
  )
}
