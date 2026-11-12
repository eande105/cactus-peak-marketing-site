import { LinkButton } from "@/components/brand/atoms"
import { GymObject, type ObjectId } from "@/components/brand/graphics"
import { RibMeter } from "@/components/brand/meters"
import { SWIM } from "@/lib/labels"
import { cn } from "@/lib/utils"

/*
 * Swim school facts (00-foundation.md section 4.1), shared by /kids, /aquatics and the Aqua class page
 * so the ages, the price and the way to sign up read the same everywhere.
 */

/** The five levels with the age range of each. */
export function SwimLevels({ className }: { className?: string }) {
  return (
    <ol className={cn("flex flex-col", className)}>
      {SWIM.levels.map(([name, ages, line], i) => (
        <li
          key={name}
          className="flex items-center gap-4 py-4 rule-b first:rule-t"
        >
          <RibMeter
            value={i + 1}
            tone="category"
            categoryId="aqua"
            size="md"
            profile="flat"
            label="Level"
            valueText={`Level ${i + 1} of 5`}
            decorative
          />
          <div>
            <p className="font-display-wide text-h3">
              Level {i + 1} {name}
              <span className="ml-2 text-body font-normal text-muted-foreground">
                Ages {ages}
              </span>
            </p>
            <p className="text-body text-muted-foreground">{line}</p>
          </div>
        </li>
      ))}
    </ol>
  )
}

/** Price, who can enrol, the level check, and the ways to act. */
export function SwimFacts({
  className,
  cta = true,
}: {
  className?: string
  cta?: boolean
}) {
  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <p className="text-body-strong">
        Ages {SWIM.ages}. At {SWIM.clubName} only. One 30-minute lesson a week,
        4 to 6 children per coach.
      </p>
      <p className="text-body">
        <span className="tabular font-semibold">${SWIM.memberPrice}</span> per
        6-week session for a member’s child.{" "}
        <span className="tabular font-semibold">${SWIM.nonMemberPrice}</span>{" "}
        for a non-member. Swim school is not part of the $19 child add-on.
      </p>
      <p className="text-body">
        Non-members can enrol. Ask at the front desk, call {SWIM.phone}, or ask
        on a tour. The first lesson starts with a free level check.
      </p>
      {cta ? (
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <LinkButton href={`/tour?club=${SWIM.club}&note=swim-school`}>
            Book a tour to see swim school
          </LinkButton>
          <LinkButton href={SWIM.tel} variant="outline">
            Call {SWIM.phone}
          </LinkButton>
        </div>
      ) : null}
    </div>
  )
}

/** "3–5" as numbers. */
const agesOf = (ages: string) => ages.split("–").map(Number) as [number, number]
const AGE_MIN = 3
const AGE_MAX = 12
const agePct = (a: number) =>
  `${((a - AGE_MIN) / (AGE_MAX + 1 - AGE_MIN)) * 100}%`

/** The facts that say how lessons run, each as a figure with its object. */
const RUNS: { icon: ObjectId; value: string; label: string }[] = [
  { icon: "stopwatch", value: "30 min", label: "one lesson a week" },
  { icon: "schedule", value: "6 weeks", label: "in a session" },
  { icon: "whistle", value: "4–6", label: "children per coach" },
  { icon: "pool", value: "1 club", label: SWIM.clubName },
]

/**
 * Swim school, laid out so a parent can see how it runs and where their child fits: how lessons run as four figures;
 * the five levels as bars on one age line (a child's age reads down to the levels that fit, and the last level is
 * lit as the goal); the two prices side by side; and how to start as three steps. All facts come from SWIM, so the
 * kids page, the aquatics page and the Aqua class page agree.
 */
