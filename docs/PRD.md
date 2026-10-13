# Product Requirements Document (PRD)
## New Zealand Entitlement & Tax Credit Checker

**Document Version:** 1.0.0  
**Status:** Approved for Scaffolding & Initial Phase  
**Target Platform:** Web (Mobile-first Responsive, Next.js 14)  
**Primary Jurisdiction:** New Zealand (Inland Revenue / Te Tari Taake & Ministry of Social Development / Te Manatū Whakatoatoa)  

---

## 1. Executive Summary

Navigating the New Zealand social welfare and family tax credit system is notoriously complex. Working families and individuals often interact with two disparate government agencies—**Inland Revenue (IRD)** and the **Ministry of Social Development (MSD / Work and Income)**—each with distinct calculation formulas, income definitions, geographic zoning, and abatement thresholds.

As a consequence, hundreds of millions of dollars in statutory support go unclaimed each year, while families face severe "effective marginal tax rates" (EMTRs) where earning an extra dollar results in concurrent abatements across multiple entitlements.

The **NZ Entitlement Checker** is a modern, transparent, privacy-first web application designed to calculate an individual's or family's exact entitlements across:
1. **Working for Families (WFF) Tax Credits** (Inland Revenue)
2. **Accommodation Supplement (AS)** (Work and Income / MSD)
3. **FamilyBoost Tax Credit** (Inland Revenue)

The calculator runs entirely client-side, ensuring that sensitive financial and household details are never sent to external servers unless the user deliberately saves an anonymous scenario snapshot.

---

## 2. Problem Statement & User Pain Points

- **Dual-Agency Disconnect:** Working for Families and FamilyBoost are administered by Inland Revenue; Accommodation Supplement is administered by Work and Income (MSD). Users rarely realize they qualify for assistance across both agencies.
- **Complex Abatement Stacking:** A family increasing their gross income may face income tax, ACC earner levy, student loan repayment, KiwiSaver, WFF abatement (27%), Accommodation Supplement abatement (25%), and FamilyBoost phase-out simultaneously. Users need clarity on net take-home impact.
- **Intrusive Calculators:** Existing government calculators often require high cognitive load, multi-page bureaucracy, or lack clear breakdown visualisations.
- **Privacy Fears:** Many Kiwis are reluctant to input income and family details into third-party portals that log personal identifiable information (PII).

---

## 3. Product Scope & Core Entitlements

The initial release targets the three highest-impact entitlements for New Zealand working families and renters/homeowners.

### 3.1 Working for Families (WFF) Tax Credits

Administered primarily by Inland Revenue under the *Income Tax Act 2007*, WFF provides financial support for families with dependent children aged 18 and under.

#### Components:
1. **Family Tax Credit (FTC):**
   - **Eldest child rate:** $144.30 per week ($7,503.60 annually).
   - **Subsequent child rate:** $117.61 per week ($6,115.72 annually) per child.
   - **Income threshold:** Full rate paid up to family scheme income of **$42,700** per annum.
   - **Abatement rate:** 27 cents per dollar (27%) of family income exceeding $42,700.
   - **Shared care rule:** Entitlement apportioned based on proportion of care (minimum 33% care threshold).

2. **In-Work Tax Credit (IWTC):**
   - **Eligibility:** Available to working families not receiving a main benefit. Requires minimum weekly work hours:
     - Sole parent: at least 20 hours per week.
     - Two-parent couple: combined at least 30 hours per week.
   - **Entitlement:** $72.50 per week ($3,770 annually) for up to 3 children, plus $15.00 per week ($780 annually) for each fourth and subsequent child.
   - **Abatement:** Only begins abating after the Family Tax Credit has been fully abated to zero.

3. **Minimum Family Tax Credit (MFTC):**
   - Guarantees a minimum net family income after tax for working families meeting work-hour tests (20 hrs sole parent, 30 hrs couple) who are not on a benefit.
   - Sets guaranteed net annual floor ($35,316 after tax as of 2024/2025). Top-up brings net income up to this threshold.

4. **Best Start Tax Credit (BSTC):**
   - **Year 1:** Universal payment of $73.88 per week ($3,841.76 annually) for every newborn until child turns 1, regardless of family income (does not abate; paused while receiving Paid Parental Leave).
   - **Years 2 & 3:** $73.88 per week for children aged 1 and 2, but abates at 21 cents per dollar for family scheme income over **$79,000**.

---

### 3.2 Accommodation Supplement (AS)

Administered by Work and Income (MSD) under the *Social Security Act 2018*, AS provides a weekly non-taxable payment to assist low-to-middle income families and individuals with housing costs.

#### Calculation Logic:
1. **Housing Cost Types:**
   - **Renting:** Weekly rent paid.
   - **Boarding:** 62% of weekly board is assessed as accommodation costs (standard MSD formula).
   - **Homeowner / Mortgagor:** Weekly mortgage interest payments, council rates, and house insurance premiums (principal repayments are excluded).
2. **Entry Thresholds:**
   - The user must pay accommodation costs exceeding a base entry threshold before AS is triggered.
   - Calculated as approximately 25% to 30% of base benefit rates or base income equivalence.
3. **Co-payment (70% Rule):**
   - Accommodation Supplement pays **70%** of accommodation costs that exceed the entry threshold, up to the statutory maximum.
4. **Geographic Zoning (Areas 1–4):**
   - **Area 1:** Highest cost (Auckland urban, Queenstown Lakes).
   - **Area 2:** High cost (Wellington, Christchurch urban, Tauranga, Hamilton, Nelson, Kapiti Coast).
   - **Area 3:** Moderate cost (Whangārei, Rotorua, Palmerston North, New Plymouth, Dunedin, Invercargill, Napier/Hastings).
   - **Area 4:** Rest of New Zealand (rural districts and smaller townships).
