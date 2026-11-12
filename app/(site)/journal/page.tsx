import type { Metadata } from "next"
import { SectionHead } from "@/components/brand/atoms"
import { JournalHero } from "@/components/sections/about-heroes"
import { Band } from "@/components/sections/common"
import { JournalIndex } from "@/components/sections/journal-parts"
import { NewsletterPanel } from "@/components/sections/newsletter-panel"
import { getCatalog } from "@/lib/catalog/server"

export const metadata: Metadata = {
  title: "The Journal — Cactus Peak",
  description:
    "Training notes from our coaches. Written in Mesa and Gilbert, in the heat.",
}

/**
 * The Journal. The masthead opens on the latest note as the cover story. Then every other note, and the page closes
 * on the monthly email panel instead of the tour panel, because a reader here wants more to read.
 */
export default async function Journal() {
  const { journal, coachBySlug } = await getCatalog()
  const latest = journal[0]
  return (
    <>
      <JournalHero
        latest={latest}
        author={
          latest
            ? (coachBySlug(latest.author)?.name ?? "Cactus Peak coaches")
            : ""
        }
        count={journal.length}
      />

      <Band tone="tint" id="notes">
        <SectionHead size="lead" title="Every note." />
        <div className="mt-xxl">
          <JournalIndex skip={latest?.slug} />
        </div>
      </Band>

      <div className="pt-xxl lg:pt-section">
        <NewsletterPanel id="email" notes={journal} />
      </div>
    </>
  )
}
