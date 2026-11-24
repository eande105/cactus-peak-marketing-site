"use client"

import { Radio } from "@base-ui/react/radio"
import { RadioGroup } from "@base-ui/react/radio-group"

/**
 * A radio group of card-style options, on Base UI's RadioGroup (the primitive under Graphical's `RadioGroup`).
 * Base UI owns the keyboard behaviour (one Tab stop, arrow keys move and select) and the form value. The
 * Graphical `Radio` is the small round control, so the cards use the unstyled primitive and keep their own classes.
 * Set the selection with `value` and `onValueChange` on the group, not with a click handler on each card.
 */
export function RadioGroupBox<V>(props: RadioGroup.Props<V>) {
  return <RadioGroup<V> {...props} />
}

/** One card in a `RadioGroupBox`. It renders a `<button>`, so the card can hold any phrasing content. */
export function RadioCard<V>(props: Radio.Root.Props<V>) {
  return (
    <Radio.Root nativeButton render={<button type="button" />} {...props} />
  )
}
