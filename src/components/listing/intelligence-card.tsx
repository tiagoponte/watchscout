import Link from 'next/link'
import { ArrowLeft, ExternalLink, Shield, RotateCcw } from 'lucide-react'
import { RankedListing } from '@/types'
import { CardSection } from './card-section'
import { DataField } from './data-field'
import { ConfidenceIndicator } from './confidence-indicator'
import { PhotoGallery } from './photo-gallery'
import { QuestionnairePanel } from './questionnaire-panel'
import { ScoringPanel } from './scoring-panel'
import { OfferSuggestionPanel } from './offer-suggestion'
import { DemoQuestionnaireView } from './demo-questionnaire-view'
import type { DemoQuestionnaire } from '@/data/demo-hunt'
import { RankBadge } from '@/components/searches/rank-badge'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { formatCurrency, formatRelativeDate, getPlatformLabel, getScoreColor, getRiskColor } from '@/lib/format'

interface IntelligenceCardProps {
  rankedListing: RankedListing
  searchId: string
  watchName: string
  isDemo?: boolean
  demoQuestionnaire?: DemoQuestionnaire | null
}

const conditionLabels: Record<string, { label: string; color: string }> = {
  mint: { label: 'Mint', color: 'bg-emerald-950 text-emerald-400 border-emerald-800' },
  very_good: { label: 'Very Good', color: 'bg-blue-950 text-blue-400 border-blue-800' },
  good: { label: 'Good', color: 'bg-yellow-950 text-yellow-300 border-yellow-800' },
  fair: { label: 'Fair', color: 'bg-orange-950 text-orange-400 border-orange-800' },
  poor: { label: 'Poor', color: 'bg-red-950 text-red-400 border-red-800' },
}

const polishingBadgeConfig: Record<string, { label: string; color: string }> = {
  unpolished: { label: 'Unpolished', color: 'bg-emerald-950 text-emerald-400 border-emerald-800' },
  light_polish: { label: 'Light polish', color: 'bg-yellow-950 text-yellow-300 border-yellow-800' },
  heavily_polished: { label: 'Heavily polished', color: 'bg-red-950 text-red-400 border-red-800' },
}

const serviceLabels: Record<string, string> = {
  full_service: 'Full service',
  partial_service: 'Partial service',
  unknown: 'Unknown',
}


