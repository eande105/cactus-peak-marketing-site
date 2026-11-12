import type { Metadata } from "next"
import { LinkButton, SectionHead, TextLink } from "@/components/brand/atoms"
import { SectionNav } from "@/components/sections/club-detail-client"
import { Band, FaqSection, TourCTABand } from "@/components/sections/common"
import { FactTable, NotHere } from "@/components/sections/fact-table"
import { CourtCount, courtTiles } from "@/components/sections/program-heroes"
import {
  NumberedSteps,
  ProgramHero,
  ProgramRows,
  quietLink,
} from "@/components/sections/program-page"
import { CourtGrid } from "@/components/sections/slot-grid"
import { HandoffButton } from "@/components/sections/small-client"
import { getCatalog } from "@/lib/catalog/server"
import { timesByClub } from "@/lib/class-times"
import { PHONE_HOURS } from "@/lib/labels"
import { classHref } from "@/lib/links"
import { cn } from "@/lib/utils"

export const metadata: Metadata = {
  title: "Courts at Cactus Peak — 18 courts at 3 clubs",
  description:
    "Pickleball, tennis and basketball at three clubs. Book 3 days ahead in the app or call the desk.",
}

/** The page's sections, in order. */
const SECTIONS = [
  { id: "clubs", label: "Clubs" },
  { id: "booking", label: "Booking" },
  { id: "play", label: "Ways to play" },
  { id: "today", label: "Today" },
  { id: "questions", label: "Questions" },
]

// The Trailhead answer leads, because the first answer opens by default and it is the one visitors look for.
const faq = [
  {
    id: "c3",
    q: "Can Trailhead members book courts?",
    a: "Courts come with Ridge and Summit.",
  },
  {
    id: "c1",
    q: "Do I need my own paddle?",
    a: "No. Loaner paddles are at the desk.",
  },
  {
    id: "c2",
    q: "Is open play for beginners?",
    a: "Yes. Ask a coach for a beginner court.",
  },
  {
    id: "c4",
    q: "Can I book for a group?",
    a: "Yes. Book each court as a slot.",
  },
]

/** The extras beside the courts, where a club has them. */
const EXTRAS: Record<string, string> = {
  "power-mckellips": "Turf lane, Superstition-view deck",
}

// The court desk: Power & McKellips has the most courts, so its number is the one the page gives.
const DESK = { phone: "(480) 555-0127", tel: "+14805550127" }

/**
 * Courts. It answers, in order, where the courts are, how to book one, the coached ways to play and what is
 * open today. It shares the membership page's parts: a hero with a picture made for the claim and a row of
 * the section nav, lead-size heads, alternating bands and the Copper tour panel. The court counts come
 * from the club data, so the hero, the table and the club pages agree.
 */
