import type { Metadata } from "next"
import { LinkButton, SectionHead, TextLink } from "@/components/brand/atoms"
import { SectionNav } from "@/components/sections/club-detail-client"
import { Band, FaqSection, TourCTABand } from "@/components/sections/common"
import { KidsClubHours, KidsClubVisit } from "@/components/sections/kids-hours"
import { type AgeBand, AgeSpan } from "@/components/sections/program-heroes"
import { ProgramHero, ProgramRows } from "@/components/sections/program-page"
import { SwimSchoolGuide } from "@/components/sections/swim-school"
import { TeensGuide } from "@/components/sections/teens"
import { getCatalog } from "@/lib/catalog/server"
import { kidsCostLine } from "@/lib/labels"
import { classHref, scheduleUrl } from "@/lib/links"
import type { ClassType, Club } from "@/lib/types"

export const metadata: Metadata = {
  title: "Kids club and family at Cactus Peak — ages 6 months to 17",
  description:
    "Kids club for ages 6 months to 12, swim school, junior pickleball and Teen Strength. Add each child for $19 a month. That price includes kids club for children 12 and under.",
}

/** The page's sections, in order. */
const SECTIONS = [
  { id: "programs", label: "Programs" },
  { id: "hours", label: "Hours" },
  { id: "kids-club", label: "Kids club" },
  { id: "swim-school", label: "Swim school" },
  { id: "teens", label: "Teens" },
  { id: "questions", label: "Questions" },
]

const faq = [
  {
    id: "k1",
    q: "What ages can use kids club?",
    a: "Ages 6 months to 12 years.",
  },
  {
    id: "k2",
    q: "Can my teen train without me?",
    a: "In Teen Strength, yes. In the gym, a parent needs to sign the waiver and the teen stays on the teen floor area.",
  },
  {
    id: "k3",
    q: "What if my child is sick?",
    a: "Please keep them home. Kids with a fever or vomiting cannot check in.",
  },
  {
    id: "k4",
    q: "Is there a time limit?",
    a: "Yes. 2-hour blocks. You stay in the building.",
  },
]

/** The programs by age. The ages set the hero's bars; the line and the class page tell the rest. */
const PROGRAMS: (AgeBand & { slug: string; line: string; agesText: string })[] =
  [
    {
      key: "kids-club",
      slug: "kids-club",
      name: "Kids club",
      from: 0.5,
      to: 12,
      ages: "6 mo–12",
      agesText: "Ages 6 months to 12 years",
      icon: "playground",
      lit: true,
      line: "Play, crafts and games in 2-hour blocks while you train.",
    },
    {
      key: "swim-school",
      slug: "swim-school",
      name: "Swim school",
      from: 3,
      to: 12,
      ages: "3–12",
      agesText: "Ages 3 to 12",
      icon: "pool",
      line: "Five levels, taught by Red Cross-certified coaches.",
    },
    {
      key: "junior-pickleball",
      slug: "junior-pickleball",
      name: "Junior Pickleball",
      from: 8,
      to: 14,
      ages: "8–14",
      agesText: "Ages 8 to 14",
      icon: "paddle",
      line: "A coached clinic on Saturdays.",
    },
    {
      key: "teen-strength",
      slug: "teen-strength",
      name: "Teen Strength",
      from: 13,
      to: 17,
      ages: "13–17",
      agesText: "Ages 13 to 17",
      icon: "kettlebell",
      line: "Barbell and bodyweight basics, form first.",
    },
  ]

/** Where a class runs: "At all 5 clubs", "At Val Vista & Warner" or "At 3 clubs". */
function whereLine(c: ClassType | undefined, clubs: Club[]) {
  if (!c) return null
  if (c.clubs === "all") return `At all ${clubs.length} clubs`
  if (c.clubs.length === 1)
    return `At ${clubs.find((x) => x.slug === c.clubs[0])?.short ?? ""}`
  return `At ${c.clubs.length} clubs`
}

/**
 * Kids and family. It answers, in order, what there is for each age, when kids club is open and where, how it
 * works, swim school, and what teens can do. It shares the membership page's parts: a hero with a picture made
 * for the claim, the section nav, lead-size heads, alternating bands and the Copper tour panel.
 */
export default async function Kids() {
  const { classBySlug, clubs, prices, slots } = await getCatalog()
  const kidsClubs = clubs.filter((c) => c.has.kids)
  return (
    <>
      <ProgramHero
        id="kids-hero-title"
        title="Kids club, for the whole workout."
        lede="Play for ages 6 months to 12 while you train. Swim school, junior pickleball and Teen Strength for when they want their own."
        actions={
          <>
            <LinkButton
              href="/tour?note=kids"
              size="lg"
              className="max-sm:flex-1"
            >
              Tour with the kids
            </LinkButton>
            <LinkButton
              href="#hours"
              variant="outline"
              size="lg"
              className="max-sm:flex-1"
            >
              See kids club hours
            </LinkButton>
          </>
        }
        layout="mirror"
        picture={
          <AgeSpan
            bands={PROGRAMS.map((b) =>
              b.key === "kids-club"
                ? {
                    ...b,
                    note: `${kidsClubs.length} clubs, $${prices.child} a month per child`,
                  }
                : b
            )}
          />
        }
      />

      <SectionNav items={SECTIONS} />

      <Band tone="tint" id="programs">
        <SectionHead
          size="lead"
          title="Something for every age."
          lede={kidsCostLine(prices.child)}
          action={
            <TextLink href="/membership#family">What a family costs</TextLink>
          }
        />
        <ProgramRows
          className="mt-xxl"
          rows={PROGRAMS.map((p) => {
            const c = classBySlug(p.slug)
            return {
              key: p.key,
              icon: p.icon,
              title: p.name,
              href: c ? classHref(c) : undefined,
              line: p.line,
              aside: (
                <>
                  <span className="block text-body-m text-foreground tabular-nums font-heavy">
                    {p.agesText}
                  </span>
                  {whereLine(c, clubs)}
                </>
              ),
            }
          })}
        />
      </Band>

      <Band id="hours">
        <SectionHead size="lead" title="When kids club is open." />
        <div className="mt-xxl">
          <KidsClubHours clubs={clubs} />
        </div>
      </Band>

      <Band tone="tint" id="kids-club">
        <SectionHead size="lead" title="How kids club works." />
        <div className="mt-xxl">
          <KidsClubVisit />
        </div>
      </Band>

      <Band id="swim-school">
        <SectionHead
          size="lead"
          title="Swim school, ages 3 to 12."
          lede="Five levels, taught by Red Cross-certified coaches."
          action={
            <TextLink href={scheduleUrl({ class: "swim-school" })}>
              See swim school times
            </TextLink>
          }
        />
        <SwimSchoolGuide className="mt-xxl" />
      </Band>

      <Band tone="tint" id="teens">
        <SectionHead
          size="lead"
          title="For teens, a place that is not a screen."
          lede="A coach teaches form first, and more of the club opens as they grow."
        />
        <div className="mt-xxl">
          <TeensGuide
            teenClass={classBySlug("teen-strength")}
            clubs={clubs}
            slots={slots}
            childPrice={prices.child}
          />
        </div>
      </Band>

      <FaqSection id="questions" title="Kids and teens." items={faq} />

      <TourCTABand
        night
        title="Bring the kids on your tour."
        support="They can see the room. You can ask the staff anything. No card."
        primary="Tour with the kids"
        passEmail
      />
    </>
  )
}
