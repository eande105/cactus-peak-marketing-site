import Link from "next/link"
import { LinkButton } from "@/components/brand/atoms"
import {
  BrandMark,
  CategoryTile,
  categoryObject,
  classObjects,
  GymObject,
  ObjectDefs,
  ObjectUse,
} from "@/components/brand/graphics"
import { IntensityRibs, RibMeter } from "@/components/brand/meters"
import { categoryRange } from "@/lib/catalog"
import { EFFORT, LEVEL_WORD } from "@/lib/labels"
import { classHref } from "@/lib/links"
import { fmtTime } from "@/lib/time"
import type { Category, ClassType, Slot } from "@/lib/types"
import { cn } from "@/lib/utils"
import { pickPaths, seeded } from "./class-pick-paths"
import { Container } from "./common"

// The underline every text link on this page uses: a quiet line under the words that darkens on hover.
const quietLink =
  "underline decoration-[color-mix(in_oklab,currentColor_40%,transparent)] decoration-from-font underline-offset-4 hover:decoration-current"

/** Class starts in one week, across every club. Each slot repeats on each of its days. */
function weeklyStarts(slots: Slot[]) {
  return slots.reduce((n, s) => n + s.days.length, 0)
}

/** Each object is drawn once as a symbol and copied into every disc, which keeps the page light. */
const PICK_DEFS = "pick"
/**
 * Where a disc may be picked, in discs from the schedule: within 3.4 discs of it, and no more than 2.2 discs above
 * it. From lg the copy sits about 4 discs to the left of the schedule; below lg it sits about 2.7 discs above it.
 * So no pick sits behind the copy at any width.
 */
const PICK_NEAR = ({ x, y }: { x: number; y: number }) =>
  Math.hypot(x, y) <= 3.4 && y >= -2.2
/** The focal circle's size, in disc diameters: a little larger than a disc, so it leads without crowding. */
const PICK_FOCAL = 1.5
/**
 * The paths, in disc diameters around the focal point. The area reaches every edge of the hero from the focal
 * point, up to a 1920 px window. The paths stop at a clear ring three quarters of a disc wide around the focal circle.
 */
const PICK_LAYOUT = pickPaths({
  width: 34,
  height: 26,
  seed: 480,
  sep: 1.55,
  spacing: 1.16,
  focus: PICK_FOCAL / 2 + 0.75,
  swirl: 18,
})

/** A disc's size at offset `y` (in discs from the focal point): one disc if it fits between the area's top and
 * bottom, else 0. */
const fit = (y: number) =>
  `min(var(--disc), max(0px, calc(min(var(--pick-down) - var(--disc) * ${(y + 0.5).toFixed(2)}, var(--pick-up) + var(--disc) * ${(y - 0.5).toFixed(2)}) * 1000)))`

/**
 * The Pick: a composition made for this hero. Classes, each as its object on a disc, follow paths that come in from
 * every edge of the hero, never cross, and all point at one focal circle. Each path is one interest, one type
 * of class, and its discs are that type's classes, repeated. On a path that comes near the schedule, one class is
 * picked (two on a long stretch): a Night disc at full strength, close to the schedule and never behind the copy,
 * from the brand's promoted classes (`picked`) where the type has one. The rest are pale and dimmed, passed over. The paths merge on the focal circle, a little larger than a disc: the schedule,
 * lit in Copper, the one lit tile a composition has (VISUAL-IDENTITY.md, section 4). It is not a class: it is the
 * week that the picked classes make, so the hero's claim, "a class for every kind of day", ends in a timetable. The
 * paths are not drawn: the discs alone show them. The objects stay upright.
 *
 * The component is the anchor box: the focal circle sits at its centre and the paths run out behind the rest of the
 * hero. No disc crosses the top or the bottom of the hero's upper block, and the window's sides crop the rest.
 * They sit under the hero's scrim, so they show dimmed behind the copy.
 *
 * The fit is pure CSS, so it is right in the server HTML and the Pick shows with the copy, before any JavaScript.
 * The component is a size container that fills the hero's upper block from top to bottom. `--pick-down` is the
 * distance from the focal point to the block's bottom, and `--pick-up` to its top, in container units. Each disc
 * knows its own offset, so its size is a calc: the full disc when it fits between the two, 0 when it would cross.
 * The composition is decorative.
 */
