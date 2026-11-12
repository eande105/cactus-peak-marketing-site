import type React from "react"
import { GymObject, type ObjectId } from "@/components/brand/graphics"
import { Check } from "@/components/icons"
import { fmtTimeShort } from "@/lib/time"
import { cn } from "@/lib/utils"

/*
 * The Journal's figures: one or two small visual aids for each note, drawn from the site's own parts (gym objects on
 * discs, Night and Copper fills, the tabular data face). Each figure repeats facts the note states in its text, so
 * a reader who skips the figure loses nothing, and each one has a plain-text summary for screen readers.
 *
 * The notes live in the database, but the figures are code, so they are keyed by slug. A note with no entry here
 * reads as plain text. `after` is the index of the note's part that the figure follows.
 */

export type NoteFigure = { after: number; figure: () => React.ReactNode }

type Tone = "lit" | "night" | "pale"
const fill: Record<Tone, string> = {
  lit: "bg-[var(--cat-strength)] text-[var(--neutral-1)]",
  night: "bg-night text-night-foreground",
  pale: "bg-muted text-foreground",
}

/* ---------- Shared parts ---------- */

/** The frame every figure sits in: a card a little wider than the text column, with its title on top. */
function Fig({
  label,
  title,
  summary,
  children,
}: {
  label: string
  title: string
  /** What the figure shows, in one sentence, for screen readers. */
  summary: string
  children: React.ReactNode
}) {
  return (
    <figure className="my-10 rounded-lg bg-card p-5 edge ring-border sm:p-7 lg:-mx-8">
      <figcaption>
        <span className="block text-caption text-muted-foreground">
          {label}
        </span>
        <span className="font-display-wide mt-0.5 block text-h3 text-balance">
          {title}
        </span>
        <span className="sr-only">{summary}</span>
      </figcaption>
      <div aria-hidden="true" className="mt-6">
        {children}
      </div>
    </figure>
  )
}

/** A gym object on a round tile. */
function Dot({
  id,
  tone = "night",
  className,
}: {
  id: ObjectId
  tone?: Tone
  className?: string
}) {
  return (
    <span
      className={cn(
        "grid size-11 shrink-0 place-items-center rounded-full",
        fill[tone],
        className
      )}
    >
      <GymObject
        id={id}
        scheme={tone === "lit" ? "copper" : tone === "night" ? "night" : "sand"}
        className="size-[58%]"
      />
    </span>
  )
}

type Span = { from: number; to: number; label: string; tone: Tone }

/**
 * A stretch of the day as one bar, in minutes after midnight. The spans are filled parts of the bar; the legend
 * under it names each span and its times, so no label has to fit inside a short span on a phone.
 */
