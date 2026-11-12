import type { Metadata } from "next"
import { Suspense } from "react"
import { JoinFlow } from "@/components/sections/join-flow"
export const metadata: Metadata = {
  title: "Your details · Join — Cactus Peak",
  description: "Step 3 of 5: your name, email and date of birth.",
  robots: { index: false },
}
export default function Page() {
  return (
    <Suspense fallback={null}>
      <JoinFlow step="details" />
    </Suspense>
  )
}
