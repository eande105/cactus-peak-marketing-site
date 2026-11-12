import Link from "next/link"
import { ClubPin } from "@/components/brand/club-pin"
import { GymObject, type ObjectId } from "@/components/brand/graphics"
import {
  HeartPulse,
  type IconComponent,
  IdCard,
  MapPin,
  ShieldCheck,
} from "@/components/icons"
import type { Club } from "@/lib/types"
import { cn } from "@/lib/utils"

/*
 * When kids club is open, as one picture of the week and the day, so a parent sees the whole schedule at a glance:
 * the open days, then the four 2-hour blocks on a day line with the midday break as a gap, and the clubs that have a
 * kids club. The two rules sit in the headers of the parts they describe: "Four 2-hour blocks" heads the day line,
 * and the limit per child sits beside it. The day tiles and the blocks share one size and type, so the two rows read
 * as one set. The hours are the same at every club with one.
 */

/** The four blocks, the same every open day. */
const BLOCKS = [
  { label: "8–10 am" },
  { label: "10 am–12 pm" },
  { label: "4–6 pm" },
  { label: "6–8 pm" },
]
const BREAK = { label: "Closed 12–4 pm" }

/** Monday first, the way a parent plans a week. */
const DAYS = [
  { short: "Mon", long: "Monday", open: true },
  { short: "Tue", long: "Tuesday", open: true },
  { short: "Wed", long: "Wednesday", open: true },
  { short: "Thu", long: "Thursday", open: true },
  { short: "Fri", long: "Friday", open: true },
  { short: "Sat", long: "Saturday", open: true },
  { short: "Sun", long: "Sunday", open: false },
]

/** One size and type for a day tile and a block, so the week and the day read as one set. */
const TILE =
  "flex h-14 flex-col items-center justify-center rounded-md px-2 text-center text-label font-semibold leading-tight tabular-nums whitespace-nowrap"
const OPEN = "bg-night text-night-foreground"
const CLOSED =
  "border border-dashed border-border-strong font-normal text-muted-foreground"
const GAP = "gap-1.5 sm:gap-2"

/** A part's header: its object, then its name. */
function PartHead({
  id,
  icon,
  children,
  aside,
}: {
  id: string
  icon: ObjectId
  children: React.ReactNode
  aside?: React.ReactNode
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
      <h3 id={id} className="font-display-wide flex items-center gap-3 text-h3">
        <GymObject id={icon} className="size-8 shrink-0" />
        {children}
      </h3>
      {aside}
    </div>
  )
}

