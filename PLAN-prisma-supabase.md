# Plan: Prisma + Supabase Integration (Replace Mock Data)

## Overview

Replace the three `src/data/mock-*.ts` files with a real PostgreSQL database on Supabase,
accessed via Prisma ORM. Pages use Prisma directly (server components). The new-search form
POSTs to an API route. Existing TypeScript types stay unchanged.

---

## Prisma Schema Design

Two models: `Search` and `Listing`.

**Key decisions:**
- `CardField<T>` wrappers stored as `Json` columns (pragmatic for MVP, avoids ~40 extra columns)
- Rank/score fields stored inline on `Listing` (each listing belongs to exactly one search)
- `factorScores` stored as `Json` (10-field object)
- `photos` stored as `String[]` (Postgres text array)

```prisma
model Search {
  id               String    @id
  name             String
  watchCategory    String?
  criteria         Json
  status           String    @default("active")
  decidedListingId String?
  createdAt        DateTime  @default(now())
  updatedAt        DateTime  @updatedAt
  listings         Listing[]
}

model Listing {
  id                   String    @id
  searchId             String
  search               Search    @relation(fields: [searchId], references: [id], onDelete: Cascade)
  platform             String
  platformListingId    String?
  url                  String?
  referenceNumber      Json
  askingPrice          Json
  currency             Json
  shippingCost         Json
  conditionRating      Json
  includedItems        Json
  sellerWarrantyMonths Json
  returnsPolicy        Json
  platformProtection   Json
  photos               String[]
  thumbnailPhotoIndex  Int?
  seller               Json
  polishingStatus      Json
  lastServiceYear      Json
  lastServiceType      Json
  partsReplaced        Json
  braceletSizingInfo   Json
  actualShippingToUser Json
  allInPrice           Float?
  valueScore           Float?
  riskScore            Float?
  conditionConfidence  Float?
  rank                 Int?
  compositeScore       Float?
  factorScores         Json?
  rankDelta            Int?
  notes                String?
  addedAt              DateTime  @default(now())
  updatedAt            DateTime  @updatedAt
  contactedAt          DateTime?
}
```

---

## Files to Create

| File | Purpose |
|------|---------|
| `prisma/schema.prisma` | Prisma schema (above) |
| `prisma/seed.ts` | Seed DB from existing mock data |
| `src/lib/prisma.ts` | Singleton Prisma client |
| `src/lib/db/searches.ts` | `getSearches()`, `getSearch()`, `createSearch()` |
| `src/lib/db/listings.ts` | `getRankedListings()`, `getListing()` — mapper functions |
| `src/app/api/searches/route.ts` | `POST /api/searches` (for client form) |
| `.env.local` | `DATABASE_URL` placeholder |

## Files to Modify

| File | Change |
|------|--------|
| `package.json` | Add `prisma` seed config + install deps |
| `src/app/dashboard/page.tsx` | Replace mock imports → `getSearches()` |
| `src/app/searches/[searchId]/page.tsx` | Replace mock imports → `getSearch()` + `getRankedListings()` |
| `src/app/searches/[searchId]/listings/[listingId]/page.tsx` | Replace mock imports → `getListing()` |
| `src/app/searches/new/page.tsx` | Wire submit button → POST to `/api/searches` |

## Files to Delete (after migration verified)

- `src/data/mock-searches.ts`
- `src/data/mock-listings.ts`
- `src/data/mock-ranking.ts`

---

## Implementation Steps

### Step 0: Supabase Setup (manual — user action)
1. Go to https://supabase.com → New project
2. Note the database password
3. Go to Settings → Database → Connection string (URI mode)
4. Copy the connection string → paste into `.env.local` as `DATABASE_URL`

### Step 1: Install Prisma
```bash
cd watchscout
npm install prisma @prisma/client
npx prisma init --datasource-provider postgresql
```

### Step 2: Write schema.prisma
Replace generated schema with the two-model schema above.

### Step 3: Configure .env.local
```
DATABASE_URL="postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres"
```

### Step 4: Push schema to Supabase
```bash
npx prisma db push
```

### Step 5: Create Prisma singleton (`src/lib/prisma.ts`)
Standard Next.js singleton pattern to prevent connection pool exhaustion in dev.

### Step 6: Create seed script (`prisma/seed.ts`)
- Import mock-searches, mock-listings, mock-ranking
- Upsert searches + listings + inline rank/score fields
- Uses `prisma.$transaction` for atomicity

### Step 7: Add seed config to package.json + run seed
```json
"prisma": { "seed": "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts" }
```
```bash
npx prisma db seed
```

### Step 8: Create DB query functions
`src/lib/db/searches.ts` — wraps Prisma queries, returns existing TypeScript `Search` shape
`src/lib/db/listings.ts` — wraps Prisma queries, maps rows to `ListingCard` + `RankedListing` shapes

### Step 9: Create POST API route
`src/app/api/searches/route.ts` — validates body, calls `createSearch()`, returns created search

### Step 10: Update pages
Each server component page: remove mock imports, call DB functions instead.
New search page: wire submit to fetch POST `/api/searches`, redirect on success.

### Step 11: Delete mock data files + verify
```bash
npm run build
```
Should compile clean with zero TypeScript errors.

---

## Verification Checklist

- [ ] `npx prisma db push` completes without errors
- [ ] `npx prisma db seed` inserts 2 searches + 7 listings
- [ ] Dashboard shows 2 search cards
- [ ] Speedmaster search page shows 5 ranked listings
- [ ] Listing detail (lst_speed_01) renders Intelligence Card correctly
- [ ] New search form submits and redirects
- [ ] `npm run build` passes clean