function ClassPick({
  classTypes,
  picked,
  tags,
  className,
}: {
  classTypes: ClassType[]
  picked: string[]
  /** Two short facts about the week, pinned above and below the schedule. Decorative: the hero says them too. */
  tags?: [string, string]
  className?: string
}) {
  const { discs, paths } = PICK_LAYOUT
  const rand = seeded(7)
  const objectOf = (c: ClassType) =>
    classObjects[c.slug] ?? categoryObject[c.category]
  const types = [...new Set(classTypes.map((c) => c.category))]
  // The paths take the types in turn, from a seeded start, so neighbouring paths differ.
  const start = Math.floor(rand() * types.length)

  const cells = Array.from({ length: paths }, (_, path) => {
    const on = discs.flatMap((d, i) => (d.path === path ? [i] : []))
    const pool = classTypes.filter(
      (c) => c.category === types[(start + path) % types.length]
    )
    const promoted = pool.filter((c) => picked.includes(c.slug))
    // Picks sit only near the schedule (PICK_NEAR), so the chosen classes gather where the paths meet and never
    // sit behind the copy. One pick on a path with a disc there, two when it has six or more, never side by side.
    const near = on.filter((i) => PICK_NEAR(discs[i]))
    const count = near.length >= 6 ? 2 : near.length ? 1 : 0
    const chosen = new Set<number>()
    for (let tries = 0; chosen.size < count && tries < 20; tries++) {
      const i = near[Math.floor(rand() * near.length)]
      if ([...chosen].every((j) => Math.abs(on.indexOf(j) - on.indexOf(i)) > 2))
        chosen.add(i)
    }
    let n = Math.floor(rand() * pool.length)
    return on.map((i) => {
      const pick = chosen.has(i)
      const c = pick
        ? (promoted[n % Math.max(promoted.length, 1)] ?? pool[n % pool.length])
        : pool[n++ % pool.length]
      return { ...discs[i], c, pick, key: `${path}-${i}` }
    })
  }).flat()

  return (
    <div
      aria-hidden="true"
      className={cn("[container-type:size] pointer-events-none", className)}
      style={{ "--disc": "clamp(3.5rem, 7vw, 6rem)" } as React.CSSProperties}
    >
      <ObjectDefs ids={classTypes.map(objectOf)} prefix={PICK_DEFS} />
      {/* A box of no size at the focal point. Each disc sits at its path position, in disc diameters from here.
          The discs sit under the hero's scrims (-z-20 against their -z-10). */}
      <div className="absolute top-[calc(100%-var(--pick-down))] left-1/2 -z-20 size-0">
        <span
          className="absolute grid size-[calc(var(--disc)*var(--focal))] -translate-1/2 place-items-center rounded-full bg-[var(--cat-strength)]"
          style={{ "--focal": PICK_FOCAL } as React.CSSProperties}
        >
          <BrandMark scheme="copper" className="size-[56%]" />
        </span>
        {cells.map(({ x, y, c, pick, key }) => (
          <span
            key={key}
            className={cn(
              "absolute grid -translate-1/2 place-items-center rounded-full",
              pick ? "bg-night" : "bg-muted opacity-45"
            )}
            style={{
              left: `calc(var(--disc) * ${x.toFixed(2)})`,
              top: `calc(var(--disc) * ${y.toFixed(2)})`,
              // Room left below the disc and above it; the smaller one, scaled far up and kept between 0 and one
              // disc, sets the size. A disc that would cross an edge gets a negative room, so it has no size.
              width: fit(y),
              height: fit(y),
            }}
          >
            <ObjectUse
              id={objectOf(c)}
              prefix={PICK_DEFS}
              scheme={pick ? "night" : "sand"}
              className="size-[56%]"
            />
          </span>
        ))}
        {/* The tags sit in the clear ring round the schedule, where no path runs. They come after the discs, so where
            the ring is narrower than a tag (on a phone) the tag stays on top. */}
        {tags?.map((t, i) => (
          <span
            key={t}
            className={cn(
              "absolute left-0 -translate-x-1/2 rounded-full bg-card px-2.5 py-1 text-caption font-semibold whitespace-nowrap tabular-nums edge ring-border sm:px-3.5 sm:py-1.5 sm:text-label",
              i === 0
                ? "top-[calc(var(--disc)*-0.75-0.5rem)] -translate-y-full"
                : "top-[calc(var(--disc)*0.75+0.5rem)]"
            )}
          >
            {t}
          </span>
        ))}
      </div>
    </div>
  )
}

