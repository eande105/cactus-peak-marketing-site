import type { Metadata } from "next"
import { SiteFooter } from "@/components/site/footer"
import { SiteHeader } from "@/components/site/header"
import NotFound from "./(site)/not-found"

// Without its own title, the 404 shows the home page title. The tab and history should say what happened.
export const metadata: Metadata = {
  title: { absolute: "Page not found — Cactus Peak" },
  description:
    "This page moved or never existed. Search the site or go to a club page.",
}

export default function Root404() {
  return (
    <div className="isolate flex min-h-dvh flex-col">
      <SiteHeader />
      <main id="main" tabIndex={-1} className="flex-1 outline-none">
        <NotFound />
      </main>
      <SiteFooter />
    </div>
  )
}
