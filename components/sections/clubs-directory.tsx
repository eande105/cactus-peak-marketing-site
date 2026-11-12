"use client"

import Link from "next/link"
import { useMemo } from "react"
import { LinkButton } from "@/components/brand/atoms"
import { ClubPin } from "@/components/brand/club-pin"
import { facilityIcon, varyingFacilities } from "@/components/brand/facilities"
import { GymObject } from "@/components/brand/graphics"
import { useFinder, ZipFinder } from "@/components/site/club-switcher"
import type { AmenityKey, Club } from "@/lib/types"
import { cn } from "@/lib/utils"
import { FacilityIcons, FacilityLegend } from "./club-facility-key"

/*
 * Find your club: the ZIP search and the five club cards as its results, the one place on the clubs page a
 * visitor picks a club. The cards are there before a search, in map order with a dash where each distance
 * goes. A search fills in the miles and sorts the same cards nearest first, so nothing appears from nothing
 * and the section keeps its size. Each card names its city, so no city headings are needed.
 *
 * A card says who the club is and what is special there: its pin and name, the city, the type and size, one
 * line, its three highlights and the facility row of the club key. The full facts per offering are in
 * "What's at each club" (clubs-offerings.tsx), so the card does not list them again.
 */
export function ClubsDirectory({
  clubs,
  className,
}: {
  clubs: Club[]
  className?: string
}) {
  const f = useFinder()
  const d = f.distances
  const keys = useMemo(() => varyingFacilities(clubs), [clubs])
  const sorted = useMemo(
    () =>
      d
        ? [...clubs].sort((a, b) => (d[a.slug] ?? 99) - (d[b.slug] ?? 99))
        : clubs,
    [clubs, d]
  )
  return (
    <div className={cn("grid gap-xl lg:grid-cols-12 lg:gap-xxl", className)}>
      {/* The search holds still beside the taller cards on wide screens. */}
      <div className="self-start lg:sticky lg:top-24 lg:col-span-4">
        <ZipFinder f={f} idPrefix="cd" />
        {d ? (
          <button
            type="button"
            onClick={f.clear}
            className={cn(
              "inline-flex min-h-11 items-center",
              "mt-xs",
              "text-body-s underline-offset-4 font-heavy",
              "text-link",
              "hover:underline"
            )}
          >
            Clear distances
          </button>
        ) : null}
      </div>

      <div className="min-w-0 lg:col-span-8">
        {/* The status of the search and the legend for each card's facility row. */}
        <div className="flex flex-wrap items-center justify-between gap-x-l gap-y-xs pb-m rule-b">
          <p
            aria-live="polite"
            className="flex min-h-6 items-center gap-s text-body-s font-heavy"
          >
            <GymObject
              id="location"
              scheme={d ? "sand" : "mono"}
              className={cn("size-5 shrink-0", !d && "text-muted-foreground")}
            />
            {d ? (
              "Nearest first"
            ) : (
              <span className="text-muted-foreground">
                Your distance to each club shows here.
              </span>
            )}
          </p>
          <FacilityLegend keys={keys} />
        </div>

        <ol className="mt-l grid gap-m md:grid-cols-2">
          {sorted.map((c, i) => (
            <ClubCard
              key={c.slug}
              club={c}
              keys={keys}
              miles={d?.[c.slug]}
              nearest={Boolean(d) && i === 0}
            />
          ))}
        </ol>
      </div>
    </div>
  )
}

/**
 * One club. The card is a subgrid of its list's rows, so the bands line up across a row of cards: who the
 * club is, its three highlights, its facility row, then the two first steps. Every band has the same inset.
 * An odd last card keeps the same width as the others, so every card reads at one size.
 */
function ClubCard({
  club: c,
  keys,
  miles,
  nearest,
}: {
  club: Club
  keys: AmenityKey[]
  miles: number | undefined
  nearest: boolean
}) {
  return (
    <li
      className={cn(
        "row-span-4 grid grid-rows-subgrid gap-zero overflow-hidden hairline",
        "corner-m",
        "bg-card ring-border"
      )}
    >
      <div className="px-l pt-l pb-m">
        <div className="flex items-start justify-between gap-s">
          <h3 className="font-display-wide flex flex-wrap items-center gap-x-s gap-y-xxs text-body-l text-balance font-medium">
            <ClubPin n={c.n} />
            <Link
              href={`/clubs/${c.slug}`}
              className="no-underline underline-offset-4 hover:underline"
            >
              {c.name}
            </Link>
          </h3>
          {/* The distance, or a dash in the same place and size until a search fills it in. The nearest club's
              tag sits under its miles, so a long name keeps to its line. */}
          {miles !== undefined ? (
            <p className="tabular flex shrink-0 flex-col items-end gap-xxs text-body-m font-heavy">
              {miles.toFixed(1)} mi
              {nearest ? (
                <span className="corner-xs bg-accent px-xs text-body-s font-heavy">
                  Nearest
                </span>
              ) : null}
            </p>
          ) : (
            <p
              aria-hidden="true"
              className="tabular shrink-0 text-body-m font-heavy text-border-strong"
            >
              – mi
            </p>
          )}
        </div>
        <p className="mt-xxs text-body-s text-muted-foreground">{c.city}</p>
        <p className="text-body-s text-muted-foreground tabular-nums">
          {c.type} · {c.sqFt.toLocaleString("en-US")} sq ft
        </p>
        <p className="mt-s text-body-m text-pretty">{c.personality}</p>
      </div>

      {/* The three reasons to come, in cells split by rules, each with its object over its name. Below 21rem the
          cells stack as rows. Non-breaking hyphens keep "25-yd" and "Warm-water" whole. */}
      <div className="@container rule-y">
        <ul className="grid rule-rows @[21rem]:grid-cols-3 @[21rem]:rule-cols @[21rem]:rule-rows-0">
          {c.signature.map((s) => (
            <li
              key={s}
              className={cn(
                "flex items-center gap-s",
                "px-l py-s",
                "text-body-s text-balance break-words font-heavy",
                "@[21rem]:flex-col @[21rem]:px-s @[21rem]:py-m @[21rem]:text-center"
              )}
            >
              <GymObject
                id={facilityIcon(s)}
                className="size-6 shrink-0 @[21rem]:size-8"
              />
              {s.replaceAll("-", "‑")}
            </li>
          ))}
        </ul>
      </div>

      <div className="px-l py-m">
        <FacilityIcons club={c} keys={keys} />
      </div>

      {/* The two first steps at this club, both opening with the club picked. Below 22rem (a phone) the halves stack, so "Try a free 3-day pass" keeps its padding. */}
      <div className="@container content-start px-l pb-l">
        <div className="grid gap-s @[22rem]:grid-cols-2">
          <LinkButton href={`/tour?club=${c.slug}`} className="w-full">
            Book a free tour<span className="sr-only"> of {c.name}</span>
          </LinkButton>
          <LinkButton
            href={`/trial?club=${c.slug}`}
            variant="outline"
            className="w-full"
          >
            Try a free 3-day pass<span className="sr-only"> at {c.name}</span>
          </LinkButton>
        </div>
      </div>
    </li>
  )
}
