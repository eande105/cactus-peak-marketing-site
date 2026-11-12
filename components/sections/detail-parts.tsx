import Link from "next/link"
import { TextLink } from "@/components/brand/atoms"
import {
  categoryObject,
  coachObjects,
  GymObject,
  ObjectCrop,
  type ObjectId,
} from "@/components/brand/graphics"
import { IntensityRibs } from "@/components/brand/meters"
import { ArrowRight } from "@/components/icons"
import { classHref } from "@/lib/links"
import type { ClassType, Job } from "@/lib/types"
import { cn } from "@/lib/utils"
import { DEPT_OBJECT, payEnds } from "./about-heroes"
import { nightFill } from "./program-page"

/*
 * The parts of the About section's detail pages: one role (`/careers/<slug>`) and one note (`/journal/<slug>`).
 * They follow the hero pictures in about-heroes.tsx: Night parts, one lit part in Copper, and an `aria-label` that
 * says what the picture shows.
 */

/** How hiring goes, on the careers page and on each role's page. */
export const HIRE_STEPS: { title: string; text?: string; icon: ObjectId }[] = [
  { title: "Pick a role and apply.", icon: "clipboard" },
  { title: "A phone chat with the club's manager.", icon: "heart-watch" },
  { title: "Visit a club and try the work.", icon: "gym-bag" },
  { title: "A written offer within 3 business days.", icon: "whistle" },
]

/**
 * The posting line under a role's title, in place of a facts panel: a few short label-and-value pairs on one row,
 * split by hairlines. On a phone the pairs sit in two columns.
 */
export function PostingLine({
  items,
}: {
  /** Label, value, and an optional second line (a club's city). */
  items: [string, string, string?][]
}) {
  return (
    <dl className="grid grid-cols-2 gap-x-l gap-y-m sm:flex sm:flex-nowrap sm:gap-x-zero">
      {items.map(([label, value, sub], i) => (
        <div
          key={label}
          className={cn(
            "min-w-0 sm:px-l sm:first:pl-zero",
            i > 0 && "sm:rule-l",
            // A long value (a schedule) takes the whole row on a phone and the spare width on a wider screen.
            value.length > 24 && "max-sm:col-span-2 sm:flex-1"
          )}
        >
          <dt className="text-body-s text-muted-foreground">{label}</dt>
          <dd className="text-body-s text-pretty font-heavy">
            {value}
            {sub ? (
              <span className="block text-body-s font-regular text-muted-foreground">
                {sub}
              </span>
            ) : null}
          </dd>
        </div>
      ))}
    </dl>
  )
}

/**
 * The Role: the department's object cropped large on Night, then the role's pay as a lit span on one line that
 * runs from the lowest to the highest rate of all open roles, so a reader sees where this role sits.
 */
export function RolePay({
  job,
  low,
  high,
}: {
  job: Job
  low: number
  high: number
}) {
  const ends = payEnds(job.pay)
  const span = Math.max(1, high - low)
  const at = (v: number) => `${((v - low) / span) * 100}%`
  return (
    <div
      role="img"
      aria-label={`${job.title}: ${job.pay}. Open roles pay from $${low} to $${high} an hour.`}
      className={cn(
        "overflow-hidden corner-xl lg:grid lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:items-center",
        nightFill
      )}
    >
      <ObjectCrop
        id={DEPT_OBJECT[job.dept] ?? "whistle"}
        ratio="16/9"
        scheme="night"
        scale={0.55}
        x={0.55}
        y={0.2}
        className="block w-full"
      />
      {ends ? (
        <div aria-hidden="true" className="p-l sm:p-xl lg:p-xxl">
          <p className="text-body-s text-night-muted">Pay</p>
          <p className="mt-xxs flex items-baseline gap-xs">
            <span className="tabular font-data text-body-xxl font-heavy sm:text-display-m">
              ${ends[0]}–${ends[1]}
            </span>
            <span className="text-body-m text-night-muted">an hour</span>
          </p>
          <div className="relative mt-l h-3 corner-full fill-quiet">
            <div
              className="absolute inset-y-0 corner-full bg-[var(--cat-strength)]"
              style={{
                left: at(ends[0]),
                right: `calc(100% - ${at(ends[1])})`,
              }}
            />
          </div>
          <div className="tabular mt-xs flex justify-between gap-m text-body-s text-night-muted">
            <span>${low}</span>
            <span>Pay across open roles</span>
            <span>${high}</span>
          </div>
        </div>
      ) : null}
    </div>
  )
}

