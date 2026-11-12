"use client"

import {
  type ClubId,
  clubObjects,
  ObjectCrop,
  type ObjectId,
} from "@/components/brand/graphics"
import { cn } from "@/lib/utils"
import { useCatalog } from "./catalog-context"
import { useMyClub } from "./club-context"

/*
 * The site's navigation tree. The desktop header and the phone drawer render the same tree, so a
 * visitor finds a page in the same place on every screen.
 * Only Clubs opens a menu (marketing spec 02, section 1): a visitor must choose one of five club pages
 * there, and the menu saves a page load. Every other top item is one page, so it is a plain link. A menu
 * that only repeats one page's sections makes the visitor open it for nothing. Classes is one page with
 * its types, every class and the schedule as sections, so it is a plain link too.
 * Each menu starts with its overview page, so a click on the trigger never hides the index page.
 * The lists stay short: one list per menu, and a page that the overview already links is not repeated.
 * Each menu ends with one callout that the header bar does not already offer (a Night card with one
 * Crop: the tour and offer band rule, VISUAL-IDENTITY.md section 8).
 */

/** A menu row is the page name only: no icon and no second line, so a list reads in one scan. */
export type NavItem = {
  href: string
  title: string
  badge?: string
}

export type NavSection = { label?: string; items: NavItem[] }

export type NavCallout = {
  href: string
  /** A short tag above the title, for a time limit or a price. */
  tag?: string
  title: string
  line: string
  action: string
  object: ObjectId
}

export type NavGroupId = "clubs"

export type NavGroup = {
  id: NavGroupId
  label: string
  /** The group's index page, shown first in the menu. */
  overview: NavItem
  sections: NavSection[]
  /** Optional: a menu shows a callout only when the card links somewhere the lists do not. */
  callout?: NavCallout
}

/**
 * Top items that are one page each. The schedule is a section of the classes page, so it has no top item of
 * its own: "Classes" leads to it, and the classes hero and section nav jump to it.
 */
export const navLinks = [
  { href: "/classes", label: "Classes" },
  { href: "/membership", label: "Membership" },
  { href: "/personal-training", label: "Personal training" },
  { href: "/kids", label: "Kids & family" },
] as const

/** Pages a visitor looks for less often. The footer lists them on desktop; the drawer lists them on phones. */
export const moreLinks = [
  { href: "/coaches", label: "Coaches" },
  { href: "/about", label: "About" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
] as const

/** The fall offer. The Membership page links to it; the phone drawer shows it at the root. */
export const offerCallout: NavCallout = {
  href: "/offers/fall-climb",
  tag: "Through Nov 30",
  title: "$0 enrollment",
  line: "Join any plan this fall and skip the enrollment fee.",
  action: "See the offer",
  object: "gym-bag",
}

const isClubId = (slug: string): slug is ClubId => slug in clubObjects

export function useNavTree(): NavGroup[] {
  const { clubs } = useCatalog()
  const { club: mine } = useMyClub()
  // Your club first, so the most likely pick is at the top of the list.
  const list = [...clubs].sort((a, b) =>
    a.slug === mine?.slug ? -1 : b.slug === mine?.slug ? 1 : 0
  )
  return [
    {
      id: "clubs",
      label: "Clubs",
      overview: {
        href: "/clubs",
        title: "All clubs",
      },
      // Pools, courts and recovery are not listed here: the class types and each club page link them.
      sections: [
        {
          label: "Locations",
          items: list.map((c) => ({
            href: `/clubs/${c.slug}`,
            title: c.name,
            badge: c.slug === mine?.slug ? "Your club" : undefined,
          })),
        },
      ],
      // The header bar holds "Book a free tour", and the overview row is the club finder. Only a chosen
      // club gives the card something new to say.
      callout: mine
        ? {
            href: `/clubs/${mine.slug}`,
            tag: "Your club",
            title: mine.name,
            line: "Hours, classes and how busy it is now.",
            action: "Open your club",
            object: isClubId(mine.slug)
              ? clubObjects[mine.slug][0]
              : "location",
          }
        : undefined,
    },
  ]
}

/** The text of one list row. The parent link owns the row padding and the hover fill. */
export function NavItemBody({ item }: { item: NavItem }) {
  return (
    <span className="flex min-w-0 items-center gap-2 text-label">
      {item.title}
      {item.badge ? (
        <span className="rounded-sm bg-accent px-1.5 text-caption text-foreground">
          {item.badge}
        </span>
      ) : null}
    </span>
  )
}

/**
 * The callout card body: a Night field, the object cropped by the top-right corner, the copy at the
 * foot and one copper action. The parent link owns the click target and the focus ring.
 */
export function NavCalloutBody({
  callout,
  className,
}: {
  callout: NavCallout
  className?: string
}) {
  return (
    <span
      className={cn(
        "relative flex min-h-64 flex-col justify-end overflow-hidden rounded-lg bg-night p-5 pt-28 text-night-foreground",
        className
      )}
    >
      <span aria-hidden="true" className="absolute -top-2 -right-2 block w-28">
        <ObjectCrop
          id={callout.object}
          scheme="night"
          scale={1}
          x={0.1}
          y={0}
        />
      </span>
      <span className="relative">
        {callout.tag ? (
          <span className="mb-2 inline-block rounded-sm bg-night-fill px-1.5 text-caption">
            {callout.tag}
          </span>
        ) : null}
        <span className="font-display-wide block text-h3 text-balance">
          {callout.title}
        </span>
        <span className="mt-1 block text-caption text-night-muted">
          {callout.line}
        </span>
        <span className="mt-3 inline-flex items-center gap-1 text-label font-semibold text-[color-mix(in_oklab,var(--cat-strength)_60%,var(--neutral-1))]">
          {callout.action}
          <span aria-hidden="true">→</span>
        </span>
      </span>
    </span>
  )
}
