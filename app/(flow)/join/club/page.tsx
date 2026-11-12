import type { Metadata } from "next"
import { Suspense } from "react"
import { JoinFlow } from "@/components/sections/join-flow"
export const metadata: Metadata = {
  title: "Home club · Join — Cactus Peak",
  description: "Step 2 of 5: pick your home club.",
  robots: { index: false },
}
export default function Page() {
  return (
    <Suspense fallback={null}>
      <JoinFlow step="club" />
    </Suspense>
  )
}
