import type { Metadata } from "next"
import { LinkButton, SectionHead } from "@/components/brand/atoms"
import { CoachesHero } from "@/components/sections/about-heroes"
import { Band, TourCTABand } from "@/components/sections/common"
import { OfferColumns } from "@/components/sections/program-page"
import { CoachGridFromUrl } from "@/components/sections/url-init"
import { getCatalog } from "@/lib/catalog/server"

export const metadata: Metadata = {
  title: "Meet the coaches — Cactus Peak",
  description:
    "Coaches at 5 clubs in Mesa and Gilbert. Pick by club, by class or by what you want to do.",
}

/**
 * Coaches. It answers, in order, who the coaches are, which one fits (by club, class or goal), and the two ways
 * to train with one. It shares the program pages' parts: a hero with a picture made for the claim, lead-size heads, alternating bands and the Copper tour panel.
 */
export default async function Coaches() {
  const { coaches, packs, classTypes } = await getCatalog()
  const listed = coaches.filter((c) => c.profile)
  const byYears = [...listed].sort((a, b) => (b.years ?? 0) - (a.years ?? 0))
  const years = listed.reduce((n, c) => n + (c.years ?? 0), 0)
  const ptCount = listed.filter((c) => c.pt).length
  const cheapest = packs.length ? Math.min(...packs.map((p) => p.each)) : null
  const biggest = packs.reduce((a, b) => (b.n > a.n ? b : a), packs[0])
  return (
    <>
      <CoachesHero coaches={byYears} years={years} />

      <Band tone="tint" id="coaches">
        <SectionHead size="lead" title="Find your coach." />
        <div className="mt-12">
          <CoachGridFromUrl />
        </div>
      </Band>

      <Band id="ways">
        <SectionHead
          size="lead"
          title="Two ways to train with a coach."
          lede="Classes come with every plan. One-on-one time is a pack you add."
        />
        <OfferColumns
          className="mt-12 lg:!grid-cols-2"
          offers={[
            {
              key: "classes",
              title: "In a class",
              value: "$0",
              unit: "with every plan",
              lit: true,
              icons: ["whistle", "spin-bike", "kettlebell", "mat"],
              lines: [
                `${classTypes.length} classes on the timetable`,
                "Book up to 7 days ahead in the app",
                "Try any class free with a 3-day pass",
              ],
              action: (
                <LinkButton href="/classes#schedule">
                  See the schedule
                </LinkButton>
              ),
            },
            {
              key: "pt",
              title: "One-on-one",
              value: cheapest ? `$${cheapest}` : "Packs",
              unit: cheapest ? "/session" : undefined,
              sub: biggest
                ? `In a pack of ${biggest.n}. Smaller packs cost a little more a session.`
                : undefined,
              icons: ["heart-watch", "dumbbell", "resistance-band"],
              lines: [
                `${ptCount} coaches take clients`,
                "Your coach checks the plan every 4 sessions",
                "Meet your coach free on a tour",
              ],
              action: (
                <LinkButton href="/personal-training#packs" variant="outline">
                  See the packs
                </LinkButton>
              ),
            },
          ]}
        />
      </Band>

      <TourCTABand
        night
        title="Meet a coach on a free tour."
        support="Tell us your goal. A coach shows you the club and points you to the right person. No card."
        passEmail
      />
    </>
  )
}
