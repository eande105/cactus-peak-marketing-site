import type { Metadata } from "next"
import Link from "next/link"
import { LinkButton, SectionHead, TextLink } from "@/components/brand/atoms"
import { ClubPin } from "@/components/brand/club-pin"
import {
  BrandMark,
  type ClubId,
  clubObjects,
  GymObject,
  ObjectCrop,
  type ObjectId,
} from "@/components/brand/graphics"
import { AboutHero } from "@/components/sections/about-heroes"
import { Band, TourCTABand } from "@/components/sections/common"
import {
  litFill,
  NumberedSteps,
  ObjectTiles,
} from "@/components/sections/program-page"
import { initials } from "@/lib/catalog"
import { getCatalog } from "@/lib/catalog/server"
import { cn } from "@/lib/utils"

export const metadata: Metadata = {
  title: "About Cactus Peak — built for the East Valley",
  description:
    "Five clubs in Mesa and Gilbert, opened one at a time since 2014. One rule from day one: nobody gets shamed.",
}

/** The three people who run the clubs. Each has a favourite class and a home club, as a coach does. */
const LEADERS: {
  name: string
  role: string
  favorite: string
  club: string
  quote: string
  icon: ObjectId
}[] = [
  {
    name: "Renata Alvarez",
    role: "Owner-operator",
    favorite: "Desert Flow Yoga",
    club: "Dobson & Southern",
    quote: "I swam here before I owned it.",
    icon: "pool",
  },
  {
    name: "Tom Becker",
    role: "Operations lead",
    favorite: "Endurance 60",
    club: "Val Vista & Warner",
    quote: "Open the doors on time. Everything follows.",
    icon: "key",
  },
  {
    name: "Priyanka Shah",
    role: "Head of coaching",
    favorite: "Rib Rack Strength",
    club: "Gilbert & Page",
    quote: "A good coach asks before telling.",
    icon: "whistle",
  },
]

/** The groups the clubs work with. A title only: the name says what each one is. */
const NEIGHBORS: { title: string; icon: ObjectId }[] = [
  { title: "School swim programs", icon: "pool" },
  { title: "Canal Run Club", icon: "sneaker" },
  { title: "A senior center", icon: "heart-watch" },
  { title: "Physical therapy clinics", icon: "resistance-band" },
]

/**
 * One of the people who run the clubs, in the coach card's form: a mark with the initials and their object
 * cropped at the edge, then the name, the role and their own words. The owner's card is lit.
 */
function LeaderCard({
  leader,
  lit,
}: {
  leader: (typeof LEADERS)[number]
  lit: boolean
}) {
  return (
    <li
      className={cn(
        "flex flex-col overflow-hidden corner-m hairline ring-border",
        lit ? "bg-[var(--cat-strength)]" : "bg-night"
      )}
    >
      <div
        className={cn(
          "relative isolate aspect-[16/7] overflow-hidden",
          lit ? "text-neutral-1" : "text-night-foreground"
        )}
      >
        <ObjectCrop
          id={leader.icon}
          ratio="16/7"
          scheme={lit ? "copper" : "night"}
          scale={0.42}
          x={0.62}
          y={0.18}
          fill
          className="-z-10"
        />
        <span
          aria-hidden="true"
          className="display-lead absolute top-5 left-5 leading-none"
        >
          {initials(leader.name)}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-m bg-card p-l">
        <div>
          <h3 className="font-display-wide text-body-l font-medium">
            {leader.name}
          </h3>
          <p className="text-body-s text-muted-foreground">{leader.role}</p>
        </div>
        <blockquote className="text-body-l text-pretty">
          “{leader.quote}”
        </blockquote>
        <p className="mt-auto pt-m text-body-s text-muted-foreground rule-t">
          Favorite class: {leader.favorite} at {leader.club}
        </p>
      </div>
    </li>
  )
}

/**
 * About. It answers, in order, where the clubs came from, what they hold to, who runs them and who they work with.
 * It shares the program pages' parts: a hero with a picture made for the claim (the mark, one rib for each club)
 * and a row of facts, lead-size heads, alternating bands and the Copper tour panel. It has no section nav: it is a
 * story read top to bottom, not a reference to jump around in.
 */