/**
 * The note's reading line, under its picture, in place of a facts panel: the date, a hairline, then one mark for
 * each part with the part count and read time. The marks are links to the parts, so a short note needs no outline.
 * The marks borrow the intensity ribs' form.
 */
export function ReadingLine({
  date,
  iso,
  min,
  parts,
}: {
  date: string
  iso: string
  min: number
  parts: string[]
}) {
  return (
    <div
      className={cn(
        "flex max-w-5xl flex-wrap items-center gap-x-l gap-y-xs",
        "mx-auto mt-l",
        "text-body-s",
        "text-muted-foreground"
      )}
    >
      <p>
        Published <time dateTime={iso}>{date}</time>
      </p>
      <span aria-hidden="true" className="h-px min-w-8 flex-1 bg-border" />
      <nav aria-label="Parts of this note" className="flex items-center">
        {parts.map((h, i) => (
          <a
            key={h}
            href={`#s${i + 1}`}
            title={h}
            className="group flex min-h-11 w-7 flex-col items-center justify-center gap-xxs no-underline"
          >
            <span className="sr-only">
              Part {i + 1}: {h}
            </span>
            <span
              aria-hidden="true"
              className="h-4 w-1.5 corner-full bg-foreground transition-colors group-hover:bg-[var(--cat-strength)]"
            />
            <span
              aria-hidden="true"
              className="tabular text-body-s leading-none text-muted-foreground group-hover:text-foreground"
            >
              {i + 1}
            </span>
          </a>
        ))}
      </nav>
      <p className="tabular">
        {parts.length} parts · {min} min read
      </p>
    </div>
  )
}

/*
 * The two cards inside a note: the class the note is about and the coach who wrote it. They share one form: a
 * rounded picture tile at the left, inset by the card's padding like the pictures in the class and Journal cards,
 * then a small eyebrow, the name in the display face and one line of detail. No category bar on the edge: inside an
 * article the card sits in running text, and the tile already carries the category's colour.
 */

/** The class the note is about. The whole card is the link, and the arrow says where it goes. */
export function NoteClass({ ct }: { ct: ClassType }) {
  return (
    <Link
      href={classHref(ct)}
      className="group flex items-center gap-m corner-m bg-card p-s pr-l no-underline hairline ring-border transition-[box-shadow] hover:ring-border-strong sm:gap-l"
    >
      <div className="w-20 shrink-0 sm:w-24">
        <ObjectCrop
          id={categoryObject[ct.category]}
          scheme={{ category: ct.category }}
          scale={0.62}
          x={0.42}
          y={0.22}
          className="corner-xs"
        />
      </div>
      <span className="min-w-0 flex-1">
        <span className="block text-body-s text-muted-foreground">
          The class in this note
        </span>
        <span className="font-display-wide mt-xxs block text-body-l text-balance font-medium">
          {ct.name}
        </span>
        <span
          className={cn(
            "flex flex-wrap items-center gap-x-s gap-y-xxs",
            "mt-xs",
            "text-body-s",
            "text-muted-foreground"
          )}
        >
          <span className="tabular">
            {ct.categoryName} · {ct.duration} min
          </span>
          <IntensityRibs
            level={ct.intensity}
            categoryId={ct.category}
            showLabel={false}
          />
        </span>
      </span>
      <ArrowRight
        aria-hidden="true"
        className="size-5 shrink-0 text-link transition-transform group-hover:translate-x-0.5"
      />
    </Link>
  )
}

/** The coach who wrote the note: their object on a Night tile, then the name, credential and profile link. */
export function NoteAuthor({
  author,
}: {
  author: { name: string; slug: string; credential: string; profile: boolean }
}) {
  return (
    <div className="flex items-center gap-m corner-m bg-card p-s pr-l hairline ring-border sm:gap-l">
      <span
        aria-hidden="true"
        className={cn(
          "grid aspect-square w-20 shrink-0 place-items-center",
          "corner-xs",
          "bg-night",
          "sm:w-24"
        )}
      >
        <GymObject
          id={coachObjects[author.slug] ?? "whistle"}
          scheme="night"
          className="size-[50%]"
        />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-body-s text-muted-foreground">Written by</p>
        <p className="font-display-wide mt-xxs text-body-l font-medium">
          {author.name}
        </p>
        {author.credential ? (
          <p className="mt-xxs text-body-s text-muted-foreground">
            {author.credential}
          </p>
        ) : null}
        {author.profile ? (
          <TextLink href={`/coaches/${author.slug}`} className="-mb-xs">
            Coach profile
          </TextLink>
        ) : null}
      </div>
    </div>
  )
}
