import React, { useState, useMemo } from 'react';
import Head from 'next/head';
import {
  ShieldCheck,
  Calculator,
  Building2,
  Baby,
  Home,
  CheckCircle2,
  ExternalLink,
  TrendingUp,
  Sparkles,
  AlertTriangle,
  MapPin,
} from 'lucide-react';
import {
  RelationshipStatus,
  HousingTenure,
  GeographicArea,
  HouseholdProfile,
} from '../types/entitlements';
import { calculateAllEntitlements } from '../lib/calculator';

export default function HomePage() {
  // Simulator State
  const [relationshipStatus, setRelationshipStatus] =
    useState<RelationshipStatus>('couple');
  const [grossIncome, setGrossIncome] = useState<number>(78000);
  const [weeklyWorkHours, setWeeklyWorkHours] = useState<number>(37.5);
  const [numChildren, setNumChildren] = useState<number>(2);
  const [hasInfant, setHasInfant] = useState<boolean>(false);
  const [weeklyEceFees, setWeeklyEceFees] = useState<number>(180);
  const [area, setArea] = useState<GeographicArea>(1);
  const [postcode, setPostcode] = useState<string>('1010');
  const [postcodeMatch, setPostcodeMatch] = useState<{
    suburb: string;
    city: string;
    area: number;
  } | null>({
    suburb: 'Auckland Central',
    city: 'Auckland',
    area: 1,
  });
  const [tenure, setTenure] = useState<HousingTenure>('renting');
  const [weeklyHousingCost, setWeeklyHousingCost] = useState<number>(680);
  const [cashAssets, setCashAssets] = useState<number>(5000);
  const [receivesMainBenefit, setReceivesMainBenefit] =
    useState<boolean>(false);

  const handlePostcodeChange = async (val: string) => {
    setPostcode(val);
    const clean = val.trim();
    if (clean.length === 4) {
      try {
        const res = await fetch(`/api/postcodes/${clean}`);
        if (res.ok) {
          const json = await res.json();
          if (json.data) {
            setPostcodeMatch({
              suburb: json.data.suburb,
              city: json.data.city,
              area: json.data.area,
            });
            setArea(json.data.area as GeographicArea);
          }
        } else {
          setPostcodeMatch(null);
        }
      } catch {
        // ignore network error
      }
    } else if (clean.length === 0) {
      setPostcodeMatch(null);
    }
  };

  // Derive HouseholdProfile
  const profile: HouseholdProfile = useMemo(() => {
    const childrenList = Array.from({ length: numChildren }, (_, i) => {
      let age = 4;
      if (i === 1) age = hasInfant ? 0 : 2;
      else if (i > 1) age = 6 + i;

      return {
        id: `child-${i}`,
        age,
        weeklyEceFees:
          age < 5 ? weeklyEceFees / Math.max(1, Math.min(numChildren, 2)) : 0,
      };
    });

    return {
      relationshipStatus,
      applicantGrossAnnualIncome: grossIncome,
      partnerGrossAnnualIncome: 0,
      applicantWeeklyWorkHours: weeklyWorkHours,
      partnerWeeklyWorkHours: 0,
      receivesMainBenefit,
      children: childrenList,
      area,
      tenure,
      weeklyRentOrBoard: weeklyHousingCost,
      weeklyMortgageInterest: weeklyHousingCost * 0.75,
      annualCouncilRates: 2600,
      annualHouseInsurance: 1800,
      cashAssets,
    };
  }, [
    relationshipStatus,
    grossIncome,
    weeklyWorkHours,
    numChildren,
    hasInfant,
    weeklyEceFees,
    area,
    tenure,
    weeklyHousingCost,
    cashAssets,
    receivesMainBenefit,
  ]);

  // Pure Client Calculation
  const results = useMemo(() => calculateAllEntitlements(profile), [profile]);

  return (
    <>
      <Head>
        <title>NZ Entitlement & Tax Credit Checker | WFF, Accommodation Supplement & FamilyBoost</title>
        <meta
          name="description"
          content="Estimate your New Zealand government support instantly: Working for Families, Accommodation Supplement, and FamilyBoost. 100% client-side and private."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
        {/* Navigation / Header */}
        <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <Calculator className="h-5 w-5 text-white" />
              </div>
              <div>
                <span className="font-bold text-lg tracking-tight text-white flex items-center gap-1.5">
                  NZ Entitlement Checker
                  <span className="hidden sm:inline-block text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    2024/2025 Rates
                  </span>
                </span>
                <span className="block text-[11px] text-slate-400 leading-none">
                  Te Tari Āwhina Whānau
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-400 bg-emerald-950/50 border border-emerald-800/60 px-3 py-1.5 rounded-full">
                <ShieldCheck className="h-4 w-4" />
                <span>100% Private & Client-Side</span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 w-full space-y-12">
          {/* Hero Section */}
          <section className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-slate-900 border border-slate-800 text-slate-300">
              <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
              <span>Covers Inland Revenue (IRD) & Work and Income (MSD)</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white text-balance leading-tight">
              Know exactly what government support your whānau is entitled to.
            </h1>
            <p className="text-base sm:text-lg text-slate-400 text-balance max-w-2xl mx-auto">
              Calculate your combined weekly and annual entitlements across{' '}
              <strong className="text-slate-200">Working for Families</strong>,{' '}
              <strong className="text-slate-200">Accommodation Supplement</strong>, and{' '}
              <strong className="text-slate-200">FamilyBoost</strong> in real-time.
            </p>
          </section>

          {/* Core Interactive Calculator Grid */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Input Controls Panel */}
            <div className="lg:col-span-7 bg-slate-900/70 border border-slate-800 rounded-2xl p-6 sm:p-8 backdrop-blur-sm shadow-xl space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm">
                    1
                  </div>
                  <h2 className="text-lg font-semibold text-white">Your Household & Scenario</h2>
                </div>
                <span className="text-xs text-slate-400">Instant evaluation</span>
              </div>

              {/* Relationship Status */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Household Status
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(
                    [
                      { id: 'couple', label: 'Couple' },
                      { id: 'sole_parent', label: 'Sole Parent' },
                      { id: 'single', label: 'Single' },
                    ] as const
                  ).map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setRelationshipStatus(option.id)}
                      className={`py-2.5 px-3 rounded-xl text-sm font-medium transition-all ${
                        relationshipStatus === option.id
                          ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                          : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700/50'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Gross Annual Household Income */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Gross Annual Household Income
                  </label>
                  <span className="text-base font-bold text-emerald-400 font-mono">
                    ${grossIncome.toLocaleString()} / yr
                  </span>
                </div>
                <input
                  type="range"
                  min="20000"
                  max="200000"
                  step="2500"
                  value={grossIncome}
                  onChange={(e) => setGrossIncome(Number(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
                <div className="flex justify-between text-[11px] text-slate-500 mt-1 font-mono">
                  <span>$20k</span>
                  <span>$42.7k (WFF Abatement)</span>
                  <span>$140k (FamilyBoost Cap)</span>
                  <span>$200k</span>
                </div>
              </div>

              {/* Work Hours and Benefit Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                      Weekly Work Hours
                    </label>
                    <span className="text-xs font-mono font-semibold text-slate-200">
                      {weeklyWorkHours} hrs/wk
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="60"
                    step="2.5"
                    value={weeklyWorkHours}
                    onChange={(e) => setWeeklyWorkHours(Number(e.target.value))}
                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    IWTC requires min {relationshipStatus === 'sole_parent' ? '20' : '30'} hrs/wk
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Receives Main Benefit
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setReceivesMainBenefit(false)}
                      className={`flex-1 py-2 rounded-xl text-sm font-medium ${
                        !receivesMainBenefit
                          ? 'bg-slate-700 text-white'
                          : 'bg-slate-800/80 text-slate-400 border border-slate-700/50'
                      }`}
                    >
                      No
                    </button>
                    <button
                      type="button"
                      onClick={() => setReceivesMainBenefit(true)}
                      className={`flex-1 py-2 rounded-xl text-sm font-medium ${
                        receivesMainBenefit
                          ? 'bg-amber-600 text-white'
                          : 'bg-slate-800/80 text-slate-400 border border-slate-700/50'
                      }`}
                    >
                      Yes (e.g. Jobseeker)
                    </button>
                  </div>
                </div>
              </div>

              {/* Children and Childcare */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Dependent Children
                  </label>
                  <div className="flex items-center gap-2">
                    {[0, 1, 2, 3, 4].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setNumChildren(num)}
                        className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${
                          numChildren === num
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700/50'
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Has Baby under 1 (Best Start)
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setHasInfant(false)}
                      className={`flex-1 py-2 rounded-xl text-sm font-medium ${
                        !hasInfant
                          ? 'bg-slate-700 text-white'
                          : 'bg-slate-800/80 text-slate-400 border border-slate-700/50'
                      }`}
                    >
                      No
                    </button>
                    <button
                      type="button"
                      onClick={() => setHasInfant(true)}
                      className={`flex-1 py-2 rounded-xl text-sm font-medium ${
                        hasInfant
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-800/80 text-slate-400 border border-slate-700/50'
                      }`}
                    >
                      Yes ($73.88/wk)
                    </button>
                  </div>
                </div>
              </div>

              {/* Weekly ECE Childcare Fees */}
              {numChildren > 0 && (
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                      Weekly ECE Fees (For FamilyBoost rebate)
                    </label>
                    <span className="text-sm font-bold text-teal-400 font-mono">
                      ${weeklyEceFees} / week
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="600"
                    step="20"
                    value={weeklyEceFees}
                    onChange={(e) => setWeeklyEceFees(Number(e.target.value))}
                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-500"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    FamilyBoost pays 25% of eligible fees up to $75/wk ($975/quarter) for children under 5.
                  </p>
                </div>
              )}

              {/* Housing & Location Area */}
              <div className="border-t border-slate-800 pt-5 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                        NZ Postcode Lookup
                      </label>
                      <span className="text-[11px] text-slate-400">Auto-detects MSD Area</span>
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        maxLength={4}
                        placeholder="e.g. 1010, 6011, 8011"
                        value={postcode}
                        onChange={(e) => handlePostcodeChange(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2 px-3 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                      />
                      <MapPin className="h-4 w-4 text-emerald-400 absolute right-3 top-2.5 pointer-events-none" />
                    </div>
                    {postcodeMatch && (
                      <div className="mt-1.5 flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-2.5 py-1 rounded-lg">
                        <MapPin className="h-3 w-3 shrink-0" />
                        <span className="truncate">
                          {postcodeMatch.suburb}, {postcodeMatch.city} &rarr; <strong>Area {postcodeMatch.area}</strong>
                        </span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                      Geographic Area (MSD AS Zone)
                    </label>
                    <select
                      value={area}
                      onChange={(e) => setArea(Number(e.target.value) as GeographicArea)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2.5 px-3 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value={1}>Area 1: Auckland & Queenstown</option>
                      <option value={2}>Area 2: Wellington, Christchurch, Tauranga, Hamilton</option>
                      <option value={3}>Area 3: Regional Cities (Dunedin, Palmy, etc.)</option>
                      <option value={4}>Area 4: Rural & Smaller Towns</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Housing Tenure
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(['renting', 'boarding', 'homeowner'] as const).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setTenure(t)}
                        className={`py-2 px-1 text-xs capitalize rounded-xl font-medium transition-all ${
                          tenure === t
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-800/80 text-slate-300 border border-slate-700/50'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                      Weekly Accommodation Cost ({tenure === 'homeowner' ? 'Mortgage Int + Rates' : tenure})
                    </label>
                    <span className="text-sm font-bold text-indigo-400 font-mono">
                      ${weeklyHousingCost} / week
                    </span>
                  </div>
                  <input
                    type="range"
                    min="150"
                    max="1200"
                    step="25"
                    value={weeklyHousingCost}
                    onChange={(e) => setWeeklyHousingCost(Number(e.target.value))}
                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                </div>

                {/* Cash Assets */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                      Cash Assets (Savings, Shares, Deposits)
                    </label>
                    <span className="text-xs font-mono font-bold text-slate-200">
                      ${cashAssets.toLocaleString()}
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {[0, 5000, 15000, 25000].map((amount) => (
                      <button
                        key={amount}
                        type="button"
                        onClick={() => setCashAssets(amount)}
                        className={`py-2 text-xs rounded-xl font-medium ${
                          cashAssets === amount
                            ? 'bg-slate-700 text-white'
                            : 'bg-slate-800/70 text-slate-400 border border-slate-700/40'
                        }`}
                      >
                        ${(amount / 1000).toFixed(0)}k
                      </button>
                    ))}
                  </div>
                  {results.accommodationSupplement.assetDisqualified && (
                    <div className="mt-2 flex items-center gap-1.5 text-xs text-amber-400 bg-amber-950/40 border border-amber-800/50 px-3 py-1.5 rounded-lg">
                      <AlertTriangle className="h-4 w-4 shrink-0" />
                      <span>Exceeds cash asset limit ($8.1k single / $16.2k couple/families).</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Results Output Panel */}
            <div className="lg:col-span-5 space-y-6">
              {/* Grand Total Summary Card */}
              <div className="bg-gradient-to-br from-emerald-950/60 via-slate-900 to-slate-900 border border-emerald-500/30 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 transform translate-x-4 -translate-y-4 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

                <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5 mb-1">
                  <TrendingUp className="h-4 w-4" />
                  Total Estimated Entitlement
                </span>

                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-4xl sm:text-5xl font-black text-white font-mono tracking-tight">
                    ${results.totalWeekly.toFixed(2)}
                  </span>
                  <span className="text-slate-400 text-sm font-medium">/ week</span>
                </div>

                <div className="mt-2 text-sm text-slate-300 font-medium">
                  Equivalent to{' '}
                  <span className="text-emerald-300 font-bold font-mono">
                    ${results.totalAnnual.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>{' '}
                  per year in statutory support.
                </div>

                {/* Sub-breakdown Bars */}
                <div className="mt-6 pt-6 border-t border-slate-800/80 space-y-3">
                  {/* WFF Item */}
                  <div className="bg-slate-950/50 rounded-xl p-3 border border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center">
                        <Building2 className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-white">Working for Families</div>
                        <div className="text-[11px] text-slate-400">Inland Revenue (FTC & IWTC)</div>
                      </div>
                    </div>
                    <div className="text-right font-mono">
                      <div className="text-sm font-bold text-teal-400">
                        ${results.wff.totalWffWeekly.toFixed(2)}
                      </div>
                      <div className="text-[10px] text-slate-500">/ week</div>
                    </div>
                  </div>

                  {/* Accommodation Supplement Item */}
                  <div className="bg-slate-950/50 rounded-xl p-3 border border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                        <Home className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-white">Accommodation Supplement</div>
                        <div className="text-[11px] text-slate-400">Work & Income (MSD) Area {area}</div>
                      </div>
                    </div>
                    <div className="text-right font-mono">
                      <div className="text-sm font-bold text-indigo-400">
                        ${results.accommodationSupplement.finalWeeklyPayment.toFixed(2)}
                      </div>
                      <div className="text-[10px] text-slate-500">/ week</div>
                    </div>
                  </div>

                  {/* FamilyBoost Item */}
                  <div className="bg-slate-950/50 rounded-xl p-3 border border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                        <Baby className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-white">FamilyBoost (ECE 25%)</div>
                        <div className="text-[11px] text-slate-400">
                          Inland Revenue (Quarterly max $975)
                        </div>
                      </div>
                    </div>
                    <div className="text-right font-mono">
                      <div className="text-sm font-bold text-emerald-400">
                        ${results.familyBoost.finalWeeklyPayment.toFixed(2)}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        (${results.familyBoost.finalQuarterlyPayment.toFixed(0)}/quarter)
                      </div>
                    </div>
                  </div>
                </div>

                {/* Application CTA */}
                <div className="mt-6 flex flex-col gap-2.5">
                  <a
                    href="https://www.ird.govt.nz/working-for-families"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-semibold text-sm transition-colors shadow-lg shadow-emerald-500/25"
                  >
                    <span>Apply via Inland Revenue (myIR)</span>
                    <ExternalLink className="h-4 w-4" />
                  </a>
                  <a
                    href="https://www.workandincome.govt.nz/products/a-z-benefits/accommodation-supplement.html"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
                  >
                    <span>Apply via Work and Income (MyMSD)</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>

              {/* Privacy Callout */}
              <div className="bg-slate-900/50 border border-slate-800/80 rounded-xl p-4 flex items-start gap-3 text-xs text-slate-400">
                <ShieldCheck className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                <p>
                  <strong className="text-slate-200">Zero Server Processing:</strong> Your financial and
                  household details are processed purely in client browser memory. No data is sent to or
                  stored on any remote database.
                </p>
              </div>
            </div>
          </section>

          {/* Three Pillars Detailed Explanation Section */}
          <section className="space-y-6 pt-6">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <h2 className="text-2xl font-bold text-white tracking-tight">
                How Each Entitlement Is Calculated
              </h2>
              <p className="text-sm text-slate-400">
                Understanding the statutory criteria, abatement ladders, and governing agencies.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Column 1: WFF */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4">
                <div className="h-10 w-10 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center">
                  <Building2 className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-white">Working for Families</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Financial assistance for working families with dependent children aged 18 and under.
                </p>
                <ul className="space-y-2 text-xs text-slate-300">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-teal-400 shrink-0 mt-0.5" />
                    <span>
                      <strong>Family Tax Credit:</strong> $144.30/wk eldest, $117.61/wk subsequent children.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-teal-400 shrink-0 mt-0.5" />
                    <span>
                      <strong>In-Work Tax Credit:</strong> $72.50/wk base for 20h (sole parent) or 30h (couple).
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-teal-400 shrink-0 mt-0.5" />
                    <span>
                      <strong>Abatement:</strong> Abates at 27c per dollar above $42,700 gross family income.
                    </span>
                  </li>
                </ul>
              </div>

              {/* Column 2: AS */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4">
                <div className="h-10 w-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
                  <Home className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-white">Accommodation Supplement</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Weekly non-taxable support from Work and Income (MSD) for housing expenses.
                </p>
                <ul className="space-y-2 text-xs text-slate-300">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
                    <span>
                      <strong>70% Rule:</strong> Pays 70% of housing cost exceeding base entry thresholds.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
                    <span>
                      <strong>Area Caps:</strong> Up to $305/wk in Area 1 (Auckland) for families with 2+ kids.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
                    <span>
                      <strong>Asset Test:</strong> Cash assets must be under $8,100 (single) or $16,200 (couple/kids).
                    </span>
                  </li>
                </ul>
              </div>

              {/* Column 3: FamilyBoost */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4">
                <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Baby className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-white">FamilyBoost (Budget 2024)</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Reimbursement for early childhood education (ECE) fees for kids under 5 from July 2024.
                </p>
                <ul className="space-y-2 text-xs text-slate-300">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>
                      <strong>25% ECE Rebate:</strong> Reimburses up to 25% of eligible weekly ECE invoices.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>
                      <strong>Max $75/week:</strong> Up to $975 quarterly refund paid directly by Inland Revenue.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>
                      <strong>Income Limit:</strong> Full rate up to $140,000, phased out progressively by $180,000.
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Architecture & Documentation Notice */}
          <section className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <h3 className="text-sm font-semibold text-white">
                Technical Architecture & Documentation
              </h3>
              <p className="text-xs text-slate-400">
                Powered by Next.js 14 Pages Router, client-side deterministic compute, Turso DB (libSQL), and Drizzle ORM.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-emerald-400 bg-emerald-950/80 border border-emerald-800/60 px-3 py-1.5 rounded-lg">
                docs/PRD.md &bull; docs/TECHNICAL_DESIGN.md
              </span>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-900 bg-slate-950/80 py-8 text-center text-xs text-slate-500 space-y-2">
          <p>
            NZ Entitlement Checker is an independent open-source tool. Rates and formulas reflect official 2024/2025
            statutory legislation from Inland Revenue (Te Tari Taake) and Ministry of Social Development (MSD).
          </p>
          <p>&copy; {new Date().getFullYear()} NZ Entitlement Checker. All calculations run client-side.</p>
        </footer>
      </div>
    </>
  );
}
