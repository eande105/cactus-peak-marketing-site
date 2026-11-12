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
    <div className={cn("grid gap-16 lg:grid-cols-12", className)}>
      <div className="lg:col-span-6">
        <p className="max-w-[46ch] text-lead text-pretty">
          Every plan includes every class at your club. Ridge and Summit open
          all 5 clubs, their pools and the courts.
        </p>
        <PlanBriefList className="mt-8" />
        <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
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
          className="hidden aspect-[1.586] w-full max-w-md -rotate-2 flex-col justify-between rounded-lg bg-night p-6 text-night-foreground shadow-(--shadow-m) lg:flex"
        >
          <Image
            src="/brand/cpa-horizontal-reversed.svg"
            alt=""
            width={200}
            height={43}
            className="self-start"
          />
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-caption text-night-muted">Member</p>
              <p className="font-display-wide text-h2">{featured.name}</p>
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
        <p className="mb-12 flex flex-wrap items-center gap-x-4 gap-y-1 lg:mt-8">
          <span className="text-body-strong">
            Your pass, bookings and kids club live in the app.
          </span>
          <TextLink href="/app">Get the app</TextLink>
        </p>

        <h3 className="font-display-wide text-h3">What members get</h3>
        <ul className="mt-6 grid gap-x-8 gap-y-8 sm:grid-cols-2">
          {perks.map((p) => (
            <li key={p.title} className="pt-5 rule-t">
              <GymObject id={p.icon} className="size-8" />
              <p className="mt-4 text-body-strong">{p.title}</p>
              <p className="mt-1 text-body text-pretty text-muted-foreground">
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
            className="group grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-6 gap-y-1 py-4 no-underline"
          >
            <span className="flex items-center gap-3">
              <span className="font-display-wide text-h3 group-hover:underline">
                {p.name}
              </span>
              {p.badge ? (
                <span className="rounded-sm bg-accent px-1.5 text-caption text-foreground">
                  {p.badge}
                </span>
              ) : null}
            </span>
            <span className="tabular text-body-strong">
              ${p.price}
              <span className="font-normal text-muted-foreground">/mo</span>
            </span>
            <span className="col-span-2 text-body text-muted-foreground">
              {p.bestFor.replace(/^Best for: /, "For ")}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  )
}
