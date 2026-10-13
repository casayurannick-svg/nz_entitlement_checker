import { HouseholdProfile, WffBreakdown } from '../../types/entitlements';

/**
 * 2026 IRD Working for Families (WFF) Policy Parameters
 * - In-Work Tax Credit (IWTC): $147.00/week base
 * - Best Start Tax Credit (BSTC): $77.71/week
 * - Family Tax Credit (FTC) Abatement: 27.5 cents per dollar (0.275) for income exceeding $44,900
 */
export const WFF_CONSTANTS_2026 = {
  // Family Tax Credit (FTC)
  FTC_ELDEST_WEEKLY: 144.30,
  FTC_SUBSEQUENT_WEEKLY: 117.61,
  FTC_ABATEMENT_THRESHOLD: 44900,
  FTC_ABATEMENT_RATE: 0.275, // 27.5c per dollar

  // In-Work Tax Credit (IWTC)
  IWTC_BASE_WEEKLY: 147.00, // 2026 IRD rate ($147/wk for up to 3 children)
  IWTC_EXTRA_PER_CHILD_WEEKLY: 15.00, // 4th and subsequent children
  IWTC_MIN_HOURS_SOLE_PARENT: 20,
  IWTC_MIN_HOURS_COUPLE: 30,

  // Best Start Tax Credit (BSTC)
  BSTC_WEEKLY_RATE: 77.71, // 2026 IRD rate ($77.71/wk)
  BSTC_ABATEMENT_THRESHOLD_YEAR2_3: 79000,
  BSTC_ABATEMENT_RATE_YEAR2_3: 0.21,
};

// 2024 Historical Baseline (for backward comparisons)
export const WFF_CONSTANTS_2024 = {
  FTC_ELDEST_WEEKLY: 144.30,
  FTC_SUBSEQUENT_WEEKLY: 117.61,
  FTC_ABATEMENT_THRESHOLD: 42700,
  FTC_ABATEMENT_RATE: 0.27,
  IWTC_BASE_WEEKLY: 72.50,
  IWTC_EXTRA_PER_CHILD_WEEKLY: 15.00,
  IWTC_MIN_HOURS_SOLE_PARENT: 20,
  IWTC_MIN_HOURS_COUPLE: 30,
  BSTC_WEEKLY_RATE: 73.88,
  BSTC_ABATEMENT_THRESHOLD_YEAR2_3: 79000,
  BSTC_ABATEMENT_RATE_YEAR2_3: 0.21,
};

export type WffPolicyConfig = typeof WFF_CONSTANTS_2026;

/**
 * Pure function: calculate Working for Families tax credits using 2026 IRD rules
 */
