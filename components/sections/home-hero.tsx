import { LinkButton } from "@/components/brand/atoms"
import {
  GymObject,
  type ObjectId,
  ObjectRack,
} from "@/components/brand/graphics"
import { cn } from "@/lib/utils"

// The ascent steps up to the lit squat rack. The pool, courts and recovery objects fill the lists with
// the gym floor, so the way up runs through everything the clubs offer.
const climbIds: readonly ObjectId[] = [
  "water-bottle",
  "jump-rope",
  "kettlebell",
  "barbell",
  "dumbbell",
  "wave",
  "paddle",
  "spa-stones",
  "spin-bike",
  "mat",
  "towel",
  "sneaker",
]

function Climb({ ratio }: { ratio: string }) {
  return (
    <ObjectRack
      ratio={ratio}
      layout="ascent"
      scheme="night"
      ids={climbIds}
      focus="squat-rack"
      fill
    />
  )
}

// One composition for each box shape, with the ratio of each band's midpoint (4:5, 1:1, 5:4, 3:2, 16:9,
// 2:1). Each shows only while the box is nearest its ratio. The bands do not overlap: each includes its
// lower edge and leaves out its upper one.
const arts = [
  { ratio: "4/5", show: "[@container(aspect-ratio>=9/10)]:hidden" },
  {
    ratio: "1/1",
    show: "hidden [@container(aspect-ratio>=9/10)_and_(aspect-ratio<9/8)]:block",
  },
  {
    ratio: "5/4",
    show: "hidden [@container(aspect-ratio>=9/8)_and_(aspect-ratio<11/8)]:block",
  },
  {
    ratio: "3/2",
    show: "hidden [@container(aspect-ratio>=11/8)_and_(aspect-ratio<5/3)]:block",
  },
  {
    ratio: "16/9",
    show: "hidden [@container(aspect-ratio>=5/3)_and_(aspect-ratio<19/10)]:block",
  },
  { ratio: "2/1", show: "hidden [@container(aspect-ratio>=19/10)]:block" },
]

// Three facts that answer "what is it, and what does it cost to start". Each one is on the page below
// (the club finder, the class index and the plans band). Each takes the brand object for its subject: the
// squat rack for the clubs (the object the ascent climbs to), the schedule for the classes and the calendar for month to month (the membership perks
// use the calendar and the schedule too).
const facts: { icon: ObjectId; title: string; line: string }[] = [
  { icon: "squat-rack", title: "Five clubs", line: "Mesa and Gilbert" },
  { icon: "schedule", title: "28 classes", line: "In eight types" },
  {
    icon: "calendar",
    title: "Month to month",
    line: "$0 enrollment through Nov 30",
  },
]

// The hero is the widest panel: 85% of the screen, and never narrower than the shared panel minimum, so
// on a large screen it does not read as a strip. Its copy and facts take a wider column than the page:
// the inset grows with the screen, so the copy sits well inside the panel and spans more than 1200 px.
const heroFrame = "mx-auto w-full max-w-[max(85vw,1352px)] px-xs sm:px-s"
const heroContent =
  "w-full px-l sm:px-xxl lg:px-xxl xl:px-section min-[100rem]:px-section-l"

/**
 * The Home hero is one inset Night panel that fills the first screen (references: the Superpower and
 * Function heroes on Mobbin). The headline, the line and two actions sit in the empty upper left. The
 * ascent rises beside them to the lit squat rack, and a row of three facts closes the panel.
 * The brand keeps its own rules: a Night field, objects instead of a photo, and one copper action
 * (VISUAL-IDENTITY.md, section 8).
 *
 * The section is the height of the first screen less the header and a 3rem strip of the Sand page, so
 * the panel reads as a card on the page and the clubs section continues below it at the fold. The
 * drawing is sliced to cover its box, so the ascent never stretches. Below lg the copy, the ascent and the
 * facts stack, and on a short screen they do not fit, so the first screen is the least height and the
 * section grows to its content. The facts are never clipped. The tour panel at the foot of the page has the
 * page column's content width; the hero is wider, as the page's opening.
 */
