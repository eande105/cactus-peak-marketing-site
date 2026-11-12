"use client"

import { Clock } from "@/components/icons"
import { clubStatus } from "@/lib/time"
import { cn } from "@/lib/utils"
import { useClubNow } from "./catalog-context"

/** Open, closing soon or closed, from the live Arizona clock. All five clubs keep the same hours. */
export function LiveClubStatus({
  className,
  short,
  iconClassName = "size-3",
}: {
  className?: string
  short?: boolean
  iconClassName?: string
}) {
  const s = clubStatus(useClubNow())
  return (
    <span className={cn("inline-flex items-center gap-xs", className)}>
      {s.state === "open" ? (
        <span aria-hidden="true" className="size-2 corner-full bg-success" />
      ) : (
        <Clock
          className={cn(iconClassName, s.open && "text-warning")}
          aria-hidden="true"
        />
      )}
      {short ? s.short : s.text}
    </span>
  )
}

/**
 * The open state of every club, for the corner cell of an hours table. The table rows already give the times, so
 * the text names the state only. A filled dot means open; a ring means closed, so the state does not depend on
 * colour alone.
 */
export function ClubsOpenStatus() {
  const s = clubStatus(useClubNow())
  const word =
    s.state === "open"
      ? "Open now"
      : s.state === "closingSoon"
        ? "Closing soon"
        : "Closed now"
  return (
    <span className="inline-flex items-center gap-xs text-night-foreground">
      <span
        aria-hidden="true"
        className={cn(
          "size-2 shrink-0 corner-full",
          s.state === "open" && "bg-success",
          s.state === "closingSoon" && "bg-warning",
          !s.open && "border-[1.5px] border-current"
        )}
      />
      {word}
    </span>
  )
}
