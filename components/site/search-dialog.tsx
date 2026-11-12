"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useMemo, useState } from "react"
import { LinkButton } from "@/components/brand/atoms"
import { ClubArt } from "@/components/brand/club-art"
import { CategoryIcon } from "@/components/brand/icons"
import { IntensityRibs } from "@/components/brand/meters"
import {
  CalendarDays,
  Dumbbell,
  Flame,
  Footprints,
  LayoutGrid,
  Search,
  Smile,
  Ticket,
  Wallet,
  Waves,
} from "@/components/icons"
import { EmptyState } from "@/components/sections/common"
import { Overlay, OverlayPopup, OverlayTitle } from "@/components/ui/overlay"
import type { ClientCatalogData } from "@/lib/catalog"
import { initials } from "@/lib/catalog"
import { classHref } from "@/lib/links"
import { cn } from "@/lib/utils"
import { useCatalog } from "./catalog-context"
import { useMyClub } from "./club-context"

type Hit = {
  group: string
  title: string
  sub: string
  href: string
  lead: React.ReactNode
  terms?: string
  /** Where the hit is: a club slug, a list of them, or "all". Used to rank hits at the visitor's club. */
  at?: string[] | "all"
}
// Each value is a list of phrases. A phrase matches whole, so "kids club" does not turn into the bare word "club",
// which would match every club.
const SYN: [RegExp, string[]][] = [
  [/spin|cycl/, ["cycle", "climb", "rhythm", "endurance"]],
  [/pool|swim|lap/, ["aquatics", "lap swim", "aqua"]],
  [/swim lesson|learn to swim|lessons/, ["swim school"]],
  [/child|daycare|babysit|kids/, ["kids club"]],
  [/weight|lift|powerlift/, ["strength", "olympic lifting"]],
  [/sauna|plunge|ice/, ["recovery", "sauna", "plunge"]],
  [/pickle|tennis|court/, ["pickleball", "court"]],
  [
    /yoga|pilates|stretch/,
    ["mind body", "yoga", "pilates", "mobility", "stretch"],
  ],
  [/trainer|personal/, ["personal training", "coaches"]],
]
export function buildIndex(
  cat: Pick<
    ClientCatalogData,
    "clubs" | "classTypes" | "coaches" | "faqs" | "journal"
  >
): Hit[] {
  const { clubs, classTypes, coaches, faqs, journal } = cat
  return [
    ...clubs.map((c) => ({
      group: "Clubs",
      title: c.name,
      sub: c.personality,
      href: `/clubs/${c.slug}`,
      lead: (
        <ClubArt
          slug={c.slug}
          ratio="4/3"
          detail="simple"
          className="w-10 shrink-0 overflow-hidden corner-xs"
        />
      ),
      at: [c.slug],
      terms: [
        c.amenities.join(" "),
        c.signature.join(" "),
        c.city,
        c.zip,
        c.cross,
        // "Full club" would put the word "club" on every club, so only the first word is searchable.
        c.type.replace(/\s*club$/i, ""),
        c.has.pool ? "pool swim lap lanes aquatics" : "",
        c.has.courts ? "courts pickleball tennis basketball" : "",
        c.has.kids ? "kids club childcare" : "",
        c.has.recovery ? "recovery sauna plunge compression" : "",
      ].join(" "),
    })),
    ...classTypes.map((c) => ({
      group: "Classes",
      title: c.name,
      sub: `${c.categoryName} · ${c.duration} min`,
      href: classHref(c),
      lead: <CategoryIcon id={c.category} className="size-5" />,
      terms: `${c.categoryName} ${c.blurb}`,
      at: c.clubs,
    })),
    ...coaches
      .filter((c) => c.profile)
      .map((c) => ({
        group: "Coaches",
        title: c.name,
        sub: `${c.specialties[0]} coach`,
        terms: c.specialties.join(" "),
        at: c.clubs,
        href: `/coaches/${c.slug}`,
        lead: (
          <span
            aria-hidden="true"
            className={cn(
              "inline-flex size-8 items-center justify-center",
              "corner-full",
              "text-body-s",
              "bg-night text-night-foreground"
            )}
          >
            {initials(c.name)}
          </span>
        ),
      })),
    ...[
      [
        "Membership and prices",
        "/membership",
        Wallet,
        "plans trailhead ridge summit",
      ],
      ["Kids club hours", "/kids", Smile, "childcare ages swim school"],
      ["Free 3-day pass", "/trial", Ticket, "trial"],
      ["Book a free tour", "/tour", Footprints, "visit"],
      ["Aquatics", "/aquatics", Waves, "pool swim lap warm water"],
      ["Courts", "/courts", LayoutGrid, "pickleball tennis basketball"],
      ["Recovery", "/recovery", Flame, "sauna cold plunge compression"],
      ["Class schedule", "/classes#schedule", CalendarDays, "times"],
      ["Personal training", "/personal-training", Dumbbell, "coach trainer"],
    ].map(([t, h, I, terms]) => {
      const Icon = I as typeof Wallet
      return {
        group: "Pages and FAQ",
        title: t as string,
        sub: "Page",
        href: h as string,
        terms: terms as string,
        lead: (
          <Icon className="size-5 text-muted-foreground" aria-hidden="true" />
        ),
      }
    }),
    ...faqs.map((f) => ({
      group: "Pages and FAQ",
      title: f.q,
      sub: "FAQ",
      href: `/faq#${f.id}`,
      lead: (
        <Search className="size-5 text-muted-foreground" aria-hidden="true" />
      ),
    })),
    ...journal.map((j) => ({
      group: "Journal",
      title: j.title,
      sub: j.cat,
      href: `/journal/${j.slug}`,
      lead: (
        <Search className="size-5 text-muted-foreground" aria-hidden="true" />
      ),
    })),
  ]
}
const GROUP_ORDER = ["Clubs", "Classes", "Coaches", "Pages and FAQ", "Journal"]
/**
 * Search the index. A hit matches when it holds the whole query, every word of it, or a synonym phrase.
 * Within a group, a title match ranks above a match in the small print, and a hit at the visitor's own
 * club ranks above the same kind of hit elsewhere.
 */
