import Link from "next/link"

import { LinkButton, TextLink } from "@/components/brand/atoms"
import {
  CategoryTile,
  GymObject,
  type ObjectId,
  planObjects,
} from "@/components/brand/graphics"
import { Check } from "@/components/icons"
import type { Category, Club, Pack, Plan, Prices, Slot } from "@/lib/types"
import { cn } from "@/lib/utils"
import { Container } from "./common"

// The underline every text link in these sections uses: a quiet line under the words that darkens on hover.
const quietLink =
  "underline decoration-[color-mix(in_oklab,currentColor_40%,transparent)] decoration-from-font underline-offset-4 hover:decoration-current"

/** Class starts in one week, at one club or at all of them. Each slot repeats on each of its days. */
export function classesAWeek(slots: Slot[], club?: string) {
  return slots
    .filter((s) => !club || s.club === club)
    .reduce((n, s) => n + s.days.length, 0)
}

/** "Dobson & Southern, Power & McKellips and Val Vista & Warner". */
export function listOf(items: string[]) {
  if (items.length < 2) return items.join("")
  return `${items.slice(0, -1).join(", ")} and ${items.at(-1)}`
}

// The step heights, low to high: the plans are a climb (Trailhead, Ridge, Summit), so the picture is one.
const stepHeight: Record<Plan["slug"], string> = {
  trailhead: "h-[46%]",
  ridge: "h-[72%]",
  summit: "h-full",
}

/**
 * The Steps: a composition made for this hero. The three plans stand side by side as steps that rise
 * from Trailhead to Summit, so the page's claim (start where you are, move up when you are ready) is the
 * picture. Each step carries the plan's Row of objects (VISUAL-IDENTITY.md, section 6), which grows as the
 * plan does, and the plan's name and price at its foot. The most popular plan is the one lit step, in
 * Copper; the others are Night. Each step is a link to the plan's column.
 *
 * Contrast: the theme clears Tailwind's palette, so `text-white` does nothing here and the Copper step
 * fell back to the near-black page text (3.5:1). The lit step uses `--neutral-1` (white, 4.9:1 on Copper),
 * as the Copper tour panel does, and every word on it, "/mo" too, keeps that full colour: a lighter mix
 * falls under 4.5:1. The Night steps use Sand (12:1) and the muted Sand (9:1). The focus ring sits outside
 * the step, on the Sand page, so it is the text colour and shows against every step.
 */
function PlanSteps({ plans }: { plans: Plan[] }) {
  return (
    <ul
      aria-label="The three plans"
      className="grid aspect-[5/4] grid-cols-3 items-end gap-xs sm:aspect-[4/3] sm:gap-s lg:aspect-[1/1]"
    >
      {plans.map((p) => {
        const lit = Boolean(p.badge)
        return (
          <li key={p.slug} className={cn("min-h-0", stepHeight[p.slug])}>
            <a
              href={`#plan-${p.slug}`}
              className={cn(
                "group flex h-full flex-col justify-between",
                "corner-t-xl p-s",
                "no-underline",
                "outline-offset-4",
                "focus-visible:outline-2 focus-visible:outline-foreground sm:p-l",
                lit
                  ? "bg-[var(--cat-strength)] text-neutral-1"
                  : "bg-night text-night-foreground"
              )}
            >
              {/* Decorative: the plan's column names what each object stands for. It wraps, so a narrow
                  step keeps Summit's seven objects inside it. */}
              <span
                aria-hidden="true"
                className="flex flex-wrap gap-xs sm:gap-xs"
              >
                {planObjects[p.slug].map((id) => (
                  <GymObject
                    key={id}
                    id={id}
                    scheme={lit ? "copper" : "night"}
                    className="size-5 sm:size-7"
                  />
                ))}
              </span>
              <span>
                {p.badge ? (
                  <span className="mb-xs block text-body-s font-heavy max-sm:hidden">
                    {p.badge}
                  </span>
                ) : null}
                <span className="font-display-wide block text-body-s group-hover:underline sm:text-body-l font-heavy sm:font-medium">
                  {p.name}
                </span>
                <span className="tabular block font-data text-body-l font-heavy sm:text-display-m">
                  ${p.price}
                  <span
                    className={cn(
                      "text-body-s font-regular sm:text-body-m",
                      lit ? "text-neutral-1" : "text-night-muted"
                    )}
                  >
                    /mo
                  </span>
                </span>
              </span>
            </a>
          </li>
        )
      })}
    </ul>
  )
}

