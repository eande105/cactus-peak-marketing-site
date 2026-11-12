import type { CategoryId } from "@/lib/types"
import { cn } from "@/lib/utils"
import { categoryObject, GymObject } from "./graphics"

export function CategoryIcon({
  id,
  className,
}: {
  id: CategoryId
  className?: string
}) {
  // The category's gym object (Nucleo core glyph) in the text colour, so it sits inline with labels.
  return (
    <GymObject
      id={categoryObject[id]}
      scheme="mono"
      className={cn("inline-block shrink-0", className ?? "size-4")}
    />
  )
}
export const catColor = (id: CategoryId) => `var(--cat-${id})`
export const catText = (id: CategoryId) => `var(--cat-${id}-text)`
export const catTint = (id: CategoryId) =>
  `color-mix(in oklab, var(--cat-${id}) 10%, transparent)`
