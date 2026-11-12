"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { CoachAvatar } from "@/components/brand/class-parts"
import { GymObject } from "@/components/brand/graphics"
import { Toggle, ToggleGroup } from "@/components/graphical"
import { Check, Share2 } from "@/components/icons"
import { useBooking } from "@/components/site/booking"
import { useCatalog, useClubNow } from "@/components/site/catalog-context"
import { Button } from "@/components/ui/button"
import { SelectControl, Textarea } from "@/components/ui/controls"
import { Input } from "@/components/ui/input"
import { submitContact, submitSignup } from "@/lib/forms/actions"
import { NETWORK_ERROR } from "@/lib/forms/messages"
import { isEmail } from "@/lib/store"
import { dayInfo } from "@/lib/time"
import type { ClubSlug, Session } from "@/lib/types"
import {
  ErrorSummary,
  Field,
  focusErrors,
  Honeypot,
  honeypotOf,
  serverErrors,
  TextField,
} from "./flow-ui"

export function HandoffButton({
  label,
  classSlug,
  club,
  start,
  day = 0,
  variant = "outline",
}: {
  label: string
  classSlug: string
  club: ClubSlug
  start: number
  day?: number
  variant?: "outline" | "primary"
}) {
  const { open } = useBooking()
  const { classBySlug, clubBySlug } = useCatalog()
  const now = useClubNow()
  const ct = classBySlug(classSlug)
  const c = clubBySlug(club)
  if (!ct || !c) return null
  // A stand-in session for the sign-in hand-off dialog. Reservations (courts, lanes) are not in the class timetable.
  const session: Session = {
    id: `handoff-${club}-${classSlug}`,
    classSlug,
    className: ct.name,
    category: ct.category,
    categoryName: ct.categoryName,
    duration: ct.duration,
    level: ct.level,
    unit: ct.unit,
    clubSlug: club,
    clubName: c.name,
    clubShort: c.short,
    day,
    date: dayInfo(day, now.dayNum).iso,
    start,
    room: "",
    coach: null,
    coachSlug: null,
    coachProfile: false,
    capacity: ct.capacity,
    left: ct.capacity,
    waitlist: 0,
    live: true,
    countsFailed: false,
  }
  return (
    <Button variant={variant} onClick={() => open(session, "book")}>
      {label}
    </Button>
  )
}

export function ShareButton({
  label = "Send this to a parent",
}: {
  label?: string
}) {
  const [msg, setMsg] = useState("")
  return (
    <>
      <Button
        variant="outline"
        onClick={async () => {
          const url = window.location.href
          try {
            if (navigator.share)
              await navigator.share({ title: "Cactus Peak Athletic", url })
            else {
              await navigator.clipboard.writeText(url)
              setMsg("Link copied.")
            }
          } catch {
            setMsg("")
          }
        }}
      >
        <Share2 aria-hidden="true" />
        {label}
      </Button>
      <span role="status" className="text-caption text-muted-foreground">
        {msg}
      </span>
    </>
  )
}

export function Tabs2<T extends string>({
  items,
  value,
  onChange,
  label,
}: {
  items: { id: T; label: string }[]
  value: T
  onChange: (v: T) => void
  label: string
}) {
  // A single-choice Graphical ToggleGroup, not Tabs: the callers filter one list below, so no tab panel exists for
  // a tab to control. The props stay as they were.
  return (
    <ToggleGroup
      aria-label={label}
      value={[value]}
      onValueChange={(v) => {
        if (v[0] !== undefined) onChange(v[0] as T)
      }}
      className="-m-1 max-w-[calc(100%+0.5rem)] overflow-x-auto p-1"
    >
      {items.map((t) => (
        <Toggle key={t.id} value={t.id} className="min-h-11 shrink-0">
          {t.label}
        </Toggle>
      ))}
    </ToggleGroup>
  )
}

const TOPICS = [
  "Tour or pass",
  "Membership",
  "Billing",
  "Kids club",
  "Personal training",
  "Careers",
  "Press",
  "Something else",
]

