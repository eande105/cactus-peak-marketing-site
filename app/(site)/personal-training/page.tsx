import type { Metadata } from "next"
import { LinkButton, SectionHead, TextLink } from "@/components/brand/atoms"
import { SectionNav } from "@/components/sections/club-detail-client"
import { CoachFinder, type CoachGoal } from "@/components/sections/coach-finder"
import { Band, FaqSection, TourCTABand } from "@/components/sections/common"
import { SessionPlan } from "@/components/sections/program-heroes"
import {
  NumberedSteps,
  OfferColumns,
  ProgramHero,
  RuleList,
} from "@/components/sections/program-page"
import { getCatalog } from "@/lib/catalog/server"

export const metadata: Metadata = {
  title: "Personal training at Cactus Peak — packs from $61 a session",
  description:
    "One-on-one sessions at all 5 clubs. Packs of 4, 8 or 12, or a single session for $75.",
}

/** The page's sections, in order. The nav and the hero's actions use these anchors. */
const SECTIONS = [
  { id: "how", label: "How it works" },
  { id: "packs", label: "Packs" },
  { id: "coaches", label: "Find a coach" },
  { id: "questions", label: "Questions" },
]

const faq = [
  {
    id: "p1",
    q: "Do I have to buy a pack?",
    a: "No. A single session is $75. Packs of 4, 8 or 12 cost less per session.",
  },
  { id: "p2", q: "Can I switch coaches?", a: "Yes. Tell the front desk." },
  {
    id: "p3",
    q: "Does Summit include PT?",
    a: "Summit includes a 30-minute intro session each quarter.",
  },
]

/**
 * The goals a visitor comes with, each tied to the coach specialty that answers it. The coach finder lists them
 * in this order and leaves out a goal with no coach who takes clients.
 */
const GOALS: CoachGoal[] = [
  {
    title: "Injury comeback",
    specialty: "Return to training",
    icon: "resistance-band",
  },
  {
    title: "Strength",
    specialty: "Strength",
    icon: "barbell",
  },
  {
    title: "Cycling",
    specialty: "Cycle",
    icon: "spin-bike",
  },
  {
    title: "Court sports",
    specialty: "Court",
    icon: "paddle",
  },
  {
    title: "Mobility",
    specialty: "Mind & Body",
    icon: "mat",
  },
  {
    title: "Fitness",
    specialty: "Conditioning",
    icon: "jump-rope",
  },
  {
    title: "Recovery",
    specialty: "Recovery",
    icon: "spa-stones",
  },
  {
    title: "Swimming",
    specialty: "Aqua",
    icon: "pool",
  },
]

/**
 * Personal training. It answers, in order, what a visitor weighs before booking a coach: how the sessions
 * work, what they cost, which coach fits the goal, and the questions left. It shares the membership page's
 * parts: a hero with a picture made for the claim, the section nav, lead-size heads,
 * alternating bands and the Copper tour panel to close.
 */
export default async function PT() {
  const { packs, prices, clubs, coaches } = await getCatalog()
  const biggest = packs.reduce((a, b) => (b.n > a.n ? b : a), packs[0])
  const cheapest = Math.min(...packs.map((p) => p.each))
  const ptCoaches = coaches.filter((c) => c.pt).length
  return (
    <>
      <ProgramHero
        id="pt-hero-title"
        title="Your own coach, 45 minutes at a time."
        lede={`A plan written for your goal, your joints and your week, with one of ${ptCoaches} coaches at any of the ${clubs.length} clubs.`}
        actions={
          <>
            <LinkButton href="/tour" size="lg" className="max-sm:flex-1">
              Book a free tour
            </LinkButton>
            <LinkButton
              href="#packs"
              variant="outline"
              size="lg"
              className="max-sm:flex-1"
            >
              See the packs
            </LinkButton>
          </>
        }
        picture={<SessionPlan pack={biggest} each={cheapest} />}
      />

      <SectionNav items={SECTIONS} />

      <Band tone="tint" id="how">
        <SectionHead
          size="lead"
          title="A plan, not a workout."
          lede="Every session follows a written plan, and every fourth one checks it."
        />
        <NumberedSteps
          className="mt-xxl"
          steps={[
            {
              title: "Meet.",
              text: "On a free tour, or in Summit's 30-minute intro each quarter.",
              icon: "whistle",
            },
            {
              title: "Plan.",
              text: "Your coach writes a plan for your goal, your joints and your week.",
              icon: "schedule",
            },
            {
              title: "Train.",
              text: "Sessions are 45 minutes. Book them in the app.",
              icon: "kettlebell",
            },
            {
              title: "Review.",
              text: "Every 4 sessions, your coach checks the plan and moves it on.",
              icon: "heart-watch",
            },
          ]}
        />
      </Band>

      <Band id="packs">
        <SectionHead
          size="lead"
          title="The more you train, the less it costs."
          lede={`One session is $${prices.ptSingle}. A pack brings it down to $${cheapest}.`}
        />
        <OfferColumns
          className="mt-xxl"
          offers={packs.map((p) => ({
            key: String(p.n),
            title: `${p.n} sessions`,
            value: `$${p.each}`,
            unit: "a session",
            sub: `$${p.price} for the pack`,
            badge: p === biggest ? "Best value" : undefined,
            lit: p === biggest,
            lines: [
              `Save $${(prices.ptSingle - p.each) * p.n} on single sessions.`,
            ],
            action: (
              <LinkButton
                href="/tour"
                variant={p === biggest ? "primary" : "outline"}
              >
                Start with a tour
              </LinkButton>
            ),
          }))}
        />
        <div className="mt-xxl grid gap-xxl lg:grid-cols-12 lg:gap-section">
          <RuleList
            className="lg:col-span-7"
            title="Every pack"
            items={[
              "45-minute sessions, booked in the app",
              "Lasts 12 months, and pauses during a freeze",
              "Cancel or move a session free up to 24 hours before",
              "Train at any club your plan opens",
            ]}
          />
          <div className="lg:col-span-5">
            <h3 className="font-display-wide text-body-l font-medium">
              On Summit?
            </h3>
            <p className="mt-s text-body-m text-pretty text-muted-foreground">
              Summit includes a 30-minute intro session each quarter. Use it to
              meet a coach and get a plan before you buy a pack.
            </p>
            <TextLink href="/membership#plans" className="mt-s">
              See Summit
            </TextLink>
          </div>
        </div>
      </Band>

      <Band tone="tint" id="coaches">
        <SectionHead size="lead" title="Find your coach." />
        <div className="mt-xxl">
          <CoachFinder goals={GOALS} />
        </div>
      </Band>

      <FaqSection id="questions" title="Coaching questions." items={faq} />

      <TourCTABand
        night
        title="Find your coach on a tour."
        support="Tell us your goal when you book. A coach walks the club with you and talks through where to start. No card."
        passEmail
      />
    </>
  )
}
