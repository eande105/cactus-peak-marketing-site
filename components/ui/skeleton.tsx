import { cn } from "@/lib/utils"

/**
 * A placeholder for one small element that waits on live data (for example the spot counts).
 * Do not use it for a whole page. Give it the size of the content it replaces so the layout does not move.
 */
export function Skeleton({
  className,
  label,
}: {
  className?: string
  /** Read by screen readers while the data loads. */
  label: string
}) {
  return (
    <span className="inline-block align-middle">
      <span role="status" className="sr-only">
        {label}
      </span>
      <span
        aria-hidden="true"
        className={cn(
          "block corner-xs bg-muted motion-safe:animate-pulse",
          className
        )}
      />
    </span>
  )
}
