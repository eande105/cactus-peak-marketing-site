"use client"

import { BusynessMeter } from "@/components/brand/meters"
import { useCatalog, useSessions } from "@/components/site/catalog-context"
import { fmtTime } from "@/lib/time"

/** A phone drawn in CSS with the next four classes from the live timetable. Shows what the app does without a screenshot. */
export function AppPhone() {
  const { clubBySlug, clubs } = useCatalog()
  const { sessions, now } = useSessions()
  const club = clubBySlug("val-vista-warner") ?? clubs[0]
  const rows = sessions
    .filter(
      (s) => s.clubSlug === club.slug && (s.day > 0 || s.start >= now.min)
    )
    .slice(0, 4)
  return (
    <div
      aria-hidden="true"
      className="mx-auto w-[260px] rounded-[36px] border-[6px] border-night bg-card p-m shadow-m"
    >
      <p className="tabular text-body-s font-heavy">{fmtTime(now.min, true)}</p>
      <p className="font-display-wide mt-s text-body-l font-medium">
        {club.name}
      </p>
      <div className="mt-xxs">
        <BusynessMeter level={club.busyness} />
      </div>
      <p className="eyebrow mt-m">Next up</p>
      <ul className="mt-xxs">
        {rows.map((s) => {
          return (
            <li
              key={s.id}
              className="flex items-baseline justify-between gap-xs py-xs text-body-s rule-t"
            >
              <span className="tabular font-heavy">
                {fmtTime(s.start, true)}
              </span>
              <span className="flex-1 truncate">{s.className}</span>
              <span className="corner-xs bg-night px-xs text-night-foreground">
                Book
              </span>
            </li>
          )
        })}
      </ul>
      <div className="mt-m h-24 corner-m bg-muted p-s text-body-s">
        <p className="eyebrow">Pass</p>
        <p className="tabular font-data text-body-l font-heavy">4821 7730</p>
      </div>
    </div>
  )
}
