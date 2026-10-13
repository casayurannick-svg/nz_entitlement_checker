# Technical Design Document (TDD)
## New Zealand Entitlement & Tax Credit Checker

**Document Version:** 1.0.0  
**Stack:** Next.js 14 (Pages Router), TypeScript, Tailwind CSS, Turso DB (libSQL), Drizzle ORM  
**Target Architecture:** Privacy-Preserving Client-Side Compute + Edge Persistence  

---

## 1. System Architecture & Core Design Principles

The New Zealand Entitlement Checker is designed around four foundational pillars:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        CLIENT BROWSER (User)                           │
│                                                                        │
│  ┌───────────────────────┐           ┌──────────────────────────────┐  │
│  │   Interactive UI      │           │  Pure Calculation Engine     │  │
│  │  (Wizard / Sliders)   │──────────▶│  - calculateWff()            │  │
│  │  Next.js Pages + TW   │◀──────────│  - calculateAccomSupplement()│  │
│  └───────────────────────┘           │  - calculateFamilyBoost()    │  │
│             │                        └──────────────────────────────┘  │
│             │ (Optional Share / Read Rates)                            │
└─────────────┼──────────────────────────────────────────────────────────┘
              ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   NEXT.JS 14 PAGES API ROUTES (Edge)                   │
│                                                                        │
│   GET  /api/rates                 POST /api/scenarios/share            │
│   GET  /api/scenarios/[id]        POST /api/feedback                   │
└─────────────────────────────────────┬──────────────────────────────────┘
                                      ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        DATABASE LAYER (Drizzle ORM)                    │
