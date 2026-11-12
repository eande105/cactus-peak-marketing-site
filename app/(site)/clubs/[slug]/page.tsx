import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { SectionHead, TextLink } from "@/components/brand/atoms"
import { ClubClassWeek } from "@/components/sections/club-class-week"
import { SectionNav } from "@/components/sections/club-detail-client"
import {
  ClubHero,
  ClubPeople,
  ClubSpaces,
  ClubVisit,
} from "@/components/sections/club-page"
import { ClubsPlanCards } from "@/components/sections/clubs-plan-cards"
import { Band, JsonLd, TourCTABand } from "@/components/sections/common"
import { getCatalog } from "@/lib/catalog/server"
import { clubSpaces } from "@/lib/club-spaces"
import { scheduleUrl } from "@/lib/links"

// One page per row in `clubs`, built at deploy and refreshed hourly. Any other slug is a 404.
export const dynamicParams = false
export async function generateStaticParams() {
  const { clubs } = await getCatalog()
  return clubs.map((c) => ({ slug: c.slug }))
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const c = (await getCatalog()).clubBySlug((await params).slug)
  if (!c) return {}
  return {
    // Two clubs have no pool, so the title names it only where there is one.
    title: `${c.name} — Gym${c.has.pool ? ", pool" : ""} and classes in ${c.city}, AZ`,
    description: `${c.personality} ${c.sqFt.toLocaleString("en-US")} sq ft. ${c.signature.join(", ")}. Open 4:30 am–10 pm weekdays. Book a free tour.`,
  }
}

/**
 * A club page, ordered the way a visitor asks about one place (the IA of real location pages: Equinox,
 * Life Time, Orangetheory): is it open and where is it, what is here, what is on, how to get there and
 * when to come, who works here, and what it costs. The visit section also lists the club next door, for a visitor on the wrong club page. It
 * shares Home's parts (an inset Night panel to open, lead-size heads, Sand and tint bands, the Copper
 * tour panel to close) but gives each question its own form: a location sheet, a sticky split, a
 * timetable, a map with a sheet on it, and a row of distances.
 */
export default async function ClubPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const {
    clubs,
    clubBySlug,
    profileCoaches,
    slots,
    classTypes,
    categories,
    testimonials,
    clubQuotes,
    plans,
    prices: catalogPrices,
  } = await getCatalog()
  const club = clubBySlug((await params).slug)
  if (!club) notFound()
  const clubCoaches = profileCoaches
    .filter((c) => c.clubs.includes(club.slug))
    .slice(0, 6)
  // Classes a week at this club, from the weekly timetable.
  const weekCount = slots
    .filter((s) => s.club === club.slug)
    .reduce((n, s) => n + s.days.length, 0)
  const spaces = clubSpaces(club, catalogPrices.child)
  const prices = plans.map((p) => p.price)
  const from = Math.min(...prices)
  // The intro's last sentence is the club's character ("Plan on staying a while.", "No pool, no courts.").
  // The cards below list the spaces the rest of the intro names.
  const closing = club.intro.split(/(?<=\.)\s+/).at(-1) ?? ""
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "HealthClub",
          name: `Cactus Peak Athletic — ${club.name}`,
          telephone: club.phone,
          priceRange: `$${from}–$${Math.max(...prices)}`,
          address: {
            "@type": "PostalAddress",
            streetAddress: club.cross,
            addressLocality: club.city,
            addressRegion: "AZ",
            postalCode: club.zip,
          },
          openingHoursSpecification: [
            {
              "@type": "OpeningHoursSpecification",
              dayOfWeek: [
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
              ],
              opens: "04:30",
              closes: "22:00",
            },
            {
              "@type": "OpeningHoursSpecification",
              dayOfWeek: ["Saturday", "Sunday"],
              opens: "06:00",
              closes: "20:00",
            },
          ],
        }}
      />
      <ClubHero club={club} />

      <SectionNav
        items={[
          { id: "spaces", label: "Spaces" },
          { id: "classes", label: "Classes" },
          { id: "visit", label: "Visit" },
          { id: "people", label: "People" },
          { id: "plans", label: "Plans" },
        ]}
      />

      {/* What is here: the spaces pass beside a heading that holds still. */}
      <Band tone="tint" id="spaces">
        <ClubSpaces
          club={club}
          spaces={spaces}
          lede={`${club.sqFt.toLocaleString("en-US")} sq ft. ${closing}`}
        />
      </Band>

      {/* What is on: the classes page's week table for this one club, with a day picker, and the classes behind
          each cell beside it. */}
      <Band id="classes">
        <SectionHead
          size="lead"
          title={`Classes at ${club.short}.`}
          lede={`${weekCount} classes a week in ${club.studios} ${club.studios === 1 ? "studio" : "studios"} and a cycle studio. Every one is included.`}
          action={
            <TextLink href={scheduleUrl({ club: club.slug })}>
              Full schedule
            </TextLink>
          }
        />
        <ClubClassWeek
          club={club}
          categories={categories}
          classTypes={classTypes}
          slots={slots}
          className="mt-12"
        />
      </Band>

      {/* Where, how to get in, the clubs next door, and when to come. */}
      <Band tone="tint" id="visit">
        <SectionHead size="lead" title="Plan your visit." />
        <div className="mt-12">
          <ClubVisit club={club} clubs={clubs} />
        </div>
      </Band>

      {/* Who: a member's words and the coaches who work here. */}
      <Band id="people">
        <SectionHead
          size="lead"
          title={`People at ${club.short}.`}
          action={
            <TextLink href={`/coaches?club=${club.slug}`}>
              Meet all coaches
            </TextLink>
          }
        />
        <div className="mt-12">
          <ClubPeople
            club={club}
            coaches={clubCoaches}
            testimonials={testimonials}
            clubQuotes={clubQuotes}
          />
        </div>
      </Band>

      <Band tone="tint" id="plans">
        <SectionHead
          size="lead"
          title={`Plans that work at ${club.short}.`}
          action={<TextLink href="/membership#compare">Compare plans</TextLink>}
        />
        {/* The clubs page's plan cards, with this club as home: the club key marks it, and Trailhead
            names it and leaves out a pool the club does not have. */}
        <div className="mt-12">
          <ClubsPlanCards
            plans={plans}
            clubs={clubs}
            childPrice={catalogPrices.child}
            facilityFee={catalogPrices.facilityFee}
            home={club}
            band="tint"
          />
        </div>
      </Band>

      <TourCTABand
        night
        club={club.slug}
        title={`Come see ${club.short}.`}
        support={
          club.has.kids
            ? "A 30-minute walk-through with a coach. Bring the kids. They can see the room."
            : "A 30-minute walk-through with a coach. Bring a workout bag and try the floor."
        }
        phone={club.phone}
        tel={club.tel}
        primary="Tour this club"
        passEmail
      />
    </>
  )
}
