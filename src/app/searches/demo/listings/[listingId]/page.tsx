import { notFound } from 'next/navigation'
import { IntelligenceCard } from '@/components/listing/intelligence-card'
import { demoSearch, getDemoRankings, demoQuestionnaires } from '@/data/demo-hunt'

interface Props {
  params: Promise<{ listingId: string }>
}

export default async function DemoListingPage({ params }: Props) {
  const { listingId } = await params
  const rankings = getDemoRankings()
  const rankedListing = rankings.find((r) => r.listing.id === listingId)
  if (!rankedListing) notFound()

  const questionnaire = demoQuestionnaires[listingId] ?? null

  return (
    <IntelligenceCard
      rankedListing={rankedListing}
      searchId="demo"
      watchName={demoSearch.name}
      isDemo
      demoQuestionnaire={questionnaire}
    />
  )
}
