import type { Metadata } from "next"
import { SectionHead, TextLink } from "@/components/brand/atoms"
import { PlanComparisonTable } from "@/components/brand/plan-parts"
import { SectionNav } from "@/components/sections/club-detail-client"
import { ClubsPlanCards } from "@/components/sections/clubs-plan-cards"
import {
  Band,
  FaqSection,
  JsonLd,
  TourCTABand,
} from "@/components/sections/common"
import { FamilyCalculator } from "@/components/sections/family-calculator"
import {
  MembershipHero,
  PlanClasses,
  PlanCosts,
  PlanNotes,
  PlanReach,
} from "@/components/sections/membership-overview"
import { getCatalog } from "@/lib/catalog/server"
import { kidsCostLine, PHONE_HOURS } from "@/lib/labels"

export const metadata: Metadata = {
  title: "Membership plans and prices — Cactus Peak",
  description:
    "Every plan includes every class. Trailhead $54 for your home club, Ridge $79 for all 5 clubs, Summit $129 with recovery. Month to month, $0 enrollment through Nov 30.",
}

/** The page's sections, in order. The nav and the hero's steps use these anchors. */
const SECTIONS = [
  { id: "plans", label: "Plans" },
  { id: "clubs", label: "Clubs" },
  { id: "classes", label: "Classes" },
  { id: "family", label: "Family" },
  { id: "costs", label: "Costs" },
  { id: "compare", label: "Compare" },
  { id: "questions", label: "Questions" },
]

const faq = (child: number) => [
  {
    id: "m0",
    q: "Which plan should I start with?",
    a: "If you train at one club, start with Trailhead. If you want the courts or more than one club, pick Ridge. If you want the recovery suite and a coach's eye, pick Summit. An upgrade starts the same day, so you can move up when you are ready.",
  },
  {
    id: "m1",
    q: "Can I cancel any time?",
    a: "Yes, with 30 days' notice. There is no contract.",
  },
  {
    id: "m4",
    q: "Can I switch plans or my home club?",
    a: "Yes. Change either in the app. An upgrade starts now, prorated by day. A downgrade starts on your next bill.",
  },
  {
    id: "m5",
    q: "Do kids need their own plan?",
    a: `No. ${kidsCostLine(child)}`,
  },
  {
    id: "m6",
    q: "How do I cancel?",
    a: "Cancel in the app. It takes effect on the first billing date at least 30 days after you ask. Until then you keep full access, and you can reinstate in one tap.",
  },
  {
    id: "m7",
    q: "Do you take Medicare fitness benefits or offer a senior rate?",
    a: `Yes to both. All 5 clubs accept Medicare Advantage fitness benefits, such as SilverSneakers and Renew Active. If you are eligible, Trailhead at your home club costs you nothing each month. Ridge or Summit costs the difference. Members 65 and older who pay for themselves get the senior rate: $10 off any plan each month. Call member services at (480) 555-0100, ${PHONE_HOURS}, and we will check your eligibility before you join.`,
  },
]

/**
 * The membership page. It answers, in order, what a visitor weighs before joining: what the plans are and
 * what they cost, where each plan takes you (the clubs), what it includes (the classes), how to add the
 * family, every cost in full, the exact rows side by side, and the questions left. It shares the clubs and
 * classes pages' parts: a hero with a row of facts, the section nav, lead-size heads, Sand and tint bands
 * that alternate, and the Copper tour panel to close.
 */
export default async function MembershipPage() {
  const { plans, prices, packs, clubs, slots, categories } = await getCatalog()
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": plans.map((p) => ({
            "@type": "Product",
            name: `Cactus Peak ${p.name}`,
            description: p.bestFor,
            offers: { "@type": "Offer", price: p.price, priceCurrency: "USD" },
          })),
        }}
      />
      <MembershipHero plans={plans} prices={prices} />

      <SectionNav items={SECTIONS} />

      <Band tone="tint" id="plans">
        <SectionHead
          size="lead"
          title="Start where you are."
          lede="Each plan holds everything in the one before it. Move up in the app when your week asks for more."
          action={<TextLink href="#compare">Compare every detail</TextLink>}
        />
        {/* The shared plan cards. The club key stays out: "Your plan, club by club" below shows it. */}
        <div className="mt-12">
          <ClubsPlanCards
            plans={plans}
            clubs={clubs}
            childPrice={prices.child}
            facilityFee={prices.facilityFee}
            band="tint"
            facilityKey={false}
          />
        </div>
        <PlanNotes className="mt-8" />
      </Band>

      <Band id="clubs">
        <SectionHead
          size="lead"
          title="Your plan, club by club."
          lede="Every plan opens the classes at your club, and its pool if it has one. Ridge adds the other four clubs and the courts. Summit adds recovery."
        />
        <PlanReach clubs={clubs} slots={slots} className="mt-12" />
      </Band>

      <Band tone="tint" id="classes">
        <SectionHead
          size="lead"
          title="No class fees. Ever."
          lede="Every class on the timetable comes with your plan. Book in the app and show up."
          action={
            <TextLink href="/classes#schedule">See when classes run</TextLink>
          }
        />
        <PlanClasses
          categories={categories}
          clubs={clubs}
          slots={slots}
          className="mt-12"
        />
      </Band>

      {/* The builder makes the point, so the head is the one brief line and the lines under the family
          row say what each choice means. */}
      <Band id="family">
        <SectionHead
          size="lead"
          title="Bring the whole family."
          lede="One account. One plan for everyone on it."
        />
        <FamilyCalculator className="mt-12" />
      </Band>

      <Band tone="tint" id="costs">
        <SectionHead size="lead" title="Every cost, up front." />
        <PlanCosts
          plans={plans}
          prices={prices}
          packs={packs}
          className="mt-12"
        />
      </Band>

      <Band id="compare">
        <SectionHead size="lead" title="Every detail, side by side." />
        <PlanComparisonTable stickyTop className="mt-12" />
      </Band>

      <FaqSection
        id="questions"
        tone="tint"
        title="Money questions."
        items={faq(prices.child)}
      />

      <TourCTABand
        night
        title="Not sure which plan? Ask on a tour."
        support="A coach shows you the club and the classes, and helps you pick the plan that fits your week. No card."
        passEmail
      />
    </>
  )
}
