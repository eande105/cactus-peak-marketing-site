import Link from "next/link"

import { LinkButton } from "@/components/brand/atoms"
import {
  BrandMark,
  GymObject,
  type ObjectId,
} from "@/components/brand/graphics"
import type { Club, Testimonial } from "@/lib/types"
import { cn } from "@/lib/utils"
import { Container } from "./common"
import { Mark, voiceIcon } from "./home-voices"

/**
 * The Pull: a composition made for this hero. Each object is something members do at the clubs, and all
 * of them fall toward the lit disc with the Rib Peak mark: the clubs themselves (VISUAL-IDENTITY.md, section 3).
 * Placement alone makes the pull. Outline rings repeat out from the mark with the gaps widening, like a
 * gravity well. The objects sit on the rings: many and small near the mark, few and large further out, as
 * if they speed up and close in as they fall. The mark sits on the section's bottom rule, so the eye
 * follows the rings down the page to the club finder below.
 * Rings and objects are placed in px from the mark, so the circles stay round in any box.
 *
 * The objects take the same discs as the other heroes' pictures: Night, with the object in Sand, and a ring in
 * the page colour where they cross a ring. The mark is the one lit disc.
 */
type Pulled = {
  id: ObjectId
  /** The ring the object sits on, in px from the key's centre. */
  r: number
  /** The angle on the ring, in degrees, counter-clockwise from the right. */
  a: number
  size: "s" | "m" | "l"
}

type Field = {
  /** The ring radii, in px. The gaps widen with each ring. */
  rings: number[]
  /** The key's centre, in px above the bottom of the box. */
  key: number
  objects: Pulled[]
}

// The wide box sits behind the copy, so the objects keep below the actions near the key and to the flanks
// further out. The box is about 42rem tall from lg, so the outer rings reach the copy's sides, not above it.
// The rings fade toward the top, behind the heading.
const wide: Field = {
  rings: [120, 190, 270, 360, 460, 570, 690, 820, 960],
  key: 36,
  objects: [
    { id: "playground", r: 190, a: 30, size: "s" },
    { id: "tennis-ball", r: 190, a: 150, size: "s" },
    { id: "kettlebell", r: 270, a: 14, size: "s" },
    { id: "wave", r: 270, a: 45, size: "s" },
    { id: "spin-bike", r: 270, a: 135, size: "s" },
    { id: "mat", r: 270, a: 166, size: "s" },
    { id: "paddle", r: 460, a: 22, size: "m" },
    { id: "basketball", r: 460, a: 158, size: "m" },
    { id: "pool", r: 570, a: 36, size: "l" },
    { id: "spa-stones", r: 570, a: 144, size: "l" },
    { id: "schedule", r: 690, a: 52, size: "m" },
    { id: "barbell", r: 690, a: 128, size: "m" },
  ],
}

// The narrow box sits under the copy, so the objects can use its full height.
const narrow: Field = {
  rings: [70, 110, 150, 195, 245, 300, 360, 430],
  key: 24,
  objects: [
    { id: "playground", r: 110, a: 28, size: "s" },
    { id: "kettlebell", r: 110, a: 152, size: "s" },
    { id: "wave", r: 150, a: 72, size: "s" },
    { id: "spin-bike", r: 150, a: 108, size: "s" },
    { id: "paddle", r: 245, a: 50, size: "m" },
    { id: "basketball", r: 245, a: 130, size: "m" },
    { id: "pool", r: 300, a: 70, size: "m" },
    { id: "spa-stones", r: 300, a: 110, size: "m" },
  ],
}

const discSize = {
  s: "size-12 lg:size-16",
  m: "size-16 lg:size-24",
  l: "size-20 lg:size-32",
}

/** The object's centre on its ring, as CSS lengths from the box's centre line and bottom. */
function place({ r, a }: Pulled, field: Field) {
  const rad = (a * Math.PI) / 180
  return {
    left: `calc(50% + ${(r * Math.cos(rad)).toFixed(1)}px)`,
    top: `calc(100% - ${(field.key + r * Math.sin(rad)).toFixed(1)}px)`,
  }
}

