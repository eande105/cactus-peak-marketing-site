"use client"

import { useRadioGroup } from "@/hooks/use-radio-group"

/**
 * A `role="radiogroup"` container for card-style radio buttons. It adds the APG keyboard behaviour: one Tab
 * stop, arrow keys to move and select, Home and End. The radios inside stay `<button role="radio">`.
 */
export function RadioGroupBox({
  onKeyDown,
  ...props
}: React.ComponentProps<"div">) {
  const group = useRadioGroup()
  return (
    <div
      {...props}
      ref={group.ref}
      role="radiogroup"
      onKeyDown={(e) => {
        group.onKeyDown(e)
        onKeyDown?.(e)
      }}
    />
  )
}
