import { EFFORT, LEVEL_WORD } from "@/lib/labels"
import type { Level } from "@/lib/types"
import { cn } from "@/lib/utils"

/** The 1 to 5 effort scale in the same words as /classes, as a ruled list. */
export function IntensityKey({ className }: { className?: string }) {
  return (
    <ol className={cn("rule-t", className)}>
      {([1, 2, 3, 4, 5] as Level[]).map((n) => (
        <li key={n} className="py-2 text-caption rule-b">
          <span className="font-semibold">
            {n}, {LEVEL_WORD[n]}.
          </span>{" "}
          {EFFORT[n]}
        </li>
      ))}
    </ol>
  )
}

/** The key behind a "What the numbers mean" disclosure. */
export function IntensityKeyDetails({ className }: { className?: string }) {
  return (
    <details className={cn("text-body", className)}>
      <summary className="inline-flex min-h-11 cursor-pointer items-center text-label text-link underline-offset-4 hover:underline">
        What the numbers mean
      </summary>
      <IntensityKey className="mt-2" />
    </details>
  )
}
