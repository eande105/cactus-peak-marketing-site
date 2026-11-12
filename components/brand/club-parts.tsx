"use client"

import Link from "next/link"
import { Fragment } from "react"
import { Clock } from "@/components/icons"
import { useClubNow } from "@/components/site/catalog-context"
import { PHONE_HOURS, PHONE_HOURS_MIN } from "@/lib/labels"
import {
  clubStatus,
  fmtClock,
  fmtRange,
  POOL_CLOSES_EARLY_MIN,
  WEEKDAY_HOURS,
  WEEKEND_HOURS,
} from "@/lib/time"
import type { Club } from "@/lib/types"
import { cn } from "@/lib/utils"
import { ClubArt } from "./club-art"
import { type ClubId, clubObjects } from "./graphics"

export const isClubId = (slug: string): slug is ClubId => slug in clubObjects

export function StatusLine({
  className,
  showHours,
  tone = "page",
}: {
  className?: string
  showHours?: boolean
  /** "night": on a Saguaro Night panel, where the page's foreground and muted tones do not hold. */
  tone?: "page" | "night"
}) {
  const s = clubStatus(useClubNow())
  const Icon = s.state === "open" ? "dot" : Clock
  const night = tone === "night"
  return (
    <span
      className={cn(
        "inline-flex flex-wrap items-center gap-x-xs text-body-s font-medium",
        night ? "text-night-foreground" : "text-foreground",
        className
      )}
    >
      {Icon === "dot" ? (
        <span aria-hidden="true" className="size-2 corner-full bg-success" />
      ) : (
        <Clock className="size-3.5 text-warning" aria-hidden="true" />
      )}
      {s.text}
      {showHours ? (
        <span
          className={cn(
            "font-regular",
            night ? "text-night-muted" : "text-muted-foreground"
          )}
        >
          ({s.hours} today)
        </span>
      ) : null}
    </span>
  )
}

/** A club as one linked row: its picture, name, type and open status. */
export function ClubCard({
  club,
  yourClub,
  className,
}: {
  club: Club
  yourClub?: boolean
  className?: string
}) {
  const status = clubStatus(useClubNow())
  const href = `/clubs/${club.slug}`
  return (
    <Link
      href={href}
      className={cn(
        "group flex min-h-16 items-center gap-s",
        "corner-m px-xs py-xs",
        "hover:bg-muted",
        className
      )}
    >
      <ClubArt
        slug={club.slug}
        detail="simple"
        className="w-14 shrink-0 corner-xs"
      />
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-xs text-body-s font-heavy">
          {club.name}
          {yourClub ? (
            <span className="corner-xs bg-accent px-xs text-body-s text-foreground">
              Your club
            </span>
          ) : null}
        </span>
        <span className="block text-body-s text-muted-foreground">
          {club.type}
          <span aria-hidden="true"> · </span>
          <span className="text-foreground">{status.text}</span>
        </span>
      </span>
      <span
        aria-hidden="true"
        className="text-muted-foreground transition-transform group-hover:translate-x-0.5"
      >
        →
      </span>
    </Link>
  )
}

/** Weekdays | weekend, today bold with a Today tag (spec: HoursTable). */
export function HoursTable({
  compact,
  className,
  kids,
  pool,
}: {
  compact?: boolean
  className?: string
  kids?: boolean
  pool?: boolean
}) {
  const { weekday } = useClubNow()
  const today = { weekend: weekday === 0 || weekday === 6 }
  const rows: { label: string; hours: string; isToday: boolean }[] = pool
    ? [
        {
          label: "Mon–Fri",
          hours: fmtRange(270, 21 * 60 + 30),
          isToday: !today.weekend,
        },
        {
          label: "Sat–Sun",
          hours: fmtRange(360, 19 * 60 + 30),
          isToday: today.weekend,
        },
      ]
    : [
        {
          label: "Mon–Fri",
          hours: fmtRange(270, 22 * 60),
          isToday: !today.weekend,
        },
        {
          label: "Sat–Sun",
          hours: fmtRange(360, 20 * 60),
          isToday: today.weekend,
        },
      ]
  return (
    <dl
      className={cn(
        "grid gap-y-xs text-body-s",
        compact ? "grid-cols-2 gap-x-m" : "grid-cols-[auto_1fr] gap-x-xl",
        className
      )}
    >
      {rows.map((r) => (
        <Fragment key={r.label}>
          <dt
            className={cn(
              r.isToday ? "font-heavy text-foreground" : "text-muted-foreground"
            )}
          >
            {r.label}
            {r.isToday ? (
              <span className="ml-xs corner-xs bg-accent px-xs py-xxs text-body-s text-foreground">
                Today
              </span>
            ) : null}
          </dt>
          <dd className={cn("tabular", r.isToday ? "font-heavy" : "")}>
            {r.hours}
          </dd>
        </Fragment>
      ))}
      {!compact && !pool ? (
        <>
          <dt className="text-muted-foreground">Desk and phone</dt>
          <dd className="tabular">{PHONE_HOURS}</dd>
          {kids ? (
            <>
              <dt className="text-muted-foreground">Kids club</dt>
              <dd className="tabular">Mon–Sat 8 am–12 pm and 4–8 pm</dd>
            </>
          ) : null}
        </>
      ) : null}
    </dl>
  )
}

