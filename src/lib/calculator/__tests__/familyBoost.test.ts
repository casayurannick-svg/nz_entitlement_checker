import { describe, it, expect } from 'vitest';
import { calculateFamilyBoost, FAMILYBOOST_CONSTANTS_2026 } from '../familyBoost';
import { HouseholdProfile } from '../../../types/entitlements';

function createMockProfile(overrides: Partial<HouseholdProfile> = {}): HouseholdProfile {
  return {
    relationshipStatus: 'couple',
    applicantGrossAnnualIncome: 90000,
    partnerGrossAnnualIncome: 0,
    applicantWeeklyWorkHours: 40,
    partnerWeeklyWorkHours: 0,
    receivesMainBenefit: false,
    children: [
      {
        id: 'child-1',
        age: 3,
        weeklyEceFees: 200,
      },
    ],
    area: 1,
    tenure: 'renting',
    weeklyRentOrBoard: 650,
    weeklyMortgageInterest: 0,
    annualCouncilRates: 0,
    annualHouseInsurance: 0,
    cashAssets: 5000,
    ...overrides,
  };
}

describe('calculateFamilyBoost (2026 IRD Policy Rules)', () => {
  describe('Statutory 2026 Policy Constants', () => {
    it('should expose exact 2026 rates for rebate %, max weekly cap, and abatement thresholds', () => {
      expect(FAMILYBOOST_CONSTANTS_2026.REIMBURSEMENT_PERCENT).toBe(0.4);
      expect(FAMILYBOOST_CONSTANTS_2026.MAX_WEEKLY_PAYMENT).toBe(120.0);
      expect(FAMILYBOOST_CONSTANTS_2026.INCOME_FULL_THRESHOLD).toBe(140000);
      expect(FAMILYBOOST_CONSTANTS_2026.INCOME_CUTOFF_THRESHOLD).toBe(229144);
    });
  });

  describe('Given a household with no eligible ECE expenses', () => {
    it('should return $0 when there are no dependent children', () => {
      const profile = createMockProfile({ children: [] });
      const result = calculateFamilyBoost(profile);

      expect(result.eligibleEceFeesWeekly).toBe(0);
      expect(result.rawReimbursementWeekly).toBe(0);
      expect(result.finalWeeklyPayment).toBe(0);
      expect(result.finalQuarterlyPayment).toBe(0);
      expect(result.finalAnnualPayment).toBe(0);
    });

    it('should return $0 when children are aged 5 or older', () => {
      const profile = createMockProfile({
        children: [
          { id: 'c1', age: 5, weeklyEceFees: 200 },
          { id: 'c2', age: 8, weeklyEceFees: 150 },
        ],
      });
      const result = calculateFamilyBoost(profile);

      expect(result.eligibleEceFeesWeekly).toBe(0);
      expect(result.finalWeeklyPayment).toBe(0);
    });

    it('should return $0 when child under 5 has $0 ECE fees', () => {
      const profile = createMockProfile({
        children: [{ id: 'c1', age: 2, weeklyEceFees: 0 }],
      });
      const result = calculateFamilyBoost(profile);

      expect(result.eligibleEceFeesWeekly).toBe(0);
      expect(result.finalWeeklyPayment).toBe(0);
    });
  });

  describe('Given a household with income at or below $140,000 (Full 40% Entitlement)', () => {
    it('should calculate 40% rebate for fees below the cap ($100/wk fees -> $40/wk rebate)', () => {
      const profile = createMockProfile({
        applicantGrossAnnualIncome: 80000,
        partnerGrossAnnualIncome: 30000, // Total $110,000 <= $140k
        children: [{ id: 'c1', age: 2, weeklyEceFees: 100 }],
      });
      const result = calculateFamilyBoost(profile);

      // 40% of $100 = $40.00/wk
      expect(result.eligibleEceFeesWeekly).toBe(100);
      expect(result.rawReimbursementWeekly).toBe(40.00);
      expect(result.cappedReimbursementWeekly).toBe(40.00);
      expect(result.incomeAbatementWeekly).toBe(0);
      expect(result.finalWeeklyPayment).toBe(40.00);
      // Quarterly (13 weeks): $40 * 13 = $520.00
      expect(result.finalQuarterlyPayment).toBe(520.00);
      // Annual (52 weeks): $40 * 52 = $2,080.00
      expect(result.finalAnnualPayment).toBe(2080.00);
    });

    it('should calculate 40% rebate up to exactly the $120/wk cap ($300/wk fees)', () => {
      const profile = createMockProfile({
        applicantGrossAnnualIncome: 120000,
        children: [{ id: 'c1', age: 3, weeklyEceFees: 300 }],
      });
      const result = calculateFamilyBoost(profile);

      // 40% of $300 = $120.00/wk (exact max statutory cap)
      expect(result.rawReimbursementWeekly).toBe(120.00);
      expect(result.cappedReimbursementWeekly).toBe(120.00);
      expect(result.finalWeeklyPayment).toBe(120.00);
      expect(result.finalQuarterlyPayment).toBe(1560.00); // $120 * 13
      expect(result.finalAnnualPayment).toBe(6240.00);    // $120 * 52
    });

    it('should enforce the maximum cap of $120/wk for high ECE fees ($500/wk fees)', () => {
      const profile = createMockProfile({
        applicantGrossAnnualIncome: 100000,
        children: [
          { id: 'c1', age: 2, weeklyEceFees: 250 },
          { id: 'c2', age: 4, weeklyEceFees: 250 },
        ],
      });
      const result = calculateFamilyBoost(profile);

      // Total fees = $500/wk. 40% of $500 = $200.00/wk.
      expect(result.eligibleEceFeesWeekly).toBe(500);
      expect(result.rawReimbursementWeekly).toBe(200.00);
      // Strict cap at $120.00/wk
      expect(result.cappedReimbursementWeekly).toBe(120.00);
      expect(result.finalWeeklyPayment).toBe(120.00);
      expect(result.finalQuarterlyPayment).toBe(1560.00);
    });

    it('should pay full entitlement at exactly the $140,000 threshold boundary', () => {
      const profile = createMockProfile({
        applicantGrossAnnualIncome: 140000,
        partnerGrossAnnualIncome: 0,
        children: [{ id: 'c1', age: 3, weeklyEceFees: 300 }],
      });
      const result = calculateFamilyBoost(profile);

      expect(result.incomeAbatementWeekly).toBe(0);
      expect(result.finalWeeklyPayment).toBe(120.00);
      expect(result.finalQuarterlyPayment).toBe(1560.00);
    });
  });

  describe('Given a household in the linear abatement zone ($140,000 to $229,144)', () => {
    it('should abate rebate by exactly 50% at the exact midpoint income ($184,572)', () => {
      // Midpoint: $140,000 + ($89,144 / 2) = $184,572
      const profile = createMockProfile({
        applicantGrossAnnualIncome: 184572,
        children: [{ id: 'c1', age: 3, weeklyEceFees: 300 }],
      });
      const result = calculateFamilyBoost(profile);

      // Base capped = $120.00/wk. Linear factor = 0.5.
      // Final = $60.00/wk ($780/quarter, $3,120/yr)
      expect(result.cappedReimbursementWeekly).toBe(120.00);
      expect(result.finalWeeklyPayment).toBe(60.00);
      expect(result.incomeAbatementWeekly).toBe(60.00);
      expect(result.finalQuarterlyPayment).toBe(780.00);
      expect(result.finalAnnualPayment).toBe(3120.00);
    });

    it('should calculate proportional linear abatement for a partial fee amount at midpoint', () => {
      // ECE fee = $150/wk -> 40% = $60.00/wk base
      // At midpoint ($184,572), factor is 0.5 -> $30.00/wk
      const profile = createMockProfile({
        applicantGrossAnnualIncome: 184572,
        children: [{ id: 'c1', age: 2, weeklyEceFees: 150 }],
      });
      const result = calculateFamilyBoost(profile);

      expect(result.cappedReimbursementWeekly).toBe(60.00);
      expect(result.finalWeeklyPayment).toBe(30.00);
      expect(result.incomeAbatementWeekly).toBe(30.00);
      expect(result.finalQuarterlyPayment).toBe(390.00);
    });

    it('should calculate exact linear phaseout at $200,000 income', () => {
      // Remaining span = $229,144 - $200,000 = $29,144
      // Factor = 29,144 / 89,144 = 0.32693...
      // For $120/wk cap: $120 * 0.32693... = $39.23/wk
      const profile = createMockProfile({
        applicantGrossAnnualIncome: 200000,
        children: [{ id: 'c1', age: 3, weeklyEceFees: 300 }],
      });
      const result = calculateFamilyBoost(profile);

      expect(result.finalWeeklyPayment).toBe(39.23);
      expect(result.incomeAbatementWeekly).toBe(80.77);
      expect(result.finalQuarterlyPayment).toBe(510.01); // 120 * (29144/89144) * 13 = 510.01
      expect(result.finalAnnualPayment).toBe(2040.05);   // 120 * (29144/89144) * 52 = 2040.05
    });
  });

  describe('Given a household at or above the $229,144 cutoff boundary', () => {
    it('should return exactly $0 at the cutoff threshold of $229,144', () => {
      const profile = createMockProfile({
        applicantGrossAnnualIncome: 229144,
        children: [{ id: 'c1', age: 3, weeklyEceFees: 350 }],
      });
      const result = calculateFamilyBoost(profile);

      expect(result.finalWeeklyPayment).toBe(0);
      expect(result.finalQuarterlyPayment).toBe(0);
      expect(result.finalAnnualPayment).toBe(0);
    });

    it('should return $0 for income above $229,144', () => {
      const profile = createMockProfile({
        applicantGrossAnnualIncome: 250000,
        children: [{ id: 'c1', age: 3, weeklyEceFees: 350 }],
      });
      const result = calculateFamilyBoost(profile);

      expect(result.finalWeeklyPayment).toBe(0);
      expect(result.finalQuarterlyPayment).toBe(0);
    });
  });
});
