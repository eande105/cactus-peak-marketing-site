"use client"

import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { LinkButton, TextLink } from "@/components/brand/atoms"
import { ClubCard } from "@/components/brand/club-parts"
import { Check, CircleCheck } from "@/components/icons"
import { useCatalog } from "@/components/site/catalog-context"
import { MinimalCheckoutHeader } from "@/components/site/chrome"
import { useMyClub } from "@/components/site/club-context"
import { Button } from "@/components/ui/button"
import { CheckRow, SelectControl } from "@/components/ui/controls"
import { Input } from "@/components/ui/input"
import { submitTrial } from "@/lib/forms/actions"
import { NETWORK_ERROR } from "@/lib/forms/messages"
import { scheduleUrl } from "@/lib/links"
import { isEmailOrPhone, useSessionState } from "@/lib/store"
import { Container, TourTimeline } from "./common"
import {
  ErrorSummary,
  Field,
  focusErrors,
  Honeypot,
  honeypotOf,
  serverErrors,
  TextField,
} from "./flow-ui"

type Pass = {
  club: string
  first: string
  contact: string
  remind: boolean
  id: string
}
const INIT: Pass = { club: "", first: "", contact: "", remind: false, id: "" }
export const usePass = () => useSessionState<Pass>("cpa_pass", INIT)

