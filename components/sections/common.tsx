import { LinkButton, SectionHead, TextLink } from "@/components/brand/atoms"
import {
  type ClubId,
  clubObjects,
  GymObject,
  type ObjectId,
  ObjectRack,
  ObjectRow,
} from "@/components/brand/graphics"
import { Check } from "@/components/icons"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { cn } from "@/lib/utils"
import { PassEmailRow } from "./pass-email"

/**
 * The Home tour panel's width: 78% of the screen, but never narrower than the page's 1200 px column plus
 * 64 px each side, so on a laptop the panel still frames the column and on a large screen it does not
 * shrink to a strip. It stays narrower than the hero (85%) and the footer (the full page), so the three
 * panels do not repeat one shape. `panelFrame` sets the panel's box and its gutter to the page.
 * `panelContent` goes inside the panel: from lg its left and right edges meet the page column (1200 px
 * less the 12 px gutter twice, and the column's 32 px padding less the gutter) at any panel width, so text
 * in a panel lines up with text in the bands. Below lg the panel nearly fills the screen, so the content
 * takes a comfortable inset instead.
 */
export const panelFrame =
  "mx-auto w-full max-w-[max(78vw,1352px)] px-xs sm:px-s"
export const panelContent = "mx-auto w-full max-w-[1176px] px-m sm:px-l lg:px-l"

export function Container({
  children,
  className,
  as: T = "div",
  id,
}: {
  children: React.ReactNode
  className?: string
  as?: "div" | "section" | "header"
  id?: string
}) {
  return (
    <T
      id={id}
      className={cn(
        "mx-auto w-full max-w-[1200px] scroll-mt-8 px-m sm:px-l lg:px-xl",
        className
      )}
    >
      {children}
    </T>
  )
}
/** Section band. Tone alternates background and surface-muted; never two muted bands in a row. */
export function Band({
  children,
  tone = "plain",
  className,
  id,
  label,
}: {
  children: React.ReactNode
  tone?: "plain" | "muted" | "tint" | "night"
  className?: string
  id?: string
  label?: string
}) {
  return (
    <section
      id={id}
      aria-label={label}
      className={cn(
        "py-xxl lg:py-section-l",
        tone === "muted" && "rule-t",
        tone === "tint" && "bg-muted",
        tone === "night" && "bg-night text-night-foreground",
        className
      )}
    >
      <Container>{children}</Container>
    </section>
  )
}

/** What a tour includes: a bag, a locker key, the schedule, a coach, a towel and water. */
const TOUR_OBJECTS: readonly ObjectId[] = [
  "key",
  "schedule",
  "whistle",
  "towel",
  "water-bottle",
  "heart-watch",
]
/** What happens on a tour (03-pages section 1.11), shown in the Night tour band. */
const TOUR_STEPS = [
  {
    title: "Book a time.",
    text: "Pick a club and a 30-minute slot. No card.",
  },
  {
    title: "Walk the club.",
    text: "A coach shows you the floor, the pool and the classes you asked about.",
  },
  {
    title: "Try it, or go home and think.",
    text: "Take a free 3-day pass if you want to try a class.",
  },
]
const tourIds = (club?: string): readonly ObjectId[] =>
  club && club in clubObjects
    ? [...clubObjects[club as ClubId], ...TOUR_OBJECTS]
    : TOUR_OBJECTS

