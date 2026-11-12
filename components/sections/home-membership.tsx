"use client"

import Image from "next/image"
import Link from "next/link"

import { LinkButton, TextLink } from "@/components/brand/atoms"
import {
  GymObject,
  type ObjectId,
  ObjectRow,
  planObjects,
} from "@/components/brand/graphics"
import { useCatalog } from "@/components/site/catalog-context"
import { cn } from "@/lib/utils"

// What every member gets, whatever the plan. Each line is a fact from the membership page.
const perks: { icon: ObjectId; title: string; line: string }[] = [
  {
    icon: "schedule",
    title: "Classes included",
    line: "Every class at your club, booked in the app.",
  },
  {
    icon: "calendar",
    title: "No contract",
    line: "Month to month. Cancel or freeze with 30 days' notice.",
  },
  {
    icon: "gym-bag",
    title: "$0 to start",
    line: "No enrollment fee through Nov 30 (otherwise $49).",
  },
  {
    icon: "towel",
    title: "Bring a friend",
    line: "Ridge includes 1 guest pass a month, Summit 4.",
  },
]

/**
 * Home membership: the three plans and their prices first, because the price is what a visitor decides
 * on, then the actions, then what every plan includes (references: the Superpower membership card and the
 * MasterClass "What's in every membership" list on Mobbin). The full comparison table lives on
 * /membership. From lg the Night member pass sits over the perks, as in the app's check-in pass
 * (VISUAL-IDENTITY.md, section 8). Below lg it is left out: it is decorative and would push the perks a
 * screen down.
 */
export function HomeMembership({ className }: { className?: string }) {
  const { plans } = useCatalog()
  const featured = plans.find((p) => p.badge) ?? plans[0]
  return (
    <div
      className={cn(
        "grid gap-section lg:grid-cols-12",
        className
      )}
    >
      <div className="lg:col-span-6">
        <p className="max-w-[46ch] text-body-l text-pretty">
          Every plan includes every class at your club. Ridge and Summit open
          all 5 clubs, their pools and the courts.
        </p>
        <PlanBriefList className="mt-xl" />
        <div className="mt-xl flex flex-wrap items-center gap-x-l gap-y-s">
          <LinkButton href={`/join/plan?plan=${featured.slug}`}>
            Become a member
          </LinkButton>
          <TextLink href="/trial">Try a free 3-day pass</TextLink>
        </div>
      </div>

      <div className="lg:col-span-6">
        {/* Decorative: the plan list names every plan. The pass shows the most popular plan. */}
        <div
          aria-hidden="true"
          className={cn(
            "hidden aspect-[1.586] w-full max-w-md flex-col justify-between",
            "corner-m p-l",
            "-rotate-2 bg-night text-night-foreground shadow-(--shadow-m)",
            "lg:flex"
          )}
        >
          <Image
            src="/brand/cpa-horizontal-reversed.svg"
            alt=""
            width={200}
            height={43}
            className="self-start"
          />
          <div className="flex items-end justify-between gap-m">
            <div>
              <p className="text-body-s text-night-muted">Member</p>
              <p className="font-display-wide text-body-xxl font-heavy">
                {featured.name}
              </p>
            </div>
            <ObjectRow
              ids={planObjects[featured.slug].slice(0, 3)}
              scheme="night"
              className="w-28"
            />
          </div>
        </div>
        {/* The pass is the app's check-in pass, so the app is named here, where the pass shows it. Below lg the
            pass is hidden and the line stands alone. */}
        <p className="mb-xxl flex flex-wrap items-center gap-x-m gap-y-xxs lg:mt-xl">
          <span className="text-body-m font-heavy">
            Your pass, bookings and kids club live in the app.
          </span>
          <TextLink href="/app">Get the app</TextLink>
        </p>

        <h3 className="font-display-wide text-body-l font-medium">
          What members get
        </h3>
        <ul className="mt-l grid gap-x-xl gap-y-xl sm:grid-cols-2">
          {perks.map((p) => (
            <li key={p.title} className="pt-l rule-t">
              <GymObject id={p.icon} className="size-8" />
              <p className="mt-m text-body-m font-heavy">{p.title}</p>
              <p className="mt-xxs text-body-m text-pretty text-muted-foreground">
                {p.line}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

/** The three plans as ruled rows: the name, the price and who each is for. Each row starts the join flow. */
export function PlanBriefList({ className }: { className?: string }) {
  const { plans } = useCatalog()
  return (
    <ul className={cn("rule-t", className)}>
      {plans.map((p) => (
        <li key={p.slug} className="rule-b">
          <Link
            href={`/join/plan?plan=${p.slug}`}
            className={cn(
              "group grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-l gap-y-xxs",
              "py-m",
              "no-underline"
            )}
          >
            <span className="flex items-center gap-s">
              <span className="font-display-wide text-body-l group-hover:underline font-medium">
                {p.name}
              </span>
              {p.badge ? (
                <span className="corner-xs bg-accent px-xs text-body-s text-foreground">
                  {p.badge}
                </span>
              ) : null}
            </span>
            <span className="tabular text-body-m font-heavy">
              ${p.price}
              <span className="font-regular text-muted-foreground">/mo</span>
            </span>
            <span className="col-span-2 text-body-m text-muted-foreground">
              {p.bestFor.replace(/^Best for: /, "For ")}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  )
}
