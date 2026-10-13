import { HouseholdProfile, FamilyBoostBreakdown } from '../../types/entitlements';

/**
 * 2026 IRD FamilyBoost Policy Parameters
 * - 40% ECE fee rebate
 * - Max $120/week ($1,560 per quarter, $6,240 per year)
 * - Abates linearly from $140,000 to $229,144 per annum
 */
export const FAMILYBOOST_CONSTANTS_2026 = {
  REIMBURSEMENT_PERCENT: 0.40, // 40% of eligible ECE fees
  MAX_WEEKLY_PAYMENT: 120.0,   // $120/week
  MAX_QUARTERLY_PAYMENT: 1560.0, // $1,560 per quarter (13 weeks)
  MAX_ANNUAL_PAYMENT: 6240.0,    // $6,240 per annum (52 weeks)
  INCOME_FULL_THRESHOLD: 140000,   // Full rebate up to $140,000
  INCOME_CUTOFF_THRESHOLD: 229144, // Linear abatement reaches $0 at $229,144
  INCOME_ABATEMENT_SPAN: 89144,    // $229,144 - $140,000 = $89,144
  ABATEMENT_SLOPE: 6240 / 89144,   // ~0.07000022 per dollar of income
};

// 2024 Historical Baseline
export const FAMILYBOOST_CONSTANTS_2024 = {
  REIMBURSEMENT_PERCENT: 0.25,
  MAX_WEEKLY_PAYMENT: 75.0,
  MAX_QUARTERLY_PAYMENT: 975.0,
  MAX_ANNUAL_PAYMENT: 3900.0,
  INCOME_FULL_THRESHOLD: 140000,
  INCOME_CUTOFF_THRESHOLD: 180000,
  INCOME_ABATEMENT_SPAN: 40000,
  ABATEMENT_SLOPE: 0.1875,
};

export type FamilyBoostPolicyConfig = typeof FAMILYBOOST_CONSTANTS_2026;

/**
 * Pure function: calculate FamilyBoost tax credit using 2026 IRD rules
 * - 40% ECE fee rebate
 * - Max $120/wk
 * - Abates linearly from $140,000 to $229,144/yr
 */
export function calculateFamilyBoost(
  profile: HouseholdProfile,
  config: FamilyBoostPolicyConfig = FAMILYBOOST_CONSTANTS_2026
): FamilyBoostBreakdown {
  const totalIncome =
    profile.applicantGrossAnnualIncome + (profile.partnerGrossAnnualIncome || 0);

  // 1. Tally eligible weekly ECE fees for children under 5 years old
  let eligibleEceFeesWeekly = 0;
  profile.children.forEach((child) => {
    if (child.age < 5 && child.weeklyEceFees) {
      eligibleEceFeesWeekly += child.weeklyEceFees;
    }
  });

  // Edge cases: No eligible fees or income above the cutoff threshold ($229,144)
  if (
    eligibleEceFeesWeekly === 0 ||
    totalIncome >= config.INCOME_CUTOFF_THRESHOLD
  ) {
    return {
      eligibleEceFeesWeekly: Number(eligibleEceFeesWeekly.toFixed(2)),
      rawReimbursementWeekly: 0,
      cappedReimbursementWeekly: 0,
      incomeAbatementWeekly: 0,
      finalWeeklyPayment: 0,
      finalQuarterlyPayment: 0,
      finalAnnualPayment: 0,
    };
  }

  // 2. 40% reimbursement capped at statutory maximum ($120/wk)
  const rawReimbursementWeekly =
    eligibleEceFeesWeekly * config.REIMBURSEMENT_PERCENT;
  const cappedReimbursementWeekly = Math.min(
    rawReimbursementWeekly,
    config.MAX_WEEKLY_PAYMENT
  );

  // 3. Linear Abatement between $140,000 and $229,144
  let finalWeeklyPayment = cappedReimbursementWeekly;
  let incomeAbatementWeekly = 0;

  if (totalIncome > config.INCOME_FULL_THRESHOLD) {
    // Linear scale factor from 1.0 down to 0.0 at $229,144
    const remainingIncomeRange = config.INCOME_CUTOFF_THRESHOLD - totalIncome;
    const totalAbatementRange =
      config.INCOME_CUTOFF_THRESHOLD - config.INCOME_FULL_THRESHOLD;

    const linearFactor = Math.max(
      0,
      Math.min(1, remainingIncomeRange / totalAbatementRange)
    );

    finalWeeklyPayment = cappedReimbursementWeekly * linearFactor;
    incomeAbatementWeekly = cappedReimbursementWeekly - finalWeeklyPayment;
  }

  const finalQuarterlyPayment = finalWeeklyPayment * 13;
  const finalAnnualPayment = finalWeeklyPayment * 52;

  return {
    eligibleEceFeesWeekly: Number(eligibleEceFeesWeekly.toFixed(2)),
    rawReimbursementWeekly: Number(rawReimbursementWeekly.toFixed(2)),
    cappedReimbursementWeekly: Number(cappedReimbursementWeekly.toFixed(2)),
    incomeAbatementWeekly: Number(incomeAbatementWeekly.toFixed(2)),
    finalWeeklyPayment: Number(finalWeeklyPayment.toFixed(2)),
    finalQuarterlyPayment: Number(finalQuarterlyPayment.toFixed(2)),
    finalAnnualPayment: Number(finalAnnualPayment.toFixed(2)),
  };
}
