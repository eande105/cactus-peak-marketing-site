import type { Metadata } from "next"
import { LinkButton, SectionHead, TextLink } from "@/components/brand/atoms"
import { GymObject } from "@/components/brand/graphics"
import { CareersHero, payEnds } from "@/components/sections/about-heroes"
import { JobList } from "@/components/sections/careers-client"
import { Band } from "@/components/sections/common"
import { HIRE_STEPS } from "@/components/sections/detail-parts"
import { NumberedSteps, ObjectTiles } from "@/components/sections/program-page"
import { getCatalog } from "@/lib/catalog/server"
import { fmtClock, WEEKDAY_HOURS } from "@/lib/time"

export const metadata: Metadata = {
  title:
    "Careers at Cactus Peak — coaches, lifeguards, kids club and front desk",
  description: "Open roles at 5 clubs in Mesa and Gilbert.",
}

/**
 * Careers. It answers, in order, what working here gives you, which roles are open, and how hiring goes. It shares
 * the program pages' parts: a hero with a picture made for the claim (the open roles as a shift board) and a row
 * of facts, lead-size heads and alternating bands. It has no section nav: three short sections read top to bottom.
 * It ends on the hiring steps, not the member tour panel, because its reader is applying, not joining.
 */
export default async function Careers() {
  const { jobs } = await getCatalog()
  const hiring = new Set(jobs.map((j) => j.club)).size
  const ends = jobs.map((j) => payEnds(j.pay)).filter((e) => e !== undefined)
  const low = ends.length ? Math.min(...ends.map((e) => e[0])) : null
  const high = ends.length ? Math.max(...ends.map((e) => e[1])) : null
  return (
    <>
      <CareersHero
        jobs={jobs}
        perks={[
          { label: `${hiring} clubs hiring now`, icon: "squat-rack" },
          ...(low !== null && high !== null
            ? [
                {
                  label: `$${low}–$${high} an hour`,
                  icon: "stopwatch" as const,
                },
              ]
            : []),
          { label: "Full-time and part-time", icon: "schedule" },
        ]}
      />

      <Band tone="tint" id="why">
        <SectionHead size="lead" title="Why work here." />
        <ObjectTiles
          className="mt-12"
          tiles={[
            {
              title: "Free membership for you and your family",
              icon: "gym-bag",
            },
            {
              title: `Shifts from ${fmtClock(WEEKDAY_HOURS[0])} to ${fmtClock(WEEKDAY_HOURS[1])}`,
              icon: "schedule",
            },
            { title: "Training and certifications paid", icon: "whistle" },
          ]}
        />
      </Band>

      <Band id="roles">
        <SectionHead size="lead" title="Open roles." />
        <div className="mt-12">
          <JobList />
        </div>
      </Band>

      <Band tone="tint" id="hire">
        <SectionHead
          size="lead"
          title="How we hire."
          lede="Four steps, and an answer at each one."
        />
        <NumberedSteps className="mt-12" steps={HIRE_STEPS} />
        {/* The one contact action on the page, in the coach finder's "Not sure who fits?" form. */}
        <aside
          aria-labelledby="careers-ask-title"
          className="mt-16 grid gap-5 rounded-lg bg-card p-6 edge ring-border sm:grid-cols-[auto_minmax(0,1fr)] sm:gap-6 lg:grid-cols-[auto_minmax(0,1fr)_auto] lg:items-center lg:p-8"
        >
          <span
            aria-hidden="true"
            className="grid size-14 place-items-center rounded-md bg-night"
          >
            <GymObject id="whistle" scheme="night" className="size-9" />
          </span>
          <div className="min-w-0">
            <h3 id="careers-ask-title" className="font-display-wide text-h3">
              Questions about a role?
            </h3>
            <p className="mt-2 max-w-[60ch] text-body text-pretty text-muted-foreground">
              Cactus Peak is an equal opportunity employer. To ask for an
              accommodation, call (480) 555-0100.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 sm:col-start-2 lg:col-start-auto">
            <LinkButton href="/contact?topic=careers#message" variant="outline">
              Send a message
            </LinkButton>
            <TextLink href="tel:+14805550100">Call us</TextLink>
          </div>
        </aside>
      </Band>
    </>
  )
}