export function runSearch(q: string, index: Hit[], myClub?: string) {
  const t = q.trim().toLowerCase()
  if (!t) return []
  const words = t.split(/\s+/)
  const phrases = SYN.filter(([r]) => r.test(t)).flatMap(([, s]) => s)
  const scored: { h: Hit; score: number; i: number }[] = []
  index.forEach((h, i) => {
    const title = h.title.toLowerCase()
    const hay = `${title} ${h.sub} ${h.terms ?? ""}`.toLowerCase()
    let score = 0
    if (title.startsWith(t)) score = 6
    else if (title.includes(t)) score = 4
    else if (words.every((w) => title.includes(w))) score = 3
    else if (hay.includes(t) || words.every((w) => hay.includes(w))) score = 1
    else if (phrases.some((p) => hay.includes(p))) score = 0.5
    if (!score) return
    if (myClub && h.at && (h.at === "all" || h.at.includes(myClub))) score += 2
    scored.push({ h, score, i })
  })
  return scored
    .sort(
      (a, b) =>
        GROUP_ORDER.indexOf(a.h.group) - GROUP_ORDER.indexOf(b.h.group) ||
        b.score - a.score ||
        a.i - b.i
    )
    .map((x) => x.h)
}

export function SearchDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
}) {
  const [q, setQ] = useState("")
  const [active, setActive] = useState(0)
  const router = useRouter()
  const catalog = useCatalog()
  const { club: mine } = useMyClub()
  const index = useMemo(() => buildIndex(catalog), [catalog])
  const hits = useMemo(() => runSearch(q, index, mine?.slug), [q, index, mine])
  const groups = useMemo(() => {
    const out: { name: string; items: Hit[] }[] = []
    for (const h of hits) {
      let g = out.find((x) => x.name === h.group)
      if (!g) {
        g = { name: h.group, items: [] }
        out.push(g)
      }
      if (g.items.length < 4) g.items.push(h)
    }
    return out
  }, [hits])
  const flat = groups.flatMap((g) => g.items)
  const popular: Hit[] = [
    ...index.filter((h) => h.group === "Clubs"),
    ...[
      ["Free 3-day pass", "/trial"],
      ["Book a free tour", "/tour"],
      ["Prices", "/membership"],
      ["Kids club hours", "/kids"],
    ].map(([t, h]) => ({
      group: "Quick links",
      title: t,
      sub: "Page",
      href: h,
      lead: (
        <Search className="size-5 text-muted-foreground" aria-hidden="true" />
      ),
    })),
  ]
  const list = q.trim() ? flat : popular
  const go = (href: string) => {
    onOpenChange(false)
    router.push(href)
  }
  return (
    <Overlay
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o)
        if (!o) {
          setQ("")
          setActive(0)
        }
      }}
    >
      {/* No padding or gap: the search row and the result list run to the popup edges. */}
      <OverlayPopup placement="top" hideClose className="gap-zero p-zero">
        <OverlayTitle className="sr-only">
          Search clubs, classes and coaches
        </OverlayTitle>
        <div className="flex items-center gap-s px-m rule-b focus-within:-outline-offset-2 focus-within:outline-(length:--border-l) focus-within:outline-ring focus-within:outline-solid">
          <Search className="size-5 text-muted-foreground" aria-hidden="true" />
          <label htmlFor="site-search" className="sr-only">
            Search clubs, classes, coaches
          </label>
          <input
            id="site-search"
            // biome-ignore lint/a11y/noAutofocus: the search field is the dialog's first and only target, so focus it on open
            autoFocus
            role="combobox"
            aria-autocomplete="list"
            aria-expanded={!(q.trim() && !flat.length)}
            aria-controls={q.trim() && !flat.length ? undefined : "search-list"}
            aria-activedescendant={list[active] ? `sr-${active}` : undefined}
            autoComplete="off"
            value={q}
            onChange={(e) => {
              setQ(e.target.value)
              setActive(0)
            }}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault()
                setActive((a) => Math.min(a + 1, list.length - 1))
              }
              if (e.key === "ArrowUp") {
                e.preventDefault()
                setActive((a) => Math.max(a - 1, 0))
              }
              if (e.key === "Enter") {
                e.preventDefault()
                if (list[active]) go(list[active].href)
                else if (q) go(`/search?q=${encodeURIComponent(q)}`)
              }
            }}
            placeholder="Search clubs, classes, coaches…"
            className="h-14 flex-1 bg-transparent text-body-m outline-none placeholder:text-muted-foreground"
          />
          <kbd
            className={cn(
              "hidden",
              "corner-xs px-xs py-xxs",
              "text-body-s",
              "bg-muted text-muted-foreground",
              "sm:block"
            )}
          >
            Esc
          </kbd>
        </div>
        {/* The count is announced as the visitor types. The status region stays mounted so screen readers hear changes. */}
        <p role="status" className="sr-only">
          {q.trim()
            ? flat.length === 1
              ? "1 result"
              : `${flat.length} results`
            : ""}
        </p>
        {q.trim() && !flat.length ? (
          // Outside the listbox: a listbox may hold only options, and these are buttons.
          <div className="min-h-0 flex-1 overflow-y-auto p-xs">
            <EmptyState
              title={`We found nothing for “${q}”.`}
              text="Try “cycle”, “pool” or “kids club”."
            >
              <LinkButton
                href="/classes"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                See all classes
              </LinkButton>
              <LinkButton
                href="/contact"
                variant="ghost"
                onClick={() => onOpenChange(false)}
              >
                Ask a person
              </LinkButton>
            </EmptyState>
          </div>
        ) : (
          <div
            id="search-list"
            role="listbox"
            aria-label="Results"
            className="min-h-0 flex-1 overflow-y-auto p-xs"
          >
            {(q.trim() ? groups : [{ name: "Popular", items: popular }]).map(
              (g) => (
                // biome-ignore lint/a11y/useSemanticElements: role=group on a non-form control group; fieldset adds default min-inline-size and a legend that would change the layout
                <div key={g.name} role="group" aria-label={g.name}>
                  <p className="eyebrow px-s pt-s pb-xxs text-muted-foreground">
                    {g.name}
                  </p>
                  {g.items.map((h) => {
                    const i = list.indexOf(h)
                    return (
                      <Link
                        key={h.href + h.title}
                        id={`sr-${i}`}
                        role="option"
                        tabIndex={-1}
                        aria-selected={i === active}
                        href={h.href}
                        onClick={() => onOpenChange(false)}
                        onMouseMove={() => setActive(i)}
                        className={cn(
                          "flex min-h-14 items-center gap-s corner-m px-s py-xs",
                          i === active && "bg-muted ring-2 ring-ring"
                        )}
                      >
                        <span className="flex w-10 shrink-0 justify-center">
                          {h.lead}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-body-s font-heavy">
                            {h.title}
                          </span>
                          <span className="block truncate text-body-s text-muted-foreground">
                            {h.sub}
                          </span>
                        </span>
                        {h.group === "Classes" ? (
                          <ClassRibs catalog={catalog} title={h.title} />
                        ) : null}
                      </Link>
                    )
                  })}
                </div>
              )
            )}
          </div>
        )}
        {q.trim() ? (
          <Link
            href={`/search?q=${encodeURIComponent(q)}`}
            onClick={() => onOpenChange(false)}
            className={cn(
              "flex min-h-12 items-center justify-between rule-t",
              "px-m",
              "text-body-s font-heavy",
              "text-link"
            )}
          >
            See all results for &ldquo;{q}&rdquo;
            <span aria-hidden="true">→</span>
          </Link>
        ) : null}
      </OverlayPopup>
    </Overlay>
  )
}

function ClassRibs({
  catalog,
  title,
}: {
  catalog: Pick<ClientCatalogData, "classTypes">
  title: string
}) {
  const ct = catalog.classTypes.find((c) => c.name === title)
  if (!ct) return null
  return (
    <IntensityRibs
      level={ct.intensity[1]}
      categoryId={ct.category}
      showLabel={false}
    />
  )
}
