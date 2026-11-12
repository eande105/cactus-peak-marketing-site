"use client"

import { Minus, Plus } from "@/components/icons"
import { BrandMap, BrandPin } from "@/components/map/brand-map"
import { useCatalog } from "@/components/site/catalog-context"
import type { ClubSlug } from "@/lib/types"
import { cn } from "@/lib/utils"

const control =
  "inline-flex size-11 items-center justify-center rounded-md bg-card edge ring-border-strong hover:bg-muted"

/** Brand map of Mesa and Gilbert with a Rib Peak pin for each club (components/map/brand-map.tsx). */
export function ClubMap({
  activeSlug,
  onSelect,
  hidden = [],
  only,
  className,
  interactive = true,
}: {
  activeSlug?: ClubSlug | null
  onSelect?: (s: ClubSlug) => void
  hidden?: ClubSlug[]
  only?: ClubSlug
  className?: string
  interactive?: boolean
}) {
  const { clubs } = useCatalog()
  const pins = clubs
    .filter((c) => (only ? c.slug === only : !hidden.includes(c.slug)))
    .map((c) => ({ ...c, id: c.slug }))
  return (
    <BrandMap
      pins={pins}
      focus={only}
      zoom={14.5}
      selected={only ?? activeSlug}
      interactive={interactive}
      label={
        only
          ? `Map of ${pins[0]?.name ?? "the club"} and the streets around it`
          : "Map of Mesa and Gilbert showing the clubs"
      }
      className={cn("rounded-lg edge ring-border", className)}
      fallback={
        <p className="text-body text-muted-foreground">
          The map did not load. Each club page lists its address.
        </p>
      }
      renderPin={(c, on) => (
        <button
          type="button"
          disabled={!onSelect}
          onClick={() => onSelect?.(c.slug)}
          aria-pressed={onSelect ? on : undefined}
          aria-label={onSelect ? `${c.name} on the map` : c.name}
          className="rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus disabled:cursor-default"
        >
          <BrandPin
            active={on}
            chipClassName={cn(
              "rounded-sm px-1.5 py-0.5 text-caption font-semibold whitespace-nowrap",
              on
                ? "bg-primary text-primary-foreground"
                : "bg-card text-foreground edge ring-border"
            )}
          >
            {c.short}
          </BrandPin>
        </button>
      )}
      renderControls={({ zoomIn, zoomOut }) => (
        <div className="flex flex-col gap-2">
          <button
            type="button"
            aria-label="Zoom in"
            onClick={zoomIn}
            className={control}
          >
            <Plus className="size-5" aria-hidden="true" />
          </button>
          <button
            type="button"
            aria-label="Zoom out"
            onClick={zoomOut}
            className={control}
          >
            <Minus className="size-5" aria-hidden="true" />
          </button>
        </div>
      )}
    />
  )
}
