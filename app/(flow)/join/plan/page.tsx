import type { Metadata } from "next"
import { Suspense } from "react"
import { JoinFlow } from "@/components/sections/join-flow"
export const metadata: Metadata = {
  title: "Pick a plan · Join — Cactus Peak",
  description: "Step 1 of 5: pick Trailhead, Ridge or Summit.",
  robots: { index: false },
}
export default function Page() {
  return (
    <Suspense fallback={null}>
      <JoinFlow step="plan" />
    </Suspense>
  )
}
