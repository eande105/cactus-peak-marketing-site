import Image from "next/image"
import Link from "next/link"
import { cn } from "@/lib/utils"

export function Logo({
  reversed,
  className,
  width = 200,
  symbolOnly,
}: {
  reversed?: boolean
  className?: string
  width?: number
  symbolOnly?: boolean
}) {
  // Brand guidelines section 3: the symbol uses the small cut at 32 px and below, and the horizontal logo
  // is never narrower than 200 px (below that, use the symbol alone).
  if (!symbolOnly && width < 200)
    throw new Error(
      "The horizontal logo is 200 px wide at least. Use symbolOnly."
    )
  const src = symbolOnly
    ? width <= 32
      ? "/brand/cpa-symbol-small.svg"
      : reversed
        ? "/brand/cpa-symbol-reversed.svg"
        : "/brand/cpa-symbol-color.svg"
    : reversed
      ? "/brand/cpa-horizontal-reversed.svg"
      : "/brand/cpa-horizontal-color.svg"
  const h = symbolOnly ? width : Math.round((width * 256) / 1202)
  return (
    <Link
      href="/"
      aria-label="Cactus Peak Athletic, home"
      className={cn("inline-flex min-h-11 items-center corner-xs", className)}
    >
      <Image
        src={src}
        alt=""
        width={width}
        height={h}
        unoptimized
        priority
        style={{ width, height: h }}
      />
    </Link>
  )
}
