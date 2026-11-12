import type { Metadata } from "next"
import { LinkButton, SectionHead, TextLink } from "@/components/brand/atoms"
import { planObjects } from "@/components/brand/graphics"
import { ClubClassTable } from "@/components/sections/club-class-table"
import { SectionNav } from "@/components/sections/club-detail-client"
import { Band, FaqSection, TourCTABand } from "@/components/sections/common"
import { FactTable, NotHere } from "@/components/sections/fact-table"
import { RecoveryCairn, type Stone } from "@/components/sections/program-heroes"
import {
  NumberedSteps,
  OfferColumns,
  ProgramHero,
  ProgramRows,
  RuleList,
} from "@/components/sections/program-page"
import { getCatalog } from "@/lib/catalog/server"
import type { ClubSlug } from "@/lib/types"

/** The "not here" cell. FactTable keys each value by its column, so one shared element is enough. */
const notHere = <NotHere label="Not here" />

export const metadata: Metadata = {
  title:
    "Recovery at Cactus Peak — sauna, cold plunge and compression at 4 clubs",
  description:
    "Sauna, cold plunge and compression at 4 clubs. A Summit benefit you can try on a tour.",
}

/** The page's sections, in order. */
const SECTIONS = [
  { id: "suite", label: "The suite" },
  { id: "clubs", label: "Clubs" },
  { id: "plans", label: "Plans" },
  { id: "visit", label: "A visit" },
  { id: "classes", label: "Classes" },
  { id: "questions", label: "Questions" },
]

const faq = [
  {
    id: "r1",
    q: "Is the recovery suite included?",
    a: "It is part of Summit. Ask for a tour to try it.",
  },
  { id: "r2", q: "How long can I stay?", a: "Slots are 30 minutes." },
  { id: "r3", q: "Do I need a towel?", a: "Summit includes towel service." },
  {
    id: "r4",
    q: "Is this good after surgery?",
    a: "Ask your doctor first. A coach can help you plan.",
  },
]

/** The suite, in the order of a visit: warm, then cool, then rest. */
const STONES: Stone[] = [
  {
    name: "Sauna",
    time: "10–15 min",
    icon: "spa-stones",
  },
  {
    name: "Cold plunge",
    time: "1–3 min",
    icon: "wave",
  },
  {
    name: "Compression",
    time: "20 min",
    icon: "sneaker",
  },
  {
    name: "Stretch area",
    time: "",
    icon: "resistance-band",
  },
]

/** What each club has, in the order of the table. The space names come from the club pages. */
const BY_CLUB: [ClubSlug, string, boolean, boolean, boolean][] = [
  ["dobson-southern", "Full suite", true, true, true],
  ["val-vista-warner", "Suite", true, true, true],
  ["main-center", "Lounge", true, false, true],
  ["gilbert-page", "Lounge + rooftop deck", true, false, true],
  ["power-mckellips", "No suite. Stretch & Release class", false, false, false],
]

/**
 * Recovery. It answers, in order, what the suite is, where it is, which plan opens it, how a visit goes, and
 * the classes any member can book. It shares the membership page's parts: a hero with a picture made for the
 * claim, the section nav, lead-size heads, alternating bands and the Copper tour panel.
 */