export default async function Courts() {
  const { classBySlug, clubs, slots } = await getCatalog()
  const withCourts = clubs.filter((c) => courtTiles(c).length > 0)
  const total = withCourts.reduce((n, c) => n + courtTiles(c).length, 0)
  const without = clubs.filter((c) => courtTiles(c).length === 0)
  const count = (n?: number) => (n ? String(n) : <NotHere />)
  return (
    <>
      <ProgramHero
        id="courts-hero-title"
        title="Play more than you plan."
        lede={`${total} courts at ${withCourts.length} clubs, for pickleball, tennis and basketball. Book a 60- or 90-minute slot 3 days ahead in the app.`}
        actions={
          <>
            <LinkButton href="/tour" size="lg" className="max-sm:flex-1">
              Book a free tour
            </LinkButton>
            <LinkButton
              href="#booking"
              variant="outline"
              size="lg"
              className="max-sm:flex-1"
            >
              How booking works
            </LinkButton>
          </>
        }
        note={
          <>
            Prefer to call?{" "}
            <a
              href={`tel:${DESK.tel}`}
              className={cn(
                "inline-flex min-h-11 items-center text-foreground tabular-nums",
                quietLink
              )}
            >
              {DESK.phone}
            </a>
          </>
        }
        layout="banner"
        picture={<CourtCount clubs={withCourts} />}
      />

      <SectionNav items={SECTIONS} />

      <Band tone="tint" id="clubs">
        <SectionHead
          size="lead"
          title="Courts at three clubs."
          lede="Ridge and Summit open every court. Trailhead does not include courts."
          action={<TextLink href="/membership#compare">Compare plans</TextLink>}
        />
        {/* A table from md, one block for each club below it, so nothing scrolls sideways. */}
        <div className="mt-12">
          <FactTable
            caption="Courts at each club"
            corner="Club"
            columns={[
              { label: "Pickleball", icon: "paddle", numeric: true },
              { label: "Tennis", icon: "tennis-ball", numeric: true },
              { label: "Basketball", icon: "basketball", numeric: true },
              { label: "Also here" },
            ]}
            rows={withCourts.map((c) => ({
              key: c.slug,
              title: c.short,
              sub: c.city,
              href: `/clubs/${c.slug}`,
              values: [
                count(c.courts?.pickleball),
                count(c.courts?.tennis),
                count(c.courts?.basketball),
                EXTRAS[c.slug] ?? <NotHere label="Nothing more" />,
              ],
            }))}
          />
        </div>
        {without.length ? (
          <p className="mt-6 max-w-[62ch] text-body text-pretty text-muted-foreground">
            No courts at {without.map((c) => c.short).join(" or ")}. Ridge and
            Summit members play at the other {withCourts.length}.
          </p>
        ) : null}
      </Band>

      <Band id="booking">
        <SectionHead
          size="lead"
          title="Book three days ahead."
          lede="The window opens at 6 am Arizona time."
        />
        <NumberedSteps
          className="mt-12"
          steps={[
            {
              title: "Pick a time.",
              text: "Courts come in 60- or 90-minute slots.",
              icon: "stopwatch",
            },
            {
              title: "Book in the app.",
              text: "One court a day, up to 2 booked at once. Cancel free up to 2 hours before.",
              icon: "schedule",
            },
            {
              title: "Show up and play.",
              text: "Check in at the desk or with the app. Loaner paddles are at the desk.",
              icon: "paddle",
            },
          ]}
        />
        <div className="mt-12 flex flex-wrap items-center gap-x-8 gap-y-4 pt-8 rule-t">
          <HandoffButton
            label="Book a court"
            classSlug="pickleball-open-play"
            club="power-mckellips"
            start={420}
            variant="primary"
          />
          <p className="text-body text-muted-foreground">
            Or call the desk at{" "}
            <a
              href={`tel:${DESK.tel}`}
              className={cn(
                "inline-flex min-h-11 items-center font-semibold text-foreground tabular-nums",
                quietLink
              )}
            >
              {DESK.phone}
            </a>
            , {PHONE_HOURS}.
          </p>
        </div>
      </Band>

      <Band tone="tint" id="play">
        <SectionHead
          size="lead"
          title="Four ways to play."
          lede="Open play when you want a game. A clinic or a drill when you want a coach."
        />
        <ProgramRows
          className="mt-12"
          rows={[
            ["pickleball-open-play", "paddle"],
            ["pickleball-clinic", "paddle"],
            ["tennis-drills", "tennis-ball"],
            ["hoops-run", "basketball"],
          ].flatMap(([slug, icon]) => {
            const c = classBySlug(slug)
            if (!c) return []
            const per = timesByClub(slots, c.key, clubs)
            return [
              {
                key: slug,
                icon: icon as "paddle",
                title: c.name,
                href: classHref(c),
                line: (
                  <>
                    {c.blurb}
                    {c.firstTimer ? " Good for first-timers." : ""}
                    {/* Start times differ by club, so each club gets its own line. */}
                    {per.length ? (
                      <ul className="mt-2 text-muted-foreground">
                        {per.map((p) => (
                          <li key={p.club.slug} className="tabular-nums">
                            <span className="font-semibold text-foreground">
                              {p.club.short}:
                            </span>{" "}
                            {p.text}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </>
                ),
                aside: `${c.duration} minutes`,
              },
            ]
          })}
        />
      </Band>

      <Band id="today">
        <SectionHead
          size="lead"
          title="Courts open today."
          lede="A sample of today's slots at Power & McKellips."
        />
        <div className="mt-12">
          <CourtGrid />
        </div>
        <div className="mt-6">
          <HandoffButton
            label="Book a court"
            classSlug="pickleball-open-play"
            club="power-mckellips"
            start={480}
          />
        </div>
      </Band>

      <FaqSection
        id="questions"
        tone="tint"
        title="Court questions."
        items={faq}
        phone={DESK.phone}
        tel={DESK.tel}
      />

      <TourCTABand
        night
        title="Meet your court on a tour."
        support="A coach shows you the courts and the open-play times, and finds you a beginner game if you want one. No card."
        passEmail
      />
    </>
  )
}
