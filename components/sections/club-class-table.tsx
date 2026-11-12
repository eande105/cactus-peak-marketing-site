"use client"

import { useState } from "react"
import { ClassTable } from "@/components/brand/class-table"
import { useCatalog } from "@/components/site/catalog-context"
import { useMyClub } from "@/components/site/club-context"
import { SelectBox } from "@/components/ui/controls"
import type { ClassType, ClubSlug } from "@/lib/types"
import { FilterBar } from "./filter-bar"

/**
 * Class table under the site's results toolbar: the club select on the left and, when no club is set, a note on the
 * right that says which club shows. Defaults to the visitor's club; with none set, to Val Vista & Warner.
 */
export function ClubClassTable({
  items,
  grouped = true,
}: {
  items: ClassType[]
  grouped?: boolean
}) {
  const { club: mine } = useMyClub()
  const { clubs } = useCatalog()
  const [pick, setPick] = useState<ClubSlug | "">("")
  const club = (pick || mine?.slug || "val-vista-warner") as ClubSlug
  return (
    <div>
      <FilterBar
        className="mb-4"
        filters={
          <SelectBox
            inline
            label="Next times at"
            value={club}
            onChange={setPick}
            options={clubs.map((c) => ({ value: c.slug, label: c.name }))}
          />
        }
      />
      <ClassTable items={items} grouped={grouped} club={club} />
    </div>
  )
}