/**
 * The classes hero: the claim and the two first steps, over the Pick, which fills the whole hero past the 1200 px
 * column. From lg the Pick's anchor is the right half of the hero, and a scrim in the page colour dims it behind the
 * copy at the left. Below lg the anchor is a band under the copy, and the scrim dims the grid above the band. The
 * size of the timetable is pinned to the schedule itself, as two tags in the clear ring round it, so the week shows
 * before the visitor scrolls without a facts row.
 *
 * The Pick fills the hero from the header to the bottom rule. Nothing in the hero has a surface of its own except
 * the two tags: a scrim in the page colour dims the Pick behind the copy.
 */
export function ClassesOverviewHero({
  classTypes,
  categories,
  slots,
  promoted,
}: {
  classTypes: ClassType[]
  categories: Category[]
  slots: Slot[]
  /** The brand's promoted classes, shown at full strength in the Pick. */
  promoted: string[]
}) {
  const first = fmtTime(Math.min(...slots.map((s) => s.start)))
  const week = weeklyStarts(slots)
  return (
    <section
      aria-labelledby="classes-hero-title"
      className="relative isolate rule-b"
    >
      {/* The Pick's area: no disc crosses its top or bottom (the Pick fits them in CSS), and overflow-hidden crops
          the discs that run past the sides of the window. */}
      <div className="relative overflow-hidden lg:h-[clamp(32rem,calc(100svh-12rem),40rem)]">
        {/* The scrim: the page colour over the grid behind the copy. Below lg it covers all but the band at the
            bottom; from lg it fades out from the copy to the middle of the screen. */}
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-linear-to-b from-background/85 from-[calc(100%-16rem)] to-background/0 to-[calc(100%-12rem)] lg:bg-linear-to-r lg:from-background/85 lg:from-[34%] lg:via-background/70 lg:via-[46%] lg:to-background/0 lg:to-[60%]"
        />
        <Container className="flex h-full flex-col justify-center pt-12 lg:pt-0">
          {/* From lg the copy keeps to the left 44% or so, so the Pick's anchor has clear space beside it. The hero
              size steps down there (the display class wins over utilities, so it takes !important). */}
          <div className="lg:max-w-[min(44vw,34rem)]">
            <h1
              id="classes-hero-title"
              className="display-hero display-hero-narrow max-w-[11ch]"
            >
              A class for every kind of day.
            </h1>
            <p className="lede mt-5 max-w-[34ch] text-pretty text-muted-foreground lg:mt-6">
              {classTypes.length} classes, from a slow stretch to all-out
              intervals, in {categories.length} types at five clubs in Mesa and
              Gilbert.
              <span className="sr-only">
                {" "}
                {week} classes a week, the first at {first}.
              </span>
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <LinkButton href="/tour" size="lg" className="max-sm:flex-1">
                Book a free tour
              </LinkButton>
              <LinkButton
                href="#schedule"
                variant="outline"
                size="lg"
                className="max-sm:flex-1"
              >
                Find a class
              </LinkButton>
            </div>
          </div>
        </Container>
        <ClassPick
          classTypes={classTypes}
          picked={promoted}
          tags={[`${week} classes a week`, `First at ${first}`]}
          className="absolute inset-0 [--pick-down:8rem] [--pick-up:calc(100cqh-8rem)] sm:[--pick-down:10rem] sm:[--pick-up:calc(100cqh-10rem)] lg:left-1/2 lg:[--pick-down:50cqh] lg:[--pick-up:50cqh]"
        />
        {/* Below lg the focal point sits in this band under the copy, 8rem (10rem from sm) above the hero's foot. */}
        <div
          aria-hidden="true"
          className="mt-6 h-[16rem] sm:h-[20rem] lg:hidden"
        />
      </div>
    </section>
  )
}

/**
 * One class on one line: its object, its name as a link, and a meter for how hard it gets. The meter's words are
 * read out but not shown, so the line stays short. The type cards and the day-part cards both list classes this way.
 */
function ClassLine({ c, blurb }: { c: ClassType; blurb?: boolean }) {
  return (
    <li
      className={cn("flex gap-3 py-1", blurb ? "items-start" : "items-center")}
    >
      <GymObject
        id={classObjects[c.slug] ?? categoryObject[c.category]}
        className="size-6 shrink-0"
      />
      <div className="min-w-0 flex-1">
        <Link href={classHref(c)} className={cn("text-body", quietLink)}>
          {c.name}
        </Link>
        {/* The one line a visitor needs to tell the classes of a type apart, so most never open the type page. */}
        {blurb ? (
          <p className="mt-0.5 text-caption text-pretty text-muted-foreground">
            {c.blurb}
          </p>
        ) : null}
      </div>
      <IntensityRibs
        level={c.intensity}
        categoryId={c.category}
        showLabel={false}
        className={blurb ? "mt-1" : undefined}
      />
    </li>
  )
}