│                                                                        │
│   ┌────────────────────────────────────────────────────────────────┐   │
│   │   Turso DB (libSQL Distributed Edge Database)                  │   │
│   │   - rate_tables (Statutory policies & historical thresholds)   │   │
│   │   - anonymous_scenarios (Voluntary shareable scenario permalinks│   │
│   │   - user_feedback (Accuracy feedback & policy edge cases)      │   │
│   └────────────────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────────────────┘
```

### 1.1 Architectural Principles
1. **Privacy-by-Design (Client-Side Compute):** All user inputs—incomes, dependent children, accommodation expenses, and asset values—are processed **100% inside client-side browser memory**. No sensitive financial data or personal identifiable information (PII) is transmitted to the server during calculation.
2. **Sub-Millisecond Deterministic Latency:** Entitlements recalculate in `<2ms` synchronously upon every keystroke or slider drag, eliminating loading spinners and providing tactile "what-if" explorations.
3. **Statutory Rate Decoupling:** Government policies and rate thresholds (e.g., April 1 Annual General Adjustments) are isolated in immutable rate configuration tables rather than hardcoded in business logic.
4. **Lightweight Edge Persistence (Turso + Drizzle):** The serverless database is reserved for immutable statutory rate storage, optional anonymous scenario sharing, and user feedback.

---

## 2. Client-Side Calculator Architecture

The calculation engine is implemented as a set of pure, stateless TypeScript functions.

### 2.1 Domain Data Model (`src/types/entitlements.ts`)

```typescript
export type RelationshipStatus = 'single' | 'couple' | 'sole_parent';

export type HousingTenure = 'renting' | 'boarding' | 'homeowner';

export type GeographicArea = 1 | 2 | 3 | 4; // Area 1: Auckland/Queenstown, Area 2: Wgt/Chc/Tga, etc.

export interface ChildProfile {
  id: string;
  age: number; // in years (0 to 18)
  eceHoursPerWeek?: number;
  weeklyEceFees?: number;
  sharedCarePercent?: number; // 33% to 100%
}

export interface HouseholdProfile {
  relationshipStatus: RelationshipStatus;
  applicantGrossAnnualIncome: number;
  partnerGrossAnnualIncome?: number;
  applicantWeeklyWorkHours: number;
  partnerWeeklyWorkHours?: number;
  receivesMainBenefit: boolean;
  children: ChildProfile[];
  
  // Housing & Assets
  area: GeographicArea;
  tenure: HousingTenure;
  weeklyRentOrBoard: number;
  weeklyMortgageInterest: number;
  annualCouncilRates: number;
  annualHouseInsurance: number;
  cashAssets: number;
}

export interface WffBreakdown {
  familyTaxCreditWeekly: number;
  familyTaxCreditAnnual: number;
  inWorkTaxCreditWeekly: number;
  inWorkTaxCreditAnnual: number;
  bestStartTaxCreditWeekly: number;
  bestStartTaxCreditAnnual: number;
  minimumFamilyTaxCreditWeekly: number;
  minimumFamilyTaxCreditAnnual: number;
  totalWffWeekly: number;
  totalWffAnnual: number;
  abatedAmountAnnual: number;
}

export interface AccommodationSupplementBreakdown {
  assessedHousingCostWeekly: number;
  entryThresholdWeekly: number;
  costAboveThresholdWeekly: number;
  rawEntitlementWeekly: number;
  statutoryMaxWeekly: number;
  assetDisqualified: boolean;
  incomeAbatementWeekly: number;
  finalWeeklyPayment: number;
  finalAnnualPayment: number;
}

export interface FamilyBoostBreakdown {
  eligibleEceFeesWeekly: number;
  rawReimbursementWeekly: number; // 25% of eligible fees
  cappedReimbursementWeekly: number; // Max $75/wk
  incomeAbatementWeekly: number; // Abatement between $140k and $180k
  finalWeeklyPayment: number;
  finalQuarterlyPayment: number;
  finalAnnualPayment: number;
}

export interface EntitlementCalculationResult {
  wff: WffBreakdown;
  accommodationSupplement: AccommodationSupplementBreakdown;
  familyBoost: FamilyBoostBreakdown;
  totalWeekly: number;
  totalAnnual: number;
  effectiveMarginalTaxRateEstimate?: number;
}
```

### 2.2 Calculation Engine Pipeline

```
[HouseholdProfile Input]
        │
        ├─────────────────────────────────────────────────┐
        ▼                                                 ▼
┌───────────────────────┐                       ┌───────────────────────┐
│ calculateWff()        │                       │ calculateAccomSupp()  │
│ 1. Tally FTC by age   │                       │ 1. Convert board/mortg│
│ 2. Check IWTC hours   │                       │ 2. Lookup area cap    │
│ 3. Check BSTC ages    │                       │ 3. Compute 70% diff   │
│ 4. Apply 27% WFF drop │                       │ 4. Apply asset test   │
└──────────┬────────────┘                       └───────────┬───────────┘
           │                                                │
           │           ┌────────────────────────┐           │
           │           │ calculateFamilyBoost() │           │
           │           │ 1. 25% of ECE (max $75)│           │
           │           │ 2. Abate $140k-$180k   │           │
           │           └───────────┬────────────┘           │
           │                       │                        │
           └───────────────────────┼────────────────────────┘
                                   ▼
                ┌─────────────────────────────────────┐
                │ calculateAggregateEntitlements()    │
                │ Sum totals, compile breakdowns,    │
                │ compute take-home & EMTR impact     │
                └─────────────────────────────────────┘
```

---

## 3. Database Architecture (Turso DB & Drizzle ORM)

### 3.1 Why Turso & Drizzle ORM?
- **Turso (libSQL):** SQLite distributed at the edge. Gives zero-cold-start queries, single-file local development, embedded replica capabilities, and zero operations overhead.
- **Drizzle ORM:** Ultra-performant, zero-bloat TypeScript ORM. Generates type-safe SQL queries without runtime overhead, perfectly aligned with Next.js Pages API routes.

### 3.2 Database Schema (`src/db/schema.ts`)

The database schema is defined using Drizzle ORM's SQLite core, fully compatible with Turso / libSQL edge execution.

```typescript
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

// 1. MSD Postcode to Accommodation Supplement Area Mapping (Areas 1 to 4)
export const msdPostcodeAreas = sqliteTable('msd_postcode_areas', {
  postcode: text('postcode').primaryKey(), // 4-digit NZ postcode (e.g. "1010")
  suburb: text('suburb').notNull(),        // Suburb or locality name (e.g. "Auckland Central")
  city: text('city').notNull(),            // City / Territorial authority (e.g. "Auckland")
  region: text('region').notNull(),        // Regional council area (e.g. "Auckland Region")
  area: integer('area').notNull(),          // MSD Accommodation Supplement Area (1, 2, 3, or 4)
  notes: text('notes'),                    // Special zoning or border notes
  createdAt: text('created_at').notNull().default('CURRENT_TIMESTAMP'),
});

// 2. Saved Sessions: User or client-saved calculation scenarios
export const savedSessions = sqliteTable('saved_sessions', {
  id: text('id').primaryKey(),
  sessionToken: text('session_token'),
  title: text('title'),
  profileData: text('profile_data', { mode: 'json' }).notNull(),
  calculatedResults: text('calculated_results', { mode: 'json' }).notNull(),
  createdAt: text('created_at').notNull().default('CURRENT_TIMESTAMP'),
  updatedAt: text('updated_at').notNull().default('CURRENT_TIMESTAMP'),
  expiresAt: text('expires_at'),
});

// 3. Statutory Rate Tables: Version-controlled policy numbers
export const rateTables = sqliteTable('rate_tables', {
  id: text('id').primaryKey(), // e.g. "nz_rates_2024_2025"
  name: text('name').notNull(),
  effectiveFrom: text('effective_from').notNull(), // ISO Date
  effectiveTo: text('effective_to'), // ISO Date (null if current)
  isCurrent: integer('is_current', { mode: 'boolean' }).notNull().default(true),
  
  // WFF Parameters (JSON serialized for flexible legislative structures)
  wffConfig: text('wff_config', { mode: 'json' }).notNull(),
  
  // Accommodation Supplement Parameters (JSON serialized Area limits & thresholds)
  accommodationSupplementConfig: text('as_config', { mode: 'json' }).notNull(),
  
  // FamilyBoost Parameters
  familyBoostConfig: text('family_boost_config', { mode: 'json' }).notNull(),
  
  createdAt: text('created_at').notNull().default('CURRENT_TIMESTAMP'),
});

// 4. Anonymous Scenarios: Opt-in, PII-free permalinks for user sharing
export const anonymousScenarios = sqliteTable('anonymous_scenarios', {
  id: text('id').primaryKey(), // Nanoid / UUID short slug
  hash: text('hash').notNull(), // SHA256 of parameters to deduplicate
  
  // Fully anonymized inputs (no names, no dates of birth, no IPs)
  profileData: text('profile_data', { mode: 'json' }).notNull(),
  
  // Cached calculation results
  calculatedResults: text('calculated_results', { mode: 'json' }).notNull(),
  
  viewsCount: integer('views_count').notNull().default(0),
  createdAt: text('created_at').notNull().default('CURRENT_TIMESTAMP'),
  expiresAt: text('expires_at'), // Optional TTL
});

// 5. User Feedback & Policy Discrepancy Reports
export const userFeedback = sqliteTable('user_feedback', {
  id: text('id').primaryKey(),
  category: text('category').notNull(), // 'calculation_mismatch', 'suggestion', 'legislation_update'
  message: text('message').notNull(),
  scenarioSnapshot: text('scenario_snapshot', { mode: 'json' }),
  createdAt: text('created_at').notNull().default('CURRENT_TIMESTAMP'),
});
```

### 3.3 Database Client Configuration (`src/db/index.ts`)

```typescript
import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import * as schema from './schema';

const client = createClient({
  url: process.env.TURSO_DATABASE_URL || 'file:local.db',
  authToken: process.env.TURSO_AUTH_TOKEN,
});

export const db = drizzle(client, { schema });
```

### 3.4 Migrations & Seed Architecture (`src/db/seed.ts`)

#### Migration Workflow
1. **Drizzle Kit Config (`drizzle.config.ts`):**
   - Configured with `dialect: 'turso'` pointing to the database URL (`file:local.db` or remote Turso connection string).
2. **Migration Generation:**
   - Run `npm run db:generate` (`drizzle-kit generate`) to output versioned SQL files into `drizzle/`.
   - Migration `0001_overconfident_killmonger.sql` adds `msd_postcode_areas` and `saved_sessions`.
3. **Migration Execution:**
   - Run `npm run db:migrate` (`drizzle-kit migrate`) to execute pending DDL against the libSQL database.

#### Postcode Mapping & Seed Logic
The seed script (`src/db/seed.ts`) populates **203 official New Zealand postcodes** mapped to MSD Accommodation Supplement Areas:
- **Area 1 (57 postcodes):** Auckland Urban (Central, North Shore, Waitakere, Manukau, Papakura, Pukekohe) and Queenstown Lakes District Urban (Queenstown, Arrowtown, Wanaka, Frankton).
- **Area 2 (55 postcodes):** High-cost urban regions including Wellington City, Lower Hutt, Upper Hutt, Porirua, Kapiti Coast (Paraparaumu, Waikanae), Christchurch Urban (Central, Riccarton, Papanui, Rangiora, Rolleston), Tauranga & Western Bay of Plenty (Mount Maunganui, Papamoa, Te Puke, Katikati), Hamilton Urban, and Nelson Urban.
- **Area 3 (34 postcodes):** Provincial cities and regional centres including Whangārei, Rotorua, Taupō, Cambridge, Te Awamutu, New Plymouth, Palmerston North, Napier, Hastings, Whanganui, Blenheim, Richmond, Dunedin Urban, Mosgiel, Invercargill, Timaru, and Ashburton.
- **Area 4 (57 postcodes):** Rural districts, smaller townships, and offshore regions (Far North, Coromandel, King Country, Central Hawke's Bay, Ruapehu, Rangitikei, Tararua, West Coast, Central Otago, Southland rural, Stewart Island, Chatham Islands).

The script also seeds initial 2024/2025 statutory rate parameters into `rate_tables` using chunked upserts (`onConflictDoUpdate`) for idempotent execution:
```bash
npm run db:seed
```

---

## 4. API Layer (Next.js Pages Router)

### 4.1 Endpoints Specification

1. **`GET /api/rates`**
   - Returns the active statutory rate parameters.
   - Cache-Control: `public, max-age=86400, s-maxage=604800, stale-while-revalidate`
2. **`POST /api/scenarios/share`**
   - Body: `HouseholdProfile` (validated via Zod schema)
   - Saves anonymized record in Turso `anonymous_scenarios`.
   - Returns: `{ shareId: "abc123xyz", url: "https://.../?scenario=abc123xyz" }`
3. **`GET /api/scenarios/[id]`**
   - Fetches saved anonymized profile data to hydrate the calculator on another device.
4. **`POST /api/feedback`**
   - Records user feedback on entitlement discrepancies.

---

## 5. UI/UX Architecture & Design System

### 5.1 Design Tokens & Aesthetics
- **Theme Palette:**
  - NZ Forest Green / Pounamu Accents: `#059669` / `#10b981` / `#047857`
  - Deep Navy Slate Canvas: `#0f172a` / `#1e293b`
  - Entitlement Indicator Tints:
    - Working for Families: Cyan / Teal
    - Accommodation Supplement: Violet / Indigo
    - FamilyBoost: Emerald / Mint
- **Component Hierarchy:**
  1. **Header / Navbar:** Brand mark, NZ crest motif, quick links, "Why this is private" modal toggle.
  2. **Hero Section:** High-impact heading, live summary metric counter ("$X/week extra support").
  3. **Interactive Step Wizard:**
     - Step 1: Your Household & Whānau
     - Step 2: Income & Employment
     - Step 3: Housing & Location
     - Step 4: Results & Official Next Steps
  4. **Live Entitlement Summary Card:** Fixed/sticky reactive card displaying aggregate weekly and annual figures in real-time.
  5. **What-If Marginal Rate Explorer:** Interactive slider testing incremental income jumps.
  6. **Next Steps & Official Portal Deep Links:** Checklist with exact forms for IRD (myIR) and MSD (MyMSD).

---

## 6. Security, Compliance & Verification

1. **Strict Zero-PII Policy:**
   - No names, physical addresses, IRD numbers, or client numbers are collected or stored.
   - Scenario sharing generates hashed identifiers without client IP retention.
2. **Deterministic Test Suite:**
   - 100% test coverage on pure calculation functions.
   - Standard test fixtures matching official IRD/MSD calculators.
3. **Build & Quality Gates:**
   - TypeScript strict mode enabled (`strict: true`).
   - ESLint validation.
   - Automated `npm run build` static verification.
