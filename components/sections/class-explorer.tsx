"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { LinkButton } from "@/components/brand/atoms"
import { CategoryTile, GymObject } from "@/components/brand/graphics"
import { IntensityRibs } from "@/components/brand/meters"
import { Tabs } from "@/components/graphical"
import { ChevronDown } from "@/components/icons"
import { useBooking } from "@/components/site/booking"
import { useCatalog, useSessions } from "@/components/site/catalog-context"
import { useMyClub } from "@/components/site/club-context"
import { buttonVariants } from "@/components/ui/button"
import { categoryRange, runsAt } from "@/lib/catalog"
import { timesByClub } from "@/lib/class-times"
import { kidsCostLine } from "@/lib/labels"
import { dayInfo, fmtTime } from "@/lib/time"
import type { Category, ClassType, Club, Coach, Slot } from "@/lib/types"
import { useMedia } from "@/lib/use-media"
import { cn } from "@/lib/utils"
import {
  classObject,
  effortLine,
  effortWord,
  poolLine,
  weekly,
  whereLabel,
} from "./class-page"
import { ScheduleLink } from "./schedule-link"
import { SwimFacts, SwimLevels } from "./swim-school"

/** The explorer's place on the page, and the prefixes of the anchors that open a type or a class in it. */
export const EXPLORER_ANCHOR = "explore"
export const typeAnchor = (id: string) => `type-${id}`
export const classAnchor = (slug: string) => `class-${slug}`

/**
 * The next class a visitor could take, as a short line: "Next: today at 5:30 pm, Dobson & Southern". It prefers
 * the visitor's club when one is set. It renders only after mount, because "today" depends on the visitor's clock.
 */
function NextUp({ c }: { c: ClassType }) {
  const { sessions, now } = useSessions()
  const { club: mine } = useMyClub()
  const [ready, setReady] = useState(false)
  useEffect(() => setReady(true), [])
  if (!ready || !c.bookable) return null
  const upcoming = sessions
    .filter(
      (s) =>
        s.classSlug === c.slug &&
        (s.day > 0 || s.start >= now.min) &&
        s.left > 0
    )
    .sort((a, b) => a.day - b.day || a.start - b.start)
  const s =
    (mine && upcoming.find((x) => x.clubSlug === mine.slug)) ?? upcoming[0]
  if (!s) return null
  const d = dayInfo(s.day, now.dayNum)
  const when = s.day === 0 ? "today" : s.day === 1 ? "tomorrow" : d.long
  return (
    <span className="text-muted-foreground">
      Next: {when} at <span className="tabular-nums">{fmtTime(s.start)}</span>,{" "}
      {s.clubShort}
    </span>
  )
}

/**
 * The free 3-day pass covers group classes for adults. Courts, swim school and the youth classes are not in it,
 * so those rows offer a tour instead (marketing spec 03, trial).
 */
const passCovers = (c: ClassType) =>
  c.bookable &&
  c.category !== "court" &&
  c.category !== "youth" &&
  c.slug !== "swim-school"

/** Child care, not a workout: its row shows hours and price, and no effort meter. */
const KIDS_CLUB = "kids-club"
/** Classes for children, where an effort meter tells a parent nothing useful. */
const noEffort = (c: ClassType) =>
  c.slug === KIDS_CLUB || c.slug === "swim-school"

/**
 * A button that sends the link to one class: the phone's share sheet where there is one, else a copy to the
 * clipboard. For the teen who wants a parent to see a class, and for anyone who plans with a friend.
 */
