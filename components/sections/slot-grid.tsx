"use client"

import { useState } from "react"
import { Toggle, ToggleGroup } from "@/components/graphical"
import { Check, X } from "@/components/icons"
import { fmtTime } from "@/lib/time"
import { cn } from "@/lib/utils"

/** Read-only slot preview. Words and icons carry state, never colour alone. */
export function LaneGrid() {
  const slots = [360, 405, 450, 495, 540, 585, 630, 675]
  return (
    <ul className="grid grid-cols-2 gap-xs sm:grid-cols-4">
      {slots.map((m, i) => {
        const left = [2, 0, 3, 5, 6, 4, 1, 8][i]
        return (
          <li
            key={m}
            className="corner-s bg-card px-s py-xs hairline ring-border"
          >
            <p className="tabular text-body-s font-heavy">{fmtTime(m)}</p>
            <p className="text-body-s text-muted-foreground">
              {left === 0
                ? "Full"
                : left <= 5
                  ? `${left} ${left === 1 ? "lane" : "lanes"} left`
                  : "Lanes open"}
            </p>
          </li>
        )
      })}
    </ul>
  )
}
export function CourtGrid() {
  const [dur, setDur] = useState<60 | 90>(60)
  const times = [420, 480, 540, 600, 660, 720]
  const courts = [1, 2, 3, 4, 5, 6]
  return (
    <div>
      {/* Single choice: pressing the current length again keeps it on. */}
      <ToggleGroup
        aria-label="Slot length"
        value={[String(dur)]}
        onValueChange={(v) => {
          if (v[0]) setDur(Number(v[0]) as 60 | 90)
        }}
        className="mb-m"
      >
        {([60, 90] as const).map((d) => (
          <Toggle key={d} value={String(d)} className="min-h-11">
            {d} min
          </Toggle>
        ))}
      </ToggleGroup>
      <section
        className="relative overflow-x-auto corner-m bg-card hairline ring-border"
        aria-label="Courts open today"
        // biome-ignore lint/a11y/noNoninteractiveTabindex: scrollable region needs a tab stop so keyboard users can scroll it
        tabIndex={0}
      >
        <table className="w-full min-w-[560px] text-body-s">
          <thead>
            <tr>
              <th className="p-s text-left" scope="col">
                <span className="sr-only">Time</span>
              </th>
              {courts.map((c) => (
                <th
                  key={c}
                  scope="col"
                  className="p-s text-left text-body-s font-heavy text-muted-foreground"
                >
                  Court {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {times.map((t, r) => (
              <tr key={t} className="[&>*]:rule-t">
                <th scope="row" className="tabular p-s text-left">
                  {fmtTime(t)}
                </th>
                {courts.map((c, i) => {
                  const open = (r * 7 + i * 3 + (dur === 90 ? 2 : 0)) % 5 > 1
                  return (
                    <td key={c} className="p-s">
                      <span
                        className={cn(
                          "inline-flex items-center gap-xs",
                          !open && "text-muted-foreground"
                        )}
                      >
                        {open ? (
                          <Check
                            className="size-4 text-success"
                            aria-hidden="true"
                          />
                        ) : (
                          <X className="size-4" aria-hidden="true" />
                        )}
                        {open ? "Open" : "Booked"}
                      </span>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  )
}
