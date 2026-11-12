import { LinkButton } from "@/components/brand/atoms"
import { Container } from "@/components/sections/common"

export default function NotFound() {
  return (
    <Container className="py-section lg:py-section-l">
      <h1 className="font-display-wide text-display-m lg:text-display-xl font-heavy lg:font-heavy">
        We do not have a club at that address.
      </h1>
      <div className="mt-l flex flex-wrap gap-s">
        <LinkButton href="/clubs" size="lg">
          See all 5 clubs
        </LinkButton>
        <LinkButton href="/search" variant="outline" size="lg">
          Search
        </LinkButton>
      </div>
    </Container>
  )
}
