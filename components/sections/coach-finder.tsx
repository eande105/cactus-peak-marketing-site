"use client"

import { useState } from "react"
import { LinkButton, TextLink } from "@/components/brand/atoms"
import { ClubPin } from "@/components/brand/club-pin"
import {
  type CategoryId,
  CategoryTile,
  coachObjects,
  GymObject,
  ObjectCrop,
  type ObjectId,
} from "@/components/brand/graphics"
import { Toggle, ToggleGroup } from "@/components/graphical"
import { useCatalog } from "@/components/site/catalog-context"
import { initials } from "@/lib/catalog"
import type { Coach } from "@/lib/types"
import { cn } from "@/lib/utils"
import { FilterBar, ResultCount, SortSelect } from "./filter-bar"

/** A goal a visitor brings, tied to the coach specialty that answers it. `title` is the short filter label. */
export type CoachGoal = {
  specialty: string
  title: string
  icon: ObjectId
}

/** The coach specialties that are class categories. Their chips carry the category Tile, in its colour. */
const SPECIALTY_CATEGORY: Record<string, CategoryId> = {
  Strength: "strength",
  Cycle: "cycle",
  Conditioning: "conditioning",
  "Mind & Body": "mind-body",
  Aqua: "aqua",
  Court: "court",
  Recovery: "recovery",
  Youth: "youth",
}

/** The object for a specialty that is not a class category. */
const SPECIALTY_OBJECT: Record<string, ObjectId> = {
  "Return to training": "resistance-band",
  Mobility: "resistance-band",
  Running: "sneaker",
  "Olympic lifting": "barbell",
  "Swim technique": "pool",
  "Masters swim": "pool",
}

/**
 * The coach mark (VISUAL-IDENTITY.md, section 2: the coach fallback): the initials large on a brand field, with
 * the coach's own object cropped at the edge. The lit card is Copper; the rest are Night. The years sit on the
 * mark as a tag, because experience is the first thing visitors compare.
 */
function CoachMark({ coach, lit }: { coach: Coach; lit: boolean }) {
  const object = coachObjects[coach.slug] ?? "whistle"
  return (
    <div
      className={cn(
        "relative isolate aspect-[16/7] overflow-hidden",
        lit ? "text-[var(--neutral-1)]" : "text-night-foreground"
      )}
    >
      <ObjectCrop
        id={object}
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
        {initials(coach.name)}
      </span>
      {coach.years ? (
        <span
          className={cn(
            "absolute bottom-4 left-5 rounded-sm px-2 py-0.5 text-label tabular-nums",
            lit
              ? "bg-night text-night-foreground"
              : "bg-[var(--cat-strength)] text-[var(--neutral-1)]"
          )}
        >
          {coach.years} years coaching
        </span>
      ) : null}
    </div>
  )
}

/**
 * A specialty's mark: the category Tile in colour when the specialty is a class category (category colour only
 * beside a category name, VISUAL-IDENTITY.md section 5), and the plain object on a disc otherwise.
 */
export function SpecialtyMark({
  name,
  className,
}: {
  name: string
  className?: string
}) {
  const cat = SPECIALTY_CATEGORY[name]
  return cat ? (
    <CategoryTile
      category={cat}
      className={cn("size-6 shrink-0 rounded-full", className)}
    />
  ) : (
    <span
      aria-hidden="true"
      className={cn(
        "grid size-6 shrink-0 place-items-center rounded-full bg-card",
        className
      )}
    >
      <GymObject
        id={SPECIALTY_OBJECT[name] ?? "whistle"}
        className="size-[66%]"
      />
    </span>
  )
}

/** A specialty as a chip: its mark, then its name. */
export function SpecialtyChip({ name }: { name: string }) {
  return (
    <li className="flex items-center gap-1.5 rounded-full bg-muted py-1 pr-3 pl-1 text-caption font-semibold">
      <SpecialtyMark name={name} />
      {name}
    </li>
  )
}

// The pin moved to its own brand module; the pages that import it from here keep working.
export { ClubPin }

/**
 * Where a coach trains, as a location list: only the clubs they train at, in the club order, each as the club
 * map's pin with its number, then the name, like a map legend. It has no chip fill, so it does not read as one
 * more set of specialties. The names keep to one line and the list wraps between them.
 */
function ClubReach({ coach }: { coach: Coach }) {
  const { clubs } = useCatalog()
  const at = clubs.filter((c) => coach.clubs.includes(c.slug))
  return (
    <div>
      <h4 className="text-label">Trains at</h4>
      <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-2">
        {at.map((c) => (
          <li
            key={c.slug}
            className="flex items-center gap-2 text-caption whitespace-nowrap"
          >
            <ClubPin n={c.n} />
            {c.short}
          </li>
        ))}
      </ul>
    </div>
  )
}

/**
 * One coach on one card, built to be read at a glance: the coach mark, the name and credential, what they coach
 * for as chips, and where they train as a bar. No quote and no paragraphs, so a row of cards compares fast.
 */
