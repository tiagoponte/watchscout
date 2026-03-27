'use server'

import { revalidatePath } from 'next/cache'
import { updateFactorScores, rerankByCompositeScore } from '@/lib/db/listings'
import { getSearch } from '@/lib/db/searches'
import { getApiUserContext } from '@/lib/server/get-user-id'
import type { FactorScores } from '@/types'

export async function updateScoresAction(
  listingId: string,
  searchId: string,
  factorScores: FactorScores,
  compositeScore: number,
): Promise<void> {
  const ctx = await getApiUserContext()
  if (!ctx) return
  const search = await getSearch(searchId, ctx.id)
  if (!search) return
  await updateFactorScores(listingId, searchId, factorScores, compositeScore)
  await rerankByCompositeScore(searchId)
  revalidatePath(`/searches/${searchId}/listings/${listingId}`)
  revalidatePath(`/searches/${searchId}`)
}
