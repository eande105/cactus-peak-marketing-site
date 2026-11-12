"use client"

import { useState } from "react"
import { Toggle, ToggleGroup } from "@/components/graphical"
import { useCatalog } from "@/components/site/catalog-context"
import { Button } from "@/components/ui/button"
import { CheckRow, SelectBox } from "@/components/ui/controls"
import type { Coach } from "@/lib/types"
import { ClubPin, CoachCard } from "./coach-finder"
import { EmptyState } from "./common"
import { ActiveFilters, FilterBar, ResultCount, SortSelect } from "./filter-bar"

const ALL = "all"

type Sort = "years" | "name"
const SORTS: Record<Sort, (a: Coach, b: Coach) => number> = {
  years: (a, b) => (b.years ?? 0) - (a.years ?? 0),
  name: (a, b) => a.name.localeCompare(b.name),
}

/**
 * Every coach with a profile, as the personal training page shows its coaches: one visual card each, so a
 * visitor compares by scrolling. The club track is the main filter, because most visitors pick a coach at the
 * club they will use. Under it is the site's results toolbar (filter-bar.tsx): the filters on the left, and the
 * result count and the sort on the right. Each active filter shows as a chip that removes it. The first card is
 * lit in Copper.
 */
export function CoachGrid({
  init,
}: {
  init: { club?: string; specialty?: string }
}) {
  const {
    profileCoaches: coaches,
    clubs,
    classTypes,
    classBySlug,
  } = useCatalog()
  const specs = [...new Set(coaches.flatMap((c) => c.specialties))].sort()
  const [club, setClub] = useState(init.club || ALL)
  const [spec, setSpec] = useState(init.specialty ?? "")
  const [cls, setCls] = useState("")
  const [pt, setPt] = useState(false)
  const [sort, setSort] = useState<Sort>("years")
  const list = coaches
    .filter(
      (c) =>
        (club === ALL || c.clubs.includes(club)) &&
        (!spec || c.specialties.includes(spec)) &&
        (!cls || c.teaches.includes(cls)) &&
        (!pt || c.pt)
    )
    .sort(SORTS[sort])
  const reset = () => {
    setClub(ALL)
    setSpec("")
    setCls("")
    setPt(false)
  }
  const atClub = clubs.find((c) => c.slug === club)
  // The active filters, each with the way to remove it, for the chips under the toolbar.
  const active = [
    atClub && { key: "club", label: atClub.short, clear: () => setClub(ALL) },
    spec && { key: "spec", label: spec, clear: () => setSpec("") },
    cls && {
      key: "cls",
      label: classBySlug(cls)?.name ?? cls,
      clear: () => setCls(""),
    },
    pt && { key: "pt", label: "Takes clients", clear: () => setPt(false) },
  ]
  return (
    <div>
      {/* No scroll box here: a scroll box clips the focus ring. The clubs wrap instead. */}
      <ToggleGroup
        aria-label="Show coaches at a club"
        value={[club]}
        onValueChange={(v) => {
          if (v[0] !== undefined) setClub(String(v[0]))
        }}
        className="flex flex-wrap gap-1 rounded-lg bg-card p-1 edge ring-border"
      >
        <Toggle value={ALL} className="min-h-11 gap-2 px-3">
          Every club
          <span className="tabular-nums opacity-70">{coaches.length}</span>
        </Toggle>
        {clubs.map((c) => (
          <Toggle key={c.slug} value={c.slug} className="min-h-11 gap-2 px-3">
            <ClubPin n={c.n} />
            {c.short}
            <span className="tabular-nums opacity-70">
              {coaches.filter((x) => x.clubs.includes(c.slug)).length}
              <span className="sr-only"> coaches</span>
            </span>
          </Toggle>
        ))}
      </ToggleGroup>

      <FilterBar
        className="mt-4"
        filters={
          <>
            <SelectBox
              inline
              label="Specialty"
              value={spec}
              onChange={setSpec}
              options={[
                { value: "", label: "Any" },
                ...specs.map((s) => ({ value: s, label: s })),
              ]}
            />
            <SelectBox
              inline
              label="Class"
              value={cls}
              onChange={setCls}
              options={[
                { value: "", label: "Any" },
                ...classTypes
                  .filter((t) =>
                    coaches.some((c) => c.teaches.includes(t.slug))
                  )
                  .map((c) => ({ value: c.slug, label: c.name })),
              ]}
            />
            <CheckRow checked={pt} onChange={setPt}>
              Takes clients
            </CheckRow>
          </>
        }
        results={
          <>
            <ResultCount
              shown={list.length}
              total={coaches.length}
              noun={["coach", "coaches"]}
            />
            <SortSelect
              value={sort}
              onChange={setSort}
              options={[
                { value: "years", label: "Most experience" },
                { value: "name", label: "Name, A to Z" },
              ]}
            />
          </>
        }
      />
      <ActiveFilters items={active} onClearAll={reset} />

      {list.length ? (
        <ul className="mt-10 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((c, i) => (
            <CoachCard key={c.slug} coach={c} lit={i === 0} />
          ))}
        </ul>
      ) : (
        <EmptyState className="mt-10" title="No coaches match.">
          <Button variant="outline" onClick={reset}>
            Clear filters
          </Button>
        </EmptyState>
      )}
    </div>
  )
}
