import { TextLink } from "@/components/brand/atoms"
import { litFill, nightFill } from "@/components/sections/program-page"
import { initials } from "@/lib/catalog"
import type { Coach } from "@/lib/types"
import { cn } from "@/lib/utils"

const disc =
  "-ml-xs grid size-12 place-items-center corner-full text-body-s ring-4 ring-muted font-heavy"

/**
 * Home coach line, at the foot of the classes band: the most experienced coaches as an overlapping row of
 * initials on Night, closed by a Copper disc with the count of the rest, then the count and the years between
 * them, and one link to /coaches. The marks leave out the coach's object badge: in a row this tight the
 * badges cover the next mark. It counts the coaches with a profile, as the /coaches hero does, so the two
 * pages agree.
 */
export function HomeCoachLine({
  coaches,
  className,
}: {
  coaches: Coach[]
  className?: string
}) {
  const listed = coaches.filter((c) => c.profile)
  if (!listed.length) return null
  const years = listed.reduce((n, c) => n + (c.years ?? 0), 0)
  const shown = [...listed]
    .sort((a, b) => (b.years ?? 0) - (a.years ?? 0))
    .slice(0, 6)
  return (
    <div
      className={cn(
        "flex flex-col gap-x-xl gap-y-l rule-b",
        "py-xl",
        "sm:flex-row sm:items-center",
        className
      )}
    >
      {/* Decorative: the line names the count. The ring is the band colour, so the marks read as cut apart. */}
      <span aria-hidden="true" className="flex shrink-0 pl-xs">
        {shown.map((c) => (
          <span key={c.slug} className={cn(disc, nightFill)}>
            {initials(c.name)}
          </span>
        ))}
        {listed.length > shown.length ? (
          <span className={cn(disc, litFill, "tabular")}>
            +{listed.length - shown.length}
          </span>
        ) : null}
      </span>
      <p className="font-display-wide min-w-0 flex-1 text-body-l text-balance font-medium">
        Every class has a coach. {listed.length} of them, with {years} years of
        coaching between them.
      </p>
      <TextLink href="/coaches" className="shrink-0">
        Meet the coaches
      </TextLink>
    </div>
  )
}
