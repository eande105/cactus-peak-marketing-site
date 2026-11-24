"use client"

import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useId, useRef, useState } from "react"
import { LinkButton, TextLink } from "@/components/brand/atoms"
import { ClubArt } from "@/components/brand/club-art"
import { PlanComparisonTable } from "@/components/brand/plan-parts"
import { Collapsible } from "@/components/graphical"
import { Check, ChevronRight, CircleCheck, Plus } from "@/components/icons"
import { useCatalog, useClubNow } from "@/components/site/catalog-context"
import { MinimalCheckoutHeader } from "@/components/site/chrome"
import { useMyClub } from "@/components/site/club-context"
import { Button } from "@/components/ui/button"
import { CheckRow, SelectControl, Textarea } from "@/components/ui/controls"
import { Input } from "@/components/ui/input"
import {
  Overlay,
  OverlayPopup,
  OverlayTitle,
  OverlayTrigger,
} from "@/components/ui/overlay"
import { RadioCard, RadioGroupBox } from "@/components/ui/radio-group-box"
import type { ClientCatalog } from "@/lib/catalog"
import { submitJoin } from "@/lib/forms/actions"
import { JOIN_NETWORK_ERROR } from "@/lib/forms/messages"
import { kidsCostLine } from "@/lib/labels"
import { scheduleUrl } from "@/lib/links"
import { digits, isEmail, useSessionState } from "@/lib/store"
import { azNowKey } from "@/lib/time"
import { cn } from "@/lib/utils"
import { Container } from "./common"
import {
  ErrorSummary,
  Field,
  Honeypot,
  honeypotOf,
  StepBar,
  serverErrors,
  TextField,
} from "./flow-ui"

type Person = {
  first: string
  last: string
  email: string
  m: string
  d: string
  y: string
  kids?: boolean
  photo?: boolean
  note?: string
}
type Join = {
  plan: string
  club: string
  first: string
  last: string
  email: string
  phone: string
  m: string
  d: string
  y: string
  zip: string
  sms: boolean
  news: boolean
  mode: "solo" | "family"
  adults: Person[]
  kids: Person[]
  promo: string
  done: boolean
}
const blank = (): Person => ({
  first: "",
  last: "",
  email: "",
  m: "",
  d: "",
  y: "",
})
const INIT: Join = {
  plan: "ridge",
  club: "",
  first: "",
  last: "",
  email: "",
  phone: "",
  m: "",
  d: "",
  y: "",
  zip: "",
  sms: false,
  news: false,
  mode: "solo",
  adults: [],
  kids: [],
  promo: "",
  done: false,
}
export const useJoin = () => useSessionState<Join>("cpa_join", INIT)
const STEPS = ["plan", "club", "details", "family", "payment"] as const
const LABEL = ["Plan", "Home club", "Your details", "Family", "Payment"]
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
]

/** Today in Arizona, as a UTC date (only the calendar fields are read). */
const azToday = () => new Date(Math.floor(azNowKey() / 1440) * 86_400_000)
const ageAt = (m: string, d: string, y: string) => {
  if (!m || !d || !y) return null
  const t = azToday()
  let a = t.getUTCFullYear() - +y
  if (
    t.getUTCMonth() < +m - 1 ||
    (t.getUTCMonth() === +m - 1 && t.getUTCDate() < +d)
  )
    a--
  return a
}
const ageMonths = (m: string, _d: string, y: string) => {
  const t = azToday()
  return (t.getUTCFullYear() - +y) * 12 + (t.getUTCMonth() - (+m - 1))
}
/** "27th" */
const ordinal = (n: number) =>
  `${n}${n % 100 >= 11 && n % 100 <= 13 ? "th" : (["th", "st", "nd", "rd"][n % 10] ?? "th")}`
type Pricing = Pick<ClientCatalog, "planBySlug" | "plans" | "prices">
export function totals(j: Join, cat: Pricing) {
  const plan = cat.planBySlug(j.plan) ?? cat.plans[1] ?? cat.plans[0]
  const { adult, child } = cat.prices
  const fam =
    j.mode === "family" ? j.adults.length * adult + j.kids.length * child : 0
  const monthly = plan.price + fam
  // Billing repeats on the day of the month you join (days 29 to 31 bill on the 28th).
  const billDay = ordinal(Math.min(azToday().getUTCDate(), 28))
  return { plan, fam, monthly, enroll: 0, today: monthly, billDay }
}

/** Focuses an Add button after the render that removes a person, so focus never falls to the page. */
function focusAdd(kind: "adult" | "child") {
  requestAnimationFrame(() =>
    document.querySelector<HTMLElement>(`[data-add="${kind}"]`)?.focus()
  )
}

