"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { LinkButton } from "@/components/brand/atoms"
import { Drawer } from "@/components/graphical"
import { ArrowLeft, ChevronRight, Search, User, X } from "@/components/icons"
import { Button } from "@/components/ui/button"
import { MEMBER_SIGN_IN_URL } from "@/lib/links"
import { useMyClub } from "./club-context"
import { ClubSwitcher } from "./club-switcher"
import { Logo } from "./logo"
import {
  moreLinks,
  NavCalloutBody,
  type NavGroupId,
  NavItemBody,
  navLinks,
  offerCallout,
  useNavTree,
} from "./nav-tree"

type Level = "root" | NavGroupId

/**
 * Full-screen two-level menu (spec 02 section 6.2). Level 2 slides in; focus moves to the panel title.
 * It renders the same tree as the desktop menus (nav-tree.tsx): the four groups at the root, and each
 * group's short list and callout one level down.
 * Built on the Graphical Drawer like web-app's nav drawer. It slides in from the right and swipes right to close.
 * The site-menu classes in app/globals.css keep the full-screen phone layout and the 420 px panel from 1024 px.
 * z 70 keeps it under the shared overlay (z 80 and 90), so the club switcher can open from inside the menu.
 */
export function MobileDrawer({
  open,
  onOpenChange,
  onSearch,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  onSearch: () => void
}) {
  const [level, setLevel] = useState<Level>("root")
  const title = useRef<HTMLHeadingElement>(null)
  const { club } = useMyClub()
  const tree = useNavTree()
  const group = tree.find((g) => g.id === level)
  // The group the visitor last opened. Back returns focus to its button, so a keyboard user keeps their place.
  const opened = useRef<string | null>(null)
  useEffect(() => {
    if (level !== "root") {
      opened.current = level
      title.current?.focus()
    } else if (opened.current) {
      document
        .querySelector<HTMLButtonElement>(
          `[data-menu-group="${opened.current}"]`
        )
        ?.focus()
    }
  }, [level])
  const nav = () => {
    onOpenChange(false)
    setLevel("root")
  }
  return (
    <Drawer.Root
      open={open}
      swipeDirection="right"
      onOpenChange={(o) => {
        onOpenChange(o)
        if (!o) setLevel("root")
      }}
    >
      <Drawer.Portal>
        <Drawer.Backdrop className="z-[70]" />
        <Drawer.Viewport className="site-menu-viewport z-[70]">
          {/* No padding or gap: the bars and the scroll area run to the edges. */}
          <Drawer.Popup className="site-menu gap-zero overflow-hidden p-zero outline-none">
            <Drawer.Content className="flex h-full flex-col gap-zero">
              {level === "root" ? (
                <div className="grid h-14 shrink-0 grid-cols-[44px_1fr_44px] items-center px-xs rule-b">
                  <Drawer.Close
                    aria-label="Close menu"
                    className="min-h-11 min-w-11"
                  >
                    <X className="size-4.5" aria-hidden="true" />
                  </Drawer.Close>
                  <div className="justify-self-center">
                    <Logo width={200} />
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Search clubs and classes"
                    onClick={onSearch}
                  >
                    <Search className="size-4.5" aria-hidden="true" />
                  </Button>
                </div>
              ) : (
                <div className="grid h-14 shrink-0 grid-cols-[44px_1fr_44px] items-center px-xs rule-b">
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Back to menu"
                    onClick={() => setLevel("root")}
                  >
                    <ArrowLeft className="size-4.5" aria-hidden="true" />
                  </Button>
                  <h2
                    ref={title}
                    tabIndex={-1}
                    className="font-display-wide text-center text-body-l outline-none font-medium"
                  >
                    {group?.label}
                  </h2>
                  <Drawer.Close
                    aria-label="Close menu"
                    className="min-h-11 min-w-11"
                  >
                    <X className="size-4.5" aria-hidden="true" />
                  </Drawer.Close>
                </div>
              )}
              <Drawer.Title className="sr-only">Site menu</Drawer.Title>
              <div className="min-h-0 flex-1 overflow-y-auto">
                {level === "root" || !group ? (
                  <div>
                    <div className="p-m">
                      <ClubSwitcher placement="block" />
                    </div>
                    <ul className="flex flex-col px-m">
                      {tree.map((g) => (
                        <li key={g.id}>
                          <button
                            type="button"
                            data-menu-group={g.id}
                            onClick={() => setLevel(g.id)}
                            className="font-display-wide flex min-h-14 w-full items-center justify-between text-body-l rule-b font-medium"
                          >
                            {g.label}
                            <ChevronRight
                              className="size-4.5 text-muted-foreground"
                              aria-hidden="true"
                            />
                          </button>
                        </li>
                      ))}
                      {navLinks.map((n) => (
                        <li key={n.href}>
                          <Link
                            href={n.href}
                            onClick={nav}
                            className="font-display-wide flex min-h-14 items-center text-body-l rule-b font-medium"
                          >
                            {n.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                    {/* Pages people look for less often: one quiet row of links, not more headings. */}
                    <ul className="flex flex-wrap gap-x-l px-m pt-xs">
                      {moreLinks.map((n) => (
                        <li key={n.href}>
                          <Link
                            href={n.href}
                            onClick={nav}
                            className="flex min-h-11 items-center text-body-s text-muted-foreground font-heavy"
                          >
                            {n.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                    {/* The offer that sat in the desktop top bar. One callout at the root, the same card as the menu. */}
                    <Link
                      href={offerCallout.href}
                      onClick={nav}
                      className="mx-m mt-m mb-l block corner-m"
                    >
                      <NavCalloutBody callout={offerCallout} />
                    </Link>
                  </div>
                ) : (
                  <div className="p-xs">
                    {/* The overview page first, the same as the desktop menu. */}
                    <div className="mb-xs">
                      <Link
                        href={group.overview.href}
                        onClick={nav}
                        className="flex min-h-12 items-center gap-xs corner-s px-s py-xs hover:bg-muted"
                      >
                        <NavItemBody item={group.overview} />
                        <span
                          aria-hidden="true"
                          className="text-muted-foreground"
                        >
                          →
                        </span>
                      </Link>
                    </div>
                    {group.sections.map((sec) => (
                      <div key={sec.label ?? group.id} className="mb-xs">
                        {sec.label ? (
                          <p className="px-s pt-s pb-xxs text-body-s text-muted-foreground">
                            {sec.label}
                          </p>
                        ) : null}
                        <ul>
                          {sec.items.map((i) => (
                            <li key={i.title}>
                              <Link
                                href={i.href}
                                onClick={nav}
                                className="flex min-h-12 items-center gap-xs corner-s px-s py-xs hover:bg-muted"
                              >
                                <NavItemBody item={i} />
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                    {group.callout ? (
                      <Link
                        href={group.callout.href}
                        onClick={nav}
                        className="mx-xs mt-xs mb-m block corner-m"
                      >
                        <NavCalloutBody callout={group.callout} />
                      </Link>
                    ) : null}
                  </div>
                )}
              </div>
              {/* The same button set as the desktop header, in the same order and styles: search in the top bar,
                then sign in (soft) and the free tour (filled). Join is one tap away through Membership. */}
              <div className="flex shrink-0 gap-s bg-card p-m rule-t">
                <LinkButton
                  href={MEMBER_SIGN_IN_URL}
                  external
                  variant="ghost"
                  aria-label="Member sign in"
                  className="flex-1"
                >
                  <User className="size-4.5" aria-hidden="true" />
                  Sign in
                </LinkButton>
                <LinkButton
                  href={club ? `/tour?club=${club.slug}` : "/tour"}
                  className="flex-[1.5]"
                  onClick={nav}
                >
                  Book a free tour
                </LinkButton>
              </div>
            </Drawer.Content>
          </Drawer.Popup>
        </Drawer.Viewport>
      </Drawer.Portal>
    </Drawer.Root>
  )
}
