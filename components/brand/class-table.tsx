"use client"

import Link from "next/link"
import { Check } from "@/components/icons"
import { useCatalog, useSessions } from "@/components/site/catalog-context"
import { runsAt } from "@/lib/catalog"
import { classHref } from "@/lib/links"
import { dayInfo, fmtTime } from "@/lib/time"
import type { ClassType, ClubSlug, Session } from "@/lib/types"
import { CategoryIcon, catColor } from "./icons"
import { IntensityRibs } from "./meters"

const COLS = "md:grid-cols-[minmax(0,2.4fr)_72px_150px_110px_130px_110px]"
function nextFor(
  sessions: Session[],
  slug: string,
  club: ClubSlug,
  now: { dayNum: number; min: number }
) {
  const s = sessions.find(
    (x) =>
      x.clubSlug === club &&
      x.classSlug === slug &&
      (x.day > 0 || x.start >= now.min)
  )
  return s
    ? `${s.day === 0 ? "Today" : dayInfo(s.day, now.dayNum).short} ${fmtTime(s.start)}`
    : "–"
}
/** One table of classes, grouped by category. Rows are 64 px or more with rules between them. */
export function ClassTable({
  items,
  grouped = true,
  club = "val-vista-warner",
}: {
  items: ClassType[]
  grouped?: boolean
  club?: ClubSlug
}) {
  const { categories, clubBySlug } = useCatalog()
  const { sessions, now } = useSessions()
  const cats = grouped
    ? categories.filter((c) => items.some((i) => i.category === c.id))
    : [null]
  return (
    // biome-ignore lint/a11y/useSemanticElements: ARIA table keeps the responsive grid layout; native table elements would break the md grid. Approved in the a11y audit (axe clean)
    <div role="table" aria-label="Classes" className="rule-t rule-heavy">
      {/* biome-ignore lint/a11y/useFocusableInteractive: ARIA table rows and cells are not focusable by design; the audit approved the keyboard path through the links inside */}
      {/* biome-ignore lint/a11y/useSemanticElements: ARIA table keeps the responsive grid layout; native table elements would break the md grid. Approved in the a11y audit (axe clean) */}
      <div
        role="row"
        className={`hidden gap-x-m py-xs text-body-s font-heavy text-muted-foreground rule-b md:grid ${COLS}`}
      >
        {/* biome-ignore lint/a11y/useSemanticElements: ARIA table keeps the responsive grid layout; native table elements would break the md grid. Approved in the a11y audit (axe clean) */}
        {/* biome-ignore lint/a11y/useFocusableInteractive: ARIA table rows and cells are not focusable by design; the audit approved the keyboard path through the links inside */}
        <span role="columnheader">Class</span>
        {/* biome-ignore lint/a11y/useSemanticElements: ARIA table keeps the responsive grid layout; native table elements would break the md grid. Approved in the a11y audit (axe clean) */}
        {/* biome-ignore lint/a11y/useFocusableInteractive: ARIA table rows and cells are not focusable by design; the audit approved the keyboard path through the links inside */}
        <span role="columnheader">Length</span>
        {/* biome-ignore lint/a11y/useSemanticElements: ARIA table keeps the responsive grid layout; native table elements would break the md grid. Approved in the a11y audit (axe clean) */}
        {/* biome-ignore lint/a11y/useFocusableInteractive: ARIA table rows and cells are not focusable by design; the audit approved the keyboard path through the links inside */}
        <span role="columnheader">Intensity</span>
        {/* biome-ignore lint/a11y/useSemanticElements: ARIA table keeps the responsive grid layout; native table elements would break the md grid. Approved in the a11y audit (axe clean) */}
        {/* biome-ignore lint/a11y/useFocusableInteractive: ARIA table rows and cells are not focusable by design; the audit approved the keyboard path through the links inside */}
        <span role="columnheader">First-timer</span>
        {/* biome-ignore lint/a11y/useSemanticElements: ARIA table keeps the responsive grid layout; native table elements would break the md grid. Approved in the a11y audit (axe clean) */}
        {/* biome-ignore lint/a11y/useFocusableInteractive: ARIA table rows and cells are not focusable by design; the audit approved the keyboard path through the links inside */}
        <span role="columnheader">Next at {clubBySlug(club)?.short}</span>
        {/* biome-ignore lint/a11y/useSemanticElements: ARIA table keeps the responsive grid layout; native table elements would break the md grid. Approved in the a11y audit (axe clean) */}
        {/* biome-ignore lint/a11y/useFocusableInteractive: ARIA table rows and cells are not focusable by design; the audit approved the keyboard path through the links inside */}
        <span role="columnheader">Clubs</span>
      </div>
      {cats.map((cat) => (
        // biome-ignore lint/a11y/useSemanticElements: ARIA table keeps the responsive grid layout; native table elements would break the md grid. Approved in the a11y audit (axe clean)
        <div key={cat?.id ?? "all"} role="rowgroup">
          {cat ? (
            // The heading sits in a full-width cell: a row must hold cells, and an h3 cannot take the row role.
            // biome-ignore lint/a11y/useSemanticElements: ARIA table keeps the responsive grid layout; native table elements would break the md grid. Approved in the a11y audit (axe clean)
            // biome-ignore lint/a11y/useFocusableInteractive: ARIA table rows and cells are not focusable by design; the audit approved the keyboard path through the links inside
            <div
              role="row"
              className="bg-muted py-s pl-s rule-b"
              style={{ boxShadow: `inset 4px 0 0 ${catColor(cat.id)}` }}
            >
              {/* biome-ignore lint/a11y/useSemanticElements: ARIA table keeps the responsive grid layout; native table elements would break the md grid. Approved in the a11y audit (axe clean) */}
              <div role="cell" aria-colspan={6}>
                <h3 className="font-display-wide flex items-center gap-s text-body-l font-medium">
                  <CategoryIcon id={cat.id} className="size-5" />
                  {cat.name}
                  <span className="text-body-s font-regular text-muted-foreground">
                    {cat.tagline}
                  </span>
                </h3>
              </div>
            </div>
          ) : null}
          {items
            .filter((i) => !cat || i.category === cat.id)
            .map((c) => (
              // biome-ignore lint/a11y/useSemanticElements: ARIA table keeps the responsive grid layout; native table elements would break the md grid. Approved in the a11y audit (axe clean)
              // biome-ignore lint/a11y/useFocusableInteractive: ARIA table rows and cells are not focusable by design; the audit approved the keyboard path through the links inside
              <div
                key={c.slug}
                role="row"
                className={`grid items-center gap-x-m gap-y-xxs py-s pl-s rule-b ${COLS}`}
              >
                {/* biome-ignore lint/a11y/useSemanticElements: ARIA table keeps the responsive grid layout; native table elements would break the md grid. Approved in the a11y audit (axe clean) */}
                <div role="cell" className="min-w-0">
                  <Link
                    href={classHref(c)}
                    className="font-display-wide inline-flex min-h-11 items-center text-body-l hover:underline font-medium"
                  >
                    {c.name}
                  </Link>
                  <p className="hidden text-body-m text-muted-foreground md:block">
                    {c.blurb}
                  </p>
                </div>
                {/* biome-ignore lint/a11y/useSemanticElements: ARIA table keeps the responsive grid layout; native table elements would break the md grid. Approved in the a11y audit (axe clean) */}
                <span role="cell" className="tabular text-body-m">
                  <span className="text-muted-foreground md:hidden">
                    Length:{" "}
                  </span>
                  {c.duration} min
                </span>
                {/* biome-ignore lint/a11y/useSemanticElements: ARIA table keeps the responsive grid layout; native table elements would break the md grid. Approved in the a11y audit (axe clean) */}
                <span role="cell">
                  <IntensityRibs level={c.intensity} categoryId={c.category} />
                </span>
                {/* biome-ignore lint/a11y/useSemanticElements: ARIA table keeps the responsive grid layout; native table elements would break the md grid. Approved in the a11y audit (axe clean) */}
                <span role="cell" className="text-body-m">
                  {c.firstTimer ? (
                    <span className="inline-flex items-center gap-xs">
                      <Check
                        className="size-4 text-success"
                        aria-hidden="true"
                      />
                      Yes
                    </span>
                  ) : (
                    <span className="text-muted-foreground">
                      Some experience
                    </span>
                  )}
                </span>
                {/* biome-ignore lint/a11y/useSemanticElements: ARIA table keeps the responsive grid layout; native table elements would break the md grid. Approved in the a11y audit (axe clean) */}
                <span role="cell" className="tabular text-body-m">
                  <span className="text-muted-foreground md:hidden">
                    Next:{" "}
                  </span>
                  {runsAt(c, club)
                    ? nextFor(sessions, c.slug, club, now)
                    : "Not here"}
                </span>
                {/* biome-ignore lint/a11y/useSemanticElements: ARIA table keeps the responsive grid layout; native table elements would break the md grid. Approved in the a11y audit (axe clean) */}
                <span role="cell" className="text-body-m text-muted-foreground">
                  {c.clubs === "all"
                    ? "All 5"
                    : `${c.clubs.length} ${c.clubs.length === 1 ? "club" : "clubs"}`}
                </span>
              </div>
            ))}
        </div>
      ))}
    </div>
  )
}