function DayBar({
  start,
  end,
  spans,
  ticks,
  marks = [],
}: {
  start: number
  end: number
  spans: Span[]
  ticks: number[]
  /** A point in time with a short note, drawn as a pin above the bar. */
  marks?: { at: number; label: string }[]
}) {
  const at = (m: number) => `${((m - start) / (end - start)) * 100}%`
  return (
    <div>
      <div className={cn("relative", marks.length && "pt-9")}>
        {marks.map((m) => {
          // Near an end of the bar the label hangs inward from its pin, so it stays inside the figure on a phone.
          const share = (m.at - start) / (end - start)
          const side = share < 0.25 ? "start" : share > 0.75 ? "end" : "mid"
          return (
            <span
              key={m.label}
              style={{ left: at(m.at) }}
              className={cn(
                "absolute top-0 flex flex-col",
                side === "start" && "-translate-x-3 items-start",
                side === "end" && "-translate-x-[calc(100%-0.75rem)] items-end",
                side === "mid" && "-translate-x-1/2 items-center"
              )}
            >
              <span className="rounded-full bg-foreground px-2 py-0.5 text-caption whitespace-nowrap text-background">
                {m.label}
              </span>
              <span
                className={cn(
                  "h-3 w-px bg-foreground",
                  side === "start" && "ml-3",
                  side === "end" && "mr-3"
                )}
              />
            </span>
          )
        })}
        <div className="relative h-11 overflow-hidden rounded-md bg-[repeating-linear-gradient(90deg,var(--muted)_0_6px,transparent_6px_10px)]">
          {spans.map((s) => (
            <span
              key={s.label}
              style={{ left: at(s.from), width: at(start + s.to - s.from) }}
              className={cn(
                "absolute inset-y-0 rounded-md ring-2 ring-card",
                fill[s.tone]
              )}
            />
          ))}
        </div>
        <div className="relative mt-2 h-5">
          {ticks.map((t, i) => (
            <span
              key={t}
              style={{ left: at(t) }}
              className={cn(
                "tabular absolute font-data text-caption whitespace-nowrap text-muted-foreground",
                i === 0
                  ? "left-0"
                  : i === ticks.length - 1
                    ? "-translate-x-full"
                    : "-translate-x-1/2"
              )}
            >
              {fmtTimeShort(t)}
            </span>
          ))}
        </div>
      </div>
      <ul className="mt-5 grid gap-3 sm:grid-cols-2">
        {spans.map((s) => (
          <li key={s.label} className="flex items-start gap-3">
            <span
              className={cn("mt-1 size-3.5 shrink-0 rounded-sm", fill[s.tone])}
            />
            <span>
              <span className="block text-label">{s.label}</span>
              <span className="tabular block text-caption text-muted-foreground">
                {fmtTimeShort(s.from)} to {fmtTimeShort(s.to)}
              </span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

/** Steps that climb from left to right, one bar a step, with the step's object on top. */
function Climb({
  steps,
}: {
  steps: { top: string; label: string; id: ObjectId; tone: Tone }[]
}) {
  return (
    <ol className="grid grid-cols-2 items-end gap-3 sm:grid-cols-4">
      {steps.map((s, i) => (
        <li key={s.top} className="flex flex-col">
          <Dot id={s.id} tone={s.tone} className="mb-3" />
          <span className="text-label">{s.top}</span>
          <span className="text-caption text-muted-foreground">{s.label}</span>
          <span
            style={{ height: `${2.5 + i * 1.75}rem` }}
            className={cn("mt-3 block rounded-t-md", fill[s.tone])}
          />
        </li>
      ))}
    </ol>
  )
}

/* ---------- Your first Climb Cycle ---------- */

function ArriveEarly() {
  const stops = [
    {
      at: "10 min before",
      label: "Arrive. A coach sets your bike.",
      lit: true,
    },
    { at: "0 min", label: "Class starts. Warm up seated." },
    { at: "45 min", label: "Class ends. Stretch, then water." },
  ]
  return (
    <Fig
      label="Figure 1"
      title="Your first hour, from the door."
      summary="Arrive 10 minutes before class for the bike set-up. The class runs 45 minutes."
    >
      <ol className="relative grid gap-6 sm:grid-cols-3 sm:gap-4">
        <span className="absolute top-[1.375rem] right-[16%] left-[16%] hidden h-0.5 bg-[repeating-linear-gradient(90deg,var(--foreground)_0_6px,transparent_6px_12px)] sm:block" />
        {stops.map((s) => (
          <li
            key={s.at}
            className="relative flex items-center gap-4 sm:flex-col sm:text-center"
          >
            <Dot id="spin-bike" tone={s.lit ? "lit" : "night"} />
            <span>
              <span className="tabular block font-data text-label font-bold">
                {s.at}
              </span>
              <span className="block text-caption text-muted-foreground">
                {s.label}
              </span>
            </span>
          </li>
        ))}
      </ol>
    </Fig>
  )
}

function LoadScale() {
  const loads = Array.from({ length: 10 }, (_, i) => i + 1)
  return (
    <Fig
      label="Figure 2"
      title="Start at 3 or 4. Add from there."
      summary="The coach calls loads from 1 to 10. A first class starts at 3 or 4 and adds load only when it feels easy."
    >
      <div className="flex h-36 items-end gap-1.5 sm:gap-2">
        {loads.map((n) => (
          <div key={n} className="flex h-full flex-1 flex-col justify-end">
            <span
              style={{ height: `${18 + n * 8.2}%` }}
              className={cn(
                "block rounded-t-md",
                n === 3 || n === 4
                  ? fill.lit
                  : n < 3
                    ? fill.pale
                    : "bg-[repeating-linear-gradient(135deg,var(--night)_0_2px,transparent_2px_7px)] ring-1 ring-night ring-inset"
              )}
            />
          </div>
        ))}
      </div>
      <div className="mt-2 flex gap-1.5 sm:gap-2">
        {loads.map((n) => (
          <span
            key={n}
            className={cn(
              "tabular flex-1 text-center font-data text-caption",
              n === 3 || n === 4 ? "font-bold" : "text-muted-foreground"
            )}
          >
            {n}
          </span>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-caption">
        <span className="flex items-center gap-2">
          <span className={cn("size-3.5 rounded-sm", fill.lit)} />
          Your first class
        </span>
        <span className="flex items-center gap-2">
          <span className="size-3.5 rounded-sm bg-[repeating-linear-gradient(135deg,var(--night)_0_2px,transparent_2px_7px)] ring-1 ring-night ring-inset" />
          Add as it feels easy
        </span>
      </div>
    </Fig>
  )
}

/* ---------- A first week back after surgery ---------- */

function OneLineLog() {
  const rows = [
    ["Mon", "Warm pool, 10 easy min", "Knee fine next morning"],
    ["Wed", "Mobility 30", "A little stiff, gone by noon"],
    ["Fri", "Warm pool, 15 min", "Fine"],
  ]
  return (
    <Fig
      label="Figure 1"
      title="One line a day is enough."
      summary="A sample log: the day, what you did, and how it felt the next morning."
    >
      {/* A page from a notebook: a Copper margin rule, then ruled lines. */}
      <div className="relative rounded-lg bg-background py-2 pl-10 ring-1 ring-border sm:pl-12">
        <span className="absolute inset-y-0 left-6 w-0.5 bg-[var(--cat-strength)] sm:left-8" />
        <div className="grid grid-cols-[3rem_minmax(0,1fr)] gap-x-4 py-2 pr-4 text-caption text-muted-foreground rule-b sm:grid-cols-[3rem_minmax(0,1fr)_minmax(0,1fr)]">
          <span>Day</span>
          <span>What I did</span>
          <span className="max-sm:hidden">Next morning</span>
        </div>
        {rows.map(([d, did, felt]) => (
          <div
            key={d}
            className="grid grid-cols-[3rem_minmax(0,1fr)] gap-x-4 py-3 pr-4 rule-b last:rule-none sm:grid-cols-[3rem_minmax(0,1fr)_minmax(0,1fr)]"
          >
            <span className="font-data text-label font-bold">{d}</span>
            <span className="text-body">{did}</span>
            <span className="text-body text-muted-foreground max-sm:col-start-2">
              {felt}
            </span>
          </div>
        ))}
      </div>
    </Fig>
  )
}

function WeekByWeek() {
  return (
    <Fig
      label="Figure 2"
      title="Add one thing a week."
      summary="Week 1: the warm pool, 10 minutes. Week 2: add Mobility 30. Week 3: a longer swim. Week 4: a little load. If a week is too much, repeat it."
    >
      <Climb
        steps={[
          {
            top: "Week 1",
            label: "Warm pool, 10 min",
            id: "pool",
            tone: "pale",
          },
          { top: "Week 2", label: "+ Mobility 30", id: "mat", tone: "pale" },
          {
            top: "Week 3",
            label: "+ A longer swim",
            id: "wave",
            tone: "night",
          },
          {
            top: "Week 4",
            label: "+ A little load",
            id: "kettlebell",
            tone: "lit",
          },
        ]}
      />
      <p className="mt-4 flex items-center gap-2 text-caption text-muted-foreground">
        <Check className="size-4 text-success" />
        Too much? Repeat the week. That is allowed.
      </p>
    </Fig>
  )
}

/* ---------- What to eat before a 6 am class ---------- */

function SixAmMorning() {
  return (
    <Fig
      label="Figure 1"
      title="The morning, on one line."
      summary="Eat something small from 5:15 to 5:30 am. Class runs from 6 to 6:45 am. Eat protein and carbohydrate by 7:45 am. The café opens at 6 am."
    >
      <DayBar
        start={5 * 60}
        end={8 * 60}
        ticks={[300, 360, 420, 480]}
        marks={[{ at: 360, label: "Café opens" }]}
        spans={[
          { from: 315, to: 330, label: "Something small", tone: "lit" },
          { from: 360, to: 405, label: "Class", tone: "night" },
          { from: 405, to: 465, label: "Eat after", tone: "lit" },
        ]}
      />
    </Fig>
  )
}

function AfterPlates() {
  const plates: [string, ObjectId, string, ObjectId][] = [
    ["Eggs", "shaker", "Fruit", "plate"],
    ["Yogurt", "shaker", "Oats", "plate"],
  ]
  return (
    <Fig
      label="Figure 2"
      title="After class: protein and carbohydrate."
      summary="Two easy pairs: eggs and fruit, or yogurt and oats."
    >
      <ul className="grid gap-3 sm:grid-cols-2">
        {plates.map(([p, pid, c, cid]) => (
          <li
            key={p}
            className="flex items-center gap-3 rounded-lg bg-muted p-3"
          >
            <Dot id={pid} tone="night" />
            <span>
              <span className="block text-caption text-muted-foreground">
                Protein
              </span>
              <span className="text-label">{p}</span>
            </span>
            <span className="mx-auto font-data text-h3 text-muted-foreground">
              +
            </span>
            <span className="text-right">
              <span className="block text-caption text-muted-foreground">
                Carbohydrate
              </span>
              <span className="text-label">{c}</span>
            </span>
            <Dot id={cid} tone="lit" />
          </li>
        ))}
      </ul>
    </Fig>
  )
}

/* ---------- Packing for kids club ---------- */

function PackList() {
  const items: [ObjectId, string, string][] = [
    ["water-bottle", "Water bottle", "With a label. We refill it."],
    ["sneaker", "Socks", "Kids play barefoot or in socks."],
    ["towel", "A change of clothes", "For spills and splash pad days."],
    ["heart-watch", "Allergy notes", "In the app, before you arrive."],
  ]
  return (
    <Fig
      label="Figure 1"
      title="The whole bag."
      summary="Pack a labeled water bottle, socks and a change of clothes. Add allergy notes in the app before you arrive."
    >
      <ul className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
        {items.map(([id, t, d]) => (
          <li key={t} className="flex items-center gap-4">
            <Dot id={id} tone="night" />
            <span className="min-w-0 flex-1">
              <span className="block text-label">{t}</span>
              <span className="block text-caption text-muted-foreground">
                {d}
              </span>
            </span>
            <span
              className={cn(
                "grid size-6 shrink-0 place-items-center rounded-md",
                fill.lit
              )}
            >
              <Check className="size-4" />
            </span>
          </li>
        ))}
      </ul>
    </Fig>
  )
}

function TwoHourBlock() {
  // A sample 9 am block. The note gives the length and the 15-minute release, not a start time.
  const start = 9 * 60
  return (
    <Fig
      label="Figure 2"
      title="A sample 2-hour block."
      summary="Inside a 2-hour kids club block: a 45-minute class, a 30-minute swim and 15 minutes to shower, with time to spare. A block nobody claims is released 15 minutes after it starts."
    >
      <DayBar
        start={start}
        end={start + 120}
        ticks={[start, start + 60, start + 120]}
        marks={[{ at: start + 15, label: "Unclaimed blocks released" }]}
        spans={[
          {
            from: start + 10,
            to: start + 55,
            label: "Your class",
            tone: "lit",
          },
          { from: start + 60, to: start + 90, label: "A swim", tone: "night" },
          { from: start + 90, to: start + 105, label: "Shower", tone: "pale" },
        ]}
      />
    </Fig>
  )
}

/* ---------- The rooftop deck ---------- */

function DeckWeek() {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
  return (
    <Fig
      label="Figure 1"
      title="Golden hour, Tuesday to Saturday."
      summary="Mobility 30 runs on the deck at golden hour from Tuesday to Saturday. The light is soft from about 5:30 pm. The deck closes at 8 pm."
    >
      <ol className="grid grid-cols-7 gap-1.5 sm:gap-2">
        {days.map((d, i) => {
          const on = i >= 1 && i <= 5
          return (
            <li key={d} className="flex flex-col items-center gap-2">
              <span className="text-caption text-muted-foreground">{d}</span>
              <span
                className={cn(
                  "grid h-24 w-full place-items-center rounded-md sm:h-28",
                  on ? fill.night : "bg-muted"
                )}
              >
                {on ? (
                  <GymObject id="sun" scheme="night" className="size-8" />
                ) : null}
              </span>
            </li>
          )
        })}
      </ol>
      <dl className="mt-5 flex flex-wrap gap-x-8 gap-y-2">
        <div>
          <dt className="text-caption text-muted-foreground">
            Soft light from
          </dt>
          <dd className="tabular font-data text-label font-bold">
            about 5:30 pm
          </dd>
        </div>
        <div>
          <dt className="text-caption text-muted-foreground">Deck closes</dt>
          <dd className="tabular font-data text-label font-bold">8 pm</dd>
        </div>
      </dl>
    </Fig>
  )
}

function DeckRules() {
  const rules: [ObjectId, string][] = [
    ["barbell", "No lifting on the deck"],
    ["heart-watch", "Phones away in class"],
    ["lift", "Step-free by lift or stairs"],
  ]
  return (
    <Fig
      label="Figure 2"
      title="Three things to know."
      summary="No lifting on the deck, phones stay away during class, and a lift and stairs reach the deck step-free from the lobby."
    >
      <ul className="grid gap-3 sm:grid-cols-3">
        {rules.map(([id, t]) => (
          <li
            key={t}
            className="flex items-center gap-3 rounded-lg bg-muted p-3 sm:flex-col sm:items-start"
          >
            <Dot id={id} tone="night" />
            <span className="text-label">{t}</span>
          </li>
        ))}
      </ul>
    </Fig>
  )
}

/* ---------- Pickleball in the heat ---------- */

function CourtHeat() {
  return (
    <Fig
      label="Figure 1"
      title="A summer morning on court."
      summary="From June to September the courts are comfortable before 9 am, warm until 11 am and hard work after that."
    >
      <DayBar
        start={6 * 60}
        end={13 * 60}
        ticks={[360, 540, 660, 780]}
        spans={[
          { from: 360, to: 540, label: "Comfortable", tone: "night" },
          { from: 540, to: 660, label: "Warm", tone: "pale" },
          { from: 660, to: 780, label: "Hard work", tone: "lit" },
        ]}
      />
    </Fig>
  )
}

function DrinkRhythm() {
  const games = [1, 2, 3, 4, 5, 6]
  return (
    <Fig
      label="Figure 2"
      title="A cup of water every two games."
      summary="Drink a cup of water after every second game, before you feel thirsty."
    >
      <ol className="flex flex-wrap items-center gap-2">
        {games.map((g) => (
          <li key={g} className="flex items-center gap-2">
            <span className="tabular grid h-11 min-w-20 place-items-center rounded-md bg-muted px-3 font-data text-label">
              Game {g}
            </span>
            {g % 2 === 0 ? <Dot id="water-bottle" tone="lit" /> : null}
          </li>
        ))}
      </ol>
    </Fig>
  )
}

/* ---------- The registry ---------- */

export const NOTE_FIGURES: Record<string, NoteFigure[]> = {
  "your-first-climb-cycle": [
    { after: 0, figure: ArriveEarly },
    { after: 1, figure: LoadScale },
  ],
  "a-week-back-after-surgery": [
    { after: 3, figure: OneLineLog },
    { after: 4, figure: WeekByWeek },
  ],
  "what-to-eat-before-a-6-am-class": [
    { after: 0, figure: SixAmMorning },
    { after: 3, figure: AfterPlates },
  ],
  "packing-for-kids-club": [
    { after: 1, figure: PackList },
    { after: 4, figure: TwoHourBlock },
  ],
  "heritage-rooftop-deck-open": [
    { after: 1, figure: DeckWeek },
    { after: 4, figure: DeckRules },
  ],
  "pickleball-in-the-heat": [
    { after: 0, figure: CourtHeat },
    { after: 1, figure: DrinkRhythm },
  ],
}
