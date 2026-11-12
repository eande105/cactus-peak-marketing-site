import type { Metadata } from "next"
import { Suspense } from "react"
import { JoinFlow } from "@/components/sections/join-flow"
export const metadata: Metadata = {
  title: "Payment · Join — Cactus Peak",
  description: "Step 5 of 5: review your plan and pay.",
  robots: { index: false },
}
export default function Page() {
  return (
    <Suspense fallback={null}>
      <JoinFlow step="payment" />
    </Suspense>
  )
}
