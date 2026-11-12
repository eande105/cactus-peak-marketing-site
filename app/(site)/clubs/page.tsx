import type { Metadata } from "next"

import { SectionHead, TextLink } from "@/components/brand/atoms"
import { ClubsDirectory } from "@/components/sections/clubs-directory"
import { ClubsOfferings } from "@/components/sections/clubs-offerings"
import {
  ClubsGoals,
  ClubsOverviewHero,
} from "@/components/sections/clubs-overview"
import { ClubsPlanCards } from "@/components/sections/clubs-plan-cards"
import { Band, TourCTABand } from "@/components/sections/common"
import { getCatalog } from "@/lib/catalog/server"

export const metadata: Metadata = {
  title: "Gym locations in Mesa and Gilbert, AZ — Cactus Peak",
  description:
    "Five clubs, one membership. Pools, courts, classes and recovery in Mesa and Gilbert. Open 4:30 am weekdays.",
}

/*
 * The clubs landing page, in the order a visitor asks about the clubs. Each section has one job, and each
 * fact has one home on the page:
 * 1. The hero: five clubs, two cities, one membership.
 * 2. Find your club (#find): the ZIP search with the five club cards as its results. The only club list.
 * 3. What's at each club (#compare): every offering by club, linked to its page, with the plan that opens it.
 *    The only place that says which club has what.
 * 4. Where your plan takes you: the plan cards, without the club key (section 3 shows where things are).
 * 5. How members use their club: member stories.
 * 6. The tour panel.
 */
export default async function ClubsPage() {
  const { clubs, plans, testimonials, prices, coaches } = await getCatalog()
  return (
    <>
      <ClubsOverviewHero />

      <Band id="find">
        <SectionHead size="lead" title="Find your club." />
        <ClubsDirectory clubs={clubs} className="mt-xxl" />
      </Band>

      <Band tone="tint" id="compare">
        <SectionHead size="lead" title="What's at each club." />
        <ClubsOfferings clubs={clubs} coaches={coaches} className="mt-xxl" />
      </Band>

      <Band>
        <SectionHead
          size="lead"
          title="Where your plan takes you."
          action={<TextLink href="/membership#compare">Compare plans</TextLink>}
        />
        <div className="mt-xxl">
          <ClubsPlanCards
            plans={plans}
            clubs={clubs}
            childPrice={prices.child}
            facilityFee={prices.facilityFee}
            facilityKey={false}
          />
        </div>
      </Band>

      <Band tone="tint">
        <SectionHead size="lead" title="How members use their club." />
        <ClubsGoals
          testimonials={testimonials}
          clubs={clubs}
          className="mt-xxl"
        />
      </Band>

      <TourCTABand
        night
        title="Not sure which club? Start with a tour."
        support="A coach shows you around and helps you pick the club that fits your week."
        passEmail
      />
    </>
  )
}