/**
 * The membership hero. It is set on the Sand page with the copy on the left and the Steps on the right,
 * so it shares the club page's split and not the Home hero's Night panel or the clubs and classes heroes'
 * full-width compositions. The Steps stand on the hero's bottom rule, so the plans rise from the floor. There
 * is no facts row: the Steps show the prices, the lede says what each plan reaches, and the offer heads the copy.
 */
export function MembershipHero({
  plans,
  prices,
}: {
  plans: Plan[]
  prices: Prices
}) {
  const featured = plans.find((p) => p.badge) ?? plans[0]
  return (
    <section aria-labelledby="membership-hero-title" className="rule-b">
      {/* The steps have no space under them: they stand on the section's bottom rule, so the plans rise from
          the floor. The copy keeps its own space below. */}
      <Container className="grid gap-xxl pt-xl lg:grid-cols-12 lg:items-end lg:gap-section lg:pt-section">
        <div className="lg:col-span-6 lg:self-center lg:pb-section">
          {/* The offer, as one link above the title: a Copper tag that names it, the price fact, the usual
              price struck through, and an arrow to the terms. The tag sits 4px inside the pill on the top,
              bottom and left, so the two shapes are concentric; the arrow sits closer to the text it ends,
              and the right padding is a little smaller than 16px because the arrow glyph has its own side space. */}
          <Link
            href="/offers/fall-climb"
            className="group/offer mb-l inline-flex min-h-11 max-w-full items-stretch gap-s corner-full bg-card p-xxs pr-m text-body-s no-underline hairline ring-border hover:ring-border-strong lg:mb-xl font-heavy"
          >
            <span className="flex shrink-0 items-center corner-full bg-[var(--cat-strength)] px-m text-neutral-1">
              Fall offer
            </span>
            <span className="min-w-0 self-center py-xxs text-pretty">
              $0 to join through Nov{"\u00a0"}30{" "}
              {/* The usual price shows from sm; on a phone the badge keeps to one line. */}
              <s className="font-regular text-muted-foreground tabular-nums max-sm:sr-only">
                <span className="sr-only">, usually </span>${prices.enrollment}
              </s>
            </span>
            <span
              aria-hidden="true"
              className="-ml-xxs shrink-0 self-center text-muted-foreground transition-transform group-hover/offer:translate-x-0.5 motion-reduce:transition-none"
            >
              →
            </span>
          </Link>
          <h1
            id="membership-hero-title"
            className="display-hero max-w-[12ch] text-balance"
          >
            Every plan starts with every class.
          </h1>
          <p className="lede mt-l max-w-[38ch] text-pretty text-muted-foreground lg:mt-l">
            Trailhead covers your home club. Ridge opens all 5. Summit adds
            recovery. Month to month, so you can move up the day you are ready.
          </p>
          <div className="mt-xl flex flex-wrap items-center gap-s">
            <LinkButton
              href={`/join/plan?plan=${featured.slug}`}
              size="lg"
              className="max-sm:flex-1"
            >
              Become a member
            </LinkButton>
            <LinkButton
              href="/trial"
              variant="outline"
              size="lg"
              className="max-sm:flex-1"
            >
              Try a free 3-day pass
            </LinkButton>
          </div>
          <p className="mt-l text-body-m text-muted-foreground">
            Already a member?{" "}
            <Link
              href="/app"
              className={cn(
                "inline-flex min-h-11 items-center text-foreground",
                quietLink
              )}
            >
              Change your plan in the app
            </Link>
          </p>
        </div>
        <div className="lg:col-span-6">
          <PlanSteps plans={plans} />
        </div>
      </Container>
    </section>
  )
}

