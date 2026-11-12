import Link from "next/link"

import { GymObject, type ObjectId } from "@/components/brand/graphics"
import { cn } from "@/lib/utils"
import { Container } from "./common"

/*
 * The parts the program pages share (personal training, kids, aquatics, courts, recovery). They follow the
 * membership, clubs and classes pages: a hero with a picture made for the page's claim (each page in its own layout),
 * the section nav, lead-size heads, Sand and tint bands that alternate, and the Copper tour
 * panel to close. These parts hold the forms that repeat across the five pages, so the pages read as one set.
 */

// The underline every quiet text link in these sections uses: a light line that darkens on hover.
export const quietLink =
  "underline decoration-[color-mix(in_oklab,currentColor_40%,transparent)] decoration-from-font underline-offset-4 hover:decoration-current"

/** The lit fill: Copper with white text (4.9:1). The theme clears Tailwind's palette, so `text-white` does nothing. */
export const litFill = "bg-[var(--cat-strength)] text-[var(--neutral-1)]"
/** The Night fill for the unlit parts of a hero picture. */
export const nightFill = "bg-night text-night-foreground"

/**
 * How a program hero places its copy and its picture. Each program page takes its own layout, so the pages
 * do not open on one shape. No layout closes on a row of facts: each fact either sits in the lede or is drawn
 * into the picture.
 *
 * - `split`: the copy on the left and the picture on the right, centred on each other.
 * - `mirror`: the picture on the left and the copy on the right.
 * - `band`: the headline and the copy side by side, and the picture under them across the full column. The
 *   picture stands on the hero's bottom rule, so its columns rise from the floor.
 * - `banner`: the headline across the full column, then the copy in a narrow column beside the picture.
 * - `panel`: the copy and the picture inside one inset tint panel, a calmer field than the Sand page.
 */
export type ProgramHeroLayout = "split" | "mirror" | "band" | "banner" | "panel"

/**
 * A program page's hero: the claim, one line, two actions and a picture made for the claim (the Steps idea
 * from the membership hero: the page's data drawn as the image). `layout` says where each part goes. `note`
 * is an optional quiet line under the actions.
 */
export function ProgramHero({
  id,
  title,
  lede,
  actions,
  note,
  picture,
  layout = "split",
}: {
  id: string
  title: string
  lede: string
  actions: React.ReactNode
  note?: React.ReactNode
  picture: React.ReactNode
  layout?: ProgramHeroLayout
}) {
  const heading = (className?: string) => (
    <h1 id={id} className={cn("display-hero text-balance", className)}>
      {title}
    </h1>
  )
  const body = (className?: string) => (
    <div className={className}>
      <p className="lede max-w-[38ch] text-pretty text-muted-foreground">
        {lede}
      </p>
      <div className="mt-8 flex flex-wrap items-center gap-3">{actions}</div>
      {note ? (
        <p className="mt-6 text-body text-muted-foreground">{note}</p>
      ) : null}
    </div>
  )

  if (layout === "band") {
    // The picture has no space under it: it stands on the section's bottom rule.
    return (
      <section aria-labelledby={id} className="overflow-hidden rule-b">
        <Container className="pt-8 lg:pt-14">
          <div className="grid gap-5 lg:grid-cols-12 lg:items-end lg:gap-16">
            {heading("max-w-[11ch] lg:col-span-7")}
            {body("lg:col-span-5 lg:pb-2")}
          </div>
          <div className="mt-10 min-w-0 lg:mt-14">{picture}</div>
        </Container>
      </section>
    )
  }

  if (layout === "banner") {
    // The headline runs across the full column on as few lines as it can; the copy keeps a narrow column.
    return (
      <section aria-labelledby={id} className="rule-b">
        <Container className="pt-8 pb-10 lg:pt-14 lg:pb-16">
          {heading("max-w-[18ch]")}
          <div className="mt-8 grid gap-10 lg:mt-12 lg:grid-cols-12 lg:gap-16">
            {body("lg:col-span-5")}
            <div className="min-w-0 lg:col-span-7">{picture}</div>
          </div>
        </Container>
      </section>
    )
  }

  if (layout === "panel") {
    // One inset tint panel holds the hero, a quiet room on the Sand page.
    return (
      <section aria-labelledby={id} className="py-2 sm:py-3">
        <Container>
          <div className="grid gap-10 rounded-2xl bg-muted px-5 py-8 sm:px-8 lg:grid-cols-12 lg:items-center lg:gap-12 lg:px-14 lg:py-16">
            <div className="lg:col-span-5">
              {heading("max-w-[10ch]")}
              {body("mt-5 lg:mt-6")}
            </div>
            <div className="min-w-0 lg:col-span-7">{picture}</div>
          </div>
        </Container>
      </section>
    )
  }

  const mirror = layout === "mirror"
  return (
    <section aria-labelledby={id} className="rule-b">
      <Container className="grid gap-10 pt-8 pb-10 lg:grid-cols-12 lg:items-center lg:gap-16 lg:pt-14 lg:pb-14">
        <div className={cn("lg:col-span-6", mirror && "lg:order-2")}>
          {heading("max-w-[12ch]")}
          {body("mt-5 lg:mt-6")}
        </div>
        <div className={cn("min-w-0 lg:col-span-6", mirror && "lg:order-1")}>
          {picture}
        </div>
      </Container>
    </section>
  )
}

