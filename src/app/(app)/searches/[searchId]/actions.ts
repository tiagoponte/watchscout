'use server'

import { revalidatePath } from 'next/cache'
import { deleteListing, rerankListings } from '@/lib/db/listings'
import { markAsPurchased, unmarkAsPurchased } from '@/lib/db/searches'
import { getApiUserContext } from '@/lib/server/get-user-id'

export async function deleteListingAction(listingId: string, searchId: string): Promise<void> {
  await deleteListing(listingId, searchId)
  await rerankListings(searchId)
  revalidatePath(`/searches/${searchId}`)
}

export async function markAsPurchasedAction(listingId: string, searchId: string): Promise<void> {
  const ctx = await getApiUserContext()
  if (!ctx) return
  await markAsPurchased(searchId, listingId, ctx.id)
  revalidatePath(`/searches/${searchId}`)
}

export async function unmarkAsPurchasedAction(searchId: string): Promise<void> {
  const ctx = await getApiUserContext()
  if (!ctx) return
  await unmarkAsPurchased(searchId, ctx.id)
  revalidatePath(`/searches/${searchId}`)
}
