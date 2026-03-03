'use server'

import { revalidatePath } from 'next/cache'
import { deleteListing } from '@/lib/db/listings'

export async function deleteListingAction(listingId: string, searchId: string): Promise<void> {
  await deleteListing(listingId, searchId)
  revalidatePath(`/searches/${searchId}`)
}
