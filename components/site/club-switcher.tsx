"use client"

import { useId, useMemo, useState } from "react"
import { StatusLine } from "@/components/brand/club-parts"
import { ClubPin } from "@/components/brand/club-pin"
import { varyingFacilities } from "@/components/brand/facilities"
import { BusynessMeter } from "@/components/brand/meters"
import {
  AlertCircle,
  Check,
  ChevronDown,
  LocateFixed,
  MapPin,
} from "@/components/icons"
import {
  FacilityIcons,
  FacilityLegend,
} from "@/components/sections/club-facility-key"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Overlay,
  OverlayClose,
  OverlayDescription,
  OverlayPopup,
  OverlayTitle,
  OverlayTrigger,
} from "@/components/ui/overlay"
import { RadioGroupBox } from "@/components/ui/radio-group-box"
import { distancesFrom } from "@/lib/geo"
import { clubStatus } from "@/lib/time"
import type { ClubSlug } from "@/lib/types"
import { cn } from "@/lib/utils"
import { useCatalog, useClubNow } from "./catalog-context"
import { lookupZip, useMyClub } from "./club-context"

/** ZIP + location + sorted club list. Shared by the switcher dialog and the /clubs finder header. */
export function useFinder() {
  const { distances, setDistances } = useMyClub()
  const { clubs } = useCatalog()
  const [zip, setZip] = useState("")
  const [error, setError] = useState("")
  const [notice, setNotice] = useState("")
  const [busy, setBusy] = useState(false)
  const find = () => {
    const r = lookupZip(zip.trim(), clubs)
    if (!r.ok) {
      setError(r.error)
      setNotice("")
      return false
    }
    setError("")
    setNotice("")
    setDistances(r.d)
    return true
  }
  const locate = () => {
    setError("")
    setNotice("")
    if (!("geolocation" in navigator)) {
      setError("Location is not available here. Enter your ZIP code instead.")
      return
    }
    setBusy(true)
    navigator.geolocation.getCurrentPosition(
      (p) => {
        setBusy(false)
        setDistances(
          distancesFrom([p.coords.latitude, p.coords.longitude], clubs)
        )
      },
      (e) => {
        setBusy(false)
        setError(
          e.code === 1
            ? "Location is off for this site. Enter your ZIP code instead."
            : "We could not find you in time. Enter your ZIP code instead."
        )
      },
      { timeout: 8000, maximumAge: 300000, enableHighAccuracy: false }
    )
  }
  return {
    zip,
    setZip,
    error,
    notice,
    busy,
    find,
    locate,
    distances,
    clear: () => setDistances(undefined),
  }
}

/**
 * ZIP search, for the /clubs finder and the phone menu's club switcher. It follows the site's other fields (the
 * FAQ search, the search page, the email sign-ups): a label over a card-fill input with its icon inside, and
 * the submit button beside it. Using a location is a second, full-width choice under an "or" rule, with the
 * notice in plain sight under it.
 */
export function ZipFinder({
  f,
  className,
  idPrefix,
}: {
  f: ReturnType<typeof useFinder>
  className?: string
  idPrefix: string
}) {
  const id = `${idPrefix}${useId()}`
  const notice = "Your browser asks first. We use it once and do not store it."
  const errorLine = (
    <div id={`${id}-e`} aria-live="polite">
      {f.error ? (
        <p className="mt-xs flex items-start gap-xs text-body-s font-medium text-destructive">
          <AlertCircle className="mt-xxs size-4 shrink-0" aria-hidden="true" />
          {f.error}
        </p>
      ) : null}
    </div>
  )
  return (
    <div className={className}>
      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault()
          f.find()
        }}
      >
        <label htmlFor={id} className="mb-xxs block text-body-s font-heavy">
          ZIP code
        </label>
        <div className="flex gap-xs">
          <div className="relative min-w-0 flex-1">
            <MapPin
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              id={id}
              inputMode="numeric"
              autoComplete="postal-code"
              maxLength={5}
              placeholder="85201"
              value={f.zip}
              onChange={(e) => f.setZip(e.target.value.replace(/\D/g, ""))}
              aria-invalid={!!f.error}
              aria-describedby={`${id}-e`}
              className="tabular bg-card pl-xl"
            />
          </div>
          <Button type="submit" className="shrink-0">
            Find
          </Button>
        </div>
      </form>
      {errorLine}
      <div
        aria-hidden="true"
        className="my-m flex items-center gap-s text-body-s text-muted-foreground"
      >
        <span className="h-px flex-1 bg-border" />
        or
        <span className="h-px flex-1 bg-border" />
      </div>
      <Button
        type="button"
        variant="outline"
        onClick={f.locate}
        loading={f.busy}
        aria-describedby={`${id}-n`}
        className="w-full"
      >
        <LocateFixed aria-hidden="true" />
        Use my location
      </Button>
      <p id={`${id}-n`} className="mt-xs text-body-s text-muted-foreground">
        {notice}
      </p>
    </div>
  )
}

