import type { Metadata } from "next"
import { LinkButton, SectionHead } from "@/components/brand/atoms"
import { GymObject } from "@/components/brand/graphics"
import { AppPhone } from "@/components/sections/app-phone"
import { Band, TourCTABand } from "@/components/sections/common"
import { ProgramHero } from "@/components/sections/program-page"
import { MEMBER_APP_URL } from "@/lib/links"

export const metadata: Metadata = {
  title: "Get the Cactus Peak app",
  description:
    "Book classes, see how busy the club is, and scan in with one tap. iPhone app.",
}

const FEATURES = [
  ["Book classes and join waitlists", "schedule"],
  ["See how busy your club is, right now", "heart-watch"],
  ["Check in with your pass", "pass"],
] as const

export default function AppPage() {
  return (
    <>
      <ProgramHero
        id="app-title"
        title="Your club, in your pocket."
        lede="Book classes, see how busy the club is, and scan in with one tap."
        actions={
          <LinkButton href="https://apps.apple.com/" external size="lg">
            Download on the App Store
          </LinkButton>
        }
        note={
          <>
            The app is for iPhone. On Android, use the{" "}
            <a
              className="text-link underline underline-offset-4"
              href={MEMBER_APP_URL}
            >
              member site
            </a>
            .
          </>
        }
        picture={<AppPhone />}
      />
      <Band tone="tint" id="features">
        <SectionHead title="What the app does." />
        <ol className="mt-8 grid gap-6 pt-6 rule-t rule-heavy lg:mt-12 lg:grid-cols-3">
          {FEATURES.map(([t, icon], i) => (
            <li key={t}>
              <span className="flex items-end justify-between gap-4">
                <span className="tabular font-data text-h1 font-bold">
                  {i + 1}
                </span>
                <GymObject id={icon} className="size-12" />
              </span>
              <p className="font-display-wide text-h3">{t}</p>
            </li>
          ))}
        </ol>
      </Band>
      <TourCTABand night title="See the club before you sign up." />
    </>
  )
}