/**
 * The eight types as a first choice. Each card keeps to what tells the types apart: the type's object, its name
 * and line, how hard its classes get, and its classes as a short list of names. Each class gets its one-line blurb here.
 * A class name and the card's button both open the type page, where the full facts wait. The
 * category Tile is the one place category colour is allowed (VISUAL-IDENTITY.md, section 5).
 */
export function ClassesByType({
  categories,
  classTypes,
  className,
}: {
  categories: Category[]
  classTypes: ClassType[]
  className?: string
}) {
  return (
    <ul
      className={cn(
        "grid gap-4 sm:grid-cols-2 lg:gap-6 xl:grid-cols-4",
        className
      )}
    >
      {categories.map((cat) => {
        const list = classTypes.filter((c) => c.category === cat.id)
        return (
          <li
            key={cat.id}
            className="flex flex-col rounded-lg bg-card p-5 edge ring-border"
          >
            {/* Below sm the object sits beside the name, so eight cards stay short on a phone. */}
            <div className="grid grid-cols-[3rem_minmax(0,1fr)] gap-x-4 sm:mb-5 sm:flex sm:flex-col">
              <CategoryTile
                category={cat.id}
                cut
                className="row-span-2 size-12 sm:size-14"
              />
              <h3 className="font-display-wide text-h3 sm:mt-5">{cat.name}</h3>
              <p className="mt-1 text-body text-pretty text-muted-foreground">
                {cat.tagline}
              </p>
            </div>
            {/* The difficulty summary for the whole type. */}
            <div className="mt-4 pt-4 rule-t">
              <IntensityRibs
                level={categoryRange(list, cat.intensity)}
                categoryId={cat.id}
              />
            </div>
            {/* On a phone the eight cards keep to one line of class names, so the schedule stays close to the
                top. The full list with blurbs is one tap away in "Class details". */}
            <p className="mt-3 mb-5 text-body text-pretty text-muted-foreground sm:hidden">
              {list.map((c) => c.name).join(", ")}
            </p>
            <ul className="mt-3 mb-5 grid gap-1 max-sm:hidden">
              {list.map((c) => (
                <ClassLine key={c.slug} c={c} blurb />
              ))}
            </ul>
            {/* mt-auto keeps the button at the foot of every card in a row, whatever the length of the list. The
                button opens the type's own page, as a club card opens its club page. */}
            <LinkButton
              href={`#type-${cat.id}`}
              variant="outline"
              className="mt-auto w-full"
            >
              Explore {cat.name}
            </LinkButton>
          </li>
        )
      })}
    </ul>
  )
}

// Shared with the schedule, so the key reads the same on every page.
export const effort = EFFORT

/**
 * The key to the effort meters on the type cards: what each of the five levels feels like. It sits above the
 * cards in the same section, so a visitor reads the scale once and then reads every meter by it. It is a Night
 * panel (VISUAL-IDENTITY.md, section 5), which sets it apart as a key and not a third list of classes. Inside it,
 * the meter's ink and outline tokens point at Sand, so the neutral meter reads on Night.
 */