export function HomeHero() {
  return (
    <section
      aria-labelledby="home-hero-title"
      className={cn(
        heroFrame,
        // A minimum height only: on a short laptop window the hero grows to fit its actions instead of overlapping the facts.
        "flex min-h-[min(60rem,max(38rem,calc(100svh-4rem-3rem)))] flex-col py-xs max-lg:min-h-[max(38rem,calc(100svh-4rem-3rem))] sm:py-s"
      )}
    >
      <div
        className={cn(
          "relative flex flex-1 flex-col overflow-hidden",
          "corner-xl",
          "bg-night text-night-foreground",
          "lg:grid lg:grid-rows-[minmax(min-content,1fr)_auto]"
        )}
      >
        {/* Below lg the ascent takes the space between the copy and the facts. From lg it fills the right of
            the first grid row: the lists start low beside the actions and the headline runs over its empty
            top. Decorative: the headline names the page.
            The box is a size container, and the ascent is composed for the ratio nearest the box, so the slice
            crops little and the lit squat rack at the top right always shows. The panel width no longer
            follows the screen, so the screen's own ratio cannot pick the composition. */}
        <div className="[container-type:size] relative order-2 min-h-40 flex-1 lg:col-start-1 lg:row-start-1 lg:ml-[42%]">
          {arts.map((a) => (
            <div key={a.ratio} className={cn("absolute inset-0", a.show)}>
              <Climb ratio={a.ratio} />
            </div>
          ))}
        </div>

        <div
          className={cn(
            heroContent,
            "relative z-10 order-1",
            "pt-xl",
            "sm:pt-xxl lg:col-start-1 lg:row-start-1 lg:self-start lg:pt-section"
          )}
        >
          <h1 id="home-hero-title" className="display-hero max-w-[14ch]">
            Climb at your own pace.
          </h1>
          {/* The line and the actions keep to the left column, clear of the lists. */}
          <div className="lg:max-w-[38%]">
            <p className="lede mt-l max-w-[34ch] text-pretty text-night-muted lg:mt-l">
              Pools, courts, classes and recovery at 5 clubs. Take the first
              step with a free tour. Move up when you are ready.
            </p>
            <div className="mt-xl flex flex-wrap items-center gap-s">
              <LinkButton href="/tour" size="lg" className="max-sm:flex-1">
                Book a free tour
              </LinkButton>
              <LinkButton
                href="/trial"
                variant="ghost"
                size="lg"
                className="bg-night-fill text-night-foreground hover:bg-night-fill-strong max-sm:flex-1"
              >
                Try a free 3-day pass
              </LinkButton>
            </div>
          </div>
        </div>

        {/* The facts are three equal panels across the foot of the card, each with the same inset, so the
            first does not sit further in than the others. Below sm each is the object over the title; from
            sm the object sits beside a heading-size title and its line. */}
        <ul className="relative order-3 grid grid-cols-3 rule-t rule-night lg:row-start-2">
          {facts.map((f) => (
            <li
              key={f.title}
              className={cn(
                "flex flex-col gap-s",
                "px-m py-m",
                "not-first:rule-l not-first:rule-night",
                "sm:flex-row sm:items-center sm:gap-m sm:px-l sm:py-l",
                "lg:px-xl lg:py-xl"
              )}
            >
              <GymObject
                id={f.icon}
                scheme="night"
                className="size-8 shrink-0 sm:size-12 lg:size-14"
              />
              <div className="min-w-0">
                <p className="font-display-wide text-body-s sm:text-body-l xl:text-body-xxl font-heavy sm:font-medium xl:font-heavy">
                  {f.title}
                </p>
                <p className="text-body-m text-pretty text-night-muted max-sm:hidden xl:text-body-l">
                  {f.line}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
