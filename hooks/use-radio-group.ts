"use client"

import { useLayoutEffect, useRef } from "react"

const NEXT = new Set(["ArrowDown", "ArrowRight"])
const PREV = new Set(["ArrowUp", "ArrowLeft"])

/**
 * Keyboard behaviour for a `role="radiogroup"` built from `role="radio"` buttons (the APG radio group pattern).
 * The group is one Tab stop: the checked radio, or the first one when none is checked. Arrow keys move to the
 * next or previous radio and select it, and Home and End go to the ends. Spread the result on the group element.
 */
export function useRadioGroup<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T>(null)
  // Runs after every render, because the checked radio and the list of radios can change on any render.
  useLayoutEffect(() => {
    const radios = items(ref.current)
    const stop =
      radios.find((r) => r.getAttribute("aria-checked") === "true") ?? radios[0]
    for (const r of radios) r.tabIndex = r === stop ? 0 : -1
  })
  const onKeyDown = (e: React.KeyboardEvent<T>) => {
    const radios = items(ref.current)
    const at = radios.indexOf(e.target as HTMLElement)
    if (at < 0) return
    let to = -1
    if (NEXT.has(e.key)) to = (at + 1) % radios.length
    else if (PREV.has(e.key)) to = (at - 1 + radios.length) % radios.length
    else if (e.key === "Home") to = 0
    else if (e.key === "End") to = radios.length - 1
    if (to < 0) return
    e.preventDefault()
    radios[to].focus()
    radios[to].click()
  }
  return { ref, onKeyDown }
}

function items(group: HTMLElement | null) {
  if (!group) return []
  return [...group.querySelectorAll<HTMLElement>('[role="radio"]')].filter(
    (r) =>
      !r.hasAttribute("disabled") && r.getAttribute("aria-disabled") !== "true"
  )
}