/**
 * Under the plan columns: the Medicare and senior-rate callout, then the free way to try before choosing.
 * The callout is a card of its own, apart from the plans, because it changes the price for one group of
 * visitors: older visitors look for it here, and the full answer in the questions below is collapsed. The
 * heart-rate watch on a Night tile marks it as health cover, not a fourth plan.
 */
export function PlanNotes({ className }: { className?: string }) {
  return (
    <div className={className}>
      <aside
        aria-labelledby="medicare-title"
        className={cn(
          "grid gap-l hairline",
          "corner-m p-l",
          "bg-card ring-border",
          "sm:grid-cols-[auto_minmax(0,1fr)] sm:gap-l lg:grid-cols-[auto_minmax(0,1fr)_auto] lg:items-center lg:p-xl"
        )}
      >
        <span
          aria-hidden="true"
          className="grid size-14 place-items-center corner-s bg-night"
        >
          <GymObject id="heart-watch" scheme="night" className="size-9" />
        </span>
        <div className="min-w-0">
          <h3
            id="medicare-title"
            className="font-display-wide text-body-l font-medium"
          >
            65 or older? Your plan may cost $0.
          </h3>
          <p className="mt-xs max-w-[64ch] text-body-m text-pretty text-muted-foreground">
            All 5 clubs accept Medicare Advantage fitness benefits, such as
            SilverSneakers and Renew Active. If you are eligible, Trailhead at
            your home club is $0 a month, and Ridge or Summit costs the
            difference. If you pay for yourself, the senior rate takes $10 off
            any plan each month.
          </p>
        </div>
        <div className="flex flex-col items-start gap-xxs sm:col-start-2 lg:col-start-auto">
          <TextLink href="/faq#medicare">How Medicare benefits work</TextLink>
          <a
            href="tel:+14805550100"
            className={cn(
              "inline-flex min-h-11 items-center text-body-s tabular-nums font-heavy",
              quietLink
            )}
          >
            Check eligibility: (480) 555-0100
          </a>
        </div>
      </aside>
      <div className="mt-l flex justify-end">
        <TextLink href="/trial">Not sure? Try a free 3-day pass</TextLink>
      </div>
    </div>
  )
}

/** One column of the reach table: a thing members use at a club, and the plan that opens it. */
type ReachColumn = {
  icon: ObjectId
  label: string
  /** The least plan (or add-on) that opens it. */
  opens: string
  value: (c: Club, slots: Slot[]) => string | null
}

const reachColumns: ReachColumn[] = [
  {
    icon: "schedule",
    label: "Classes",
    opens: "Every plan",
    value: (c, slots) => `${classesAWeek(slots, c.slug)} a week`,
  },
  {
    icon: "pool",
    label: "Pool",
    opens: "Every plan",
    value: (c) =>
      c.pool
        ? `${c.pool.outdoor ? "Outdoor " : ""}25-${c.pool.unit}, ${c.pool.lanes} lanes${c.pool.therapy ? ", warm-water pool" : ""}`
        : null,
  },
  {
    icon: "paddle",
    label: "Courts",
    opens: "Ridge and Summit",
    value: (c) => {
      const parts = [
        c.courts?.pickleball && `${c.courts.pickleball} pickleball`,
        c.courts?.tennis && `${c.courts.tennis} tennis`,
        c.courts?.basketball && `${c.courts.basketball} basketball`,
      ].filter(Boolean)
      return parts.length ? parts.join(", ") : null
    },
  },
  {
    icon: "spa-stones",
    label: "Recovery",
    opens: "Summit",
    value: (c) =>
      c.recovery === "suite"
        ? "Suite"
        : c.recovery === "lounge"
          ? "Lounge"
          : null,
  },
  {
    icon: "playground",
    label: "Kids club",
    opens: "Child add-on",
    value: (c) => (c.has.kids ? "6 months to 12 years" : null),
  },
]

/** A plan tag: what opens a column. The same tag heads the table column and labels the phone list. */
function Opens({ children }: { children: string }) {
  return (
    <span
      className={cn(
        "inline-block",
        "corner-xs px-xs py-xxs",
        "text-body-s font-heavy whitespace-nowrap",
        "bg-muted text-foreground"
      )}
    >
      {children}
    </span>
  )
}

