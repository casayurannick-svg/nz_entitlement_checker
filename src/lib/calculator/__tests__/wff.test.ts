import { describe, it, expect } from 'vitest';
import { calculateWff, WFF_CONSTANTS_2026 } from '../wff';
import { HouseholdProfile } from '../../../types/entitlements';

function createMockProfile(overrides: Partial<HouseholdProfile> = {}): HouseholdProfile {
  return {
    relationshipStatus: 'couple',
    applicantGrossAnnualIncome: 40000,
    partnerGrossAnnualIncome: 0,
    applicantWeeklyWorkHours: 40,
    partnerWeeklyWorkHours: 0,
    receivesMainBenefit: false,
    children: [{ id: 'child-1', age: 3 }],
    area: 1,
    tenure: 'renting',
    weeklyRentOrBoard: 600,
    weeklyMortgageInterest: 0,
    annualCouncilRates: 0,
    annualHouseInsurance: 0,
    cashAssets: 2000,
    ...overrides,
  };
}

describe('calculateWff (2026 IRD Policy Rules)', () => {
  describe('Statutory 2026 Policy Constants', () => {
    it('should expose exact 2026 rates for IWTC, BestStart, and FTC abatement', () => {
      expect(WFF_CONSTANTS_2026.IWTC_BASE_WEEKLY).toBe(147.0);
      expect(WFF_CONSTANTS_2026.BSTC_WEEKLY_RATE).toBe(77.71);
      expect(WFF_CONSTANTS_2026.FTC_ABATEMENT_THRESHOLD).toBe(44900);
      expect(WFF_CONSTANTS_2026.FTC_ABATEMENT_RATE).toBe(0.275);
    });
  });

  describe('Given a household with no dependent children', () => {
    it('should return $0 across all tax credits and abatements', () => {
      const profile = createMockProfile({ children: [] });
      const result = calculateWff(profile);

      expect(result.familyTaxCreditWeekly).toBe(0);
      expect(result.inWorkTaxCreditWeekly).toBe(0);
      expect(result.bestStartTaxCreditWeekly).toBe(0);
      expect(result.totalWffWeekly).toBe(0);
      expect(result.totalWffAnnual).toBe(0);
    });

    it('should treat children over 18 as non-dependent', () => {
      const profile = createMockProfile({
        children: [{ id: 'child-adult', age: 19 }],
      });
      const result = calculateWff(profile);

      expect(result.totalWffWeekly).toBe(0);
    });
  });

  describe('Given an eligible working family with income below the 2026 abatement threshold ($44,900)', () => {
    it('should pay full FTC and full 2026 IWTC ($147/wk) for a sole parent working >= 20 hrs/wk', () => {
      const profile = createMockProfile({
        relationshipStatus: 'sole_parent',
        applicantGrossAnnualIncome: 35000,
        applicantWeeklyWorkHours: 20,
        children: [{ id: 'child-1', age: 4 }],
      });
      const result = calculateWff(profile);

      // FTC: Eldest child is $144.30/wk
      expect(result.familyTaxCreditWeekly).toBe(144.30);
      // IWTC: 2026 rate is $147.00/wk
      expect(result.inWorkTaxCreditWeekly).toBe(147.00);
      expect(result.abatedAmountAnnual).toBe(0);
      expect(result.totalWffWeekly).toBe(291.30);
      expect(result.totalWffAnnual).toBe(15147.60);
    });

    it('should pay eldest and subsequent FTC rates for multiple children with full 2026 IWTC', () => {
      const profile = createMockProfile({
        relationshipStatus: 'couple',
        applicantGrossAnnualIncome: 44000,
        applicantWeeklyWorkHours: 35,
        children: [
          { id: 'c1', age: 7 },
          { id: 'c2', age: 4 },
        ],
      });
      const result = calculateWff(profile);

      // Base FTC: $144.30 + $117.61 = $261.91/wk ($13,619.32/yr)
      expect(result.familyTaxCreditWeekly).toBe(261.91);
      // IWTC: $147.00/wk ($7,644/yr)
      expect(result.inWorkTaxCreditWeekly).toBe(147.00);
      expect(result.totalWffWeekly).toBe(408.91);
      expect(result.totalWffAnnual).toBe(21263.32);
    });

    it('should award extra $15/wk IWTC for fourth and subsequent children', () => {
      const profile = createMockProfile({
        relationshipStatus: 'couple',
        applicantGrossAnnualIncome: 40000,
        applicantWeeklyWorkHours: 40,
        children: [
          { id: 'c1', age: 10 },
          { id: 'c2', age: 8 },
          { id: 'c3', age: 6 },
          { id: 'c4', age: 4 },
        ],
      });
      const result = calculateWff(profile);

      // 4 children: Base IWTC $147 + (1 extra child * $15) = $162.00/wk
      expect(result.inWorkTaxCreditWeekly).toBe(162.00);
    });
  });

  describe('Given IWTC work eligibility requirements', () => {
    it('should deny IWTC if sole parent works under 20 hours per week', () => {
      const profile = createMockProfile({
        relationshipStatus: 'sole_parent',
        applicantGrossAnnualIncome: 25000,
        applicantWeeklyWorkHours: 18, // < 20 hours
        children: [{ id: 'c1', age: 5 }],
      });
      const result = calculateWff(profile);

      expect(result.inWorkTaxCreditWeekly).toBe(0);
      expect(result.familyTaxCreditWeekly).toBe(144.30);
    });

    it('should deny IWTC if a couple works under combined 30 hours per week', () => {
      const profile = createMockProfile({
        relationshipStatus: 'couple',
        applicantGrossAnnualIncome: 30000,
        applicantWeeklyWorkHours: 15,
        partnerWeeklyWorkHours: 10, // Combined 25 hrs < 30 hrs
        children: [{ id: 'c1', age: 5 }],
      });
      const result = calculateWff(profile);

      expect(result.inWorkTaxCreditWeekly).toBe(0);
      expect(result.familyTaxCreditWeekly).toBe(144.30);
    });

    it('should deny IWTC if the household receives a main benefit', () => {
      const profile = createMockProfile({
        relationshipStatus: 'sole_parent',
        applicantGrossAnnualIncome: 20000,
        applicantWeeklyWorkHours: 25, // Hours met
        receivesMainBenefit: true,   // But receives main benefit
        children: [{ id: 'c1', age: 5 }],
      });
      const result = calculateWff(profile);

      expect(result.inWorkTaxCreditWeekly).toBe(0);
      expect(result.familyTaxCreditWeekly).toBe(144.30);
    });
  });

  describe('Given income exceeding the 2026 abatement threshold ($44,900)', () => {
    it('should apply 27.5 cents per dollar abatement starting at exactly $44,900', () => {
      // Exactly $1,000 above threshold ($45,900)
      const profile = createMockProfile({
        applicantGrossAnnualIncome: 45900,
        applicantWeeklyWorkHours: 40,
        children: [{ id: 'c1', age: 5 }],
      });
      const result = calculateWff(profile);

      // Excess = $1,000. Abatement = $1,000 * 0.275 = $275.00
      expect(result.abatedAmountAnnual).toBe(275.00);

      // Base FTC annual: $144.30 * 52 = $7,503.60
      // Net FTC annual: $7,503.60 - $275.00 = $7,228.60 ($139.01/wk)
      expect(result.familyTaxCreditAnnual).toBe(7228.60);
      expect(result.familyTaxCreditWeekly).toBe(139.01);
      // IWTC untouched because FTC absorbed full abatement
      expect(result.inWorkTaxCreditWeekly).toBe(147.00);
    });

    it('should abate FTC first and cascade residual abatement to IWTC when FTC is reduced to $0', () => {
      // High income: $85,000
      // Excess = $85,000 - $44,900 = $40,100
      // Abatement = $40,100 * 0.275 = $11,027.50
      // Base FTC (1 child) = $7,503.60 -> FTC becomes $0
      // Residual abatement = $11,027.50 - $7,503.60 = $3,523.90 applied to IWTC
      // Base IWTC = $147 * 52 = $7,644.00
      // Net IWTC = $7,644.00 - $3,523.90 = $4,120.10 ($79.23/wk)
      const profile = createMockProfile({
        applicantGrossAnnualIncome: 85000,
        applicantWeeklyWorkHours: 40,
        children: [{ id: 'c1', age: 5 }],
      });
      const result = calculateWff(profile);

      expect(result.familyTaxCreditWeekly).toBe(0);
      expect(result.familyTaxCreditAnnual).toBe(0);
      expect(result.inWorkTaxCreditAnnual).toBe(4120.10);
      expect(result.inWorkTaxCreditWeekly).toBe(79.23);
      expect(result.totalWffWeekly).toBe(79.23);
    });

    it('should abate both FTC and IWTC to $0 when family income exceeds total threshold', () => {
      const profile = createMockProfile({
        applicantGrossAnnualIncome: 120000,
        applicantWeeklyWorkHours: 40,
        children: [{ id: 'c1', age: 5 }],
      });
      const result = calculateWff(profile);

      expect(result.familyTaxCreditWeekly).toBe(0);
      expect(result.inWorkTaxCreditWeekly).toBe(0);
      expect(result.totalWffWeekly).toBe(0);
    });
  });

  describe('Given Best Start Tax Credit (2026 rate $77.71/wk)', () => {
    it('should pay full universal $77.71/wk for infant under age 1 regardless of income', () => {
      const profile = createMockProfile({
        applicantGrossAnnualIncome: 150000, // Very high income
        applicantWeeklyWorkHours: 40,
        children: [{ id: 'c-baby', age: 0 }],
      });
      const result = calculateWff(profile);

      // Year 1 is universal: $77.71/wk ($4,040.92/yr)
      expect(result.bestStartTaxCreditWeekly).toBe(77.71);
      expect(result.bestStartTaxCreditAnnual).toBe(4040.92);
      expect(result.familyTaxCreditWeekly).toBe(0);
      expect(result.inWorkTaxCreditWeekly).toBe(0);
      expect(result.totalWffWeekly).toBe(77.71);
    });

    it('should abate Best Start for child age 1 or 2 when income exceeds $79,000', () => {
      const profile = createMockProfile({
        applicantGrossAnnualIncome: 89000, // $10,000 above $79k
        applicantWeeklyWorkHours: 40,
        children: [{ id: 'c-toddler', age: 1.5 }],
      });
      const result = calculateWff(profile);

      // Excess = $10,000 * 0.21 = $2,100 abatement
      // Base = $77.71 * 52 = $4,040.92
      // Net = $4,040.92 - $2,100 = $1,940.92 ($37.33/wk)
      expect(result.bestStartTaxCreditAnnual).toBe(1940.92);
      expect(result.bestStartTaxCreditWeekly).toBe(37.33);
    });
  });

  describe('Given shared care arrangements', () => {
    it('should apportion FTC according to shared care percentage', () => {
      const profile = createMockProfile({
        applicantGrossAnnualIncome: 30000,
        applicantWeeklyWorkHours: 40,
        children: [
          {
            id: 'c1',
            age: 5,
            sharedCarePercent: 60, // 60% care
          },
        ],
      });
      const result = calculateWff(profile);

      // Full rate: $144.30 * 52 = $7,503.60. 60% = $4,502.16 ($86.58/wk)
      expect(result.familyTaxCreditAnnual).toBe(4502.16);
      expect(result.familyTaxCreditWeekly).toBe(86.58);
    });
  });
});
