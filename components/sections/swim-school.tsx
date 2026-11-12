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
          className="flex items-center gap-m py-m rule-b first:rule-t"
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
            <p className="font-display-wide text-body-l font-medium">
              Level {i + 1} {name}
              <span className="ml-xs text-body-m font-regular text-muted-foreground">
                Ages {ages}
              </span>
            </p>
            <p className="text-body-m text-muted-foreground">{line}</p>
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
    <div className={cn("flex flex-col gap-s", className)}>
      <p className="text-body-m font-heavy">
        Ages {SWIM.ages}. At {SWIM.clubName} only. One 30-minute lesson a week,
        4 to 6 children per coach.
      </p>
      <p className="text-body-m">
        <span className="tabular font-heavy">${SWIM.memberPrice}</span> per
        6-week session for a member’s child.{" "}
        <span className="tabular font-heavy">${SWIM.nonMemberPrice}</span> for a
        non-member. Swim school is not part of the $19 child add-on.
      </p>
      <p className="text-body-m">
        Non-members can enrol. Ask at the front desk, call {SWIM.phone}, or ask
        on a tour. The first lesson starts with a free level check.
      </p>
      {cta ? (
        <div className="mt-xs flex flex-wrap items-center gap-s">
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
    <div className={cn("flex flex-col gap-xxl", className)}>
      {/* How lessons run. */}
      <ul className="grid grid-cols-2 rule-y md:grid-cols-4">
        {RUNS.map((r, i) => (
          <li
            key={r.label}
            className={cn(
              "flex items-center gap-s py-l",
              i % 2 === 1 && "max-md:pl-m max-md:rule-l",
              i > 1 && "max-md:rule-t",
              i > 0 && "md:pl-l md:rule-l"
            )}
          >
            <GymObject id={r.icon} className="size-9 shrink-0" />
            <span>
              <span className="font-display-wide block text-body-l tabular-nums font-medium">
                {r.value}
              </span>
              <span className="block text-body-s text-muted-foreground font-heavy">
                {r.label}
              </span>
            </span>
          </li>
        ))}
      </ul>

      {/* The levels on one age line. */}
      <section aria-labelledby="swim-levels">
        <h3
          id="swim-levels"
          className="font-display-wide text-body-l font-medium"
        >
          Find your child’s level
        </h3>
        <ol className="mt-l rule-t rule-heavy">
          {SWIM.levels.map(([name, ages, skill], i) => {
            const [from, to] = agesOf(ages)
            const goal = i === SWIM.levels.length - 1
            return (
              <li
                key={name}
                className="grid gap-x-xl gap-y-s py-m rule-b md:grid-cols-[minmax(0,17rem)_minmax(0,1fr)] md:items-center"
              >
                <div className="flex items-start gap-s">
                  <span
                    aria-hidden="true"
                    className={cn(
                      "grid size-9 shrink-0 place-items-center",
                      "corner-full",
                      "font-data text-body-s font-heavy tabular-nums",
                      goal
                        ? "bg-[var(--cat-strength)] text-neutral-1"
                        : "bg-night text-night-foreground"
                    )}
                  >
                    {i + 1}
                  </span>
                  <div className="min-w-0">
                    <h4 className="text-body-m font-heavy">
                      <span className="sr-only">Level {i + 1}: </span>
                      {name}
                    </h4>
                    <p className="text-body-m text-pretty text-muted-foreground">
                      {skill}
                    </p>
                  </div>
                </div>
                <div
                  className="relative h-9 corner-full bg-[color-mix(in_oklab,var(--foreground)_6%,transparent)]"
                  title={`Ages ${ages}`}
                >
                  <span
                    className={cn(
                      "absolute inset-y-0 grid place-items-center",
                      "corner-full px-s",
                      "text-body-s font-heavy whitespace-nowrap",
                      goal
                        ? "bg-[var(--cat-strength)] text-neutral-1"
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
        <div className="grid gap-x-xl md:grid-cols-[minmax(0,17rem)_minmax(0,1fr)]">
          <span className="max-md:hidden" />
          <div
            aria-hidden="true"
            className="relative mt-xs h-5 text-body-s text-muted-foreground tabular-nums"
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
      <div className="grid gap-xxl lg:grid-cols-12 lg:gap-section">
        <section aria-labelledby="swim-price" className="lg:col-span-5">
          <h3
            id="swim-price"
            className="font-display-wide text-body-l font-medium"
          >
            Price for a 6-week session
          </h3>
          <dl
            className={cn(
              "grid grid-cols-2 overflow-hidden hairline",
              "mt-l corner-m",
              "bg-card ring-border"
            )}
          >
            <div className="p-l">
              <dt className="text-body-s text-muted-foreground font-heavy">
                Member’s child
              </dt>
              <dd className="tabular mt-xxs font-data text-display-l font-heavy">
                ${SWIM.memberPrice}
              </dd>
            </div>
            <div className="p-l rule-l">
              <dt className="text-body-s text-muted-foreground font-heavy">
                Non-member
              </dt>
              <dd className="tabular mt-xxs font-data text-display-l font-heavy">
                ${SWIM.nonMemberPrice}
              </dd>
            </div>
          </dl>
          <p className="mt-s text-body-m text-pretty text-muted-foreground">
            The $19 child add-on does not cover swim school.
          </p>
        </section>
        <section aria-labelledby="swim-start" className="lg:col-span-7">
          <h3
            id="swim-start"
            className="font-display-wide text-body-l font-medium"
          >
            How to start
          </h3>
          <ol className="mt-l grid gap-l sm:grid-cols-3">
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
              <li key={s.t} className="pt-s rule-t rule-heavy">
                <span
                  aria-hidden="true"
                  className="tabular font-data text-body-l font-heavy"
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p className="mt-xs text-body-m font-heavy">{s.t}</p>
                <p className="mt-xxs text-body-m text-pretty text-muted-foreground">
                  {s.d}
                </p>
              </li>
            ))}
          </ol>
          <div className="mt-l flex flex-wrap items-center gap-s">
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