export function ClubSwitcher({
  placement = "utility",
  className,
}: {
  placement?: "utility" | "mobile-row" | "block"
  className?: string
}) {
  const { club, setClub, clear } = useMyClub()
  const f = useFinder()
  const { clubs } = useCatalog()
  const [open, setOpen] = useState(false)
  const [pick, setPick] = useState<ClubSlug | "">("")
  const list = useMemo(() => {
    const d = f.distances
    return [...clubs].sort((a, b) =>
      d ? (d[a.slug] ?? 99) - (d[b.slug] ?? 99) : 0
    )
  }, [clubs, f.distances])
  const keys = useMemo(() => varyingFacilities(clubs), [clubs])
  const selected = pick || club?.slug || ""
  const s = clubStatus(useClubNow())
  const label = club ? club.name : "Find your club"
  return (
    <Overlay
      open={open}
      onOpenChange={(o) => {
        setOpen(o)
        if (o) setPick("")
      }}
    >
      <OverlayTrigger
        aria-label={
          club
            ? `Your club: ${club.name}. ${s.short}. Change club`
            : "Find your club"
        }
        className={cn(
          "inline-flex min-h-11 items-center gap-xs",
          "corner-s px-xs",
          "text-body-s font-medium",
          "hover:bg-secondary-hover",
          placement === "mobile-row" && "w-full bg-muted px-m",
          placement === "block" &&
            "w-full justify-between corner-m bg-card px-m py-s hairline ring-border",
          className
        )}
      >
        <MapPin className="size-4 shrink-0" aria-hidden="true" />
        <span className="min-w-0 truncate">{label}</span>
        {club ? (
          <span className="hidden items-center gap-xs font-regular text-muted-foreground sm:inline-flex">
            <span
              aria-hidden="true"
              className="size-2 corner-full bg-success"
            />
            {s.short}
          </span>
        ) : null}
        <ChevronDown className="size-4 shrink-0" aria-hidden="true" />
      </OverlayTrigger>
      <OverlayPopup className="md:w-[460px]">
        {/* The title keeps XL space at its end for the corner close (dialog.md). */}
        <OverlayTitle className="pr-xl">Pick your club</OverlayTitle>
        <OverlayDescription>
          We use this to show your hours and classes.
        </OverlayDescription>
        <div className="min-h-0 flex-1 overflow-y-auto pr-xxs">
          <ZipFinder f={f} idPrefix="sw" />
          <FacilityLegend keys={keys} className="mt-l" />
          <fieldset className="mt-s">
            <legend className="sr-only">Clubs</legend>
            <RadioGroupBox className="flex flex-col gap-xs" aria-label="Clubs">
              {list.map((c) => {
                const on = selected === c.slug
                return (
                  // biome-ignore lint/a11y/useSemanticElements: button radiogroup is a keyboard-tested pattern from the approved a11y audit (axe clean); native radios would restructure the component
                  <button
                    key={c.slug}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    // The name is the club and its distance. The status, busyness and amenities are a description,
                    // so a screen reader says the name first and keeps the rest for after.
                    aria-labelledby={`pick-${c.slug}-name`}
                    aria-describedby={`pick-${c.slug}-more`}
                    onClick={() => setPick(c.slug)}
                    className={cn(
                      "relative flex min-h-16 w-full flex-col gap-xxs hairline",
                      "corner-m px-m py-s",
                      "text-left",
                      "bg-card ring-border",
                      "hover:ring-border-strong",
                      on && "bg-accent ring-2 ring-primary"
                    )}
                  >
                    <span
                      id={`pick-${c.slug}-name`}
                      className="flex items-center justify-between gap-xs text-body-s font-heavy"
                    >
                      <span className="flex min-w-0 items-center gap-xs">
                        <ClubPin n={c.n} />
                        {c.name}
                      </span>
                      {f.distances ? (
                        <span className="tabular">
                          {f.distances[c.slug].toFixed(1)} mi
                        </span>
                      ) : null}
                      {on ? (
                        <Check
                          className="size-4 text-link"
                          aria-hidden="true"
                        />
                      ) : null}
                    </span>
                    <span id={`pick-${c.slug}-more`} className="contents">
                      <span className="text-body-s text-muted-foreground">
                        {c.city}
                      </span>
                      <span className="flex flex-wrap items-center gap-x-s">
                        <StatusLine />
                        <BusynessMeter level={c.busyness} />
                      </span>
                      {/* The club key's icon row. The picked card has the accent fill, so its slashes go
                          without the card-colour ring. */}
                      <FacilityIcons
                        club={c}
                        keys={keys}
                        ringless={on}
                        className="mt-xs"
                      />
                    </span>
                  </button>
                )
              })}
            </RadioGroupBox>
          </fieldset>
        </div>
        <div className="flex items-center justify-between gap-s pt-m rule-t">
          <OverlayClose
            render={
              <Button
                disabled={!selected}
                focusableWhenDisabled
                onClick={() => {
                  if (selected) setClub(selected as ClubSlug)
                }}
              />
            }
          >
            Use this club
          </OverlayClose>
          <Button
            variant="ghost"
            onClick={() => {
              clear()
              setPick("")
            }}
          >
            Clear my club
          </Button>
        </div>
      </OverlayPopup>
    </Overlay>
  )
}
