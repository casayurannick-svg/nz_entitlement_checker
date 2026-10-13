export type RelationshipStatus = 'single' | 'couple' | 'sole_parent';

export type HousingTenure = 'renting' | 'boarding' | 'homeowner';

export type GeographicArea = 1 | 2 | 3 | 4;

export interface ChildProfile {
  id: string;
  age: number; // 0 to 18
  weeklyEceFees?: number;
  sharedCarePercent?: number; // 33 to 100
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
  totalWffWeekly: number;
  totalWffAnnual: number;
  abatedAmountAnnual: number;
}

export interface AccommodationSupplementBreakdown {
  assessedHousingCostWeekly: number;
  entryThresholdWeekly: number;
  costAboveThresholdWeekly: number;
  statutoryMaxWeekly: number;
  assetDisqualified: boolean;
  finalWeeklyPayment: number;
  finalAnnualPayment: number;
}

export interface FamilyBoostBreakdown {
  eligibleEceFeesWeekly: number;
  rawReimbursementWeekly: number;
  cappedReimbursementWeekly: number;
  incomeAbatementWeekly: number;
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
}
