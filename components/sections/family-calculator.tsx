"use client"

import { useState } from "react"
import { LinkButton } from "@/components/brand/atoms"
import { ChildHead, Minus, Plus, User } from "@/components/icons"
import { useCatalog } from "@/components/site/catalog-context"
import { RadioGroupBox } from "@/components/ui/radio-group-box"
import type { Club, Plan } from "@/lib/types"
import { cn } from "@/lib/utils"

const MAX_ADULTS = 4
const MAX_KIDS = 6

/** What each plan gives everyone on the account, in the plan's own words. */
const planLine: Record<Plan["slug"], string> = {
  trailhead: "Everyone trains at your home club, with every class there.",
  ridge: "Everyone trains at all 5 clubs, with every class and all 3 pools.",
  summit: "Everyone gets Ridge, plus recovery at 4 clubs and 9-day booking.",
}

/** "A, B and C". */
function listOf(items: string[]) {
  if (items.length < 2) return items.join("")
  return `${items.slice(0, -1).join(", ")} and ${items.at(-1)}`
}

/**
 * One person on the account, as a figure in the family row. Every figure is the same size; the icon tells
 * adults (a head and shoulders) from children (a child's face), and the label under it says the same. The
 * primary member is the Night figure; everyone added is outlined. The row is hidden from screen readers:
 * the counts and the total name the same people.
 */
function Figure({ kind }: { kind: "you" | "adult" | "child" }) {
  const Icon = kind === "child" ? ChildHead : User
  return (
    <span className="flex w-14 shrink-0 flex-col items-center gap-xxs">
      <span
        className={cn(
          "grid size-14 place-items-center corner-full",
          kind === "you"
            ? "bg-night text-night-foreground"
            : "bg-card text-foreground hairline ring-border-strong"
        )}
      >
        <Icon className="size-6" />
      </span>
      <span className="text-body-s text-muted-foreground">
        {kind === "you" ? "You" : kind === "adult" ? "Adult" : "Child"}
      </span>
    </span>
  )
}

/** Add or remove one kind of member: the name, the price each, the count and two buttons. */
function MemberRow({
  label,
  each,
  count,
  max,
  step,
}: {
  label: string
  each: number
  count: number
  max: number
  /** Moves the count by one, from the latest value, so quick taps never use a stale count. */
  step: (by: 1 | -1) => void
}) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-m py-m rule-b">
      <div>
        <p className="text-body-m font-heavy">{label}</p>
        <p className="text-body-s text-muted-foreground tabular-nums">
          +${each} a month each
          {count >= max ? ". Need more? Call us." : ""}
        </p>
      </div>
      <div className="flex items-center gap-xxs">
        <button
          type="button"
          onClick={() => count > 0 && step(-1)}
          aria-disabled={count === 0 || undefined}
          aria-label={`Remove one: ${label}`}
          className={cn(
            "grid size-11 place-items-center hairline",
            "corner-s",
            "bg-card ring-border",
            "hover:ring-border-strong aria-disabled:opacity-40"
          )}
        >
          <Minus className="size-4" aria-hidden="true" />
        </button>
        {/* The count is read out with its label when it changes, through the total's live region. */}
        <span className="w-8 text-center text-body-l font-heavy tabular-nums">
          {count}
        </span>
        <button
          type="button"
          onClick={() => count < max && step(1)}
          aria-disabled={count >= max || undefined}
          aria-label={`Add one: ${label}`}
          className={cn(
            "grid size-11 place-items-center hairline",
            "corner-s",
            "bg-card ring-border",
            "hover:ring-border-strong aria-disabled:opacity-40"
          )}
        >
          <Plus className="size-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}

/**
 * The family plan builder. The left column builds the account: the plan, then who is on it, shown as a row
 * of figures that grows as people are added, then plain lines that say what the choices mean for the family.
 * The right column is the total, line by line, and the one action. From lg the two sit side by side and the
 * total stays in view; below lg the total follows the builder.
 */
