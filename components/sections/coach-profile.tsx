import Link from "next/link"
import { TextLink } from "@/components/brand/atoms"
import {
  categoryObject,
  classObjects,
  coachObjects,
  GymObject,
} from "@/components/brand/graphics"
import { initials } from "@/lib/catalog"
import { classHref } from "@/lib/links"
import type { ClassType, Club, Coach } from "@/lib/types"
import { cn } from "@/lib/utils"
import { ClubPin, SpecialtyMark } from "./coach-finder"
import type { Step } from "./program-page"

/*
 * The parts of a coach's profile page. A profile is about one person, so it does not take the program pages'
 * hero, facts row or section nav. It opens on a profile header (a cover, the coach's badge over its edge, then
 * who they are and the actions), and its sections follow the questions a visitor asks about a coach: how they
 * coach, how to train with them, where to find them, and how to join. The bands, heads, chips and the Copper
 * tour panel are the site's.
 */

/** A small seeded random generator (mulberry32), so each coach's scatter is random but the same on every render. */
function seeded(seed: string) {
  let h = 1779033703
  for (const ch of seed) h = Math.imul(h ^ ch.charCodeAt(0), 3432918353)
  let a = h >>> 0
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** One cover shape: its ratio (width ÷ height), the icon size and how many icons, in units of the cover's height. */
type ScatterShape = {
  ratio: number
  /** Icon size as a share of the cover's height. */
  size: number
  count: number
  /** The oversized object starts at this share of the width; the scatter keeps to the left of it. */
  objectLeft: number
  className: string
}

const SHAPES: ScatterShape[] = [
  { ratio: 2, size: 0.42, count: 4, objectLeft: 0.42, className: "sm:hidden" },
  {
    ratio: 3,
    size: 0.42,
    count: 6,
    objectLeft: 0.56,
    className: "max-sm:hidden lg:hidden",
  },
  {
    ratio: 4,
    size: 0.38,
    count: 8,
    objectLeft: 0.62,
    className: "max-lg:hidden",
  },
]

/**
 * Random places for the icons on one cover shape. It works in units of the cover's height, so a distance is the
 * same across and down, and it keeps every icon at least 1.7 icon sizes from the next (centre to centre), so they
 * stay spaced out. Icons may run past the top, bottom and left edges, and they keep to the left of the oversized
 * object, which would hide them. The result is in percentages of the cover, so it scales with the cover.
 */
function scatter(seed: string, shape: ScatterShape) {
  const rand = seeded(`${seed}:${shape.ratio}`)
  const { ratio, size, count } = shape
  const gap = size * 1.7
  const xMax = shape.objectLeft * ratio
  const placed: { x: number; y: number }[] = []
  for (let tries = 0; tries < 600 && placed.length < count; tries++) {
    const x = -size * 0.3 + rand() * (xMax + size * 0.3)
    const y = -size * 0.2 + rand() * (1 + size * 0.4)
    if (placed.every((p) => Math.hypot(p.x - x, p.y - y) >= gap))
      placed.push({ x, y })
  }
  return placed.map((p) => ({
    left: `${((p.x - size / 2) / ratio) * 100}%`,
    top: `${(p.y - size / 2) * 100}%`,
    width: `${(size / ratio) * 100}%`,
  }))
}

/**
 * The cover, in three layers on Saguaro Night: the field; the coach's own object scattered at random, dimmed and
 * spaced out; and the same object oversized and cut by the frame (VISUAL-IDENTITY.md: the Crop). It is a band, not
 * a picture of the coach: the badge under it carries the initials. The scatter is seeded by the coach, so it is
 * random but stable, and each cover shape (2:1 on phones, 3:1 from sm, 4:1 from lg) has its own, so the spacing
 * holds at every width. The oversized object is a bare object, not a Crop drawing, because a Crop paints its own
 * field and would hide the scatter; CSS places and cuts it. All of it is decorative.
 */
function CoachCover({ coach }: { coach: Coach }) {
  const id = coachObjects[coach.slug] ?? "whistle"
  return (
    <div
      aria-hidden="true"
      className={cn(
        "relative isolate aspect-[2/1] overflow-hidden",
        "corner-xl",
        "bg-night",
        "sm:aspect-[3/1] lg:aspect-[4/1]"
      )}
    >
      {/* Dimmed, so the oversized object reads first. */}
      {SHAPES.map((shape) => (
        <div
          key={shape.ratio}
          className={cn("absolute inset-0 opacity-[0.14]", shape.className)}
        >
          {scatter(coach.slug, shape).map((pos) => (
            <GymObject
              key={`${pos.left}-${pos.top}`}
              id={id}
              scheme="night"
              className="absolute"
              style={pos}
            />
          ))}
        </div>
      ))}
      <GymObject
        id={id}
        scheme="night"
        className="absolute top-[-12%] left-[42%] w-[62%] sm:top-[-14%] sm:left-[56%] sm:w-[42%] lg:top-[-16%] lg:left-[62%] lg:w-[32%]"
      />
    </div>
  )
}

/**
 * The profile header: the cover, then the coach's badge (the initials on Copper, the one lit mark in the header)
 * over the cover's lower edge, the name, the credential and years, and where they train as the club map's pins. The
 * specialties are not repeated here: the How [name] coaches band lists them with what each means. The actions sit beside it from lg and under it below. No facts row and no section nav:
 * a profile is read top to bottom.
 */
export function CoachProfileHeader({
  coach,
  clubs,
  actions,
}: {
  coach: Coach
  clubs: Club[]
  actions: React.ReactNode
}) {
  const at = clubs.filter((k) => coach.clubs.includes(k.slug))
  return (
    <section
      aria-labelledby="coach-name"
      className="pt-m pb-xxl lg:pt-l lg:pb-section"
    >
      <div className="mx-auto w-full max-w-[1240px] px-xs sm:px-s">
        <CoachCover coach={coach} />
      </div>
      <div
        className={cn(
          "grid w-full max-w-[1200px] gap-xl",
          "mx-auto px-m",
          "sm:px-l lg:grid-cols-12 lg:items-end lg:gap-xxl lg:px-xl"
        )}
      >
        <div className="lg:col-span-8">
          <span
            aria-hidden="true"
            className="font-display-wide relative -mt-section grid size-28 place-items-center corner-full bg-[var(--cat-strength)] text-display-m text-neutral-1 ring-8 ring-background sm:-mt-[calc(var(--space-xxl)*5/3)] sm:size-40 sm:text-display-xl font-heavy sm:font-heavy"
          >
            {initials(coach.name)}
          </span>
          <h1 id="coach-name" className="display-hero mt-l text-balance">
            {coach.name}
          </h1>
          <p className="lede mt-s text-pretty text-muted-foreground">
            {[
              coach.credential,
              coach.years ? `${coach.years} years coaching` : null,
            ]
              .filter(Boolean)
              .join(" · ")}
          </p>
          <ul
            aria-label="Trains at"
            className="mt-l flex flex-wrap gap-x-l gap-y-xs"
          >
            {at.map((k) => (
              <li
                key={k.slug}
                className="flex items-center gap-xs text-body-m whitespace-nowrap"
              >
                <ClubPin n={k.n} />
                <Link
                  href={`/clubs/${k.slug}`}
                  className="no-underline underline-offset-4 hover:underline"
                >
                  {k.short}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex flex-col gap-s lg:col-span-4">{actions}</div>
      </div>
    </section>
  )
}

/** "Mon, Wed, Fri". */
const DAY = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

/**
 * The classes a coach leads, one row each: the class object, the name (to the class on the classes page), its
 * one line, and when this coach leads it in a week. The coach's favorite is marked, because it is the class to
 * try first.
 */
export function CoachClasses({
  classes,
  favorite,
  weekly,
}: {
  classes: ClassType[]
  favorite?: string
  /** Each class's weekly sessions with this coach, keyed by class slug: the clubs and the days. */
  weekly: Record<string, { club: string; days: number[] }[]>
}) {
  return (
    <ul className="rule-b">
      {classes.map((c) => {
        const fav = c.name === favorite
        const when = weekly[c.slug] ?? []
        return (
          <li
            key={c.slug}
            className="grid gap-x-xxl gap-y-s py-l rule-t lg:grid-cols-12 lg:items-center"
          >
            <div className="flex items-center gap-m lg:col-span-4">
              <GymObject
                id={classObjects[c.slug] ?? categoryObject[c.category]}
                className="size-9 shrink-0"
              />
              <div className="min-w-0">
                <h3 className="font-display-wide text-body-l text-balance font-medium">
                  <Link
                    href={classHref(c)}
                    className="inline-flex min-h-11 items-center no-underline underline-offset-4 hover:underline"
                  >
                    {c.name}
                  </Link>
                </h3>
                {fav ? (
                  <span className="corner-xs bg-accent px-xs py-xxs text-body-s font-heavy">
                    Favorite to teach
                  </span>
                ) : null}
              </div>
            </div>
            <p className="text-body-m text-pretty lg:col-span-5">{c.blurb}</p>
            <div className="text-body-m text-pretty text-muted-foreground lg:col-span-3">
              <span className="block text-body-m text-foreground font-heavy">
                {c.duration} minutes
              </span>
              {when.length
                ? when.map((w) => (
                    <span key={w.club} className="block">
                      {w.days.map((d) => DAY[d]).join(", ")} at {w.club}
                    </span>
                  ))
                : "Book a time in the app"}
            </div>
          </li>
        )
      })}
    </ul>
  )
}

/**
 * The clubs where a coach works, as the location list the coach cards use, at section size: the club map's pin
 * with its number, the club name (to the club page), its city and cross streets, and the tour action for that
 * club, which asks for this coach on the tour.
 */
export function CoachClubs({ coach, clubs }: { coach: Coach; clubs: Club[] }) {
  return (
    <ul className="grid gap-m md:grid-cols-2 lg:grid-cols-3">
      {clubs.map((k) => (
        <li
          key={k.slug}
          className={cn(
            "flex flex-col gap-m hairline",
            "corner-m p-l",
            "bg-card ring-border"
          )}
        >
          <div className="flex items-start gap-s">
            <span className="mt-xxs [&>svg]:h-8">
              <ClubPin n={k.n} />
            </span>
            <div className="min-w-0">
              <h3 className="font-display-wide text-body-l font-medium">
                <Link
                  href={`/clubs/${k.slug}`}
                  className="no-underline underline-offset-4 hover:underline"
                >
                  {k.short}
                </Link>
              </h3>
              <p className="text-body-m text-muted-foreground">{k.city}</p>
            </div>
          </div>
          <p className="text-body-m text-pretty">{k.personality}</p>
          <div className="mt-auto pt-m rule-t">
            <TextLink href={`/tour?coach=${coach.slug}&club=${k.slug}`}>
              Book a tour at {k.short}
            </TextLink>
          </div>
        </li>
      ))}
    </ul>
  )
}

/**
 * What each coach specialty means to a visitor, in one line. The chips name a specialty; this says what a coach
 * with it does for you. A specialty with no line here shows its name only.
 */
const SPECIALTY_LINES: Record<string, string> = {
  "Return to training":
    "A plan that works around an injury, then builds the area back.",
  Strength: "The lifts, taught well, then more load week by week.",
  Cycle: "Power, cadence and a pace you can hold to the top of the climb.",
  Court: "Footwork, power and a shoulder that lasts the whole match.",
  "Mind & Body": "Mobility and breath for a body that moves with less effort.",
  Conditioning:
    "Engine work that fits your week, from intervals to long efforts.",
  Recovery: "Rest, mobility and the recovery suite planned into your week.",
  Aqua: "Confidence and form in the water, at your own pace.",
  Running: "Pacing, form and a plan for your next race.",
  "Olympic lifting":
    "The snatch and the clean and jerk, one position at a time.",
  Mobility: "Range of motion you can use in every lift and every stride.",
  Youth: "Coaching built for young athletes and how they grow.",
  "Swim technique": "Stroke work that makes every lap faster and easier.",
  "Masters swim": "Structured sets with a coach on deck, for adult swimmers.",
}

/**
 * The coach's specialties at full size: each one's mark (the category Tile in colour, or the object), its name and
 * what it means for you. This is the one place on the page that lists them.
 */
export function CoachSpecialties({ coach }: { coach: Coach }) {
  return (
    <ul className="rule-t rule-heavy">
      {coach.specialties.map((s) => (
        <li key={s} className="flex items-start gap-m py-m rule-b">
          <SpecialtyMark name={s} className="size-11" />
          <div className="min-w-0">
            <h4 className="font-display-wide text-body-l font-medium">{s}</h4>
            {SPECIALTY_LINES[s] ? (
              <p className="mt-xxs text-body-m text-pretty text-muted-foreground">
                {SPECIALTY_LINES[s]}
              </p>
            ) : null}
          </div>
        </li>
      ))}
    </ul>
  )
}

/**
 * What working with a coach looks like, as steps. A coach who takes clients gets the personal training steps (the
 * personal training page's, told about this coach). A coach who leads classes only gets a first class, from the
 * classes page's answers: book in the app, arrive 10 minutes early and say it is your first time, bring water, a
 * towel and shoes. The facts are the site's own; only the names change.
 */
export function workingSteps(coach: Coach): { title: string; steps: Step[] } {
  if (coach.pt)
    return {
      title: `One-on-one with ${coach.first}`,
      steps: [
        {
          title: "Meet.",
          text: `On a free tour, or in Summit's 30-minute intro each quarter.`,
          icon: "whistle",
        },
        {
          title: "Plan.",
          text: `${coach.first} writes a plan for your goal, your joints and your week.`,
          icon: "schedule",
        },
        {
          title: "Train.",
          text: "45-minute sessions, booked in the app.",
          icon: "kettlebell",
        },
        {
          title: "Review.",
          text: `Every 4 sessions, ${coach.first} checks the plan and moves it on.`,
          icon: "heart-watch",
        },
      ],
    }
  return {
    title: `Your first class with ${coach.first}`,
    steps: [
      {
        title: "Book a spot.",
        text: "Members book in the app, up to 7 days ahead (Summit: 9).",
        icon: "schedule",
      },
      {
        title: "Arrive 10 minutes early.",
        text: `Tell ${coach.first} it is your first time. The moves are taught as you go.`,
        icon: "stopwatch",
      },
      {
        title: "Bring the basics.",
        text: "Water, a towel and shoes you can move in. We have loaners for most gear.",
        icon: "water-bottle",
      },
    ],
  }
}
