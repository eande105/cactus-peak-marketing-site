import Link from "next/link"

import { LinkButton, TextLink } from "@/components/brand/atoms"
import { CoachAvatar } from "@/components/brand/class-parts"
import { ClubMap } from "@/components/brand/club-map"
import { ClubHours } from "@/components/brand/club-parts"
import { facilityIcon } from "@/components/brand/facilities"
import {
  GymObject,
  type ObjectId,
  ObjectRack,
  spaceObjects,
} from "@/components/brand/graphics"
import { MapPin, Phone } from "@/components/icons"
import type { ClubSpaces as ClubSpaceList } from "@/lib/club-spaces"
import { directionsHref, miles } from "@/lib/geo"
import type { Club, ClubQuote, Coach, Testimonial } from "@/lib/types"
import { cn } from "@/lib/utils"
import { PopularTimesChart } from "./club-detail-client"
import { Container } from "./common"
import { Mark, voiceIcon } from "./home-voices"

/**
 * The Board: the club page's own composition (VISUAL-IDENTITY.md, section 4). It is one fixed mosaic of
 * every kind of space the five clubs have, on a 6 × 5 grid. The large rooms take large tiles (the
 * strength floor, the platforms, the cycle studio, the pool), the long ones take wide tiles (cardio,
 * studios, pickleball), and the rest are small. A space this club has is a filled tile with its object, a
 * space it does not have is an empty slot, and the club's first highlight is lit. Each space keeps its
 * place and size on every club page, so the pattern of filled tiles is the club's picture and two club
 * pages compare at a glance. References: the Retool team wall (a grid where only some cells hold
 * content) and the Vercel and Sana logo walls (one lit tile in a field of quieter ones) on Mobbin.
 *
 *   dumbbell  dumbbell  treadmill treadmill kettlebell cone
 *   dumbbell  dumbbell  spin-bike spin-bike mat        mat
 *   barbell   barbell   spin-bike spin-bike spa-stones playground
 *   barbell   barbell   pool      pool      wave       whistle
 *   paddle    paddle    pool      pool      tennis     basketball
 */
type BoardSpace = {
  id: ObjectId
  name: string
  at: (c: Club) => boolean
  /** The tile's place on the 6 × 5 grid. Static strings, so Tailwind finds them. */
  area: string
  size: "l" | "w" | "s"
}

const has = (c: Club, re: RegExp) => c.amenities.some((a) => re.test(a))

const BOARD: BoardSpace[] = [
  {
    id: "dumbbell",
    name: "Strength floor",
    at: () => true,
    area: "col-start-1 row-start-1 col-span-2 row-span-2",
    size: "l",
  },
  {
    id: "treadmill",
    name: "Cardio floor",
    at: () => true,
    area: "col-start-3 row-start-1 col-span-2",
    size: "w",
  },
  {
    id: "kettlebell",
    name: "Group classes",
    at: (c) => c.has.classes,
    area: "col-start-5 row-start-1",
    size: "s",
  },
  {
    id: "cone",
    name: "Turf lane",
    at: (c) => has(c, /turf/i),
    area: "col-start-6 row-start-1",
    size: "s",
  },
  {
    id: "spin-bike",
    name: "Cycle studio",
    at: (c) => c.has.cycling,
    area: "col-start-3 row-start-2 col-span-2 row-span-2",
    size: "l",
  },
  {
    id: "mat",
    name: "Studios",
    at: (c) => c.studios > 0,
    area: "col-start-5 row-start-2 col-span-2",
    size: "w",
  },
  {
    id: "barbell",
    name: "Olympic platforms",
    at: (c) => has(c, /olympic/i),
    area: "col-start-1 row-start-3 col-span-2 row-span-2",
    size: "l",
  },
  {
    id: "spa-stones",
    name: "Recovery",
    at: (c) => c.has.recovery,
    area: "col-start-5 row-start-3",
    size: "s",
  },
  {
    id: "playground",
    name: "Kids club",
    at: (c) => c.has.kids,
    area: "col-start-6 row-start-3",
    size: "s",
  },
  {
    id: "pool",
    name: "Lap pool",
    at: (c) => c.has.pool,
    area: "col-start-3 row-start-4 col-span-2 row-span-2",
    size: "l",
  },
  {
    id: "wave",
    name: "Warm pool or splash pad",
    at: (c) => has(c, /warm|splash/i),
    area: "col-start-5 row-start-4",
    size: "s",
  },
  {
    id: "whistle",
    name: "Swim school",
    at: (c) => has(c, /swim school/i),
    area: "col-start-6 row-start-4",
    size: "s",
  },
  {
    id: "paddle",
    name: "Pickleball",
    at: (c) => Boolean(c.courts?.pickleball),
    area: "col-start-1 row-start-5 col-span-2",
    size: "w",
  },
  {
    id: "tennis-ball",
    name: "Tennis",
    at: (c) => Boolean(c.courts?.tennis),
    area: "col-start-5 row-start-5",
    size: "s",
  },
  {
    id: "basketball",
    name: "Basketball",
    at: (c) => Boolean(c.courts?.basketball),
    area: "col-start-6 row-start-5",
    size: "s",
  },
]

