import { LinkButton } from "@/components/brand/atoms"
import { clubsWith, facility } from "@/components/brand/facilities"
import { GymObject, type ObjectId } from "@/components/brand/graphics"
import type { AmenityKey, Club, Plan } from "@/lib/types"
import { cn } from "@/lib/utils"
import { ClubFacilityKey } from "./club-facility-key"

/*
 * The plans as clubs see them: three pricing cards, the pattern visitors know from other gym and
 * membership sites, in one rounded card split by hairlines, with Ridge marked by a Copper bar and wash.
 * Each card opens its list with where the plan
 * works, as the location object and a line. Features use the shared facility objects (facilities.ts), and
 * the club key above the cards (club-facility-key.tsx) shows which club has which facility, so a line
 * such as "Courts at 3 clubs" needs no pins of its own. The clubs page and each club page use the same
 * cards; a club page passes its club as `home`.
 */

/**
 * One line on a card. `home` is the club whose page shows the cards, if any: Trailhead then names that club,
 * and a line that is not true there returns null and does not show.
 */
type Feature = {
  object: ObjectId
  text: (clubs: Club[], home?: Club) => string | null
}

const count = (clubs: Club[], key: AmenityKey) => clubsWith(clubs, key).length

// Booking ahead is about time, so it takes the stopwatch; the schedule object stands for classes.
const BOOK: ObjectId = "stopwatch"

// What each plan opens. The facts come from the membership comparison table (plan_comparison in the seed).
const planClubs: Record<
  Plan["slug"],
  { where: (home?: Club) => string; lead?: string; features: Feature[] }
> = {
  trailhead: {
    where: (home) =>
      home ? `${home.short} as your home club` : "1 home club, any of the 5",
    features: [
      {
        object: facility.classes.object,
        text: (_, home) =>
          home
            ? `Every class at ${home.short}`
            : "Every class at your home club",
      },
      {
        object: facility.pool.object,
        text: (_, home) =>
          !home
            ? "Its pool, if your club has one"
            : home.has.pool
              ? "The pool here"
              : null,
      },
      { object: BOOK, text: () => "Book classes 7 days ahead" },
    ],
  },
  ridge: {
    where: () => "All 5 clubs",
    features: [
      {
        object: facility.classes.object,
        text: () => "Every class at every club",
      },
      {
        object: facility.pool.object,
        text: (c) => `All ${count(c, "pool")} pools`,
      },
      {
        object: facility.courts.object,
        text: (c) => `Courts at ${count(c, "courts")} clubs`,
      },
      { object: "gym-bag", text: () => "1 guest pass a month" },
      { object: BOOK, text: () => "Book classes 7 days ahead" },
    ],
  },
  summit: {
    where: () => "All 5 clubs",
    lead: "Everything in Ridge, plus:",
    features: [
      {
        object: facility.recovery.object,
        text: (c) => `Recovery at ${count(c, "recovery")} clubs`,
      },
      { object: "towel", text: () => "Towel service" },
      { object: "whistle", text: () => "1 PT intro session a quarter" },
      { object: "gym-bag", text: () => "4 guest passes a month" },
      { object: BOOK, text: () => "Book classes 9 days ahead" },
    ],
  },
}