function Pull({ field, className }: { field: Field; className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn("pointer-events-none text-foreground", className)}
    >
      {/* The rings: outlines only, fading out toward the top so they stay quiet behind the copy. */}
      <div className="absolute inset-0 [mask-image:linear-gradient(to_top,black_35%,transparent_95%)]">
        {field.rings.map((r) => (
          <span
            key={r}
            className="absolute -translate-1/2 corner-full border-[1.5px] border-border"
            style={{
              left: "50%",
              top: `calc(100% - ${field.key}px)`,
              width: r * 2,
              height: r * 2,
            }}
          />
        ))}
      </div>
      {field.objects.map((o) => (
        <span
          key={o.id}
          className={cn(
            "absolute grid place-items-center",
            "corner-full",
            "-translate-1/2 bg-night ring-4 ring-background",
            discSize[o.size]
          )}
          style={place(o, field)}
        >
          <GymObject id={o.id} scheme="night" className="size-[56%]" />
        </span>
      ))}
      {/* The lit mark: Copper, with the Rib Peak mark in Sand (VISUAL-IDENTITY.md, section 4). The bottom
          rule cuts its lower quarter, so the mark reads as the way into the next section. */}
      <span className="absolute top-full left-1/2 grid size-24 -translate-x-1/2 -translate-y-3/4 place-items-center corner-full bg-[var(--cat-strength)] lg:size-36">
        <BrandMark scheme="copper" className="size-[52%]" />
      </span>
    </div>
  )
}

/**
 * The clubs hero: centred copy on the Sand page, with the Pull filling the section around it. From
 * lg the Pull sits behind the copy and reaches the top of the section; below lg it follows the copy in
 * its own box, because a phone has no room beside the heading. It keeps the other heroes' measure: the
 * same top space as the split heroes, and a height near the classes hero's, not the full first screen.
 */
export function ClubsOverviewHero() {
  return (
    <section
      aria-labelledby="clubs-hero-title"
      className="relative overflow-hidden rule-b lg:h-[clamp(36rem,calc(100svh-10rem),42rem)]"
    >
      <Pull
        field={wide}
        className="absolute inset-x-0 top-0 bottom-0 mx-auto max-w-[1440px] max-lg:hidden"
      />
      <Container className="relative flex flex-col items-center pt-xl text-center lg:pt-section">
        <h1 id="clubs-hero-title" className="display-hero max-w-[12ch]">
          Your club, and four more.
        </h1>
        <p className="lede mt-l max-w-[40ch] text-pretty text-muted-foreground lg:mt-l">
          Join at the club near home. With Ridge or Summit, the same membership
          opens every pool, court and studio in Mesa and Gilbert.
        </p>
        <div className="mt-xl flex w-full flex-wrap justify-center gap-s">
          <LinkButton href="/tour" size="lg" className="max-sm:flex-1">
            Book a free tour
          </LinkButton>
          <LinkButton
            href="#find"
            variant="outline"
            size="lg"
            className="max-sm:flex-1"
          >
            Find your club
          </LinkButton>
        </div>
      </Container>
      <Pull
        field={narrow}
        className="relative mx-auto mt-xxl aspect-1/1 w-full max-w-lg lg:hidden"
      />
    </section>
  )
}

/**
 * Members and what they come for. The goal leads each story, so the section reads as the routines people
 * build at the clubs, not as praise. Home shows the same members as a quote wall.
 */
export function ClubsGoals({
  testimonials,
  clubs,
  className,
}: {
  testimonials: Testimonial[]
  clubs: Club[]
  className?: string
}) {
  return (
    <ul
      className={cn(
        "grid gap-x-xl gap-y-xxl sm:grid-cols-2 lg:grid-cols-4",
        className
      )}
    >
      {testimonials.map((t) => {
        const club = clubs.find((c) => c.name === t.club)
        return (
          <li key={t.who} className="pt-l rule-t rule-heavy">
            <figure className="flex h-full flex-col">
              <GymObject id={voiceIcon(t.quote)} className="size-8" />
              <h3 className="font-display-wide mt-l text-body-l text-balance font-medium">
                {t.goal}
              </h3>
              <blockquote className="mt-s text-body-m text-pretty">
                “{t.quote}”
              </blockquote>
              {/* The member's initials, then their name over their club, as one tight block at the foot of the
                  story. The club link keeps a 44px touch area drawn outside its line (the after box), so it
                  does not push the club name away from the member's name. */}
              <figcaption className="mt-auto flex items-center gap-s pt-l">
                <Mark who={t.who} className="size-10 shrink-0 text-body-s" />
                <span className="min-w-0">
                  <span className="block text-body-s font-heavy">{t.who}</span>
                  <span className="mt-xxs block text-body-s text-muted-foreground">
                    {club ? (
                      <Link
                        href={`/clubs/${club.slug}`}
                        className="relative text-muted-foreground underline decoration-[color-mix(in_oklab,currentColor_40%,transparent)] decoration-from-font underline-offset-4 after:absolute after:inset-x-0 after:top-1/2 after:h-11 after:-translate-y-1/2 hover:decoration-current"
                      >
                        {club.name}
                      </Link>
                    ) : (
                      t.club
                    )}
                  </span>
                </span>
              </figcaption>
            </figure>
          </li>
        )
      })}
    </ul>
  )
}
