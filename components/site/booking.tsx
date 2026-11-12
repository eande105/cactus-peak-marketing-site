"use client"

import Link from "next/link"
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react"
import { CategoryBadge, LinkButton } from "@/components/brand/atoms"
import { InstructorChip } from "@/components/brand/class-parts"
import { IntensityKeyDetails } from "@/components/brand/intensity-key"
import { CapacityIndicator, IntensityRibs } from "@/components/brand/meters"
import { Button } from "@/components/ui/button"
import {
  Overlay,
  OverlayDescription,
  OverlayPopup,
  OverlayTitle,
} from "@/components/ui/overlay"
import { Skeleton } from "@/components/ui/skeleton"
import { countOf } from "@/lib/labels"
import { classHref, MEMBER_SIGN_IN_URL } from "@/lib/links"
import { dayInfo, fmtTime } from "@/lib/time"
import type { Session } from "@/lib/types"
import { useCatalog, useClubNow } from "./catalog-context"

type Ctx = {
  open: (s: Session, kind: "book" | "waitlist") => void
  openPanel: (s: Session) => void
  closePanel: () => void
  /** The session whose details panel is open, so a page can keep it in the URL. */
  panel: Session | null
}
const C = createContext<Ctx>({
  open: () => {},
  openPanel: () => {},
  closePanel: () => {},
  panel: null,
})
export const useBooking = () => useContext(C)

/** Signed-out hand-off dialog (spec 03 section 6.6). */
export function BookingProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<{
    s: Session
    kind: "book" | "waitlist"
  } | null>(null)
  const [panel, setPanel] = useState<Session | null>(null)
  const open = useCallback(
    (s: Session, kind: "book" | "waitlist") => setState({ s, kind }),
    []
  )
  const openPanel = useCallback((s: Session) => setPanel(s), [])
  const closePanel = useCallback(() => setPanel(null), [])
  const v = useMemo(
    () => ({ open, openPanel, closePanel, panel }),
    [open, openPanel, closePanel, panel]
  )
  const now = useClubNow()
  const s = state?.s
  const d = s ? dayInfo(s.day, now.dayNum) : null
  return (
    <C.Provider value={v}>
      {children}
      <ClassPanel s={panel} onClose={() => setPanel(null)} />
      <Overlay open={!!state} onOpenChange={(o) => !o && setState(null)}>
        <OverlayPopup>
          {/* The title keeps XL space at its end for the corner close (dialog.md). */}
          <OverlayTitle className="pr-xl">
            {state?.kind === "waitlist"
              ? "Sign in to join the waitlist."
              : "Sign in to book."}
          </OverlayTitle>
          <OverlayDescription>
            {s?.className} · {d?.long}, {d?.month} {d?.dom},{" "}
            {s ? fmtTime(s.start) : ""} · {s?.clubName}
            {state?.kind === "waitlist" ? (
              <span className="mt-xs block text-body-s text-muted-foreground">
                We will text you if a spot opens. You have 30 minutes to
                confirm.
              </span>
            ) : null}
          </OverlayDescription>
          <div className="mt-s flex flex-col gap-s">
            <LinkButton href={MEMBER_SIGN_IN_URL} external size="lg">
              Sign in
            </LinkButton>
            <LinkButton href={`/trial?club=${s?.clubSlug}`} variant="outline">
              New here? Try a free 3-day pass
            </LinkButton>
            <LinkButton href={`/join/plan?club=${s?.clubSlug}`} variant="ghost">
              Join Cactus Peak
            </LinkButton>
          </div>
          <p className="text-body-s text-muted-foreground">
            Members book up to 7 days ahead. Summit members book 9.{" "}
            <Link
              href="/app"
              className="text-link underline underline-offset-4"
            >
              Members book in the app.
            </Link>
          </p>
        </OverlayPopup>
      </Overlay>
    </C.Provider>
  )
}

export function BookingStateButton({
  session,
  className,
  filled,
}: {
  session: Session
  className?: string
  filled?: boolean
}) {
  const { open } = useBooking()
  const now = useClubNow()
  const full = session.left === 0
  const started = session.day === 0 && session.start <= now.min
  if (started)
    return (
      <Button variant="outline" disabled className={className}>
        Started
      </Button>
    )
  return (
    <Button
      variant={filled ? "primary" : "outline"}
      size={filled ? "md" : "sm"}
      className={className}
      onClick={() => open(session, full ? "waitlist" : "book")}
    >
      {filled
        ? full
          ? "Join the waitlist in the app"
          : "Book in the app"
        : full
          ? "Waitlist"
          : "Book"}
      <span className="sr-only">
        {" "}
        {session.className}, {fmtTime(session.start)}
      </span>
    </Button>
  )
}

