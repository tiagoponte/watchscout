'use server'

import { revalidatePath } from 'next/cache'
import { archiveSearch, deleteSearch, unarchiveSearch } from '@/lib/db/searches'
import { getUserContext } from '@/lib/server/get-user-id'

export async function archiveSearchAction(searchId: string): Promise<void> {
  const { id: userId } = await getUserContext()
  await archiveSearch(searchId, userId)
  revalidatePath('/dashboard')
}

export async function deleteSearchAction(searchId: string): Promise<void> {
  const { id: userId } = await getUserContext()
  await deleteSearch(searchId, userId)
  revalidatePath('/dashboard')
}

export async function unarchiveSearchAction(searchId: string): Promise<void> {
  const { id: userId } = await getUserContext()
  await unarchiveSearch(searchId, userId)
  revalidatePath('/dashboard')
}