function DOB({
  v,
  set,
  label,
  err,
}: {
  v: { m: string; d: string; y: string }
  set: (p: { m?: string; d?: string; y?: string }) => void
  label: string
  err?: string
}) {
  // The error belongs to all three controls, so each one points at it and is marked invalid.
  const errId = useId()
  const a11y = {
    "aria-invalid": !!err,
    "aria-describedby": err ? errId : undefined,
  }
  return (
    <fieldset>
      <legend className="text-body-s font-heavy">{label}</legend>
      <div className="mt-xs grid grid-cols-[1.4fr_1fr_1fr] gap-xs">
        <SelectControl
          aria-label="Month"
          {...a11y}
          value={v.m}
          onChange={(m) => set({ m })}
          options={[
            { value: "", label: "Month" },
            ...MONTHS.map((m, i) => ({ value: String(i + 1), label: m })),
          ]}
        />
        <Input
          aria-label="Day"
          {...a11y}
          inputMode="numeric"
          maxLength={2}
          placeholder="DD"
          value={v.d}
          onChange={(e) => set({ d: digits(e.target.value) })}
          className="bg-card"
          autoComplete="bday-day"
        />
        <Input
          aria-label="Year"
          {...a11y}
          inputMode="numeric"
          maxLength={4}
          placeholder="YYYY"
          value={v.y}
          onChange={(e) => set({ y: digits(e.target.value) })}
          className="bg-card"
          autoComplete="bday-year"
        />
      </div>
      {/* Visible names for the three parts. A placeholder disappears once the visitor types. */}
      <div
        aria-hidden="true"
        className="mt-xxs grid grid-cols-[1.4fr_1fr_1fr] gap-xs text-body-s text-muted-foreground"
      >
        <span>Month</span>
        <span>Day</span>
        <span>Year</span>
      </div>
      {err ? (
        <p
          id={errId}
          className="mt-xs text-body-s font-medium text-destructive"
        >
          {err}
        </p>
      ) : null}
    </fieldset>
  )
}

function Row({
  l,
  v,
  edit,
  editable,
}: {
  l: string
  v: string
  edit?: string
  editable: boolean
}) {
  return (
    <div className="flex items-baseline justify-between gap-s py-xs">
      <dt className="text-body-m">
        {l}
        {editable && edit ? (
          <Link
            href={edit}
            className="ml-xs text-body-s text-link underline underline-offset-4"
          >
            Edit
          </Link>
        ) : null}
      </dt>
      <dd className="tabular text-body-m font-heavy">{v}</dd>
    </div>
  )
}
function Summary({ j, editable = true }: { j: Join; editable?: boolean }) {
  const cat = useCatalog()
  const t = totals(j, cat)
  const c = cat.clubBySlug(j.club)
  return (
    <>
      <dl className="rule-rows">
        <Row
          editable={editable}
          l={`${t.plan.name} plan`}
          v={`$${t.plan.price}/mo`}
          edit="/join/plan"
        />
        <Row
          editable={editable}
          l={c ? c.name : "Home club"}
          v={c ? "Home club" : "Not picked yet"}
          edit="/join/club"
        />
        {j.mode === "family" && j.adults.length ? (
          <Row
            editable={editable}
            l={`${j.adults.length} adult add-on${j.adults.length > 1 ? "s" : ""}`}
            v={`+$${j.adults.length * cat.prices.adult}/mo`}
            edit="/join/family"
          />
        ) : null}
        {j.mode === "family" && j.kids.length ? (
          <Row
            editable={editable}
            l={`${j.kids.length} child add-on${j.kids.length > 1 ? "s" : ""}`}
            v={`+$${j.kids.length * cat.prices.child}/mo`}
            edit="/join/family"
          />
        ) : null}
        <Row
          editable={editable}
          l="Enrollment (fall offer, through Nov 30)"
          v="$0"
        />
        <div className="flex items-baseline justify-between pt-s">
          <dt className="text-body-m font-heavy">Today</dt>
          <dd className="tabular font-data text-body-xxl font-heavy">
            ${t.today}
          </dd>
        </div>
      </dl>
      {/* The one note under the summary: the monthly charge and the yearly fee. No sums or working. */}
      <p className="pt-s text-body-s text-muted-foreground">
        Then ${t.monthly} a month on the {t.billDay}, plus a $
        {cat.prices.facilityFee} facility fee each March.
      </p>
    </>
  )
}

/** Errors on the details step. Pure, so the form can re-run it as the visitor types. */
function detailsErrors(j: Join) {
  const e: Record<string, string> = {}
  if (!j.first.trim()) e.first = "Enter your first name."
  if (!j.last.trim()) e.last = "Enter your last name."
  if (!isEmail(j.email)) e.email = "Enter an email like name@example.com."
  if (digits(j.phone).length !== 10) e.phone = "Enter a 10-digit mobile number."
  const age = ageAt(j.m, j.d, j.y)
  if (age === null) e.dob = "Enter your date of birth."
  else if (age < 18)
    e.dob =
      "Members must be 18 or older. Add younger family members in the next step."
  if (!/^\d{5}$/.test(j.zip)) e.zip = "Enter a 5-digit ZIP code."
  return e
}
/** Errors on the family step. */
function familyErrors(j: Join, kidsClubHere = true) {
  const e: Record<string, string> = {}
  if (j.mode === "family") {
    j.adults.forEach((a, i) => {
      if (!a.first.trim()) e[`a${i}f`] = `Adult ${i + 1}: enter a first name.`
      if (!a.last.trim()) e[`a${i}n`] = `Adult ${i + 1}: enter a last name.`
      if (!isEmail(a.email) || a.email === j.email)
        e[`a${i}e`] = `Adult ${i + 1}: enter a different email.`
      const ag = ageAt(a.m, a.d, a.y)
      if (ag === null || ag < 18)
        e[`a${i}d`] = `Adult ${i + 1}: members must be 18 or older.`
    })
    j.kids.forEach((k, i) => {
      if (!k.first.trim()) e[`k${i}f`] = `Child ${i + 1}: enter a first name.`
      if (!k.last.trim()) e[`k${i}n`] = `Child ${i + 1}: enter a last name.`
      if (!k.m || !k.d || !k.y)
        e[`k${i}d`] = `Child ${i + 1}: enter a date of birth.`
      else {
        const mo = ageMonths(k.m, k.d, k.y)
        if (mo < 6 || (ageAt(k.m, k.d, k.y) ?? 0) > 17)
          e[`k${i}d`] =
            `Child ${i + 1}: children must be 6 months to 17. Anyone 18 or older joins as an adult.`
      }
      if (kidsClubHere && k.kids && !k.photo)
        e[`k${i}p`] =
          `Child ${i + 1}: agree to photo consent for kids club, or untick kids club.`
    })
  }
  return e
}