function ClassPanel({
  s,
  onClose,
}: {
  s: Session | null
  onClose: () => void
}) {
  const { classBySlug, clubBySlug } = useCatalog()
  const now = useClubNow()
  const ct = s ? classBySlug(s.classSlug) : null
  const pool = s ? clubBySlug(s.clubSlug)?.pool : undefined
  const d = s ? dayInfo(s.day, now.dayNum) : null
  return (
    <Overlay
      placement="bottom"
      open={!!s}
      onOpenChange={(o) => !o && onClose()}
    >
      {/* No popup padding: the Night time block runs to the edges. The close sits on Night, so it uses the Sand
          foreground (review 2, P0-1); the Graphical ghost close is dark text for light surfaces. */}
      <OverlayPopup
        label="Class details"
        className="p-zero"
        closeClassName="text-night-foreground hover:bg-night-fill"
      >
        {s && ct && d ? (
          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
            <div className="bg-night p-l pr-section text-night-foreground">
              <OverlayTitle className="sr-only">{ct.name}</OverlayTitle>
              <p className="eyebrow text-night-muted">
                {d.long}, {d.month} {d.dom}
              </p>
              <p className="tabular font-data text-display-m font-heavy">
                {fmtTime(s.start)}
              </p>
              <p className="text-body-s">{s.coach ?? "Self-guided"}</p>
              <div className="mt-m">
                <BookingStateButton session={s} filled />
              </div>
            </div>
            <div className="flex flex-col gap-m p-l">
              <CategoryBadge id={ct.category} name={ct.categoryName} />
              <h2 className="font-display-wide text-body-xxl font-heavy">
                {ct.name}
              </h2>
              <p className="text-body-s">
                {s.clubName}, {s.room}
              </p>
              <dl className="grid grid-cols-3 gap-s py-s rule-y">
                <div>
                  <dt className="eyebrow text-muted-foreground">Duration</dt>
                  <dd className="tabular text-body-s font-heavy">
                    {ct.duration} min
                  </dd>
                </div>
                <div>
                  <dt className="eyebrow text-muted-foreground">Intensity</dt>
                  <dd>
                    <IntensityRibs level={s.level} categoryId={ct.category} />
                  </dd>
                </div>
                <div>
                  <dt className="eyebrow text-muted-foreground">Spots</dt>
                  <dd>
                    {!s.live ? (
                      s.countsFailed ? (
                        <span className="text-body-s">Ask the desk</span>
                      ) : (
                        <Skeleton className="h-4 w-14" label="Loading spots" />
                      )
                    ) : s.left > 5 ? (
                      "Plenty"
                    ) : (
                      <CapacityIndicator
                        left={s.left}
                        capacity={s.capacity}
                        noun={s.unit === "bikes" ? "bikes" : "spots"}
                      />
                    )}
                  </dd>
                </div>
              </dl>
              <IntensityKeyDetails className="-mt-xs" />
              <InstructorChip
                name={s.coach}
                slug={s.coachSlug}
                size={40}
                href={
                  s.coachProfile && s.coachSlug
                    ? `/coaches/${s.coachSlug}`
                    : undefined
                }
              />
              <p className="text-body-m">{ct.blurb}</p>
              {ct.category === "aqua" ? (
                <p className="text-body-s">
                  {/pool/i.test(s.room)
                    ? /warm/i.test(s.room)
                      ? `This class is in the warm-water pool (90–92°F) at ${s.clubName}.`
                      : `This class is in the ${s.room.toLowerCase()} at ${s.clubName}. The warm-water pool (90–92°F) is at Dobson & Southern only.`
                    : `${
                        pool
                          ? `Pool at ${s.clubName}: ${pool.label.toLowerCase()}, ${countOf(pool.lanes, "lane")}. `
                          : ""
                      }The warm-water pool (90–92°F) is at Dobson & Southern only.`}
                </p>
              ) : null}
              <p className="text-body-s text-muted-foreground">
                Bring:{" "}
                {(ct.bring.length ? ct.bring.join(", ") : ct.gear).replace(
                  /\.$/,
                  ""
                )}
                . Cancel free up to 2 hours before.
              </p>
              <div className="flex flex-wrap items-center gap-s">
                <LinkButton href={classHref(ct)} variant="ghost">
                  See class details
                </LinkButton>
                <Link
                  href="/app"
                  className="inline-flex min-h-11 items-center text-body-s text-link underline-offset-4 hover:underline font-heavy"
                >
                  How booking in the app works
                </Link>
              </div>
            </div>
          </div>
        ) : null}
      </OverlayPopup>
    </Overlay>
  )
}

/** Whole-row tap target for the narrow schedule layout. */
export function RowOpen({
  s,
  onOpen,
}: {
  s: Session
  onOpen?: (s: Session) => void
}) {
  const { openPanel } = useBooking()
  return (
    <button
      type="button"
      onClick={() => (onOpen ?? openPanel)(s)}
      aria-label={`${s.className}, ${fmtTime(s.start)}. Open details`}
      className="absolute inset-0 z-0 @min-[780px]:hidden"
    />
  )
}
