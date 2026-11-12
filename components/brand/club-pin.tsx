import { cn } from "@/lib/utils"

/**
 * The club map's pin shape (components/map/brand-map.tsx), small, with the club's map number in its head.
 * A module of its own, so the header's club switcher can use it without the coach finder's code.
 */
export function ClubPin({ n, className }: { n: number; className?: string }) {
  return (
    <svg
      viewBox="0 0 34 42"
      aria-hidden="true"
      className={cn("h-[1.375rem] w-auto shrink-0", className)}
    >
      <path
        d="M7 1h20a6 6 0 0 1 6 6v20a6 6 0 0 1-6 6h-5.5L17 41l-4.5-8H7a6 6 0 0 1-6-6V7a6 6 0 0 1 6-6Z"
        className="fill-night"
      />
      <text
        x="17"
        y="17"
        textAnchor="middle"
        dominantBaseline="central"
        className="fill-night-foreground text-[19px] font-bold tabular-nums"
      >
        {n}
      </text>
    </svg>
  )
}
