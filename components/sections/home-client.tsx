"use client"

import Link from "next/link"
import { LinkButton } from "@/components/brand/atoms"
import { isClubId, StatusLine } from "@/components/brand/club-parts"
import {
  ClubSet,
  clubObjects,
  type ObjectId,
  ObjectRack,
} from "@/components/brand/graphics"
import { BusynessMeter } from "@/components/brand/meters"
import { ArrowRight } from "@/components/icons"
import { useCatalog, useSessions } from "@/components/site/catalog-context"
import { useMyClub } from "@/components/site/club-context"
import { fmtTime } from "@/lib/time"
import type { Club } from "@/lib/types"
import { cn } from "@/lib/utils"

/** Your club strip (spec 1.2). Shown only when a club is set. First-time visitors use the finder below. */
export function ClubStrip({ className }: { className?: string }) {
  const { club } = useMyClub()
  const { sessions, now } = useSessions()
  if (!club) return null
  const next = sessions.find(
    (s) => s.clubSlug === club.slug && s.day === 0 && s.start >= now.min
  )
  return (
    <div
      className={cn(
        "flex flex-col gap-m hairline",
        "corner-m p-l",
        "bg-card ring-border",
        "lg:flex-row lg:items-center lg:gap-l",
        className
      )}
    >
      {isClubId(club.slug) ? (
        <ClubSet club={club.slug} className="w-24 shrink-0" />
      ) : null}
      <div className="min-w-0 flex-1">
        <p className="eyebrow">Your club</p>
        <p className="font-display-wide text-body-l font-medium">{club.name}</p>
        <div className="flex flex-wrap items-center gap-x-m">
          <StatusLine />
          <BusynessMeter level={club.busyness} />
        </div>
        {next ? (
          <p className="tabular mt-xxs text-body-s">
            Next: {next.className}, {fmtTime(next.start)}
            {next.left <= 5 && next.left > 0
              ? `, ${next.left} ${next.unit === "bikes" ? "bikes" : "spots"} left`
              : ""}
          </p>
        ) : null}
      </div>
      <div className="flex items-center gap-m">
        <LinkButton href={`/tour?club=${club.slug}`}>Tour this club</LinkButton>
        <ClubChange />
      </div>
    </div>
  )
}
function ClubChange() {
  const { clear } = useMyClub()
  return (
    <button
      type="button"
      onClick={clear}
      className="min-h-11 text-body-s text-link underline-offset-4 hover:underline font-heavy"
    >
      Change
    </button>
  )
}

/**
 * The section's art: every club's objects around one lit gym bag, the brand's object for membership
 * (VISUAL-IDENTITY.md, object table). The clubs have no photos yet, so the Rack is the flagship card's
 * picture. The clubs' lead objects come first, then their second and third, so each club is in the Rack
 * before any club repeats (VISUAL-IDENTITY.md, section 4: 6 to 12 objects, each once).
 */
const sectionIds: ObjectId[] = [
  ...new Set<ObjectId>(
    [0, 1, 2].flatMap((i) => Object.values(clubObjects).map((set) => set[i]))
  ),
].slice(0, 12)

// The club name is the card's one link. Its ::after covers the card, so the whole card is one target and
// one tab stop.
const cardLink =
  "inline-flex min-h-11 items-center no-underline underline-offset-4 group-hover:underline after:absolute after:inset-0 after:corner-m"

/**
 * Home clubs (spec 03-pages, section 1.3): from lg, the flagship on the left over two rows and the other
 * four in a 2 x 2 grid beside it, so all five clubs show at once. The cards use the bands of the club cards
 * on /clubs, with less in them: the name, the club type with its opening year and the club's one-line
 * personality, then a footer that points to the club page. Facilities, sizes and addresses live on /clubs and
 * on each club page only, so the home page cannot disagree with them.
 */
export function ClubCards() {
  const { clubs } = useCatalog()
  const [feature, ...rest] = clubs
  const byNewest = [...rest].sort((a, b) => b.opened - a.opened)
  return (
    <div className="grid gap-m sm:gap-l lg:grid-cols-2">
      <HomeClubCard club={feature} feature />
      <ul className="grid gap-m sm:grid-cols-2 sm:gap-l">
        {byNewest.map((c) => (
          <HomeClubCard key={c.slug} club={c} as="li" />
        ))}
      </ul>
    </div>
  )
}

function HomeClubCard({
  club: c,
  feature,
  as: T = "article",
}: {
  club: Club
  feature?: boolean
  as?: "article" | "li"
}) {
  return (
    <T
      className={cn(
        "group relative flex flex-col overflow-hidden hairline",
        "corner-m",
        "bg-card ring-border"
      )}
    >
      {/* Decorative: the card names the club. The flagship card has the section's one picture. */}
      {feature ? (
        <div className="relative aspect-[16/10] rule-b">
          <div className="absolute inset-0">
            <ObjectRack
              ratio="16/10"
              layout="cluster"
              scheme="night"
              focus="gym-bag"
              ids={sectionIds}
              fill
            />
          </div>
        </div>
      ) : null}
      <div className="px-l py-l">
        <h3
          className={cn(
            "font-display-wide text-balance",
            feature ? "text-body-xxl font-heavy" : "text-body-l font-medium"
          )}
        >
          <Link href={`/clubs/${c.slug}`} className={cardLink}>
            {c.name}
          </Link>
        </h3>
        <p className="mt-xxs text-body-s text-muted-foreground tabular-nums">
          {c.city} · {c.type} · Opened in {c.opened}
        </p>
        <p className="mt-s text-body-m text-pretty">{c.personality}</p>
      </div>
      {/* The footer points to the club page, where the facilities, hours and address are. The name link above
          is the card's one target, so the footer is a label for it, not a second link. */}
      <div
        aria-hidden="true"
        className={cn(
          "flex items-center justify-between gap-m rule-t",
          "mt-auto px-l py-m",
          "text-body-s font-heavy",
          "text-link"
        )}
      >
        <span className="group-hover:underline group-hover:underline-offset-4">
          See the club
        </span>
        <ArrowRight className="size-5 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none" />
      </div>
    </T>
  )
}