export type Step = { title: string; text?: string; icon?: ObjectId }

/**
 * Steps in order, side by side from md: a large number, the step's object, its title and one line. It is the
 * tour panel's three steps at section size, so "how it works" reads the same on every page.
 */
export function NumberedSteps({
  steps,
  className,
}: {
  steps: Step[]
  className?: string
}) {
  return (
    <ol
      className={cn(
        "grid gap-x-8 gap-y-10 sm:grid-cols-2",
        steps.length === 3 ? "lg:grid-cols-3" : "lg:grid-cols-4",
        className
      )}
    >
      {steps.map((s, i) => (
        <li key={s.title} className="pt-5 rule-t rule-heavy">
          <div className="flex items-center justify-between gap-4">
            <span aria-hidden="true" className="tabular font-data text-figure">
              {String(i + 1).padStart(2, "0")}
            </span>
            {s.icon ? <GymObject id={s.icon} className="size-9" /> : null}
          </div>
          <h3 className="font-display-wide mt-6 text-h3 text-balance">
            {s.title}
          </h3>
          {s.text ? (
            <p className="mt-2 text-body text-pretty text-muted-foreground">
              {s.text}
            </p>
          ) : null}
        </li>
      ))}
    </ol>
  )
}

export type Row = {
  key: string
  icon: ObjectId
  title: string
  href?: string
  /** A fact the title cannot carry. Leave it out rather than restate the title. */
  line?: React.ReactNode
  aside?: React.ReactNode
}

/**
 * Ruled rows, one for each thing a visitor can do: the object, the name (a link when it has a page), one line,
 * and a quiet aside (where, how long, for whom). The clubs page lists activities this way.
 */
export function ProgramRows({
  rows,
  className,
}: {
  rows: Row[]
  className?: string
}) {
  return (
    <ul className={cn("rule-b", className)}>
      {rows.map((r) => (
        <li
          key={r.key}
          className="grid gap-x-12 gap-y-3 py-6 rule-t lg:grid-cols-12 lg:items-center"
        >
          {/* The object sits outside the heading, so the heading's name is only the title. */}
          <div className="flex items-center gap-4 lg:col-span-4">
            <GymObject id={r.icon} className="size-9 shrink-0" />
            <h3 className="font-display-wide text-h3 text-balance">
              {r.href ? (
                <Link
                  href={r.href}
                  className="inline-flex min-h-11 items-center no-underline underline-offset-4 hover:underline"
                >
                  {r.title}
                </Link>
              ) : (
                r.title
              )}
            </h3>
          </div>
          {r.line ? (
            <div
              className={cn(
                "text-body text-pretty",
                r.aside ? "lg:col-span-5" : "lg:col-span-8"
              )}
            >
              {r.line}
            </div>
          ) : null}
          {r.aside ? (
            <div
              className={cn(
                "text-body text-pretty text-muted-foreground lg:col-span-3",
                !r.line && "tabular lg:col-start-10 lg:text-right"
              )}
            >
              {r.aside}
            </div>
          ) : null}
        </li>
      ))}
    </ul>
  )
}

export type Offer = {
  key: string
  title: string
  value: string
  unit?: string
  sub?: string
  badge?: string
  lines?: string[]
  icons?: readonly ObjectId[]
  lit?: boolean
  action?: React.ReactNode
}

/**
 * Prices or options side by side in one card, as the membership plans are: the lit option has the Copper top
 * bar and a 5% Copper wash, so it ends inside the card's rounded corners. Below lg the lit option moves first.
 */
