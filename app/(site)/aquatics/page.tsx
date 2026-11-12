import type { Metadata } from "next"
import { LinkButton, SectionHead, TextLink } from "@/components/brand/atoms"
import { HoursTable } from "@/components/brand/club-parts"
import { ObjectRack, spaceObjects } from "@/components/brand/graphics"
import { ClubClassTable } from "@/components/sections/club-class-table"
import { SectionNav } from "@/components/sections/club-detail-client"
import { Band, FaqSection, TourCTABand } from "@/components/sections/common"
import { FactTable } from "@/components/sections/fact-table"
import {
  type PoolColumn,
  PoolGauge,
} from "@/components/sections/program-heroes"
import { ProgramHero, RuleList } from "@/components/sections/program-page"
import { LaneGrid } from "@/components/sections/slot-grid"
import { HandoffButton } from "@/components/sections/small-client"
import { SwimSchoolGuide } from "@/components/sections/swim-school"
import { getCatalog } from "@/lib/catalog/server"
import { SWIM } from "@/lib/labels"
import { scheduleUrl } from "@/lib/links"
import type { Club } from "@/lib/types"

export const metadata: Metadata = {
  title: "Aquatics at Cactus Peak — 3 pools, lanes and a warm-water pool",
  description:
    "Lap lanes, a warm-water pool, a splash pad at pool clubs, and swim school at Val Vista & Warner. Pools close 30 min before the club.",
}

/** The page's sections, in order. */
const SECTIONS = [
  { id: "pools", label: "Pools" },
  { id: "warm-pool", label: "Warm pool" },
  { id: "classes", label: "Classes" },
  { id: "swim-school", label: "Swim school" },
  { id: "lanes", label: "Lanes" },
  { id: "questions", label: "Questions" },
]

const faq = [
  {
    id: "a1",
    q: "Do I need to book a lane?",
    a: "Yes for lap lanes in the app. Not for the splash pad.",
  },
  {
    id: "a2",
    q: "Is the pool heated?",
    a: "Yes. The lap pools stay at 80 to 82°F; the therapy pool at 90 to 92°F.",
  },
  {
    id: "a3",
    q: "Can my child swim alone?",
    a: "Children under 12 need a parent at the pool.",
  },
  {
    id: "a4",
    q: "Which plans include the pools?",
    a: "Every plan includes the pool at your home club, if it has one. Ridge and Summit include all three pools.",
  },
]

// The water temperatures, in °F. The lap pools and the therapy pool keep these ranges at every club.
const LAP = { top: 82, range: "80–82°F" }
const WARM = { top: 92, range: "90–92°F" }

/** "8 lanes, 25 yd, outdoor". */
const poolLine = (c: Club) =>
  c.pool
    ? `${c.pool.lanes} lanes, 25 ${c.pool.unit}${c.pool.outdoor ? ", outdoor" : ""}`
    : ""

/**
 * Aquatics. It answers, in order, where the pools are, what the warm pool is for, the swim classes, swim school
 * and how to book a lane. It shares the membership page's parts: a hero with a picture made for the claim and
 * the section nav, lead-size heads, alternating bands and the Copper tour panel. The pool facts
 * come from the club data, so the hero and the table agree with the club pages.
 */
