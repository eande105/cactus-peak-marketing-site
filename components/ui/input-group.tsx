"use client"

import { cva, type VariantProps } from "class-variance-authority"
import type * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

// shadcn/ui input-group (base-nova), moved onto this project's tokens. The group draws the field edge, fill and
// focus ring that Input draws on its own (components/ui/input.tsx), so the control inside turns them off. Graphical
// has no input group, which is why this part is shadcn.

function InputGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    // biome-ignore lint/a11y/useSemanticElements: role=group on a field and its buttons; fieldset adds default min-inline-size and needs a legend
    <div
      data-slot="input-group"
      role="group"
      className={cn(
        "group/input-group relative flex min-h-11 w-full min-w-0 items-center hairline",
        "corner-s",
        "bg-card ring-input transition-[box-shadow]",
        "hover:ring-input-hover",
        "has-disabled:bg-muted has-disabled:ring-border/20",
        "has-[[data-slot=input-group-control]:focus-visible]:ring-accent",
        "has-[[data-slot][aria-invalid=true]]:ring-destructive!",
        "motion-reduce:transition-none",
        "has-[>[data-align=inline-end]]:[&>input]:pr-xs",
        "has-[>[data-align=inline-start]]:[&>input]:pl-xs",
        className
      )}
      {...props}
    />
  )
}

const inputGroupAddonVariants = cva(
  "flex h-auto cursor-text items-center justify-center gap-xxs py-xxs text-body-s text-muted-foreground select-none group-has-disabled/input-group:opacity-50 [&>svg:not([class*='size-'])]:size-4 font-heavy",
  {
    variants: {
      align: {
        "inline-start": "order-first pl-s has-[>button]:pl-xxs",
        "inline-end": "order-last pr-s has-[>button]:pr-xxs",
      },
    },
    defaultVariants: {
      align: "inline-start",
    },
  }
)

function InputGroupAddon({
  className,
  align = "inline-start",
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof inputGroupAddonVariants>) {
  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents: a pointer convenience only; keyboard users reach the input directly
    // biome-ignore lint/a11y/noStaticElementInteractions: the click only moves focus to the input beside the addon
    <div
      data-slot="input-group-addon"
      data-align={align}
      className={cn(inputGroupAddonVariants({ align }), className)}
      onClick={(e) => {
        if ((e.target as HTMLElement).closest("button")) return
        e.currentTarget.parentElement?.querySelector("input")?.focus()
      }}
      {...props}
    />
  )
}

// The buttons are 36 px so they sit inside the 44 px field. Button's touch overlay keeps the hit area at 44 px.
const inputGroupButtonVariants = cva("", {
  variants: {
    size: {
      sm: "min-h-9 px-s py-zero",
      "icon-sm": "size-9",
    },
  },
  defaultVariants: {
    size: "sm",
  },
})

function InputGroupButton({
  className,
  type = "button",
  variant = "ghost",
  size = "sm",
  ...props
}: Omit<React.ComponentProps<typeof Button>, "size" | "type"> &
  VariantProps<typeof inputGroupButtonVariants> & {
    type?: "button" | "submit" | "reset"
  }) {
  return (
    <Button
      type={type}
      data-size={size}
      variant={variant}
      size={size === "icon-sm" ? "icon" : "sm"}
      className={cn(inputGroupButtonVariants({ size }), className)}
      {...props}
    />
  )
}

function InputGroupInput({
  className,
  ...props
}: React.ComponentProps<"input">) {
  return (
    <Input
      data-slot="input-group-control"
      className={cn(
        "flex-1",
        "corner-zero py-xs",
        "bg-transparent shadow-none ring-transparent",
        "hover:ring-transparent focus-visible:ring-transparent disabled:bg-transparent aria-invalid:ring-transparent",
        className
      )}
      {...props}
    />
  )
}

export { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput }
