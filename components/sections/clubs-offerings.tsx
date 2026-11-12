import Link from "next/link"

import { ClubPin } from "@/components/brand/club-pin"
import { facility } from "@/components/brand/facilities"
import { GymObject, type ObjectId } from "@/components/brand/graphics"
import type { Club, Coach } from "@/lib/types"
import { cn } from "@/lib/utils"
import { MissingFacility } from "./club-facility-key"

/*
 * What's at each club: the one place on the clubs page that says which club has what. Rows are the things the
 * brand offers, each linked to its own page and tagged with the plan that opens it. Columns are the five
 * clubs. A cell gives the exact fact at that club, or the struck facility object where the club does not
 * have it. It replaces the activity list, the comparison table and, on this page, the club key.
 */

/** What a cell needs beyond the club. */
type Ctx = { coaches: Coach[] }

export type Offering = {
  id: string
  object: ObjectId
  title: string
  /** The offering's own page, where it has one. */
  href?: string
  /** Which plan opens it. */
  plan: string
  /** The fact at one club, or null where the club does not have it. */
  at: (c: Club, ctx: Ctx) => string | null
}

const lists = (c: Club, re: RegExp) => c.amenities.some((a) => re.test(a))

/**
 * "25-yd pool, warm-water pool": the items after the first start lower case, except a proper name such as
 * "Olympic".
 */
function phrase(parts: (string | false | 0 | null | undefined)[]) {
  const items = parts.filter((p): p is string => Boolean(p))
  if (!items.length) return null
  return items
    .map((p, i) =>
      i > 0 && !/^Olympic/.test(p) ? p[0].toLowerCase() + p.slice(1) : p
    )
    .join(", ")
}

// The facts come from the club data and the coach list, the same source as the club pages. The plan tags come
// from the membership comparison table (plan_comparison in the seed).
export const offerings: Offering[] = [
  {
    id: "classes",
    object: facility.classes.object,
    title: "Take a class",
    href: "/classes",
    plan: "Every plan",
    at: (c) =>
      c.has.classes
        ? `${c.studios} ${c.studios === 1 ? "studio" : "studios"} and a cycle studio`
        : null,
  },
  {
    id: "swim",
    object: facility.pool.object,
    title: "Swim",
    href: "/aquatics",
    plan: "Every plan",
    at: (c) =>
      c.pool
        ? phrase([
            `${c.pool.outdoor ? "Outdoor " : ""}25-${c.pool.unit} pool, ${c.pool.lanes} lanes`,
            c.pool.therapy && "Warm-water pool",
            lists(c, /splash/i) && "Splash pad",
            lists(c, /swim school/i) && "Swim school",
          ])
        : null,
  },
  {
    id: "lift",
    object: "squat-rack",
    title: "Lift",
    plan: "Every plan",
    // Every club has a strength floor with racks and cardio (lib/club-spaces.ts).
    at: (c) =>
      phrase([
        "Racks and cardio",
        lists(c, /platform/i) && "Olympic platforms",
        lists(c, /turf/i) && "Turf lane",
      ]),
  },
  {
    id: "courts",
    object: facility.courts.object,
    title: "Play",
    href: "/courts",
    plan: "Ridge and Summit",
    at: (c) =>
      phrase([
        c.courts?.pickleball && `${c.courts.pickleball} pickleball`,
        c.courts?.tennis && `${c.courts.tennis} tennis`,
        c.courts?.basketball && `${c.courts.basketball} basketball`,
      ]),
  },
  {
    id: "recovery",
    object: facility.recovery.object,
    title: "Recover",
    href: "/recovery",
    plan: "Summit",
    at: (c) =>
      c.recovery === "suite"
        ? "Recovery suite"
        : c.recovery === "lounge"
          ? "Recovery lounge"
          : null,
  },
  {
    id: "kids",
    object: facility.kids.object,
    title: "Bring the kids",
    href: "/kids",
    plan: "Child add-on",
    at: (c) => (c.has.kids ? "6 months to 12 years" : null),
  },
  {
    id: "coach",
    object: "whistle",
    title: "Train with a coach",
    href: "/personal-training",
    plan: "PT packs, any plan",
    at: (c, { coaches }) => {
      const n = coaches.filter((k) => k.pt && k.clubs.includes(c.slug)).length
      return n ? `${n} ${n === 1 ? "coach" : "coaches"}` : null
    },
  },
]