export function calculateWff(
  profile: HouseholdProfile,
  config: WffPolicyConfig = WFF_CONSTANTS_2026
): WffBreakdown {
  const totalIncome =
    profile.applicantGrossAnnualIncome + (profile.partnerGrossAnnualIncome || 0);
  const dependentChildren = profile.children.filter((c) => c.age <= 18);

  if (dependentChildren.length === 0) {
    return {
      familyTaxCreditWeekly: 0,
      familyTaxCreditAnnual: 0,
      inWorkTaxCreditWeekly: 0,
      inWorkTaxCreditAnnual: 0,
      bestStartTaxCreditWeekly: 0,
      bestStartTaxCreditAnnual: 0,
      minimumFamilyTaxCreditWeekly: 0,
      totalWffWeekly: 0,
      totalWffAnnual: 0,
      abatedAmountAnnual: 0,
    };
  }

  // 1. Family Tax Credit (FTC) Base Calculation
  const sortedByAge = [...dependentChildren].sort((a, b) => b.age - a.age);
  let baseFtcAnnual = 0;
  sortedByAge.forEach((child, index) => {
    const weeklyRate =
      index === 0
        ? config.FTC_ELDEST_WEEKLY
        : config.FTC_SUBSEQUENT_WEEKLY;
    const share = (child.sharedCarePercent ?? 100) / 100;
    baseFtcAnnual += weeklyRate * 52 * share;
  });

  // 2. In-Work Tax Credit (IWTC) Base Calculation
  let baseIwtcAnnual = 0;
  const isBeneficiary = profile.receivesMainBenefit;
  const totalWeeklyHours =
    profile.applicantWeeklyWorkHours + (profile.partnerWeeklyWorkHours || 0);

  const meetsWorkHours =
    profile.relationshipStatus === 'sole_parent'
      ? totalWeeklyHours >= config.IWTC_MIN_HOURS_SOLE_PARENT
      : totalWeeklyHours >= config.IWTC_MIN_HOURS_COUPLE;

  if (!isBeneficiary && meetsWorkHours && dependentChildren.length > 0) {
    const extraChildren = Math.max(0, dependentChildren.length - 3);
    const weeklyIwtc =
      config.IWTC_BASE_WEEKLY +
      extraChildren * config.IWTC_EXTRA_PER_CHILD_WEEKLY;
    baseIwtcAnnual = weeklyIwtc * 52;
  }

  // 3. Best Start Tax Credit (BSTC)
  let baseBstcAnnual = 0;
  profile.children.forEach((child) => {
    if (child.age < 1) {
      // Year 1 is universal ($77.71/wk) and does not abate under general WFF
      baseBstcAnnual += config.BSTC_WEEKLY_RATE * 52;
    } else if (child.age >= 1 && child.age < 3) {
      // Years 2 and 3 abate above $79,000 at 21%
      const excessIncome = Math.max(
        0,
        totalIncome - config.BSTC_ABATEMENT_THRESHOLD_YEAR2_3
      );
      const bstcAbatement =
        excessIncome * config.BSTC_ABATEMENT_RATE_YEAR2_3;
      const netChildBstc = Math.max(
        0,
        config.BSTC_WEEKLY_RATE * 52 - bstcAbatement
      );
      baseBstcAnnual += netChildBstc;
    }
  });

  // 4. Abatement Calculation (27.5c per dollar for income over $44,900)
  let ftcAnnual = baseFtcAnnual;
  let iwtcAnnual = baseIwtcAnnual;
  let abatedAmountAnnual = 0;

  if (totalIncome > config.FTC_ABATEMENT_THRESHOLD) {
    const excess = totalIncome - config.FTC_ABATEMENT_THRESHOLD;
    abatedAmountAnnual = excess * config.FTC_ABATEMENT_RATE;

    // Abates FTC first, then IWTC
    if (abatedAmountAnnual <= ftcAnnual) {
      ftcAnnual -= abatedAmountAnnual;
    } else {
      const remainingAbatement = abatedAmountAnnual - ftcAnnual;
      ftcAnnual = 0;
      iwtcAnnual = Math.max(0, iwtcAnnual - remainingAbatement);
    }
  }

  const totalWffAnnual = ftcAnnual + iwtcAnnual + baseBstcAnnual;
  const totalWffWeekly = totalWffAnnual / 52;

  return {
    familyTaxCreditWeekly: Number((ftcAnnual / 52).toFixed(2)),
    familyTaxCreditAnnual: Number(ftcAnnual.toFixed(2)),
    inWorkTaxCreditWeekly: Number((iwtcAnnual / 52).toFixed(2)),
    inWorkTaxCreditAnnual: Number(iwtcAnnual.toFixed(2)),
    bestStartTaxCreditWeekly: Number((baseBstcAnnual / 52).toFixed(2)),
    bestStartTaxCreditAnnual: Number(baseBstcAnnual.toFixed(2)),
    minimumFamilyTaxCreditWeekly: 0,
    totalWffWeekly: Number(totalWffWeekly.toFixed(2)),
    totalWffAnnual: Number(totalWffAnnual.toFixed(2)),
    abatedAmountAnnual: Number(abatedAmountAnnual.toFixed(2)),
  };
}
