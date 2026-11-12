import { fmtTime } from "@/lib/time"
import type { Club, Slot } from "@/lib/types"

/*
 * When a class runs, per club. The same class can start at different times at different clubs, so
 * one "first to last" range reads wrongly (a 120-minute class does not run 9:30 to 10:00).
 */

const DAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

/** "Every day", "Weekdays" or "Mon, Wed, Fri". */
export function dayLabel(days: number[]) {
  const d = [...new Set(days)].sort((a, b) => a - b)
  if (d.length === 7) return "Every day"
  if (d.join() === "1,2,3,4,5") return "Weekdays"
  return d.map((x) => DAY_SHORT[x]).join(", ")
}

/** "9 am" or "9 am and 10:30 am" */
const startsText = (starts: number[]) =>
  starts.length <= 3
    ? starts.map((m) => fmtTime(m)).join(" and ")
    : `${fmtTime(starts[0])} to ${fmtTime(starts.at(-1)!)}`

export type ClubTimes = {
  club: Club
  days: number[]
  starts: number[]
  /** The room or pool the timetable names. */
  studio: string
  /** "Mon, Wed · 9:30 am" */
  text: string
}

/** One entry per club that runs the class, in club order. */
export function timesByClub(
  slots: Slot[],
  classKey: string,
  clubs: Club[]
): ClubTimes[] {
  return clubs.flatMap((club) => {
    const own = slots.filter(
      (s) => s.classKey === classKey && s.club === club.slug
    )
    if (!own.length) return []
    const days = [...new Set(own.flatMap((s) => s.days))].sort((a, b) => a - b)
    const starts = [...new Set(own.map((s) => s.start))].sort((a, b) => a - b)
    return [
      {
        club,
        days,
        starts,
        studio: own[0].studio,
        text: `${dayLabel(days)} · ${startsText(starts)}`,
      },
    ]
  })
}

/**
 * One line for a class: the days and the start times. If the clubs differ in days or start times, it
 * names each club's own days and times instead of a range.
 */
export function whenLine(slots: Slot[], classKey: string, clubs: Club[]) {
  const per = timesByClub(slots, classKey, clubs)
  if (!per.length) return null
  const same = per.every((p) => p.text === per[0].text)
  if (same) return per[0].text
  return per.map((p) => `${p.club.short}: ${p.text}`).join("; ")
}
