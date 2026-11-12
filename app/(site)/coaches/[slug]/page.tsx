import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { LinkButton, SectionHead, TextLink } from "@/components/brand/atoms"
import { CoachCard } from "@/components/sections/coach-finder"
import {
  CoachClasses,
  CoachClubs,
  CoachProfileHeader,
  CoachSpecialties,
  workingSteps,
} from "@/components/sections/coach-profile"
import { Band, JsonLd, TourCTABand } from "@/components/sections/common"
import {
  NumberedSteps,
  OfferColumns,
  quietLink,
} from "@/components/sections/program-page"
import { getCatalog } from "@/lib/catalog/server"
import { scheduleUrl } from "@/lib/links"
import type { ClassType } from "@/lib/types"
import { cn } from "@/lib/utils"

// Only coaches with a bio have a page. The other rows in `coaches` lead classes in the member app.
export const dynamicParams = false
export async function generateStaticParams() {
  const { profileCoaches } = await getCatalog()
  return profileCoaches.map((c) => ({ slug: c.slug }))
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { coachBySlug, clubBySlug } = await getCatalog()
  const c = coachBySlug((await params).slug)
  if (!c?.profile) return {}
  const what = (c.specialties[0] ?? "fitness").toLowerCase()
  return {
    title: `${c.name}, ${what} coach — Cactus Peak`,
    description: `${c.name} coaches ${what} at ${c.clubs
      .map((s) => clubBySlug(s)?.name)
      .filter(Boolean)
      .join(
        " and "
      )}. ${c.credential ? `${c.credential}. ` : ""}Meet ${c.first} on a free tour.`,
  }
}

/**
 * A coach's profile. It reads top to bottom, in the order a visitor sizes up a coach: who they are (the profile
 * header, with the actions), how they coach (their words and their background), how to train with them (their
 * classes and, if they take clients, one-on-one), where to find them (each club, with a tour that asks for them),
 * and how to join. Then other coaches at the same clubs, and the Copper tour panel. It has no hero facts and no
 * section nav, so it does not read as one more program page.
 */