export function ContactForm({
  defaults,
}: {
  defaults: {
    topic?: string
    club?: string
    message?: string
    /** A coach's slug, when the visitor came from that coach's page. */
    coach?: string
  }
}) {
  const { clubs, coaches } = useCatalog()
  const coach = coaches.find((c) => c.slug === defaults.coach)
  // The visitor can take the coach off the message. The form then works as it does with no coach.
  const [toCoach, setToCoach] = useState(Boolean(coach))
  const forCoach = toCoach ? coach : undefined
  const [v, setV] = useState({
    first: "",
    email: "",
    topic: defaults.topic ?? "",
    // A message to a coach starts at the coach's first club, so the desk that gets it is one where they train.
    club: defaults.club ?? coach?.clubs[0] ?? "",
    message: defaults.message ?? "",
  })
  const formRef = useRef<HTMLFormElement>(null)
  // The thank-you heading takes focus when it replaces the form, so focus does not fall to the page.
  const doneRef = useRef<HTMLHeadingElement>(null)
  const now = useClubNow()
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [sent, setSent] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  // We answer by the next weekday.
  const replyBy = (() => {
    for (let i = 1; i < 4; i++) {
      const d = dayInfo(i, now.dayNum)
      if (!d.weekend) return `${d.short}, ${d.month} ${d.dom}`
    }
    return "Monday"
  })()
  const submit = async () => {
    const e: Record<string, string> = {}
    if (!v.first.trim()) e.first = "Enter your first name."
    if (!isEmail(v.email)) e.email = "Enter an email like name@example.com."
    if (v.message.trim().length < 10)
      e.message = "Write at least 10 characters so we can help."
    setErrors(e)
    if (Object.keys(e).length) {
      focusErrors()
      return
    }
    setBusy(true)
    const r = await submitContact({
      first: v.first,
      email: v.email,
      // contact_messages has no coach column, so the coach's name rides in the topic, where the desk reads it.
      topic: forCoach
        ? `${v.topic || "Personal training"} · Coach: ${forCoach.name}`
        : v.topic,
      club: v.club,
      message: v.message,
      company: formRef.current ? honeypotOf(formRef.current) : "",
    }).catch(() => null)
    setBusy(false)
    if (!r?.ok) {
      setErrors(r ? serverErrors(r) : { form: NETWORK_ERROR })
      focusErrors()
      return
    }
    setSent(v.first)
    setV((x) => ({ ...x, message: "" }))
  }
  useEffect(() => {
    if (sent) doneRef.current?.focus()
  }, [sent])
  if (sent)
    return (
      <div className="flex flex-col items-start gap-4 rounded-2xl bg-card p-6 edge ring-border sm:p-8">
        <span className="grid size-12 place-items-center rounded-full bg-[var(--cat-strength)] text-[var(--neutral-1)]">
          <Check className="size-6" aria-hidden="true" />
        </span>
        <div>
          <h3
            ref={doneRef}
            tabIndex={-1}
            className="font-display-wide text-h2 outline-none"
          >
            Thanks, {sent}.
          </h3>
          <p className="mt-1 text-body text-muted-foreground">
            {forCoach
              ? `We will pass it to ${forCoach.first} and reply by ${replyBy}.`
              : `A person at the front desk will reply by ${replyBy}.`}
          </p>
        </div>
        <Button variant="outline" onClick={() => setSent(null)}>
          Send another
        </Button>
      </div>
    )
  return (
    // One card in three parts: who reads it, the fields, and a footer with the privacy note and the send action.
    <form
      ref={formRef}
      noValidate
      onSubmit={(e) => {
        e.preventDefault()
        submit()
      }}
      className="relative overflow-hidden rounded-2xl bg-card edge ring-border"
    >
      <div className="flex items-center gap-4 px-6 py-5 rule-b sm:px-8">
        <span
          aria-hidden="true"
          className="grid size-12 shrink-0 place-items-center rounded-full bg-night"
        >
          <GymObject id="envelope" scheme="night" className="size-7" />
        </span>
        <div className="min-w-0">
          <p className="font-display-wide text-h3">To the front desk</p>
          <p className="text-caption text-muted-foreground">
            We reply by {replyBy}.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-6 p-6 sm:p-8">
        <ErrorSummary errors={errors} />
        {forCoach ? (
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-lg bg-muted p-3">
            <CoachAvatar slug={forCoach.slug} name={forCoach.name} size={40} />
            <p className="min-w-0 flex-1 text-body">
              To <span className="font-semibold">{forCoach.name}</span>, by way
              of the front desk.
            </p>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={(e) => {
                // The button leaves with the banner, so focus moves to the first field instead of the page.
                const form = e.currentTarget.closest("form")
                setToCoach(false)
                requestAnimationFrame(() =>
                  form
                    ?.querySelector<HTMLInputElement>(
                      "input:not([type=hidden])"
                    )
                    ?.focus()
                )
              }}
            >
              Not for a coach
            </Button>
          </div>
        ) : null}

        {/* The topic as one-tap chips: a visitor sees every reason at once instead of opening a menu. Tapping the
            chosen topic again clears it, because the topic is optional. */}
        <fieldset>
          <legend className="text-label">
            What is it about?
            <span className="font-normal text-muted-foreground">
              {" "}
              (optional)
            </span>
          </legend>
          <ToggleGroup
            value={v.topic ? [v.topic] : []}
            onValueChange={(x) => setV({ ...v, topic: String(x[0] ?? "") })}
            className="mt-3 flex flex-wrap gap-2"
          >
            {TOPICS.map((t) => (
              <Toggle
                key={t}
                value={t}
                className="min-h-10 rounded-full px-4 ring-1 ring-border ring-inset"
              >
                {t}
              </Toggle>
            ))}
          </ToggleGroup>
        </fieldset>

        <div className="grid gap-5 sm:grid-cols-2">
          <TextField
            label="First name"
            required
            value={v.first}
            onChange={(x) => setV({ ...v, first: x })}
            error={errors.first}
            autoComplete="given-name"
          />
          <TextField
            label="Email"
            required
            type="email"
            value={v.email}
            onChange={(x) => setV({ ...v, email: x })}
            error={errors.email}
            autoComplete="email"
          />
        </div>
        <Field label="Club">
          {(p) => (
            <SelectControl
              {...p}
              value={v.club}
              onChange={(club) => setV({ ...v, club })}
              options={[
                { value: "", label: "Any club" },
                ...clubs.map((c) => ({ value: c.slug, label: c.name })),
              ]}
            />
          )}
        </Field>
        <Field label="Message" error={errors.message} required>
          {(p) => (
            <Textarea
              {...p}
              rows={6}
              maxLength={1000}
              placeholder="How can we help?"
              value={v.message}
              onChange={(e) => setV({ ...v, message: e.target.value })}
            />
          )}
        </Field>
        {v.message.length >= 900 ? (
          <p className="tabular -mt-4 text-caption">
            {v.message.length} of 1000
          </p>
        ) : null}
      </div>

      <Honeypot />

      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-4 bg-muted/50 px-6 py-4 rule-t sm:px-8">
        <p className="text-caption text-muted-foreground">
          We use this only to answer you.{" "}
          <Link href="/legal/privacy" className="underline">
            Privacy policy
          </Link>
          .
        </p>
        <Button
          type="submit"
          size="lg"
          loading={busy}
          className="max-sm:w-full"
        >
          Send message
        </Button>
      </div>
    </form>
  )
}