export function JoinFlow({ step }: { step: (typeof STEPS)[number] }) {
  const router = useRouter()
  const sp = useSearchParams()
  const { club: mine } = useMyClub()
  const cat = useCatalog()
  const { clubs, plans, planBySlug, prices } = cat
  const [j, setJ, ready] = useJoin()
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [busy, setBusy] = useState(false)
  const [card, setCard] = useState({
    num: "",
    exp: "",
    cvc: "",
    name: "",
    zip: "",
    a1: false,
    a2: false,
  })
  const [declined, setDeclined] = useState("")
  const head = useRef<HTMLHeadingElement>(null)
  const n = STEPS.indexOf(step) + 1
  // biome-ignore lint/correctness/useExhaustiveDependencies: step is the trigger; move focus to the heading on each step change
  useEffect(() => {
    head.current?.focus()
  }, [step])
  useEffect(() => {
    const p = sp.get("plan")
    const a = +(sp.get("adults") ?? 0)
    const k = +(sp.get("children") ?? 0)
    if (step === "plan" && (p || a || k))
      setJ((q) => ({
        ...q,
        plan: p && planBySlug(p) ? p : q.plan,
        ...(a || k
          ? {
              mode: "family" as const,
              adults: Array.from({ length: Math.min(4, a) }, blank),
              kids: Array.from({ length: Math.min(6, k) }, blank),
            }
          : {}),
      }))
  }, [sp, step, setJ, planBySlug])
  const club = j.club || sp.get("club") || mine?.slug || ""
  // Two clubs have no kids club. A family that joins there is told where it is instead of being asked.
  const homeClub = clubs.find((x) => x.slug === club)
  const homeHasKids = !homeClub || homeClub.has.kids
  const kidsClubNames = (() => {
    const n = clubs.filter((x) => x.has.kids).map((x) => x.name)
    return n.length > 1
      ? `${n.slice(0, -1).join(", ")} and ${n.at(-1)}`
      : (n[0] ?? "")
  })()
  const t = totals(j, cat)
  // Drop an error the moment its field becomes valid, so the summary does not nag about fixed fields.
  useEffect(() => {
    if (step !== "details" && step !== "family") return
    setErrors((prev) => {
      if (!Object.keys(prev).length) return prev
      const now =
        step === "details" ? detailsErrors(j) : familyErrors(j, homeHasKids)
      const kept = Object.fromEntries(
        Object.keys(prev)
          .filter((k) => k in now)
          .map((k) => [k, now[k]])
      )
      return Object.keys(kept).length === Object.keys(prev).length &&
        Object.keys(kept).every((k) => kept[k] === prev[k])
        ? prev
        : kept
    })
  }, [j, step, homeHasKids])
  const next = (to: string) => router.push(to)
  // Guard: a step opens only when the steps before it are done. Otherwise go to the first incomplete step.
  const clubOk = !!(j.club || sp.get("club") || mine?.slug)
  const detailsOk = !!(j.first && j.email && j.phone)
  const firstIncomplete =
    n >= 3 && !clubOk ? "club" : n >= 4 && !detailsOk ? "details" : null
  useEffect(() => {
    if (ready && firstIncomplete) router.replace(`/join/${firstIncomplete}`)
  }, [ready, firstIncomplete, router])
  if (ready && firstIncomplete) return null
  const fail = (e: Record<string, string>) => {
    setErrors(e)
    if (Object.keys(e).length) {
      setTimeout(() => document.getElementById("error-summary")?.focus(), 0)
      return true
    }
    return false
  }

  const submitDetails = () => {
    if (!fail(detailsErrors(j))) next("/join/family")
  }
  const submitFamily = () => {
    if (!fail(familyErrors(j, homeHasKids))) next("/join/payment")
  }
  const submitPay = (form: HTMLFormElement) => {
    const e: Record<string, string> = {}
    const num = digits(card.num)
    if (num.length < 13 || num.length > 19)
      e.num = "Enter the full card number."
    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(card.exp))
      e.exp = "Enter the expiry as MM/YY."
    if (!/^\d{3,4}$/.test(card.cvc))
      e.cvc = "Enter the 3 or 4 digit security code."
    if (!card.name.trim()) e.name = "Enter the name on the card."
    if (!/^\d{5}$/.test(card.zip)) e.zip = "Enter a 5-digit billing ZIP."
    if (!card.a1 || !card.a2) e.agree = "Check the box to agree before you pay."
    if (fail(e)) return
    setBusy(true)
    setDeclined("")
    // The payment step is a demo: the card is checked here in the browser and never sent anywhere.
    setTimeout(async () => {
      if (num.endsWith("0002")) {
        setBusy(false)
        setDeclined(
          "Your bank declined this card. Try another card, or call your bank."
        )
        return
      }
      const iso = (p: { m: string; d: string; y: string }) =>
        p.m && p.d && p.y
          ? `${p.y}-${p.m.padStart(2, "0")}-${p.d.padStart(2, "0")}`
          : ""
      const r = await submitJoin({
        plan: t.plan.slug,
        club,
        first: j.first,
        last: j.last,
        email: j.email,
        phone: j.phone,
        birthDate: iso(j),
        zip: j.zip,
        smsOptIn: j.sms,
        newsOptIn: j.news,
        mode: j.mode,
        family: {
          adults: j.adults.map((a) => ({
            first: a.first,
            last: a.last,
            birth: iso(a),
          })),
          kids: j.kids.map((k) => ({
            first: k.first,
            last: k.last,
            birth: iso(k),
          })),
        },
        promo: j.promo,
        company: honeypotOf(form),
      }).catch(() => null)
      if (!r?.ok) {
        setBusy(false)
        fail(r ? serverErrors(r) : { form: JOIN_NETWORK_ERROR })
        return
      }
      setJ((q) => ({ ...q, club: club as string, done: true }))
      router.push("/join/confirmed")
    }, 900)
  }
  // Below lg the bar shows the amount next to the button, so the button names the action only. At 320 px the
  // full label pushed the button past the screen edge.
  const primaryLabel =
    step === "payment" ? (
      <>
        Join and pay
        <span className="max-lg:hidden"> ${t.today} today</span>
      </>
    ) : (
      "Continue"
    )
  const onContinue = (form?: HTMLFormElement) => {
    if (step === "plan") {
      setJ((q) => ({ ...q, plan: q.plan || "ridge" }))
      return next("/join/club")
    }
    if (step === "club") {
      if (!club) return fail({ club: "Pick a home club to continue." })
      setJ((q) => ({ ...q, club }))
      return next("/join/details")
    }
    if (step === "details") return submitDetails()
    if (step === "family") return submitFamily()
    return form ? submitPay(form) : undefined
  }
  const back = step === "plan" ? null : `/join/${STEPS[n - 2]}`
  const setAdult = (i: number, p: Partial<Person>) =>
    setJ((q) => ({
      ...q,
      adults: q.adults.map((a, k) => (k === i ? { ...a, ...p } : a)),
    }))
  const setKid = (i: number, p: Partial<Person>) =>
    setJ((q) => ({
      ...q,
      kids: q.kids.map((a, k) => (k === i ? { ...a, ...p } : a)),
    }))
  return (
    <>
      <MinimalCheckoutHeader saveExit>
        <div className="mx-auto max-w-xs">
          <StepBar step={n} total={5} label={LABEL[n - 1]} />
        </div>
      </MinimalCheckoutHeader>
      <main
        id="main"
        tabIndex={-1}
        className="flex-1 pb-[calc(var(--space-xxl)*7/3)] outline-none lg:pb-zero"
      >
        <Container className="grid gap-xl py-xl lg:grid-cols-12 lg:py-xxl">
          <div className="md:hidden lg:col-span-12">
            <StepBar step={n} total={5} label={LABEL[n - 1]} />
          </div>
          {/* Payment shows the full summary in the form, so the collapsed copy would repeat it. */}
          {step !== "payment" ? (
            <Collapsible.Root className="lg:hidden">
              <Collapsible.Trigger className="min-h-11">
                Order summary · {t.plan.name} · ${t.today} today
                <Collapsible.Indicator>
                  <ChevronRight aria-hidden="true" />
                </Collapsible.Indicator>
              </Collapsible.Trigger>
              <Collapsible.Panel>
                <Summary j={{ ...j, club }} />
              </Collapsible.Panel>
            </Collapsible.Root>
          ) : null}
          {/* The loading button blocks pointer clicks only. The busy guard stops a second submit from the Enter key. */}
          <form
            noValidate
            onSubmit={(e) => {
              e.preventDefault()
              if (!busy) onContinue(e.currentTarget)
            }}
            className="relative flex max-w-[640px] flex-col gap-l lg:col-span-7"
          >
            <ErrorSummary errors={errors} />
            <Honeypot />
            {step === "plan" ? (
              <>
                <div>
                  <h1
                    ref={head}
                    tabIndex={-1}
                    className="font-display-wide text-display-m outline-none font-heavy"
                  >
                    Pick your plan.
                  </h1>
                  <p className="mt-xs text-body-m text-muted-foreground">
                    Month to month. Change it any time.
                  </p>
                </div>
                <RadioGroupBox
                  value={j.plan}
                  onValueChange={(plan) => setJ((q) => ({ ...q, plan }))}
                  aria-label="Plan"
                  className="flex flex-col gap-s"
                >
                  {plans.map((p) => {
                    const on = j.plan === p.slug
                    return (
                      <RadioCard
                        key={p.slug}
                        value={p.slug}
                        className={cn(
                          "relative grid grid-cols-[1fr_auto] gap-x-m gap-y-xxs hairline",
                          "corner-m p-m",
                          "text-left",
                          "bg-card",
                          on
                            ? "ring-2 ring-primary"
                            : "ring-border hover:ring-border-strong"
                        )}
                      >
                        <span className="flex items-center gap-s">
                          <span className="font-display-wide text-body-l font-medium">
                            {p.name}
                          </span>
                          {p.badge ? (
                            <span className="corner-xs bg-accent px-xs py-xxs text-body-s text-foreground font-heavy">
                              {p.badge}
                            </span>
                          ) : null}
                        </span>
                        <span className="tabular flex items-center gap-xs font-data text-body-l font-heavy">
                          ${p.price}
                          <span className="text-body-m font-regular text-muted-foreground">
                            /mo
                          </span>
                          {on ? (
                            <Check
                              className="size-5 text-link"
                              aria-hidden="true"
                            />
                          ) : null}
                        </span>
                        {/* Name, price and who it is for. "Compare every detail" holds the feature list. */}
                        <span className="col-span-2 text-body-m text-muted-foreground">
                          {p.bestFor}
                        </span>
                      </RadioCard>
                    )
                  })}
                </RadioGroupBox>
                <Overlay>
                  <OverlayTrigger className="min-h-11 self-start text-body-s text-link underline-offset-4 hover:underline font-heavy">
                    Compare every detail
                  </OverlayTrigger>
                  <OverlayPopup className="w-[min(860px,calc(100vw-32px))]!">
                    <OverlayTitle className="pr-xl">Compare plans</OverlayTitle>
                    <div className="overflow-y-auto">
                      <PlanComparisonTable />
                    </div>
                  </OverlayPopup>
                </Overlay>
                <p className="text-body-m text-muted-foreground">
                  Not ready?{" "}
                  <TextLink href="/tour" className="inline-flex">
                    Book a free tour
                  </TextLink>{" "}
                  <TextLink href="/trial" className="ml-s inline-flex">
                    Try a free 3-day pass
                  </TextLink>
                </p>
              </>
            ) : null}
            {step === "club" ? (
              <>
                <div>
                  <h1
                    ref={head}
                    tabIndex={-1}
                    className="font-display-wide text-display-m outline-none font-heavy"
                  >
                    Pick your home club.
                  </h1>
                  <p className="mt-xs text-body-m text-muted-foreground">
                    {j.plan === "trailhead"
                      ? "Trailhead works at one club. Pick the one that has what you need."
                      : "Your home club is where you start. You can train at all 5."}
                  </p>
                </div>
                <RadioGroupBox
                  value={club}
                  onValueChange={(club) => setJ((q) => ({ ...q, club }))}
                  aria-label="Home club"
                  className="flex flex-col gap-s"
                >
                  {clubs.map((c) => {
                    const on = club === c.slug
                    return (
                      <RadioCard
                        key={c.slug}
                        value={c.slug}
                        className={cn(
                          "flex items-center gap-m hairline",
                          "corner-m p-s",
                          "text-left",
                          "bg-card",
                          on
                            ? "ring-2 ring-primary"
                            : "ring-border hover:ring-border-strong"
                        )}
                      >
                        <ClubArt
                          slug={c.slug}
                          ratio="4/3"
                          detail="simple"
                          className="w-24 shrink-0 overflow-hidden corner-xs"
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block text-body-m font-heavy">
                            {c.name}
                          </span>
                          <span className="block text-body-m text-muted-foreground">
                            {c.city}
                          </span>
                          {j.plan === "trailhead" && !c.has.pool ? (
                            <span className="mt-xxs block text-body-m font-heavy">
                              No pool at this club.
                            </span>
                          ) : null}
                        </span>
                        {on ? (
                          <Check
                            className="size-5 text-link"
                            aria-hidden="true"
                          />
                        ) : null}
                      </RadioCard>
                    )
                  })}
                </RadioGroupBox>
              </>
            ) : null}
            {step === "details" ? (
              <>
                <div>
                  <h1
                    ref={head}
                    tabIndex={-1}
                    className="font-display-wide text-display-m outline-none font-heavy"
                  >
                    Tell us about you.
                  </h1>
                  <p className="mt-xs text-body-m text-muted-foreground">
                    We use this to set up your membership. We do not sell your
                    information.{" "}
                    <Link href="/legal/privacy" className="underline">
                      Privacy policy
                    </Link>
                  </p>
                </div>
                <div className="grid gap-l sm:grid-cols-2">
                  <TextField
                    label="First name"
                    value={j.first}
                    onChange={(v) => setJ((q) => ({ ...q, first: v }))}
                    error={errors.first}
                    autoComplete="given-name"
                  />
                  <TextField
                    label="Last name"
                    value={j.last}
                    onChange={(v) => setJ((q) => ({ ...q, last: v }))}
                    error={errors.last}
                    autoComplete="family-name"
                  />
                </div>
                <TextField
                  label="Email"
                  type="email"
                  value={j.email}
                  onChange={(v) => setJ((q) => ({ ...q, email: v }))}
                  error={errors.email}
                  autoComplete="email"
                />
                <TextField
                  label="Mobile phone"
                  type="tel"
                  inputMode="tel"
                  value={j.phone}
                  onChange={(v) => setJ((q) => ({ ...q, phone: v }))}
                  onBlur={() => {
                    const d = digits(j.phone)
                    if (d.length === 10)
                      setJ((q) => ({
                        ...q,
                        phone: `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`,
                      }))
                  }}
                  error={errors.phone}
                  help="We text only if you say yes. Example: (480) 555-0100"
                  autoComplete="tel"
                />
                <div className="grid gap-l sm:grid-cols-[2fr_1fr]">
                  <DOB
                    label="Date of birth"
                    v={j}
                    set={(p) => setJ((q) => ({ ...q, ...p }))}
                    err={errors.dob}
                  />
                  <TextField
                    label="ZIP code"
                    value={j.zip}
                    onChange={(v) => setJ((q) => ({ ...q, zip: digits(v) }))}
                    inputMode="numeric"
                    maxLength={5}
                    error={errors.zip}
                    autoComplete="postal-code"
                  />
                </div>
                <CheckRow
                  checked={j.sms}
                  onChange={(c) => setJ((q) => ({ ...q, sms: c }))}
                >
                  Text me reminders about my classes and tours (
                  <Link className="underline" href="/legal/sms-terms">
                    SMS terms
                  </Link>
                  )
                </CheckRow>
                <CheckRow
                  checked={j.news}
                  onChange={(c) => setJ((q) => ({ ...q, news: c }))}
                >
                  Email me news and offers
                </CheckRow>
              </>
            ) : null}
            {step === "family" ? (
              <>
                <div>
                  <h1
                    ref={head}
                    tabIndex={-1}
                    className="font-display-wide text-display-m outline-none font-heavy"
                  >
                    Add your family.
                  </h1>
                  <p className="mt-xs text-body-m text-muted-foreground">
                    Same access as your plan. {kidsCostLine(cat.prices.child)}{" "}
                    Teens 13 to 17 follow the teen rules.
                  </p>
                </div>
                <RadioGroupBox
                  value={j.mode}
                  onValueChange={(mode) => setJ((q) => ({ ...q, mode }))}
                  aria-label="Who is joining"
                  className="flex w-fit corner-s hairline ring-border-strong"
                >
                  {(["solo", "family"] as const).map((m) => (
                    <RadioCard
                      key={m}
                      value={m}
                      className={cn(
                        "min-h-11 px-l text-body-s first:corner-l-s last:corner-r-s font-heavy",
                        j.mode === m && "bg-night text-night-foreground"
                      )}
                    >
                      {m === "solo" ? "Just me" : "Add family"}
                    </RadioCard>
                  ))}
                </RadioGroupBox>
                {j.mode === "family" ? (
                  <>
                    {j.adults.map((a, i) => (
                      <fieldset
                        // biome-ignore lint/suspicious/noArrayIndexKey: person rows have no id; fields are controlled from the join state
                        key={i}
                        className={cn(
                          "flex flex-col gap-m hairline",
                          "corner-m p-m",
                          "bg-card ring-border"
                        )}
                      >
                        {/* A visible legend sits on the card border, so the legend is for screen readers and the title is a row inside the card. */}
                        <legend className="sr-only">
                          Adult {i + 1}, plus ${prices.adult} a month
                        </legend>
                        <p
                          aria-hidden="true"
                          className="text-body-s font-heavy"
                        >
                          Adult {i + 1}{" "}
                          <span className="font-regular text-muted-foreground">
                            +${prices.adult}/mo
                          </span>
                        </p>
                        <div className="grid gap-m sm:grid-cols-2">
                          <TextField
                            label="First name"
                            value={a.first}
                            onChange={(v) => setAdult(i, { first: v })}
                            error={errors[`a${i}f`]}
                          />
                          <TextField
                            label="Last name"
                            value={a.last}
                            onChange={(v) => setAdult(i, { last: v })}
                            error={errors[`a${i}n`]}
                          />
                        </div>
                        <TextField
                          label="Email"
                          type="email"
                          value={a.email}
                          onChange={(v) => setAdult(i, { email: v })}
                          error={errors[`a${i}e`]}
                        />
                        <DOB
                          label="Date of birth"
                          v={a}
                          set={(p) => setAdult(i, p)}
                          err={errors[`a${i}d`]}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="self-start"
                          onClick={() => {
                            setJ((q) => ({
                              ...q,
                              adults: q.adults.filter((_, k) => k !== i),
                            }))
                            focusAdd("adult")
                          }}
                        >
                          Remove adult {i + 1}
                        </Button>
                      </fieldset>
                    ))}
                    {j.kids.map((a, i) => {
                      const ag = a.m && a.d && a.y ? ageAt(a.m, a.d, a.y) : null
                      return (
                        <fieldset
                          // biome-ignore lint/suspicious/noArrayIndexKey: person rows have no id; fields are controlled from the join state
                          key={i}
                          className={cn(
                            "flex flex-col gap-m hairline",
                            "corner-m p-m",
                            "bg-card ring-border"
                          )}
                        >
                          <legend className="sr-only">
                            Child {i + 1}, plus ${prices.child} a month
                          </legend>
                          <p
                            aria-hidden="true"
                            className="text-body-s font-heavy"
                          >
                            Child {i + 1}{" "}
                            <span className="font-regular text-muted-foreground">
                              +${prices.child}/mo
                            </span>
                          </p>
                          <div className="grid gap-m sm:grid-cols-2">
                            <TextField
                              label="First name"
                              value={a.first}
                              onChange={(v) => setKid(i, { first: v })}
                              error={errors[`k${i}f`]}
                            />
                            <TextField
                              label="Last name"
                              value={a.last}
                              onChange={(v) => setKid(i, { last: v })}
                              error={errors[`k${i}n`]}
                            />
                          </div>
                          <DOB
                            label="Child's date of birth"
                            v={a}
                            set={(p) => setKid(i, p)}
                            err={errors[`k${i}d`]}
                          />
                          {ag !== null && ag >= 13 && ag <= 17 ? (
                            <p className="text-body-m text-muted-foreground">
                              Teens book classes marked Teen OK. A parent
                              manages billing and can allow courts and lap lanes
                              (lanes from age 14).
                            </p>
                          ) : null}
                          {ag === null || ag <= 12 ? (
                            homeHasKids ? (
                              <CheckRow
                                checked={!!a.kids}
                                onChange={(c) => setKid(i, { kids: c })}
                              >
                                Needs kids club
                              </CheckRow>
                            ) : (
                              <p className="text-body-m text-muted-foreground">
                                Kids club is at {kidsClubNames}.
                              </p>
                            )
                          ) : null}
                          {a.kids && homeHasKids ? (
                            <CheckRow
                              checked={!!a.photo}
                              onChange={(c) => setKid(i, { photo: c })}
                            >
                              I agree to photo consent for kids club
                            </CheckRow>
                          ) : null}
                          {errors[`k${i}p`] ? (
                            <p className="text-body-s font-medium text-destructive">
                              {errors[`k${i}p`]}
                            </p>
                          ) : null}
                          <Field
                            label="Anything we should know?"
                            help="Share anything the kids club team should know."
                          >
                            {(p) => (
                              <Textarea
                                {...p}
                                maxLength={300}
                                rows={2}
                                value={a.note ?? ""}
                                onChange={(e) =>
                                  setKid(i, { note: e.target.value })
                                }
                              />
                            )}
                          </Field>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="self-start"
                            onClick={() => {
                              setJ((q) => ({
                                ...q,
                                kids: q.kids.filter((_, k) => k !== i),
                              }))
                              focusAdd("child")
                            }}
                          >
                            Remove child {i + 1}
                          </Button>
                        </fieldset>
                      )
                    })}
                    <div className="flex flex-wrap items-center gap-s">
                      <Button
                        type="button"
                        variant="outline"
                        data-add="adult"
                        disabled={j.adults.length >= 4}
                        focusableWhenDisabled
                        onClick={() =>
                          setJ((q) => ({
                            ...q,
                            adults: [...q.adults, blank()],
                          }))
                        }
                      >
                        <Plus aria-hidden="true" />
                        Add an adult
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        data-add="child"
                        disabled={j.kids.length >= 6}
                        focusableWhenDisabled
                        onClick={() =>
                          setJ((q) => ({ ...q, kids: [...q.kids, blank()] }))
                        }
                      >
                        <Plus aria-hidden="true" />
                        Add a child
                      </Button>
                      <span className="tabular text-body-m" aria-live="polite">
                        Family add-ons +${t.fam}/mo
                      </span>
                    </div>
                    {j.adults.length >= 4 || j.kids.length >= 6 ? (
                      <p className="text-body-m text-muted-foreground">
                        Need more? Call (480) 555-0142.
                      </p>
                    ) : null}
                  </>
                ) : null}
              </>
            ) : null}
            {step === "payment" ? (
              <>
                <div>
                  <h1
                    ref={head}
                    tabIndex={-1}
                    className="font-display-wide text-display-m outline-none font-heavy"
                  >
                    Pay and join.
                  </h1>
                  <p className="mt-xs text-body-m text-muted-foreground">
                    Then ${t.monthly} a month on the {t.billDay}. Month to
                    month. Cancel or freeze with 30 days&apos; notice. A $49
                    annual facility fee is charged in March.
                  </p>
                  <p className="mt-xs corner-s bg-muted p-s text-body-s">
                    This is a sample checkout. No card is charged and nothing
                    leaves your browser. Use any made-up number; one ending in
                    0002 shows the declined state.
                  </p>
                </div>
                <div className="corner-m bg-card p-m hairline ring-border lg:hidden">
                  <Summary j={{ ...j, club }} editable={false} />
                </div>
                {declined ? (
                  <p
                    role="alert"
                    className="corner-s bg-danger-subtle p-s text-body-s font-heavy"
                  >
                    {declined}
                  </p>
                ) : null}
                <TextField
                  label="Card number"
                  value={card.num}
                  onChange={(v) => setCard((c) => ({ ...c, num: v }))}
                  inputMode="numeric"
                  autoComplete="cc-number"
                  error={errors.num}
                />
                <div className="grid gap-m sm:grid-cols-3">
                  <TextField
                    label="Expiry (MM/YY)"
                    value={card.exp}
                    onChange={(v) => setCard((c) => ({ ...c, exp: v }))}
                    autoComplete="cc-exp"
                    error={errors.exp}
                    maxLength={5}
                  />
                  <TextField
                    label="CVC"
                    value={card.cvc}
                    onChange={(v) => setCard((c) => ({ ...c, cvc: digits(v) }))}
                    inputMode="numeric"
                    autoComplete="cc-csc"
                    error={errors.cvc}
                    maxLength={4}
                  />
                  <TextField
                    label="Billing ZIP"
                    value={card.zip}
                    onChange={(v) => setCard((c) => ({ ...c, zip: digits(v) }))}
                    inputMode="numeric"
                    autoComplete="postal-code"
                    error={errors.zip}
                    maxLength={5}
                  />
                </div>
                <TextField
                  label="Name on card"
                  value={card.name}
                  onChange={(v) => setCard((c) => ({ ...c, name: v }))}
                  autoComplete="cc-name"
                  error={errors.name}
                />
                <CheckRow
                  checked={card.a1}
                  onChange={(a1) => setCard((c) => ({ ...c, a1 }))}
                >
                  I agree to the{" "}
                  <Link
                    className="underline"
                    href="/legal/membership-agreement"
                  >
                    Membership agreement
                  </Link>
                </CheckRow>
                <CheckRow
                  checked={card.a2}
                  onChange={(a2) => setCard((c) => ({ ...c, a2 }))}
                >
                  I have read the{" "}
                  <Link className="underline" href="/legal/waiver">
                    Liability waiver
                  </Link>
                </CheckRow>
                {errors.agree ? (
                  <p className="text-body-s font-medium text-destructive">
                    {errors.agree}
                  </p>
                ) : null}
              </>
            ) : null}
            <div
              data-action-bar
              className="fixed inset-x-0 bottom-0 z-40 flex items-center gap-s bg-card px-m py-s pb-[max(12px,env(safe-area-inset-bottom))] rule-t lg:static lg:z-auto lg:bg-transparent lg:p-zero lg:rule-none"
            >
              {back ? (
                <LinkButton href={back} variant="ghost">
                  Back
                </LinkButton>
              ) : null}
              <span className="tabular font-data text-body-l font-heavy lg:hidden">
                ${t.today}
                <span className="block text-body-s font-regular text-muted-foreground">
                  today
                </span>
              </span>
              <Button
                type="submit"
                size="lg"
                loading={busy}
                className="ml-auto lg:ml-zero"
              >
                {primaryLabel}
              </Button>
            </div>
          </form>
          <aside className="hidden lg:col-span-5 lg:block">
            <div className="sticky top-8 corner-m bg-card p-l hairline ring-border">
              <h2 className="font-display-wide mb-xs text-body-l font-medium">
                Your plan
              </h2>
              <Summary j={{ ...j, club }} editable={step !== "payment"} />
            </div>
          </aside>
        </Container>
      </main>
    </>
  )
}

