import type { Metadata } from "next"
import { LinkButton, SectionHead, TextLink } from "@/components/brand/atoms"
import { GymObject, type ObjectId } from "@/components/brand/graphics"
import { FaqHero, type HeroQuestion } from "@/components/sections/about-heroes"
import { Band, JsonLd, TourCTABand } from "@/components/sections/common"
import { FaqExplorer } from "@/components/sections/faq-client"
import { getCatalog } from "@/lib/catalog/server"
import { FAQ_GROUPS } from "@/lib/labels"

export const metadata: Metadata = {
  title: "Questions about Cactus Peak — FAQ",
  description:
    "Short answers on tours, passes, fees, booking rules and kids club.",
}

/** Each question group's object. A new group falls back to the whistle. */
const GROUP_OBJECT: Record<string, ObjectId> = {
  "Getting started": "pass",
  Memberships: "gym-bag",
  "Kids and teens": "playground",
  "Pools and access": "pool",
}

/**
 * Questions. The hero floats six real questions round the headline, the first of each group first, so a visitor
 * can open a common answer in one click. Then the search and the groups, a way to reach a person, and the Copper
 * tour panel.
 */
export default async function FaqPage() {
  const { faqs } = await getCatalog()
  const names = [
    ...FAQ_GROUPS,
    ...[...new Set(faqs.map((f) => f.group))].filter(
      (g) => !FAQ_GROUPS.includes(g)
    ),
  ]
  // Round by round: the first question of each group, then the second, until there are six.
  const byGroup = names.map((g) => faqs.filter((f) => f.group === g))
  const longest = Math.max(0, ...byGroup.map((g) => g.length))
  const questions: HeroQuestion[] = Array.from({ length: longest }, (_, i) =>
    byGroup.flatMap((g) => (g[i] ? [g[i]] : []))
  )
    .flat()
    .slice(0, 6)
    .map((f) => ({
      id: f.id,
      q: f.q,
      icon: GROUP_OBJECT[f.group] ?? "whistle",
    }))
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }}
      />
      <FaqHero questions={questions} />

      <Band tone="tint" id="questions">
        <SectionHead size="lead" title="Find your answer." />
        <div className="mt-12">
          <FaqExplorer />
        </div>
      </Band>

      <Band id="ask">
        {/* The one contact action on the page, in the coach finder's "Not sure who fits?" form. */}
        <aside
          aria-labelledby="faq-ask-title"
          className="grid gap-5 rounded-lg bg-card p-6 edge ring-border sm:grid-cols-[auto_minmax(0,1fr)] sm:gap-6 lg:grid-cols-[auto_minmax(0,1fr)_auto] lg:items-center lg:p-8"
        >
          <span
            aria-hidden="true"
            className="grid size-14 place-items-center rounded-md bg-night"
          >
            <GymObject id="envelope" scheme="night" className="size-9" />
          </span>
          <div className="min-w-0">
            <h2 id="faq-ask-title" className="font-display-wide text-h3">
              Still have a question?
            </h2>
            <p className="mt-2 max-w-[60ch] text-body text-pretty text-muted-foreground">
              Call your club or send us a message. We answer within 1 business
              day.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 sm:col-start-2 lg:col-start-auto">
            <LinkButton href="tel:+14805550100">Call (480) 555-0100</LinkButton>
            <TextLink href="/contact#message">Send a message</TextLink>
          </div>
        </aside>
      </Band>

      <TourCTABand
        night
        title="Or ask on a tour."
        support="A coach answers your questions in the club, not on a sales call. 30 minutes. No card."
        passEmail
      />
    </>
  )
}
