'use server'

import { revalidatePath } from 'next/cache'
import { deleteListing, rerankListings } from '@/lib/db/listings'

export async function deleteListingAction(listingId: string, searchId: string): Promise<void> {
  await deleteListing(listingId, searchId)
  await rerankListings(searchId)
  revalidatePath(`/searches/${searchId}`)
}
