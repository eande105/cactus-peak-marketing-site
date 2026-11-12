"use client"

import Link from "next/link"
import type { ComponentProps } from "react"

/** The window event that sets the schedule section's club and type from a link elsewhere on the page. */
export const SCHEDULE_FILTER_EVENT = "cp:schedule-filter"

/** What a link can ask the schedule section to show. It reads the club, the type and the class. */
export type Init = {
  club?: string
  category?: string
  classSlug?: string
  /** One band ("early") or a comma list ("early,evening"). Kept in links; the section does not read it. */
  time?: string
  /** An Arizona date, "2026-11-07", or "today". Kept in links; the section does not read it. */
  day?: string
  firstTimer?: boolean
  /** "2-4": the lowest and highest intensity. Kept in links; the section does not read it. */
  intensity?: string
}

/** The schedule's place on the classes page. Every link to class times opens it. */
export const SCHEDULE_ANCHOR = "schedule"

type Filter = Pick<
  Init,
  "club" | "classSlug" | "category" | "time" | "firstTimer" | "intensity"
> & { today?: boolean }

/** The address of the schedule with these filters, for a link from another page or a new tab. */
export function scheduleHref(f: Filter = {}) {
  const q = new URLSearchParams()
  if (f.club) q.set("club", f.club)
  if (f.classSlug) q.set("class", f.classSlug)
  if (f.category) q.set("category", f.category)
  if (f.time) q.set("time", f.time)
  if (f.firstTimer) q.set("firstTimer", "1")
  if (f.intensity) q.set("int", f.intensity)
  const s = q.toString()
  return `/classes${s ? `?${s}` : ""}#${SCHEDULE_ANCHOR}`
}

/**
 * A link to the schedule with a set of filters. On the classes page it sets the section's club and type in place and
 * scrolls to it, so the visitor keeps the page and the Back button. Anywhere else, or with a modifier key, it is
 * a plain link to the same filters in the address.
 */
export function ScheduleLink({
  filter = {},
  onPick,
  ...props
}: Omit<ComponentProps<typeof Link>, "href"> & {
  filter?: Filter
  /** Called after the board has the filters, for a parent that wants to know. */
  onPick?: () => void
}) {
  return (
    <Link
      {...props}
      href={scheduleHref(filter)}
      onClick={(e) => {
        props.onClick?.(e)
        const board = document.getElementById(SCHEDULE_ANCHOR)
        if (
          e.defaultPrevented ||
          !board ||
          e.metaKey ||
          e.ctrlKey ||
          e.shiftKey ||
          e.altKey ||
          e.button !== 0
        )
          return
        e.preventDefault()
        // The board keeps the hash when it writes its filters, so set it first: a reload then opens the schedule.
        window.history.replaceState(
          window.history.state,
          "",
          `${window.location.pathname}${window.location.search}#${SCHEDULE_ANCHOR}`
        )
        window.dispatchEvent(
          new CustomEvent<Init>(SCHEDULE_FILTER_EVENT, {
            detail: {
              club: filter.club,
              classSlug: filter.classSlug,
              category: filter.category,
              time: filter.time,
              firstTimer: filter.firstTimer,
              intensity: filter.intensity,
              day: filter.today ? "today" : undefined,
            },
          })
        )
        const reduce = window.matchMedia(
          "(prefers-reduced-motion: reduce)"
        ).matches
        // Scroll to the board's toolbar, so the results show and not the heading above them.
        const results =
          document.getElementById(`${SCHEDULE_ANCHOR}-board`) ?? board
        results.scrollIntoView({ behavior: reduce ? "auto" : "smooth" })
        // Focus moves with the view to the results, so the next Tab reaches the filters and the classes, not the
        // quick paths again.
        results.focus({ preventScroll: true })
        onPick?.()
      }}
    />
  )
}
