export type ConditionLevel = 'mint' | 'very_good' | 'good' | 'fair'
export type SellerTypePreference = 'dealer' | 'private' | 'no_preference'
export type SearchStatus = 'active' | 'paused' | 'decided' | 'archived'
export type WatchCategory = 'chronograph' | 'diver' | 'dress' | 'field' | 'pilot' | 'sports'

export interface SearchCriteria {
  modelName: string
  referenceNumber?: string
  budgetMin: number
  budgetMax: number
  currency: string
  acceptableConditions: ConditionLevel[]
  mustHaves: string[]
  dealBreakers: string[]
  sellerTypePreference: SellerTypePreference
  preferredShippingOrigins?: string[]
  notes?: string
}

export interface Search {
  id: string
  name: string
  watchCategory?: WatchCategory
  criteria: SearchCriteria
  status: SearchStatus
  listingIds: string[]
  createdAt: string
  updatedAt: string
  decidedListingId?: string
}