export default async function Recovery() {
  const { classBySlug, clubBySlug, clubs, plans } = await getCatalog()
  const withSuite = clubs.filter((c) => c.recovery !== "none")
  const summit = plans.find((p) => p.slug === "summit")
  return (
    <>
      <ProgramHero
        id="recovery-hero-title"
        title="Rest is a skill."
        lede={`Heat, cold and compression, in one 30-minute slot. Part of Summit, $${summit?.price ?? 129} a month, at ${withSuite.length} clubs. Try it on a tour.`}
        actions={
          <>
            <LinkButton href="/tour" size="lg" className="max-sm:flex-1">
              Try it on a tour
            </LinkButton>
            <LinkButton
              href="#plans"
              variant="outline"
              size="lg"
              className="max-sm:flex-1"
            >
              See Summit
            </LinkButton>
          </>
        }
        layout="panel"
        picture={<RecoveryCairn stones={STONES} />}
      />

      <SectionNav items={SECTIONS} />

      <Band tone="tint" id="suite">
        <SectionHead
          size="lead"
          title="Warm, then cool, then rest."
          lede="Four parts, in the order most members use them."
        />
        <ProgramRows
          className="mt-12"
          rows={STONES.map((s) => ({
            key: s.name,
            icon: s.icon,
            title: s.name,
            aside: s.time || undefined,
          }))}
        />
      </Band>

      <Band id="clubs">
        <SectionHead
          size="lead"
          title="Four clubs, two kinds of room."
          lede="The suites have a cold plunge. The lounges have the sauna and compression."
        />
        {/* A table from md, one block for each club below it, so nothing scrolls sideways. */}
        <div className="mt-12">
          <FactTable
            caption="Recovery at each club"
            corner="Club"
            columns={[
              { label: "Space" },
              { label: "Sauna" },
              { label: "Cold plunge" },
              { label: "Compression" },
            ]}
            rows={BY_CLUB.map(([slug, space, ...has]) => {
              const c = clubBySlug(slug)
              return {
                key: slug,
                title: c?.short ?? slug,
                sub: c?.city,
                href: `/clubs/${slug}#am-recovery`,
                values: [space, ...has.map((h) => (h ? "Yes" : notHere))],
              }
            })}
          />
        </div>
      </Band>

      <Band tone="tint" id="plans">
        <SectionHead
          size="lead"
          title="The suite comes with Summit."
          lede="Every member can book a Stretch & Release class. Summit opens the suite and the lounges."
          action={<TextLink href="/membership#compare">Compare plans</TextLink>}
        />
        <OfferColumns
          className="mt-12"
          offers={plans.map((p) => ({
            key: p.slug,
            title: p.name,
            value: `$${p.price}`,
            unit: "/mo",
            badge: p.slug === "summit" ? "Recovery" : undefined,
            lit: p.slug === "summit",
            icons: p.slug in planObjects ? planObjects[p.slug] : undefined,
            lines:
              p.slug === "summit"
                ? [
                    `Recovery suite or lounge at ${withSuite.length} clubs`,
                    "Towel service",
                    "Stretch & Release classes",
                  ]
                : ["Stretch & Release classes", "Try the suite on a tour"],
            action: (
              <LinkButton
                href={`/join/plan?plan=${p.slug}`}
                variant={p.slug === "summit" ? "primary" : "outline"}
              >
                Join {p.name}
              </LinkButton>
            ),
          }))}
        />
      </Band>

      <Band id="visit">
        <SectionHead size="lead" title="How a visit goes." />
        <div className="mt-12 grid gap-12 lg:grid-cols-12 lg:gap-16">
          <NumberedSteps
            className="lg:col-span-8 lg:!grid-cols-3"
            steps={[
              {
                title: "Book a slot.",
                text: "Slots are 30 minutes. Book in the app.",
                icon: "schedule",
              },
              {
                title: "Shower, then go in.",
                text: "Towels are at the door. Summit includes towel service.",
                icon: "towel",
              },
              {
                title: "Warm, cool, rest.",
                text: "Leave when you feel done.",
                icon: "spa-stones",
              },
            ]}
          />
          <RuleList
            className="lg:col-span-4"
            title="Before you go in"
            items={[
              "Ages 18 and up",
              "Talk to your doctor if you have a heart condition, are pregnant, or take medicines that affect heat or cold",
              "Do not use it alone if you feel unwell",
              "Phones stay in lockers",
            ]}
          />
        </div>
      </Band>

      <Band tone="tint" id="classes">
        <SectionHead
          size="lead"
          title="Recover in a class."
          lede="Stretch & Release is on every plan. The suite slots are Summit's."
        />
        <div className="mt-12">
          <ClubClassTable
            items={["stretch-and-release", "sauna-plunge", "compression"]
              .map((x) => classBySlug(x))
              .filter((c) => c !== undefined)}
            grouped={false}
          />
        </div>
      </Band>

      <FaqSection id="questions" title="Recovery questions." items={faq} />

      <TourCTABand
        night
        title="Try the suite on a tour."
        support="A coach shows you the sauna, the plunge and the boots, and you can try them before you pick a plan. No card."
        passEmail
      />
    </>
  )
}
