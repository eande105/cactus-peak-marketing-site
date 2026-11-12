import Link from "next/link"

import { facility, varyingFacilities } from "@/components/brand/facilities"
import { GymObject, type ObjectId } from "@/components/brand/graphics"
import type { AmenityKey, Club } from "@/lib/types"
import { cn } from "@/lib/utils"
import { ClubPin } from "@/components/brand/club-pin"

/**
 * The club key: each club as its map pin and name, with every facility object, struck through where the
 * club does not have it. It is the one place a section says where a facility is, so the lines around it can
 * say "Courts at 3 clubs" without listing the clubs again. The clubs page shows it above the plan cards, and
 * each club page shows it above its plans, with that club marked. Only the facilities that differ between
 * clubs show; the legend above names them with the same objects, in the same order.
 *
 * Its two parts, the legend and one club's icon row, are exported so the phone menu's club switcher can show
 * the same key in its results.
 */
export function ClubFacilityKey({
  clubs,
  current,
  className,
}: {
  clubs: Club[]
  /** The club whose page this is. Its cell is marked "This club" and does not link to itself. */
  current?: Club["slug"]
  className?: string
}) {
  const keys = varyingFacilities(clubs)
  return (
    <div className={className}>
      <FacilityLegend keys={keys} />

      <ul className="mt-3 grid overflow-hidden rounded-lg bg-card edge ring-border md:grid-cols-5">
        {clubs.map((c, i) => (
          <li
            key={c.slug}
            className={cn(
              "relative flex items-center justify-between gap-3 px-4 py-3 md:flex-col md:items-start md:justify-between md:py-4",
              i > 0 && "max-md:rule-t md:rule-l",
              // The page's own club: the Copper bar the featured plan card uses, along its top edge.
              c.slug === current &&
                "before:absolute before:inset-x-0 before:top-0 before:h-1 before:bg-primary"
            )}
          >
            {c.slug === current ? (
              <span
                aria-current="page"
                className="flex min-h-11 flex-wrap items-center gap-x-2 gap-y-1 text-label md:min-h-0"
              >
                <ClubPin n={c.n} />
                {c.short}
                <span className="rounded-sm bg-accent px-1.5 text-caption font-semibold whitespace-nowrap">
                  This club
                </span>
              </span>
            ) : (
              <Link
                href={`/clubs/${c.slug}`}
                className="flex min-h-11 items-center gap-2 text-label no-underline underline-offset-4 hover:underline md:min-h-0"
              >
                <ClubPin n={c.n} />
                {c.short}
              </Link>
            )}
            <FacilityIcons club={c} keys={keys} />
          </li>
        ))}
      </ul>
    </div>
  )
}

/** The key's legend: each facility object with its name, then the struck sample for "Not at this club". */
export function FacilityLegend({
  keys,
  className,
}: {
  keys: AmenityKey[]
  className?: string
}) {
  return (
    <ul
      aria-label="Facilities"
      className={cn(
        "flex flex-wrap gap-x-5 gap-y-2 text-caption text-muted-foreground",
        className
      )}
    >
      {keys.map((k) => (
        <li key={k} className="flex items-center gap-1.5">
          <GymObject id={facility[k].object} className="size-5 shrink-0" />
          {facility[k].label}
        </li>
      ))}
      {keys[0] ? (
        <li className="flex items-center gap-1.5">
          {/* The legend sits on whatever band or panel holds it, so its slash goes without the ring. */}
          <MissingFacility
            id={facility[keys[0]].object}
            ringless
            className="size-5"
          />
          Not at this club
        </li>
      ) : null}
    </ul>
  )
}

/**
 * One club's facilities: every facility in `keys`, in the legend's order, so one facility lines up down a list
 * and across a row. A facility the club does not have is dimmed and struck through. The text for screen
 * readers names what the club has and what it lacks.
 */
export function FacilityIcons({
  club,
  keys,
  ringless = false,
  className,
}: {
  club: Club
  keys: AmenityKey[]
  /** True on a fill other than the card colour, where the slash's card-colour ring would show. */
  ringless?: boolean
  className?: string
}) {
  return (
    <span className={cn("flex gap-2", className)}>
      {keys.map((k) =>
        club.has[k] ? (
          <GymObject
            key={k}
            id={facility[k].object}
            className="size-6 shrink-0"
          />
        ) : (
          <MissingFacility
            key={k}
            id={facility[k].object}
            ringless={ringless}
          />
        )
      )}
      <span className="sr-only">
        {[
          ...keys.filter((k) => club.has[k]).map((k) => facility[k].label),
          ...keys
            .filter((k) => !club.has[k])
            .map((k) => `no ${facility[k].label.toLowerCase()}`),
        ].join(", ")}
      </span>
    </span>
  )
}

/**
 * A facility a club does not have: its object in a faint tone with a slash across it. On the card the slash has
 * a ring in the card colour, so it cuts the object instead of sitting on it. Decorative; the text says it.
 */
export function MissingFacility({
  id,
  ringless = false,
  className,
}: {
  id: ObjectId
  ringless?: boolean
  className?: string
}) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "relative grid size-6 shrink-0 place-items-center",
        className
      )}
    >
      <GymObject
        id={id}
        scheme="mono"
        className="size-full text-border-strong"
      />
      <span
        className={cn(
          "absolute top-1/2 left-1/2 h-0.5 w-[130%] -translate-x-1/2 -translate-y-1/2 -rotate-45 rounded-full bg-muted-foreground",
          !ringless && "ring-2 ring-card"
        )}
      />
    </span>
  )
}
