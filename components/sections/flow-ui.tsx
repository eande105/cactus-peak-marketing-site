"use client"

import { useId } from "react"
import { AlertCircle } from "@/components/icons"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

export function Field({
  label,
  error,
  help,
  required,
  children,
  className,
}: {
  label: string
  error?: string
  help?: string
  /** Shows "(required)" after the label and sets `required` on the control. */
  required?: boolean
  children: (p: {
    id: string
    "aria-invalid": boolean
    "aria-describedby": string | undefined
    required?: boolean
  }) => React.ReactNode
  className?: string
}) {
  const id = useId()
  const d =
    [help ? `${id}-h` : "", error ? `${id}-e` : ""].filter(Boolean).join(" ") ||
    undefined
  return (
    <div className={cn("flex flex-col gap-xs", className)}>
      <label htmlFor={id} className="text-body-s font-heavy">
        {label}
        {required ? (
          <span className="font-regular text-muted-foreground">
            {" "}
            (required)
          </span>
        ) : null}
      </label>
      {children({
        id,
        "aria-invalid": !!error,
        "aria-describedby": d,
        ...(required ? { required: true } : {}),
      })}
      {help ? (
        <p id={`${id}-h`} className="text-body-s text-muted-foreground">
          {help}
        </p>
      ) : null}
      {error ? (
        <p
          id={`${id}-e`}
          className="flex items-start gap-xs text-body-s font-medium text-destructive"
        >
          <AlertCircle className="mt-xxs size-4 shrink-0" aria-hidden="true" />
          {error}
        </p>
      ) : null}
    </div>
  )
}
export function TextField({
  label,
  value,
  onChange,
  error,
  help,
  type = "text",
  autoComplete,
  inputMode,
  className,
  maxLength,
  onBlur,
  required,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  error?: string
  help?: string
  type?: string
  autoComplete?: string
  inputMode?: "numeric" | "tel" | "email" | "text"
  className?: string
  maxLength?: number
  onBlur?: () => void
  required?: boolean
}) {
  return (
    <Field
      label={label}
      error={error}
      help={help}
      className={className}
      required={required}
    >
      {(p) => (
        <Input
          {...p}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          autoComplete={autoComplete}
          inputMode={inputMode}
          maxLength={maxLength}
          className="bg-card"
        />
      )}
    </Field>
  )
}
/**
 * The list of errors at the top of a form. Pass `show` false until the visitor tries to submit: before that
 * the fields show their own messages on blur and a summary would repeat them.
 */
/**
 * The invalid control whose own error text is `message`. Every field names its error through aria-describedby,
 * so the summary needs no list of field ids.
 */
function fieldFor(message: string) {
  const invalid = document.querySelectorAll<HTMLElement>(
    '[aria-invalid="true"]'
  )
  for (const el of invalid) {
    const ids = el.getAttribute("aria-describedby")?.split(" ") ?? []
    if (
      ids.some(
        (id) => document.getElementById(id)?.textContent?.trim() === message
      )
    )
      return el
  }
  // A group (a radio list, a set of date parts) shows its error under the group instead: go to the group's first
  // control. The summary itself is skipped.
  const shown = [...document.querySelectorAll<HTMLElement>("p")].find(
    (p) => !p.closest("#error-summary") && p.textContent?.trim() === message
  )
  return (
    shown
      ?.closest("fieldset, div")
      ?.querySelector<HTMLElement>(
        'input:not([aria-hidden="true"]), select, textarea, button:not([tabindex="-1"]), [role="radio"][tabindex="0"]'
      ) ?? null
  )
}

export function ErrorSummary({
  errors,
  show = true,
}: {
  errors: Record<string, string>
  show?: boolean
}) {
  const list = Object.values(errors).filter(Boolean)
  if (!show || !list.length) return null
  return (
    // No role="alert": the form moves focus here, and focus already reads it once.
    <div
      tabIndex={-1}
      id="error-summary"
      className="corner-m bg-danger-subtle p-m text-body-s hairline ring-destructive"
    >
      <p className="font-heavy">
        Fix {list.length === 1 ? "1 thing" : `${list.length} things`} to
        continue.
      </p>
      <ul className="mt-xxs list-disc pl-l">
        {list.map((e) => (
          <li key={e}>
            {/* Each item goes to its field, so the visitor fixes it without hunting for it. */}
            <button
              type="button"
              onClick={() => fieldFor(e)?.focus()}
              className="text-left underline underline-offset-4"
            >
              {e}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
export function StepBar({
  step,
  total,
  label,
}: {
  step: number
  total: number
  label: string
}) {
  return (
    // biome-ignore lint/a11y/useSemanticElements: role=group on a non-form control group; fieldset adds default min-inline-size and a legend that would change the layout
    <div role="group" aria-label={`Step ${step} of ${total}: ${label}`}>
      <div className="flex gap-xs" aria-hidden="true">
        {Array.from({ length: total }, (_, i) => (
          <span
            // biome-ignore lint/suspicious/noArrayIndexKey: step dots are a fixed-length list that never reorders
            key={i}
            className={cn(
              "h-2 flex-1 corner-full",
              i < step ? "bg-primary" : "bg-border"
            )}
          />
        ))}
      </div>
      <p className="tabular mt-xs text-body-s font-medium">
        Step {step} of {total}: {label}
      </p>
    </div>
  )
}

/**
 * A field that people never see and bots fill in. The server action drops a post that has a value here.
 * It is off-screen (not display: none, which some bots skip) and out of the tab order and the accessibility tree.
 */
export function Honeypot() {
  return (
    <div
      aria-hidden="true"
      className="absolute -left-[10000px] h-px w-px overflow-hidden"
    >
      <label>
        Company
        <input
          type="text"
          name="company"
          tabIndex={-1}
          autoComplete="off"
          defaultValue=""
        />
      </label>
    </div>
  )
}
/** The honeypot value of a submitted form. */
export const honeypotOf = (form: HTMLFormElement) =>
  String(new FormData(form).get("company") ?? "")

/** Field errors from a server action, or its one general error. */
export function serverErrors(r: {
  error: string
  fields?: Record<string, string>
}): Record<string, string> {
  return r.fields && Object.keys(r.fields).length ? r.fields : { form: r.error }
}
export const focusErrors = () =>
  setTimeout(() => document.getElementById("error-summary")?.focus(), 0)
