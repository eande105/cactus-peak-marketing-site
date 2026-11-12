import type { Metadata } from "next"
import { Suspense } from "react"
import { JoinFlow } from "@/components/sections/join-flow"
export const metadata: Metadata = {
  title: "Family · Join — Cactus Peak",
  description: "Step 4 of 5: add adults and children to your plan.",
  robots: { index: false },
}
export default function Page() {
  return (
    <Suspense fallback={null}>
      <JoinFlow step="family" />
    </Suspense>
  )
}
