# New Zealand Entitlement & Tax Credit Checker

> A privacy-preserving, deterministic web calculator for New Zealand working families and individuals to estimate entitlements across **Working for Families**, **Accommodation Supplement**, and **FamilyBoost**.

![Next.js 14](https://img.shields.io/badge/Next.js-14.2-black?logo=next.js)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?logo=tailwind-css)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript)
![Turso DB](https://img.shields.io/badge/Turso-libSQL-00eb88)
![Drizzle ORM](https://img.shields.io/badge/Drizzle_ORM-0.30-C5F74F)

---

## 🏛️ Covered Entitlements & Government Agencies

1. **Working for Families (WFF) Tax Credits** *(Inland Revenue / Te Tari Taake)*
   - **Family Tax Credit (FTC):** $144.30/wk for the eldest child, $117.61/wk for each subsequent child.
   - **In-Work Tax Credit (IWTC):** $72.50/wk base for eligible working families (20h/wk sole parents, 30h/wk couples).
   - **Best Start Tax Credit (BSTC):** $73.88/wk universal in Year 1; abates above $79k in Years 2 & 3.
   - **Abatement:** 27c per dollar above $42,700 gross family income.

2. **Accommodation Supplement (AS)** *(Work and Income / Ministry of Social Development)*
   - Covers Rent, Board (62% rule), or Homeowner mortgage interest + council rates + insurance.
   - **70% Co-payment:** Pays 70% of housing costs above the entry threshold up to the statutory maximum cap.
   - **Zoning (Areas 1–4):** Caps up to $305/wk in Area 1 (Auckland, Queenstown) for families with 2+ children.
   - **Asset Test:** Cash asset limit ($8,100 single, $16,200 couple/with children).

3. **FamilyBoost Tax Credit** *(Inland Revenue)*
   - **25% ECE Rebate:** Reimburses up to 25% of eligible Early Childhood Education fees for children under 5.
   - **Maximum Payment:** $75/week ($975/quarter).
   - **Income Phase-out:** Full rate up to $140,000; abates at 18.75c per dollar between $140,000 and $180,000.

---

## 🔒 Privacy-First Design

All financial computations run **100% client-side in the user's browser memory**. No salary details, children's ages, or housing expenses are sent to or stored on remote servers.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ (tested on Node 20 & 24)
- npm

### Installation
```bash
git clone https://github.com/casayurannick-svg/nz_entitlement_checker.git
cd nz_entitlement_checker
npm install
```

### Development
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

### Production Build
```bash
npm run build
npm run start
```

---

## 📂 Project Architecture

```
nz_entitlement_checker/
├── docs/
│   ├── PRD.md                 # Product Requirements Document
│   └── TECHNICAL_DESIGN.md    # Technical Architecture & System Design
├── src/
│   ├── db/                    # Turso DB & Drizzle ORM client & schemas
│   │   ├── index.ts
│   │   └── schema.ts
│   ├── lib/
│   │   └── calculator/        # Pure client-side calculation engines
│   │       ├── wff.ts
│   │       ├── accommodationSupplement.ts
│   │       ├── familyBoost.ts
│   │       └── index.ts
│   ├── pages/
│   │   ├── api/
│   │   │   └── rates.ts       # Statutory rate tables endpoint
│   │   ├── _app.tsx
│   │   ├── _document.tsx
│   │   └── index.tsx          # Real-time entitlement simulator & hero
│   ├── styles/
│   │   └── globals.css        # Tailwind styling & tokens
│   └── types/
│       └── entitlements.ts    # Household profile & breakdown types
├── drizzle.config.ts          # Drizzle Kit configuration (Turso dialect)
└── tailwind.config.ts         # Tailwind CSS configuration
```

---

## 📖 Documentation
- [Product Requirements Document (PRD)](docs/PRD.md)
- [Technical Design Document](docs/TECHNICAL_DESIGN.md)

---

## ⚖️ Disclaimer
This application provides estimates based on official 2024/2025 New Zealand statutory rates and formulas. Final eligibility and payment amounts are formally determined by Inland Revenue and the Ministry of Social Development.
