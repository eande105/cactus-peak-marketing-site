import type { Metadata } from "next"

import { SectionHead, TextLink } from "@/components/brand/atoms"
import { ClassExplorer } from "@/components/sections/class-explorer"
import { ClassAccess } from "@/components/sections/class-page"
import { ClassWeek } from "@/components/sections/class-week"
import {
  ClassesByType,
  ClassesFirstVisit,
  ClassesOverviewHero,
  EffortKey,
} from "@/components/sections/classes-overview"
import { SectionNav } from "@/components/sections/club-detail-client"
import {
  Band,
  FaqSection,
  JsonLd,
  TourCTABand,
} from "@/components/sections/common"
import { getCatalog } from "@/lib/catalog/server"
import type { ClassType } from "@/lib/types"

export const metadata: Metadata = {
  title:
    "Group fitness classes and schedule in Mesa and Gilbert, AZ — Cactus Peak",
  description:
    "28 classes in eight types, from yoga and swim to cycle and HIIT. See this week's times at all 5 clubs and try a class free.",
}

/** The page's sections, in order. The nav, the hero and every class link use these anchors. */
const SECTIONS = [
  { id: "types", label: "Class types" },
  { id: "schedule", label: "Schedule" },
  { id: "explore", label: "Class details" },
  { id: "first-class", label: "Getting started" },
  { id: "plans", label: "Plans" },
  { id: "questions", label: "Questions" },
]

/** The questions a visitor asks before a first class, for every type. They replace the questions on the type pages. */
const QUESTIONS = [
  {
    id: "q-first",
    q: "Which class is good for a first class?",
    a: "Any class marked “Good first class”. The coach teaches the moves as you go. Arrive 10 minutes early and tell the coach it is your first time.",
  },
  {
    id: "q-plan",
    q: "Are classes included in my plan?",
    a: "Yes. Every plan includes classes. Trailhead covers your home club. Ridge and Summit cover every club. The recovery suite comes with Summit.",
  },
  {
    id: "q-try",
    q: "Can I try a class before I join?",
    a: "Yes. Get a free 3-day pass and take any class with room at one club. No card. Or book a free tour and look in on a live class.",
  },
  {
    id: "q-book",
    q: "How do I book a class?",
    a: "Members book in the app, up to 7 days ahead (Summit: 9). With a free pass, book a class with room at the front desk or by calling the club.",
  },
  {
    id: "q-injury",
    q: "Can I come with an injury?",
    a: "Talk to a coach before class. Pick a lighter load, or pick a class at effort 1 or 2 that works around it.",
  },
  {
    id: "q-cancel",
    q: "Can I cancel?",
    a: "Free up to 2 hours before. After that it counts as a late cancel. Three late cancels in 30 days pause booking for 3 days.",
  },
  {
    id: "q-bring",
    q: "Do I need to bring anything?",
    a: "Water, a towel and shoes you can move in. Each class lists what else to bring. We have loaners for most gear, and our bikes take flat shoes or clips.",
  },
]

/**
 * The one classes page. It answers, in order, the questions visitors bring (specs/marketing-site/
 * classes-consolidation-brief.md): what kinds of class there are and how hard they get (types), when they run in
 * a typical week at my club (schedule), what one class is like (every
 * class, by type), how a first class works, and what it costs. The schedule sits above the 28 class entries, so
 * "when can I go?" never waits behind them. The bands alternate from a tinted one after the hero.
 */
export default async function ClassesPage() {
  const {
    categories,
    classTypes,
    clubs,
    plans,
    prices,
    slots,
    firstTimerShelf,
    popularNow,
    classBySlug,
  } = await getCatalog()
  const picks = firstTimerShelf
    .map(classBySlug)
    .filter((c): c is ClassType => Boolean(c))
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "Cactus Peak classes",
          itemListElement: classTypes.map((c, i) => ({
            "@type": "ListItem",
            position: i + 1,
            url: `/classes#class-${c.slug}`,
            item: {
              "@type": "Course",
              name: c.name,
              description: c.description,
              provider: {
                "@type": "Organization",
                name: "Cactus Peak Athletic",
              },
            },
          })),
        }}
      />
      <ClassesOverviewHero
        classTypes={classTypes}
        categories={categories}
        slots={slots}
        promoted={[...popularNow, ...firstTimerShelf]}
      />

      <SectionNav items={SECTIONS} />

      {/* One browse: the eight types, with the key to their effort meters above them. */}
      <Band tone="tint" id="types">
        <SectionHead
          size="lead"
          title="Eight kinds of class."
          lede="Each one lists its classes, with a line on what they are and how hard they get."
        />
        <EffortKey className="mt-12" />
        <ClassesByType
          categories={categories}
          classTypes={classTypes}
          className="mt-6"
        />
      </Band>

      {/* When the classes run: one picture of a typical week, by type. Members book in the app, so it is not a
          timetable to book from. Links elsewhere on the site still land here with a club, a type or a class. */}
      <Band id="schedule">
        <SectionHead
          size="lead"
          title="When classes run."
          lede="Something on every morning and evening. Pick your club to see its week."
        />
        <ClassWeek
          categories={categories}
          classTypes={classTypes}
          clubs={clubs}
          slots={slots}
          className="mt-12"
        />
      </Band>

      <Band tone="tint" id="explore">
        <SectionHead
          size="lead"
          title="Every class, up close."
          lede="Pick a type to see what each class is like, who it suits, what to bring and when it runs."
        />
        <div className="mt-12">
          <ClassExplorer
            categories={categories}
            classTypes={classTypes}
            clubs={clubs}
            slots={slots}
          />
        </div>
      </Band>

      <Band id="first-class">
        <SectionHead size="lead" title="Good for a first class." />
        <ClassesFirstVisit picks={picks} className="mt-12" />
      </Band>

      <Band tone="tint" id="plans">
        <SectionHead
          size="lead"
          title="Every plan includes classes."
          lede="Start with a free pass. Join when you know which club and which classes you like."
        />
        <div className="mt-12">
          <ClassAccess
            plans={plans}
            clubs={clubs}
            facilityFee={prices.facilityFee}
          />
        </div>
        <div className="mt-8 flex justify-end">
          <TextLink href="/membership#compare">Compare plans</TextLink>
        </div>
      </Band>

      <FaqSection id="questions" title="Class questions." items={QUESTIONS} />

      <TourCTABand
        night
        title="Watch a class on your tour."
        support="A coach shows you the studios and the class times at your club. Look in on a live class and ask anything."
        passEmail
      />
    </>
  )
}