export function SwimSchoolGuide({ className }: { className?: string }) {
  const ticks = Array.from(
    { length: AGE_MAX - AGE_MIN + 1 },
    (_, i) => AGE_MIN + i
  )
  return (
    <div className={cn("flex flex-col gap-12", className)}>
      {/* How lessons run. */}
      <ul className="grid grid-cols-2 rule-y md:grid-cols-4">
        {RUNS.map((r, i) => (
          <li
            key={r.label}
            className={cn(
              "flex items-center gap-3 py-5",
              i % 2 === 1 && "max-md:pl-4 max-md:rule-l",
              i > 1 && "max-md:rule-t",
              i > 0 && "md:pl-6 md:rule-l"
            )}
          >
            <GymObject id={r.icon} className="size-9 shrink-0" />
            <span>
              <span className="font-display-wide block text-h3 tabular-nums">
                {r.value}
              </span>
              <span className="block text-label text-muted-foreground">
                {r.label}
              </span>
            </span>
          </li>
        ))}
      </ul>

      {/* The levels on one age line. */}
      <section aria-labelledby="swim-levels">
        <h3 id="swim-levels" className="font-display-wide text-h3">
          Find your child’s level
        </h3>
        <ol className="mt-6 rule-t rule-heavy">
          {SWIM.levels.map(([name, ages, skill], i) => {
            const [from, to] = agesOf(ages)
            const goal = i === SWIM.levels.length - 1
            return (
              <li
                key={name}
                className="grid gap-x-8 gap-y-3 py-4 rule-b md:grid-cols-[minmax(0,17rem)_minmax(0,1fr)] md:items-center"
              >
                <div className="flex items-start gap-3">
                  <span
                    aria-hidden="true"
                    className={cn(
                      "grid size-9 shrink-0 place-items-center rounded-full font-data text-label font-bold tabular-nums",
                      goal
                        ? "bg-[var(--cat-strength)] text-[var(--neutral-1)]"
                        : "bg-night text-night-foreground"
                    )}
                  >
                    {i + 1}
                  </span>
                  <div className="min-w-0">
                    <h4 className="text-body-strong">
                      <span className="sr-only">Level {i + 1}: </span>
                      {name}
                    </h4>
                    <p className="text-body text-pretty text-muted-foreground">
                      {skill}
                    </p>
                  </div>
                </div>
                <div
                  className="relative h-9 rounded-full bg-[color-mix(in_oklab,var(--foreground)_6%,transparent)]"
                  title={`Ages ${ages}`}
                >
                  <span
                    className={cn(
                      "absolute inset-y-0 grid place-items-center rounded-full px-3 text-label font-semibold whitespace-nowrap",
                      goal
                        ? "bg-[var(--cat-strength)] text-[var(--neutral-1)]"
                        : "bg-night text-night-foreground"
                    )}
                    style={{
                      left: agePct(from),
                      width: `calc(${agePct(to + 1)} - ${agePct(from)})`,
                    }}
                  >
                    Ages {ages}
                  </span>
                </div>
              </li>
            )
          })}
        </ol>
        {/* The age scale, under the bars' column. */}
        <div className="grid gap-x-8 md:grid-cols-[minmax(0,17rem)_minmax(0,1fr)]">
          <span className="max-md:hidden" />
          <div
            aria-hidden="true"
            className="relative mt-2 h-5 text-caption text-muted-foreground tabular-nums"
          >
            {ticks.map((t) => (
              <span
                key={t}
                className="absolute -translate-x-1/2"
                style={{
                  left: `calc(${agePct(t)} + (${agePct(t + 1)} - ${agePct(t)}) / 2)`,
                }}
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Price and how to start. */}
      <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
        <section aria-labelledby="swim-price" className="lg:col-span-5">
          <h3 id="swim-price" className="font-display-wide text-h3">
            Price for a 6-week session
          </h3>
          <dl className="mt-5 grid grid-cols-2 overflow-hidden rounded-lg bg-card edge ring-border">
            <div className="p-5">
              <dt className="text-label text-muted-foreground">
                Member’s child
              </dt>
              <dd className="tabular mt-1 font-data text-figure">
                ${SWIM.memberPrice}
              </dd>
            </div>
            <div className="p-5 rule-l">
              <dt className="text-label text-muted-foreground">Non-member</dt>
              <dd className="tabular mt-1 font-data text-figure">
                ${SWIM.nonMemberPrice}
              </dd>
            </div>
          </dl>
          <p className="mt-3 text-body text-pretty text-muted-foreground">
            The $19 child add-on does not cover swim school.
          </p>
        </section>
        <section aria-labelledby="swim-start" className="lg:col-span-7">
          <h3 id="swim-start" className="font-display-wide text-h3">
            How to start
          </h3>
          <ol className="mt-5 grid gap-5 sm:grid-cols-3">
            {[
              {
                t: "Ask for a spot",
                d: `At the front desk, by phone at ${SWIM.phone}, or on a tour. Non-members can enrol.`,
              },
              {
                t: "Free level check",
                d: "The first lesson starts with one. The coach places your child in the level that fits.",
              },
              {
                t: "Lessons each week",
                d: "30 minutes, for the 6 weeks of the session.",
              },
            ].map((s, i) => (
              <li key={s.t} className="pt-3 rule-t rule-heavy">
                <span
                  aria-hidden="true"
                  className="tabular font-data text-h3 font-bold"
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p className="mt-2 text-body-strong">{s.t}</p>
                <p className="mt-1 text-body text-pretty text-muted-foreground">
                  {s.d}
                </p>
              </li>
            ))}
          </ol>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <LinkButton href={`/tour?club=${SWIM.club}&note=swim-school`}>
              Book a tour to see swim school
            </LinkButton>
            <LinkButton href={SWIM.tel} variant="outline">
              Call {SWIM.phone}
            </LinkButton>
          </div>
        </section>
      </div>
    </div>
  )
}