5. **Statutory Maximum Caps (Sample for Area 1 vs Area 2):**
   - Single, no children: Area 1 max $165/wk; Area 2 max $105/wk.
   - Couple or Sole Parent with 1 child: Area 1 max $235/wk; Area 2 max $155/wk.
   - Couple or Sole Parent with 2+ children: Area 1 max $305/wk; Area 2 max $225/wk.
6. **Cash Asset Test:**
   - Single applicant limit: $8,100 (non-homeowner) / $8,100 (homeowner).
   - Couple or Sole Parent with dependent children: $16,200.
   - Assets above threshold reduce or disqualify entitlement.
7. **Income Abatement:**
   - Income abates entitlement once weekly income exceeds threshold (starts at 25c abatement per dollar).

---

### 3.3 FamilyBoost Tax Credit

Introduced by the NZ Government in Budget 2024 and effective **1 July 2024**, administered by Inland Revenue.

#### Key Rules:
1. **Target Group:** Households paying early childhood education (ECE) fees for dependent children under 5 years old.
2. **Entitlement Formula:**
   - Reimburses up to **25%** of eligible ECE fees paid (after deducting the 20 Hours ECE subsidy and MSD Childcare Subsidy).
   - Maximum payment: **$75 per week** (equivalent to **$975 per quarter** or **$3,900 annually**).
3. **Household Income Thresholds & Abatement:**
   - **Up to $140,000 gross annual income:** Full entitlement (up to $75/wk).
   - **$140,001 to $180,000:** Abates progressively at **18.75 cents per dollar** of income above $140,000.
   - **Over $180,000:** Zero entitlement ($0).
4. **Claim Frequency:**
   - Paid quarterly in arrears via Inland Revenue (myIR) based on uploaded ECE fee invoices.

---

## 4. User Personas

| Persona | Household Type | Location | Income & Costs | Key Entitlements |
|---|---|---|---|---|
| **Sarah & Liam** | Couple, 2 children (age 2 and 4) | Auckland (Area 1) | $95,000 combined gross; renting $750/wk; $320/wk ECE fees | WFF (FTC + IWTC), Accommodation Supplement, FamilyBoost |
| **Aroha** | Sole parent, 1 child (age 8 months) | Wellington (Area 2) | $48,000 gross; renting $520/wk | WFF (FTC + BSTC + IWTC), Accommodation Supplement |
| **Dave & Mei** | Couple, 3 children (ages 6, 9, 12) | Christchurch (Area 2) | $72,000 combined gross; homeowner mortgage interest $580/wk, rates $60/wk | WFF (FTC + IWTC), Accommodation Supplement (Homeowner) |

---

## 5. Functional Requirements

### 5.1 Step-by-Step Scenario Wizard
1. **Household Composition:**
   - Relationship status: Single, Couple, Sole Parent.
   - Number of dependent children and their birthdates/ages (0–18).
   - ECE attendance status and weekly out-of-pocket fees.
2. **Income & Employment:**
   - Weekly, fortnightly, or annual gross earnings for applicant and partner.
   - Weekly hours worked (verifies 20h / 30h IWTC threshold).
   - Any main benefit status (Jobseeker, Sole Parent Support, Supported Living).
3. **Housing & Location:**
   - Geographic area (Area 1, 2, 3, 4 selector with suburb/city auto-detect or search).
   - Tenure: Renting, Boarding, or Homeowner.
   - Housing expenditure: Weekly rent, board, or mortgage interest + council rates + insurance.
   - Cash assets (bank deposits, shares) to validate asset thresholds.

### 5.2 Real-Time Calculation Engine
- Calculation evaluates synchronously on the client within <5ms on every input change.
- Outputs:
  - Total Weekly Entitlement ($/week).
  - Total Annual Entitlement ($/year).
  - Categorized breakdown: WFF (FTC, IWTC, BSTC), Accommodation Supplement, FamilyBoost.
  - Effective Marginal Tax Rate (EMTR) analysis and net take-home forecast.

### 5.3 Interactive Visualizations & What-If Sliders
- Stacked breakdown bar chart showing baseline vs entitlement components.
- Interactive income slider: "+$50/wk", "+$100/wk", "+$200/wk" showing abatement drag.
- Official application links: Direct deeplinks to `myIR` and `Work and Income / MyMSD` with application checklists.

### 5.4 Privacy & Anonymous Sharing
- Calculations execute 100% in browser memory; zero telemetry of financial data.
- Optional: "Share Scenario" feature generates an encoded URL fragment or writes an anonymous scenario to Turso DB without any user identity or IP logging.

---

## 6. Non-Functional Requirements

- **Performance:** Instant calculation execution; First Contentful Paint < 1.0s; Lighthouse score > 95 across all metrics.
- **Accessibility:** WCAG 2.1 Level AA compliance, complete keyboard navigation, high-contrast theme support.
- **Accuracy:** Tested against official IRD WFF tables, MSD Accommodation Supplement charts, and 2024 FamilyBoost statutory guidelines.
- **Extensibility:** Modally structured rate files allowing annual tax year rate updates (e.g., April 1 Annual General Adjustments) without refactoring UI code.

---

## 7. Future Horizons (Phase 2+)

1. **Winter Energy Payment (WEP)** estimation for beneficiaries and Superannuitants.
2. **Childcare Subsidy & OSCAR Subsidy** (MSD) integration.
3. **Community Services Card (CSC)** income threshold eligibility checker.
4. **KiwiSaver Annual Government Contribution** ($521.43 member tax credit) tracker.
