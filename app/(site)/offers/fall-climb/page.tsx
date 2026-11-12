import type { Metadata } from "next"
import Link from "next/link"
import { LinkButton, SectionHead } from "@/components/brand/atoms"
import { ObjectRack } from "@/components/brand/graphics"
import { Band, Container, TourCTABand } from "@/components/sections/common"
import { getCatalog } from "@/lib/catalog/server"

export const metadata: Metadata = {
  title: "Fall offer: $0 enrollment through Nov 30 — Cactus Peak",
  description: "Join any plan by Nov 30 and skip the $49 enrollment fee.",
}

const TERMS = [
  "Applies to Trailhead, Ridge and Summit",
  "Month to month. Cancel or freeze with 30 days' notice",
  "The $49 annual facility fee is still charged in March",
  "Offer ends Nov 30, 2026 at 11:59 pm Arizona time",
]

/**
 * The offer hero is the offer itself, drawn as a ticket. The copy is the ticket's body, on a card; the stub is
 * Copper and holds the price the offer takes away, over the climb (VISUAL-IDENTITY.md: objects, not scenes). A
 * perforation with two notches splits them: down the seam from lg, across it below lg. The offer is short-lived,
 * so this page is the one hero that is not a program or a place, and it does not borrow their split.
 *
 * Contrast: words on the stub are white on Copper (4.9:1). The struck price keeps the full white too, because a
 * lighter mix falls under 4.5:1.
 */
function OfferTicket() {
  // A notch is a disc in the page colour over the seam, so the card reads as cut.
  const notch =
    "absolute size-10 corner-full bg-background -translate-1/2 lg:size-14"
  return (
    <section aria-labelledby="offer-title" className="overflow-x-clip rule-b">
      <Container className="pt-xl pb-xxl lg:pt-section lg:pb-section">
        <div className="grid corner-xl bg-card hairline ring-border lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)]">
          <div className="px-l py-xl sm:px-xxl sm:py-xxl lg:px-section lg:py-section">
            <h1
              id="offer-title"
              className="display-hero max-w-[12ch] text-balance"
            >
              $0 enrollment through Nov 30.
            </h1>
            <p className="lede mt-l max-w-[34ch] text-pretty text-muted-foreground lg:mt-l">
              Join any plan by Nov 30 and skip the $49 enrollment fee.
            </p>
            <div className="mt-xl flex flex-wrap items-center gap-s">
              <LinkButton href="/join/plan" size="lg" className="max-sm:flex-1">
                Join now
              </LinkButton>
              <LinkButton
                href="/tour"
                variant="outline"
                size="lg"
                className="max-sm:flex-1"
              >
                Book a free tour
              </LinkButton>
            </div>
          </div>
          <div className="relative flex flex-col justify-between gap-l corner-b-xl bg-[var(--cat-strength)] p-l text-neutral-1 sm:p-xl lg:corner-r-xl lg:corner-bl-zero">
            {/* The perforation: a dashed line on the seam, with a notch at each end. */}
            <span
              aria-hidden="true"
              className="absolute inset-x-6 top-0 border-t-2 border-dashed border-background/70 lg:inset-x-auto lg:inset-y-8 lg:left-0 lg:border-t-0 lg:border-l-2"
            />
            <span aria-hidden="true" className={`${notch} top-0 left-0`} />
            <span
              aria-hidden="true"
              className={`${notch} top-0 left-full lg:top-full lg:left-0`}
            />
            <ObjectRack
              ratio="4/3"
              layout="climb"
              scheme="copper"
              focus="squat-rack"
              ids={[
                "water-bottle",
                "jump-rope",
                "kettlebell",
                "plate",
                "dumbbell",
              ]}
              className="max-lg:hidden"
            />
            <p className="flex items-end justify-between gap-m">
              <span className="tabular font-data text-[clamp(4rem,9vw,7rem)] leading-none font-heavy">
                $0
              </span>
              <span className="pb-xs text-right text-body-s font-heavy">
                <s className="tabular font-data text-body-l font-heavy">
                  <span className="sr-only">usually </span>$49
                </s>
                <span className="block">enrollment</span>
              </span>
            </p>
          </div>
        </div>
      </Container>
    </section>
  )
}

export default async function Promo() {
  const { plans } = await getCatalog()
  return (
    <>
      <OfferTicket />
      <Band id="plans">
        <SectionHead title="Pick a plan." />
        <table className="mt-xl w-full text-left rule-t rule-heavy lg:mt-xxl">
          <caption className="sr-only">Plans with the fall offer</caption>
          <tbody>
            {plans.map((p) => (
              <tr key={p.slug} className="[&>*]:rule-b">
                <th
                  scope="row"
                  className="font-display-wide py-m text-body-xxl font-heavy"
                >
                  {p.name}
                </th>
                <td className="tabular py-m font-data text-body-xxl font-heavy">
                  ${p.price}
                  <span className="text-body-m font-regular text-muted-foreground">
                    /mo
                  </span>
                </td>
                <td className="hidden py-m text-body-m text-muted-foreground md:table-cell">
                  {p.bestFor}
                </td>
                <td className="py-m text-right">
                  <Link
                    className="inline-flex min-h-11 items-center font-heavy text-link underline-offset-4 hover:underline"
                    href={`/join/plan?plan=${p.slug}`}
                  >
                    Join {p.name}
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Band>
      <Band tone="tint" id="terms">
        <SectionHead title="The terms, in plain words." />
        <ul className="mt-xl max-w-2xl rule-t rule-heavy lg:mt-xxl">
          {TERMS.map((t) => (
            <li key={t} className="py-m text-body-m text-pretty rule-b">
              {t}
            </li>
          ))}
        </ul>
      </Band>
      <TourCTABand night title="Still deciding? Come see it." />
    </>
  )
}
