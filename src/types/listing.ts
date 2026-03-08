export type DataConfidence = 'confirmed' | 'claimed' | 'unknown' | 'pending'

export interface CardField<T> {
  value: T | null
  confidence: DataConfidence
  source?: string
  notes?: string
}

export type ConditionRating = 'mint' | 'very_good' | 'good' | 'fair' | 'poor'
export type PolishingStatus = 'unpolished' | 'light_polish' | 'heavily_polished' | 'unknown'
export type ServiceType = 'full_service' | 'partial_service' | 'unknown'
export type Platform = 'chrono24' | 'ebay' | 'watchfinder' | 'watchbox' | 'crown_caliber' | 'manual'
export type SellerType = 'dealer' | 'private'

export interface IncludedItems {
  box: boolean | null
  papers: boolean | null
  extraLinks: boolean | null
  warrantyCard: boolean | null
}

export interface SellerInfo {
  name: string
  type: SellerType
  rating: number | null
  reviewCount: number | null
  responseTime?: string | null
  memberSince?: string | null
}

export interface ListingCard {
  id: string
  searchId: string
  platform: Platform
  platformListingId?: string
  url?: string

  // Auto-extracted
  referenceNumber: CardField<string>
  askingPrice: CardField<number>
  currency: CardField<string>
  shippingCost: CardField<number>
  conditionRating: CardField<ConditionRating>
  includedItems: CardField<IncludedItems>
  sellerWarrantyMonths: CardField<number>
  returnsPolicy: CardField<string>
  platformProtection: CardField<boolean>
  photos: string[]
  thumbnailPhotoIndex?: number
  seller: CardField<SellerInfo>
  manufactureYear: CardField<number>
  listingLanguage?: string | null
  braceletType?: string | null

  // To be discovered
  polishingStatus: CardField<PolishingStatus>
  lastServiceYear: CardField<number>
  lastServiceType: CardField<ServiceType>
  partsReplaced: CardField<string[]>
  braceletSizingInfo: CardField<string>
  actualShippingToUser: CardField<number>

  // Calculated
  allInPrice: number | null
  valueScore: number | null
  riskScore: number | null
  conditionConfidence: number | null

  addedAt: string
  updatedAt: string
  contactedAt?: string
  notes?: string
}