export function KidsClubHours({ clubs }: { clubs: Club[] }) {
  const kidsClubs = clubs.filter((c) => c.has.kids)
  return (
    <div className="grid gap-8 lg:grid-cols-12 lg:gap-12">
      <div className="rounded-lg bg-card p-6 edge ring-border lg:col-span-8 lg:p-8">
        {/* The week: six open days, Sunday dimmed and dashed. */}
        <section aria-labelledby="kids-days">
          <PartHead id="kids-days" icon="playground">
            Monday to Saturday
          </PartHead>
          <ul className={cn("mt-5 grid grid-cols-7", GAP)}>
            {DAYS.map((d) => (
              <li key={d.short} className={cn(TILE, d.open ? OPEN : CLOSED)}>
                <span aria-hidden="true">{d.short}</span>
                <span className="sr-only">
                  {d.long}, {d.open ? "open" : "closed"}
                </span>
                {d.open ? null : (
                  // A phone's day tile is too narrow for the word; the dashed outline and the header carry it there.
                  <span
                    aria-hidden="true"
                    className="text-caption max-sm:hidden"
                  >
                    Closed
                  </span>
                )}
              </li>
            ))}
          </ul>
        </section>

        {/* The day: the four blocks in order, with the break between the morning and the evening. The limit per
            child heads the line beside the block length, because both are about the blocks. */}
        <section aria-labelledby="kids-blocks" className="mt-10">
          <PartHead
            id="kids-blocks"
            icon="stopwatch"
            aside={
              <p className="flex items-center gap-2 text-label text-muted-foreground">
                <GymObject id="schedule" className="size-6 shrink-0" />
                Up to 2 per child a day
              </p>
            }
          >
            Four 2-hour blocks
          </PartHead>
          {/* From sm, a day line. The break is drawn narrower than its four hours, so each block has room for its
              time on one line. */}
          <div className="mt-5 max-sm:hidden">
            <ol className={cn("grid grid-cols-[1fr_1fr_0.85fr_1fr_1fr]", GAP)}>
              {BLOCKS.slice(0, 2).map((b) => (
                <li key={b.label} className={cn(TILE, OPEN)}>
                  {b.label}
                </li>
              ))}
              <li
                aria-hidden="true"
                className={cn(
                  TILE,
                  CLOSED,
                  "bg-[repeating-linear-gradient(135deg,transparent_0_6px,color-mix(in_oklab,var(--foreground)_6%,transparent)_6px_12px)]"
                )}
              >
                {/* The ticks under it name the hours, so the cell says only that it is closed. */}
                Closed
              </li>
              {BLOCKS.slice(2).map((b) => (
                <li key={b.label} className={cn(TILE, OPEN)}>
                  {b.label}
                </li>
              ))}
            </ol>
            {/* The day's edges under the line: the start, the break and the close. */}
            <div
              aria-hidden="true"
              className={cn(
                "mt-2 grid grid-cols-[1fr_1fr_0.85fr_1fr_1fr] text-caption text-muted-foreground tabular-nums",
                GAP
              )}
            >
              <span>8 am</span>
              <span />
              <span className="flex justify-between">
                <span>12 pm</span>
                <span>4 pm</span>
              </span>
              <span />
              <span className="text-right">8 pm</span>
            </div>
          </div>
          {/* On a phone, the same blocks as two rows, with the break between them. */}
          <div className="mt-5 sm:hidden">
            <ol className={cn("grid grid-cols-2", GAP)}>
              {BLOCKS.slice(0, 2).map((b) => (
                <li key={b.label} className={cn(TILE, OPEN)}>
                  {b.label}
                </li>
              ))}
            </ol>
            <p
              aria-hidden="true"
              className="my-1.5 grid h-10 place-items-center rounded-md border border-dashed border-border-strong text-caption text-muted-foreground"
            >
              {BREAK.label}
            </p>
            <ol className={cn("grid grid-cols-2", GAP)}>
              {BLOCKS.slice(2).map((b) => (
                <li key={b.label} className={cn(TILE, OPEN)}>
                  {b.label}
                </li>
              ))}
            </ol>
          </div>
          <p className="sr-only">{BREAK.label}.</p>
        </section>
      </div>

      {/* Where: only the clubs with a kids club, as the club map's pins. */}
      <section aria-labelledby="kids-clubs" className="lg:col-span-4">
        <h3 id="kids-clubs" className="font-display-wide text-h3">
          At {kidsClubs.length} clubs
        </h3>
        <ul className="mt-5 rule-t rule-heavy">
          {kidsClubs.map((c) => (
            <li key={c.slug} className="rule-b">
              <Link
                href={`/clubs/${c.slug}`}
                className="group flex min-h-14 items-center gap-3 py-2 no-underline"
              >
                <ClubPin n={c.n} />
                <span className="min-w-0 flex-1">
                  <span className="block text-body-strong group-hover:underline">
                    {c.short}
                  </span>
                  <span className="block text-caption text-muted-foreground">
                    {c.city}
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
      </section>
    </div>
  )
}

/** One block, start to finish, with real clock times so the rules read as a visit. 4–6 pm is the example. */
const VISIT = {
  block: "4–6 pm",
  phases: [
    {
      key: "in",
      icon: "pass" as ObjectId,
      when: "4–4:15",
      title: "Check in by 4:15",
      text: "Sign your child in with the app at the kids club door. A booked block with no check-in by 4:15 is released.",
      span: 1,
    },
    {
      key: "play",
      icon: "playground" as ObjectId,
      when: "4:15–5:45",
      title: "Play",
      text: "Staff run games, crafts and quiet time while you train.",
      span: 6,
    },
    {
      key: "out",
      icon: "stopwatch" as ObjectId,
      when: "5:45–6",
      title: "Pick up by 6",
      text: "We text you at 5:45, so you have 15 minutes to finish and come back.",
      span: 1,
    },
  ],
  ticks: ["4", "4:15", "5:45", "6"],
}

/** Who is with the children. The ratio is the number parents ask for first, so it is the figure. */
const CARE: { icon: IconComponent; text: string }[] = [
  { icon: ShieldCheck, text: "Every staff member passes a background check" },
  { icon: HeartPulse, text: "Staff hold CPR and first aid training" },
  { icon: IdCard, text: "Allergy notes are kept on file" },
  { icon: MapPin, text: "You stay in the building the whole time" },
]

/**
 * How a kids club visit runs, drawn as one block on a clock: a short check-in window, the play time, and a short
 * pick-up window after the reminder text. Each phase's rule sits under its part of the line, so "15 minutes" and
 * "1 hour 45" become times a parent can plan around. Beside it, the adult-to-child ratio as a figure and the care
 * checks as a list.
 */
export function KidsClubVisit() {
  return (
    <div className="grid gap-8 lg:grid-cols-12 lg:gap-12">
      <section
        aria-labelledby="kids-visit"
        className="rounded-lg bg-card p-6 edge ring-border lg:col-span-8 lg:p-8"
      >
        <PartHead id="kids-visit" icon="schedule">
          A {VISIT.block} block
        </PartHead>
        {/* The block as a line: the check-in and pick-up windows are each 15 minutes of the 2 hours. */}
        <div aria-hidden="true" className="mt-6">
          <div className={cn("grid grid-cols-8", GAP)}>
            {VISIT.phases.map((p) => (
              <span
                key={p.key}
                className={cn(
                  "h-4 rounded-full",
                  p.key === "play" ? "bg-night" : "bg-[var(--cat-strength)]"
                )}
                style={{ gridColumn: `span ${p.span} / span ${p.span}` }}
              />
            ))}
          </div>
          <div className="relative mt-2 h-5 text-caption text-muted-foreground tabular-nums">
            {VISIT.ticks.map((t, i) => (
              <span
                key={t}
                className={cn(
                  "absolute",
                  i === 0
                    ? "left-0"
                    : i === VISIT.ticks.length - 1
                      ? "right-0"
                      : // On a phone the 15-minute windows are too narrow for their times; the phases below give them.
                        "-translate-x-1/2 max-sm:hidden"
                )}
                style={
                  i === 1
                    ? { left: "12.5%" }
                    : i === 2
                      ? { left: "87.5%" }
                      : undefined
                }
              >
                {t}
              </span>
            ))}
          </div>
        </div>
        {/* The three phases, in order. The two windows are the rules; the play time is what happens. */}
        <ol className="mt-8 grid gap-6 pt-6 rule-t md:grid-cols-3">
          {VISIT.phases.map((p) => (
            <li key={p.key} className="flex flex-col gap-2">
              <span className="flex items-center gap-3">
                <span
                  aria-hidden="true"
                  className={cn(
                    "grid size-10 shrink-0 place-items-center rounded-md",
                    p.key === "play" ? "bg-night" : "bg-[var(--cat-strength)]"
                  )}
                >
                  <GymObject
                    id={p.icon}
                    scheme={p.key === "play" ? "night" : "copper"}
                    className="size-6"
                  />
                </span>
                <span>
                  <span className="block text-caption text-muted-foreground tabular-nums">
                    {p.when}
                  </span>
                  <span className="block text-body-strong">{p.title}</span>
                </span>
              </span>
              <p className="text-body text-pretty text-muted-foreground">
                {p.text}
              </p>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="kids-care" className="lg:col-span-4">
        <h3 id="kids-care" className="sr-only">
          Who is with your child
        </h3>
        {/* Last-baseline alignment: the label wraps to two lines, and its last line sits on the figure's baseline. */}
        <p className="flex [align-items:last_baseline] gap-3">
          <span className="tabular font-data text-figure-xl">1:8</span>
          <span className="text-body-strong">
            One adult for every 8 children
          </span>
        </p>
        <ul className="mt-6 rule-t rule-heavy">
          {CARE.map(({ icon: Icon, text }) => (
            <li
              key={text}
              className="flex items-center gap-3 py-3.5 text-body rule-b"
            >
              <Icon className="size-5 shrink-0" aria-hidden="true" />
              {text}
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