export default async function CoachPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const {
    coachBySlug,
    clubBySlug,
    classBySlug,
    classByKey,
    profileCoaches,
    slots,
    packs,
    plans,
    clubs,
  } = await getCatalog()
  const c = coachBySlug((await params).slug)
  if (!c?.profile) notFound()

  const mine = slots.filter((s) => s.coachId === c.id)
  const perWeek = mine.reduce((n, s) => n + s.days.length, 0)
  const classes = c.teaches
    .map((t) => classBySlug(t))
    .filter((x): x is ClassType => Boolean(x))
  // When this coach leads each class: the clubs and the days, from the timetable.
  const weekly: Record<string, { club: string; days: number[] }[]> = {}
  for (const s of mine) {
    const ct = classByKey(s.classKey)
    const club = clubBySlug(s.club)?.short
    if (!ct || !club) continue
    if (!weekly[ct.slug]) weekly[ct.slug] = []
    const list = weekly[ct.slug]
    const row = list.find((r) => r.club === club)
    if (row)
      row.days = [...new Set([...row.days, ...s.days])].sort((a, b) => a - b)
    else list.push({ club, days: [...s.days].sort((a, b) => a - b) })
  }
  const homeClubs = clubs.filter((k) => c.clubs.includes(k.slug))
  // The clubs where this coach leads classes, from the timetable, for the plans line: "A, B or C".
  const classClubs = clubs
    .filter((k) => mine.some((s) => s.club === k.slug))
    .map((k) => k.short)
  const classClubLine =
    classClubs.length > 1
      ? `${classClubs.slice(0, -1).join(", ")} or ${classClubs.at(-1)}`
      : (classClubs[0] ?? "")
  const fromEach = Math.min(...packs.map((p) => p.each))
  const packLine = packs
    .map((p) => p.n)
    .join(", ")
    .replace(/, (\d+)$/, " or $1")
  const others = profileCoaches
    .filter(
      (x) => x.slug !== c.slug && x.clubs.some((s) => c.clubs.includes(s))
    )
    .sort((a, b) => (b.years ?? 0) - (a.years ?? 0))
    .slice(0, 3)
  const tourHref = `/tour?coach=${c.slug}&club=${c.clubs[0]}`
  const working = workingSteps(c)

  // The bands after the header, in order. The tones come from this list, so they alternate whatever a coach has.
  const order = [
    "about",
    "train",
    "clubs",
    "plans",
    ...(others.length ? ["more"] : []),
  ]
  const tone = (id: string) => (order.indexOf(id) % 2 === 0 ? "tint" : "plain")

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Person",
          name: c.name,
          jobTitle: `${c.specialties[0] ?? "Fitness"} coach`,
          worksFor: c.clubs.map((s) => clubBySlug(s)?.name).filter(Boolean),
        }}
      />
      <CoachProfileHeader
        coach={c}
        clubs={clubs}
        actions={
          <>
            <LinkButton href={tourHref} size="lg">
              Book a free tour
            </LinkButton>
            <LinkButton href="#plans" variant="outline" size="lg">
              See plans
            </LinkButton>
            <p className="text-body text-pretty text-muted-foreground">
              We will ask {c.first} to join your tour. Or{" "}
              <Link
                href={`/contact?topic=coach&coach=${c.slug}#message`}
                className={cn(
                  "inline-flex min-h-11 items-center text-foreground",
                  quietLink
                )}
              >
                send {c.first} a message
              </Link>
              .
            </p>
          </>
        }
      />

      {/* The coach's story on the left (bio, then their words) and what they coach for on the right, with what
          each specialty means. Nothing here repeats another band: the header leaves the specialties to this
          band, and how training works sits in the next one. */}
      <Band tone={tone("about")} id="about">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <h2 className="display-lead max-w-[12ch] text-balance">
              How {c.first} coaches.
            </h2>
            <p className="mt-6 max-w-[44ch] text-lead text-pretty">{c.bio}</p>
            {c.quote ? (
              <figure className="mt-8 pl-5 rule-l rule-accent">
                <blockquote className="font-display-wide text-h3 text-balance">
                  “{c.quote}”
                </blockquote>
              </figure>
            ) : null}
          </div>
          <section aria-labelledby="coaches-for" className="lg:col-span-7">
            <h3 id="coaches-for" className="text-label text-muted-foreground">
              Coaches for
            </h3>
            <div className="mt-3">
              <CoachSpecialties coach={c} />
            </div>
          </section>
        </div>
      </Band>

      <Band tone={tone("train")} id="train">
        <SectionHead
          size="lead"
          title={`Ways to train with ${c.first}.`}
          lede={
            classes.length && c.pt
              ? `In a class, on any plan, or one-on-one with a pack.`
              : classes.length
                ? "In a class. Every class comes with every plan."
                : "One-on-one, with a pack of sessions."
          }
          action={
            perWeek ? (
              <TextLink href={scheduleUrl({ coach: c.slug })}>
                See {c.first}&apos;s week
              </TextLink>
            ) : undefined
          }
        />
        {classes.length ? (
          <div className="mt-12">
            <CoachClasses
              classes={classes}
              favorite={c.favorite}
              weekly={weekly}
            />
          </div>
        ) : null}
        {/* How the training works, once: the steps say how sessions run, so the line under them only adds
            what the steps do not (the packs and the price). */}
        <section aria-labelledby="working-with" className="mt-16">
          <h3 id="working-with" className="font-display-wide text-h2">
            {working.title}
          </h3>
          <NumberedSteps className="mt-8" steps={working.steps} />
          {c.pt ? (
            <p className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-2 pt-6 text-body rule-t">
              <span>
                Packs of {packLine} sessions, from{" "}
                <span className="font-semibold tabular-nums">${fromEach}</span>{" "}
                a session.
              </span>
              <TextLink href="/personal-training#packs">See the packs</TextLink>
            </p>
          ) : (
            <p className="mt-10 pt-6 text-body text-muted-foreground rule-t">
              {c.first} leads classes and does not take personal training
              clients.{" "}
              <Link
                href="/personal-training#coaches"
                className={cn("text-foreground", quietLink)}
              >
                Find a coach who does
              </Link>
              .
            </p>
          )}
        </section>
      </Band>

      <Band tone={tone("clubs")} id="clubs">
        <SectionHead size="lead" title={`Where to find ${c.first}.`} />
        <div className="mt-12">
          <CoachClubs coach={c} clubs={homeClubs} />
        </div>
      </Band>

      <Band tone={tone("plans")} id="plans">
        <SectionHead
          size="lead"
          title={`Join to train with ${c.first}.`}
          lede={
            classClubLine
              ? `Every plan includes classes. With Trailhead, make ${classClubLine} your home club to take ${c.first}'s. Ridge and Summit open all ${clubs.length} clubs.`
              : `Every plan opens your home club. Ridge and Summit open all ${clubs.length} clubs.`
          }
          action={<TextLink href="/membership#compare">Compare plans</TextLink>}
        />
        <OfferColumns
          className="mt-12"
          offers={plans.map((p) => ({
            key: p.slug,
            title: p.name,
            value: `$${p.price}`,
            unit: "/mo",
            badge: p.badge ?? undefined,
            lit: Boolean(p.badge),
            lines: [p.bestFor],
            action: (
              <LinkButton
                href={`/join/plan?plan=${p.slug}`}
                variant={p.badge ? "primary" : "outline"}
              >
                Join {p.name}
              </LinkButton>
            ),
          }))}
        />
      </Band>

      {others.length ? (
        <Band tone={tone("more")} id="more">
          <SectionHead
            size="lead"
            title={`More coaches at ${c.first}'s clubs.`}
            action={<TextLink href="/coaches">See every coach</TextLink>}
          />
          <ul className="mt-12 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {others.map((o) => (
              <CoachCard key={o.slug} coach={o} lit={false} />
            ))}
          </ul>
        </Band>
      ) : null}

      <TourCTABand
        night
        club={c.clubs[0]}
        tourHref={tourHref}
        title={`Meet ${c.first} on a tour.`}
        support={`Book a free tour and we will ask ${c.first} to join. See the club, ask about the classes and pick a plan when you are ready. No card.`}
        passEmail
      />
    </>
  )
}