// The object fills about half of the tile's short side, so it is the same share of every tile.
const objectSize = {
  l: "h-[48%]",
  w: "h-[56%]",
  s: "h-[56%]",
}

export function ClubBoard({ club }: { club: Club }) {
  const here = BOARD.filter((s) => s.at(club))
  const lit = facilityIcon(club.signature[0] ?? "")
  return (
    <div className="rounded-2xl bg-night p-3">
      {/* The board is a picture of a list, so it carries the list as its name. */}
      <ul
        role="img"
        aria-label={`Spaces at ${club.short}: ${here.map((s) => s.name.toLowerCase()).join(", ")}.`}
        className="grid aspect-[6/5] grid-cols-6 grid-rows-5 gap-2 sm:gap-3"
      >
        {BOARD.map((s) => {
          const on = s.at(club)
          const isLit = on && s.id === lit
          return (
            <li
              key={s.id}
              aria-hidden="true"
              className={cn(
                "grid min-h-0 place-items-center rounded-lg",
                s.area,
                isLit
                  ? "bg-[var(--cat-strength)]"
                  : on
                    ? "bg-night-fill"
                    : "border border-dashed border-night-rule"
              )}
            >
              {on ? (
                <GymObject
                  id={s.id}
                  scheme={isLit ? "copper" : "night"}
                  className={cn("aspect-square w-auto", objectSize[s.size])}
                />
              ) : null}
            </li>
          )
        })}
      </ul>
    </div>
  )
}

/**
 * The club hero says what this one place is and why to go. It is set on the Sand page, not in a panel, so
 * it does not repeat the Home hero's Night panel or the clubs hero's centred Pull. The left column is the
 * place: the name, the city, the club's line and the two first steps, set low so they meet the foot of the
 * Board. The right column is the Board on a Night card: what is here, out of everything the clubs have. No row of highlights closes it: the Spaces section right under the hero names each space. Hours,
 * the address and the phone wait for the visit section.
 */
export function ClubHero({ club }: { club: Club }) {
  return (
    <section aria-labelledby="club-hero-title" className="rule-b">
      <Container className="grid gap-10 pt-8 pb-10 lg:grid-cols-12 lg:items-end lg:gap-14 lg:pt-14 lg:pb-14">
        <div className="lg:col-span-6">
          <h1 id="club-hero-title" className="display-hero text-balance">
            {club.name}
          </h1>
          {/* The name is the cross streets, so the city goes on its own line under it. */}
          <p className="mt-3 text-lead text-muted-foreground">
            {club.city}, AZ
          </p>
          <p className="lede mt-5 max-w-[34ch] text-pretty lg:mt-6">
            {club.personality}
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <LinkButton
              href={`/tour?club=${club.slug}`}
              size="lg"
              className="max-sm:flex-1"
            >
              Tour this club
            </LinkButton>
            <LinkButton
              href={`/trial?club=${club.slug}`}
              variant="outline"
              size="lg"
              className="max-sm:flex-1"
            >
              Try a free 3-day pass
            </LinkButton>
          </div>
        </div>

        <div className="lg:col-span-6">
          <ClubBoard club={club} />
        </div>
      </Container>
    </section>
  )
}

/**
 * What is here, as a split: the heading, the size and one picture hold still on the left while the spaces
 * pass on the right as a ruled index, the way a club's amenities page reads on a real location site
 * (references: Equinox "Club features", Life Time amenities). Rows, not cards: each space is its cut Tile,
 * its name, its one line, what it holds and its page. The picture is a cluster of every space here around
 * the lead one, so it names the club's spaces, not one room. The club-wide amenities close the section.
 */
