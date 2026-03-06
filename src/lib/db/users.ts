import { prisma } from '@/lib/prisma'
import { PLAN_LIMITS, type Tier } from '@/lib/plans'
import type { User } from '@/generated/prisma/client'

export type { User }

export async function getUser(userId: string): Promise<User | null> {
  return prisma.user.findUnique({ where: { id: userId } })
}

export async function upsertUser(userId: string, email: string): Promise<User> {
  return prisma.user.upsert({
    where: { id: userId },
    create: { id: userId, email },
    update: {}, // never overwrite tier on re-login
  })
}

export async function canCreateSearch(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) return false
  const limit = PLAN_LIMITS[user.tier as Tier].searches
  if (limit === Infinity) return true
  const count = await prisma.search.count({ where: { userId, status: 'active' } })
  return count < limit
}

export async function canAddListing(searchId: string, userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) return false
  const limit = PLAN_LIMITS[user.tier as Tier].listingsPerSearch
  if (limit === Infinity) return true
  const count = await prisma.listing.count({ where: { searchId } })
  return count < limit
}

export async function canMakeAiCall(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) return false

  const now = new Date()
  const resetAt = new Date(user.aiCallsResetAt)
  const isNewDay =
    now.getUTCFullYear() !== resetAt.getUTCFullYear() ||
    now.getUTCMonth() !== resetAt.getUTCMonth() ||
    now.getUTCDate() !== resetAt.getUTCDate()

  if (isNewDay) {
    await prisma.user.update({
      where: { id: userId },
      data: { aiCallsToday: 0, aiCallsResetAt: now },
    })
    return true
  }

  const limit = PLAN_LIMITS[user.tier as Tier].aiCallsPerDay
  return user.aiCallsToday < limit
}

export async function incrementAiCalls(userId: string): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: { aiCallsToday: { increment: 1 } },
  })
}

export async function getUserTier(userId: string): Promise<Tier> {
  const user = await prisma.user.findUnique({ where: { id: userId } })
  return (user?.tier ?? 'FREE') as Tier
}