export function IntelligenceCard({ rankedListing, searchId, watchName, isDemo, demoQuestionnaire }: IntelligenceCardProps) {
  const { listing, rank, compositeScore, factorScores, rankDelta } = rankedListing
  const currency = listing.currency.value ?? 'EUR'
  const price = listing.askingPrice.value
  const condition = listing.conditionRating.value
  const items = listing.includedItems.value
  const seller = listing.seller.value

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      {/* Back link */}
      <Link
        href={`/searches/${searchId}`}
        className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-200 transition-colors mb-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to listings
      </Link>

      {/* Hero header */}
      <div className="pb-4 border-b border-zinc-800">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <Badge variant="outline" className="text-xs bg-zinc-900 border-zinc-700 text-zinc-400">
                {getPlatformLabel(listing.platform)}
              </Badge>
              {listing.referenceNumber.value && (
                <span className="text-sm text-zinc-500">
                  Ref. {listing.referenceNumber.value}
                </span>
              )}
              {listing.manufactureYear.value != null && (
                <span className="text-sm text-zinc-500">
                  {listing.manufactureYear.value}
                </span>
              )}
            </div>
            <h1 className="text-xl font-bold text-zinc-100">{watchName}</h1>
            <p className="text-sm text-zinc-400 mt-0.5">{seller?.name ?? 'Unknown seller'}</p>
            {listing.contactedAt && (
              <p className="text-xs text-zinc-500 mt-0.5">
                Contacted {formatRelativeDate(listing.contactedAt)}
              </p>
            )}
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <RankBadge rank={rank} delta={rankDelta} />
            {listing.url && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    asChild
                    variant="ghost"
                    size="icon"
                    className="text-zinc-500 hover:text-amber-400 hover:bg-transparent transition-colors"
                  >
                    <a
                      href={listing.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`View listing on ${getPlatformLabel(listing.platform)}`}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>View on {getPlatformLabel(listing.platform)}</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {!isDemo && (
            <Button
              asChild
              className="bg-amber-400 text-zinc-950 hover:bg-amber-300 font-semibold"
            >
              <a href="#questionnaire">Contact Seller</a>
            </Button>
          )}
          <Button
            asChild
            variant="outline"
            className="border-zinc-700 text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800 hover:border-zinc-600"
          >
            <a href="#scoring">Adjust Scoring</a>
          </Button>
        </div>
      </div>

      {/* Section 1: Overview — always open on page load */}
      <CardSection title="Overview">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div>
            <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Asking Price</p>
            <p className="text-lg font-bold text-zinc-100 tabular-nums">
              {price != null ? formatCurrency(price, currency) : '—'}
            </p>
          </div>
          <div>
            <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">All-in Price</p>
            <p className="text-lg font-bold text-amber-400 tabular-nums">
              {listing.allInPrice != null
                ? formatCurrency(listing.allInPrice, currency)
                : '—'}
            </p>
          </div>
          <div>
            <p className="text-xs text-zinc-500 uppercase tracking-wider mb-0.5">Score</p>
            <p className={`text-lg font-bold tabular-nums ${getScoreColor(compositeScore)}`}>
              {compositeScore}
              <span className="text-sm text-zinc-600 font-normal ml-0.5">/100</span>
            </p>
            <p className="text-xs text-zinc-600 mt-0.5">higher is better</p>
          </div>
          <div>
            <p className="text-xs text-zinc-500 uppercase tracking-wider mb-0.5">Risk</p>
            <p className={`text-lg font-bold tabular-nums ${listing.riskScore != null ? getRiskColor(listing.riskScore) : 'text-zinc-500'}`}>
              {listing.riskScore ?? '—'}
              {listing.riskScore != null && <span className="text-sm text-zinc-600 font-normal ml-0.5">/100</span>}
            </p>
            <p className="text-xs text-zinc-600 mt-0.5">lower is better</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {listing.platformProtection.value && (
            <Badge variant="outline" className="gap-1 bg-emerald-950 text-emerald-400 border-emerald-800 text-xs">
              <Shield className="h-3 w-3" />
              Platform Protected
            </Badge>
          )}
          {listing.returnsPolicy.value && (
            <Badge variant="outline" className="gap-1 bg-zinc-900 text-zinc-400 border-zinc-700 text-xs">
              <RotateCcw className="h-3 w-3" />
              {listing.returnsPolicy.value}
            </Badge>
          )}
          {listing.addedAt && (
            <span className="text-xs text-zinc-600">
              Added {formatRelativeDate(listing.addedAt)}
            </span>
          )}
        </div>
        {listing.notes && (
          <p className="text-xs text-zinc-500 italic mt-3 pt-3 border-t border-zinc-800">
            {listing.notes}
          </p>
        )}
        {!isDemo && <OfferSuggestionPanel listingId={listing.id} searchId={searchId} currency={currency} />}
      </CardSection>

      {/* Section 2: Questionnaire */}
      <CardSection id="questionnaire" title="Questionnaire" defaultOpen={false}>
        {isDemo ? (
          demoQuestionnaire ? (
            <DemoQuestionnaireView questionnaire={demoQuestionnaire} />
          ) : (
            <p className="text-sm text-zinc-500 py-4 text-center">
              No questionnaire for this listing — generate one in your own hunt.
            </p>
          )
        ) : (
          <QuestionnairePanel listing={listing} searchId={searchId} />
        )}
      </CardSection>

      {/* Section 3: Scoring Breakdown */}
      <CardSection id="scoring" title="Scoring Breakdown" defaultOpen={false}>
        <ScoringPanel
          initialFactorScores={factorScores}
          initialCompositeScore={compositeScore}
          listingId={listing.id}
          searchId={searchId}
        />
      </CardSection>

      {/* Section 4: Photos */}
      <CardSection title="Photos">
        <PhotoGallery photos={listing.photos} alt={`Listing ${listing.id}`} thumbnailIndex={listing.thumbnailPhotoIndex ?? 0} />
      </CardSection>

      {/* Section 5: Condition & Accessories */}
      <CardSection title="Condition & Accessories" defaultOpen={false}>
        {/* Condition + Polishing — side by side, badge-level */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          <div>
            <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1.5">Condition</p>
            <div className="flex items-center gap-2 flex-wrap">
              {condition && conditionLabels[condition] ? (
                <Badge variant="outline" className={`text-sm px-3 py-1 ${conditionLabels[condition].color}`}>
                  {conditionLabels[condition].label}
                </Badge>
              ) : (
                <Badge variant="outline" className="text-sm px-3 py-1 bg-zinc-900 text-zinc-500 border-zinc-700">
                  Unknown
                </Badge>
              )}
              <ConfidenceIndicator confidence={listing.conditionRating.confidence} />
              {listing.conditionConfidence != null && (
                <span className="text-xs text-zinc-600">{listing.conditionConfidence}%</span>
              )}
            </div>
          </div>
          <div>
            <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1.5">Polishing</p>
            <div className="flex items-center gap-2 flex-wrap">
              {listing.polishingStatus.value && polishingBadgeConfig[listing.polishingStatus.value] ? (
                <Badge variant="outline" className={`text-sm px-3 py-1 ${polishingBadgeConfig[listing.polishingStatus.value].color}`}>
                  {polishingBadgeConfig[listing.polishingStatus.value].label}
                </Badge>
              ) : (
                <Badge variant="outline" className="text-sm px-3 py-1 bg-zinc-900 text-zinc-500 border-zinc-700">
                  Unknown
                </Badge>
              )}
              <ConfidenceIndicator confidence={listing.polishingStatus.confidence} />
            </div>
            {listing.polishingStatus.notes && (
              <p className="text-xs text-zinc-500 italic mt-1">{listing.polishingStatus.notes}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Box', value: items?.box },
            { label: 'Papers', value: items?.papers },
            { label: 'Extra Links', value: items?.extraLinks },
            { label: 'Warranty Card', value: items?.warrantyCard },
          ].map(({ label, value }) => (
            <div
              key={label}
              className={`flex items-center gap-2 px-3 py-2 rounded-md border ${
                value === true
                  ? 'bg-emerald-950/30 border-emerald-800/50 text-emerald-400'
                  : value === false
                  ? 'bg-zinc-900 border-zinc-800 text-zinc-600'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-500'
              }`}
            >
              <span className="text-base">{value === true ? '✓' : value === false ? '✗' : '?'}</span>
              <span className="text-sm">{label}</span>
            </div>
          ))}
        </div>

        {listing.includedItems.notes && (
          <p className="text-xs text-zinc-500 italic mt-3">{listing.includedItems.notes}</p>
        )}
        {listing.sellerWarrantyMonths.value != null && (
          <p className="text-xs text-zinc-400 mt-2">
            Seller warranty: <span className="text-zinc-200">{listing.sellerWarrantyMonths.value} months</span>
          </p>
        )}
      </CardSection>

      {/* Section 6: Service History */}
      <CardSection title="Service History" defaultOpen={false}>
        <DataField
          label="Last Service Year"
          value={listing.lastServiceYear.value?.toString() ?? null}
          confidence={listing.lastServiceYear.confidence}
          notes={listing.lastServiceYear.notes}
        />
        <DataField
          label="Service Type"
          value={
            listing.lastServiceType.value
              ? serviceLabels[listing.lastServiceType.value]
              : null
          }
          confidence={listing.lastServiceType.confidence}
        />
        <DataField
          label="Parts Replaced"
          value={
            listing.partsReplaced.value != null
              ? listing.partsReplaced.value.length === 0
                ? 'None'
                : listing.partsReplaced.value.join(', ')
              : null
          }
          confidence={listing.partsReplaced.confidence}
          notes={listing.partsReplaced.notes}
        />
        <DataField
          label="Bracelet / Sizing"
          value={listing.braceletSizingInfo.value}
          confidence={listing.braceletSizingInfo.confidence}
        />
      </CardSection>

      {/* Section 7: Seller Details */}
      <CardSection title="Seller Details" defaultOpen={false}>
        <DataField
          label="Name"
          value={seller?.name ?? null}
          confidence={listing.seller.confidence}
        />
        <DataField
          label="Type"
          value={seller?.type === 'dealer' ? 'Authorised Dealer' : seller?.type === 'private' ? 'Private Seller' : null}
          confidence={listing.seller.confidence}
        />
        {seller?.rating != null && (
          <DataField
            label="Rating"
            value={
              listing.platform === 'ebay'
                ? `${seller.rating}% positive (${seller.reviewCount?.toLocaleString()} reviews)`
                : `${seller.rating}/5 (${seller.reviewCount?.toLocaleString()} reviews)`
            }
            confidence={listing.seller.confidence}
          />
        )}
        {seller?.responseTime && (
          <DataField
            label="Response Time"
            value={seller.responseTime}
            confidence="confirmed"
          />
        )}
        {seller?.memberSince && (
          <DataField
            label="Member Since"
            value={seller.memberSince}
            confidence="confirmed"
          />
        )}
        <DataField
          label="Shipping Cost"
          value={
            listing.shippingCost.value != null
              ? listing.shippingCost.value === 0
                ? 'Free'
                : formatCurrency(listing.shippingCost.value, currency)
              : null
          }
          confidence={listing.shippingCost.confidence}
        />
      </CardSection>

    </div>
  )
}