export function OfferColumns({
  offers,
  className,
}: {
  offers: Offer[]
  className?: string
}) {
  // The offers keep their DOM order at every width, so focus and reading order match what the eye sees. The copper
  // bar marks the lit offer, so it does not need to move to the top.
  const four = offers.length === 4
  return (
    <ul
      className={cn(
        "grid overflow-hidden rounded-lg bg-card edge ring-border",
        offers.length === 4
          ? "md:grid-cols-2 lg:grid-cols-4"
          : "lg:grid-cols-3",
        className
      )}
    >
      {offers.map((o, i) => (
        <li
          key={o.key}
          className={cn(
            "relative flex flex-col gap-3 p-6 lg:p-8",
            // Dividers: a top rule between rows, a left rule between columns.
            four
              ? [
                  i > 0 && "max-md:rule-t",
                  i >= 2 && "md:max-lg:rule-t",
                  i % 2 === 1 && "md:max-lg:rule-l",
                ]
              : i > 0 && "max-lg:rule-t",
            i > 0 && "lg:rule-l",
            o.lit &&
              "bg-[color-mix(in_oklab,var(--cat-strength)_5%,var(--card))] before:absolute before:inset-x-0 before:top-0 before:h-1 before:bg-primary"
          )}
        >
          <div className="flex items-baseline justify-between gap-3">
            <h3 className="font-display-wide text-h2">{o.title}</h3>
            {o.badge ? (
              <span className="rounded-sm bg-accent px-2 py-0.5 text-label whitespace-nowrap text-foreground">
                {o.badge}
              </span>
            ) : null}
          </div>
          <p className="flex items-baseline gap-1">
            <span className="tabular font-data text-figure-lg">{o.value}</span>
            {o.unit ? (
              <span className="text-body text-muted-foreground">{o.unit}</span>
            ) : null}
          </p>
          {o.sub ? (
            <p className="-mt-1 text-caption text-muted-foreground tabular-nums">
              {o.sub}
            </p>
          ) : null}
          {o.icons?.length ? (
            <span aria-hidden="true" className="flex flex-wrap gap-2">
              {o.icons.map((id) => (
                <GymObject key={id} id={id} className="size-8" />
              ))}
            </span>
          ) : null}
          {o.lines?.length ? (
            <ul className="flex flex-col gap-2 text-body text-pretty">
              {o.lines.map((l) => (
                <li key={l}>{l}</li>
              ))}
            </ul>
          ) : null}
          {o.action ? <div className="mt-auto pt-2">{o.action}</div> : null}
        </li>
      ))}
    </ul>
  )
}

/** A short list under a heading, ruled like the membership page's "Always $0" list. */
export function RuleList({
  title,
  items,
  className,
}: {
  title: string
  items: React.ReactNode[]
  className?: string
}) {
  return (
    <section className={className}>
      <h3 className="font-display-wide text-h3">{title}</h3>
      <ul className="mt-6 rule-t rule-heavy">
        {items.map((t, i) => (
          <li
            // The items are fixed copy in a fixed order.
            // biome-ignore lint/suspicious/noArrayIndexKey: static list
            key={i}
            className="py-3.5 text-body text-pretty rule-b"
          >
            {t}
          </li>
        ))}
      </ul>
    </section>
  )
}

export type ObjectTile = { title: string; icon: ObjectId }

/**
 * Items that need only a name, as tiles: the object, then the title, on Night, with the first tile lit in Copper.
 * They carry no explanatory line, so a short list of perks or partners reads at a glance.
 */
export function ObjectTiles({
  tiles,
  className,
}: {
  tiles: ObjectTile[]
  className?: string
}) {
  return (
    <ul
      className={cn(
        "grid grid-cols-2 gap-2 sm:gap-3",
        tiles.length === 3 ? "lg:grid-cols-3" : "lg:grid-cols-4",
        className
      )}
    >
      {tiles.map((t, i) => (
        <li
          key={t.title}
          className={cn(
            "flex aspect-[4/3] flex-col justify-between rounded-lg p-4 sm:rounded-2xl sm:p-6",
            tiles.length === 3 &&
              i === 0 &&
              "max-lg:col-span-2 max-lg:aspect-[8/3]",
            i === 0 ? litFill : nightFill
          )}
        >
          <GymObject
            id={t.icon}
            scheme={i === 0 ? "copper" : "night"}
            className="size-9 sm:size-12"
          />
          <span className="font-display-wide text-label text-balance sm:text-h3">
            {t.title}
          </span>
        </li>
      ))}
    </ul>
  )
}
