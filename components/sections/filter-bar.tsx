"use client"

import type React from "react"
import { useRef } from "react"
import { ListFilter, X } from "@/components/icons"
import { SelectBox } from "@/components/ui/controls"
import { cn } from "@/lib/utils"

/*
 * The site's one results toolbar, from the coaches page: a row between two hairlines, as on a shop's results page.
 * The filters sit on the left, behind a filter icon. The results side sits on the right: the count, the sort, and
 * any key or note about what the list shows. Every list that filters or sorts uses this bar, so counts and sorts
 * are never loose lines above or below a list. Removable chips for the active filters go under the bar.
 */

/** The bar. `filters` is the left side; `results` is the right side (a count, a sort, a key or a short note). */
export function FilterBar({
  filters,
  results,
  className,
}: {
  filters?: React.ReactNode
  results?: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-x-xl gap-y-m py-s rule-y",
        className
      )}
    >
      {filters ? (
        <div className="flex flex-wrap items-center gap-x-l gap-y-s">
          <ListFilter
            className="size-5 text-muted-foreground max-sm:hidden"
            aria-hidden="true"
          />
          {filters}
        </div>
      ) : null}
      {results ? (
        <div
          className={cn(
            "flex flex-wrap items-center gap-x-l gap-y-s",
            !filters && "w-full justify-between"
          )}
        >
          {results}
        </div>
      ) : null}
    </div>
  )
}

/** "5 of 31 coaches", read out when it changes. With no total, "5 coaches". */
export function ResultCount({
  shown,
  total,
  noun,
}: {
  shown: number
  total?: number
  /** The noun for one and for many: ["coach", "coaches"]. */
  noun: [string, string]
}) {
  const word = (total ?? shown) === 1 ? noun[0] : noun[1]
  return (
    <p aria-live="polite" className="tabular text-body-s font-heavy">
      {shown}
      <span className="font-regular text-muted-foreground">
        {total === undefined ? ` ${word}` : ` of ${total} ${word}`}
      </span>
    </p>
  )
}

/** The sort, as an inline select labelled "Sort". */
export function SortSelect<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T
  onChange: (v: T) => void
  options: { value: T; label: string }[]
}) {
  return (
    <SelectBox
      inline
      label="Sort"
      value={value}
      onChange={(v) => onChange(v as T)}
      options={options}
    />
  )
}

export type ActiveFilter = { key: string; label: string; clear: () => void }

/**
 * One chip for each active filter, each removing its filter, then "Clear filters". Nothing when no filter is on.
 * A chip removes itself, so focus moves on to the next chip, or to the first filter control when none is left.
 */
export function ActiveFilters({
  items,
  onClearAll,
  className,
}: {
  items: (ActiveFilter | false | null | undefined | "")[]
  onClearAll: () => void
  className?: string
}) {
  const list = useRef<HTMLUListElement>(null)
  const on = items.filter((x): x is ActiveFilter => Boolean(x))
  if (!on.length) return null
  // After React removes the chip, focus the chip that took its place, else the bar's first control.
  const refocus = (index: number) => {
    const ul = list.current
    const bar = ul?.previousElementSibling
    requestAnimationFrame(() => {
      const chips = ul?.isConnected
        ? ul.querySelectorAll<HTMLButtonElement>("button[data-chip]")
        : undefined
      const next = chips?.[Math.min(index, chips.length - 1)]
      ;(
        next ?? bar?.querySelector<HTMLElement>("button, input, [tabindex]")
      )?.focus()
    })
  }
  return (
    <ul
      ref={list}
      aria-label="Active filters"
      className={cn("mt-m flex flex-wrap gap-xs", className)}
    >
      {on.map((f, i) => (
        <li key={f.key}>
          <button
            type="button"
            data-chip
            onClick={() => {
              f.clear()
              refocus(i)
            }}
            className={cn(
              "flex min-h-9 items-center gap-xs hairline",
              "corner-full py-xxs pr-s pl-m",
              "text-body-s font-heavy",
              "bg-card ring-border",
              "hover:bg-muted"
            )}
          >
            {f.label}
            <X className="size-4" aria-hidden="true" />
            <span className="sr-only">: remove filter</span>
          </button>
        </li>
      ))}
      <li>
        <button
          type="button"
          onClick={() => {
            onClearAll()
            refocus(0)
          }}
          className={cn(
            "flex min-h-9 items-center",
            "px-xs",
            "text-body-s underline decoration-[color-mix(in_oklab,currentColor_40%,transparent)] underline-offset-4 font-heavy",
            "text-link",
            "hover:decoration-current"
          )}
        >
          Clear filters
        </button>
      </li>
    </ul>
  )
}