/**
 * The Journal's monthly email sign-up, for the Night newsletter panel: a large field and the Copper action on one
 * line, with the status under them. The label is hidden, because the panel's heading names the form.
 */
export function NewsletterStrip() {
  const [email, setEmail] = useState("")
  const [state, setState] = useState<
    "idle" | "error" | "ok" | "busy" | "failed"
  >("idle")
  return (
    <form
      noValidate
      onSubmit={async (e) => {
        e.preventDefault()
        if (state === "busy") return
        if (!isEmail(email)) return setState("error")
        setState("busy")
        const r = await submitSignup({
          email,
          source: "newsletter",
          company: honeypotOf(e.currentTarget),
        }).catch(() => null)
        setState(r?.ok ? "ok" : r && !r.ok && r.fields ? "error" : "failed")
      }}
      className="relative flex flex-col gap-3"
    >
      <Honeypot />
      <label htmlFor="nl" className="sr-only">
        Email address
      </label>
      <div className="flex gap-2 max-sm:flex-col">
        <Input
          id="nl"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value)
            setState("idle")
          }}
          aria-invalid={state === "error"}
          aria-describedby="nl-status"
          className="min-h-12 flex-1 bg-card text-body text-foreground shadow-none"
        />
        <Button type="submit" size="lg" loading={state === "busy"}>
          Subscribe
        </Button>
      </div>
      <p
        id="nl-status"
        role="status"
        className="min-h-5 text-caption text-night-muted"
      >
        {state === "ok"
          ? "Subscribed. One note a month."
          : state === "error"
            ? "Enter an email like name@example.com."
            : state === "failed"
              ? "We could not subscribe you. Try again in a minute."
              : null}
      </p>
    </form>
  )
}