export default async function Aquatics() {
  const { classBySlug, clubs } = await getCatalog()
  const pools = clubs.filter((c) => c.pool)
  const warm = pools.find((c) => c.pool?.therapy)
  const lanes = pools.reduce((n, c) => n + (c.pool?.lanes ?? 0), 0)
  const noPool = clubs.filter((c) => !c.pool).map((c) => c.short)
  const gauge: PoolColumn[] = [
    ...pools.map((c) => ({
      key: c.slug,
      name: c.short,
      line: poolLine(c),
      temp: LAP.top,
      range: `${LAP.top}°`,
      icon: c.pool?.outdoor ? ("sun" as const) : ("pool" as const),
    })),
    ...(warm
      ? [
          {
            key: "warm",
            name: "Warm-water pool",
            line: warm.short,
            temp: WARM.top,
            range: `${WARM.top}°`,
            icon: "wave" as const,
            lit: true,
          },
        ]
      : []),
  ]
  return (
    <>
      <ProgramHero
        id="aquatics-hero-title"
        title="Water at any pace."
        lede={`${lanes} lap lanes at ${pools.length} clubs, a warm pool for sore days, and swim school for kids 3 to 12.`}
        actions={
          <>
            <LinkButton href="/tour" size="lg" className="max-sm:flex-1">
              Book a free tour
            </LinkButton>
            <LinkButton
              href={scheduleUrl({ category: "aqua" })}
              variant="outline"
              size="lg"
              className="max-sm:flex-1"
            >
              See swim times
            </LinkButton>
          </>
        }
        layout="band"
        picture={<PoolGauge pools={gauge} />}
      />

      <SectionNav items={SECTIONS} />

      <Band tone="tint" id="pools">
        <SectionHead
          size="lead"
          title="Three pools, one membership."
          lede="Every plan swims at its home club. Ridge and Summit swim at all three."
          action={
            <TextLink href="/membership#clubs">What each plan opens</TextLink>
          }
        />
        {/* A table from lg, one block for each club below it, so nothing scrolls sideways. */}
        <div className="mt-xxl">
          <FactTable
            caption="Pools at each club"
            corner="Club"
            breakpoint="lg"
            columns={[
              { label: "Pool" },
              { label: "Lanes", numeric: true },
              { label: "Water", numeric: true },
              { label: "Aqua Fit pool" },
              { label: "Lap lanes" },
            ]}
            rows={pools.map((c) => ({
              key: c.slug,
              title: c.short,
              sub: c.city,
              href: `/clubs/${c.slug}`,
              values: [
                c.pool?.label ?? "",
                String(c.pool?.lanes ?? ""),
                c.pool?.therapy
                  ? `${LAP.range}, warm pool ${WARM.range}`
                  : LAP.range,
                c.pool?.therapy
                  ? "Warm-water pool"
                  : c.pool?.outdoor
                    ? "Outdoor pool"
                    : "Lap pool",
                "45-min slots",
              ],
            }))}
          />
        </div>
        <p className="mt-l max-w-[62ch] text-body-m text-pretty text-muted-foreground">
          No pool at {noPool.join(" or ")}. Ridge and Summit members swim at the
          other three.
        </p>
      </Band>

      {warm ? (
        <Band id="warm-pool">
          <div className="grid items-center gap-xxl lg:grid-cols-12 lg:gap-section">
            <div className="lg:col-span-6">
              {/* A hub around warm water: what the therapy pool is for. */}
              <ObjectRack
                ratio="3/2"
                layout="hub"
                scheme="sand"
                focus={spaceObjects["warm-pool"].lead}
                ids={spaceObjects["warm-pool"].around}
                className="corner-m hairline ring-border"
              />
            </div>
            <div className="lg:col-span-6">
              <p className="tabular font-data text-figure-xl font-heavy">
                {WARM.top}°F
              </p>
              <h2 className="display-lead mt-m max-w-[16ch] text-balance">
                A warm pool for stiff joints.
              </h2>
              <p className="mt-l max-w-[48ch] text-body-l text-pretty text-muted-foreground">
                The therapy pool at {warm.short} stays at 90 to 92°F. The water
                holds you up, so many members use it after surgery or on sore
                days. Ask your doctor first. A coach can help you plan your
                first week.
              </p>
              <LinkButton
                href={`/tour?club=${warm.slug}&note=warm-pool`}
                className="mt-xl"
              >
                Ask about the warm pool
              </LinkButton>
            </div>
          </div>
        </Band>
      ) : null}

      <Band tone="tint" id="classes">
        <SectionHead
          size="lead"
          title="Four ways into the water."
          lede="From open lanes to a coached workout. Pick your club to see its times."
        />
        <div className="mt-xxl">
          <ClubClassTable
            items={["lap-swim", "aqua-fit", "swim-school", "masters-swim"]
              .map((x) => classBySlug(x))
              .filter((c) => c !== undefined)}
            grouped={false}
          />
        </div>
      </Band>

      <Band id="swim-school">
        <SectionHead
          size="lead"
          title="Swim school, ages 3 to 12."
          lede="Five levels, taught by Red Cross-certified coaches."
        />
        <SwimSchoolGuide className="mt-xxl" />
      </Band>

      <Band tone="tint" id="lanes">
        <SectionHead
          size="lead"
          title="Your lane, 45 minutes at a time."
          lede="Members book a lane in the app. Up to 2 swimmers share a lane."
        />
        <div className="mt-xxl grid gap-xxl lg:grid-cols-12 lg:gap-section">
          <div className="lg:col-span-7">
            <h3 className="font-display-wide text-body-l font-medium">
              Open lanes this morning
            </h3>
            <p className="mt-xxs text-body-m text-muted-foreground">
              A sample at {SWIM.clubName}.
            </p>
            <div className="mt-l">
              <LaneGrid />
            </div>
            <div className="mt-l">
              <HandoffButton
                label="Book a lane"
                classSlug="lap-swim"
                club="val-vista-warner"
                start={360}
                variant="primary"
              />
            </div>
          </div>
          <div className="flex flex-col gap-xxl lg:col-span-5">
            <section>
              <h3 className="font-display-wide mb-m text-body-l font-medium">
                Pool hours
              </h3>
              <HoursTable pool />
              <p className="mt-xs text-body-m text-muted-foreground">
                Pools close 30 minutes before the club.
              </p>
            </section>
            <RuleList
              title="Pool rules"
              items={[
                "Shower first",
                "Wear a swim cap if your hair is long",
                "No glass",
                "Kids swim with a parent",
                "A lifeguard is always on duty",
              ]}
            />
          </div>
        </div>
      </Band>

      <FaqSection id="questions" title="Pool questions." items={faq} />

      <TourCTABand
        night
        title="Test the water on a tour."
        support="A coach shows you the lanes, the warm pool and swim school, and you can ask about times for your family. No card."
        passEmail
      />
    </>
  )
}