export function TrialFlow() {
  const sp = useSearchParams()
  const router = useRouter()
  const { club: mine } = useMyClub()
  const { clubs } = useCatalog()
  const [p, setP] = usePass()
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [busy, setBusy] = useState(false)
  // The summary shows only after a submit attempt. Before that, each field shows its own message on blur.
  const [tried, setTried] = useState(false)
  const [club, setClub] = useState("")
  const [locked, setLocked] = useState(false)
  // Reads the email handed over from the Home band row (sessionStorage, never the URL) once after mount.
  useEffect(() => {
    try {
      const e = sessionStorage.getItem("cpa_trial_email")
      if (e) {
        setP((q) => ({ ...q, contact: q.contact || e }))
        setLocked(true)
      }
    } catch {}
  }, [setP])
  const val = club || sp.get("club") || mine?.slug || ""
  const CONTACT_MSG =
    "Enter an email like name@example.com or a 10-digit mobile number."
  // Check the contact field when the visitor leaves it, and clear the message once it is valid.
  const checkContact = (v: string) =>
    setErrors((e) => {
      const msg = isEmailOrPhone(v) ? "" : CONTACT_MSG
      if ((e.contact ?? "") === msg) return e
      const { contact: _drop, ...rest } = e
      return msg ? { ...rest, contact: msg } : rest
    })
  const checkFirst = (v: string) =>
    setErrors((e) => {
      const msg = v.trim() ? "" : "Enter your first name."
      if ((e.first ?? "") === msg) return e
      const { first: _drop, ...rest } = e
      return msg ? { ...rest, first: msg } : rest
    })
  const checkClub = (v: string) =>
    setErrors((e) => {
      const msg = v ? "" : "Pick a club."
      if ((e.club ?? "") === msg) return e
      const { club: _drop, ...rest } = e
      return msg ? { ...rest, club: msg } : rest
    })
  const submit = async (form: HTMLFormElement) => {
    setTried(true)
    const e: Record<string, string> = {}
    if (!val) e.club = "Pick a club."
    if (!p.first.trim()) e.first = "Enter your first name."
    if (!isEmailOrPhone(p.contact)) e.contact = CONTACT_MSG
    setErrors(e)
    if (Object.keys(e).length) {
      focusErrors()
      return
    }
    setBusy(true)
    const r = await submitTrial({
      club: val,
      firstName: p.first,
      contact: p.contact,
      remind: p.remind,
      company: honeypotOf(form),
    }).catch(() => null)
    if (!r?.ok) {
      setBusy(false)
      setErrors(r ? serverErrors(r) : { form: NETWORK_ERROR })
      focusErrors()
      return
    }
    // The pass code and the visitor's details stay in this tab's sessionStorage for the confirmation page.
    setP((q) => ({ ...q, club: val, id: r.code }))
    router.push("/trial/confirmed")
  }
  return (
    <>
      <MinimalCheckoutHeader />
      <main id="main" tabIndex={-1} className="flex-1 outline-none">
        <Container className="grid gap-xxl pt-xl pb-section lg:grid-cols-12 lg:gap-xxl lg:pt-section">
          <div className="lg:col-span-7">
            <h1 className="font-display-wide text-display-m lg:text-display-xl font-heavy lg:font-heavy">
              Try us for 3 days. Free.
            </h1>
            <p className="mt-m max-w-[48ch] text-body-m">
              Use one club for 3 days in a row, starting at your first check-in.
              No card, no catch.
            </p>
            <ul className="mt-l flex flex-col gap-s text-body-m">
              {[
                "Every class at one club, and its pool if it has one",
                "Strength and cardio floor",
                "A coach to say hello",
              ].map((t) => (
                <li key={t} className="flex items-center gap-s">
                  <Check className="size-5 text-success" aria-hidden="true" />
                  {t}
                </li>
              ))}
            </ul>
            <p className="mt-s text-body-m text-muted-foreground">
              Courts and the recovery suite are not part of the pass. Ask about
              them on a tour.
            </p>
            {/* Pass holders book at the desk or by phone. The app is for members only (00-foundation.md 4.1). */}
            <p className="mt-s text-body-m">
              Book a class with room at the front desk or by calling the club,
              up to 1 day ahead.
            </p>
            <h2 className="sr-only">What happens next</h2>
            <div className="mt-xxl">
              <TourTimeline
                labels={["Today", "Your first visit", "Day 3"]}
                steps={[
                  { title: "Get your pass.", text: "We email it and text it." },
                  {
                    title: "Show it at the desk.",
                    text: "Bring photo ID. Your pass starts at your first check-in.",
                  },
                  {
                    title: "Your pass ends.",
                    text: "No charge. Nothing to cancel.",
                  },
                ]}
              />
            </div>
          </div>
          <div className="lg:col-span-5">
            <form
              noValidate
              onSubmit={(e) => {
                e.preventDefault()
                submit(e.currentTarget)
              }}
              className="relative flex flex-col gap-l corner-m bg-card p-l hairline ring-border lg:sticky lg:top-8"
            >
              <h2 className="font-display-wide text-body-xxl font-heavy">
                Get my free pass.
              </h2>
              <ErrorSummary errors={errors} show={tried} />
              <Honeypot />
              <Field label="Club" error={errors.club} required>
                {(a) => (
                  <SelectControl
                    {...a}
                    value={val}
                    onChange={(v) => {
                      setClub(v)
                      if (errors.club) checkClub(v)
                    }}
                    options={[
                      { value: "", label: "Pick a club" },
                      ...clubs.map((c) => ({ value: c.slug, label: c.name })),
                    ]}
                  />
                )}
              </Field>
              <TextField
                label="First name"
                required
                value={p.first}
                onChange={(v) => {
                  setP((q) => ({ ...q, first: v }))
                  if (errors.first && v.trim()) checkFirst(v)
                }}
                onBlur={() => checkFirst(p.first)}
                error={errors.first}
                autoComplete="given-name"
              />
              <Field
                label="Email or mobile number"
                error={errors.contact}
                help="We send your pass here."
                required
              >
                {(a) => (
                  <div className="flex gap-xs">
                    <Input
                      {...a}
                      value={p.contact}
                      readOnly={locked}
                      onChange={(e) => {
                        setP((q) => ({ ...q, contact: e.target.value }))
                        if (errors.contact && isEmailOrPhone(e.target.value))
                          checkContact(e.target.value)
                      }}
                      onBlur={(e) => checkContact(e.target.value)}
                      className="bg-card"
                      autoComplete="email"
                      autoCapitalize="none"
                      spellCheck={false}
                    />
                    {locked ? (
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setLocked(false)}
                      >
                        Change
                      </Button>
                    ) : null}
                  </div>
                )}
              </Field>
              <CheckRow
                checked={p.remind}
                onChange={(c) => setP((q) => ({ ...q, remind: c }))}
              >
                Text me a reminder on day 2
              </CheckRow>
              <Button type="submit" size="lg" loading={busy}>
                Get my free pass
              </Button>
              <p className="text-body-s text-muted-foreground">
                One pass per person every 12 months. Ages 18 and up. Your 3 days
                start at your first check-in. No card needed. By continuing you
                agree to our{" "}
                <Link className="underline" href="/legal/terms">
                  Terms
                </Link>{" "}
                and{" "}
                <Link className="underline" href="/legal/privacy">
                  Privacy policy
                </Link>
                .
              </p>
              <TextLink href="/tour">
                Prefer a guided look? Book a free tour.
              </TextLink>
            </form>
          </div>
        </Container>
      </main>
    </>
  )
}