function ShareClass({ c }: { c: ClassType }) {
  const [said, setSaid] = useState("")
  const share = async () => {
    const url = `${window.location.origin}/classes#${classAnchor(c.slug)}`
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${c.name} at Cactus Peak`,
          text: c.blurb,
          url,
        })
        return
      }
      await navigator.clipboard.writeText(url)
      setSaid("Link copied.")
    } catch (e) {
      // A closed share sheet is not an error. Anything else: show the link so it can be copied by hand.
      if ((e as Error).name !== "AbortError") setSaid(`Copy this link: ${url}`)
    }
  }
  return (
    <div className="flex flex-wrap items-center gap-x-s">
      <button
        type="button"
        onClick={share}
        className={cn(buttonVariants({ variant: "ghost" }))}
      >
        Share this class
      </button>
      <p aria-live="polite" className="text-body-s text-muted-foreground">
        {said}
      </p>
    </div>
  )
}

/** The coaches who lead a class this week, from the timetable, each linked to a profile when there is one. */
function classCoaches(
  c: ClassType,
  slots: Slot[],
  coachById: (id: string) => Coach | undefined
) {
  const ids = [
    ...new Set(slots.filter((s) => s.classKey === c.key).map((s) => s.coachId)),
  ]
  return ids
    .map((id) => coachById(id))
    .filter((x): x is Coach => Boolean(x))
    .sort((a, b) => a.name.localeCompare(b.name))
}

/**
 * One class as a disclosure row. Closed, it is enough to compare classes: the object, the name, one line, how
 * long and how hard, and the next time it runs. Open, it has the full facts a class page used to have, and the
 * two next steps: its times on the schedule, and a free pass to try it.
 */
function ClassRow({
  c,
  clubs,
  slots,
  open,
  onToggle,
}: {
  c: ClassType
  clubs: Club[]
  slots: Slot[]
  open: boolean
  onToggle: (open: boolean) => void
}) {
  const { club: mine } = useMyClub()
  const { coachById, prices } = useCatalog()
  const coaches = classCoaches(c, slots, coachById)
  const kids = c.slug === KIDS_CLUB
  // When it runs, one row per club: the same class keeps different hours at different clubs.
  const when = c.bookable ? timesByClub(slots, c.key, clubs) : []
  const pool = c.category === "aqua" ? poolLine(c, clubs, slots) : null
  const facts: [string, string][] = [
    ["Length", `${c.duration} min`],
    ["Group", c.group],
    ["Where", whereLabel(c, clubs)],
    // Kids club is child care, so a level means nothing there; its hours and cost follow instead.
    ...(kids
      ? []
      : ([
          [
            "Level",
            !c.bookable
              ? "Book a time slot"
              : c.firstTimer
                ? "Good for a first class"
                : "Some experience helps",
          ],
        ] as [string, string][])),
    ...(pool ? ([["Pool", pool]] as [string, string][]) : []),
    ...(kids
      ? ([
          ["Hours", "Mon–Sat 8 am–12 pm and 4–8 pm. Closed Sunday."],
          ["Cost", kidsCostLine(prices.child)],
        ] as [string, string][])
      : []),
    ["Bring", c.bring.length ? c.bring.join(", ") : c.gear],
  ]
  return (
    <li id={classAnchor(c.slug)} className="scroll-mt-4 rule-b">
      <details
        open={open}
        onToggle={(e) => onToggle((e.currentTarget as HTMLDetailsElement).open)}
        className="group/row"
      >
        <summary
          className={cn(
            "grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-x-m",
            "py-l",
            "list-none",
            "cursor-pointer",
            "hover:bg-muted/60 sm:gap-x-l [&::-webkit-details-marker]:hidden"
          )}
        >
          <GymObject id={classObject(c)} cut className="size-12 sm:size-14" />
          <div className="min-w-0">
            <h4 className="font-display-wide text-body-l font-medium">
              {c.name}
            </h4>
            <p className="mt-xxs text-body-m text-pretty text-muted-foreground">
              {c.blurb}
            </p>
            <div className="mt-xs flex flex-wrap items-center gap-x-m gap-y-xxs text-body-s">
              <span className="tabular-nums">{c.duration} min</span>
              {noEffort(c) ? null : (
                <IntensityRibs level={c.intensity} categoryId={c.category} />
              )}
              {c.firstTimer && c.bookable ? (
                <span className="corner-xs bg-muted px-xs py-xxs font-heavy group-hover/row:bg-background">
                  Good first class
                </span>
              ) : null}
              <NextUp c={c} />
            </div>
          </div>
          <span className="grid size-11 place-items-center corner-full">
            <ChevronDown
              aria-hidden="true"
              className="size-5 transition-transform group-open/row:rotate-180 motion-reduce:transition-none"
            />
            <span className="sr-only">
              {open ? "Hide details" : "Show details"}
            </span>
          </span>
        </summary>

        <div className="grid gap-l pb-xl sm:pl-[calc(var(--space-xxl)*5/3)]">
          <p className="max-w-[60ch] text-body-l text-pretty">
            {c.description}
          </p>
          {c.pick ? (
            <p className="max-w-[60ch] text-body-m text-pretty font-heavy">
              {c.pick}
            </p>
          ) : null}
          <dl className="grid gap-x-xl gap-y-xs text-body-m sm:grid-cols-2">
            {facts.map(([k, v]) => (
              <div key={k} className="flex gap-xs">
                <dt className="w-14 shrink-0 text-muted-foreground">{k}</dt>
                <dd className="min-w-0 text-pretty">{v}</dd>
              </div>
            ))}
          </dl>
          {when.length ? (
            <div>
              <h5 className="text-body-s text-muted-foreground">
                When it runs
              </h5>
              <ul className="mt-xs rule-t">
                {when.map((p) => (
                  <li
                    key={p.club.slug}
                    className="grid gap-x-l py-xs rule-b sm:grid-cols-[12rem_minmax(0,1fr)]"
                  >
                    <span className="text-body-s font-heavy">
                      {p.club.name}
                    </span>
                    <span className="text-body-m text-pretty text-muted-foreground tabular-nums">
                      {p.text}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          {coaches.length ? (
            <div>
              <h5 className="text-body-s text-muted-foreground">
                Who leads it
              </h5>
              <ul className="mt-xs flex flex-wrap gap-x-l gap-y-xxs text-body-m">
                {coaches.map((co) => (
                  <li key={co.id}>
                    {co.profile ? (
                      <a
                        href={`/coaches/${co.slug}`}
                        className="inline-flex min-h-11 items-center text-link underline decoration-from-font underline-offset-4"
                      >
                        {co.name}
                      </a>
                    ) : (
                      <span className="inline-flex min-h-11 items-center">
                        {co.name}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          {noEffort(c) ? null : (
            <div>
              <IntensityRibs
                level={c.intensity}
                categoryId={c.category}
                size="md"
              />
              <p className="mt-xs max-w-[48ch] text-body-s text-pretty text-muted-foreground">
                {effortLine(c.intensity)}
              </p>
            </div>
          )}
          {c.slug === "swim-school" ? (
            <div className="grid gap-l pt-l rule-t">
              <SwimFacts />
              <SwimLevels />
            </div>
          ) : null}
          <div className="flex flex-wrap gap-s">
            {c.bookable ? (
              <ScheduleLink
                filter={{
                  classSlug: c.slug,
                  // Keep the visitor's club when it runs the class; otherwise show every club that does.
                  club: mine && runsAt(c, mine.slug) ? mine.slug : "all",
                }}
                className={cn(buttonVariants({ variant: "outline" }))}
              >
                See times for {c.name}
              </ScheduleLink>
            ) : null}
            {kids ? (
              <LinkButton href="/kids" variant="outline">
                Kids and family at Cactus Peak
              </LinkButton>
            ) : null}
            <LinkButton
              href={passCovers(c) ? "/trial" : "/tour"}
              variant="ghost"
            >
              {passCovers(c)
                ? "Try it with a free pass"
                : "See it on a free tour"}
            </LinkButton>
          </div>
          <ShareClass c={c} />
        </div>
      </details>
    </li>
  )
}

/** The head of a type's panel: what the type is, the four facts types are compared by, and its two next steps. */
function TypeHead({
  cat,
  list,
  clubs,
  slots,
}: {
  cat: Category
  list: ClassType[]
  clubs: Club[]
  slots: Slot[]
}) {
  const keys = new Set(list.map((c) => c.key))
  const n = weekly(slots, keys)
  const here = clubs.filter((club) => list.some((c) => runsAt(c, club.slug)))
  const range = categoryRange(list, cat.intensity)
  const firsts = list.filter((c) => c.firstTimer && c.bookable)
  const facts: { k: string; v: React.ReactNode }[] = [
    {
      k: "How hard",
      v: (
        <>
          <IntensityRibs level={range} categoryId={cat.id} showLabel={false} />
          {effortWord(range)}
        </>
      ),
    },
    {
      k: "This week",
      v: n
        ? `${n} at ${here.length === clubs.length ? `all ${here.length} clubs` : `${here.length} ${here.length === 1 ? "club" : "clubs"}`}`
        : "Book a time in the app",
    },
    {
      k: "First class",
      v: firsts.length
        ? firsts.map((c) => c.name).join(", ")
        : "Ask a coach on a tour",
    },
  ]
  return (
    <div className="grid gap-l">
      <div className="flex items-start gap-m sm:gap-l">
        <CategoryTile
          category={cat.id}
          cut
          className="size-12 shrink-0 sm:size-14"
        />
        <div className="min-w-0">
          <h3 className="display-lead">{cat.name}</h3>
          <p className="mt-xs max-w-[56ch] text-body-l text-pretty text-muted-foreground">
            {cat.lede}
          </p>
        </div>
      </div>
      {/* Three facts in a ruled row from sm; stacked rows on a phone. */}
      <dl className="grid rule-y sm:grid-cols-3">
        {facts.map((f) => (
          <div
            key={f.k}
            className={cn(
              "flex min-w-0 flex-col gap-xxs",
              "py-m",
              "max-sm:not-first:rule-t sm:not-first:pl-l sm:not-first:rule-l"
            )}
          >
            <dt className="text-body-s text-muted-foreground">{f.k}</dt>
            <dd className="flex flex-wrap items-center gap-x-s gap-y-xxs text-body-m text-pretty font-heavy">
              {f.v}
            </dd>
          </div>
        ))}
      </dl>
      <div className="flex flex-wrap gap-s">
        {n ? (
          <ScheduleLink
            filter={{ category: cat.id }}
            className={cn(
              buttonVariants({ variant: "outline" }),
              "max-sm:flex-1"
            )}
          >
            See {cat.name.toLowerCase()} times
          </ScheduleLink>
        ) : null}
        <LinkButton
          href={`/join/plan?plan=${cat.id === "recovery" ? "summit" : "ridge"}`}
          variant="ghost"
          className="max-sm:flex-1"
        >
          {cat.id === "recovery"
            ? "Recovery comes with Summit"
            : "Included in every plan"}
        </LinkButton>
      </div>
    </div>
  )
}

/**
 * Every class, by type, on the classes page. It replaces the type pages and the class sections that lived on
 * them. A rail of the eight types (a tab list) selects one type's panel: the type's facts, then each class as
 * a row that opens in place. All panels stay in the HTML, so search engines and find-in-page see every class.
 * The address hash opens a type (#type-cycle) or a class (#class-rhythm-ride), so old links and the type cards
 * above land on the right panel.
 */
export function ClassExplorer({
  categories,
  classTypes,
  clubs,
  slots,
}: {
  categories: Category[]
  classTypes: ClassType[]
  clubs: Club[]
  slots: Slot[]
}) {
  const [type, setType] = useState<string>(categories[0]?.id ?? "")
  const [opened, setOpened] = useState<Set<string>>(() => new Set())
  const wide = useMedia("(min-width: 64rem)")
  const { closePanel, panel } = useBooking()
  // Read through refs, so a new closePanel never re-runs the hash effect (which would scroll again).
  const closeRef = useRef(closePanel)
  closeRef.current = closePanel
  const panelRef = useRef(panel)
  panelRef.current = panel
  // Below lg the rail is a scrolling row. Keep the chosen type in view when a link or the hash picks it.
  const railRef = useRef<HTMLDivElement>(null)
  // biome-ignore lint/correctness/useExhaustiveDependencies: the effect reads the DOM that `type` changes
  useEffect(() => {
    const rail = railRef.current
    const tab = rail?.querySelector<HTMLElement>(
      '[role="tab"][aria-selected="true"]'
    )
    if (!rail || !tab || rail.scrollWidth <= rail.clientWidth) return
    rail.scrollTo({
      left:
        rail.scrollLeft +
        tab.getBoundingClientRect().left -
        rail.getBoundingClientRect().left -
        16,
    })
  }, [type])
  const byType = useMemo(
    () =>
      new Map(
        categories.map((c) => [
          c.id,
          classTypes.filter((ct) => ct.category === c.id),
        ])
      ),
    [categories, classTypes]
  )

  // Follow the hash: #type-<id> selects a type, #class-<slug> selects its type and opens the class.
  useEffect(() => {
    const follow = (settle = false) => {
      const h = decodeURIComponent(window.location.hash.slice(1))
      let target: HTMLElement | null = null
      if (h.startsWith("type-")) {
        const id = h.slice(5)
        if (!byType.has(id as Category["id"])) return
        setType(id)
        target = document.getElementById(EXPLORER_ANCHOR)
      } else if (h.startsWith("class-")) {
        const slug = h.slice(6)
        const ct = classTypes.find((c) => c.slug === slug)
        if (!ct) return
        setType(ct.category)
        setOpened((s) => new Set(s).add(slug))
        target = document.getElementById(h)
      } else return
      // The panel shows on the next frame, so scroll after it renders.
      const go = () => {
        const el = target ?? document.getElementById(h)
        el?.scrollIntoView({ block: "start", behavior: "instant" })
        // Keyboard and screen reader users land where the eye does: on the class's summary, or the type's tab.
        const focusable = h.startsWith("class-")
          ? el?.querySelector<HTMLElement>("summary")
          : document.querySelector<HTMLElement>(
              '[role="tab"][aria-selected="true"]'
            )
        focusable?.focus({ preventScroll: true })
      }
      requestAnimationFrame(() => requestAnimationFrame(go))
      // On first load the schedule above fills in after hydration and pushes the panel down, so scroll again
      // once it has settled.
      if (settle) setTimeout(go, 500)
    }
    // A Next.js Link changes the address with pushState, which fires no hashchange. Catch links to a type or a
    // class on this page before the Link does, and set the hash the plain way so `follow` runs.
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey) return
      const a = (e.target as Element | null)?.closest?.("a")
      if (!a?.hash) return
      const url = new URL(a.href)
      if (url.pathname !== window.location.pathname) return
      if (!/^#(type|class)-/.test(url.hash)) return
      e.preventDefault()
      // The class panel on the schedule links here too. Close it first, so the class shows.
      const go = () => {
        if (window.location.hash === url.hash) follow()
        else window.location.hash = url.hash
      }
      if (!panelRef.current) return go()
      // The open panel owns a history entry, and closing it steps Back over that entry. Set the hash after
      // that step, or the step would undo it.
      let done = false
      const once = () => {
        if (done) return
        done = true
        window.removeEventListener("popstate", once)
        go()
      }
      window.addEventListener("popstate", once)
      setTimeout(once, 400)
      closeRef.current()
    }
    const onHash = () => follow()
    follow(true)
    window.addEventListener("hashchange", onHash)
    document.addEventListener("click", onClick, true)
    return () => {
      window.removeEventListener("hashchange", onHash)
      document.removeEventListener("click", onClick, true)
    }
  }, [byType, classTypes])

  return (
    <Tabs.Root
      value={type}
      onValueChange={(v) => setType(String(v))}
      orientation={wide ? "vertical" : "horizontal"}
      className="grid gap-xl lg:grid-cols-12 lg:gap-section"
    >
      <div className="lg:col-span-3">
        <div className="lg:sticky lg:top-[calc(var(--sticky-top)+1.5rem)]">
          {/* Below lg the rail is one scrolling row, so the eight types never wrap or overflow the page. */}
          <div
            ref={railRef}
            className={cn(
              "overflow-x-auto",
              "-mx-m px-m",
              "sm:-mx-l sm:px-l lg:mx-zero lg:overflow-visible lg:px-zero"
            )}
          >
            <Tabs.List
              aria-label="Class types"
              className="flex w-max gap-xxs lg:w-full lg:flex-col lg:items-stretch"
            >
              {categories.map((c) => (
                <Tabs.Tab
                  key={c.id}
                  value={c.id}
                  className="flex min-h-12 items-center gap-s whitespace-nowrap lg:justify-start"
                >
                  <CategoryTile category={c.id} className="size-7 shrink-0" />
                  <span>{c.name}</span>
                  <span className="text-muted-foreground tabular-nums lg:ml-auto">
                    {byType.get(c.id)?.length ?? 0}
                    <span className="sr-only"> classes</span>
                  </span>
                </Tabs.Tab>
              ))}
            </Tabs.List>
          </div>
        </div>
      </div>

      <div className="min-w-0 lg:col-span-9">
        {categories.map((cat) => {
          const list = byType.get(cat.id) ?? []
          return (
            <Tabs.Panel key={cat.id} value={cat.id} keepMounted>
              <div id={typeAnchor(cat.id)} className="grid scroll-mt-4 gap-xl">
                <TypeHead cat={cat} list={list} clubs={clubs} slots={slots} />
                <ol className="rule-t rule-heavy">
                  {list.map((c) => (
                    <ClassRow
                      key={c.slug}
                      c={c}
                      clubs={clubs}
                      slots={slots}
                      open={opened.has(c.slug)}
                      onToggle={(o) =>
                        setOpened((s) => {
                          if (o === s.has(c.slug)) return s
                          const next = new Set(s)
                          if (o) next.add(c.slug)
                          else next.delete(c.slug)
                          return next
                        })
                      }
                    />
                  ))}
                </ol>
              </div>
            </Tabs.Panel>
          )
        })}
      </div>
    </Tabs.Root>
  )
}