export function EffortKey({ className }: { className?: string }) {
  const levels = [1, 2, 3, 4, 5] as const
  return (
    <section
      aria-labelledby="effort-key-title"
      className={cn(
        "grid gap-x-6 gap-y-6 rounded-lg bg-night p-5 text-night-foreground [--border-strong:color-mix(in_oklab,var(--night-foreground)_45%,transparent)] [--foreground:var(--night-foreground)] sm:p-6 lg:grid-cols-12 lg:p-8",
        className
      )}
    >
      <div className="lg:col-span-3">
        <h3 id="effort-key-title" className="display-quiet">
          How hard is it?
        </h3>
        <p className="mt-2 text-body text-pretty text-night-muted">
          New to classes? Start at 2 or 3.
        </p>
        {/* One worked range, so the outlined ribs on the cards read as "can go up to". */}
        <p className="mt-4 flex items-center gap-3 text-caption">
          <RibMeter
            value={4}
            from={2}
            tone="neutral"
            size="md"
            profile="flat"
            label="Intensity"
            valueText="Light to hard, 2 to 4 of 5"
            decorative
          />
          <span className="text-pretty">
            A range: solid to the least, outlined to the most.
          </span>
        </p>
      </div>
      <ol className="grid gap-4 sm:grid-cols-5 sm:gap-6 lg:col-span-9">
        {levels.map((n) => (
          <li
            key={n}
            className="flex items-center gap-4 sm:flex-col sm:items-start sm:gap-3"
          >
            <RibMeter
              value={n}
              tone="neutral"
              size="md"
              profile="flat"
              label="Intensity"
              valueText={`${LEVEL_WORD[n]}, ${n} of 5`}
              decorative
            />
            <div>
              <p className="text-body-strong">
                <span className="tabular-nums">{n}</span> {LEVEL_WORD[n]}
              </p>
              <p className="text-caption text-pretty text-night-muted">
                {effort[n]}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}

const firstSteps = [
  {
    title: "Pick a class marked good for a first class.",
    text: "These classes teach the moves as they go, so you do not need to know them first.",
  },
  {
    title: "Book a spot.",
    text: "Members book in the app, 7 days ahead (Summit: 9). With a free pass, book at the front desk or call the club. Cancel free up to 2 hours before.",
  },
  {
    title: "Come 10 minutes early.",
    text: "Tell the coach it is your first class. The coach sets up your space and checks in during class.",
  },
]

/**
 * For the visitor who has not taken a class here: the classes coaches pick for a first visit, each with
 * the line that says who it suits, beside the three steps of a first class. A class that the data does not
 * mark as good for first-timers is left out, so the list never contradicts the class page.
 */
export function ClassesFirstVisit({
  picks,
  className,
}: {
  picks: ClassType[]
  className?: string
}) {
  const list = picks.filter((c) => c.firstTimer && c.bookable)
  return (
    // From xl the picks take 8 of 12 columns and the steps the other 4, so each pitch stays on one line beside the
    // facts while the steps stay in view at the right. Below xl that leaves too little room, so the steps move under
    // the list, three across from md.
    <div className={cn("grid gap-12 xl:grid-cols-12 xl:gap-x-10", className)}>
      <ul className="rule-t xl:col-span-8">
        {list.map((c) => (
          <li
            key={c.slug}
            className="group relative grid gap-x-6 gap-y-3 py-5 rule-b sm:grid-cols-[minmax(0,1fr)_15.5rem] sm:items-center"
          >
            <div className="flex min-w-0 items-start gap-4">
              <CategoryTile
                category={c.category}
                className="mt-0.5 size-8 shrink-0"
              />
              <div className="min-w-0">
                <h3 className="font-display-wide text-h3">
                  {/* The name is the one link. Its ::after covers the row, so the row is one target. */}
                  <Link
                    href={classHref(c)}
                    className="no-underline underline-offset-4 group-hover:underline after:absolute after:inset-0"
                  >
                    {c.name}
                  </Link>
                </h3>
                <p className="mt-1 text-body text-pretty text-muted-foreground">
                  {c.pick}
                </p>
              </div>
            </div>
            {/* The two facts a first class turns on, one to a row: a quiet label, then the value in a column of
                its own, so the values line up down the list. From sm a rule sets them apart from the pitch. */}
            <dl className="grid grid-cols-[3.5rem_minmax(0,1fr)] items-center gap-x-3 gap-y-1.5 max-sm:pl-12 sm:pl-6 sm:rule-l">
              <dt className="text-caption text-muted-foreground">Length</dt>
              <dd className="text-caption font-medium tabular-nums">
                {c.duration} min
              </dd>
              <dt className="text-caption text-muted-foreground">Effort</dt>
              <dd className="text-caption whitespace-nowrap">
                <IntensityRibs level={c.intensity} categoryId={c.category} />
              </dd>
            </dl>
          </li>
        ))}
      </ul>

      <div className="xl:col-span-4">
        <ol className="grid gap-6 md:max-xl:grid-cols-3">
          {firstSteps.map((s, i) => (
            <li key={s.title} className="flex gap-4">
              <span
                aria-hidden="true"
                className="grid size-8 shrink-0 place-items-center rounded-full text-label tabular-nums edge ring-border-strong"
              >
                {i + 1}
              </span>
              <div>
                <p className="text-body-strong">{s.title}</p>
                <p className="mt-1 text-body text-pretty text-muted-foreground">
                  {s.text}
                </p>
              </div>
            </li>
          ))}
        </ol>
        <LinkButton href="/trial" variant="outline" className="mt-8">
          Try a class with a free 3-day pass
        </LinkButton>
      </div>
    </div>
  )
}