export function CoachCard({ coach, lit }: { coach: Coach; lit: boolean }) {
  return (
    <li
      className={cn(
        "flex flex-col overflow-hidden rounded-lg edge ring-border",
        lit ? "bg-[var(--cat-strength)]" : "bg-night"
      )}
    >
      <CoachMark coach={coach} lit={lit} />
      <div className="flex flex-1 flex-col gap-5 bg-card p-5">
        <div>
          <h3 className="font-display-wide text-h3">{coach.name}</h3>
          {coach.credential ? (
            <p className="text-caption text-pretty text-muted-foreground">
              {coach.credential}
            </p>
          ) : null}
        </div>
        <ul aria-label="Coaches for" className="flex flex-wrap gap-1.5">
          {coach.specialties.map((s) => (
            <SpecialtyChip key={s} name={s} />
          ))}
        </ul>
        <ClubReach coach={coach} />
        {/* The profile is the one next step for a coach: it holds the full story, where they train this week,
            and the way to ask for them on a tour. The visible label stays short; hidden text
            after it names the coach for a screen reader. */}
        {coach.profile ? (
          <div className="mt-auto pt-4 rule-t">
            <LinkButton
              href={`/coaches/${coach.slug}`}
              variant={lit ? "primary" : "outline"}
              size="sm"
            >
              View profile
              <span className="sr-only">: {coach.name}</span>
            </LinkButton>
          </div>
        ) : null}
      </div>
    </li>
  )
}

const ALL = "all"

/**
 * Find your coach, on the personal training page. Every coach who takes clients shows at once, as a visual card,
 * so a visitor compares them by scrolling, not by clicking. The goals above the cards are an optional filter,
 * in the club page's week form: one track that starts with "Every coach", then each goal with its object and
 * its count. One tap narrows the cards; the goal's one line then says what a coach does for it. A goal with
 * no coach who takes clients is left out. Under the goals is the site's results toolbar, with the goal's line,
 * the count and the sort; the most experienced coaches come first.
 */
export function CoachFinder({ goals }: { goals: CoachGoal[] }) {
  const { coaches } = useCatalog()
  const [sort, setSort] = useState<"years" | "name">("years")
  const pt = coaches
    .filter((c) => c.pt)
    .sort((a, b) =>
      sort === "name"
        ? a.name.localeCompare(b.name)
        : (b.years ?? 0) - (a.years ?? 0)
    )
  const withCount = goals
    .map((g) => ({
      ...g,
      n: pt.filter((c) => c.specialties.includes(g.specialty)).length,
    }))
    .filter((g) => g.n > 0)
  const [goal, setGoal] = useState(ALL)
  const current = withCount.find((g) => g.specialty === goal)
  const list = current
    ? pt.filter((c) => c.specialties.includes(current.specialty))
    : pt
  return (
    <div>
      {/* No scroll box here: a scroll box clips the focus ring. The goals wrap instead. */}
      <ToggleGroup
        aria-label="Show coaches for a goal"
        value={[goal]}
        onValueChange={(v) => {
          if (v[0] !== undefined) setGoal(String(v[0]))
        }}
        className="flex flex-wrap gap-1 rounded-lg bg-card p-1 edge ring-border"
      >
        <Toggle value={ALL} className="min-h-11 gap-2 px-3">
          Every coach
          <span className="tabular-nums opacity-70">{pt.length}</span>
        </Toggle>
        {withCount.map((g) => (
          <Toggle
            key={g.specialty}
            value={g.specialty}
            className="min-h-11 gap-2 px-3"
          >
            <GymObject id={g.icon} className="size-5 shrink-0" />
            {g.title}
            <span className="tabular-nums opacity-70">
              {g.n}
              <span className="sr-only">
                {g.n === 1 ? " coach" : " coaches"}
              </span>
            </span>
          </Toggle>
        ))}
      </ToggleGroup>

      {/* The results toolbar (filter-bar.tsx). The goals above are the filter, so the bar carries what the goal
          means, the count and the sort. */}
      <FilterBar
        className="mt-4"
        results={
          <>
            <span />
            <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
              <ResultCount
                shown={list.length}
                total={pt.length}
                noun={["coach", "coaches"]}
              />
              <SortSelect
                value={sort}
                onChange={setSort}
                options={[
                  { value: "years", label: "Most experience" },
                  { value: "name", label: "Name, A to Z" },
                ]}
              />
            </div>
          </>
        }
      />

      <ul className="mt-10 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((c, i) => (
          // The first card is lit in Copper: the most experienced coach for the goal, unless the sort is by name.
          <CoachCard key={c.slug} coach={c} lit={i === 0} />
        ))}
      </ul>

      {/* The one tour action in the section: for a visitor who has not picked a coach yet. */}
      <aside
        aria-labelledby="coach-match-title"
        className="mt-12 grid gap-5 rounded-lg bg-card p-6 edge ring-border sm:grid-cols-[auto_minmax(0,1fr)] sm:gap-6 lg:grid-cols-[auto_minmax(0,1fr)_auto] lg:items-center lg:p-8"
      >
        <span
          aria-hidden="true"
          className="grid size-14 place-items-center rounded-md bg-night"
        >
          <GymObject id="whistle" scheme="night" className="size-9" />
        </span>
        <div className="min-w-0">
          <h3 id="coach-match-title" className="font-display-wide text-h3">
            Not sure who fits?
          </h3>
          <p className="mt-2 max-w-[60ch] text-body text-pretty text-muted-foreground">
            Book a free tour and tell us your goal. A coach shows you the club
            and points you to the right person. No card.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 sm:col-start-2 lg:col-start-auto">
          <LinkButton href="/tour">Book a free tour</LinkButton>
          <TextLink href="/coaches">See every coach</TextLink>
        </div>
      </aside>
    </div>
  )
}