export function ClubsPlanCards({
  plans,
  clubs,
  childPrice,
  facilityFee,
  home,
  band = "plain",
  facilityKey = true,
}: {
  plans: Plan[]
  clubs: Club[]
  childPrice: number
  /** The yearly facility fee, charged each March on every plan. */
  facilityFee: number
  /** The club whose page shows the cards. The key marks it and Trailhead names it. */
  home?: Club
  /** The band behind the cards. On the muted tint the info panel takes the page colour, so it still shows. */
  band?: "plain" | "tint"
  /**
   * False on a page that shows where each facility is in a section of its own (the membership page's
   * "Your plan, club by club"), so the key does not say it twice.
   */
  facilityKey?: boolean
}) {
  const atEvery: { object: ObjectId; title: string; detail: string }[] = [
    {
      object: "sun",
      title: "Open 4:30 am–10 pm weekdays",
      detail: "6 am–8 pm weekends, at all 5 clubs",
    },
    {
      object: BOOK,
      title: "Book in the app",
      detail: "At every club your plan covers",
    },
    {
      object: facility.kids.object,
      title: `Kids club at ${count(clubs, "kids")} clubs`,
      detail: `+$${childPrice}/mo a child, on any plan`,
    },
  ]

  return (
    <div>
      {facilityKey ? (
        <ClubFacilityKey clubs={clubs} current={home?.slug} className="mb-xl" />
      ) : null}

      <ul className="grid overflow-hidden corner-m bg-card hairline ring-border lg:grid-cols-3">
        {plans.map((p, i) => {
          const o = planClubs[p.slug]
          return (
            <li
              key={p.slug}
              // The membership page's hero and costs link to each plan by this anchor.
              id={`plan-${p.slug}`}
              className={cn(
                "relative flex scroll-mt-4 flex-col gap-l p-l lg:p-xl",
                i > 0 && "max-lg:rule-t lg:rule-l",
                p.badge &&
                  "bg-[color-mix(in_oklab,var(--cat-strength)_5%,var(--card))] before:absolute before:inset-x-0 before:top-0 before:h-1 before:bg-primary"
              )}
            >
              <div>
                <div className="flex items-baseline justify-between gap-s">
                  <h3 className="font-display-wide text-body-xxl font-heavy">
                    {p.name}
                  </h3>
                  {p.badge ? (
                    <span
                      className={cn(
                        "corner-xs px-xs py-xxs",
                        "text-body-s whitespace-nowrap font-heavy",
                        "bg-accent text-foreground"
                      )}
                    >
                      {p.badge}
                    </span>
                  ) : null}
                </div>
                <p className="mt-xxs flex items-baseline gap-xxs">
                  <span className="tabular font-data text-display-l font-heavy">
                    ${p.price}
                  </span>
                  <span className="text-body-m text-muted-foreground">/mo</span>
                </p>
                {/* The one fee every plan adds, as a small label under the price. */}
                <p className="text-body-s text-muted-foreground tabular-nums">
                  + ${facilityFee} facility fee each March
                </p>
              </div>

              <div className="flex flex-col gap-s">
                {/* Where the plan works leads the list, in the same form as the features. It is the line
                    the plans differ on most here, so it is the one strong line. */}
                <p className="flex items-center gap-s text-body-m font-heavy">
                  <GymObject id="location" className="size-7 shrink-0" />
                  {o.where(home)}
                </p>
                {o.lead ? (
                  <p className="text-body-m font-heavy">{o.lead}</p>
                ) : null}
                <ul className="flex flex-col gap-s">
                  {o.features.map((f) => {
                    const text = f.text(clubs, home)
                    return text ? (
                      <li
                        key={f.object}
                        className="flex items-center gap-s text-body-m"
                      >
                        <GymObject id={f.object} className="size-7 shrink-0" />
                        {text}
                      </li>
                    ) : null
                  })}
                </ul>
              </div>

              {/* Ridge, the most popular plan, carries the one filled button. On a club page the join flow
                  opens with that club already picked. */}
              <LinkButton
                href={`/join/plan?plan=${p.slug}${home ? `&club=${home.slug}` : ""}`}
                variant={p.badge ? "primary" : "outline"}
                className="mt-auto"
              >
                Join {p.name}
              </LinkButton>
            </li>
          )
        })}
      </ul>

      {/* What is the same on every plan, so it sits once under the cards. It is a note, not a fourth
          card: the site's info panel (a borderless muted fill with an eyebrow, as on the legal pages),
          smaller type and the mono objects that the identity sets inline with text. Each item is a
          short title over one detail line, so the three match in height. Below lg they stack. */}
      <section
        aria-labelledby="every-plan"
        className={cn(
          "mt-xl corner-m px-l py-m lg:px-l",
          band === "tint" ? "bg-background" : "bg-muted"
        )}
      >
        <h3 id="every-plan" className="eyebrow">
          On every plan
        </h3>
        <ul className="mt-s grid gap-x-xl gap-y-s lg:grid-cols-3">
          {atEvery.map((r) => (
            <li key={r.title} className="flex items-start gap-s">
              <GymObject
                id={r.object}
                scheme="mono"
                className="mt-xxs size-5 shrink-0 text-muted-foreground"
              />
              <span className="min-w-0 text-body-s">
                <span className="block font-heavy">{r.title}</span>
                <span className="tabular block text-muted-foreground">
                  {r.detail}
                </span>
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