export function ClubSpaces({
  club,
  spaces,
  lede,
}: {
  club: Club
  spaces: ClubSpaceList
  lede: string
}) {
  const [lead] = spaces.primary
  if (!lead) return null
  const focus = spaceObjects[lead.graphic].lead
  const around = [
    ...new Set<ObjectId>(
      [...spaces.primary.slice(1), ...spaces.amenities].map(
        (s) => spaceObjects[s.graphic].lead
      )
    ),
  ].filter((id) => id !== focus)
  return (
    <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
      {/* The column sticks below the header and the section nav (--sticky-top). */}
      <div className="lg:col-span-5">
        <div className="lg:sticky lg:top-[calc(var(--sticky-top)+1.5rem)]">
          <h2 className="display-lead max-w-[12ch] text-balance">
            Inside {club.short}.
          </h2>
          <p className="mt-4 max-w-[36ch] text-lead text-pretty text-muted-foreground">
            {lede}
          </p>
          {/* Decorative: the list beside it names each space. */}
          <div className="relative mt-10 aspect-[5/4] overflow-hidden rounded-lg max-lg:hidden">
            <ObjectRack
              ratio="5/4"
              layout="cluster"
              scheme="night"
              focus={focus}
              ids={around}
              fill
            />
          </div>
        </div>
      </div>

      <ol className="rule-t rule-heavy lg:col-span-7">
        {spaces.primary.map((sp) => (
          <li
            key={sp.id}
            id={`am-${sp.id}`}
            className="grid scroll-mt-4 grid-cols-[auto_minmax(0,1fr)] gap-x-5 py-8 rule-b sm:gap-x-8 lg:py-10"
          >
            <GymObject
              id={spaceObjects[sp.graphic].lead}
              cut
              className="size-12 sm:size-16"
            />
            <div>
              <h3 className="font-display-wide text-h3 lg:text-h2">
                {sp.name}
              </h3>
              <p className="mt-2 text-lead text-pretty">{sp.line}</p>
              <ul className="mt-5 grid gap-x-8 gap-y-2 text-body text-muted-foreground sm:grid-cols-2">
                {sp.amenities.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
              {sp.link ? (
                <div className="mt-6">
                  <TextLink href={sp.link.href}>{sp.link.label}</TextLink>
                </div>
              ) : null}
            </div>
          </li>
        ))}
      </ol>

      {spaces.amenities.length ? (
        <div className="lg:col-span-12">
          <h3 className="font-display-wide text-h3">Also at {club.short}</h3>
          <ul className="mt-4 grid rule-t sm:grid-cols-2 sm:gap-x-8 lg:grid-cols-4">
            {spaces.amenities.map((am) => {
              const row = (
                <span className="flex min-h-14 items-center gap-3 py-2">
                  <GymObject
                    id={spaceObjects[am.graphic].lead}
                    className="size-8 shrink-0"
                  />
                  <span className="text-body font-semibold">{am.name}</span>
                </span>
              )
              return (
                <li
                  key={am.id}
                  id={`am-${am.id}`}
                  className="scroll-mt-4 rule-b"
                >
                  {am.link ? (
                    <Link
                      href={am.link.href}
                      className="block no-underline hover:underline"
                    >
                      {row}
                    </Link>
                  ) : (
                    row
                  )}
                </li>
              )
            })}
          </ul>
        </div>
      ) : null}
    </div>
  )
}

/**
 * Plan your visit: where it is, how to get in, which club is next door, then when to come. The street map is
 * the section's picture. Beside it, the getting-here sheet and the other clubs, nearest first, so a visitor
 * on the wrong club page finds the right one in the same place as the directions (references: the
 * location pages of Equinox and Life Time, which put "nearby clubs" under the address). Below them the
 * week's hours and the busy hours sit side by side, so a visitor picks a time with both in view.
 */
export function ClubVisit({ club, clubs }: { club: Club; clubs: Club[] }) {
  const row = "grid grid-cols-[5.5rem_minmax(0,1fr)] gap-x-4 rule-b py-3"
  const here: [number, number] = [club.lat, club.lng]
  const others = clubs
    .filter((c) => c.slug !== club.slug)
    .map((c) => ({ c, mi: miles(here, [c.lat, c.lng]) }))
    .sort((a, b) => a.mi - b.mi)
  return (
    <div className="grid gap-12 lg:gap-16">
      <div className="grid gap-8 lg:grid-cols-12 lg:gap-12">
        <ClubMap
          only={club.slug}
          className="aspect-[4/3] w-full overflow-hidden rounded-lg sm:aspect-[16/9] lg:col-span-7 lg:aspect-auto lg:h-full lg:min-h-[32rem]"
          interactive={false}
        />

        <div className="min-w-0 lg:col-span-5">
          <h3 className="font-display-wide text-h3">Getting here</h3>
          <p className="mt-3 text-lead text-pretty">
            {club.cross}
            <br />
            <span className="text-muted-foreground">
              {club.city}, AZ {club.zip}
            </span>
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <LinkButton
              href={directionsHref(club)}
              external
              className="max-sm:flex-1"
            >
              <MapPin className="size-4" aria-hidden="true" />
              Get directions
            </LinkButton>
            <LinkButton
              href={`tel:${club.tel}`}
              variant="outline"
              className="max-sm:flex-1"
            >
              <Phone className="size-4" aria-hidden="true" />
              {club.phone}
            </LinkButton>
          </div>
          <dl className="mt-6 text-body rule-t">
            <div className={row}>
              <dt className="font-medium">Parking</dt>
              <dd className="text-pretty text-muted-foreground">
                {club.parking}
              </dd>
            </div>
            <div className={row}>
              <dt className="font-medium">Access</dt>
              <dd className="text-pretty text-muted-foreground">
                {club.access}
              </dd>
            </div>
          </dl>

          <h3 className="font-display-wide mt-10 text-h3">
            Other clubs nearby
          </h3>
          <ul className="mt-3 rule-t">
            {others.map(({ c, mi }) => (
              <li key={c.slug} className="rule-b">
                <Link
                  href={`/clubs/${c.slug}`}
                  className="group flex min-h-14 items-center gap-4 py-3 no-underline"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block text-body-strong underline-offset-4 group-hover:underline">
                      {c.name}
                    </span>
                    <span className="block text-caption text-muted-foreground">
                      {c.type} · {c.city}
                    </span>
                  </span>
                  <span className="text-body text-muted-foreground tabular-nums">
                    {mi.toFixed(1)} mi
                  </span>
                  <span
                    aria-hidden="true"
                    className="text-muted-foreground transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none"
                  >
                    →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="grid gap-12 pt-12 rule-t lg:grid-cols-12 lg:gap-16 lg:pt-16">
        <div className="min-w-0 lg:col-span-5">
          <h3 className="font-display-wide text-h3">Hours</h3>
          <ClubHours club={club} className="mt-4" />
        </div>
        <div className="min-w-0 lg:col-span-7">
          <PopularTimesChart club={club} />
        </div>
      </div>
    </div>
  )
}

/**
 * People at the club, set as the Home member voices: one member's words large on the left, with the
 * object for what they do here, and the club's coaches as ruled rows on the right. The quote is this
 * club's own when there is one; otherwise a member quote that holds for any club with this one's spaces.
 */
export function ClubPeople({
  club,
  coaches,
  testimonials,
  clubQuotes,
}: {
  club: Club
  coaches: Coach[]
  testimonials: Testimonial[]
  clubQuotes: ClubQuote[]
}) {
  const own = testimonials.find((t) => t.club === club.name)
  const other = clubQuotes.find(
    (q) => club.has.pool || !/swim|pool/i.test(q.quote)
  )
  const voice = own
    ? { quote: own.quote, who: own.who, detail: `${own.goal} · ${club.short}` }
    : other
      ? { quote: other.quote, who: other.who, detail: other.goal }
      : null
  return (
    <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
      {voice ? (
        <figure className="lg:col-span-5">
          <GymObject id={voiceIcon(voice.quote)} className="size-12" />
          <blockquote className="font-display-wide mt-6 text-h2 text-balance lg:text-h1">
            “{voice.quote}”
          </blockquote>
          <figcaption className="mt-8 flex items-center gap-4">
            <Mark who={voice.who} />
            <span>
              <span className="block text-body-strong">{voice.who}</span>
              <span className="block text-caption text-muted-foreground">
                {voice.detail}
              </span>
            </span>
          </figcaption>
        </figure>
      ) : null}

      <div className={cn(voice ? "lg:col-span-7" : "lg:col-span-12")}>
        <h3 className="font-display-wide text-h3">Coaches at {club.short}</h3>
        <ul className="mt-4 grid rule-t sm:grid-cols-2 sm:gap-x-8">
          {coaches.map((c) => (
            <li key={c.slug} className="rule-b">
              <Link
                href={`/coaches/${c.slug}`}
                className="group flex items-center gap-4 py-4 no-underline"
              >
                <CoachAvatar slug={c.slug} name={c.name} size={48} />
                <span className="min-w-0 flex-1">
                  <span className="block text-body-strong group-hover:underline">
                    {c.name}
                  </span>
                  <span className="block text-body text-muted-foreground">
                    {c.specialties.slice(0, 2).join(", ")}
                  </span>
                </span>
                <span
                  aria-hidden="true"
                  className="text-muted-foreground transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none"
                >
                  →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