export function ClubsOfferings({
  clubs,
  coaches,
  className,
}: {
  clubs: Club[]
  coaches: Coach[]
  className?: string
}) {
  const ctx = { coaches }
  return (
    <div className={className}>
      {/* From lg: a table in a card, one row for each offering and one column for each club. */}
      <div className="overflow-hidden rounded-lg bg-card edge ring-border max-lg:hidden">
        <table className="w-full table-fixed border-collapse text-left">
          <caption className="sr-only">
            What each of the 5 clubs has, one column for each club
          </caption>
          <colgroup>
            <col className="w-60" />
          </colgroup>
          <thead>
            <tr className="align-bottom">
              {/* The corner names the column of row heads, so it does not sit empty. */}
              <th
                scope="col"
                className="px-6 py-4 text-caption font-semibold text-muted-foreground"
              >
                What you can do
              </th>
              {clubs.map((c) => (
                <th key={c.slug} scope="col" className="px-4 py-4 font-normal">
                  <Link
                    href={`/clubs/${c.slug}`}
                    className="flex items-center gap-2 text-label no-underline underline-offset-4 hover:underline"
                  >
                    <ClubPin n={c.n} />
                    {c.short}
                  </Link>
                  <span className="mt-0.5 block text-caption text-muted-foreground">
                    {c.city}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {offerings.map((o) => (
              <tr key={o.id} className="align-top [&>*]:rule-t">
                <th scope="row" className="px-6 py-4 font-normal">
                  <OfferingHead offering={o} />
                </th>
                {clubs.map((c) => (
                  <td key={c.slug} className="px-4 py-4">
                    <Cell offering={o} value={o.at(c, ctx)} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Below lg five columns do not fit, so each offering is a block with the clubs as pin rows. */}
      <ul className="grid gap-4 md:grid-cols-2 lg:hidden">
        {offerings.map((o) => (
          <li
            key={o.id}
            className="overflow-hidden rounded-lg bg-card edge ring-border"
          >
            <div className="px-5 py-4 rule-b">
              <OfferingHead offering={o} />
            </div>
            <ul>
              {clubs.map((c) => (
                <li
                  key={c.slug}
                  className="flex items-start justify-between gap-4 px-5 py-3 not-last:rule-b"
                >
                  <span className="flex shrink-0 items-center gap-2 text-label">
                    <ClubPin n={c.n} />
                    {c.short}
                  </span>
                  <Cell offering={o} value={o.at(c, ctx)} align="end" />
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  )
}

/** The row head: the offering's object and title, linked to its page, over the plan that opens it. */
function OfferingHead({ offering: o }: { offering: Offering }) {
  return (
    <div className="flex items-start gap-3">
      <GymObject id={o.object} className="size-8 shrink-0" />
      <div className="min-w-0">
        <p className="text-body-strong">
          {o.href ? (
            <Link
              href={o.href}
              className="underline decoration-[color-mix(in_oklab,currentColor_40%,transparent)] decoration-from-font underline-offset-4 hover:decoration-current"
            >
              {o.title}
            </Link>
          ) : (
            o.title
          )}
        </p>
        <p className="mt-1">
          <span className="rounded-sm bg-muted px-1.5 py-0.5 text-caption whitespace-nowrap">
            {o.plan}
          </span>
        </p>
      </div>
    </div>
  )
}

/** One fact at one club, or the struck object where the club does not have the offering. */
function Cell({
  offering,
  value,
  align = "start",
}: {
  offering: Offering
  value: string | null
  align?: "start" | "end"
}) {
  if (value)
    return (
      <span
        className={cn(
          "text-caption text-pretty",
          align === "end" && "text-right"
        )}
      >
        {value}
      </span>
    )
  return (
    <span className="inline-flex">
      <MissingFacility id={offering.object} className="size-5" />
      <span className="sr-only">Not at this club</span>
    </span>
  )
}
