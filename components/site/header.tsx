"use client"

import { NavigationMenu as BaseNavigationMenu } from "@base-ui/react/navigation-menu"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { LinkButton } from "@/components/brand/atoms"
import { NavigationMenu } from "@/components/graphical"
import { themePart } from "@/components/graphical/components/library/component-theme"
import { ChevronDown, Menu, Search, User } from "@/components/icons"
import { Button } from "@/components/ui/button"
import { MEMBER_SIGN_IN_URL } from "@/lib/links"
import { cn } from "@/lib/utils"
import { useMyClub } from "./club-context"
import { Logo } from "./logo"
import { MobileDrawer } from "./mobile-drawer"
import {
  NavCalloutBody,
  type NavGroup,
  type NavGroupId,
  type NavItem,
  NavItemBody,
  navLinks,
  useNavTree,
} from "./nav-tree"
import { SearchDialog } from "./search-dialog"

// A top-level link takes the navigation-menu trigger treatment, so links and menu triggers in the bar look the same.
const BarLink = themePart(
  BaseNavigationMenu.Link,
  "navigation-menu",
  "trigger",
  "ui-button"
)

// A link row inside a menu panel. The Graphical link part owns the radius, type and hover fill.
// closeOnClick closes the panel when the visitor follows the link.
function MenuLink({ item, arrow }: { item: NavItem; arrow?: boolean }) {
  return (
    <NavigationMenu.Link
      closeOnClick
      render={<Link href={item.href} />}
      // On the Sand popup the theme's Sand hover fill does not show, so the row takes the next step down.
      className="min-h-11 justify-start gap-2 px-3 py-2 group-data-[solid=true]/popup:hover:bg-muted"
    >
      <NavItemBody item={item} />
      {arrow ? (
        <span aria-hidden="true" className="text-muted-foreground">
          →
        </span>
      ) : null}
    </NavigationMenu.Link>
  )
}

/**
 * One menu panel: plain page names under a small label, then the callout. The overview link comes
 * first because the trigger opens the menu and does not go to the page. Text only, so the panel
 * reads as one list (references: the shadcn "simple list" menu, and Faire and lululemon on Mobbin).
 */
