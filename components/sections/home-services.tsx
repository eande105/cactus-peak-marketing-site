import Link from "next/link"

import {
  GymObject,
  ObjectCrop,
  type ObjectId,
} from "@/components/brand/graphics"
import { courtTiles } from "@/components/sections/program-heroes"
import type { Club, Coach, Pack } from "@/lib/types"
import { cn } from "@/lib/utils"

type Service = {
  href: string
  name: string
  /** One line of facts the rest of Home does not show. It comes from the same data as the service's page. */
  fact: string
  object: ObjectId
  /** Where the object sits in its tile, so each tile is cut differently (VISUAL-IDENTITY.md, section 4). */
  crop: { x: number; y: number; scale: number }
}

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`

/** The five programs a membership opens past the gym floor, in the order a family weighs them. */
function services(clubs: Club[], coaches: Coach[], packs: Pack[]): Service[] {
  const kids = clubs.filter((c) => c.has.kids).length
  const pools = clubs.filter((c) => c.pool)
  const lanes = pools.reduce((n, c) => n + (c.pool?.lanes ?? 0), 0)
  const courts = clubs.reduce((n, c) => n + courtTiles(c).length, 0)
  const courtClubs = clubs.filter((c) => courtTiles(c).length > 0).length
  const recovery = clubs.filter((c) => c.recovery !== "none").length
  const ptCoaches = coaches.filter((c) => c.pt).length
  const cheapest = packs.length ? Math.min(...packs.map((p) => p.each)) : null
  return [
    {
      href: "/kids",
      name: "Kids club",
      fact: `Ages 6 months to 12, at ${plural(kids, "club")}`,
      object: "playground",
      crop: { x: 0.3, y: 0.38, scale: 1.05 },
    },
    {
      href: "/aquatics",
      name: "Pools & swim",
      fact: `${lanes} lap lanes and a warm pool`,
      object: "pool",
      crop: { x: 0.42, y: 0.22, scale: 0.95 },
    },
    {
      href: "/personal-training",
      name: "Personal training",
      fact:
        cheapest === null
          ? `${ptCoaches} coaches who take clients`
          : `${ptCoaches} coaches, from $${cheapest} a session`,
      object: "whistle",
      crop: { x: 0.3, y: 0.26, scale: 0.95 },
    },
    {
      href: "/courts",
      name: "Courts",
      fact: `${courts} courts at ${plural(courtClubs, "club")}`,
      object: "paddle",
      crop: { x: 0.46, y: 0.3, scale: 0.9 },
    },
    {
      href: "/recovery",
      name: "Recovery",
      fact: `Sauna, cold plunge and compression at ${recovery} clubs`,
      object: "spa-stones",
      crop: { x: 0.28, y: 0.4, scale: 1.1 },
    },
  ]
}

/**
 * Home "More than the gym floor.": the programs that the clubs and classes sections do not show, each as a cut
 * object tile, its name and one line of facts, so a visitor sees the whole club before the plans. The tiles
 * step down from the lit kids club in a stagger, so the row does not read as a uniform grid. Each name is the
 * column's one link. Below sm each program is a row: a small tile beside the name and the line.
 */
export function HomeServices({
  clubs,
  coaches,
  packs,
  className,
}: {
  clubs: Club[]
  coaches: Coach[]
  packs: Pack[]
  className?: string
}) {
  const list = services(clubs, coaches, packs)
  return (
    <ul
      className={cn(
        "grid gap-y-6 sm:grid-cols-3 sm:gap-x-6 sm:gap-y-12 lg:grid-cols-5",
        className
      )}
    >
      {list.map((s, i) => (
        <li
          key={s.href}
          className={cn(
            "group relative flex items-center gap-5 sm:flex-col sm:items-stretch sm:gap-0",
            // The stagger: every second column starts lower.
            i % 2 === 1 && "lg:mt-16"
          )}
        >
          {/* Decorative: the name follows. Kids club is lit in Copper, the others are Night. Below sm the
              tile is too small for a crop to read, so it holds the whole object. */}
          <div
            className={cn(
              "relative aspect-square w-16 shrink-0 overflow-hidden rounded-lg p-3 sm:aspect-[4/5] sm:w-full sm:p-0",
              i === 0 ? "bg-[var(--cat-strength)]" : "bg-night"
            )}
          >
            <GymObject
              id={s.object}
              scheme={i === 0 ? "copper" : "night"}
              className="sm:hidden"
            />
            <ObjectCrop
              id={s.object}
              ratio="4/5"
              scheme={i === 0 ? "copper" : "night"}
              {...s.crop}
              fill
              className="transition-transform duration-300 group-hover:scale-[1.03] motion-reduce:transition-none max-sm:hidden"
            />
          </div>
          <div className="min-w-0 sm:mt-5">
            <h3 className="font-display-wide text-h3 text-balance">
              {/* The name is the one link. Its ::after covers the column, so the tile is part of the target. */}
              <Link
                href={s.href}
                className="inline-flex min-h-11 items-center no-underline underline-offset-4 group-hover:underline after:absolute after:inset-0"
              >
                {s.name}
              </Link>
            </h3>
            <p className="text-body text-pretty text-muted-foreground">
              {s.fact}
            </p>
          </div>
        </li>
      ))}
    </ul>
  )
}
