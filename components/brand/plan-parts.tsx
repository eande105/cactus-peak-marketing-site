"use client"

import { useCatalog } from "@/components/site/catalog-context"
import { cn } from "@/lib/utils"

/**
 * Every plan row side by side. From md it is a table that fits its column, so nothing scrolls inside it and
 * the head can stick under the header and the section nav as the rows pass. (A sticky head inside a
 * sideways scroll box sticks to the box, not the window, and slid down over the first rows.) Below md four
 * columns do not fit, and a sideways table hides which plan a value belongs to, so each row is a block:
 * the row's name, then the three plans with their values, each one labelled.
 */
export function PlanComparisonTable({
  className,
  stickyTop = false,
}: {
  className?: string
  stickyTop?: boolean
}) {
  const { plans, comparison } = useCatalog()
  return (
    <section
      className={cn("relative rule-y rule-ink", className)}
      aria-label="Plan comparison"
    >
      <table className="w-full border-collapse text-body-s max-md:hidden">
        <caption className="sr-only">
          Compare Trailhead, Ridge and Summit
        </caption>
        <thead
          className={cn(
            "bg-background",
            stickyTop && "md:sticky md:top-(--sticky-top) md:z-10"
          )}
        >
          <tr>
            <th
              scope="col"
              className="w-[28%] p-m text-left align-bottom text-body-s font-heavy text-muted-foreground"
            >
              What you get
            </th>
            {plans.map((p) => (
              <th
                key={p.slug}
                scope="col"
                className={cn(
                  "p-m text-left align-bottom",
                  p.badge && "bg-accent/40"
                )}
              >
                {/* The badge goes above the name, so the names and prices line up across the columns. */}
                {p.badge ? (
                  <span className="mb-xxs block text-body-s font-heavy">
                    {p.badge}
                  </span>
                ) : null}
                <span className="font-display-wide block text-body-l font-medium">
                  {p.name}
                </span>
                <span className="tabular block font-data text-body-s font-heavy">
                  ${p.price}/mo
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {comparison.map((r) => (
            <tr key={r.row} className="[&>*]:rule-t">
              <th scope="row" className="p-m text-left font-medium">
                {r.row}
              </th>
              {r.vals.map((v, i) => (
                <td
                  // biome-ignore lint/suspicious/noArrayIndexKey: each cell lines up with a plan column; the table is static
                  key={i}
                  className={cn("p-m", plans[i].badge && "bg-accent/40")}
                >
                  {v === "–" ? (
                    <>
                      {/* A visible dash, so an empty cell reads as "no" and not as missing data. */}
                      <span
                        aria-hidden="true"
                        className="text-muted-foreground"
                      >
                        —
                      </span>
                      <span className="sr-only">Not included</span>
                    </>
                  ) : v === "Included" ? (
                    <span>
                      <span
                        aria-hidden="true"
                        className="mr-xs inline-block size-2 corner-full bg-foreground align-middle"
                      />
                      Included
                    </span>
                  ) : (
                    v
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <dl className="md:hidden">
        {comparison.map((r) => (
          <div key={r.row} className="py-m rule-t first:rule-t-0">
            <dt className="text-body-m font-heavy">{r.row}</dt>
            <dd className="mt-xs grid grid-cols-3 gap-s">
              {r.vals.map((v, i) => (
                <p
                  // biome-ignore lint/suspicious/noArrayIndexKey: each value lines up with a plan; the list is static
                  key={i}
                  className="min-w-0 text-body-m text-pretty"
                >
                  <span className="block text-body-s text-muted-foreground">
                    {plans[i].name}
                  </span>
                  {v === "–" ? (
                    <>
                      <span
                        aria-hidden="true"
                        className="text-muted-foreground"
                      >
                        —
                      </span>
                      <span className="sr-only">Not included</span>
                    </>
                  ) : (
                    v
                  )}
                </p>
              ))}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