function MenuPanel({ group }: { group: NavGroup }) {
  return (
    <div className="flex gap-4 p-3">
      <div className="flex flex-col">
        <MenuLink item={group.overview} arrow />
        {group.sections.map((s) => (
          <div
            key={s.label ?? group.id}
            // A list of names takes its longest name, so no name (or the "Your club" badge) wraps.
            className="flex w-max min-w-52 flex-col"
          >
            {s.label ? (
              <p className="px-3 pt-2 pb-1 text-caption text-muted-foreground">
                {s.label}
              </p>
            ) : null}
            <ul>
              {s.items.map((i) => (
                <li key={i.title}>
                  <MenuLink item={i} />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      {group.callout ? (
        <BaseNavigationMenu.Link
          closeOnClick
          render={<Link href={group.callout.href} />}
          className="flex w-60 shrink-0 rounded-lg"
        >
          <NavCalloutBody callout={group.callout} className="w-full" />
        </BaseNavigationMenu.Link>
      ) : null}
    </div>
  )
}

/** The path a group owns, so its trigger can mark the current section. */
const inGroup = (g: NavGroup, path: string) =>
  [g.overview, ...g.sections.flatMap((s) => s.items)].some((i) => {
    const base = i.href.split(/[?#]/)[0]
    return path === base || path.startsWith(`${base}/`)
  })

export function SiteHeader() {
  const pathname = usePathname()
  const tree = useNavTree()
  const { club } = useMyClub()
  const [menu, setMenu] = useState<NavGroupId | null>(null)
  const [drawer, setDrawer] = useState(false)
  const [search, setSearch] = useState(false)
  // Only the scroll position sets the bar's surface. An open menu does not, so the bar stays bare at the top.
  const [solid, setSolid] = useState(false)

  useEffect(() => {
    // The bar turns solid past 8px and bare again only at the very top, so a small bounce near the
    // threshold does not make it flicker.
    const read = () =>
      setSolid((was) => (was ? window.scrollY > 0 : window.scrollY > 8))
    read()
    window.addEventListener("scroll", read, { passive: true })
    return () => window.removeEventListener("scroll", read)
  }, [])
  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      // No single-key shortcut: it would fire for speech-input and keyboard users by accident (WCAG 2.1.4).
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setSearch(true)
      }
    }
    window.addEventListener("keydown", k)
    return () => window.removeEventListener("keydown", k)
  }, [])

  return (
    <>
      {/* One row: the brand, five top items (one menu and four pages), then search, sign in and the tour
          (references: Ramp, Claude and Coda on Mobbin). */}
      {/* At the top of the page the bar sits on the page itself, with no surface or rule. Once the page
          scrolls, the bar takes the card surface and a 1px rule, so it stays
          readable over the content that passes under it. */}
      <header
        data-solid={solid}
        className={cn(
          // The surface and the rule change together on the theme's large motion. The bare state keeps a
          // transparent rule of the same shape, so only its colour animates.
          "group/header sticky top-0 z-50 transition-[background-color,box-shadow] duration-(--motion-large-duration) ease-(--motion-large-easing) motion-reduce:transition-none",
          solid
            ? "bg-card shadow-[0_var(--border-s)_0_0_var(--border)]"
            : "bg-transparent shadow-[0_var(--border-s)_0_0_transparent]"
        )}
      >
        {/* The bar collapses in steps, each set from the measured widths of its parts (logo 200, the brand minimum; symbol 40; nav 554,
            search 44, sign in 99, tour 158; gaps 8 to 16):
            - below 768: menu, logo (the symbol below 640), search. The phone action bar carries the tour and Join,
              and the drawer carries sign in.
            - 768 to 1023: sign in and the tour join the bar. The nav stays in the drawer.
            - 1024 to 1279: the nav fits only beside the symbol.
            - 1280 and up: the full logo comes back.
            The drawer holds the full tree, sign in and the tour, so nothing is lost at any step. */}
        <div className="mx-auto flex h-16 w-full max-w-[1200px] items-center gap-2 px-4 sm:px-6 md:gap-4 lg:px-8">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Open menu"
            aria-expanded={drawer}
            onClick={() => setDrawer(true)}
            className="-ml-2 size-11 md:-ml-3 lg:hidden"
          >
            <Menu className="size-4.5" aria-hidden="true" />
          </Button>
          <Logo width={200} className="max-sm:hidden lg:max-xl:hidden" />
          <Logo width={40} symbolOnly className="sm:max-lg:hidden xl:hidden" />
          {/* Graphical NavigationMenu on Base UI. The primitive owns hover intent, arrow keys between triggers,
              Escape, focus return and outside dismissal. The popup follows the open trigger and takes the size
              of its panel, so it resizes and slides between menus (the Base UI navigation-menu pattern). */}
          <NavigationMenu.Root
            aria-label="Primary"
            value={menu}
            onValueChange={(v) => setMenu(v as NavGroupId | null)}
            delay={100}
            closeDelay={150}
            className="hidden lg:block xl:ml-4"
          >
            <NavigationMenu.List>
              {tree.map((g) => (
                <NavigationMenu.Item key={g.id} value={g.id}>
                  <NavigationMenu.Trigger
                    className={cn(
                      // Five top items, so the items sit 4px closer than the Graphical default to leave the logo its width.
                      "gap-1 px-2",
                      // The trigger's hover and open fills are Sand, the page colour. On the bare bar they take the
                      // card colour instead, so the open menu's trigger still reads as open.
                      "group-data-[solid=false]/header:hover:bg-card group-data-[solid=false]/header:data-popup-open:bg-card",
                      // The underline marks the current section. It is a pseudo-element, so it does not touch
                      // the Graphical trigger surface.
                      inGroup(g, pathname) &&
                        "relative after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:bg-primary"
                    )}
                  >
                    {g.label}
                    <NavigationMenu.Icon className="inline-flex transition-transform duration-(--motion-duration) data-popup-open:rotate-180 motion-reduce:transition-none">
                      <ChevronDown aria-hidden="true" />
                    </NavigationMenu.Icon>
                  </NavigationMenu.Trigger>
                  <NavigationMenu.Content
                    aria-label={`${g.label} menu`}
                    className="nav-panel"
                  >
                    <MenuPanel group={g} />
                  </NavigationMenu.Content>
                </NavigationMenu.Item>
              ))}
              {navLinks.map((n) => {
                const active =
                  pathname === n.href || pathname.startsWith(`${n.href}/`)
                return (
                  <NavigationMenu.Item key={n.href}>
                    <BarLink
                      render={<Link href={n.href} />}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "px-2 group-data-[solid=false]/header:hover:bg-card",
                        active &&
                          "relative after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:bg-primary"
                      )}
                    >
                      {n.label}
                    </BarLink>
                  </NavigationMenu.Item>
                )
              })}
            </NavigationMenu.List>
            <NavigationMenu.Portal>
              <NavigationMenu.Positioner
                side="bottom"
                align="start"
                sideOffset={8}
                collisionPadding={16}
                collisionAvoidance={{ side: "none", align: "shift" }}
                className="nav-positioner z-50"
              >
                {/* The panels are wider than the 420 px dropdown cap in the Graphical spec. Surface, edge,
                    shadow and motion stay Graphical. The solid bar is the card colour, so under it the popup
                    takes Sand and reads as its own layer. On the bare bar it keeps the card colour. */}
                <NavigationMenu.Popup
                  data-solid={solid}
                  className={cn(
                    "nav-popup group/popup h-(--popup-height) max-h-none w-(--popup-width) max-w-(--available-width) overflow-hidden",
                    solid && "bg-background"
                  )}
                >
                  <NavigationMenu.Viewport className="relative size-full overflow-hidden" />
                </NavigationMenu.Popup>
              </NavigationMenu.Positioner>
            </NavigationMenu.Portal>
          </NavigationMenu.Root>
          {/* The header's button set (one per audience, in rising weight): search for everyone, sign in for
              members, and the free tour for prospects. The tour is the brand's first goal and the header is the
              only part of every page that stays on screen, so it holds the one filled button. Join is one click
              away through Membership, whose plan cards start the join flow. */}
          <div className="ml-auto flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Search clubs and classes"
              title="Search (Ctrl K or ⌘ K)"
              onClick={() => setSearch(true)}
              className="size-11"
            >
              <Search className="size-4.5" aria-hidden="true" />
            </Button>
            {/* Phones: a plain text link. Members sign in often, and the drawer was the only place for it. */}
            <a
              href={MEMBER_SIGN_IN_URL}
              target="_blank"
              rel="noopener"
              aria-label="Member sign in"
              className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md px-2 text-label text-link underline-offset-4 hover:underline md:hidden"
            >
              Sign in
            </a>
            <LinkButton
              href={MEMBER_SIGN_IN_URL}
              external
              variant="ghost"
              aria-label="Member sign in"
              // The soft fill is one step darker than the card; on the bare page it takes the card colour,
              // so it still reads as a button against the Sand. It changes on the bar's motion.
              className="hidden duration-(--motion-large-duration) ease-(--motion-large-easing) group-data-[solid=false]/header:bg-card md:inline-flex"
            >
              <User className="size-4.5" aria-hidden="true" />
              {/* From 1024 to 1279 the five top items leave no room for the word, so the icon stands alone. */}
              <span className="lg:max-xl:sr-only">Sign in</span>
            </LinkButton>
            <LinkButton
              href={club ? `/tour?club=${club.slug}` : "/tour"}
              className="hidden md:inline-flex"
            >
              Book a free tour
            </LinkButton>
          </div>
        </div>
        {/* Dims the page under an open panel. It lives inside the sticky header so it starts at the header's lower
            edge and stays behind the header. A press on it is an outside press, so the menu closes. */}
        {/* It stays mounted and fades both ways with the panel; closed, it takes no pointer events. */}
        <div
          aria-hidden="true"
          className={cn(
            "absolute inset-x-0 top-full -z-10 h-dvh bg-night/20 transition-opacity duration-(--motion-large-duration) ease-(--motion-large-easing) motion-reduce:transition-none",
            menu ? "opacity-100" : "pointer-events-none opacity-0"
          )}
        />
      </header>
      <MobileDrawer
        open={drawer}
        onOpenChange={setDrawer}
        onSearch={() => {
          setDrawer(false)
          setSearch(true)
        }}
      />
      <SearchDialog open={search} onOpenChange={setSearch} />
    </>
  )
}
