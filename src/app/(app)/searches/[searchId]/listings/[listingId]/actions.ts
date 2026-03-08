'use server'

import { revalidatePath } from 'next/cache'
import { updateFactorScores, rerankByCompositeScore } from '@/lib/db/listings'
import type { FactorScores } from '@/types'

export async function updateScoresAction(
  listingId: string,
  searchId: string,
  factorScores: FactorScores,
  compositeScore: number,
): Promise<void> {
  await updateFactorScores(listingId, searchId, factorScores, compositeScore)
  await rerankByCompositeScore(searchId)
  revalidatePath(`/searches/${searchId}/listings/${listingId}`)
  revalidatePath(`/searches/${searchId}`)
}
