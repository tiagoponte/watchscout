import { prisma } from '@/lib/prisma'
import { PLAN_LIMITS, HUNT_UNLOCK_LIMITS, type Tier } from '@/lib/plans'
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
  const [user, search, count] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.search.findUnique({ where: { id: searchId }, select: { unlockedAt: true } }),
    prisma.listing.count({ where: { searchId } }),
  ])
  if (!user || !search) return false
  if (user.tier === 'POWER') return true
  if (search.unlockedAt !== null) return count < HUNT_UNLOCK_LIMITS.listingsPerSearch
  return count < PLAN_LIMITS.FREE.listingsPerSearch
}

export async function canMakeAiCall(userId: string, searchId?: string): Promise<boolean> {
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) return false

  if (user.tier === 'POWER') {
    const now = new Date()
    const resetAt = new Date(user.aiCallsResetAt)
    const isNewDay =
      now.getUTCFullYear() !== resetAt.getUTCFullYear() ||
      now.getUTCMonth() !== resetAt.getUTCMonth() ||
      now.getUTCDate() !== resetAt.getUTCDate()
    if (isNewDay) {
      await prisma.user.update({ where: { id: userId }, data: { aiCallsToday: 0, aiCallsResetAt: now } })
      return true
    }
    return user.aiCallsToday < PLAN_LIMITS.POWER.aiCallsPerDay
  }

  // Check search-level unlock first
  if (searchId) {
    const search = await prisma.search.findUnique({
      where: { id: searchId },
      select: { unlockedAt: true, aiCallsUsed: true },
    })
    if (search?.unlockedAt != null) {
      return search.aiCallsUsed < HUNT_UNLOCK_LIMITS.aiCallsPerHunt
    }
  }

  // FREE daily limit
  const now = new Date()
  const resetAt = new Date(user.aiCallsResetAt)
  const isNewDay =
    now.getUTCFullYear() !== resetAt.getUTCFullYear() ||
    now.getUTCMonth() !== resetAt.getUTCMonth() ||
    now.getUTCDate() !== resetAt.getUTCDate()
  if (isNewDay) {
    await prisma.user.update({ where: { id: userId }, data: { aiCallsToday: 0, aiCallsResetAt: now } })
    return true
  }
  return user.aiCallsToday < PLAN_LIMITS.FREE.aiCallsPerDay
}

export async function incrementAiCalls(userId: string, searchId?: string): Promise<void> {
  if (searchId) {
    const search = await prisma.search.findUnique({
      where: { id: searchId },
      select: { unlockedAt: true },
    })
    if (search?.unlockedAt != null) {
      await prisma.search.update({ where: { id: searchId }, data: { aiCallsUsed: { increment: 1 } } })
      return
    }
  }
  await prisma.user.update({ where: { id: userId }, data: { aiCallsToday: { increment: 1 } } })
}

export async function getUserTier(userId: string): Promise<Tier> {
  const user = await prisma.user.findUnique({ where: { id: userId } })
  return (user?.tier ?? 'FREE') as Tier
}
