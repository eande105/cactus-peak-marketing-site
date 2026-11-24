import type { Metadata } from "next"

import { SectionHead, TextLink } from "@/components/brand/atoms"
import { Band, JsonLd, TourCTABand } from "@/components/sections/common"
import { HomeClasses } from "@/components/sections/home-classes"
import { ClubCards, ClubStrip } from "@/components/sections/home-client"
import { HomeCoachLine } from "@/components/sections/home-coaches"
import { HomeHero } from "@/components/sections/home-hero"
import { HomeMembership } from "@/components/sections/home-membership"
import { HomeServices } from "@/components/sections/home-services"
import { HomeStory } from "@/components/sections/home-story"
import { HomeVoices } from "@/components/sections/home-voices"
import { getCatalog } from "@/lib/catalog/server"

export const metadata: Metadata = {
  title: "Cactus Peak Athletic — Five clubs in Mesa and Gilbert",
  description:
    "Pools, courts, classes and recovery at five East Valley clubs. Climb at your own pace. Book a free tour or a 3-day pass.",
}

// One job per section. Each band introduces a part of the site and links to its pages:
// clubs, classes (and the coaches), the programs past the gym floor, plans (and the app), members, and who
// runs the clubs (About, the Journal and Careers). The schedule, the tour steps and the FAQ have their own pages.
export default async function Home() {
  const { clubs, coaches, packs, journal, jobs, testimonials, clubQuotes } =
    await getCatalog()
  const since = Math.min(...clubs.map((c) => c.opened))
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "Cactus Peak Athletic",
          url: "https://www.cactuspeakathletic.com",
          department: clubs.map((c) => ({
            "@type": "HealthClub",
            name: c.name,
            telephone: c.phone,
          })),
        }}
      />
      <HomeHero />

      {/* The hero's Night panel is the colour block at the top, so the clubs share its Sand page and the
          two read as one opening. The classes and plans bands are tinted. The bands next to the panels stay
          Sand, so each panel sits on the same field as its gutter and no thin strip of another colour
          shows between a band and a panel. */}
      <Band>
        <ClubStrip className="mb-xxl lg:mb-section" />
        <SectionHead
          size="lead"
          title="Find the club that fits your week."
          action={<TextLink href="/clubs#compare">Compare the clubs</TextLink>}
        />
        <div className="mt-xxl">
          <ClubCards />
        </div>
      </Band>

      <Band tone="tint">
        <SectionHead
          size="lead"
          title="Eight ways to move."
          action={<TextLink href="/classes#types">All 28 classes</TextLink>}
        />
        <HomeClasses className="mt-xxl" />
        <HomeCoachLine coaches={coaches} />
      </Band>

      <Band>
        <SectionHead size="lead" title="More than the gym floor." />
        <HomeServices
          clubs={clubs}
          coaches={coaches}
          packs={packs}
          className="mt-xxl"
        />
      </Band>

      <Band tone="tint" id="plans">
        <SectionHead
          size="lead"
          title="Three plans. No contract."
          action={
            <TextLink href="/membership#compare">Compare the plans</TextLink>
          }
        />
        <HomeMembership className="mt-xxl" />
      </Band>

      <Band>
        <SectionHead size="lead" title="What members say." />
        <HomeVoices
          testimonials={testimonials}
          clubQuotes={clubQuotes}
          className="mt-xxl"
        />
      </Band>

      {/* The muted tone is the plain page with a top rule, because the band above is plain too and the band
          next to the tour panel stays Sand. */}
      <Band tone="muted">
        <SectionHead
          size="lead"
          title={`Built for the East Valley since ${since}.`}
          action={<TextLink href="/about">Our story</TextLink>}
        />
        <HomeStory journal={journal} jobs={jobs} className="mt-xxl" />
      </Band>

      <TourCTABand passEmail night />
    </>
  )
}
