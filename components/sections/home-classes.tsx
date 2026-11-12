"use client"

import Link from "next/link"
import { type CategoryId, CategoryTile } from "@/components/brand/graphics"
import { IntensityRibs } from "@/components/brand/meters"
import { useCatalog } from "@/components/site/catalog-context"
import { classHref, typeHref } from "@/lib/links"
import type { ClassType } from "@/lib/types"

/**
 * Home "Eight ways to move." body, in two parts. First the eight kinds of class, because the heading
 * names them: the Tile, the name and the count, one link each. Then three popular classes, each the name,
 * one line and how long and how hard. The full list lives on /classes.
 * The hero and the clubs are card layouts with Night and Copper Racks. This section has no cards: the
 * parts sit on the band between rules, and the graphic is the cut Tile in each category's own colour,
 * the one place the brand allows category colour (VISUAL-IDENTITY.md, sections 4 and 5).
 */
export function HomeClasses({ className }: { className?: string }) {
  const { popularNow, classBySlug, categories } = useCatalog()
  // The first three popular classes: a ride, a yoga flow and a lift, so three kinds and three effort levels.
  const featured = popularNow
    .map(classBySlug)
    .filter((c): c is ClassType => Boolean(c))
    .slice(0, 3)
  return (
    <div className={className}>
      <nav aria-label="Class types">
        <ul className="grid grid-cols-2 gap-x-l gap-y-m sm:grid-cols-4 sm:gap-y-l lg:grid-cols-8">
          {categories.map((c) => (
            <li key={c.id}>
              <Link
                href={typeHref(c.id)}
                className="group flex min-h-11 items-center gap-s no-underline sm:flex-col sm:items-start"
              >
                <CategoryTile
                  category={c.id as CategoryId}
                  cut
                  className="size-10 shrink-0 sm:size-12"
                />
                <span className="text-body-m group-hover:underline font-heavy">
                  {c.name}
                  <span className="ml-xs font-regular text-muted-foreground tabular-nums">
                    {c.count}
                    <span className="sr-only"> classes</span>
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <h3 className="font-display-wide mt-section text-body-xxl lg:mt-[calc(var(--space-xxl)*5/3)] font-heavy">
        Popular now
      </h3>
      <ul className="mt-l grid rule-y max-lg:rule-rows lg:grid-cols-3 lg:rule-cols">
        {featured.map((c) => (
          <li
            key={c.slug}
            className="group relative flex flex-col py-xl lg:px-xl lg:first:pl-zero lg:last:pr-zero"
          >
            <div className="flex items-center gap-s">
              {/* Decorative: the category name follows. */}
              <CategoryTile
                category={c.category}
                cut
                className="size-8 shrink-0"
              />
              <span className="text-body-s text-muted-foreground font-heavy">
                {c.categoryName}
              </span>
            </div>
            <h4 className="font-display-wide mt-m text-body-l font-medium">
              {/* The name is the one link. Its ::after covers the column, so the column is one target. */}
              <Link
                href={classHref(c)}
                className="inline-flex min-h-11 items-center underline-offset-4 group-hover:underline after:absolute after:inset-0"
              >
                {c.name}
              </Link>
            </h4>
            <p className="mt-xs max-w-[42ch] text-body-m text-pretty text-muted-foreground">
              {c.blurb}
            </p>
            {/* The two facts a first visit turns on: how long and how hard. */}
            <p className="mt-m flex flex-wrap items-center gap-x-s gap-y-xxs text-body-s font-heavy">
              <span className="tabular-nums">{c.duration} min</span>
              <span aria-hidden="true" className="text-muted-foreground">
                ·
              </span>
              <IntensityRibs level={c.intensity} categoryId={c.category} />
            </p>
          </li>
        ))}
      </ul>
    </div>
  )
}