export function FamilyCalculator({ className }: { className?: string }) {
  const {
    plans,
    clubs,
    prices: { adult: ADULT, child: CHILD, facilityFee: FEE },
  } = useCatalog()
  const [plan, setPlan] = useState<Plan["slug"]>("ridge")
  const [adults, setAdults] = useState(1)
  const [kids, setKids] = useState(2)
  const p = plans.find((x) => x.slug === plan) ?? plans[0]
  const total = p.price + adults * ADULT + kids * CHILD
  const people = 1 + adults + kids
  const kidsClubs = clubs.filter((c: Club) => c.has.kids).map((c) => c.short)

  // What the choices mean, one line each, in the order a parent asks.
  const notes = [
    planLine[p.slug],
    adults
      ? `${adults === 1 ? "Your adult add-on gets" : adults === 2 ? "Both adult add-ons get" : `All ${adults} adult add-ons get`} the same plan as you.`
      : null,
    kids
      ? `Kids club is included for children 12 and under, at ${listOf(kidsClubs)}.`
      : null,
    kids ? "Teens 13 to 17 follow the teen rules." : null,
    p.slug === "trailhead" && (adults || kids)
      ? "Everyone shares your home club."
      : null,
  ].filter((x): x is string => Boolean(x))

  return (
    <div
      className={cn(
        "grid gap-xxl lg:grid-cols-12 lg:items-start lg:gap-section",
        className
      )}
    >
      <div className="lg:col-span-7">
        <fieldset>
          <legend className="text-body-s font-heavy">Plan for everyone</legend>
          <RadioGroupBox className="mt-s grid grid-cols-3 gap-xs">
            {plans.map((x) => (
              // biome-ignore lint/a11y/useSemanticElements: button radiogroup is a keyboard-tested pattern from the approved a11y audit (axe clean); native radios would restructure the component
              <button
                key={x.slug}
                type="button"
                role="radio"
                aria-checked={plan === x.slug}
                onClick={() => setPlan(x.slug)}
                className={cn(
                  "flex min-h-14 flex-col items-start justify-center hairline",
                  "corner-s px-m py-xs",
                  "text-left",
                  plan === x.slug
                    ? "bg-card ring-2 ring-primary"
                    : "bg-card ring-border hover:ring-border-strong"
                )}
              >
                <span className="text-body-s font-heavy">{x.name}</span>
                <span className="text-body-s text-muted-foreground tabular-nums">
                  ${x.price}/mo
                </span>
              </button>
            ))}
          </RadioGroupBox>
        </fieldset>

        <div className="mt-xl">
          <p className="text-body-s font-heavy">
            On the account{" "}
            <span className="font-regular text-muted-foreground tabular-nums">
              {people} {people === 1 ? "person" : "people"}
            </span>
          </p>
          {/* The family row: you, then each adult, then each child. */}
          <div
            aria-hidden="true"
            className={cn(
              "flex min-h-24 flex-wrap items-start gap-x-xs gap-y-s",
              "mt-s corner-m p-s",
              "bg-muted"
            )}
          >
            <Figure kind="you" />
            {Array.from({ length: adults }, (_, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: figures are identical and only their count matters
              <Figure key={`a${i}`} kind="adult" />
            ))}
            {Array.from({ length: kids }, (_, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: figures are identical and only their count matters
              <Figure key={`k${i}`} kind="child" />
            ))}
          </div>
          <div className="mt-xs">
            <MemberRow
              label="Adults (besides you)"
              each={ADULT}
              count={adults}
              max={MAX_ADULTS}
              step={(by) =>
                setAdults((n) => Math.min(MAX_ADULTS, Math.max(0, n + by)))
              }
            />
            <MemberRow
              label="Children, 6 months to 17"
              each={CHILD}
              count={kids}
              max={MAX_KIDS}
              step={(by) =>
                setKids((n) => Math.min(MAX_KIDS, Math.max(0, n + by)))
              }
            />
          </div>
        </div>

        <ul className="mt-l grid gap-xs">
          {notes.map((n) => (
            <li key={n} className="flex gap-s text-body-m text-pretty">
              <span
                aria-hidden="true"
                className="mt-s size-1.5 shrink-0 corner-full bg-primary"
              />
              {n}
            </li>
          ))}
        </ul>
      </div>

      {/* The total. It stays in view from lg while the builder scrolls. */}
      <div className="lg:sticky lg:top-[calc(var(--sticky-top)+1.5rem)] lg:col-span-5">
        <section
          aria-label="Your family's monthly cost"
          className="corner-m bg-card p-l hairline ring-border lg:p-xl"
        >
          <dl className="text-body-m tabular-nums">
            <div className="flex items-baseline justify-between gap-m pb-s rule-b">
              <dt>{p.name}, you</dt>
              <dd>${p.price}</dd>
            </div>
            <div
              className={cn(
                "flex items-baseline justify-between gap-m py-s rule-b",
                !adults && "text-muted-foreground"
              )}
            >
              <dt>
                {adults} {adults === 1 ? "adult" : "adults"} × ${ADULT}
              </dt>
              <dd>${adults * ADULT}</dd>
            </div>
            <div
              className={cn(
                "flex items-baseline justify-between gap-m py-s rule-b",
                !kids && "text-muted-foreground"
              )}
            >
              <dt>
                {kids} {kids === 1 ? "child" : "children"} × ${CHILD}
              </dt>
              <dd>${kids * CHILD}</dd>
            </div>
          </dl>
          {/* Announced when it changes, so a screen reader hears the new total after each tap. */}
          <div aria-live="polite" className="mt-l">
            <p className="text-body-s text-muted-foreground font-heavy">
              Each month for {people} {people === 1 ? "person" : "people"}
            </p>
            <p className="tabular font-data text-display-xxl font-heavy">
              ${total}
            </p>
            <p className="mt-xs text-body-s text-muted-foreground tabular-nums">
              + ${FEE} facility fee each March
            </p>
          </div>
          <LinkButton
            href={`/join/plan?plan=${plan}&adults=${adults}&children=${kids}`}
            className="mt-l w-full"
          >
            Join with this family
          </LinkButton>
        </section>
      </div>
    </div>
  )
}
