import Link from "next/link"
import type { ReactNode } from "react"

import { GymObject, type ObjectId } from "@/components/brand/graphics"
import { cn } from "@/lib/utils"

/** One column of a fact table: its head, and an optional object for the head and the stacked list. */
export type FactColumn = { label: string; icon?: ObjectId; numeric?: boolean }

/** One row: the thing it is about (a club, mostly), with a link, and one value for each column. */
export type FactRow = {
  key: string
  title: string
  href?: string
  /** A quiet line under the title, such as the city. */
  sub?: string
  values: ReactNode[]
}

/** A value that means "not here": a visible dash for the eye, and words for a screen reader. */
export function NotHere({ label = "No" }: { label?: string }) {
  return (
    <>
      <span aria-hidden="true" className="text-muted-foreground">
        —
      </span>
      <span className="sr-only">{label}</span>
    </>
  )
}

function RowTitle({ row, className }: { row: FactRow; className: string }) {
  return row.href ? (
    <Link
      href={row.href}
      className={cn(
        "no-underline underline-offset-4 hover:underline",
        className
      )}
    >
      {row.title}
    </Link>
  ) : (
    <span className={className}>{row.title}</span>
  )
}

/**
 * The stacked form of a fact table on its own: one block for each row, with each value under its column's
 * name, two to a line. A page with a table that does not fit the FactTable model (the clubs comparison,
 * which puts the clubs across the top) uses it for the small screens.
 */
export function FactStack({
  caption,
  columns,
  rows,
  framed = false,
  className,
}: {
  caption: string
  columns: FactColumn[]
  rows: FactRow[]
  framed?: boolean
  className?: string
}) {
  return (
    <ul
      aria-label={caption}
      className={cn(
        framed ? "grid gap-4 md:grid-cols-2" : "rule-y rule-heavy",
        className
      )}
    >
      {rows.map((r) => (
        <li
          key={r.key}
          className={cn(
            framed
              ? "rounded-lg bg-card p-5 edge ring-border"
              : "py-5 rule-t first:rule-t-0"
          )}
        >
          <h3>
            <RowTitle
              row={r}
              className="font-display-wide inline-flex min-h-11 items-center text-h3"
            />
          </h3>
          {r.sub ? (
            <p className="text-caption text-muted-foreground">{r.sub}</p>
          ) : null}
          <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3">
            {r.values.map((v, i) => (
              <div key={columns[i].label} className="min-w-0">
                <dt className="flex items-center gap-2 text-caption text-muted-foreground">
                  {columns[i].icon ? (
                    <GymObject
                      id={columns[i].icon}
                      className="size-5 shrink-0"
                    />
                  ) : null}
                  {columns[i].label}
                </dt>
                <dd
                  className={cn(
                    "mt-0.5 text-body text-pretty",
                    columns[i].numeric && "tabular-nums"
                  )}
                >
                  {v}
                </dd>
              </div>
            ))}
          </dl>
        </li>
      ))}
    </ul>
  )
}

const shown = { md: "max-md:hidden", lg: "max-lg:hidden" } as const
const stacked = { md: "md:hidden", lg: "lg:hidden" } as const

/**
 * A table of facts by row (by club, mostly) that never scrolls sideways. From the breakpoint it is a table
 * that fits its column. Below it, the columns do not fit, and a sideways table hides which column a value
 * belongs to, so each row becomes a block: the title, then each value under its column's name. The
 * membership page uses the same pattern for the plan comparison and the clubs-by-plan table.
 *
 * `corner` names the row heads, so the top-left cell labels the column of titles instead of sitting empty.
 * `framed` sets the table in a card; otherwise it sits between two heavy rules, as the dense sections do.
 */
export function FactTable({
  caption,
  corner,
  columns,
  rows,
  breakpoint = "md",
  framed = false,
  className,
}: {
  caption: string
  corner: string
  columns: FactColumn[]
  rows: FactRow[]
  breakpoint?: "md" | "lg"
  framed?: boolean
  className?: string
}) {
  return (
    <div className={className}>
      <div
        className={cn(
          shown[breakpoint],
          framed
            ? "overflow-hidden rounded-lg bg-card edge ring-border"
            : "rule-y rule-heavy"
        )}
      >
        <table className="w-full border-collapse text-left text-body">
          <caption className="sr-only">{caption}</caption>
          <thead>
            <tr className="align-bottom">
              <th
                scope="col"
                className={cn(
                  "py-4 pr-4 text-caption font-semibold text-muted-foreground",
                  framed ? "pl-6" : "pl-3"
                )}
              >
                {corner}
              </th>
              {columns.map((c) => (
                <th
                  key={c.label}
                  scope="col"
                  className="px-3 py-4 text-caption font-semibold text-muted-foreground"
                >
                  {c.icon ? (
                    <GymObject id={c.icon} className="mb-2 block size-7" />
                  ) : null}
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.key} className="align-top [&>*]:rule-t">
                <th
                  scope="row"
                  className={cn(
                    "py-4 pr-4 font-normal",
                    framed ? "pl-6" : "pl-3"
                  )}
                >
                  <RowTitle
                    row={r}
                    className="font-display-wide block text-h3 whitespace-nowrap"
                  />
                  {r.sub ? (
                    <span className="mt-0.5 block text-caption text-muted-foreground">
                      {r.sub}
                    </span>
                  ) : null}
                </th>
                {r.values.map((v, i) => (
                  <td
                    key={columns[i].label}
                    className={cn(
                      "px-3 py-4 text-pretty",
                      columns[i].numeric && "tabular-nums"
                    )}
                  >
                    {v}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Below the breakpoint: one block for each row, each value under its column's name. */}
      <FactStack
        caption={caption}
        columns={columns}
        rows={rows}
        framed={framed}
        className={stacked[breakpoint]}
      />
    </div>
  )
}