export function JoinConfirmed() {
  const [j, , ready] = useJoin()
  const cat = useCatalog()
  const now = useClubNow()
  if (!ready) return null
  const c = cat.clubBySlug(j.club)
  if (!j.done || !c)
    return (
      <Container className="py-section">
        <h1 className="font-display-wide text-display-m font-heavy">
          No membership started yet.
        </h1>
        <LinkButton href="/join/plan" className="mt-m">
          Pick your plan
        </LinkButton>
      </Container>
    )
  const t = totals(j, cat)
  const hours =
    now.weekday === 0 || now.weekday === 6
      ? "6 am–8 pm weekends"
      : "4:30 am–10 pm weekdays"
  return (
    <Container className="py-xxl lg:py-section">
      <CircleCheck className="size-12 text-success" aria-hidden="true" />
      <h1 className="font-display-wide mt-s text-display-m lg:text-display-xl font-heavy lg:font-heavy">
        You&apos;re in{j.first ? `, ${j.first}` : ""}.
      </h1>
      <p className="mt-xs max-w-[56ch] text-body-m">
        Welcome to Cactus Peak. Your membership starts today at {c.name}.
      </p>
      <p className="text-body-m text-muted-foreground">
        We emailed your receipt to {j.email || "your email"}.
      </p>
      <div
        className={cn(
          "flex flex-wrap items-center justify-between gap-s hairline",
          "mt-l corner-m p-l",
          "bg-card ring-border"
        )}
      >
        <p className="text-body-m">
          <span className="font-heavy">
            {t.plan.name}
            {j.mode === "family" && j.adults.length
              ? ` + ${j.adults.length} adult${j.adults.length > 1 ? "s" : ""}`
              : ""}
            {j.mode === "family" && j.kids.length
              ? ` + ${j.kids.length} child${j.kids.length > 1 ? "ren" : ""}`
              : ""}
          </span>{" "}
          · {c.name}
          <span className="block text-body-s text-muted-foreground">
            Next bill ${t.monthly} on the {t.billDay}. {c.cross}. Open {hours}.
          </span>
        </p>
        <button
          type="button"
          onClick={() => window.print()}
          className="min-h-11 text-body-s text-link underline-offset-4 hover:underline font-heavy"
        >
          Print receipt
        </button>
      </div>
      <ol className="mt-xl grid gap-m lg:grid-cols-3">
        <li className="corner-m bg-card p-l hairline ring-border">
          <h2 className="font-display-wide text-body-l font-medium">
            Set up your sign-in.
          </h2>
          <p className="mt-xxs text-body-m text-muted-foreground">
            Create a password or a passkey to use the app.
          </p>
          <Button className="mt-m" variant="outline">
            Create sign-in
          </Button>
        </li>
        <li className="corner-m bg-card p-l hairline ring-border">
          <h2 className="font-display-wide text-body-l font-medium">
            Get the app.
          </h2>
          <p className="mt-xxs text-body-m text-muted-foreground">
            Your check-in pass is waiting.
          </p>
          <LinkButton href="/app" variant="outline" className="mt-m">
            Get the app
          </LinkButton>
        </li>
        <li className="corner-m bg-card p-l hairline ring-border">
          <h2 className="font-display-wide text-body-l font-medium">
            Book your first class.
          </h2>
          <p className="mt-xxs text-body-m text-muted-foreground">
            Pick a class for this week.
          </p>
          <LinkButton href={scheduleUrl({ club: c.slug })} className="mt-m">
            See this week&apos;s classes
          </LinkButton>
          <p className="mt-xs">
            <TextLink href="/contact?topic=orientation">
              Add a free orientation with a coach
            </TextLink>
          </p>
        </li>
      </ol>
      <LinkButton href="/" variant="outline" className="mt-xl">
        Done
      </LinkButton>
    </Container>
  )
}