export default async function About() {
  const { clubs, coaches } = await getCatalog()
  const byYear = [...clubs].sort((a, b) => a.opened - b.opened)
  const first = byYear[0]
  return (
    <>
      <AboutHero
        clubs={clubs}
        lede={`${clubs.length} clubs in Mesa and Gilbert, opened one at a time since ${first?.opened ?? 2014}. One rule from day one: nobody gets shamed.`}
      />

      <Band tone="tint" id="story">
        <div className="grid gap-xxl lg:grid-cols-12 lg:gap-section">
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-[calc(var(--sticky-top)+1.5rem)]">
              <SectionHead size="lead" title="One club at a time." />
              <p className="mt-l max-w-[48ch] text-body-l text-pretty">
                We opened {first?.name ?? "our first club"} in{" "}
                {first?.opened ?? 2014} with a pool, a few courts and a rule:
                nobody gets shamed. People came for the water and stayed for the
                people.
              </p>
              <p className="mt-m max-w-[48ch] text-body-m text-pretty text-muted-foreground">
                Each club since was built for its neighborhood. The mark has
                five ribs, one for each of them.
              </p>
            </div>
          </div>
          <ol className="rule-t rule-heavy lg:col-span-7">
            {byYear.map((c) => {
              const objects = clubObjects[c.slug as ClubId] ?? []
              return (
                <li
                  key={c.slug}
                  className={cn(
                    "grid grid-cols-[auto_minmax(0,1fr)] items-start gap-x-l gap-y-s rule-b",
                    "py-xl",
                    "sm:gap-x-xxl"
                  )}
                >
                  <span className="tabular font-data text-display-l sm:text-display-xxl font-heavy sm:font-heavy">
                    {c.opened}
                  </span>
                  <div className="min-w-0">
                    <h3
                      className={cn(
                        "flex items-center gap-s",
                        "font-display-wide text-body-l font-medium",
                        "lg:text-body-xxl lg:font-heavy"
                      )}
                    >
                      <ClubPin n={c.n} />
                      <Link
                        href={`/clubs/${c.slug}`}
                        className="no-underline underline-offset-4 hover:underline"
                      >
                        {c.name}
                      </Link>
                    </h3>
                    <p className="mt-xxs text-body-s text-muted-foreground">
                      {c.city}
                    </p>
                    <p className="mt-s text-body-m text-pretty">
                      {c.personality}
                    </p>
                    {objects.length ? (
                      <span aria-hidden="true" className="mt-m flex gap-xs">
                        {objects.map((id) => (
                          <GymObject key={id} id={id} className="size-8" />
                        ))}
                      </span>
                    ) : null}
                  </div>
                </li>
              )
            })}
          </ol>
        </div>
      </Band>

      <Band id="rules">
        <SectionHead
          size="lead"
          title="The rule we kept."
          lede="Five clubs later, the first visit still works the way it did in 2014."
        />
        <NumberedSteps
          className="mt-xxl"
          steps={[
            {
              title: "Nobody gets shamed.",
              text: "New, or back from an injury? A coach matches you with an easy class first.",
              icon: "heart-watch",
            },
            {
              title: "A first visit is free.",
              text: "A tour or a 3-day pass. We do not ask for a card.",
              icon: "pass",
            },
            {
              title: "Coaches know your name.",
              text: `${coaches.length} coaches at ${clubs.length} clubs. Ask for one by name on a tour.`,
              icon: "whistle",
            },
            {
              title: "No shortcuts.",
              text: "Month to month, no contract. Progress is a long climb.",
              icon: "stopwatch",
            },
          ]}
        />
      </Band>

      <Band tone="tint" id="people">
        <SectionHead
          size="lead"
          title="Who runs it."
          action={<TextLink href="/coaches">Meet the coaches</TextLink>}
        />
        <ul className="mt-xxl grid gap-x-xl gap-y-xxl sm:grid-cols-2 lg:grid-cols-3">
          {LEADERS.map((l, i) => (
            <LeaderCard key={l.name} leader={l} lit={i === 0} />
          ))}
        </ul>
        {/* The one careers action on the page, in the coach finder's "Not sure who fits?" form. */}
        <aside
          aria-labelledby="about-careers-title"
          className={cn(
            "grid gap-l hairline",
            "mt-xxl corner-m p-l",
            "bg-card ring-border",
            "sm:grid-cols-[auto_minmax(0,1fr)] sm:gap-l lg:grid-cols-[auto_minmax(0,1fr)_auto] lg:items-center lg:p-xl"
          )}
        >
          <span
            aria-hidden="true"
            className={cn("grid size-14 place-items-center corner-s", litFill)}
          >
            <BrandMark scheme="copper" className="size-9" />
          </span>
          <div className="min-w-0">
            <h3
              id="about-careers-title"
              className="font-display-wide text-body-l font-medium"
            >
              Help people climb.
            </h3>
            <p className="mt-xs max-w-[60ch] text-body-m text-pretty text-muted-foreground">
              We hire coaches, lifeguards, kids club staff and front desk teams.
              Free membership for you and your family.
            </p>
          </div>
          <div className="sm:col-start-2 lg:col-start-auto">
            <LinkButton href="/careers" variant="outline">
              See open roles
            </LinkButton>
          </div>
        </aside>
      </Band>

      <Band id="neighborhood">
        <SectionHead size="lead" title="Part of the neighborhood." />
        <ObjectTiles className="mt-xxl" tiles={NEIGHBORS} />
      </Band>

      <TourCTABand
        night
        title="Come see the club."
        support="A 30-minute tour. A coach, not a salesperson. No card."
        passEmail
      />
    </>
  )
}
