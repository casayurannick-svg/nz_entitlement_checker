import {
  HouseholdProfile,
  EntitlementCalculationResult,
} from '../../types/entitlements';
import { calculateWff } from './wff';
import { calculateAccommodationSupplement } from './accommodationSupplement';
import { calculateFamilyBoost } from './familyBoost';

export function calculateAllEntitlements(
  profile: HouseholdProfile
): EntitlementCalculationResult {
  const wff = calculateWff(profile);
  const accommodationSupplement = calculateAccommodationSupplement(profile);
  const familyBoost = calculateFamilyBoost(profile);

  const totalWeekly = Number(
    (
      wff.totalWffWeekly +
      accommodationSupplement.finalWeeklyPayment +
      familyBoost.finalWeeklyPayment
    ).toFixed(2)
  );

  const totalAnnual = Number(
    (
      wff.totalWffAnnual +
      accommodationSupplement.finalAnnualPayment +
      familyBoost.finalAnnualPayment
    ).toFixed(2)
  );

  return {
    wff,
    accommodationSupplement,
    familyBoost,
    totalWeekly,
    totalAnnual,
  };
}

export * from './wff';
export * from './accommodationSupplement';
export * from './familyBoost';