type HoursGroup = {
  name: string
  rows: { when: string; hours: readonly [number, number]; today?: boolean }[]
}

/**
 * A club's hours, grouped by facility or service: the club, the pool, the kids club and the desk. Each group
 * has a row for each set of days (or each part of the day), and the opening and closing times sit in their own
 * columns, so no dash joins them. Today's club row is bold with a Today tag.
 */
export function ClubHours({
  club,
  className,
}: {
  club: Club
  className?: string
}) {
  const { weekday } = useClubNow()
  const weekend = weekday === 0 || weekday === 6
  const pool = (h: readonly [number, number]) =>
    [h[0], h[1] - POOL_CLOSES_EARLY_MIN] as const
  const groups: HoursGroup[] = [
    {
      name: "Club",
      rows: [
        { when: "Weekdays", hours: WEEKDAY_HOURS, today: !weekend },
        { when: "Weekends", hours: WEEKEND_HOURS, today: weekend },
      ],
    },
    ...(club.has.pool
      ? [
          {
            name: "Pool",
            rows: [
              { when: "Weekdays", hours: pool(WEEKDAY_HOURS) },
              { when: "Weekends", hours: pool(WEEKEND_HOURS) },
            ],
          },
        ]
      : []),
    ...(club.has.kids
      ? [
          {
            name: "Kids club",
            rows: [
              {
                when: "Mornings, Mon to Sat",
                hours: [8 * 60, 12 * 60] as const,
              },
              {
                when: "Evenings, Mon to Sat",
                hours: [16 * 60, 20 * 60] as const,
              },
            ],
          },
        ]
      : []),
    {
      name: "Desk and phone",
      rows: [{ when: "Every day", hours: PHONE_HOURS_MIN }],
    },
  ]
  // pl-3 on phones: at 320 px the "Today" tag and two times need every pixel of the row.
  const cell = "py-xs pl-s text-right whitespace-nowrap tabular-nums sm:pl-m"
  return (
    <table className={cn("w-full text-left text-body-m", className)}>
      <caption className="sr-only">Hours at {club.name}</caption>
      <thead>
        <tr className="text-body-s text-muted-foreground [&>*]:rule-b font-heavy">
          <td className="pb-xs" />
          <th scope="col" className="pb-xs pl-s text-right font-medium sm:pl-m">
            Opens
          </th>
          <th scope="col" className="pb-xs pl-s text-right font-medium sm:pl-m">
            Closes
          </th>
        </tr>
      </thead>
      {groups.map((g) => (
        <tbody
          key={g.name}
          className="[&>tr:last-child>*]:pb-s [&>tr:last-child>*]:rule-b"
        >
          <tr>
            <th
              scope="colgroup"
              colSpan={3}
              className="pt-s pb-xxs text-body-m font-heavy"
            >
              {g.name}
            </th>
          </tr>
          {g.rows.map((r) => (
            <tr key={r.when} className={cn(r.today && "font-heavy")}>
              <th
                scope="row"
                className={cn(
                  "py-xs pr-xs font-regular",
                  r.today ? "font-heavy" : "text-muted-foreground"
                )}
              >
                <span className="sr-only">{g.name}, </span>
                {r.when}
                {r.today ? (
                  <span
                    className={cn(
                      "ml-xs corner-xs px-xs py-xxs",
                      "text-body-s font-regular",
                      "bg-accent text-foreground"
                    )}
                  >
                    Today
                  </span>
                ) : null}
              </th>
              {r.hours.map((min, i) => (
                <td key={i === 0 ? "open" : "close"} className={cell}>
                  {fmtClock(min)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      ))}
    </table>
  )
}
