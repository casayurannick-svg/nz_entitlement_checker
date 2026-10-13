import {
  HouseholdProfile,
  AccommodationSupplementBreakdown,
  GeographicArea,
} from '../../types/entitlements';

// Statutory maximum caps by Area and Household Size
export const AS_MAX_CAPS_2024: Record<
  GeographicArea,
  { singleNoChildren: number; coupleOrOneChild: number; twoOrMoreChildren: number }
> = {
  1: { singleNoChildren: 165, coupleOrOneChild: 235, twoOrMoreChildren: 305 },
  2: { singleNoChildren: 105, coupleOrOneChild: 155, twoOrMoreChildren: 225 },
  3: { singleNoChildren: 80, coupleOrOneChild: 105, twoOrMoreChildren: 160 },
  4: { singleNoChildren: 70, coupleOrOneChild: 80, twoOrMoreChildren: 120 },
};

export const AS_ENTRY_THRESHOLDS_2024 = {
  singleNoChildren: 103,
  coupleOrOneChild: 154,
  twoOrMoreChildren: 172,
};

export const AS_ASSET_LIMITS = {
  single: 8100,
  coupleOrWithChildren: 16200,
};

export function calculateAccommodationSupplement(
  profile: HouseholdProfile
): AccommodationSupplementBreakdown {
  const numChildren = profile.children.length;
  const isSingleNoKids =
    profile.relationshipStatus === 'single' && numChildren === 0;
  const isCoupleOrOneChild =
    (profile.relationshipStatus === 'couple' && numChildren <= 1) ||
    (profile.relationshipStatus === 'sole_parent' && numChildren === 1);

  // 1. Asset Test
  const assetLimit = isSingleNoKids
    ? AS_ASSET_LIMITS.single
    : AS_ASSET_LIMITS.coupleOrWithChildren;

  if (profile.cashAssets > assetLimit) {
    return {
      assessedHousingCostWeekly: 0,
      entryThresholdWeekly: 0,
      costAboveThresholdWeekly: 0,
      statutoryMaxWeekly: 0,
      assetDisqualified: true,
      finalWeeklyPayment: 0,
      finalAnnualPayment: 0,
    };
  }

  // 2. Assessed Weekly Housing Cost
  let assessedHousingCost = 0;
  if (profile.tenure === 'renting') {
    assessedHousingCost = profile.weeklyRentOrBoard;
  } else if (profile.tenure === 'boarding') {
    assessedHousingCost = profile.weeklyRentOrBoard * 0.62; // Standard 62% rule
  } else if (profile.tenure === 'homeowner') {
    const weeklyRates = profile.annualCouncilRates / 52;
    const weeklyInsurance = profile.annualHouseInsurance / 52;
    assessedHousingCost =
      profile.weeklyMortgageInterest + weeklyRates + weeklyInsurance;
  }

  // 3. Entry Threshold
  let entryThreshold = AS_ENTRY_THRESHOLDS_2024.twoOrMoreChildren;
  if (isSingleNoKids) {
    entryThreshold = AS_ENTRY_THRESHOLDS_2024.singleNoChildren;
  } else if (isCoupleOrOneChild) {
    entryThreshold = AS_ENTRY_THRESHOLDS_2024.coupleOrOneChild;
  }

  const costAboveThreshold = Math.max(0, assessedHousingCost - entryThreshold);

  // 4. Maximum Statutory Cap for Area
  const areaCaps = AS_MAX_CAPS_2024[profile.area];
  let statutoryMax = areaCaps.twoOrMoreChildren;
  if (isSingleNoKids) {
    statutoryMax = areaCaps.singleNoChildren;
  } else if (isCoupleOrOneChild) {
    statutoryMax = areaCaps.coupleOrOneChild;
  }

  // 5. 70% Co-payment rule
  const rawEntitlement = costAboveThreshold * 0.7;
  let finalPayment = Math.min(rawEntitlement, statutoryMax);

  // 6. Income Abatement (for non-beneficiaries earning above threshold)
  const totalWeeklyIncome =
    (profile.applicantGrossAnnualIncome + (profile.partnerGrossAnnualIncome || 0)) /
    52;

  // Non-beneficiary income threshold (indicative MSD cut-off abatement of 25c/$ above threshold)
  const baseIncomeCutoff = isSingleNoKids ? 650 : 920;
  if (!profile.receivesMainBenefit && totalWeeklyIncome > baseIncomeCutoff) {
    const excess = totalWeeklyIncome - baseIncomeCutoff;
    const abatement = excess * 0.25;
    finalPayment = Math.max(0, finalPayment - abatement);
  }

  return {
    assessedHousingCostWeekly: Number(assessedHousingCost.toFixed(2)),
    entryThresholdWeekly: Number(entryThreshold.toFixed(2)),
    costAboveThresholdWeekly: Number(costAboveThreshold.toFixed(2)),
    statutoryMaxWeekly: Number(statutoryMax.toFixed(2)),
    assetDisqualified: false,
    finalWeeklyPayment: Number(finalPayment.toFixed(2)),
    finalAnnualPayment: Number((finalPayment * 52).toFixed(2)),
  };
}
