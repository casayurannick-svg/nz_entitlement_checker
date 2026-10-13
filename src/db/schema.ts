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

// 3. Statutory Rate Tables: Versioned policy rates and statutory thresholds
export const rateTables = sqliteTable('rate_tables', {
  id: text('id').primaryKey(), // e.g. "nz_rates_2024_2025"
  name: text('name').notNull(),
  effectiveFrom: text('effective_from').notNull(), // ISO Date
  effectiveTo: text('effective_to'), // ISO Date (null if current)
  isCurrent: integer('is_current', { mode: 'boolean' }).notNull().default(true),
  wffConfig: text('wff_config', { mode: 'json' }).notNull(),
  accommodationSupplementConfig: text('as_config', { mode: 'json' }).notNull(),
  familyBoostConfig: text('family_boost_config', { mode: 'json' }).notNull(),
  createdAt: text('created_at').notNull().default('CURRENT_TIMESTAMP'),
});

// 4. Anonymous Scenarios: Opt-in, PII-free permalinks for user sharing
export const anonymousScenarios = sqliteTable('anonymous_scenarios', {
  id: text('id').primaryKey(),
  hash: text('hash').notNull(),
  profileData: text('profile_data', { mode: 'json' }).notNull(),
  calculatedResults: text('calculated_results', { mode: 'json' }).notNull(),
  viewsCount: integer('views_count').notNull().default(0),
  createdAt: text('created_at').notNull().default('CURRENT_TIMESTAMP'),
  expiresAt: text('expires_at'),
});

// 5. User Feedback & Policy Discrepancy Reports
export const userFeedback = sqliteTable('user_feedback', {
  id: text('id').primaryKey(),
  category: text('category').notNull(),
  message: text('message').notNull(),
  scenarioSnapshot: text('scenario_snapshot', { mode: 'json' }),
  createdAt: text('created_at').notNull().default('CURRENT_TIMESTAMP'),
});

export type MsdPostcodeArea = typeof msdPostcodeAreas.$inferSelect;
export type NewMsdPostcodeArea = typeof msdPostcodeAreas.$inferInsert;

export type SavedSession = typeof savedSessions.$inferSelect;
export type NewSavedSession = typeof savedSessions.$inferInsert;