export function TourCTABand({
  title = "Come see the club.",
  support = "A 30-minute tour. A coach, not a salesperson. No card.",
  club,
  phone = "(480) 555-0100",
  tel = "+14805550100",
  primary = "Book a free tour",
  passEmail,
  night,
  tourHref,
}: {
  title?: string
  support?: string
  club?: string
  phone?: string
  tel?: string
  primary?: string
  passEmail?: boolean
  night?: boolean
  variant?: string
  /** The tour link, when it carries more than the club (a coach's page asks for that coach). */
  tourHref?: string
}) {
  const tour = tourHref ?? (club ? `/tour?club=${club}` : "/tour")
  if (night) {
    // An inset panel, the same shape as the Home hero, so the page opens and closes on one form. It is the
    // brand's Copper field (VISUAL-IDENTITY.md, section 5: Sand objects, Night detail), so it stands apart from
    // the Night hero, the clubs art and the Night footer below it. Text is white, not Sand: white on Copper
    // is about 4.9:1, Sand is under 4.5:1. The action is Night, the one colour that holds on Copper.
    // Three tiers, each with one job: the ask (headline, the tour action, the phone), what a tour
    // is (the three steps, 03-pages section 1.11), then the softer offer for people not ready to visit.
    return (
      <section
        aria-labelledby="tour-band-title"
        className={cn(panelFrame, "pt-xs sm:pt-s")}
      >
        {/* The theme's blue focus ring is 1.07:1 on Copper, so focus inside the band uses the band's white text
            colour (4.95:1). */}
        <div className="corner-xl bg-[var(--cat-strength)] text-neutral-1 [&_:focus-visible]:outline-[var(--neutral-1)]">
          <div
            className={cn(
              panelContent,
              "py-xxl lg:py-[calc(var(--space-xxl)*5/3)]"
            )}
          >
            <div className="grid items-center gap-xxl lg:grid-cols-12 lg:gap-xxl">
              <div className="lg:col-span-7">
                <h2 id="tour-band-title" className="display-lead">
                  {title}
                </h2>
                <p className="mt-m max-w-[44ch] text-body-l">{support}</p>
                <div className="mt-xl flex flex-wrap items-center gap-x-l gap-y-s">
                  <LinkButton
                    href={tour}
                    size="lg"
                    className="bg-night text-night-foreground ring-night hover:bg-night/90"
                  >
                    {primary}
                  </LinkButton>
                  <p className="text-body-m">
                    Or call {club ? "the club" : "us"}:{" "}
                    <a
                      className="tabular inline-flex min-h-11 items-center font-heavy underline underline-offset-4"
                      href={`tel:${tel}`}
                    >
                      {phone}
                    </a>
                  </p>
                </div>
              </div>
              {/* What a tour includes: the gym bag at the hub, the club's objects and the tour's on the spokes. */}
              <ObjectRack
                ratio="16/10"
                layout="hub"
                focus="gym-bag"
                scheme="copper"
                ids={tourIds(club)}
                className="hidden corner-m lg:col-span-5 lg:block"
              />
            </div>

            <ol
              className={cn(
                "grid gap-xl rule-t rule-night",
                "mt-xxl pt-xxl",
                "md:grid-cols-3 lg:mt-section"
              )}
            >
              {TOUR_STEPS.map((s, i) => (
                <li key={s.title} className="flex gap-m">
                  <span
                    aria-hidden="true"
                    className={cn(
                      "grid size-8 shrink-0 place-items-center hairline",
                      "corner-full",
                      "text-body-s tabular-nums font-heavy",
                      "ring-night-rule"
                    )}
                  >
                    {i + 1}
                  </span>
                  <div>
                    <p className="text-body-m font-heavy">{s.title}</p>
                    <p className="mt-xxs text-body-m text-pretty">{s.text}</p>
                  </div>
                </li>
              ))}
            </ol>

            <div
              className={cn(
                "grid gap-l rule-t rule-night",
                "mt-xxl pt-xxl",
                "lg:grid-cols-12 lg:items-end lg:gap-xxl"
              )}
            >
              <div className="lg:col-span-6">
                <p className="font-display-wide text-body-l font-medium">
                  Not ready to visit?
                </p>
                <p className="mt-xxs text-body-m">
                  Try any class for 3 days first. One club, any class with room.
                </p>
              </div>
              <div className="lg:col-span-6">
                {passEmail ? (
                  <PassEmailRow />
                ) : (
                  <LinkButton
                    href="/trial"
                    variant="outline"
                    size="lg"
                    className="text-neutral-1 ring-[var(--neutral-1)] hover:bg-night/15"
                  >
                    Try a free 3-day pass
                  </LinkButton>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    )
  }
  // Sand closing block: Night appears once per site flow (the footer), and on Home.
  return (
    <section aria-labelledby="tour-band-title">
      <Container className="py-xxl lg:py-section">
        <div className="grid gap-l pt-l rule-t rule-heavy lg:grid-cols-12">
          <div className="lg:col-span-7">
            <ObjectRow
              ids={tourIds(club).slice(0, 3)}
              className="mb-m h-8 w-auto"
            />
            <h2
              id="tour-band-title"
              className="font-display-wide text-body-xxl lg:text-display-m font-heavy lg:font-heavy"
            >
              {title}
            </h2>
            <p className="mt-xs max-w-[52ch] text-body-m text-muted-foreground">
              {support}
            </p>
          </div>
          <div className="flex flex-col gap-s lg:col-span-5 lg:items-end">
            <div className="flex flex-wrap gap-s">
              <LinkButton href={tour} size="lg">
                {primary}
              </LinkButton>
              <LinkButton href="/trial" variant="outline" size="lg">
                3-day pass
              </LinkButton>
            </div>
            <p className="text-body-m text-muted-foreground">
              Or call {club ? "the club" : "your club"}:{" "}
              <a
                className={cn(
                  "tabular inline-flex min-h-11 items-center",
                  "font-heavy underline underline-offset-4",
                  "text-link"
                )}
                href={`tel:${tel}`}
              >
                {phone}
              </a>
            </p>
          </div>
        </div>
      </Container>
    </section>
  )
}

export function TourTimeline({
  steps,
  labels,
  className,
}: {
  steps: { title: string; text: string }[]
  labels?: string[]
  className?: string
}) {
  return (
    <ol className={cn("relative flex flex-col gap-xl", className)}>
      {steps.map((s, i) => (
        <li
          key={s.title}
          className="relative grid grid-cols-[2rem_1fr] gap-x-m"
        >
          {i < steps.length - 1 ? (
            <span
              aria-hidden="true"
              className="absolute top-8 bottom-[-2rem] left-4 w-0.5 -translate-x-1/2 bg-border"
            />
          ) : null}
          <span
            aria-hidden="true"
            className={cn(
              "tabular z-10 inline-flex size-8 items-center justify-center",
              "corner-full",
              "text-body-s font-heavy",
              "bg-night text-night-foreground"
            )}
          >
            {labels ? "" : i + 1}
            {labels ? <Check className="size-4" /> : null}
          </span>
          <div>
            {labels ? <p className="eyebrow">{labels[i]}</p> : null}
            <h3 className="font-display-wide text-body-l font-medium">
              {s.title}
            </h3>
            <p className="mt-xxs max-w-[56ch] text-body-m text-muted-foreground">
              {s.text}
            </p>
          </div>
        </li>
      ))}
    </ol>
  )
}

export function FaqList({
  items,
  defaultOpen = 0,
  className,
}: {
  items: { id: string; q: string; a: string }[]
  defaultOpen?: number | null
  className?: string
}) {
  return (
    <Accordion
      defaultValue={defaultOpen === null ? [] : [items[defaultOpen]?.id]}
      className={cn("rule-t", className)}
    >
      {items.map((f) => (
        <AccordionItem
          key={f.id}
          value={f.id}
          id={f.id}
          className="scroll-mt-4 rule-b"
        >
          <AccordionTrigger className="font-display-wide text-body-l hover:no-underline font-medium">
            {f.q}
          </AccordionTrigger>
          <AccordionContent>
            <p className="max-w-[62ch] pb-l text-body-m text-muted-foreground">
              {f.a}
            </p>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}
export function FaqSection({
  items,
  title = "Good questions.",
  phone = "(480) 555-0100",
  tel = "+14805550100",
  id,
  tone,
}: {
  items: { id: string; q: string; a: string }[]
  title?: string
  phone?: string
  tel?: string
  id?: string
  tone?: "plain" | "tint"
}) {
  return (
    <Band id={id} tone={tone}>
      <div className="grid gap-xl lg:grid-cols-12">
        <div className="lg:col-span-4">
          <SectionHead title={title} />
          <div className="mt-l flex flex-wrap gap-x-l">
            <TextLink href="/faq">All questions</TextLink>
            <a
              className={cn(
                "inline-flex min-h-11 items-center",
                "text-body-s underline-offset-4 font-heavy",
                "text-link",
                "hover:underline"
              )}
              href={`tel:${tel}`}
            >
              Call {phone}
            </a>
          </div>
        </div>
        <div className="lg:col-span-8">
          <FaqList items={items} />
        </div>
      </div>
    </Band>
  )
}

export function StatTile({
  value,
  label,
  icon,
  phoneRow,
  className,
}: {
  value: string
  label: string
  /** A gym object above the value. */
  icon?: ObjectId
  phoneRow?: boolean
  className?: string
}) {
  return (
    // Always inside a <dl>. The term (label) comes first in the markup and the value shows first on screen.
    // phoneRow: below sm, the value and label sit side by side, because a value like "6 mo–12 yr" cannot fit a third of a phone.
    <div
      className={cn(
        "flex flex-col-reverse justify-end gap-xxs pt-s rule-t rule-heavy",
        phoneRow &&
          "max-sm:flex-row-reverse max-sm:items-baseline max-sm:gap-s",
        className
      )}
    >
      <dt className="text-body-s text-muted-foreground">{label}</dt>
      <dd className="tabular font-data text-display-m leading-none font-heavy">
        {icon ? (
          <GymObject id={icon} className="mb-s size-10 max-sm:hidden" />
        ) : null}
        {value}
      </dd>
    </div>
  )
}

export function EmptyState({
  title,
  text,
  children,
  className,
  as: Heading = "h3",
}: {
  title: string
  text?: string
  children?: React.ReactNode
  className?: string
  /** The heading level. A page whose only content is the empty state uses h1. */
  as?: "h1" | "h2" | "h3"
}) {
  return (
    <div
      className={cn(
        "corner-m edge-m border-dashed border-border-strong bg-card/60 p-xl",
        className
      )}
    >
      <Heading className="font-display-wide text-body-l font-medium">
        {title}
      </Heading>
      {text ? (
        <p className="mt-xs max-w-[56ch] text-body-m text-muted-foreground">
          {text}
        </p>
      ) : null}
      {children ? (
        <div className="mt-m flex flex-wrap gap-s">{children}</div>
      ) : null}
    </div>
  )
}

export function JsonLd({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      // biome-ignore lint/security/noDangerouslySetInnerHtml: standard JSON-LD script; data is built on the server from trusted content
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}
