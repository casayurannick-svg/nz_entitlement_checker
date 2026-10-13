import { HouseholdProfile, FamilyBoostBreakdown } from '../../types/entitlements';

export const FAMILYBOOST_CONSTANTS = {
  REIMBURSEMENT_PERCENT: 0.25, // 25% of eligible ECE fees
  MAX_WEEKLY_PAYMENT: 75.0, // $75/week ($975 per quarter)
  MAX_QUARTERLY_PAYMENT: 975.0,
  INCOME_FULL_THRESHOLD: 140000,
  INCOME_CUTOFF_THRESHOLD: 180000,
  ABATEMENT_RATE: 0.1875, // 18.75 cents per dollar
};

export function calculateFamilyBoost(profile: HouseholdProfile): FamilyBoostBreakdown {
  const totalIncome =
    profile.applicantGrossAnnualIncome + (profile.partnerGrossAnnualIncome || 0);

  // 1. Tally eligible weekly ECE fees for children under 5 years old
  let eligibleEceFeesWeekly = 0;
  profile.children.forEach((child) => {
    if (child.age < 5 && child.weeklyEceFees) {
      eligibleEceFeesWeekly += child.weeklyEceFees;
    }
  });

  if (eligibleEceFeesWeekly === 0 || totalIncome >= FAMILYBOOST_CONSTANTS.INCOME_CUTOFF_THRESHOLD) {
    return {
      eligibleEceFeesWeekly,
      rawReimbursementWeekly: 0,
      cappedReimbursementWeekly: 0,
      incomeAbatementWeekly: 0,
      finalWeeklyPayment: 0,
      finalQuarterlyPayment: 0,
      finalAnnualPayment: 0,
    };
  }

  // 2. 25% reimbursement capped at $75/wk
  const rawReimbursementWeekly =
    eligibleEceFeesWeekly * FAMILYBOOST_CONSTANTS.REIMBURSEMENT_PERCENT;
  const cappedReimbursementWeekly = Math.min(
    rawReimbursementWeekly,
    FAMILYBOOST_CONSTANTS.MAX_WEEKLY_PAYMENT
  );

  // 3. Income Abatement (between $140,000 and $180,000)
  let incomeAbatementAnnual = 0;
  if (totalIncome > FAMILYBOOST_CONSTANTS.INCOME_FULL_THRESHOLD) {
    const excessIncome = totalIncome - FAMILYBOOST_CONSTANTS.INCOME_FULL_THRESHOLD;
    incomeAbatementAnnual = excessIncome * FAMILYBOOST_CONSTANTS.ABATEMENT_RATE;
  }
  const incomeAbatementWeekly = incomeAbatementAnnual / 52;

  const finalWeeklyPayment = Math.max(
    0,
    cappedReimbursementWeekly - incomeAbatementWeekly
  );
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
