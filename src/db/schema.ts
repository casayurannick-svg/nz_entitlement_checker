import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

// 1. Statutory Rate Tables: Versioned policy rates and statutory thresholds
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

// 2. Anonymous Scenarios: Opt-in, PII-free permalinks for user sharing
export const anonymousScenarios = sqliteTable('anonymous_scenarios', {
  id: text('id').primaryKey(),
  hash: text('hash').notNull(),
  profileData: text('profile_data', { mode: 'json' }).notNull(),
  calculatedResults: text('calculated_results', { mode: 'json' }).notNull(),
  viewsCount: integer('views_count').notNull().default(0),
  createdAt: text('created_at').notNull().default('CURRENT_TIMESTAMP'),
  expiresAt: text('expires_at'),
});

// 3. User Feedback & Policy Discrepancy Reports
export const userFeedback = sqliteTable('user_feedback', {
  id: text('id').primaryKey(),
  category: text('category').notNull(),
  message: text('message').notNull(),
  scenarioSnapshot: text('scenario_snapshot', { mode: 'json' }),
  createdAt: text('created_at').notNull().default('CURRENT_TIMESTAMP'),
});