/**
 * Your plan, club by club: the five clubs down the side, the things members use across the top, and under
 * each heading the plan that opens it. Every value comes from the club data and the timetable, the same
 * source as the club pages, so the table stays true when a club changes.
 *
 * From lg it is a table in a card. Its head has two rows, and the corner cell labels each one ("At the club"
 * over the names, "Opens with" over the plan tags), so the corner names the rows instead of sitting empty.
 * The club names keep to one line, and each object sits over its column name, so a column needs only the
 * width of its words. Below lg five columns do not fit, so each club is a short list with the same facts,
 * two across from md, and nothing scrolls sideways.
 */
export function PlanReach({
  clubs,
  slots,
  className,
}: {
  clubs: Club[]
  slots: Slot[]
  className?: string
}) {
  return (
    <div className={className}>
      <div className="overflow-hidden corner-m bg-card hairline ring-border max-lg:hidden">
        <table className="w-full border-collapse text-left">
          <caption className="sr-only">
            The 5 clubs, with what is at each one and the plan that opens it
          </caption>
          <thead>
            <tr className="align-bottom">
              <th
                scope="row"
                className={cn(
                  "w-[13.5rem]",
                  "px-l pt-l pb-xs",
                  "text-body-s font-heavy",
                  "text-muted-foreground",
                  "lg:w-[15rem]"
                )}
              >
                At the club
              </th>
              {reachColumns.map((col) => (
                <th key={col.label} scope="col" className="px-m pt-l pb-xs">
                  <GymObject id={col.icon} className="size-8" />
                  <span className="font-display-wide mt-s block text-body-l whitespace-nowrap font-medium">
                    {col.label}
                  </span>
                </th>
              ))}
            </tr>
            <tr className="align-top">
              <th
                scope="row"
                className="px-l pt-xxs pb-l text-body-s font-heavy text-muted-foreground"
              >
                Opens with
              </th>
              {reachColumns.map((col) => (
                <td key={col.label} className="px-m pt-xxs pb-l">
                  <Opens>{col.opens}</Opens>
                </td>
              ))}
            </tr>
          </thead>
          <tbody>
            {clubs.map((c) => (
              <tr key={c.slug} className="align-top [&>*]:rule-t">
                <th scope="row" className="px-l py-m font-regular">
                  <Link
                    href={`/clubs/${c.slug}`}
                    className={cn(
                      "block",
                      "font-display-wide text-body-l whitespace-nowrap no-underline underline-offset-4 font-medium",
                      "hover:underline"
                    )}
                  >
                    {c.short}
                  </Link>
                  <span className="mt-xxs block text-body-s text-muted-foreground">
                    {c.city}
                  </span>
                </th>
                {reachColumns.map((col) => {
                  const v = col.value(c, slots)
                  return (
                    <td
                      key={col.label}
                      className="px-m py-m text-body-m text-pretty tabular-nums"
                    >
                      {v ?? <span className="text-muted-foreground">No</span>}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Below lg: one short list for each club, with the same facts and tags. */}
      <ul className="grid gap-m md:grid-cols-2 lg:hidden">
        {clubs.map((c) => (
          <li
            key={c.slug}
            className="corner-m bg-card p-l hairline ring-border"
          >
            <h3 className="font-display-wide text-body-l font-medium">
              <Link
                href={`/clubs/${c.slug}`}
                className="inline-flex min-h-11 items-center no-underline underline-offset-4 hover:underline"
              >
                {c.short}
              </Link>
            </h3>
            <p className="text-body-s text-muted-foreground">{c.city}</p>
            <dl className="mt-m rule-t">
              {reachColumns.map((col) => {
                const v = col.value(c, slots)
                return (
                  <div
                    key={col.label}
                    className="grid grid-cols-[1.5rem_minmax(0,1fr)] gap-x-s py-s rule-b last:rule-b-0"
                  >
                    <GymObject id={col.icon} className="mt-xxs size-6" />
                    <div className="min-w-0">
                      <dt className="flex flex-wrap items-center gap-x-xs gap-y-xxs text-body-m font-heavy">
                        {col.label}
                        <Opens>{col.opens}</Opens>
                      </dt>
                      <dd className="mt-xxs text-body-m text-pretty text-muted-foreground">
                        {v ?? "No"}
                      </dd>
                    </div>
                  </div>
                )
              })}
            </dl>
          </li>
        ))}
      </ul>

      <div className="mt-xl flex flex-wrap items-center justify-between gap-x-xl gap-y-xs">
        <p className="max-w-[62ch] text-body-m text-pretty text-muted-foreground">
          With Trailhead, the club you pick is your home club, and you can
          change it in the app. Ridge and Summit open every row.
        </p>
        <TextLink href="/clubs#find">Find the club nearest you</TextLink>
      </div>
    </div>
  )
}

/**
 * Classes come with every plan. The left column is the claim as one big number (type as image,
 * VISUAL-IDENTITY.md section 7) over the eight types, each a link to its place on the classes page. The
 * right column is each club's week as a bar, so a visitor sees what Trailhead gives at their club and what
 * Ridge adds. Category colour shows only in the type Tiles (section 5).
 */
export function PlanClasses({
  categories,
  clubs,
  slots,
  className,
}: {
  categories: Category[]
  clubs: Club[]
  slots: Slot[]
  className?: string
}) {
  const total = classesAWeek(slots)
  const weeks = clubs.map((c) => ({ club: c, n: classesAWeek(slots, c.slug) }))
  const most = Math.max(...weeks.map((w) => w.n))
  return (
    <div
      className={cn(
        "grid gap-xxl lg:grid-cols-12 lg:gap-section",
        className
      )}
    >
      <div className="lg:col-span-5">
        <p className="tabular font-data text-figure-xl font-heavy">{total}</p>
        <p className="mt-xs text-body-l text-pretty">
          classes a week across the {clubs.length} clubs, in {categories.length}{" "}
          types.
        </p>
        <ul className="mt-xl grid grid-cols-2 gap-x-l rule-t">
          {categories.map((cat) => (
            <li key={cat.id} className="rule-b">
              <Link
                href={`/classes#type-${cat.id}`}
                className={cn(
                  "flex min-h-14 items-center gap-s",
                  "py-xs",
                  "text-body-m no-underline",
                  "hover:underline"
                )}
              >
                <CategoryTile category={cat.id} className="size-8 shrink-0" />
                {cat.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div className="lg:col-span-7">
        <h3 className="font-display-wide text-body-l font-medium">
          Classes a week at each club
        </h3>
        <ul className="mt-l rule-t rule-heavy">
          {weeks.map(({ club, n }) => (
            <li
              key={club.slug}
              className="grid grid-cols-[minmax(0,10rem)_minmax(0,1fr)_3rem] items-center gap-x-m py-m rule-b sm:grid-cols-[12rem_minmax(0,1fr)_3rem]"
            >
              <Link
                href={`/clubs/${club.slug}#classes`}
                className={cn("text-body-m", quietLink)}
              >
                {club.short}
              </Link>
              {/* Decorative: the number beside it says the same. The section is on the tint band, which is
                  the muted colour, so the track is a mix of the text colour and shows on it. */}
              <span
                aria-hidden="true"
                className="h-2 overflow-hidden corner-full bg-[color-mix(in_oklab,var(--foreground)_12%,transparent)]"
              >
                <span
                  className="block h-full corner-full bg-primary"
                  style={{ width: `${(n / most) * 100}%` }}
                />
              </span>
              <span className="text-right text-body-m tabular-nums font-heavy">
                {n}
              </span>
            </li>
          ))}
        </ul>
        <dl className="mt-xl grid gap-l sm:grid-cols-3">
          {[
            {
              t: "Trailhead",
              d: "Your club's week. Book 7 days ahead.",
            },
            { t: "Ridge", d: `All ${total} a week. Book 7 days ahead.` },
            {
              t: "Summit",
              d: `All ${total}, and book 9 days ahead for the busy ones.`,
            },
          ].map((x) => (
            <div key={x.t} className="pt-m rule-t">
              <dt className="text-body-m font-heavy">{x.t}</dt>
              <dd className="mt-xxs text-body-m text-pretty text-muted-foreground">
                {x.d}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  )
}

/** A cost that waits until you need it: the object that stands for it, the price and one line. */
const extras = (prices: Prices, bestPack?: Pack) =>
  [
    {
      icon: "water-bottle",
      label: "Day pass or extra guest pass",
      amount: `$${prices.dayPass}`,
      note: "One visit to one club. Ridge includes 1 guest pass a month, Summit 4.",
    },
    {
      icon: "whistle",
      label: "Personal training",
      amount: `$${prices.ptSingle}`,
      note: bestPack
        ? `A session, or $${bestPack.each} each in a pack of ${bestPack.n}.`
        : "A session.",
    },
    {
      icon: "schedule",
      label: "Freeze",
      amount: `$${prices.freeze}/mo`,
      note: "For 1 to 3 months. One fee for the whole account.",
    },
  ] satisfies { icon: ObjectId; label: string; amount: string; note: string }[]

/** What never costs extra. Each line ties the price back to the classes and the plans. */
const alwaysFree = [
  "Every group class on your plan",
  "Booking classes in the app",
  "No contract, month to month",
  "Canceling, with 30 days' notice",
]

/**
 * Every cost, in the order a member meets it: the path of what you pay (today, each month with the three
 * plan prices linked to their plans, and each March), with the things that never cost extra beside it, then
 * the three costs that wait until you need them, each with its object. The fall offer is a fact of the first
 * stop, not a promotion card: the hero states it near the top, and here it is the price you pay today. All amounts come from the price table, so the page and the join flow
 * never disagree.
 */
export function PlanCosts({
  plans,
  prices,
  packs,
  className,
}: {
  plans: Plan[]
  prices: Prices
  packs: Pack[]
  className?: string
}) {
  const bestPack = packs.reduce<Pack | undefined>(
    (a, b) => (!a || b.each < a.each ? b : a),
    undefined
  )
  const path = [
    {
      when: "Today",
      amount: "$0",
      was: `$${prices.enrollment}`,
      title: "Enrollment",
      note: `$0 when you join by Nov 30, usually $${prices.enrollment}. Then your first month at your plan's price.`,
      link: { href: "/offers/fall-climb", label: "Offer terms" },
      now: true,
    },
    {
      when: "Every month",
      amount: "Your plan",
      title: "On the day you joined",
      note: null,
      now: false,
    },
    {
      when: "Each March",
      amount: `$${prices.facilityFee}`,
      title: "Facility fee",
      note: "One charge a year, on every plan.",
      now: false,
    },
  ]
  return (
    <div className={className}>
      <div className="grid gap-xxl lg:grid-cols-12 lg:gap-section">
        {/* What you pay, and when. */}
        <div className="lg:col-span-7">
          <h3 className="font-display-wide text-body-l font-medium">
            What you pay, and when
          </h3>
          <ol className="mt-l">
            {path.map((s, i) => (
              <li
                key={s.when}
                className="relative grid grid-cols-[1.5rem_minmax(0,1fr)] gap-x-m pb-xxl last:pb-zero"
              >
                {/* The rail: one line from each dot down to the next dot. It sits on the stop, not in the dot's
                    column, so it runs through the stop's bottom padding and meets the next dot. */}
                {i < path.length - 1 ? (
                  <span
                    aria-hidden="true"
                    className="absolute top-5 -bottom-1.5 left-[11px] w-0.5 bg-[color-mix(in_oklab,var(--foreground)_25%,transparent)]"
                  />
                ) : null}
                <span
                  aria-hidden="true"
                  className="relative flex justify-center"
                >
                  <span
                    className={cn(
                      "mt-xs size-3.5 corner-full",
                      s.now
                        ? "bg-primary ring-4 ring-[color-mix(in_oklab,var(--cat-strength)_25%,transparent)]"
                        : "bg-card ring-2 ring-foreground"
                    )}
                  />
                </span>
                <div className="min-w-0">
                  {/* The stop's name and line on the left, its amount large on the right, as the plan prices. */}
                  <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-x-l">
                    <div className="min-w-0">
                      <p className="text-body-s text-muted-foreground font-heavy">
                        {s.when}
                      </p>
                      <p className="mt-xxs text-body-m font-heavy">{s.title}</p>
                      {s.note ? (
                        <p className="mt-xxs text-body-m text-pretty text-muted-foreground">
                          {s.note}
                        </p>
                      ) : null}
                      {"link" in s && s.link ? (
                        <TextLink href={s.link.href} className="mt-xxs">
                          {s.link.label}
                        </TextLink>
                      ) : null}
                    </div>
                    {s.amount !== "Your plan" ? (
                      <p className="flex flex-col items-end">
                        <span className="tabular font-data text-display-l font-heavy">
                          {s.amount}
                        </span>
                        {s.was ? (
                          <s className="mt-xxs text-body-m text-muted-foreground tabular-nums">
                            <span className="sr-only">usually </span>
                            {s.was}
                          </s>
                        ) : null}
                      </p>
                    ) : null}
                  </div>
                  {s.note ? null : (
                    // Each month is the plan price, so the stop shows the three plans, each linked to its column.
                    <ul
                      className={cn(
                        "grid grid-cols-3 overflow-hidden hairline",
                        "mt-s corner-s",
                        "bg-card ring-border"
                      )}
                    >
                      {plans.map((p, j) => (
                        <li key={p.slug} className={cn(j > 0 && "rule-l")}>
                          <Link
                            href={`#plan-${p.slug}`}
                            className={cn(
                              "flex min-h-11 flex-col",
                              "px-s py-s",
                              "no-underline",
                              "hover:bg-muted sm:px-m"
                            )}
                          >
                            <span className="text-body-s text-muted-foreground">
                              {p.name}
                            </span>
                            <span className="tabular font-data text-body-l font-heavy">
                              ${p.price}
                              <span className="text-body-s font-regular text-muted-foreground">
                                /mo
                              </span>
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </div>
        <section aria-labelledby="free-title" className="lg:col-span-5">
          <h3
            id="free-title"
            className="font-display-wide text-body-l font-medium"
          >
            Always $0
          </h3>
          <ul className="mt-l rule-t rule-heavy">
            {alwaysFree.map((t) => (
              <li
                key={t}
                className="flex items-center gap-s py-m text-body-m rule-b"
              >
                <Check className="size-4 shrink-0" aria-hidden="true" />
                {t}
              </li>
            ))}
          </ul>
          <TextLink href="/legal/membership-agreement" className="mt-m">
            Read the membership agreement
          </TextLink>
        </section>
      </div>

      {/* The costs that wait until you need them. */}
      <div className="mt-section">
        <section aria-labelledby="extras-title">
          <h3
            id="extras-title"
            className="font-display-wide text-body-l font-medium"
          >
            Only when you need it
          </h3>
          <ul
            className={cn(
              "grid overflow-hidden hairline",
              "mt-l corner-m",
              "bg-card ring-border",
              "md:grid-cols-3"
            )}
          >
            {extras(prices, bestPack).map((x, i) => (
              <li
                key={x.label}
                className={cn(
                  "grid grid-cols-[2.5rem_minmax(0,1fr)] gap-x-m gap-y-xxs",
                  "p-l",
                  "md:flex md:flex-col md:gap-s md:p-l",
                  i > 0 && "max-md:rule-t md:rule-l"
                )}
              >
                <GymObject id={x.icon} className="row-span-3 size-10" />
                {/* The amount comes before the name, so the three amounts line up when a name wraps. */}
                <p className="tabular font-data text-display-l md:mt-xs font-heavy">
                  {x.amount}
                </p>
                <p className="text-body-m font-heavy">{x.label}</p>
                <p className="text-body-s text-pretty text-muted-foreground">
                  {x.note}
                </p>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  )
}