/** Sample QR: a deterministic pattern with the three finder squares. A real build renders a code from the pass ID server side. */
function SampleQR({ seed }: { seed: string }) {
  const N = 25
  const st = { h: 11 }
  for (const ch of seed) st.h = (st.h * 33 + ch.charCodeAt(0)) >>> 0
  const rnd = () => {
    st.h = (st.h * 1664525 + 1013904223) >>> 0
    return st.h / 2 ** 32
  }
  const cells: boolean[][] = Array.from({ length: N }, () =>
    Array.from({ length: N }, () => rnd() > 0.52)
  )
  const finder = (x: number, y: number) => {
    for (let i = -1; i < 8; i++)
      for (let j = -1; j < 8; j++) {
        const xx = x + i,
          yy = y + j
        if (xx < 0 || yy < 0 || xx >= N || yy >= N) continue
        const edge = i === 0 || j === 0 || i === 6 || j === 6
        const core = i >= 2 && i <= 4 && j >= 2 && j <= 4
        cells[yy][xx] = i >= 0 && j >= 0 && i <= 6 && j <= 6 && (edge || core)
      }
  }
  finder(0, 0)
  finder(N - 7, 0)
  finder(0, N - 7)
  return (
    <svg
      viewBox={`0 0 ${N} ${N}`}
      className="size-full"
      role="img"
      aria-label="Sample QR code"
      shapeRendering="crispEdges"
    >
      {cells.flatMap((r, y) =>
        r.map((on, x) =>
          on ? (
            <rect
              // biome-ignore lint/suspicious/noArrayIndexKey: decorative QR cells are a static grid
              key={`${x}-${y}`}
              x={x}
              y={y}
              width="1"
              height="1"
              style={{ fill: "var(--neutral-10)" }}
            />
          ) : null
        )
      )}
    </svg>
  )
}

export function TrialConfirmed() {
  const [p, , ready] = usePass()
  const { clubBySlug } = useCatalog()
  if (!ready) return null
  const c = clubBySlug(p.club)
  if (!c || !p.id)
    return (
      <Container className="py-section">
        <h1 className="font-display-wide text-display-m font-heavy">
          No pass yet.
        </h1>
        <LinkButton href="/trial" className="mt-m">
          Get my free pass
        </LinkButton>
      </Container>
    )
  return (
    <Container className="grid gap-xxl py-xxl lg:grid-cols-12 lg:py-section">
      <div className="lg:col-span-7">
        <CircleCheck className="size-12 text-success" aria-hidden="true" />
        <h1 className="font-display-wide mt-s text-display-m font-heavy">
          Your pass is ready{p.first ? `, ${p.first}` : ""}.
        </h1>
        <p className="mt-xs text-body-m">
          Show it at the {c.name} desk. Bring photo ID.
        </p>
        <div className="mt-l corner-m bg-card p-l hairline ring-border">
          <div className="mx-auto size-60 corner-m bg-surface p-s hairline ring-border">
            <SampleQR seed={p.id} />
          </div>
          <p className="eyebrow mt-m text-muted-foreground">3-day pass</p>
          <p className="font-display-wide text-body-l font-medium">{c.name}</p>
          <p className="text-body-m text-muted-foreground">
            Valid for 3 days in a row from your first check-in
          </p>
          <p className="tabular mt-xs font-data text-display-m font-heavy">
            PASS {p.id}
          </p>
        </div>
        <div className="mt-m flex flex-wrap items-center gap-m">
          <Button variant="secondary" onClick={() => window.print()}>
            Print pass
          </Button>
          <LinkButton href="/" variant="outline">
            Done
          </LinkButton>
        </div>
      </div>
      <div className="lg:col-span-5">
        <TextLink href={scheduleUrl({ club: c.slug, firstTimer: true })}>
          Next: pick a class
        </TextLink>
        <p className="text-body-m text-muted-foreground">
          Book a class with room at the front desk or by calling {c.name} at{" "}
          <a
            className="tabular font-heavy text-link underline underline-offset-4"
            href={`tel:${c.tel}`}
          >
            {c.phone}
          </a>
          , up to 1 day ahead.
        </p>
        <div className="mt-l corner-m bg-muted p-l">
          <h2 className="font-display-wide text-body-l font-medium">
            Want a guided look?
          </h2>
          <p className="mt-xxs text-body-s">
            Book a free tour on your first day.
          </p>
          <LinkButton
            href={`/tour?club=${c.slug}`}
            variant="outline"
            className="mt-s"
          >
            Book a free tour
          </LinkButton>
        </div>
        <div className="mt-l corner-m bg-card hairline ring-border">
          <ClubCard club={c} />
        </div>
        <p className="mt-m text-body-m text-muted-foreground">
          {c.cross}, {c.city}. {c.parking}
        </p>
      </div>
    </Container>
  )
}
