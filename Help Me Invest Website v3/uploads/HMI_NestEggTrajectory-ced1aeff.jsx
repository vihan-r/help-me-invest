import React, { useState, useMemo, useEffect, useRef } from "react";

// ============================================================
// HELP ME INVEST — Nest Egg & Trajectory
// Brand system per HMI Brand Guidelines:
//   Type:  Newsreader (announce) + Plus Jakarta Sans (read)
//   Colour: Soft Paper ground, Emerald primary, Warm Charcoal
//           body, Mint + Lighter Mint surfaces, Warm Mid-Grey
//           structure. No accent colour. No gradients.
//   Motion: slow ease-out, transform + opacity only.
//   Voice:  plain questions, verbs, help offered never imposed.
// ============================================================

// ---- Australian FY2025–26 tax (resident PAYG) ----
function incomeTaxPAYG(taxable) {
  let t = 0;
  if (taxable <= 18200) t = 0;
  else if (taxable <= 45000) t = (taxable - 18200) * 0.16;
  else if (taxable <= 135000) t = 4288 + (taxable - 45000) * 0.30;
  else if (taxable <= 190000) t = 31288 + (taxable - 135000) * 0.37;
  else t = 51638 + (taxable - 190000) * 0.45;
  const medicare = taxable > 27222 ? taxable * 0.02 : 0;
  return t + medicare;
}
function companyTax(profit) {
  return Math.max(0, profit) * 0.25;
}

const fmt = (n) =>
  "$" + Math.round(n).toLocaleString("en-AU", { maximumFractionDigits: 0 });
const fmtK = (n) => {
  if (Math.abs(n) >= 1_000_000) return "$" + (n / 1_000_000).toFixed(2) + "M";
  if (Math.abs(n) >= 1000) return "$" + Math.round(n / 1000) + "k";
  return fmt(n);
};

const fv = (pv, rate, years) => pv * Math.pow(1 + rate, years);
const fvAnnuity = (pmt, rate, years) =>
  rate === 0 ? pmt * years : pmt * ((Math.pow(1 + rate, years) - 1) / rate);

// Equity needed to control one property: deposit + acquisition costs.
// For house-and-land: 10% deposit + stamp duty (on the LAND component only,
// so lower than an established purchase) + LMI ≈ 19% of purchase price total.
// The loan itself is ~90% of price (10% deposit down).
const EQUITY_PER_BUY = 0.19;
const DEPOSIT_PCT = 0.10;
// New acquisitions run INTEREST ONLY for 5 years (max cashflow + deductions
// while values build), then flip to PRINCIPAL & INTEREST and start reducing debt.
const IO_YEARS = 5;
// Assumed income growth — lifts borrowing capacity over the plan horizon.
const INCOME_GROWTH = 0.035;

// ---- RENT GROWTH ASSUMPTION ----
// Cotality Feb 2026: Australian rents up 43.9% over the 5 years to Sept 2025
// (= 7.6% p.a. compounded) vs wage growth of 17.5% (= 3.3% p.a.). We assume a
// more conservative 4% p.a. going forward — well below the recent surge but
// still above the long-run wage growth rate, which is the structurally honest
// expectation given persistent supply shortage.
// Source: https://www.cotality.com/au/insights/articles/monthly-housing-chart-pack---february
const RENT_GROWTH = 0.04;
const RENT_GROWTH_HISTORICAL_5Y = 0.076;
const WAGE_GROWTH_HISTORICAL_5Y = 0.033;
const RENT_DATA_NOTE = "Cotality Monthly Housing Chart Pack (Feb 2026)";

// ---- ABS HOUSEHOLD WEALTH BENCHMARKS ----
// Source: ABS 6523.0 Household Income and Wealth, Australia 2019-20 (released
// 28 April 2022). https://www.abs.gov.au/statistics/economy/finance/household-income-and-wealth-australia/2019-20
// Values are PUBLISHED in 2019-20 dollars. We uplift to ~2026 dollars using a
// cumulative CPI multiplier so the comparison against a user's current net
// worth is apples-to-apples. CPI factor: ~1.26 (ABS All Groups CPI Index ~114.4
// in June 2020 vs ~144 in mid-2026 — change if updated ABS data is loaded).
const ABS_CPI_UPLIFT = 1.26;
const ABS_RELEASE_NOTE = "ABS 6523.0 (2019-20), inflated to 2026 dollars at ~26% cumulative CPI";

// National net worth percentile distribution — all households, all ages.
// Values in thousands (2019-20 dollars). Uplifted at runtime.
const ABS_NATIONAL_PERCENTILES_2019_20 = [
  { p: 10, nw: 36.9 },
  { p: 20, nw: 113.4 },
  { p: 30, nw: 248.3 },
  { p: 40, nw: 411.5 },
  { p: 50, nw: 579.2 },
  { p: 60, nw: 789.1 },
  { p: 70, nw: 1052.4 },
  { p: 80, nw: 1447.8 },
  { p: 90, nw: 2257.7 },
];

// Net worth by age band — median values only published in the public table.
// Used for "above/below median for your age" framing.
const ABS_AGE_MEDIANS_2019_20 = [
  { ageLow: 15, ageHigh: 24, median: 34.6, mean: 83.8 },
  { ageLow: 25, ageHigh: 34, median: 175.7, mean: 353.8 },
  { ageLow: 35, ageHigh: 44, median: 401.0, mean: 692.6 },
  { ageLow: 45, ageHigh: 54, median: 799.6, mean: 1124.6 },
  { ageLow: 55, ageHigh: 64, median: 999.9, mean: 1519.0 },
  { ageLow: 65, ageHigh: 74, median: 926.7, mean: 1673.8 },
  { ageLow: 75, ageHigh: 200, median: 725.1, mean: 1167.0 },
];

// Given a net worth in DOLLARS (not thousands), return percentile 0-100
// using linear interpolation across the national distribution.
function percentileForNetWorth(nw) {
  const table = ABS_NATIONAL_PERCENTILES_2019_20.map((r) => ({
    p: r.p,
    threshold: r.nw * 1000 * ABS_CPI_UPLIFT,
  }));
  if (nw <= table[0].threshold) return Math.max(1, Math.round((nw / table[0].threshold) * 10));
  if (nw >= table[table.length - 1].threshold) return 95; // we don't model P90+
  for (let i = 0; i < table.length - 1; i++) {
    if (nw >= table[i].threshold && nw < table[i + 1].threshold) {
      const span = table[i + 1].threshold - table[i].threshold;
      const frac = (nw - table[i].threshold) / span;
      return Math.round(table[i].p + frac * (table[i + 1].p - table[i].p));
    }
  }
  return 50;
}

// Median net worth (in 2026 dollars) for a given age.
function medianNetWorthForAge(age) {
  const row = ABS_AGE_MEDIANS_2019_20.find((r) => age >= r.ageLow && age <= r.ageHigh);
  if (!row) return 0;
  return {
    median: row.median * 1000 * ABS_CPI_UPLIFT,
    mean: row.mean * 1000 * ABS_CPI_UPLIFT,
    ageBand: `${row.ageLow}–${row.ageHigh === 200 ? "plus" : row.ageHigh}`,
  };
}

// Simulate a staged acquisition plan using equity recycling, gated by BOTH
// usable equity AND borrowing capacity (servicing). Servicing capacity is
// 6 × assessable income, where assessable = gross income (growing over time)
// + 80% of rental income (existing + each new property). New loans are
// interest only for 5 years, then flip to P&I and pay down — which frees
// servicing capacity over the horizon. Income also grows each year.
function simulateAcquisitions({ startCash, homeValue, homeDebt, homeIsPI, years, avgPrice, growth, grossIncome, existingInvDebt, existingInvRent, maxProps = 12 }) {
  const equityNeeded = avgPrice * EQUITY_PER_BUY;
  const loanPerProp = avgPrice * (1 - DEPOSIT_PCT); // ~90% of price
  const newRent = avgPrice * 0.04; // new build at 4% gross yield
  const capacityOf = (gross, rentAnnual) => 6 * ((gross || 0) + 0.8 * rentAnnual);

  // P&I balance after `monthsPaid` months on a 25yr term at ~6.3%
  const piBalance = (loan, monthsPaid) => {
    if (!loan) return 0;
    const r = 0.063 / 12, term = 25 * 12;
    const pmt = (loan * r) / (1 - Math.pow(1 + r, -term));
    let b = loan;
    for (let m = 0; m < Math.min(monthsPaid, term); m++) b -= pmt - b * r;
    return Math.max(0, b);
  };
  // an investment loan's current balance: flat (IO) for first 5yrs, then P&I
  const invBalance = (loan, age) => (age <= IO_YEARS ? loan : piBalance(loan, (age - IO_YEARS) * 12));
  // home debt year y: pays down if P&I, flat if IO
  const homeBalanceAt = (y) => homeIsPI ? piBalance(homeDebt || 0, y * 12) : (homeDebt || 0);
  // home usable equity at 80% LVR, year y (home value grows at `growth`)
  const homeUsableAt = (y) => Math.max(0, fv(homeValue || 0, growth, y) * 0.8 - homeBalanceAt(y));

  const props = [];
  let consumedCash = 0; // cash from startCash used as deposits/costs so far
  let recycledFromHome = 0; // home equity already pulled out as deposits
  let recycledFromInv = 0;  // investment equity already pulled out
  let rents = existingInvRent || 0;
  const series = [];

  for (let y = 0; y <= years; y++) {
    const grossNow = (grossIncome || 0) * Math.pow(1 + INCOME_GROWTH, y);
    // used borrowing = current home balance + existing inv debt + new properties (IO then P&I)
    let usedBorrow = homeBalanceAt(y) + (existingInvDebt || 0);
    props.forEach((p) => { usedBorrow += invBalance(p.loan, y - p.buyYear); });
    // available equity = cash not yet used + (home usable now − already-recycled-from-home) + (inv usable now − already-recycled)
    const cashAvail = Math.max(0, (startCash || 0) - consumedCash);
    const homeAvail = Math.max(0, homeUsableAt(y) - recycledFromHome);
    let invUsableNow = 0;
    props.forEach((p) => {
      const age = Math.max(0, y - p.buyYear);
      invUsableNow += Math.max(0, fv(p.price, growth, age) * 0.8 - invBalance(p.loan, age));
    });
    const invAvail = Math.max(0, invUsableNow - recycledFromInv);
    const equityAvailable = cashAvail + homeAvail + invAvail;
    const headroom = capacityOf(grossNow, rents) - usedBorrow;
    if (props.length < maxProps && equityAvailable >= equityNeeded && headroom >= loanPerProp) {
      props.push({ buyYear: y, price: avgPrice, loan: loanPerProp });
      // draw from cash first, then home, then inv recycling
      let need = equityNeeded;
      const fromCash = Math.min(need, cashAvail); consumedCash += fromCash; need -= fromCash;
      const fromHome = Math.min(need, homeAvail); recycledFromHome += fromHome; need -= fromHome;
      const fromInv  = Math.min(need, invAvail);  recycledFromInv  += fromInv;
      rents += newRent;
    }
    const layers = props.map((p) => {
      const age = Math.max(0, y - p.buyYear);
      const bal = invBalance(p.loan, age);
      const val = fv(p.price, growth, age);
      return { equity: Math.max(0, val - bal), value: val, debt: bal };
    });
    series.push({
      year: 2025 + y, offset: y, count: props.length,
      equity: layers.reduce((a, l) => a + l.equity, 0),
      value: layers.reduce((a, l) => a + l.value, 0),
      debt: layers.reduce((a, l) => a + l.debt, 0),
      layers,
    });
  }
  const buyYears = [];
  let last = 0;
  series.forEach((s) => { if (s.count > last) { buyYears.push({ year: s.year, to: s.count }); last = s.count; } });
  const baseCapacity = capacityOf(grossIncome, existingInvRent || 0);
  const baseHeadroom = baseCapacity - ((homeDebt || 0) + (existingInvDebt || 0));
  return { series, buyYears, equityNeeded, loanPerProp, baseCapacity, baseHeadroom };
}

// Cumulative home-loan interest, year by year, to retirement.
// Home debt is NON-DEDUCTIBLE — every dollar of this interest is after-tax money.
// P&I: run a real monthly schedule over the remaining term.
// Interest only: interest is flat each year (balance never reduces).
function homeInterestSchedule(balance, annualRatePct, years, isIO, termYears = 25) {
  const out = [{ yr: 0, cum: 0, bal: balance }];
  if (!balance || balance <= 0 || years <= 0) {
    return { total: 0, schedule: out };
  }
  const r = annualRatePct / 100 / 12;
  if (isIO) {
    const perYear = balance * (annualRatePct / 100);
    let cum = 0;
    for (let y = 1; y <= years; y++) {
      cum += perYear;
      out.push({ yr: y, cum, bal: balance });
    }
    return { total: cum, schedule: out };
  }
  const termMonths = termYears * 12;
  const pmt = (balance * r) / (1 - Math.pow(1 + r, -termMonths));
  let bal = balance,
    cum = 0;
  for (let m = 1; m <= years * 12; m++) {
    if (bal <= 0) break;
    const interest = bal * r;
    cum += interest;
    bal -= pmt - interest;
    if (m % 12 === 0) out.push({ yr: m / 12, cum, bal: Math.max(0, bal) });
  }
  return { total: cum, schedule: out };
}

// ---- HMI palette (six roles, fixed) ----
const C = {
  paper: "#F6F7F4", // Soft Paper — ground
  lighterMint: "#D4E8B5", // gentle surface
  mint: "#A8D5B4", // warm surface / highlight
  emerald: "#0A4B34", // primary / headlines / wordmark
  charcoal: "#1A2B22", // body ink
  grey: "#8B8881", // structural neutral
  paper90: "rgba(246,247,244,0.9)", // body on emerald
  // functional-only signal for negative/leak figures (not a brand colour;
  // used the way an error state is — never decoratively).
  negative: "#A33A2B",
};

const F = {
  display: "'Newsreader', Georgia, 'Times New Roman', serif", // announce
  body: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif", // read
};

const EASE = "cubic-bezier(0.16, 1, 0.3, 1)";

// ------------------------------------------------------------
// Inputs — forms ask plain questions (Voice Rule 2)
// ------------------------------------------------------------
function Field({ label, hint, children }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <label style={{ display: "block", fontFamily: F.body, fontWeight: 500, fontSize: 14, color: C.charcoal, marginBottom: 8 }}>
        {label}
      </label>
      {children}
      {hint && (
        <div style={{ fontSize: 14, color: C.charcoal, marginTop: 7, lineHeight: 1.5, opacity: 0.85 }}>
          {hint}
        </div>
      )}
    </div>
  );
}

function NumInput({ value, onChange, prefix = "$", suffix, step = 1000, placeholder }) {
  return (
    <div style={{ display: "flex", alignItems: "center", border: `1px solid ${C.grey}`, borderRadius: 10, background: C.paper, overflow: "hidden" }}>
      {prefix && (
        <span style={{ padding: "13px 0 13px 15px", color: C.grey, fontFamily: F.body, fontSize: 16 }}>{prefix}</span>
      )}
      <input
        type="number"
        value={value}
        step={step}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value === "" ? "" : Number(e.target.value))}
        style={{ flex: 1, border: "none", outline: "none", padding: "13px 15px", fontFamily: F.body, fontSize: 16, color: C.charcoal, background: "transparent", width: "100%" }}
      />
      {suffix && (
        <span style={{ padding: "13px 15px 13px 0", color: C.grey, fontFamily: F.body, fontSize: 14 }}>{suffix}</span>
      )}
    </div>
  );
}

// Plain text input (e.g. lender name)
function TextInput({ value, onChange, placeholder }) {
  return (
    <div style={{ display: "flex", alignItems: "center", border: `1px solid ${C.grey}`, borderRadius: 10, background: C.paper, overflow: "hidden" }}>
      <input
        type="text"
        value={value || ""}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        style={{ flex: 1, border: "none", outline: "none", padding: "13px 15px", fontFamily: F.body, fontSize: 16, color: C.charcoal, background: "transparent", width: "100%" }}
      />
    </div>
  );
}

// Choice control — quiet pills, never a high-pressure pattern
function Choice({ options, value, onChange }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            onClick={() => onChange(o.value)}
            style={{
              flex: "1 1 auto", minWidth: 120, padding: "12px 16px",
              border: `1px solid ${active ? C.emerald : C.grey}`, borderRadius: 999,
              cursor: "pointer", fontFamily: F.body, fontWeight: 500, fontSize: 15,
              background: active ? C.emerald : C.paper, color: active ? C.paper : C.charcoal,
              transition: `background .9s ${EASE}, color .9s ${EASE}, border-color .9s ${EASE}`,
            }}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

// Buttons — pills, verbs for labels
function Btn({ children, onClick, variant = "secondary", onEmerald }) {
  let style;
  if (variant === "primary") {
    style = onEmerald
      ? { background: C.paper, color: C.emerald, border: `1px solid ${C.paper}` }
      : { background: C.emerald, color: C.paper, border: `1px solid ${C.emerald}` };
  } else {
    style = onEmerald
      ? { background: "transparent", color: C.paper, border: `1px solid ${C.paper}` }
      : { background: C.lighterMint, color: C.emerald, border: `1px solid ${C.lighterMint}` };
  }
  return (
    <button
      onClick={onClick}
      style={{ padding: "clamp(13px, 3.5vw, 13px) clamp(14px, 3.5vw, 26px)", borderRadius: 999, fontFamily: F.body, fontWeight: 500, fontSize: 15, cursor: "pointer", transition: `transform .3s ${EASE}, background .9s ${EASE}`, ...style }}
    >
      {children}
    </button>
  );
}

// Tertiary text link — Warm Charcoal, underline, arrow nudge
function TextLink({ children, onClick }) {  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{ background: "none", border: "none", padding: 0, cursor: "pointer", fontFamily: F.body, fontWeight: 500, fontSize: 15, color: hov ? C.emerald : C.charcoal, borderBottom: `${hov ? 2 : 1}px solid ${hov ? C.emerald : C.charcoal}`, paddingBottom: 3, transition: `color .6s ${EASE}` }}
    >
      {children}{" "}
      <span style={{ display: "inline-block", transform: hov ? "translateX(2px)" : "none", transition: `transform .6s ${EASE}` }}>→</span>
    </button>
  );
}

// Back link — leading arrow (mirror of TextLink)
function BackLink({ onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{ background: "none", border: "none", padding: 0, cursor: "pointer", fontFamily: F.body, fontWeight: 500, fontSize: 15, color: hov ? C.emerald : C.charcoal, display: "inline-flex", alignItems: "center", gap: 7, transition: `color .6s ${EASE}` }}
    >
      <span style={{ display: "inline-block", transform: hov ? "translateX(-2px)" : "none", transition: `transform .6s ${EASE}` }}>←</span>
      <span style={{ borderBottom: `${hov ? 2 : 1}px solid ${hov ? C.emerald : C.charcoal}`, paddingBottom: 3 }}>Back</span>
    </button>
  );
}

// ============================================================
// APP SHELL + SCREEN ROUTER  (rewritten for an app-like,
// one-job-per-screen experience)
// ============================================================
const SCREENS = [
  // phase, key, title
  { phase: "About you", key: "timing" },
  { phase: "About you", key: "income" },
  { phase: "About you", key: "assets" },
  { phase: "About you", key: "growth" },
  { phase: "About you", key: "inflation" },
  { phase: "Where this leads", key: "networth" },
  { phase: "Where this leads", key: "leaks" },
  { phase: "Where this leads", key: "week" },
  { phase: "Where this leads", key: "cost" },
  { phase: "Where this leads", key: "reality" },
  { phase: "Your plan", key: "income_target" },
  { phase: "Your plan", key: "acquire" },
  { phase: "Your plan", key: "opportunities" },
  { phase: "Your plan", key: "plan" },
  { phase: "Your plan", key: "terms" },
];
const PHASES = ["About you", "Where this leads", "Your plan"];

export default function NestEggTrajectory({
  // ─── Platform integration props (all optional for standalone use) ───
  // The authenticated user from Supabase (or whichever auth you use).
  // Shape: { id?: string, email?: string, firstName?: string, lastName?: string }
  user = null,
  // Previously saved state envelope, restored from the database on mount.
  // Shape: { version: number, data: {...}, screenKey: string, completedAt: string|null }
  initialState = null,
  // Called (debounced ~800ms) on every state change. Parent persists to DB.
  // Signature: (envelope) => Promise<void>
  onStateChange = null,
  // Called once when the user finishes the tool (reaches the terms screen).
  // Signature: (envelope) => Promise<void>
  onComplete = null,
  // Called when the user clicks the $49 plan CTA. If not provided, falls back
  // to window.open. Signature: (envelope) => void
  onPurchaseReport = null,
  // Called when the user clicks the free 15-min strategy call CTA. If not
  // provided, falls back to window.open. Signature: (envelope) => void
  onBookCall = null,
  // External save status — parent can pass "idle" | "saving" | "saved" | "error"
  // to display in the header. Defaults to "idle" when no callback wired.
  saveStatus: externalSaveStatus = null,
} = {}) {
  // ─── Default user input state ───
  // If we have an initialState envelope, restore from it; otherwise use the
  // defaults below. We also merge the user object's first name / email when
  // present, so authenticated users skip those prompts cleanly.
  const DEFAULT_DATA = {
    age: 38, retireAge: 60,
    employment: "payg", incomeMode: "single", income: 180000, income2: 90000,
    bizTurnover: 0, bizProfitMargin: 25, bizSalary: 120000,
    ownsHome: "yes", homeValue: 1200000, homeDebt: 650000, homeRate: 6.1, homeRepayType: "pi", mortgageYearsLeft: 22,
    annualExpenses: 100000,
    firstName: "",
    email: "",
    rentPerWeek: 600,
    invValue: 0, invDebt: 0, invRate: 6.3, invRepayType: "io",
    hasInv: "no",
    investments: [
      { value: 600000, debt: 450000, rate: 6.3, repayType: "io", lender: "", rentWeek: 480 },
    ],
    super: 220000, super2: 140000, cash: 60000,
    pastGrowth: 7, futureGrowth: 5, superReturn: 7.5,
    income5yrAgo: 140000, inflationBenchmark: 3.8,
    annualSavings: 40000,
    needBasics: 70000, needLifestyle: 45000, needLuxuries: 25000,
    homePriority: "passive", blocker: "deposit", goals: [],
  };

  // Build the initial data: defaults < restored data < user-pre-fill.
  // User pre-fill wins so the auth-provided name/email is authoritative.
  const mergedInitial = useMemo(() => {
    const restored = (initialState && initialState.data) ? initialState.data : {};
    const fromUser = {};
    if (user) {
      if (user.firstName && !restored.firstName) fromUser.firstName = user.firstName;
      if (user.email && !restored.email) fromUser.email = user.email;
    }
    return { ...DEFAULT_DATA, ...restored, ...fromUser };
  }, []);  // intentional empty deps: only compute on first mount

  // Compute the screen index to restore. If we saved a screenKey, look it up
  // in the SCREENS array. If not found (e.g. data shape changed), fall back
  // to screen 0.
  const initialScreenIdx = useMemo(() => {
    if (!initialState || !initialState.screenKey) return 0;
    const idx = SCREENS.findIndex((s) => s.key === initialState.screenKey);
    return idx >= 0 ? idx : 0;
  }, []);

  const [i, setI] = useState(initialScreenIdx);
  const [d, setD] = useState(mergedInitial);

  // ─── Auto-save: debounced ~800ms ───
  // Internal status mirrors what we last told the parent. If externalSaveStatus
  // is provided by the parent, it overrides our internal state for display.
  const [internalSaveStatus, setInternalSaveStatus] = useState("idle");
  const saveStatus = externalSaveStatus ?? internalSaveStatus;
  const saveTimer = useRef(null);
  const firstRenderRef = useRef(true);

  useEffect(() => {
    // Skip the first render — that's just the initial state, no save needed.
    if (firstRenderRef.current) {
      firstRenderRef.current = false;
      return;
    }
    if (!onStateChange) return;
    setInternalSaveStatus("saving");
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      const envelope = {
        version: 1,
        data: d,
        screenKey: SCREENS[i] ? SCREENS[i].key : "timing",
        screenIdx: i,
        updatedAt: new Date().toISOString(),
        completedAt: null,
      };
      try {
        await onStateChange(envelope);
        setInternalSaveStatus("saved");
        // Fade back to idle after a moment so the indicator doesn't shout
        setTimeout(() => setInternalSaveStatus((s) => (s === "saved" ? "idle" : s)), 2000);
      } catch (err) {
        setInternalSaveStatus("error");
      }
    }, 800);
    return () => { if (saveTimer.current) clearTimeout(saveTimer.current); };
  }, [d, i, onStateChange]);

  const set = (k, v) => setD((s) => ({ ...s, [k]: v }));
  // investment-array helpers
  const setInv = (idx, key, val) =>
    setD((s) => ({ ...s, investments: s.investments.map((p, i) => (i === idx ? { ...p, [key]: val } : p)) }));
  const addInv = () =>
    setD((s) => ({ ...s, investments: [...s.investments, { value: 0, debt: 0, rate: 6.3, repayType: "io", lender: "", rentWeek: 0 }] }));
  const removeInv = (idx) =>
    setD((s) => ({ ...s, investments: s.investments.filter((_, i) => i !== idx) }));

  const calc = useMemo(() => {
    const years = Math.max(0, d.retireAge - d.age);
    const g = (d.futureGrowth || 5) / 100;
    const sr = (d.superReturn || 7.5) / 100;

    // Super: individual accounts — sum both when there are two earners.
    const superStart =
      (d.super || 0) + (d.employment === "payg" && d.incomeMode === "dual" ? d.super2 || 0 : 0);

    // Home — only counts when they actually own. The toggle is the source of truth.
    const homeValue = d.ownsHome === "yes" ? (d.homeValue || 0) : 0;
    const homeDebt = d.ownsHome === "yes" ? (d.homeDebt || 0) : 0;

    // Investment properties (array). Sum values/debts; compute usable equity
    // at 80% LVR per property: (value × 0.80) − debt, floored at 0.
    const invs = d.hasInv === "yes" ? d.investments || [] : [];
    const invValueTotal = invs.reduce((a, p) => a + (p.value || 0), 0);
    const invDebtTotal = invs.reduce((a, p) => a + (p.debt || 0), 0);
    const invRentWeekTotal = invs.reduce((a, p) => a + (p.rentWeek || 0), 0);
    const usableEquity80 = (val, debt) => Math.max(0, (val || 0) * 0.8 - (debt || 0));
    const invEquity80 = invs.map((p) => ({
      ...p,
      equity80: usableEquity80(p.value, p.debt),
    }));
    const invUsableEquityTotal = invEquity80.reduce((a, p) => a + p.equity80, 0);
    const homeUsableEquity80 = usableEquity80(homeValue, homeDebt);
    const totalUsableEquity80 = invUsableEquityTotal + homeUsableEquity80;

    const totalAssets =
      homeValue + invValueTotal + superStart + (d.cash || 0);
    const totalDebt = homeDebt + invDebtTotal;
    const netWorth = totalAssets - totalDebt;

    let grossIncome, taxPaid, netIncome;
    if (d.employment === "payg") {
      if (d.incomeMode === "dual") {
        const a = d.income || 0;
        const b = d.income2 || 0;
        grossIncome = a + b;
        // each income taxed on its own brackets + tax-free threshold
        taxPaid = incomeTaxPAYG(a) + incomeTaxPAYG(b);
      } else {
        grossIncome = d.income || 0;
        taxPaid = incomeTaxPAYG(grossIncome);
      }
      netIncome = grossIncome - taxPaid;
    } else {
      // Net profit margin is taken as already net of the owner's salary
      // (wages are an operating expense — the standard way owners report
      // their P&L). So retained company profit = turnover × margin, and
      // the owner's economic income is salary + that retained profit.
      const salary = d.bizSalary || 0;
      const retainedProfit = Math.max(0, (d.bizTurnover || 0) * ((d.bizProfitMargin || 0) / 100));
      const personalTax = incomeTaxPAYG(salary);
      const coTax = companyTax(retainedProfit);
      grossIncome = salary + retainedProfit;
      taxPaid = personalTax + coTax;
      netIncome = grossIncome - taxPaid;
    }

    const amortFactor = (debt, isIO) => {
      if (isIO) return debt;
      const remaining = 25;
      const yearsPaid = Math.min(years, remaining);
      return Math.max(0, debt * (1 - yearsPaid / remaining));
    };

    const futHome = fv(homeValue, g, years);
    // each investment grows at g; its debt amortises by its own repay type
    const futInv = invs.reduce((a, p) => a + fv(p.value || 0, g, years), 0);
    const futInvDebt = invs.reduce(
      (a, p) => a + amortFactor(p.debt || 0, p.repayType === "io"),
      0
    );
    const futHomeDebt = amortFactor(homeDebt, d.homeRepayType === "io");
    const futSuper =
      fv(superStart, sr, years) + fvAnnuity((grossIncome || 0) * 0.12, sr, years);
    const futCash =
      fvAnnuity(d.annualSavings || 0, 0.03, years) + fv(d.cash || 0, 0.03, years);

    const futNetWorth = futHome + futInv + futSuper + futCash - futHomeDebt - futInvDebt;

    const invEquityFut = futInv - futInvDebt;
    const trajectoryPassive = invEquityFut * 0.045;

    // ---- LEAKAGE LENSES ----
    // 1. Non-deductible home interest paid between now and retirement.
    const homeInt = homeInterestSchedule(
      homeDebt,
      d.homeRate || 0,
      years,
      d.homeRepayType === "io",
      d.mortgageYearsLeft || 25
    );
    // 2. Tax leaked — cumulative, holding income flat (conservative, no wage growth).
    const taxPerYear = taxPaid;
    const taxSchedule = [{ yr: 0, cum: 0 }];
    for (let y = 1; y <= years; y++) {
      taxSchedule.push({ yr: y, cum: taxPerYear * y });
    }
    const taxTotal = taxPerYear * years;

    // ---- WEEKLY VIEW + DAYS OF THE WEEK ----
    // Split this year's home repayment into interest (a true leak) and
    // principal (forced savings — not a leak, it builds equity). Honest split.
    let homeIntYr = 0, homePrinYr = 0;
    if (homeDebt > 0 && (d.homeRate || 0) > 0) {
      if (d.homeRepayType === "io") {
        homeIntYr = homeDebt * ((d.homeRate || 0) / 100);
        homePrinYr = 0;
      } else {
        const r = (d.homeRate || 0) / 100 / 12;
        const nTerm = (d.mortgageYearsLeft || 25) * 12;
        const pmt = (homeDebt * r) / (1 - Math.pow(1 + r, -nTerm));
        let b = homeDebt;
        for (let m = 1; m <= 12; m++) {
          const i = b * r;
          homeIntYr += i;
          homePrinYr += pmt - i;
          b -= pmt - i;
        }
      }
    }
    // The true leak = tax + non-deductible home interest (principal excluded).
    const leakPerYear = taxPerYear + homeIntYr;
    const week = {
      tax: taxPerYear / 52,
      homeInt: homeIntYr / 52,
      homePrin: homePrinYr / 52,
      leak: leakPerYear / 52,
    };
    // Days of a 5-day week, valued on gross income.
    const dayValue = (grossIncome || 1) / 5;
    const days = {
      tax: taxPerYear / dayValue,
      homeInt: homeIntYr / dayValue,
      homePrin: homePrinYr / dayValue,
      leak: leakPerYear / dayValue,
      left: Math.max(0, 5 - leakPerYear / dayValue - homePrinYr / dayValue),
    };

    const needTotal =
      (d.needBasics || 0) + (d.needLifestyle || 0) + (d.needLuxuries || 0);
    const grossYield = 0.045;
    const equityRequired = needTotal / grossYield;
    const workingEquity = invEquityFut;
    const equityGap = Math.max(0, equityRequired - workingEquity);

    const avgPropPrice = 750000;
    // Each new property contributes to the equity gap = (value at retirement) − (loan balance at retirement)
    // New loans: 5yr IO then P&I — we approximate with a fully-IO balance to be conservative
    // (so it doesn't over-credit principal paydown that the buyer may not realise).
    const equityPerPropAtRetire =
      fv(avgPropPrice, g, years) - avgPropPrice * (1 - DEPOSIT_PCT);
    const propertiesNeeded = Math.max(
      0,
      Math.ceil(equityGap / Math.max(1, equityPerPropAtRetire))
    );
    const depositPerProp = avgPropPrice * EQUITY_PER_BUY; // 19% deposit + costs (consistent with the rest)
    const totalDepositsNeeded = propertiesNeeded * depositPerProp;
    const incomeGap = Math.max(0, needTotal - trajectoryPassive);

    // ---- REALITY CHECK ----
    // The hard truth when there's no real plan: if existing investments aren't
    // generating meaningful passive income, you're relying on super + selling
    // the home. Model both honestly.
    const annualExpenses = d.annualExpenses || 100000;
    // Inflation-adjust expenses to the future dollars they'll actually be paid in.
    // This matters: $100k today ≈ $226k in 22 years at 3.8% CPI.
    const inflRate = (d.inflationBenchmark || 3.8) / 100;
    const annualExpensesAtRetirement = annualExpenses * Math.pow(1 + inflRate, years);
    const SELLING_FEE_PCT = 0.02; // agent + legals
    const SALE_PREP_COST = 50000; // pre-sale improvements/staging
    const MEDIAN_CAPITAL_CITY_HOUSE = 1150000; // 8-capital median (Cotality early 2026)
    // home loan balance at retirement: if mortgageYearsLeft <= years, it's paid off; otherwise some remains
    const yearsToRetirement = years;
    let homeBalanceAtRetirement = 0;
    if (homeValue > 0 && homeDebt > 0 && (d.mortgageYearsLeft || 0) > 0) {
      const monthsLeft = (d.mortgageYearsLeft || 0) * 12;
      const monthsToRetire = yearsToRetirement * 12;
      if (monthsToRetire >= monthsLeft) {
        homeBalanceAtRetirement = 0;
      } else {
        // approximate remaining balance: linear amortisation of months still owed
        const r = (d.homeRate || 6.1) / 100 / 12;
        const pmt = (homeDebt * r) / (1 - Math.pow(1 + r, -monthsLeft));
        let b = homeDebt;
        for (let m = 0; m < monthsToRetire; m++) b -= pmt - b * r;
        homeBalanceAtRetirement = Math.max(0, b);
      }
    }
    const homeValueAtRetirement = fv(homeValue, g, years);
    const sellProceeds = Math.max(
      0,
      homeValueAtRetirement * (1 - SELLING_FEE_PCT) - SALE_PREP_COST - homeBalanceAtRetirement
    );
    const totalCapitalAtRetirement = futSuper + sellProceeds + futCash;
    // How many years does that capital last at current expenses (no return assumed, conservative)?
    const yearsCapitalLasts = annualExpensesAtRetirement > 0 ? totalCapitalAtRetirement / annualExpensesAtRetirement : 0;
    // What could the sale proceeds buy in a capital city?
    const cityHouseAtRetirement = fv(MEDIAN_CAPITAL_CITY_HOUSE, g, years);
    const shortfallVsMedianCity = cityHouseAtRetirement - sellProceeds;
    // Reality flag: fire when capital won't realistically last retirement (25+ years)
    // AND there's no meaningful passive income trajectory. This is the genuine
    // wake-up case — not just "no investments" but "no plan that adds up".
    const POST_RETIREMENT_YEARS = 25;
    const noPlanFlag =
      yearsCapitalLasts < POST_RETIREMENT_YEARS &&
      trajectoryPassive < (needTotal * 0.5);

    // Mortgage-outlives-retirement flag — if the home loan term extends past
    // the user's retirement, they'd be repaying it from super or sell proceeds,
    // which dismantles the rest of the plan.
    const mortgageOutlivesRetirement =
      homeValue > 0 && homeDebt > 0 &&
      (d.mortgageYearsLeft || 0) > years;
    const mortgageOverhangYears = Math.max(0, (d.mortgageYearsLeft || 0) - years);

    // ---- RENTFLATION ANALYSIS (for renters & rentvesters) ----
    // Two distinct populations need different framings:
    //   pureRenter  — no home, no investments → full wake-up call
    //   rentvester  — no home but owns investment property → smart play, acknowledged
    const isRenter = d.ownsHome === "no";
    const hasInvestmentProperty = d.hasInv === "yes" && (d.investments || []).some((p) => (p.value || 0) > 0);
    const isPureRenter = isRenter && !hasInvestmentProperty;
    const isRentvester = isRenter && hasInvestmentProperty;
    const rentWeekNow = isRenter ? (d.rentPerWeek || 0) : 0;
    const rentAnnualNow = rentWeekNow * 52;
    // Rent at retirement (compounded at conservative 4% p.a.)
    const rentWeekAtRetirement = rentWeekNow * Math.pow(1 + RENT_GROWTH, years);
    const rentAnnualAtRetirement = rentWeekAtRetirement * 52;
    // Total nominal rent paid between now and retirement (sum of compounding stream)
    // sum_{y=0..years-1} rentAnnualNow * (1+r)^y
    const totalRentToRetirement = RENT_GROWTH === 0
      ? rentAnnualNow * years
      : rentAnnualNow * ((Math.pow(1 + RENT_GROWTH, years) - 1) / RENT_GROWTH);
    // Rent as % of gross income — today and projected at retirement
    // Income grows at INCOME_GROWTH; rent grows at RENT_GROWTH — the squeeze.
    const rentPctIncomeToday = grossIncome > 0 ? (rentAnnualNow / grossIncome) * 100 : 0;
    const incomeAtRetirement = (grossIncome || 0) * Math.pow(1 + INCOME_GROWTH, years);
    const rentPctIncomeAtRetirement = incomeAtRetirement > 0 ? (rentAnnualAtRetirement / incomeAtRetirement) * 100 : 0;

    // ---- WEALTH VELOCITY SCORE ----
    // A single readable 0-100 number that summarises whether the household is
    // actually on track. Four weighted components, calibrated so a typical
    // unoptimised household lands D/F, an active investor lands B/A.
    const wvsPassive = Math.min(1, trajectoryPassive / Math.max(1, needTotal)) * 40;
    const wvsCapital = Math.min(1, yearsCapitalLasts / POST_RETIREMENT_YEARS) * 30;
    const wvsDebt = mortgageOutlivesRetirement
      ? Math.max(0, 15 - mortgageOverhangYears) // penalty for each overhang year
      : 15;
    // Acquisition optionality — how many properties they could buy now
    const wvsBuyingPower = Math.min(1, Math.floor((totalUsableEquity80 + (d.cash || 0)) / (750000 * EQUITY_PER_BUY)) / 3) * 15;
    const wealthVelocityScore = Math.round(Math.max(0, Math.min(100, wvsPassive + wvsCapital + wvsDebt + wvsBuyingPower)));
    const wvsGrade = wealthVelocityScore >= 80 ? "A"
      : wealthVelocityScore >= 65 ? "B"
      : wealthVelocityScore >= 50 ? "C"
      : wealthVelocityScore >= 35 ? "D"
      : "F";
    const wvsType = wealthVelocityScore >= 80 ? "Wealth Builder"
      : wealthVelocityScore >= 65 ? "On Track, Untapped"
      : wealthVelocityScore >= 50 ? "Coasting"
      : wealthVelocityScore >= 35 ? "High Leak, Low Engine"
      : "At Risk";
    const wvsColor = wealthVelocityScore >= 65 ? C.emerald
      : wealthVelocityScore >= 50 ? "#8B7E3F"
      : C.negative;

    // ---- ABS BENCHMARK COMPARISONS ----
    // Where this household sits in the Australian distribution today, and
    // where they're heading at their current trajectory.
    const nationalPercentile = percentileForNetWorth(netWorth);
    const ageMedianData = medianNetWorthForAge(d.age || 0);
    const ageMedian = ageMedianData ? ageMedianData.median : 0;
    const ageBandLabel = ageMedianData ? ageMedianData.ageBand : "your age";
    const aboveAgeMedian = ageMedian > 0 && netWorth >= ageMedian;
    const ageGapPct = ageMedian > 0 ? Math.round(((netWorth - ageMedian) / ageMedian) * 100) : 0;
    // Project net worth to retirement at user's growth rate, then deflate
    // to today's dollars to compare against today's retiree benchmark.
    // futNetWorth already computed earlier — we deflate it by CPI.
    const inflRateForBench = (d.inflationBenchmark || 3.8) / 100;
    const futNetWorthRealToday = futNetWorth / Math.pow(1 + inflRateForBench, years);
    // Compare projected real-terms net worth against TODAY's retiree (65-74) median.
    // Honest framing: "X times the median Australian retiree" — not "P95"
    // (which would be misleading because the all-ages curve includes wealth-poor
    // young households the user has aged past).
    const retireeMedian = (medianNetWorthForAge(70) || { median: 0 }).median;
    const retireeMedianMultiple = retireeMedian > 0
      ? futNetWorthRealToday / retireeMedian
      : 0;
    // Whether they'll land above or below median Australian retiree
    const aboveRetireeMedian = retireeMedianMultiple >= 1;

    // ---- ACQUISITION CAPACITY + PLAN ----
    // The pool you can put to work right now: usable equity (80% LVR) + cash.
    const acqPool = totalUsableEquity80 + (d.cash || 0);
    const acqAvgPrice = 750000; // typical new house-and-land for the strategy
    // theoretical capacity: pool ÷ 19% ÷ price
    const capacityCount = Math.floor(acqPool / (acqAvgPrice * EQUITY_PER_BUY));
    const acqHorizon = Math.min(15, years); // realistic plan window (~15 years)
    // servicing inputs: 6 × (gross + 80% of current rent); existing loans consume capacity
    const existingRentAnnual = invRentWeekTotal * 52;
    const existingLoans = homeDebt + invDebtTotal;
    const borrowingCapacity = 6 * ((grossIncome || 0) + 0.8 * existingRentAnnual);
    const borrowingHeadroom = Math.max(0, borrowingCapacity - existingLoans);
    const acqPlan = simulateAcquisitions({
      startCash: d.cash || 0,
      homeValue,
      homeDebt,
      homeIsPI: d.homeRepayType === "pi",
      years: acqHorizon,
      avgPrice: acqAvgPrice,
      growth: g,
      grossIncome,
      existingInvDebt: invDebtTotal,
      existingInvRent: existingRentAnnual,
    });
    // tax benefit of one negatively-geared NEW build at 4% gross yield
    const ngRent = acqAvgPrice * 0.04;
    const ngLoan = acqPlan.loanPerProp;
    const ngInterest = ngLoan * ((d.invRate || 6.3) / 100);
    const ngDeprec = acqAvgPrice * 0.02; // ~2% p.a. depreciation on a new build
    const ngExpenses = ngRent * 0.25; // management, rates, insurance
    const ngLoss = ngRent - ngInterest - ngDeprec - ngExpenses; // negative = paper loss
    // marginal rate for the saving — for dual incomes, use the higher earner's bracket
    // (negative gearing benefit typically goes to whichever spouse is on the higher rate)
    const marginalIncomeForBracket = (d.employment === "payg" && d.incomeMode === "dual")
      ? Math.max(d.income || 0, d.income2 || 0)
      : grossIncome;
    const marginal =
      marginalIncomeForBracket > 190000 ? 0.47
      : marginalIncomeForBracket > 135000 ? 0.39
      : marginalIncomeForBracket > 45000 ? 0.325
      : 0.18;
    const ngTaxSaved = ngLoss < 0 ? -ngLoss * marginal : 0;
    // recycle timing: years until one property builds $90k usable equity at 80% LVR
    let recycleYears = null;
    for (let y = 1; y <= 15; y++) {
      const val = fv(acqAvgPrice, g, y);
      if (val * 0.8 - ngLoan >= 90000) { recycleYears = y; break; }
    }

    // ---- OPTIMISATION CALCS (the "if you redirected this..." engine) ----
    // The aha-moments are built from the user's own numbers. Each is a direct
    // comparison: leak now → optimised path → years saved / dollars freed.
    const homeIsPI = d.homeRepayType === "pi";
    const homeRate = (d.homeRate || 6.1) / 100;
    const homeRateM = homeRate / 12;
    const homeRemainingMonths = (d.mortgageYearsLeft || 25) * 12;
    // Standard P&I monthly payment on the existing balance over remaining term
    const standardPmt = homeIsPI && homeDebt > 0 && homeRemainingMonths > 0
      ? (homeDebt * homeRateM) / (1 - Math.pow(1 + homeRateM, -homeRemainingMonths))
      : 0;
    // Helper: months to pay off `bal` at `rateM` with monthly payment `pmt`
    function payoffMonths(bal, rateM, pmt) {
      if (bal <= 0 || pmt <= 0) return 0;
      if (pmt <= bal * rateM) return Infinity; // payment doesn't cover interest
      return Math.log(pmt / (pmt - bal * rateM)) / Math.log(1 + rateM);
    }
    // Optimisation 1: redirect projected NG tax saving into extra mortgage payments
    const extraFromTax = ngTaxSaved / 12; // per month
    const monthsWithTax = homeIsPI && homeDebt > 0
      ? payoffMonths(homeDebt, homeRateM, standardPmt + extraFromTax)
      : 0;
    const monthsSavedByTax = Math.max(0, homeRemainingMonths - monthsWithTax);
    const yearsSavedByTax = monthsSavedByTax / 12;
    const interestSavedByTax = homeIsPI && homeDebt > 0
      ? Math.max(0, standardPmt * homeRemainingMonths - (standardPmt + extraFromTax) * monthsWithTax)
      : 0;

    // Optimisation 2: redirect annual savings (or part of them) into mortgage offset
    // Use $1000/mo (12k/yr) as a "sensible portion of savings" if savings exist
    const sensibleExtra = Math.min((d.annualSavings || 0) / 12, 1000); // up to $12k/yr
    const monthsWithSavings = homeIsPI && homeDebt > 0
      ? payoffMonths(homeDebt, homeRateM, standardPmt + sensibleExtra)
      : 0;
    const yearsSavedBySavings = (Math.max(0, homeRemainingMonths - monthsWithSavings)) / 12;

    // Optimisation 3: combined — tax saving + sensible extra
    const monthsCombined = homeIsPI && homeDebt > 0
      ? payoffMonths(homeDebt, homeRateM, standardPmt + extraFromTax + sensibleExtra)
      : 0;
    const yearsSavedCombined = (Math.max(0, homeRemainingMonths - monthsCombined)) / 12;

    // ---- BOTTOM-LINE FIGURES (the shock numbers for the close) ----
    // Total interest paid over the standard remaining life of the loan
    const totalInterestStandard = homeIsPI && homeDebt > 0
      ? Math.max(0, standardPmt * homeRemainingMonths - homeDebt)
      : 0;
    // Total interest paid on the optimised path (both levers pulled)
    const totalInterestOptimised = homeIsPI && homeDebt > 0
      ? Math.max(0, (standardPmt + extraFromTax + sensibleExtra) * monthsCombined - homeDebt)
      : 0;
    const totalInterestSaved = Math.max(0, totalInterestStandard - totalInterestOptimised);
    // Ages at home-paid-off, both paths
    const ageHomePaidStandard = d.age + (d.mortgageYearsLeft || 0);
    const ageHomePaidOptimised = d.age + (monthsCombined / 12);
    // How much of weekly income currently goes to home interest+principal
    // (used for the "monday becomes yours" narrative)
    const weeklyMortgagePmt = standardPmt * 12 / 52;
    const daysOfWeekFromMortgage = grossIncome > 0
      ? (standardPmt * 12 / grossIncome) * 5
      : 0;

    // ---- COST OF WAITING ----
    // Honest figure: if they bought one $750k property today, by retirement
    // it would be worth fv(750k, g, years). One month from now: fv(750k, g, years - 1/12).
    // The compound growth captured in that month's earlier purchase is the
    // cost of waiting another month. Adds up viscerally over the funnel.
    const _wait_priceNow = 750000;
    const _wait_priceMonthLater = fv(_wait_priceNow, g, 1/12);
    const _wait_capturedNow = fv(_wait_priceNow, g, years) - _wait_priceNow;
    const _wait_capturedLater = fv(_wait_priceMonthLater, g, years - 1/12) - _wait_priceMonthLater;
    const costOfWaitingMonth = Math.max(0, _wait_capturedNow - _wait_capturedLater);
    // Daily version for the gut-punch line
    const costOfWaitingDay = costOfWaitingMonth / 30;

    // Optimisation 4: sell one investment property in 15 years, after CGT + 2.2% selling fee
    // Pays down current home loan with the net proceeds. Assumes one new property held 15yrs.
    const sellYears = 15;
    const propValY15 = fv(acqAvgPrice, g, sellYears);
    const propGain = propValY15 - acqAvgPrice;
    // CGT: 50% discount for >12mo hold, taxed at marginal rate
    const cgt = propGain * 0.5 * marginal;
    const sellingFeeOnInv = propValY15 * 0.022; // 2.2% incl GST
    const netInvSaleProceeds = Math.max(0, propValY15 - sellingFeeOnInv - cgt - acqAvgPrice * 0.9);
    // Home loan balance in 15 years at current pace
    let homeBalY15 = 0;
    if (homeIsPI && homeDebt > 0) {
      let b = homeDebt;
      for (let m = 0; m < Math.min(sellYears * 12, homeRemainingMonths); m++) b -= standardPmt - b * homeRateM;
      homeBalY15 = Math.max(0, b);
    } else {
      homeBalY15 = homeDebt; // IO doesn't pay down
    }
    const couldClearHome = netInvSaleProceeds >= homeBalY15;
    const homeClearSurplus = Math.max(0, netInvSaleProceeds - homeBalY15);

    // ---- INCOME GROWTH vs INFLATION (real terms) ----
    // Compare today's gross against 5 years ago, in CAGR terms, vs CPI.
    const then = d.income5yrAgo || 0;
    const infl = (d.inflationBenchmark || 0) / 100;
    let incomeCAGR = null,
      realStandStill = null,
      realGapNow = null,
      incomeVerdict = "unknown";
    if (then > 0 && grossIncome > 0) {
      incomeCAGR = Math.pow(grossIncome / then, 1 / 5) - 1;
      realStandStill = then * Math.pow(1 + infl, 5); // income needed today to hold real value
      realGapNow = grossIncome - realStandStill; // positive = ahead, negative = behind
      if (incomeCAGR > infl + 0.005) incomeVerdict = "ahead";
      else if (incomeCAGR >= infl - 0.005) incomeVerdict = "pace";
      else incomeVerdict = "behind";
    }

    return {
      years, totalAssets, totalDebt, netWorth, grossIncome, taxPaid, netIncome,
      futHome, futInv, futSuper, futCash, futHomeDebt, futInvDebt, futNetWorth,
      trajectoryPassive, needTotal, equityRequired, workingEquity, equityGap,
      propertiesNeeded, depositPerProp, totalDepositsNeeded, incomeGap, avgPropPrice,
      annualExpenses, annualExpensesAtRetirement, homeBalanceAtRetirement, homeValueAtRetirement, sellProceeds,
      totalCapitalAtRetirement, yearsCapitalLasts, cityHouseAtRetirement,
      shortfallVsMedianCity, noPlanFlag, medianCapitalCityHouse: MEDIAN_CAPITAL_CITY_HOUSE,
      mortgageOutlivesRetirement, mortgageOverhangYears,
      isRenter, isPureRenter, isRentvester, hasInvestmentProperty,
      rentWeekNow, rentAnnualNow, rentWeekAtRetirement, rentAnnualAtRetirement,
      totalRentToRetirement, rentPctIncomeToday, rentPctIncomeAtRetirement,
      incomeAtRetirement, RENT_GROWTH, RENT_GROWTH_HISTORICAL_5Y,
      WAGE_GROWTH_HISTORICAL_5Y, RENT_DATA_NOTE,
      wealthVelocityScore, wvsGrade, wvsType, wvsColor,
      nationalPercentile, ageMedian, ageBandLabel, aboveAgeMedian, ageGapPct,
      futNetWorthRealToday, retireeMedian, retireeMedianMultiple, aboveRetireeMedian,
      ABS_RELEASE_NOTE,
      homeInt, taxSchedule, taxTotal, taxPerYear,
      invs, invValueTotal, invDebtTotal, invRentWeekTotal, invEquity80,
      invUsableEquityTotal, homeUsableEquity80, totalUsableEquity80,
      acqPool, acqAvgPrice, capacityCount, acqPlan, acqHorizon,
      borrowingCapacity, borrowingHeadroom, existingRentAnnual, existingLoans,
      ngRent, ngLoss, ngTaxSaved, marginal, recycleYears,
      standardPmt, yearsSavedByTax, interestSavedByTax, yearsSavedBySavings, yearsSavedCombined,
      totalInterestStandard, totalInterestOptimised, totalInterestSaved,
      ageHomePaidStandard, ageHomePaidOptimised,
      weeklyMortgagePmt, daysOfWeekFromMortgage,
      costOfWaitingMonth, costOfWaitingDay,
      sensibleExtra, extraFromTax,
      propValY15, propGain, cgt, sellingFeeOnInv, netInvSaleProceeds, homeBalY15,
      couldClearHome, homeClearSurplus,
      week, days, leakPerYear, homeIntYr, homePrinYr,
      incomeCAGR, realStandStill, realGapNow, incomeVerdict, incomeThen: then, inflBenchmark: infl,
    };
  }, [d]);

  const screen = SCREENS[i];
  const phaseIndex = PHASES.indexOf(screen.phase);
  // progress within current phase
  // Filter out screens that get auto-skipped (reality screen for users on track)
  const visibleScreens = SCREENS.filter((s) => !(s.key === "reality" && !calc.noPlanFlag));
  const phaseScreens = visibleScreens.filter((s) => s.phase === screen.phase);
  const posInPhase = phaseScreens.findIndex((s) => s.key === screen.key);
  // Skip the "reality" screen for users with a real passive-income trajectory —
  // the wake-up call only fires for the "no plan" case.
  const shouldSkip = (idx) => SCREENS[idx]?.key === "reality" && !calc.noPlanFlag;
  const next = () =>
    setI((n) => {
      let m = Math.min(SCREENS.length - 1, n + 1);
      while (shouldSkip(m) && m < SCREENS.length - 1) m++;
      return m;
    });
  const back = () =>
    setI((n) => {
      let m = Math.max(0, n - 1);
      while (shouldSkip(m) && m > 0) m--;
      return m;
    });
  const isFirst = i === 0;
  const isLast = i === SCREENS.length - 1;

  // continue-label per screen (verbs; help offered not imposed)
  const nextLabel = {
    timing: "Continue", income: "Continue", assets: "Continue",
    growth: "Continue", inflation: "See where this leads",
    networth: "Continue", leaks: "Show me my week", week: "What it costs me",
    cost: "Set the income I want", income_target: "See my move from here",
    reality: "Set the income I want",
    acquire: "Show me the opportunities",
    opportunities: "See the full plan",
    plan: "Assumptions & terms",
    terms: "",
  }[screen.key];

  const props = { d, set, calc, next, setInv, addInv, removeInv, user, isPersisted: !!onStateChange, onPurchaseReport, onBookCall };

  // ─── Fire onComplete once when user reaches the terms screen ───
  // The act of reaching the final screen = they walked the whole journey.
  // Parent should use this to mark completion in their CRM / analytics.
  const completedRef = useRef(false);
  useEffect(() => {
    if (!onComplete) return;
    if (completedRef.current) return;
    const currentKey = SCREENS[i] ? SCREENS[i].key : null;
    if (currentKey !== "terms") return;
    completedRef.current = true;
    const envelope = {
      version: 1,
      data: d,
      screenKey: "terms",
      screenIdx: i,
      updatedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
    };
    Promise.resolve(onComplete(envelope)).catch(() => {});
  }, [i, onComplete]);


  return (
    <div style={{ fontFamily: F.body, background: C.paper, color: C.charcoal, minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,300;0,6..72,400;1,6..72,300;1,6..72,400&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        html, body { margin: 0; }
        input[type=number]::-webkit-inner-spin-button { opacity: 0.25; }
        .news-d, .news-h1, .news-h2 { font-variation-settings: 'opsz' 72; }
        .news-h3 { font-variation-settings: 'opsz' 36; }
        @keyframes screenIn { from { opacity:0; transform: translateY(14px);} to {opacity:1; transform:none;} }
        .screenIn { animation: screenIn .55s ${EASE} both; }
        @keyframes grow { from { transform: scaleX(0); } to { transform: scaleX(1); } }
        ::-webkit-scrollbar { width: 10px; } ::-webkit-scrollbar-thumb { background: ${C.grey}; border-radius: 999px; opacity:.4;}
        @media (prefers-reduced-motion: reduce) { .screenIn { animation: none; } .bar-fill { animation: none !important; } }

        /* ────────────────────────────────────────────────────────────
           RESPONSIVE TYPE SYSTEM
           Fluid scaling via clamp(): font-size scales smoothly between
           a small-screen minimum, a viewport-relative preferred value,
           and a large-screen maximum. Works without JS, SSR-safe.
           ──────────────────────────────────────────────────────────── */
        .hmi-display-xxl { font-size: clamp(2.75rem, 4.5vw + 1.25rem, 5rem); line-height: 0.95; letter-spacing: -0.01em; }   /* desktop 80, mobile 44 */
        .hmi-display-xl  { font-size: clamp(2.25rem, 3.5vw + 1rem, 4rem);     line-height: 1; }                              /* desktop 64, mobile 36 */
        .hmi-display-lg  { font-size: clamp(2rem,    2.5vw + 1rem, 3.5rem);   line-height: 1; }                              /* desktop 56, mobile 32 */
        .hmi-display-md  { font-size: clamp(1.625rem, 1.75vw + 1rem, 2.75rem); line-height: 1; }                             /* desktop 44, mobile 26 */
        .hmi-h1          { font-size: clamp(1.625rem, 1.5vw + 1rem, 2.625rem); line-height: 1.15; }                          /* desktop 42, mobile 26 */
        .hmi-h2          { font-size: clamp(1.375rem, 1vw + 1rem, 2rem);      line-height: 1.2; }                            /* desktop 32, mobile 22 */
        .hmi-h3          { font-size: clamp(1.25rem, 0.5vw + 1rem, 1.625rem); line-height: 1.25; }                           /* desktop 26, mobile 20 */

        /* ────────────────────────────────────────────────────────────
           LAYOUT — two-column → single-column on mobile
           ──────────────────────────────────────────────────────────── */
        .hmi-two {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-bottom: 28px;
        }
        @media (max-width: 640px) {
          .hmi-two { grid-template-columns: 1fr; gap: 12px; }
        }

        /* ────────────────────────────────────────────────────────────
           CONTAINERS — generous on desktop, tight on mobile
           ──────────────────────────────────────────────────────────── */
        .hmi-screen-body {
          max-width: 760px;
          margin: 0 auto;
          padding: 36px 24px 40px;
        }
        @media (max-width: 640px) {
          .hmi-screen-body { padding: 22px 16px 28px; }
        }

        .hmi-panel-lg { padding: 32px 30px; }
        .hmi-panel-md { padding: 26px 26px; }
        .hmi-panel-sm { padding: 20px 22px; }
        @media (max-width: 640px) {
          .hmi-panel-lg { padding: 22px 18px; }
          .hmi-panel-md { padding: 20px 16px; }
          .hmi-panel-sm { padding: 16px 14px; }
        }

        /* ────────────────────────────────────────────────────────────
           HEADER — wraps gracefully when save indicator competes for space
           ──────────────────────────────────────────────────────────── */
        .hmi-header-row { display: flex; justify-content: space-between; align-items: center; gap: 14px; flex-wrap: wrap; }
        .hmi-header-meta { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; }
        @media (max-width: 480px) {
          .hmi-header-meta { gap: 8px; }
          .hmi-header-meta .hmi-phase-label { display: none; }
        }

        /* ────────────────────────────────────────────────────────────
           FOOTER — stack CTA + back link on very narrow screens
           ──────────────────────────────────────────────────────────── */
        .hmi-footer-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
        }
        @media (max-width: 420px) {
          .hmi-footer-row { gap: 10px; }
          .hmi-footer-row button { padding-left: 18px !important; padding-right: 18px !important; font-size: 14px !important; }
        }

        /* ────────────────────────────────────────────────────────────
           TAP TARGETS — 44px minimum per WCAG / Apple HIG on mobile
           ──────────────────────────────────────────────────────────── */
        @media (max-width: 640px) {
          button { min-height: 44px; }
        }

        /* ────────────────────────────────────────────────────────────
           UTILITY — flex rows that stack on mobile
           ──────────────────────────────────────────────────────────── */
        .hmi-flex-stack-mobile {
          display: flex;
          gap: 28px;
          align-items: flex-start;
          flex-wrap: wrap;
        }
        @media (max-width: 640px) {
          .hmi-flex-stack-mobile { gap: 18px; flex-direction: column; align-items: stretch; }
          .hmi-flex-stack-mobile > * { width: 100%; text-align: left !important; }
        }
      `}</style>

      {/* ---------- Sticky top bar: lockup + phase progress ---------- */}
      <header style={{ position: "sticky", top: 0, zIndex: 10, background: C.paper, borderBottom: `1px solid ${C.grey}40` }}>
        <div style={{ maxWidth: 760, margin: "0 auto", padding: "18px 24px 0" }}>
          <div className="hmi-header-row" style={{ marginBottom: 14 }}>
            <Lockup />
            <div className="hmi-header-meta">
              {onStateChange && <SaveIndicator status={saveStatus} />}
              <span className="hmi-phase-label" style={{ fontFamily: F.body, fontWeight: 500, fontSize: 12, letterSpacing: "0.02em", textTransform: "uppercase", color: C.grey }}>
                {screen.phase}
              </span>
            </div>
          </div>
          {/* phase segments */}
          <div style={{ display: "flex", gap: 8, paddingBottom: 14 }}>
            {PHASES.map((p, pi) => {
              const total = visibleScreens.filter((s) => s.phase === p).length;
              const done = pi < phaseIndex ? total : pi > phaseIndex ? 0 : posInPhase + 1;
              return (
                <div key={p} style={{ flex: 1 }}>
                  <div style={{ display: "flex", gap: 3 }}>
                    {Array.from({ length: total }).map((_, k) => (
                      <div key={k} style={{
                        flex: 1, height: 3, borderRadius: 999,
                        background: k < done ? C.emerald : C.grey,
                        opacity: k < done ? 1 : 0.3,
                        transition: `opacity .5s ${EASE}, background .5s ${EASE}`,
                      }} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </header>

      {/* ---------- Screen body ---------- */}
      <main style={{ flex: 1, overflowY: "auto" }}>
        <div key={screen.key} className="screenIn hmi-screen-body">
          {screen.key === "timing" && <ScreenTiming {...props} />}
          {screen.key === "income" && <ScreenIncome {...props} />}
          {screen.key === "assets" && <ScreenAssets {...props} />}
          {screen.key === "growth" && <ScreenGrowth {...props} />}
          {screen.key === "inflation" && <ScreenInflation {...props} />}
          {screen.key === "networth" && <ScreenNetWorth {...props} />}
          {screen.key === "leaks" && <ScreenLeaks {...props} />}
          {screen.key === "week" && <ScreenWeek {...props} />}
          {screen.key === "cost" && <ScreenCost {...props} />}
          {screen.key === "reality" && <ScreenReality {...props} />}
          {screen.key === "income_target" && <ScreenIncomeTarget {...props} />}
          {screen.key === "acquire" && <ScreenAcquire {...props} />}
          {screen.key === "opportunities" && <ScreenOpportunities {...props} />}
          {screen.key === "plan" && <ScreenPlan {...props} />}
          {screen.key === "terms" && <ScreenTerms {...props} />}
        </div>
      </main>

      {/* ---------- Sticky bottom nav ---------- */}
      <footer style={{ position: "sticky", bottom: 0, zIndex: 10, background: C.paper, borderTop: `1px solid ${C.grey}40` }}>
        <div className="hmi-footer-row" style={{ maxWidth: 760, margin: "0 auto", padding: "clamp(14px, 3.5vw, 16px) clamp(14px, 3.5vw, 24px)" }}>
          {isFirst ? <span style={{ fontFamily: F.body, fontSize: 13, color: C.grey }}>Step {i + 1} of {visibleScreens.length}</span>
            : <BackLink onClick={back} />}
          {!isLast
            ? <Btn variant="primary" onClick={next}>{nextLabel}</Btn>
            : <span style={{ fontFamily: F.body, fontSize: 13, color: C.grey }}>You're in charge from here</span>}
        </div>
      </footer>
    </div>
  );
}

// ============================================================
// SCREEN HEADER — shared, keeps every screen visually consistent
// ============================================================
function ScreenHead({ eyebrow, title, emphasis, lede }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <Eyebrow>{eyebrow}</Eyebrow>
      <H1 emphasis={emphasis}>{title}</H1>
      {lede && <Lede>{lede}</Lede>}
    </div>
  );
}

// ---------- 1. TIMING ----------
function ScreenTiming({ d, set, user, isPersisted }) {
  const haveUserName = !!(user && user.firstName);
  return (
    <div>
      <ScreenHead
        eyebrow="About you · 1 of 5"
        title={haveUserName ? <>Hi {user.firstName} — let's start with timing</> : "Let's start with timing"}
        lede={haveUserName
          ? "Three quick questions. Your progress saves automatically — you can step away and come back any time."
          : isPersisted
            ? "Three quick questions. Your progress saves automatically as you type."
            : "Two quick questions. Nothing here is saved or sent — it all works out as you type."}
      />
      {!haveUserName && (
        <Field label="What should we call you?" hint="Optional — just makes this feel less like a form.">
          <input
            type="text"
            value={d.firstName || ""}
            placeholder="First name"
            onChange={(e) => set("firstName", e.target.value)}
            style={{ width: "100%", fontFamily: F.body, fontSize: 16, padding: "14px 16px", borderRadius: 14, border: `1px solid ${C.grey}40`, background: C.paper, color: C.charcoal, outline: "none" }}
          />
        </Field>
      )}
      <Two>
        <Field label="How old are you?">
          <NumInput value={d.age} onChange={(v) => set("age", v)} prefix="" step={1} suffix="years" />
        </Field>
        <Field label="When would you like work to be optional?" hint="The age you're aiming at.">
          <NumInput value={d.retireAge} onChange={(v) => set("retireAge", v)} prefix="" step={1} suffix="years" />
        </Field>
      </Two>
      <CalloutQuiet>
        {d.firstName ? `${d.firstName}, that gives` : "That gives"} you <strong style={{ fontWeight: 600 }}>{Math.max(0, d.retireAge - d.age)} years</strong> to
        work with — the runway every number after this is built on.
      </CalloutQuiet>
    </div>
  );
}

// ---------- 2. INCOME ----------
function ScreenIncome({ d, set, calc }) {
  return (
    <div>
      <ScreenHead
        eyebrow="About you · 2 of 5"
        title="How you earn"
        lede="Your income shapes both your tax and how much you can borrow, so it's worth getting right."
      />
      <Field label="How are you taxed?" hint="Borrowing power is driven directly by assessable income.">
        <Choice value={d.employment} onChange={(v) => set("employment", v)}
          options={[{ value: "payg", label: "I'm an employee (PAYG)" }, { value: "business", label: "I own a business" }]} />
      </Field>

      {d.employment === "payg" ? (
        <>
          <Field label="Is this one income or two?" hint="Two incomes are each taxed on their own brackets — often keeping thousands more in the household each year.">
            <Choice value={d.incomeMode} onChange={(v) => set("incomeMode", v)}
              options={[{ value: "single", label: "Single income" }, { value: "dual", label: "Two incomes" }]} />
          </Field>
          {d.incomeMode === "dual" ? (
            <Two>
              <Field label="What's the first gross income?" hint="Before tax."><NumInput value={d.income} onChange={(v) => set("income", v)} /></Field>
              <Field label="And the second?" hint="Before tax."><NumInput value={d.income2} onChange={(v) => set("income2", v)} /></Field>
            </Two>
          ) : (
            <Field label="What's your gross annual income?" hint="Your salary package, before tax."><NumInput value={d.income} onChange={(v) => set("income", v)} /></Field>
          )}
        </>
      ) : (
        <>
          <Two>
            <Field label="Annual business turnover?"><NumInput value={d.bizTurnover} onChange={(v) => set("bizTurnover", v)} /></Field>
            <Field label="Net profit margin?" hint="After your wages and all operating expenses — i.e. what's left in the company at the end of the year."><NumInput value={d.bizProfitMargin} onChange={(v) => set("bizProfitMargin", v)} prefix="" suffix="%" step={1} /></Field>
          </Two>
          <Field label="How much do you pay yourself?" hint="The salary in your own name — this is what a lender assesses."><NumInput value={d.bizSalary} onChange={(v) => set("bizSalary", v)} /></Field>
        </>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 12, marginTop: 8 }}>
        <Snap label="Gross income" value={fmtK(calc.grossIncome)} />
        <Snap label="Tax & Medicare" value={fmtK(calc.taxPaid)} negative prefix="−" />
        <Snap label="After-tax" value={fmtK(calc.netIncome)} />
      </div>
      <DualNote calc={calc} d={d} />
    </div>
  );
}

// ---------- 3. ASSETS ----------
function ScreenAssets({ d, set, calc, setInv, addInv, removeInv }) {
  const dual = d.employment === "payg" && d.incomeMode === "dual";
  return (
    <div>
      <ScreenHead
        eyebrow="About you · 3 of 5"
        title="What you own, and owe"
        lede="Roughly is fine. We'll use this as the starting point for where you're heading."
      />
      <Field label="Do you own your home?">
        <Choice value={d.ownsHome} onChange={(v) => set("ownsHome", v)}
          options={[{ value: "yes", label: "Yes, I own where I live" }, { value: "no", label: "No, I rent" }]} />
      </Field>
      {d.ownsHome === "yes" && (
        <>
          <Two>
            <Field label="What's your home worth?"><NumInput value={d.homeValue} onChange={(v) => set("homeValue", v)} /></Field>
            <Field label="What's left on the loan?"><NumInput value={d.homeDebt} onChange={(v) => set("homeDebt", v)} /></Field>
          </Two>
          <Two>
            <Field label="Home loan rate?"><NumInput value={d.homeRate} onChange={(v) => set("homeRate", v)} prefix="" suffix="% p.a." step={0.1} /></Field>
            <Field label="How do you repay it?">
              <Choice value={d.homeRepayType} onChange={(v) => set("homeRepayType", v)}
                options={[{ value: "pi", label: "P&I" }, { value: "io", label: "Interest only" }]} />
            </Field>
          </Two>
          <Field label="Years left on the mortgage?" hint="Roughly how long until you'd own the home outright at the current pace.">
            <NumInput value={d.mortgageYearsLeft} onChange={(v) => set("mortgageYearsLeft", v)} prefix="" suffix="years" step={1} />
          </Field>
        </>
      )}
      {d.ownsHome === "no" && (
        <Field label="How much rent do you pay each week?" hint="Or board, or whatever you contribute toward where you live. Set to 0 if you live with family for free.">
          <NumInput value={d.rentPerWeek} onChange={(v) => set("rentPerWeek", v)} prefix="$" suffix="/ wk" step={10} />
        </Field>
      )}
      <Field label="Do you have any investment properties?">
        <Choice value={d.hasInv} onChange={(v) => set("hasInv", v)}
          options={[{ value: "no", label: "Not yet" }, { value: "yes", label: "Yes, I do" }]} />
      </Field>
      {d.hasInv === "yes" && (
        <div style={{ marginBottom: 24 }}>
          {(d.investments || []).map((p, idx) => (
            <div key={idx} style={{ background: C.lighterMint, borderRadius: 14, padding: "20px 22px", marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <span style={{ fontFamily: F.body, fontWeight: 600, fontSize: 15, color: C.emerald }}>Property {idx + 1}</span>
                {(d.investments.length > 1) && (
                  <button onClick={() => removeInv(idx)} style={{ background: "none", border: "none", cursor: "pointer", fontFamily: F.body, fontSize: 13, color: C.grey, textDecoration: "underline", padding: 0 }}>Remove</button>
                )}
              </div>
              <Two>
                <Field label="What's it worth?"><NumInput value={p.value} onChange={(v) => setInv(idx, "value", v)} /></Field>
                <Field label="What's owing on it?"><NumInput value={p.debt} onChange={(v) => setInv(idx, "debt", v)} /></Field>
              </Two>
              <Two>
                <Field label="Who's the lender?"><TextInput value={p.lender} onChange={(v) => setInv(idx, "lender", v)} placeholder="e.g. CBA" /></Field>
                <Field label="Rent per week?"><NumInput value={p.rentWeek} onChange={(v) => setInv(idx, "rentWeek", v)} suffix="/ wk" step={10} /></Field>
              </Two>
              <Two>
                <Field label="Loan rate?"><NumInput value={p.rate} onChange={(v) => setInv(idx, "rate", v)} prefix="" suffix="% p.a." step={0.1} /></Field>
                <Field label="How's it repaid?">
                  <Choice value={p.repayType} onChange={(v) => setInv(idx, "repayType", v)}
                    options={[{ value: "io", label: "Interest only" }, { value: "pi", label: "P&I" }]} />
                </Field>
              </Two>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", borderTop: `1px solid ${C.grey}40`, paddingTop: 12, marginTop: 2 }}>
                <span style={{ fontFamily: F.body, fontSize: 13, color: C.charcoal, opacity: 0.85 }}>Usable equity at 80% LVR</span>
                <span style={{ fontFamily: F.display, fontWeight: 400, fontSize: 20, color: C.emerald }}>{fmtK(Math.max(0, (p.value || 0) * 0.8 - (p.debt || 0)))}</span>
              </div>
            </div>
          ))}
          <TextLink onClick={addInv}>Add another property</TextLink>
        </div>
      )}
      {dual ? (
        <>
          <Two>
            <Field label="First person's super?" hint="Super is individual — each account counts separately."><NumInput value={d.super} onChange={(v) => set("super", v)} /></Field>
            <Field label="Second person's super?"><NumInput value={d.super2} onChange={(v) => set("super2", v)} /></Field>
          </Two>
          <Field label="Cash or offset savings?" hint="Combined across the household."><NumInput value={d.cash} onChange={(v) => set("cash", v)} /></Field>
        </>
      ) : (
        <Two>
          <Field label="Your super balance?"><NumInput value={d.super} onChange={(v) => set("super", v)} /></Field>
          <Field label="Cash or offset savings?"><NumInput value={d.cash} onChange={(v) => set("cash", v)} /></Field>
        </Two>
      )}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 12, marginTop: 8 }}>
        <Snap label="Total assets" value={fmtK(calc.totalAssets)} />
        <Snap label="Total debt" value={fmtK(calc.totalDebt)} />
        <Snap label="Net worth today" value={fmtK(calc.netWorth)} />
      </div>
    </div>
  );
}

// ---------- 4. GROWTH ----------
function ScreenGrowth({ d, set }) {
  const hasProperty = d.ownsHome === "yes" || (d.hasInv === "yes" && (d.investments || []).some((p) => (p.value || 0) > 0));
  return (
    <div>
      <ScreenHead
        eyebrow="About you · 4 of 5"
        title={hasProperty ? "Growth, and what you put away" : "What you put away"}
        lede={hasProperty
          ? "A couple of assumptions you can change any time. We keep them deliberately conservative."
          : "One question — and the one that funds everything else."}
      />
      {hasProperty && (
        <Two>
          <Field label="What do you think your property has grown by?" hint="Your best estimate of the yearly average.">
            <NumInput value={d.pastGrowth} onChange={(v) => set("pastGrowth", v)} prefix="" suffix="% p.a." step={0.5} />
          </Field>
          <Field label="What growth should we assume ahead?" hint="We default to a conservative 5% a year on all property.">
            <NumInput value={d.futureGrowth} onChange={(v) => set("futureGrowth", v)} prefix="" suffix="% p.a." step={0.5} />
          </Field>
        </Two>
      )}
      <Field label="Roughly, what does the household spend each year?" hint="Living costs only — outside the mortgage. Food, bills, transport, kids, insurance, the lot. The Australian average for a family is around $100k a year.">
        <NumInput value={d.annualExpenses} onChange={(v) => set("annualExpenses", v)} />
      </Field>
      <Field label="How much can you save or invest each year?" hint="What's left after those living costs — this is what funds deposits.">
        <NumInput value={d.annualSavings} onChange={(v) => set("annualSavings", v)} />
      </Field>
    </div>
  );
}

// ---------- 5. INFLATION ----------
function ScreenInflation({ d, set, calc }) {
  return (
    <div>
      <ScreenHead
        eyebrow="About you · 5 of 5"
        title="Has your income kept up?"
        emphasis="kept up"
        lede="A raise can quietly be a pay cut. Let's see how your income has tracked against the cost of living."
      />
      <Two>
        <Field
          label={d.employment === "payg" && d.incomeMode === "dual" ? "Combined income about 5 years ago?" : "Your income about 5 years ago?"}
          hint="A rough figure is fine — per year, before tax.">
          <NumInput value={d.income5yrAgo} onChange={(v) => set("income5yrAgo", v)} />
        </Field>
        <Field label="What's inflation been over that time?" hint="Australian CPI has averaged around 3.8% a year over the last five years.">
          <NumInput value={d.inflationBenchmark} onChange={(v) => set("inflationBenchmark", v)} prefix="" suffix="% p.a." step={0.1} />
        </Field>
      </Two>
      <IncomeVsInflation calc={calc} d={d} />
    </div>
  );
}

// ---------- 6. NET WORTH ----------
function ScreenNetWorth({ d, calc }) {
  const segs = [
    { label: "Home equity", val: calc.futHome - calc.futHomeDebt },
    { label: "Investment equity", val: calc.futInv - calc.futInvDebt },
    { label: "Super", val: calc.futSuper },
    { label: "Cash", val: calc.futCash },
  ].filter((s) => s.val > 0);
  const max = Math.max(calc.futNetWorth, 1);
  return (
    <div>
      <ScreenHead
        eyebrow="Where this leads · 1 of 4"
        title="If nothing changes"
        emphasis="nothing changes"
        lede={`Carrying on exactly as you are, here's where you land at ${d.retireAge} — ${calc.years} years from now, at ${d.futureGrowth}% a year.`}
      />
      <div style={{ background: C.emerald, borderRadius: 24, padding: "clamp(16px, 3.5vw, 30px) clamp(15px, 3.5vw, 28px)", marginBottom: 24 }}>
        <div style={{ display: "flex", gap: 28, flexWrap: "wrap", alignItems: "flex-end" }}>
          <MiniStat dark label="Net worth today" value={fmtK(calc.netWorth)} />
          <span style={{ fontSize: 24, color: C.paper, opacity: 0.5, paddingBottom: 4 }}>→</span>
          <MiniStat dark accent label={`In ${calc.years} years`} value={fmtK(calc.futNetWorth)} />
        </div>
        <p style={{ color: C.paper90, fontFamily: F.body, fontSize: 16, lineHeight: 1.6, marginTop: 18, marginBottom: 0 }}>
          Passive income from that, at a 4.5% gross yield, is about <strong style={{ color: calc.trajectoryPassive < (d.needBasics + d.needLifestyle + d.needLuxuries) * 0.5 ? "#FFB3A8" : C.paper, fontWeight: 700 }}>{fmtK(calc.trajectoryPassive)} a year</strong>{calc.trajectoryPassive < (d.needBasics + d.needLifestyle + d.needLuxuries) * 0.5 && <> — and that's the number most people don't see coming.</>}
        </p>
      </div>
      <Eyebrow rule>What makes up that net worth</Eyebrow>
      {segs.map((s) => (
        <div key={s.label} style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 15, marginBottom: 7, fontWeight: 500 }}>
            <span>{s.label}</span><span>{fmtK(s.val)}</span>
          </div>
          <div style={{ height: 10, background: C.lighterMint, borderRadius: 999, overflow: "hidden" }}>
            <div className="bar-fill" style={{ height: "100%", width: `${(s.val / max) * 100}%`, background: C.emerald, borderRadius: 999, transformOrigin: "left", animation: `grow 1.2s ${EASE} both` }} />
          </div>
        </div>
      ))}
      <SourceLine>Future property growth assumed at {d.futureGrowth}% p.a. · super return {d.superReturn}% p.a. · indicative only.</SourceLine>
    </div>
  );
}

// ---------- 7. LEAKS ----------
function ScreenLeaks({ d, calc }) {
  return (
    <div>
      <ScreenHead
        eyebrow="Where this leads · 2 of 4"
        title="Where money leaks on the way"
        emphasis="leaks"
        lede={`Two costs sit quietly inside that path. Neither arrives as a bill — but both are real, and large over ${calc.years} years.`}
      />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 18 }}>
        <div style={{ background: C.lighterMint, borderRadius: 24, padding: "clamp(14px, 3.5vw, 24px) clamp(14px, 3.5vw, 24px)" }}>
          <h3 className="news-h3" style={{ fontFamily: F.display, fontWeight: 400, fontSize: 23, color: C.emerald, margin: "0 0 4px" }}>Interest on your home</h3>
          <p style={{ fontFamily: F.body, fontSize: 14, color: C.charcoal, lineHeight: 1.5, margin: "0 0 16px" }}>
            <strong style={{ fontWeight: 600 }}>Non-deductible debt</strong> — paid with after-tax dollars, nothing claimed back.
            {d.homeRepayType === "io" && " On interest only, the balance never falls, so the interest never eases."}
          </p>
          <div className="news-h2" style={{ fontFamily: F.display, fontWeight: 400, fontSize: "clamp(1.5rem, 1.25vw + 1rem, 2.25rem)", color: C.negative, lineHeight: 1, marginBottom: 14 }}>−{fmtK(calc.homeInt.total)}</div>
          <AreaChart tone="negative" data={calc.homeInt.schedule.map((p) => ({ x: p.yr, y: p.cum }))} years={calc.years}
            caption={`Cumulative home-loan interest between now and retirement, ${d.homeRepayType === "io" ? "interest only" : "P&I"}, at ${d.homeRate}% p.a. on a ${d.mortgageYearsLeft || 25}-year remaining term.`} />
        </div>
        <div style={{ background: C.lighterMint, borderRadius: 24, padding: "clamp(14px, 3.5vw, 24px) clamp(14px, 3.5vw, 24px)" }}>
          <h3 className="news-h3" style={{ fontFamily: F.display, fontWeight: 400, fontSize: 23, color: C.emerald, margin: "0 0 4px" }}>Tax you'll pay</h3>
          <p style={{ fontFamily: F.body, fontSize: 14, color: C.charcoal, lineHeight: 1.5, margin: "0 0 16px" }}>
            At about <strong style={{ fontWeight: 600 }}>{fmtK(calc.taxPerYear)} a year</strong>, held flat — what leaves before you invest a dollar.
          </p>
          <div className="news-h2" style={{ fontFamily: F.display, fontWeight: 400, fontSize: "clamp(1.5rem, 1.25vw + 1rem, 2.25rem)", color: C.negative, lineHeight: 1, marginBottom: 14 }}>−{fmtK(calc.taxTotal)}</div>
          <AreaChart tone="negative" data={calc.taxSchedule.map((p) => ({ x: p.yr, y: p.cum }))} years={calc.years}
            caption="Cumulative tax, income held flat — no wage growth assumed." />
        </div>
      </div>
      <SourceLine>Home interest from a monthly amortisation schedule on your {d.mortgageYearsLeft || 25}-year remaining term. Shows cumulative interest paid between now and retirement (your working life). Tax on FY2025–26 resident rates incl. Medicare{d.employment === "business" ? " plus 25% company tax on retained profit" : ""}. Indicative of scale, not a forecast.</SourceLine>
    </div>
  );
}

// ---------- 8. WORKING WEEK ----------
function ScreenWeek({ calc }) {
  return (
    <div>
      <ScreenHead
        eyebrow="Where this leads · 3 of 4"
        title="Your working week"
        lede="Of the five days you work, here's who each one is really for. Only the days at the end are earning for your own life."
      />
      <WorkWeek calc={calc} />
      <SourceLine>Each day valued at one-fifth of gross income ({fmtK(calc.grossIncome)}/yr). Principal is shown separately — it isn't lost, it builds your equity. Only tax and home interest leave for good.</SourceLine>
    </div>
  );
}

// ---------- 9. COST OVER TIME ----------
function ScreenCost({ d, calc }) {
  // Build pie of where every dollar of gross income goes
  const taxYr = calc.taxPaid || 0;
  const homeIntYr = calc.homeIntYr || 0;
  const homePrinYr = calc.homePrinYr || 0;
  const leftYr = Math.max(0, (calc.grossIncome || 0) - taxYr - homeIntYr - homePrinYr);
  const dollarSlices = [
    { label: "Tax", value: taxYr, color: C.negative },
    { label: "Home interest", value: homeIntYr, color: "#D97757" },
    { label: "Principal (builds equity)", value: homePrinYr, color: C.grey },
    { label: "What's left for life", value: leftYr, color: C.emerald },
  ].filter((s) => s.value > 0);
  const leakPct = calc.grossIncome > 0 ? Math.round(((taxYr + homeIntYr) / calc.grossIncome) * 100) : 0;
  return (
    <div>
      <ScreenHead
        eyebrow="Where this leads · 4 of 4"
        title={<>Here's what your <em style={{ fontStyle: "italic" }}>money</em> is actually doing</>}
        lede="Of every dollar you earn, this is where it really goes. Look at the picture before you read the numbers."
      />

      {/* The identity moment — Wealth Velocity Score */}
      <WealthVelocityCard
        score={calc.wealthVelocityScore}
        grade={calc.wvsGrade}
        type={calc.wvsType}
        color={calc.wvsColor}
        firstName={d.firstName}
      />

      {/* The peer comparison — ABS percentile readout */}
      <PercentileReadout calc={calc} d={d} />

      {/* The pie chart — the visual punch */}
      <div style={{ background: C.paper, border: `1px solid ${C.grey}30`, borderRadius: 24, padding: "clamp(15px, 3.5vw, 28px) clamp(14px, 3.5vw, 24px)", marginBottom: 24 }}>
        <PieChart
          slices={dollarSlices}
          centerLabel="Your gross"
          centerValue={fmtK(calc.grossIncome)}
        />
        <PieLegend slices={dollarSlices} />
      </div>

      {/* The hero punchline */}
      <div style={{ background: C.negative, color: C.paper, borderRadius: 24, padding: "clamp(17px, 3.5vw, 32px) clamp(15px, 3.5vw, 28px)", marginBottom: 24 }}>
        <HeroNumber
          eyebrow="The bit that never comes back"
          value={`${leakPct}¢`}
          caption={<>of every dollar you earn this year disappears — gone to tax and interest on the home. That's <strong style={{ color: C.paper, fontWeight: 700 }}>{fmtK(taxYr + homeIntYr)}</strong>{calc.grossIncome > 0 && <> out of {fmtK(calc.grossIncome)}</>}.  You don't see it. You don't choose where it goes. It just goes.</>}
          tone="paper"
        />
      </div>

      {/* The carry-forward — plain English */}
      <div style={{ background: C.lighterMint, borderRadius: 24, padding: "clamp(14px, 3.5vw, 26px) clamp(15px, 3.5vw, 28px)" }}>
        <h3 className="news-h3" style={{ fontFamily: F.display, fontWeight: 400, fontSize: "clamp(1.1875rem, 0.5vw + 1rem, 1.625rem)", color: C.emerald, margin: "0 0 14px" }}>
          Now picture that leak running for years.
        </h3>
        <p style={{ fontFamily: F.body, fontSize: 16, color: C.charcoal, lineHeight: 1.65, margin: "0 0 20px", maxWidth: 580 }}>
          At <strong>{fmt(calc.week.leak)} a week</strong>, here's the same hole, year on year. Nothing changes. You just keep paying.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 14 }}>
          <LeakProjection label="In 1 year" value={calc.leakPerYear} />
          <LeakProjection label="In 5 years" value={calc.leakPerYear * 5} />
          <LeakProjection label={`By age ${d.retireAge}`} value={calc.leakPerYear * calc.years} emphasis />
        </div>
        <p style={{ fontFamily: F.body, fontSize: 15, color: C.charcoal, lineHeight: 1.65, marginTop: 18, marginBottom: 0, maxWidth: 580 }}>
          That last number? That's a house. Two houses. The retirement you said you wanted. <strong>The cost of doing nothing.</strong>
        </p>
      </div>

      <SourceLine>Pie shows the split of your gross income across tax, non-deductible home interest, principal (which builds equity, not a leak), and what's left for life. Carry-forward holds today's leak flat — it's a scale, not a forecast.</SourceLine>
    </div>
  );
}

// ---------- 10. INCOME TARGET ----------
// ---------- REALITY CHECK (only shown when there's no real plan) ----------
function ScreenReality({ d, set, calc }) {
  const sellingFee = calc.homeValueAtRetirement * 0.02;
  const lastsWhole = Math.floor(calc.yearsCapitalLasts);
  // Pie of where the retirement money actually comes from
  const retSlices = [
    { label: "Super", value: calc.futSuper || 0, color: C.emerald },
    { label: "Savings & cash", value: calc.futCash || 0, color: "#7BA88B" },
    ...(d.ownsHome === "yes" ? [{ label: "Selling the home", value: calc.sellProceeds || 0, color: C.mint }] : []),
  ].filter((s) => s.value > 0);
  return (
    <div>
      <ScreenHead
        eyebrow="The honest version"
        title={<>The retirement <em style={{ fontStyle: "italic" }}>most people</em> are actually heading for</>}
        lede="Not the brochure version. The maths version. Here's what your money looks like the day you stop working — and how long it lasts."
      />

      {/* The hard line */}
      <div style={{ background: C.negative, borderRadius: 24, padding: "clamp(17px, 3.5vw, 32px) clamp(15px, 3.5vw, 28px)", marginBottom: 24, color: C.paper }}>
        <HeroNumber
          eyebrow="Years your money will last"
          value={`${lastsWhole}`}
          caption={<>You're {d.age} now. You want to retire at {d.retireAge}. Most people live to {Math.max(d.retireAge + 25, 85)}. <strong style={{ color: C.paper, fontWeight: 700 }}>That's {Math.max(0, (d.retireAge + 25) - d.retireAge)} years of retirement to fund.</strong> Your money runs out {Math.max(0, (d.retireAge + 25) - d.retireAge - lastsWhole)} years before you do.</>}
          tone="paper"
        />
      </div>

      {/* Editable expenses */}
      <Field label="What does your household actually spend in a year?" hint="Living costs only — food, bills, the car, kids, holidays. The average Aussie family is around $100k a year outside the mortgage.">
        <NumInput value={d.annualExpenses} onChange={(v) => set("annualExpenses", v)} />
      </Field>

      {/* The retirement pie */}
      {retSlices.length > 0 && (
        <div style={{ background: C.paper, border: `1px solid ${C.grey}30`, borderRadius: 24, padding: "clamp(15px, 3.5vw, 28px) clamp(14px, 3.5vw, 24px)", marginBottom: 24, marginTop: 8 }}>
          <h3 className="news-h3" style={{ fontFamily: F.display, fontWeight: 400, fontSize: 24, color: C.emerald, margin: "0 0 4px" }}>Where the money comes from</h3>
          <p style={{ fontFamily: F.body, fontSize: 14, color: C.charcoal, opacity: 0.75, margin: "0 0 18px" }}>
            Every dollar you'll spend in retirement comes from somewhere in this picture.
          </p>
          <PieChart
            slices={retSlices}
            centerLabel="In total"
            centerValue={fmtK(calc.totalCapitalAtRetirement)}
          />
          <PieLegend slices={retSlices} />
        </div>
      )}

      {/* Where you'll land — vs the median Australian retiree */}
      <div style={{ background: C.paper, border: `1px solid ${C.grey}30`, borderRadius: 24, padding: "clamp(15px, 3.5vw, 28px) clamp(15px, 3.5vw, 28px)", marginBottom: 24 }}>
        <div style={{ fontFamily: F.body, fontWeight: 500, fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: C.emerald, opacity: 0.75, marginBottom: 10 }}>
          How you'll stack up at retirement
        </div>
        <h3 className="news-h2" style={{ fontFamily: F.display, fontWeight: 400, fontSize: "clamp(1.25rem, 0.75vw + 1rem, 1.75rem)", color: C.emerald, margin: "0 0 16px", lineHeight: 1.2 }}>
          At your current pace, in today's dollars, you'll retire with <strong style={{ color: C.emerald, fontWeight: 600 }}>{fmtK(calc.futNetWorthRealToday)}</strong>.
        </h3>
        <BeforeAfterBars
          beforeLabel="Median Australian retiree (65-74)"
          beforeValue={Math.max(1, calc.retireeMedian)}
          beforeText={fmtK(calc.retireeMedian)}
          afterLabel="Your projected real-terms net worth"
          afterValue={Math.max(1, calc.futNetWorthRealToday)}
          afterText={fmtK(calc.futNetWorthRealToday)}
        />
        <div style={{ background: calc.aboveRetireeMedian ? C.lighterMint : "#F8E5E1", borderRadius: 14, padding: "18px 20px", marginTop: 18 }}>
          <div style={{ fontFamily: F.body, fontWeight: 500, fontSize: 11, letterSpacing: "0.06em", textTransform: "uppercase", color: calc.aboveRetireeMedian ? C.emerald : C.negative, marginBottom: 6 }}>
            {calc.aboveRetireeMedian ? `That's ${calc.retireeMedianMultiple.toFixed(1)}× the median Australian retiree` : "Below the median Australian retiree"}
          </div>
          <p style={{ fontFamily: F.body, fontSize: 14, lineHeight: 1.65, color: C.charcoal, margin: 0 }}>
            {calc.retireeMedianMultiple >= 2 && <>You'll land in the top third of Australian retirees. Comfortable on raw numbers — but the question becomes what you actually do with that capital. Many at this level still run cash-poor because the wealth is locked in illiquid assets.</>}
            {calc.retireeMedianMultiple >= 1 && calc.retireeMedianMultiple < 2 && <>Above the median Australian retiree — but here's what most people don't realise: <strong style={{ fontWeight: 700 }}>the median Australian retiree relies heavily on the age pension</strong>. Above-median doesn't mean comfortable. The ASFA "Comfortable Retirement" standard requires far more than the median household carries.</>}
            {calc.retireeMedianMultiple < 1 && calc.retireeMedianMultiple > 0 && <>You'll land <strong style={{ color: C.negative, fontWeight: 700 }}>below the median Australian retiree</strong> — and that median itself isn't enough for a comfortable retirement without the age pension. This is where retirement turns into managed scarcity, not freedom.</>}
            {calc.retireeMedianMultiple <= 0 && <>The projection doesn't reach a meaningful retirement number. Without a different path, this is age-pension territory.</>}
          </p>
        </div>
        <div style={{ fontFamily: F.body, fontSize: 12, color: C.grey, marginTop: 14, lineHeight: 1.5 }}>
          Your projection in today's dollars (inflating future value at {d.inflationBenchmark}% CPI). Retiree median from {calc.ABS_RELEASE_NOTE}.
        </div>
      </div>

      {/* Inflation reality */}
      <div style={{ background: C.lighterMint, borderRadius: 24, padding: "clamp(14px, 3.5vw, 26px) clamp(15px, 3.5vw, 28px)", marginBottom: 24 }}>
        <h3 className="news-h3" style={{ fontFamily: F.display, fontWeight: 400, fontSize: "clamp(1.1875rem, 0.5vw + 1rem, 1.625rem)", color: C.emerald, margin: "0 0 14px" }}>
          $100k today won't be $100k then.
        </h3>
        <BeforeAfterBars
          beforeLabel="What $100k buys today"
          beforeValue={100000}
          beforeText={fmtK(100000)}
          afterLabel={`What you'll need by ${2025 + calc.years}`}
          afterValue={calc.annualExpensesAtRetirement}
          afterText={fmtK(calc.annualExpensesAtRetirement)}
        />
        <p style={{ fontFamily: F.body, fontSize: 15, color: C.charcoal, lineHeight: 1.65, margin: "20px 0 0", maxWidth: 580 }}>
          Same life. Same shopping list. Same haircuts. At {d.inflationBenchmark}% inflation, that's the bill in {calc.years} years. Inflation is the silent partner in this story — and it doesn't take a year off.
        </p>
      </div>

      {/* THE RENTER TRAP — for pure renters with no property exposure */}
      {calc.isPureRenter && <RenterTrapPanel d={d} calc={calc} />}

      {/* RENTVESTER ACKNOWLEDGMENT — different tone, still useful */}
      {calc.isRentvester && <RentvesterPanel d={d} calc={calc} />}

      {/* Sell the home scenario */}
      {d.ownsHome === "yes" && (
        <div style={{ background: C.paper, border: `1px solid ${C.grey}30`, borderRadius: 24, padding: "clamp(14px, 3.5vw, 26px) clamp(15px, 3.5vw, 28px)", marginBottom: 24 }}>
          <h3 className="news-h3" style={{ fontFamily: F.display, fontWeight: 400, fontSize: "clamp(1.1875rem, 0.5vw + 1rem, 1.625rem)", color: C.emerald, margin: "0 0 6px" }}>So you sell the house. Then what?</h3>
          <p style={{ fontFamily: F.body, fontSize: 15, lineHeight: 1.65, color: C.charcoal, margin: "0 0 18px", opacity: 0.85 }}>
            This is the lever most people reach for. Here's the maths, with nothing hidden.
          </p>
          <div style={{ background: C.lighterMint, borderRadius: 14, padding: "16px 18px", marginBottom: 18 }}>
            <SellRow label="Sale price at retirement" value={calc.homeValueAtRetirement} />
            <SellRow label="Selling fees (~2%)" value={-sellingFee} negative />
            <SellRow label="Pre-sale improvements" value={-50000} negative />
            {calc.homeBalanceAtRetirement > 0 && <SellRow label="Mortgage still owing" value={-calc.homeBalanceAtRetirement} negative />}
            <div style={{ height: 1, background: C.grey, opacity: 0.4, margin: "8px 0" }} />
            <SellRow label="In your hand" value={calc.sellProceeds} bold />
          </div>
          <BeforeAfterBars
            beforeLabel="What you walk away with"
            beforeValue={calc.sellProceeds}
            beforeText={fmtK(calc.sellProceeds)}
            afterLabel={`Median capital city house in ${2025 + calc.years}`}
            afterValue={calc.cityHouseAtRetirement}
            afterText={fmtK(calc.cityHouseAtRetirement)}
          />
          {calc.shortfallVsMedianCity > 0 ? (
            <div style={{ background: C.negative, color: C.paper, borderRadius: 14, padding: "18px 20px", marginTop: 18 }}>
              <div style={{ fontFamily: F.body, fontWeight: 600, fontSize: 17, marginBottom: 8 }}>
                You're <strong style={{ fontWeight: 700 }}>{fmtK(calc.shortfallVsMedianCity)} short</strong> of a median capital city home.
              </div>
              <div style={{ fontFamily: F.body, fontSize: 14, lineHeight: 1.6, opacity: 0.95 }}>
                So what's the plan? A regional town an hour out? A small unit on the edge? This is the conversation no one has — until they're standing at the auction with the cheque, and the cheque isn't big enough.
              </div>
            </div>
          ) : (
            <div style={{ background: C.mint, color: C.emerald, borderRadius: 14, padding: "18px 20px", marginTop: 18, fontFamily: F.body, fontSize: 14, lineHeight: 1.6 }}>
              It technically clears a median city house. But you'd be plowing every dollar back into a house — leaving nothing to actually live on. That's not retirement, that's moving day.
            </div>
          )}
        </div>
      )}

      {/* The bottom line */}
      <div style={{ background: C.negative, color: C.paper, borderRadius: 24, padding: "clamp(16px, 3.5vw, 30px) clamp(15px, 3.5vw, 28px)" }}>
        <h3 className="news-h2" style={{ fontFamily: F.display, fontWeight: 400, fontSize: "clamp(1.3125rem, 0.875vw + 1rem, 1.875rem)", color: C.paper, margin: "0 0 14px", lineHeight: 1.2 }}>
          This isn't fear-mongering. It's the maths.
        </h3>
        <p style={{ fontFamily: F.body, fontSize: 16, lineHeight: 1.7, color: C.paper, opacity: 0.95, margin: 0 }}>
          Super alone has never funded a comfortable retirement for anyone. Selling the house is a one-time hit, not a paycheck. And inflation keeps showing up whether you've planned for it or not. <strong style={{ color: C.paper, fontWeight: 700 }}>You're not stupid. You're not behind because you did something wrong. You're behind because nobody showed you the picture you just saw.</strong>
        </p>
        <p style={{ fontFamily: F.body, fontSize: 16, lineHeight: 1.7, color: C.paper, opacity: 0.95, marginTop: 14, marginBottom: 0 }}>
          The good news? It's fixable. The next few screens show you how.
        </p>
      </div>

      <SourceLine>
        Expenses inflate at your {d.inflationBenchmark}% CPI assumption to {fmtK(calc.annualExpensesAtRetirement)} per year by retirement. Sell scenario: 2% selling fees, ~$50k pre-sale improvements, less any mortgage still owing. Median capital city house ~$1.15M today (CoreLogic 8-capital, early 2026), grown at your {d.futureGrowth}% assumption. Capital-lasts assumes no investment return — conservative. Indicative and educational, not financial advice.
      </SourceLine>
    </div>
  );
}

function BreakdownRow({ label, value, note }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 20, padding: "16px 0" }}>
      <div style={{ flex: "1 1 auto" }}>
        <div style={{ fontFamily: F.body, fontWeight: 500, fontSize: 16, color: C.charcoal }}>{label}</div>
        <div style={{ fontFamily: F.body, fontSize: 13, color: C.charcoal, opacity: 0.75, lineHeight: 1.5, marginTop: 4, maxWidth: 480 }}>{note}</div>
      </div>
      <div style={{ fontFamily: F.body, fontWeight: 600, fontSize: 20, color: C.emerald, whiteSpace: "nowrap" }}>{fmtK(value)}</div>
    </div>
  );
}

function SellRow({ label, value, negative, bold }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "8px 0", borderBottom: `0px` }}>
      <span style={{ fontFamily: F.body, fontWeight: bold ? 600 : 500, fontSize: bold ? 16 : 15, color: C.charcoal }}>{label}</span>
      <span style={{ fontFamily: F.body, fontWeight: bold ? 700 : 500, fontSize: bold ? 20 : 16, color: negative ? C.negative : C.emerald, whiteSpace: "nowrap" }}>
        {negative ? "−" : ""}{fmtK(Math.abs(value))}
      </span>
    </div>
  );
}

function ScreenIncomeTarget({ d, set, calc }) {
  const tiers = [
    { key: "needBasics", label: "Basics", tag: "The non-negotiables", desc: "A roof, the bills, food, insurance, rates." },
    { key: "needLifestyle", label: "Lifestyle", tag: "How you actually live", desc: "The car, the kids' sport, family time, a holiday a year." },
    { key: "needLuxuries", label: "Luxuries", tag: "Why you're doing this", desc: "The dream holiday, the dream car, capital to back what's next." },
  ];
  return (
    <div>
      <ScreenHead
        eyebrow="Your plan · 1 of 2"
        title="The income you actually want"
        emphasis="actually want"
        lede="Split it into three honest tiers. The top one is the difference between getting by and the life you're working toward."
      />
      {tiers.map((t) => (
        <div key={t.key} style={{ background: C.lighterMint, borderRadius: 14, padding: "20px 22px", marginBottom: 14, display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 20, flexWrap: "wrap" }}>
          <div style={{ flex: "1 1 220px" }}>
            <h3 className="news-h3" style={{ fontFamily: F.display, fontWeight: 400, fontSize: 24, color: C.emerald, margin: 0 }}>{t.label}</h3>
            <div style={{ fontFamily: F.body, fontWeight: 500, fontSize: 12, letterSpacing: "0.02em", textTransform: "uppercase", color: C.grey, margin: "4px 0 8px" }}>{t.tag}</div>
            <p style={{ fontSize: 14, color: C.charcoal, lineHeight: 1.5, margin: 0 }}>{t.desc}</p>
          </div>
          <div style={{ width: 190 }}><NumInput value={d[t.key]} onChange={(v) => set(t.key, v)} suffix="/ yr" /></div>
        </div>
      ))}
      <div style={{ background: C.mint, borderRadius: 24, padding: "clamp(14px, 3.5vw, 26px) clamp(15px, 3.5vw, 28px)", marginTop: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 18 }}>
          <div>
            <div style={{ fontFamily: F.body, fontWeight: 500, fontSize: 12, letterSpacing: "0.02em", textTransform: "uppercase", color: C.emerald, opacity: 0.7 }}>The income you want</div>
            <div className="news-h1" style={{ fontFamily: F.display, fontWeight: 400, fontSize: "clamp(1.625rem, 1.75vw + 1rem, 2.75rem)", color: C.emerald, lineHeight: 1, marginTop: 6 }}>{fmt(calc.needTotal)}<span style={{ fontSize: 17, opacity: 0.7 }}> / yr</span></div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontFamily: F.body, fontWeight: 500, fontSize: 12, letterSpacing: "0.02em", textTransform: "uppercase", color: calc.trajectoryPassive < calc.needTotal * 0.5 ? C.negative : C.emerald, opacity: 0.85 }}>On your current path</div>
            <div className="news-h2" style={{ fontFamily: F.display, fontWeight: 400, fontSize: "clamp(1.375rem, 1vw + 1rem, 2rem)", color: calc.trajectoryPassive < calc.needTotal * 0.5 ? C.negative : C.emerald, lineHeight: 1, marginTop: 6 }}>{fmtK(calc.trajectoryPassive)}<span style={{ fontSize: 15, opacity: 0.7 }}> / yr</span></div>
          </div>
        </div>
        {calc.incomeGap > 0 && (
          <p style={{ fontFamily: F.body, fontSize: 15, color: C.negative, lineHeight: 1.6, marginTop: 18, marginBottom: 0, fontWeight: 500 }}>
            You're short <strong style={{ fontWeight: 700 }}>{fmt(calc.incomeGap)} a year</strong>. Next, exactly what closes that gap.
          </p>
        )}
      </div>
    </div>
  );
}

// ---------- 11. PLAN ----------
// ---------- ACQUISITION / MOVE FROM HERE (dashboard) ----------
function ScreenAcquire({ d, calc }) {
  const plan = calc.acqPlan;
  const endEquity = plan.series[plan.series.length - 1].equity;
  const propsAcquired = plan.series[plan.series.length - 1].count;
  const pool = calc.acqPool;
  // Buying power — the simple, aspirational version. Pool ÷ 19% per purchase.
  // No borrowing-capacity gate at the headline level; that's for the partner conversation.
  const buyingPower = Math.floor(pool / (calc.acqAvgPrice * EQUITY_PER_BUY));
  const portfolioToday = buyingPower * calc.acqAvgPrice;
  // What that portfolio compounds into by retirement at the user's growth assumption
  const portfolioAtRetirement = portfolioToday * Math.pow(1 + (d.futureGrowth || 5) / 100, calc.years);
  // Minimum threshold — if a structural acquisition plan can't produce at least
  // ~$700k of property value, the panel doesn't fire (engine isn't ready yet).
  const MIN_BUYING_POWER = 700000;
  const hasAnyBuyingPower = portfolioToday >= MIN_BUYING_POWER;

  return (
    <div>
      <ScreenHead
        eyebrow="Your plan · 2 of 3"
        title="Your move from here"
        emphasis="move"
        lede={`You're on a path to about ${fmtK(calc.trajectoryPassive)} a year passive income, while leaking ${fmt(calc.leakPerYear)} a year to tax and interest. Here's what putting your equity to work could actually unlock.`}
      />

      {/* The capacity statement — buying power as a confident result, not a formula reveal */}
      <div style={{ background: C.emerald, borderRadius: 24, padding: "clamp(16px, 3.5vw, 30px) clamp(15px, 3.5vw, 28px)", marginBottom: 24 }}>
        <div style={{ fontFamily: F.body, fontWeight: 500, fontSize: 12, letterSpacing: "0.02em", textTransform: "uppercase", color: C.mint, marginBottom: 12 }}>
          Equity and cash you can put to work
        </div>
        <div className="news-d" style={{ fontFamily: F.display, fontWeight: 400, fontSize: "clamp(2.25rem, 3.5vw + 1rem, 4rem)", color: C.paper, lineHeight: 1 }}>{fmtK(pool)}</div>
        <div style={{ fontFamily: F.body, fontSize: 14, color: C.paper90, marginTop: 8 }}>usable equity at 80% LVR + cash on hand</div>

        {hasAnyBuyingPower ? (
          <>
            <div style={{ height: 1, background: `${C.paper}33`, margin: "28px 0 22px" }} />
            <div style={{ fontFamily: F.body, fontWeight: 500, fontSize: 12, letterSpacing: "0.02em", textTransform: "uppercase", color: C.mint, marginBottom: 12 }}>
              Our overview calcs show a buying power of
            </div>
            <div className="news-d" style={{ fontFamily: F.display, fontWeight: 400, fontSize: "clamp(2.75rem, 4.5vw + 1.25rem, 5rem)", color: C.mint, lineHeight: 0.95 }}>{fmtK(portfolioToday)}</div>
            <div style={{ fontFamily: F.body, fontSize: 14, color: C.paper90, marginTop: 8 }}>worth of property you could control today</div>
            <p style={{ fontFamily: F.body, fontSize: 15, color: C.paper90, lineHeight: 1.7, marginTop: 22, marginBottom: 0, maxWidth: 580 }}>
              A <strong style={{ color: C.paper, fontWeight: 700 }}>structural wholesale acquisition plan with deposit maximisation</strong> could put this to work as, for example, {buyingPower === 1 ? <>a single property around <strong style={{ color: C.paper, fontWeight: 700 }}>{fmtK(calc.acqAvgPrice)}</strong></> : <><strong style={{ color: C.paper, fontWeight: 700 }}>{buyingPower} properties at around {fmtK(calc.acqAvgPrice)}</strong> each</>}. The exact structure depends on your lender, your serviceability, and the right property profiles for your position — that's the work the $49 plan maps out.
            </p>
          </>
        ) : (
          <p style={{ fontFamily: F.body, fontSize: 15, color: C.paper90, lineHeight: 1.65, marginTop: 18, marginBottom: 0, maxWidth: 560 }}>
            The acquisition engine isn't quite ready to fire yet — your current pool needs to grow a little further before a structural plan can do its job. Growth on what you hold, or a lift in savings, gets you there. The $49 plan maps out the sequence: what to build first, what to restructure, and when the engine starts to turn.
          </p>
        )}
      </div>

      {/* The big-picture compound */}
      {hasAnyBuyingPower && (
        <div style={{ background: C.lighterMint, borderRadius: 24, padding: "clamp(16px, 3.5vw, 30px) clamp(15px, 3.5vw, 28px)", marginBottom: 24 }}>
          <div style={{ fontFamily: F.body, fontWeight: 500, fontSize: 12, letterSpacing: "0.06em", textTransform: "uppercase", color: C.emerald, opacity: 0.75, marginBottom: 14 }}>
            Now picture this in {calc.years} years
          </div>
          <h3 className="news-h2" style={{ fontFamily: F.display, fontWeight: 400, fontSize: "clamp(1.3125rem, 0.875vw + 1rem, 1.875rem)", color: C.emerald, margin: "0 0 22px", lineHeight: 1.2 }}>
            Same money, two different stories.
          </h3>
          <BeforeAfterBars
            beforeLabel="Sitting in your equity, doing nothing"
            beforeValue={pool * Math.pow(1 + (d.futureGrowth || 5) / 100, calc.years)}
            beforeText={fmtK(pool * Math.pow(1 + (d.futureGrowth || 5) / 100, calc.years))}
            afterLabel={`Working in ${buyingPower} ${buyingPower === 1 ? "property" : "properties"}`}
            afterValue={portfolioAtRetirement}
            afterText={fmtK(portfolioAtRetirement)}
          />
          <div style={{ background: C.emerald, color: C.paper, borderRadius: 18, padding: "clamp(14px, 3.5vw, 24px) clamp(14px, 3.5vw, 24px)", marginTop: 22 }}>
            <HeroNumber
              eyebrow="The difference"
              value={fmtK(portfolioAtRetirement - pool * Math.pow(1 + (d.futureGrowth || 5) / 100, calc.years))}
              caption={<>That's the cost of just sitting on your equity. Same {calc.years} years. Same {d.futureGrowth}% growth. Just a different vehicle. <strong style={{ color: C.paper, fontWeight: 700 }}>This is what leverage does.</strong></>}
              tone="paper"
            />
          </div>
          <p style={{ fontFamily: F.body, fontSize: 14, color: C.charcoal, opacity: 0.75, lineHeight: 1.6, marginTop: 20, marginBottom: 0, fontStyle: "italic" }}>
            Before rent. Before recycling that equity into the next property. Before tax breaks. This is just the asset growing.
          </p>
        </div>
      )}

      {/* Debt vs equity stacked chart */}
      {propsAcquired > 0 ? (
        <>
          <Eyebrow rule>Acquiring over the next {calc.acqHorizon} years</Eyebrow>
          <p style={{ fontFamily: F.body, fontSize: 16, lineHeight: 1.6, color: C.charcoal, maxWidth: 600, marginTop: 0 }}>
            Each band is a property's equity growing beneath you. New loans run interest-only for 5 years to keep cashflow strong, then flip to principal & interest and start cutting debt — which is why the grey debt band begins to shrink. As your income rises and rent comes in, capacity opens up for the next one. Three or so properties across {calc.acqHorizon} years is a realistic pace.
          </p>
          <div style={{ background: C.paper, border: `1px solid ${C.grey}40`, borderRadius: 24, padding: "22px 22px 18px" }}>
            <StackedAreaChart series={plan.series} caption={`Portfolio equity vs debt, ${plan.series[0].year}–${plan.series[plan.series.length - 1].year}, at ${d.futureGrowth}% growth. New loans interest-only 5 years then P&I. Indicative.`} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 14, marginTop: 20 }}>
            <BigStat label={`Portfolio in ${calc.acqHorizon} yrs`} value={fmtK(plan.series[plan.series.length - 1].value)} />
            <BigStat label="Your equity then" value={fmtK(endEquity)} emphasis />
            <BigStat label="Properties held" value={String(propsAcquired)} />
          </div>
        </>
      ) : (
        <div style={{ background: C.lighterMint, borderRadius: 24, padding: "clamp(14px, 3.5vw, 26px) clamp(15px, 3.5vw, 28px)" }}>
          <h3 className="news-h3" style={{ fontFamily: F.display, fontWeight: 400, fontSize: 24, color: C.emerald, margin: "0 0 12px" }}>What unlocks your first move</h3>
          <p style={{ fontFamily: F.body, fontSize: 15, lineHeight: 1.65, color: C.charcoal, margin: 0 }}>
            You're building toward the ~{fmtK(calc.acqAvgPrice * EQUITY_PER_BUY)} of deposit and costs a first purchase needs. At {d.futureGrowth}% growth on what you hold and {fmtK(d.annualSavings)} saved a year, the gap closes — and from there the recycling engine takes over.
          </p>
        </div>
      )}

      {/* Recycle cadence */}
      {plan.buyYears.length > 1 && (
        <div style={{ background: C.lighterMint, borderRadius: 24, padding: "clamp(14px, 3.5vw, 24px) clamp(14px, 3.5vw, 26px)", marginTop: 20 }}>
          <h3 className="news-h3" style={{ fontFamily: F.display, fontWeight: 400, fontSize: 24, color: C.emerald, margin: "0 0 12px" }}>How the recycling works</h3>
          <p style={{ fontFamily: F.body, fontSize: 15, lineHeight: 1.65, color: C.charcoal, margin: 0 }}>
            Buy now, and a new build at {d.futureGrowth}% growth builds about <strong style={{ fontWeight: 600 }}>$90k of usable equity by year {calc.recycleYears || 3}</strong>. Pull that equity, use it as the next deposit, and go again — the plan below repeats that step:
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 16 }}>
            {plan.buyYears.map((b, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ background: C.emerald, color: C.paper, borderRadius: 999, padding: "8px 16px", fontFamily: F.body, fontSize: 14, fontWeight: 500 }}>
                  {b.year}: property {b.to}
                </div>
                {i < plan.buyYears.length - 1 && <span style={{ color: C.grey }}>→</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tax benefit of a new build */}
      <div style={{ background: C.mint, borderRadius: 24, padding: "clamp(14px, 3.5vw, 26px) clamp(15px, 3.5vw, 28px)", marginTop: 20 }}>
        <h3 className="news-h3" style={{ fontFamily: F.display, fontWeight: 400, fontSize: 24, color: C.emerald, margin: "0 0 12px" }}>And it works against your tax</h3>
        <p style={{ fontFamily: F.body, fontSize: 15, lineHeight: 1.65, color: C.emerald, margin: "0 0 16px" }}>
          Even at a modest 4% gross yield, a brand-new property runs at a small paper loss once depreciation and interest are counted. That loss comes off your taxable income.
        </p>
        <div style={{ display: "flex", gap: 28, flexWrap: "wrap" }}>
          <div>
            <div className="news-h2" style={{ fontFamily: F.display, fontWeight: 400, fontSize: "clamp(1.375rem, 1vw + 1rem, 2.125rem)", color: C.emerald, lineHeight: 1 }}>+{fmtK(calc.ngTaxSaved)}</div>
            <div style={{ fontFamily: F.body, fontSize: 13, color: C.emerald, opacity: 0.8, marginTop: 5 }}>back in your pocket each year while negatively geared</div>
          </div>
          <div>
            <div className="news-h2" style={{ fontFamily: F.display, fontWeight: 400, fontSize: "clamp(1.375rem, 1vw + 1rem, 2.125rem)", color: C.emerald, lineHeight: 1 }}>{fmtK(calc.ngRent)}</div>
            <div style={{ fontFamily: F.body, fontSize: 13, color: C.emerald, opacity: 0.8, marginTop: 5 }}>rent a year coming in (4% gross)</div>
          </div>
        </div>
      </div>

      {/* The endgame */}
      <div style={{ background: C.lighterMint, borderRadius: 24, padding: "clamp(14px, 3.5vw, 26px) clamp(15px, 3.5vw, 28px)", marginTop: 20 }}>
        <h3 className="news-h3" style={{ fontFamily: F.display, fontWeight: 400, fontSize: 24, color: C.emerald, margin: "0 0 12px" }}>And how it ends</h3>
        <p style={{ fontFamily: F.body, fontSize: 15, lineHeight: 1.7, color: C.charcoal, margin: 0 }}>
          Hold these assets through to your retirement phase. Because they're brand-new when bought, holding 15+ years means the CGT discount applies in full. Then the choice is yours: <strong style={{ fontWeight: 600 }}>sell one or two, clear the debt on the rest</strong>, and the remaining unencumbered properties throw off the passive income you set as your target — around {fmt(calc.needTotal)} a year. Or sell a single one and pay off your own home outright. Same portfolio, your call.
        </p>
      </div>

      <SourceLine>Buying power = (usable equity at 80% LVR + cash) ÷ ~19% per purchase (10% deposit, stamp duty on the land only, LMI). Compound projection at your {d.futureGrowth}% p.a. growth assumption, over {calc.years} years to retirement. The staged sequence below adds in income growth at {(INCOME_GROWTH * 100).toFixed(1)}% p.a. and 5-year interest-only on new loans. Servicing capacity is a lender-side conversation — a partner can model your exact position. Indicative and educational, not financial, tax or credit advice.</SourceLine>
    </div>
  );
}

// ---------- OPPORTUNITIES (the optimisation engine) ----------
function ScreenOpportunities({ d, set, calc, onPurchaseReport, onBookCall }) {
  const homeIsPI = d.homeRepayType === "pi" && (d.homeDebt || 0) > 0;
  const hasNgBenefit = calc.ngTaxSaved > 1000;
  const hasSavings = (d.annualSavings || 0) > 0;
  const canCombine = homeIsPI && hasNgBenefit && hasSavings;
  let cardNum = 0;
  return (
    <div>
      <ScreenHead
        eyebrow="The plan"
        title={<>Now let me show you <em style={{ fontStyle: "italic" }}>the way out</em></>}
        lede="Same income. Same family. Same starting point. These are the levers nobody told you about — and the picture changes the moment you pull them."
      />

      {/* Mortgage outlives retirement — the hard flag */}
      {calc.mortgageOutlivesRetirement && (
        <div style={{ background: C.negative, color: C.paper, borderRadius: 24, padding: "clamp(17px, 3.5vw, 32px) clamp(15px, 3.5vw, 28px)", marginBottom: 24 }}>
          <HeroNumber
            eyebrow="🚨 Red flag"
            value={`${calc.mortgageOverhangYears} yrs`}
            caption={<>That's how long your home loan runs <strong style={{ color: C.paper, fontWeight: 700 }}>past your retirement age</strong>. Meaning: you'd still owe {fmtK(calc.homeBalanceAtRetirement)} on the day you stop working. Mortgage payments would come out of super, savings, or selling the house. Fix this first.</>}
            tone="paper"
          />
        </div>
      )}

      {/* Opportunity 1: Tax savings → mortgage */}
      {homeIsPI && hasNgBenefit && (
        <OpportunityCard
          number={++cardNum}
          eyebrow="The ATO becomes your mortgage helper"
          title={<>Let the <em style={{ fontStyle: "italic" }}>tax man</em> pay down your home loan</>}
          painPoint={
            <>You're handing <strong>{fmtK(calc.taxPaid)}</strong> a year to the ATO. That's gone. Forever. No return, no thanks, just a receipt.</>
          }
          theMove={
            <>Buy one investment property. At your tax bracket ({(calc.marginal * 100).toFixed(1)}%), the ATO sends back about <strong>{fmtK(calc.ngTaxSaved)} a year</strong>. You take every dollar of that and shove it straight into your home loan. About <strong>{fmt(Math.round(calc.extraFromTax))}/month</strong> extra.</>
          }
          bars={
            <BeforeAfterBars
              beforeLabel="Standard payoff"
              beforeValue={d.mortgageYearsLeft}
              beforeText={`${d.mortgageYearsLeft} years`}
              afterLabel="With the tax saving"
              afterValue={Math.max(0.1, d.mortgageYearsLeft - calc.yearsSavedByTax)}
              afterText={`${(d.mortgageYearsLeft - calc.yearsSavedByTax).toFixed(1)} years`}
            />
          }
          impact={[
            { value: calc.yearsSavedByTax.toFixed(1), unit: "yrs", label: "earlier you're debt-free" },
            { value: fmtK(calc.interestSavedByTax), unit: "", label: "you don't hand to the bank" },
          ]}
          note="The ATO funds the investment's tax break. You funnel it into your home. You still own a growing asset on top. Everyone wins except the bank."
        />
      )}

      {/* Opportunity 2: Existing savings → mortgage offset */}
      {homeIsPI && hasSavings && (
        <OpportunityCard
          number={++cardNum}
          eyebrow="Your savings are in the wrong account"
          title={<>Move your <em style={{ fontStyle: "italic" }}>savings</em> next to your home loan</>}
          painPoint={
            <>You save <strong>{fmtK(d.annualSavings)}</strong> a year. In a regular bank account it earns ~3%, then tax eats half. So really? About 1.8%. The bank wins again.</>
          }
          theMove={
            <>Same money. Same balance. Just sitting in an offset against your home loan. It now effectively earns <strong>{d.homeRate}%</strong> — and the ATO doesn't touch it. Even just ~<strong>{fmt(Math.round(calc.sensibleExtra))}/month</strong>:</>
          }
          bars={
            <BeforeAfterBars
              beforeLabel="Standard payoff"
              beforeValue={d.mortgageYearsLeft}
              beforeText={`${d.mortgageYearsLeft} years`}
              afterLabel="With offset"
              afterValue={Math.max(0.1, d.mortgageYearsLeft - calc.yearsSavedBySavings)}
              afterText={`${(d.mortgageYearsLeft - calc.yearsSavedBySavings).toFixed(1)} years`}
            />
          }
          impact={[
            { value: calc.yearsSavedBySavings.toFixed(1), unit: "yrs", label: "off the loan, from this alone" },
          ]}
          note="Zero extra effort. Zero new behaviour. Just the right account."
        />
      )}

      {/* Opportunity 3: Combine both */}
      {canCombine && (
        <OpportunityCard
          number={++cardNum}
          eyebrow="Now pull both levers"
          title={<>Both moves <em style={{ fontStyle: "italic" }}>at once</em>. Watch what happens.</>}
          painPoint={<>The standard path is <strong>{d.mortgageYearsLeft} years</strong> of payments. {calc.mortgageOutlivesRetirement && `That puts you ${calc.mortgageOverhangYears} years past retirement. Not great.`}</>}
          theMove={<>Tax saving + offset savings. Both flowing into the home loan. About <strong>{fmt(Math.round(calc.extraFromTax + calc.sensibleExtra))}/month</strong> extra. Now look:</>}
          bars={
            <BeforeAfterBars
              beforeLabel="Standard path"
              beforeValue={d.mortgageYearsLeft}
              beforeText={`${d.mortgageYearsLeft} years to debt-free`}
              afterLabel="Both levers pulled"
              afterValue={Math.max(0.1, d.mortgageYearsLeft - calc.yearsSavedCombined)}
              afterText={`${(d.mortgageYearsLeft - calc.yearsSavedCombined).toFixed(1)} years to debt-free`}
            />
          }
          impact={[
            { value: calc.yearsSavedCombined.toFixed(1), unit: "yrs", label: "shaved off your home loan" },
            { value: (d.mortgageYearsLeft - calc.yearsSavedCombined).toFixed(1), unit: "yrs", label: "until you own it outright" },
          ]}
          note={calc.mortgageOutlivesRetirement && (d.mortgageYearsLeft - calc.yearsSavedCombined) < calc.years
            ? "This single move pulls your mortgage back inside your working life. Red flag fixed."
            : "Every year off the home loan is a year your cashflow works for you instead of the bank."}
        />
      )}

      {/* Opportunity 4: Sell-investment-pays-home, 15yr view */}
      {d.ownsHome === "yes" && (
        <OpportunityCard
          number={++cardNum}
          eyebrow="The 15-year exit"
          title={<>Buy one place now. <em style={{ fontStyle: "italic" }}>Sell it in 15 years</em>. Own your home, debt-free.</>}
          painPoint={
            <>You're going to be paying a mortgage for the next {d.mortgageYearsLeft} years. That's a lot of life held hostage by a number on a bank statement.</>
          }
          theMove={
            <>Buy a new ~{fmtK(calc.acqAvgPrice)} property today. Don't touch it for 15 years (max CGT discount). It grows to about <strong>{fmtK(calc.propValY15)}</strong>. You sell. Pay the selling fees ({fmtK(calc.sellingFeeOnInv)}), the CGT after the 50% discount ({fmtK(calc.cgt)}), and the original loan ({fmtK(calc.acqAvgPrice * 0.9)}). You walk away with <strong>{fmtK(calc.netInvSaleProceeds)}</strong>.</>
          }
          bars={
            <BeforeAfterBars
              beforeLabel="Home loan balance in 15 years"
              beforeValue={calc.homeBalY15 || 1}
              beforeText={fmtK(calc.homeBalY15)}
              afterLabel="What the sale gives you"
              afterValue={calc.netInvSaleProceeds}
              afterText={fmtK(calc.netInvSaleProceeds)}
            />
          }
          impact={
            calc.couldClearHome
              ? [
                  { value: "✓", unit: "", label: "home loan cleared" },
                  { value: fmtK(calc.homeClearSurplus), unit: "", label: "still left over" },
                ]
              : [
                  { value: fmtK(calc.netInvSaleProceeds), unit: "", label: "thrown at the home loan" },
                  { value: fmtK(Math.max(0, calc.homeBalY15 - calc.netInvSaleProceeds)), unit: "", label: "remaining stub" },
                ]
          }
          note={calc.couldClearHome
            ? "You retire owning your home, paid for by an asset that grew while you slept. The maths only works if you start now — every year you wait costs you a year of growth at the back end."
            : "Even if the sale doesn't fully clear the loan, it shrinks it to a stub. From there it's a sprint, not a marathon."}
        />
      )}

      {/* Fallback when no opportunities apply yet */}
      {!homeIsPI && !hasSavings && d.ownsHome !== "yes" && (
        <div style={{ background: C.lighterMint, borderRadius: 24, padding: "clamp(15px, 3.5vw, 28px) clamp(15px, 3.5vw, 28px)", marginBottom: 24 }}>
          <h3 className="news-h2" style={{ fontFamily: F.display, fontWeight: 400, fontSize: "clamp(1.25rem, 0.75vw + 1rem, 1.75rem)", color: C.emerald, margin: "0 0 14px" }}>You can't optimise what isn't there yet.</h3>
          <p style={{ fontFamily: F.body, fontSize: 15, color: C.charcoal, lineHeight: 1.65, margin: 0, maxWidth: 580 }}>
            Without a home loan to redirect into — or savings to redirect — the levers above need something to lever. The first move is building the position. The $49 plan below walks through the exact starting sequence for your situation.
          </p>
        </div>
      )}

      {/* The bottom line — the shock figures before the close */}
      {canCombine && calc.totalInterestStandard > 1000 && (
        <div style={{ background: C.paper, border: `1px solid ${C.grey}30`, borderRadius: 24, padding: "clamp(18px, 3.5vw, 34px) clamp(16px, 3.5vw, 30px)", marginTop: 32, marginBottom: 24 }}>
          <div style={{ fontFamily: F.body, fontWeight: 500, fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", color: C.emerald, opacity: 0.75, marginBottom: 14 }}>
            The bottom line
          </div>
          <h2 className="news-h1" style={{ fontFamily: F.display, fontWeight: 400, fontSize: "clamp(1.5rem, 1.25vw + 1rem, 2.25rem)", color: C.emerald, lineHeight: 1.15, margin: "0 0 28px" }}>
            What this actually buys you, <em style={{ fontStyle: "italic" }}>in real life</em>.
          </h2>

          {/* Shock #1: total interest you pay vs save */}
          <div style={{ background: "#F8E5E1", borderRadius: 18, padding: "clamp(14px, 3.5vw, 26px) clamp(14px, 3.5vw, 24px)", marginBottom: 18 }}>
            <div style={{ fontFamily: F.body, fontWeight: 500, fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: C.negative, marginBottom: 10 }}>
              The interest bill nobody talks about
            </div>
            <p style={{ fontFamily: F.body, fontSize: 15, color: C.charcoal, lineHeight: 1.6, margin: "0 0 22px" }}>
              Over the life of your home loan at <strong>{d.homeRate}%</strong>, here's what you actually pay the bank in interest. Not the loan balance — just the interest, on top.
            </p>
            <BeforeAfterBars
              beforeLabel="Standard path — interest you pay"
              beforeValue={calc.totalInterestStandard}
              beforeText={fmtK(calc.totalInterestStandard)}
              afterLabel="Optimised — interest you pay"
              afterValue={Math.max(1, calc.totalInterestOptimised)}
              afterText={fmtK(calc.totalInterestOptimised)}
            />
            <div style={{ background: C.negative, color: C.paper, borderRadius: 14, padding: "18px 20px", marginTop: 18 }}>
              <div style={{ fontFamily: F.body, fontWeight: 500, fontSize: 12, letterSpacing: "0.06em", textTransform: "uppercase", color: C.paper, opacity: 0.85, marginBottom: 6 }}>
                That's a difference of
              </div>
              <div className="news-d" style={{ fontFamily: F.display, fontWeight: 400, fontSize: "clamp(2rem, 2.5vw + 1rem, 3.5rem)", color: C.paper, lineHeight: 1 }}>
                {fmtK(calc.totalInterestSaved)}
              </div>
              <div style={{ fontFamily: F.body, fontSize: 14, color: C.paper, opacity: 0.9, marginTop: 8, lineHeight: 1.5, maxWidth: 520 }}>
                Money that goes back into your pocket instead of the bank's quarterly profit announcement. That's a house deposit. A degree for the kids. A boat. Two years of not working.
              </div>
            </div>
          </div>

          {/* Shock #2: when the home gets paid off */}
          <div style={{ background: C.lighterMint, borderRadius: 18, padding: "clamp(14px, 3.5vw, 26px) clamp(14px, 3.5vw, 24px)", marginBottom: 18 }}>
            <div style={{ fontFamily: F.body, fontWeight: 500, fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: C.emerald, marginBottom: 10 }}>
              The age you actually own your home
            </div>
            <p style={{ fontFamily: F.body, fontSize: 15, color: C.charcoal, lineHeight: 1.6, margin: "0 0 22px" }}>
              You're {d.age} now. Here's the difference between drifting and pulling the levers above:
            </p>
            <BeforeAfterBars
              beforeLabel="Standard — debt-free at age"
              beforeValue={calc.ageHomePaidStandard}
              beforeText={`${Math.round(calc.ageHomePaidStandard)}`}
              afterLabel="Optimised — debt-free at age"
              afterValue={Math.max(1, calc.ageHomePaidOptimised)}
              afterText={`${Math.round(calc.ageHomePaidOptimised)}`}
            />
            <p style={{ fontFamily: F.body, fontSize: 15, color: C.charcoal, lineHeight: 1.65, marginTop: 20, marginBottom: 0, maxWidth: 580 }}>
              From age <strong style={{ color: C.emerald, fontWeight: 700 }}>{Math.round(calc.ageHomePaidOptimised)}</strong>, the mortgage stops being a line item in your life. That's <strong>{Math.round(calc.ageHomePaidStandard - calc.ageHomePaidOptimised)} years</strong> of life back.
            </p>
          </div>

          {/* Shock #3: days of the week become yours */}
          {calc.daysOfWeekFromMortgage > 0.2 && (
            <div style={{ background: C.emerald, color: C.paper, borderRadius: 18, padding: "clamp(15px, 3.5vw, 28px) clamp(14px, 3.5vw, 26px)" }}>
              <div style={{ fontFamily: F.body, fontWeight: 500, fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: C.mint, marginBottom: 12 }}>
                And here's what that means for your week
              </div>
              <h3 className="news-h2" style={{ fontFamily: F.display, fontWeight: 400, fontSize: "clamp(1.25rem, 0.75vw + 1rem, 1.75rem)", color: C.paper, lineHeight: 1.25, margin: "0 0 22px" }}>
                Right now, <strong style={{ color: C.mint, fontWeight: 700 }}>{calc.daysOfWeekFromMortgage.toFixed(1)} days</strong> of every working week pay the mortgage.
              </h3>
              <DaysWeekStrip totalDays={5} mortgageDays={calc.daysOfWeekFromMortgage} />
              <p style={{ fontFamily: F.body, fontSize: 15, color: C.paper90, lineHeight: 1.7, marginTop: 24, marginBottom: 0, maxWidth: 580 }}>
                When the mortgage ends, those days become yours. Same income, no repayment. You can keep working and pocket the difference — or work less and keep the same lifestyle. <strong style={{ color: C.paper, fontWeight: 700 }}>That's freedom, not a slogan. That's what the maths actually does.</strong>
              </p>
              <p style={{ fontFamily: F.body, fontSize: 14, color: C.mint, lineHeight: 1.65, marginTop: 16, marginBottom: 0, opacity: 0.9, fontStyle: "italic" }}>
                Worst case — even if you don't touch property investing — these levers alone get the home paid off years sooner. That fact alone is worth the next step.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Cost of waiting — the urgency without manipulation */}
      {calc.costOfWaitingMonth > 100 && (
        <div style={{ background: "#FCEFE8", border: `1px solid ${C.negative}30`, borderRadius: 18, padding: "clamp(14px, 3.5vw, 22px) clamp(14px, 3.5vw, 24px)", marginTop: 28, marginBottom: 20, display: "flex", gap: 24, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ flex: "0 0 auto" }}>
            <div style={{ fontFamily: F.body, fontWeight: 500, fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: C.negative, marginBottom: 6 }}>
              The cost of waiting
            </div>
            <div className="news-h2" style={{ fontFamily: F.display, fontWeight: 400, fontSize: "clamp(1.5rem, 1.25vw + 1rem, 2.25rem)", color: C.negative, lineHeight: 1 }}>
              {fmtK(calc.costOfWaitingMonth)}<span style={{ fontSize: 16, opacity: 0.75 }}> / month</span>
            </div>
          </div>
          <p style={{ flex: "1 1 280px", fontFamily: F.body, fontSize: 14, color: C.charcoal, lineHeight: 1.6, margin: 0, opacity: 0.9 }}>
            Every month you put this conversation off, that's the compound growth you don't capture. Not a fear tactic — just maths. Property at {d.futureGrowth}% growth, {calc.years} years to retirement. The runway only gets shorter from here.
          </p>
        </div>
      )}

      {/* The $49 close — strategist humanisation, report preview, dual CTA */}
      <div style={{ background: C.emerald, color: C.paper, borderRadius: 28, padding: "clamp(24px, 3.5vw, 44px) clamp(19px, 3.5vw, 36px)", marginTop: 24, position: "relative", overflow: "hidden" }}>
        <div style={{ fontFamily: F.body, fontWeight: 500, fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", color: C.mint, marginBottom: 16 }}>
          {d.firstName ? `${d.firstName}, here's what's next` : "Here's what's next"}
        </div>
        <h2 className="news-h1" style={{ fontFamily: F.display, fontWeight: 400, fontSize: "clamp(1.625rem, 1.75vw + 1rem, 2.75rem)", color: C.paper, lineHeight: 1.08, margin: "0 0 20px", maxWidth: 680 }}>
          The <em style={{ fontStyle: "italic" }}>personalised plan</em> — written by a real strategist — for $49.
        </h2>
        <p style={{ fontFamily: F.body, fontSize: 17, color: C.paper90, lineHeight: 1.65, margin: "0 0 28px", maxWidth: 620 }}>
          You've seen the picture. Now get the instruction manual. We take your <em>actual</em> numbers — your lender, your tax position, your property, your borrowing capacity — and write you the sequenced playbook. Which lever to pull first. What to refinance. Which property profile fits. And the order it all happens in.
        </p>

        {/* Report preview — tangibility */}
        <div style={{ fontFamily: F.body, fontWeight: 500, fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: C.mint, marginBottom: 12 }}>
          What's inside your report
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, marginBottom: 28 }}>
          <ReportPagePreview pageNo="01" title="Your snapshot" lines={["Net worth: " + fmtK(calc.netWorth), "Velocity score: " + calc.wealthVelocityScore + "/100", "Years runway: " + Math.floor(calc.yearsCapitalLasts)]} />
          <ReportPagePreview pageNo="02" title="Your restructure" lines={["Lender review", "Offset vs redraw plan", "IO → P&I sequence"]} />
          <ReportPagePreview pageNo="03" title="Property profile" lines={["Borrowing capacity", "Price range that fits", "Suburb shortlist"]} />
          <ReportPagePreview pageNo="04" title="The 90-day plan" lines={["Step 1, week 1-2", "Step 2, week 3-6", "Step 3, week 7-12"]} />
        </div>

        {/* Strategist humanisation */}
        <div style={{ background: `${C.paper}12`, border: `1px solid ${C.paper}25`, borderRadius: 16, padding: "20px 22px", marginBottom: 28, display: "flex", gap: 18, alignItems: "center", flexWrap: "wrap" }}>
          <StrategistAvatar />
          <div style={{ flex: "1 1 280px" }}>
            <div style={{ fontFamily: F.body, fontWeight: 600, fontSize: 16, color: C.paper }}>
              Written by your Head Strategist
            </div>
            <div style={{ fontFamily: F.body, fontSize: 13, color: C.paper90, marginTop: 4, lineHeight: 1.55 }}>
              Not a chatbot. Not a templated PDF. A real strategist who reads your inputs, talks to your situation, and signs the report. 48-hour turnaround. Refundable if it isn't useful.
            </div>
          </div>
        </div>

        {/* Primary CTA */}
        <div style={{ display: "flex", gap: 18, alignItems: "center", flexWrap: "wrap", marginBottom: 22 }}>
          <button onClick={() => {
              const env = { data: d, calc };
              if (onPurchaseReport) onPurchaseReport(env);
              else if (typeof window !== "undefined") window.open("https://helpmeinvest.com.au/report", "_blank");
            }}
            style={{ background: C.mint, color: C.emerald, border: "none", borderRadius: 999, padding: "clamp(14px, 3.5vw, 20px) clamp(22px, 3.5vw, 40px)", fontFamily: F.body, fontWeight: 700, fontSize: 18, cursor: "pointer" }}>
            Get my $49 plan →
          </button>
          <div style={{ fontFamily: F.body, fontSize: 14, color: C.paper90 }}>
            <div style={{ fontWeight: 600, color: C.paper }}>48-hour turnaround</div>
            <div style={{ opacity: 0.85, marginTop: 2 }}>Money-back if it isn't useful, no questions.</div>
          </div>
        </div>

        {/* Secondary CTA — the free call */}
        <div style={{ paddingTop: 24, borderTop: `1px solid ${C.paper}25` }}>
          <div style={{ fontFamily: F.body, fontWeight: 500, fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: C.mint, marginBottom: 10 }}>
            Not ready for the report?
          </div>
          <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
            <button onClick={() => {
                const env = { data: d, calc };
                if (onBookCall) onBookCall(env);
                else if (typeof window !== "undefined") window.open("https://helpmeinvest.com.au/call", "_blank");
              }}
              style={{ background: "transparent", color: C.paper, border: `1.5px solid ${C.paper}80`, borderRadius: 999, padding: "clamp(14px, 3.5vw, 14px) clamp(15px, 3.5vw, 28px)", fontFamily: F.body, fontWeight: 600, fontSize: 15, cursor: "pointer" }}>
              Book a free 15-min call
            </button>
            <div style={{ fontFamily: F.body, fontSize: 14, color: C.paper90, lineHeight: 1.55, maxWidth: 380 }}>
              Talk through your scorecard with a strategist. No card, no upsell pressure — just a conversation about what you've seen here.
            </div>
          </div>
        </div>
      </div>

      <SourceLine>
        All numbers come from your inputs. Tax saving = projected paper loss on one new build at your marginal rate. Mortgage paydown holds the interest rate constant. The 15-year exit assumes full 50% CGT discount, 2.2% selling fees (incl GST), and CGT at your marginal rate on 50% of the gain. The $49 plan models all of this against your real lender, structure, and goals. Indicative — not financial, tax, or credit advice.
      </SourceLine>
    </div>
  );
}

// A small "page" thumbnail — used in the report preview to give shape to what
// the $49 actually delivers. Tangibility reduces purchase friction.
function ReportPagePreview({ pageNo, title, lines }) {
  return (
    <div style={{ background: C.paper, color: C.charcoal, borderRadius: 12, padding: "16px 16px", minHeight: 130, display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ fontFamily: F.body, fontWeight: 500, fontSize: 10, letterSpacing: "0.1em", color: C.emerald, opacity: 0.6 }}>
        PAGE {pageNo}
      </div>
      <div style={{ fontFamily: F.display, fontWeight: 400, fontSize: 17, color: C.emerald, lineHeight: 1.25 }}>
        {title}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 5, marginTop: "auto" }}>
        {lines.map((l, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 4, height: 4, background: C.emerald, opacity: 0.5, borderRadius: 999 }} />
            <div style={{ fontFamily: F.body, fontSize: 12, color: C.charcoal, opacity: 0.85, lineHeight: 1.4 }}>{l}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// SVG avatar for the strategist — abstract, on-brand, no stock photo. Replace
// with an actual portrait when shipping by swapping the SVG for an <img>.
function StrategistAvatar() {
  return (
    <svg viewBox="0 0 80 80" style={{ width: 72, height: 72, flexShrink: 0 }}>
      <circle cx="40" cy="40" r="40" fill={C.mint} />
      <circle cx="40" cy="32" r="13" fill={C.emerald} />
      <path d="M 14 72 Q 14 52 40 52 Q 66 52 66 72 L 66 80 L 14 80 Z" fill={C.emerald} />
    </svg>
  );
}

function OpportunityCard({ number, eyebrow, title, painPoint, theMove, bars, impact, note }) {
  return (
    <div style={{ background: C.paper, border: `1px solid ${C.grey}30`, borderRadius: 24, padding: "clamp(15px, 3.5vw, 28px) clamp(15px, 3.5vw, 28px)", marginBottom: 20 }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 14, marginBottom: 12 }}>
        <div className="news-d" style={{ fontFamily: F.display, fontWeight: 400, fontSize: "clamp(2rem, 2.5vw + 1rem, 3.5rem)", color: C.emerald, opacity: 0.25, lineHeight: 1 }}>
          {String(number).padStart(2, "0")}
        </div>
        <div style={{ fontFamily: F.body, fontWeight: 500, fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: C.emerald, opacity: 0.75 }}>{eyebrow}</div>
      </div>
      <h3 className="news-h2" style={{ fontFamily: F.display, fontWeight: 400, fontSize: "clamp(1.3125rem, 0.875vw + 1rem, 1.875rem)", color: C.emerald, lineHeight: 1.2, margin: "0 0 18px" }}>{title}</h3>
      {painPoint && (
        <div style={{ background: "#F8E5E1", borderRadius: 14, padding: "14px 18px", marginBottom: 14 }}>
          <div style={{ fontFamily: F.body, fontWeight: 500, fontSize: 11, letterSpacing: "0.06em", textTransform: "uppercase", color: C.negative, marginBottom: 6 }}>The leak</div>
          <p style={{ fontFamily: F.body, fontSize: 15, color: C.charcoal, lineHeight: 1.6, margin: 0 }}>{painPoint}</p>
        </div>
      )}
      {theMove && (
        <div style={{ background: C.lighterMint, borderRadius: 14, padding: "14px 18px", marginBottom: 18 }}>
          <div style={{ fontFamily: F.body, fontWeight: 500, fontSize: 11, letterSpacing: "0.06em", textTransform: "uppercase", color: C.emerald, marginBottom: 6 }}>The move</div>
          <p style={{ fontFamily: F.body, fontSize: 15, color: C.charcoal, lineHeight: 1.6, margin: 0 }}>{theMove}</p>
        </div>
      )}
      {bars && <div style={{ marginBottom: 18 }}>{bars}</div>}
      {impact && (
        <div style={{ background: C.emerald, color: C.paper, borderRadius: 18, padding: "22px 22px", marginBottom: 14 }}>
          <div style={{ fontFamily: F.body, fontWeight: 500, fontSize: 11, letterSpacing: "0.06em", textTransform: "uppercase", color: C.mint, marginBottom: 12 }}>The result</div>
          <div style={{ display: "grid", gridTemplateColumns: `repeat(${impact.length}, 1fr)`, gap: 24 }}>
            {impact.map((i, k) => (
              <div key={k}>
                <div className="news-d" style={{ fontFamily: F.display, fontWeight: 400, fontSize: "clamp(1.625rem, 1.75vw + 1rem, 2.75rem)", color: C.paper, lineHeight: 1 }}>
                  {i.value}{i.unit && <span style={{ fontSize: 18, opacity: 0.7 }}> {i.unit}</span>}
                </div>
                <div style={{ fontFamily: F.body, fontSize: 13, color: C.mint, marginTop: 6 }}>{i.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}
      {note && <p style={{ fontFamily: F.body, fontSize: 14, color: C.charcoal, opacity: 0.8, lineHeight: 1.6, margin: 0 }}>{note}</p>}
    </div>
  );
}

function ReportFeature({ title, desc }) {
  return (
    <div style={{ background: `${C.paper}10`, border: `1px solid ${C.paper}25`, borderRadius: 14, padding: "16px 18px" }}>
      <div style={{ fontFamily: F.body, fontWeight: 600, fontSize: 14, color: C.paper, marginBottom: 6 }}>{title}</div>
      <div style={{ fontFamily: F.body, fontSize: 13, color: C.paper90, lineHeight: 1.55 }}>{desc}</div>
    </div>
  );
}

function ScreenPlan({ d, set, calc }) {
  const toggleGoal = (g) => set("goals", d.goals.includes(g) ? d.goals.filter((x) => x !== g) : [...d.goals, g]);
  const goalOpts = ["Help my kids", "Upgrade our home", "Start or back a business", "Travel and time freedom", "Leave something behind"];
  return (
    <div>
      <ScreenHead
        eyebrow="Your plan · 2 of 2"
        title="What it takes, working backwards"
        emphasis="working backwards"
        lede="From the income you want and a 4.5% gross yield. Every number is shown — check the working yourself."
      />
      <div style={{ background: C.emerald, borderRadius: 24, padding: "clamp(22px, 3.5vw, 40px) clamp(15px, 3.5vw, 28px)", textAlign: "center", marginBottom: 24 }}>
        <div style={{ fontFamily: F.body, fontWeight: 500, fontSize: 12, letterSpacing: "0.02em", textTransform: "uppercase", color: C.mint, marginBottom: 12 }}>Properties to acquire</div>
        <div className="news-d" style={{ fontFamily: F.display, fontWeight: 400, fontSize: "clamp(2.75rem, 5vw + 1rem, 5.5rem)", color: C.paper, lineHeight: 0.95 }}>{calc.propertiesNeeded}</div>
        <p style={{ fontFamily: F.body, fontSize: 15, color: C.paper90, lineHeight: 1.6, maxWidth: 460, margin: "14px auto 0" }}>
          At about {fmtK(calc.avgPropPrice)} each, growing {d.futureGrowth}% a year, this closes a {fmtK(calc.equityGap)} equity gap and supports {fmt(calc.needTotal)} a year.
        </p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(170px,1fr))", gap: 14 }}>
        <BigStat label="Equity required" value={fmtK(calc.equityRequired)} />
        <BigStat label="Deposit per property" value={fmtK(calc.depositPerProp)} sub="~12% incl. costs" />
        <BigStat label="Total deposits" value={fmtK(calc.totalDepositsNeeded)} emphasis />
      </div>
      <SourceLine>Indicative only — not financial advice. Based on ~{fmtK(calc.avgPropPrice)} per property, 19% deposit + costs (10% deposit, stamps on land, LMI), {d.futureGrowth}% growth, 4.5% gross yield.</SourceLine>

      {calc.totalUsableEquity80 > 0 && (
        <>
          <div style={{ height: 1, background: C.grey, opacity: 0.4, margin: "32px 0" }} />
          <Eyebrow rule>What you can already put to work</Eyebrow>
          <p style={{ fontFamily: F.body, fontSize: 16, lineHeight: 1.6, color: C.charcoal, maxWidth: 600, marginTop: 0 }}>
            Lenders will usually release equity up to 80% of a property's value. Here's the usable
            equity sitting in what you already own — often the fastest source of deposits.
          </p>
          <div style={{ background: C.lighterMint, borderRadius: 24, padding: "clamp(10px, 3.5vw, 10px) clamp(14px, 3.5vw, 24px)" }}>
            {d.ownsHome === "yes" && calc.homeUsableEquity80 > 0 && (
              <EquityRow label="Your home" value={d.homeValue} debt={d.homeDebt} equity={calc.homeUsableEquity80} />
            )}
            {calc.invEquity80.map((p, i) => (
              <EquityRow key={i} label={p.lender ? `Investment ${i + 1} · ${p.lender}` : `Investment ${i + 1}`} value={p.value} debt={p.debt} equity={p.equity80} />
            ))}
            <div style={{ height: 1, background: C.grey, opacity: 0.4, margin: "6px 0" }} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "14px 0 8px" }}>
              <span style={{ fontFamily: F.body, fontWeight: 600, fontSize: 16, color: C.charcoal }}>Usable equity at 80% LVR</span>
              <span className="news-h3" style={{ fontFamily: F.display, fontWeight: 400, fontSize: "clamp(1.3125rem, 0.875vw + 1rem, 1.875rem)", color: C.emerald }}>{fmtK(calc.totalUsableEquity80)}</span>
            </div>
          </div>
          <p style={{ fontFamily: F.body, fontSize: 15, lineHeight: 1.6, color: C.charcoal, marginTop: 14, maxWidth: 600 }}>
            That's roughly <strong style={{ fontWeight: 600 }}>{Math.floor(calc.totalUsableEquity80 / Math.max(1, calc.depositPerProp))}</strong> of
            the {calc.propertiesNeeded} deposit{calc.propertiesNeeded === 1 ? "" : "s"} you need, available without saving another dollar — if it suits your plan to use it.
          </p>
          <SourceLine>Usable equity = (property value × 80%) − loan balance, per property. Actual borrowing depends on servicing and each lender's policy.</SourceLine>
        </>
      )}

      <div style={{ height: 1, background: C.grey, opacity: 0.4, margin: "32px 0" }} />

      {d.ownsHome === "yes" && (
        <Field label="Pay off your home, or build passive income?" hint="Paying it off gives certainty and no rent. Building income compounds faster but carries debt longer. Most plans blend the two — the choice is yours.">
          <Choice value={d.homePriority} onChange={(v) => set("homePriority", v)}
            options={[{ value: "payoff", label: "Pay off our home first" }, { value: "passive", label: "Build passive income" }]} />
        </Field>
      )}
      <Field label="What's the tougher constraint right now?" hint="Borrowing power tracks income directly. If servicing is the blocker, income is the lever. If deposit is the blocker, savings and releasing equity are the levers.">
        <Choice value={d.blocker} onChange={(v) => set("blocker", v)}
          options={[{ value: "deposit", label: "Saving a deposit" }, { value: "servicing", label: "Borrowing power" }, { value: "both", label: "Both" }]} />
      </Field>
      <Insight blocker={d.blocker} d={d} calc={calc} />

      <Field label="Beyond retirement income, what else matters?" hint="Pick any that apply — these shape the order things happen in.">
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {goalOpts.map((g) => {
            const on = d.goals.includes(g);
            return (
              <button key={g} onClick={() => toggleGoal(g)} style={{ padding: "11px 16px", borderRadius: 999, border: `1px solid ${on ? C.emerald : C.grey}`, background: on ? C.emerald : C.paper, color: on ? C.paper : C.charcoal, fontSize: 15, fontWeight: 500, cursor: "pointer", fontFamily: F.body, transition: `background .9s ${EASE}, color .9s ${EASE}` }}>{g}</button>
            );
          })}
        </div>
      </Field>

      <div style={{ background: C.lighterMint, borderRadius: 24, padding: "clamp(15px, 3.5vw, 28px) clamp(15px, 3.5vw, 28px)", marginTop: 16 }}>
        <h3 className="news-h3" style={{ fontFamily: F.display, fontWeight: 400, fontSize: "clamp(1.1875rem, 0.5vw + 1rem, 1.625rem)", color: C.emerald, margin: "0 0 14px" }}>Your path, in one line</h3>
        <p style={{ fontSize: 16, lineHeight: 1.7, color: C.charcoal, margin: 0 }}>
          Acquire <strong style={{ fontWeight: 600 }}>{calc.propertiesNeeded} {calc.propertiesNeeded === 1 ? "property" : "properties"}</strong> over <strong style={{ fontWeight: 600 }}>{calc.years} years</strong>, needing about <strong style={{ fontWeight: 600 }}>{fmtK(calc.totalDepositsNeeded)}</strong> in deposits, to lift passive income from <strong style={{ fontWeight: 600 }}>{fmtK(calc.trajectoryPassive)}</strong> to <strong style={{ fontWeight: 600 }}>{fmt(calc.needTotal)}</strong> a year
          {d.ownsHome === "yes" && <>{" "}— {d.homePriority === "payoff" ? "with your home fully paid off" : "while using your home equity to move faster"}</>}.
        </p>
        {d.goals.length > 0 && <p style={{ fontSize: 14, color: C.charcoal, opacity: 0.85, marginTop: 12, marginBottom: 0 }}>Sequenced around what matters to you: {d.goals.join(" · ")}.</p>}
      </div>

      <div style={{ display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap", marginTop: 28 }}>
        <Btn variant="primary" onClick={() => {}}>When you're ready, talk to a partner</Btn>
        <TextLink onClick={() => {}}>See how the access works</TextLink>
      </div>
      <p style={{ fontFamily: F.body, fontSize: 13, color: C.charcoal, marginTop: 18, maxWidth: 620, lineHeight: 1.5 }}>
        This is an educational projection, not financial advice. The numbers are indicative and depend on assumptions you can change. You're in charge of every decision here.
      </p>
    </div>
  );
}

// ---------- ASSUMPTIONS & TERMS ----------
function ScreenTerms({ d, calc }) {
  const rows = [
    ["Capital growth", `${d.futureGrowth}% p.a.`, "Applied to all property values. Default is a conservative 5%."],
    ["Rental yield (new builds)", "4% gross", "Used for income and the negative-gearing position on new acquisitions."],
    ["Deposit + costs per purchase", "≈ 19%", "10% deposit, stamp duty on the land only (house-and-land), plus LMI. Loan is ~90% of price."],
    ["Loan structure (new buys)", "5 yrs IO, then P&I", "Interest only for the first 5 years for cashflow, then principal & interest — debt starts reducing."],
    ["Income growth", `${(INCOME_GROWTH * 100).toFixed(1)}% p.a.`, "Assumed pay growth, which lifts borrowing capacity over the plan."],
    ["Borrowing capacity", "≈ 6 × income", "Assessable income = gross income + 80% of rental income (existing and new). Existing loans reduce headroom."],
    ["Equity release", "to 80% LVR", "Usable equity = (property value × 80%) − loan balance, per property."],
    ["Depreciation (new builds)", "≈ 2% p.a.", "Of build value, claimed against income. New property only."],
    ["Super contributions", "≈ 12% of income", "Employer SG-style contribution on combined household income."],
    ["Super return", `${d.superReturn}% p.a.`, "Applied to the combined starting balance and contributions."],
    ["Inflation benchmark", `${d.inflationBenchmark}% p.a.`, "Australian CPI has averaged roughly this over the last five years."],
    ["CGT discount", "50% after 12 months", "And the strategy assumes a 15+ year hold so assets are well past this threshold at sale."],
    ["Loan term assumption", "25 years remaining", "Used when amortising principal & interest loans."],
    ["Tax rates", "FY2025–26 resident", "Includes the 2% Medicare levy. Company tax at 25% for business owners."],
    ["Annual household expenses", `${fmtK(d.annualExpenses || 100000)}/yr`, "Living costs outside the mortgage — editable. Australian family households sit around $100k–$110k a year."],
    ["Selling costs (home sale)", "~2% of sale + $50k", "Agent fees, legals and pre-sale improvements — standard rules of thumb when modelling a sell-down."],
    ["Median capital city house", "~$1.15M (early 2026)", "CoreLogic 8-capital median, grown at your future-growth assumption. Used to gauge what selling could buy."],
  ];
  return (
    <div>
      <ScreenHead
        eyebrow="Your plan · 3 of 3"
        title="Assumptions & terms"
        lede="Every number in this tool rests on the assumptions below. They're shown in full so you can check the working and change anything that doesn't fit your situation."
      />

      <div style={{ background: C.lighterMint, borderRadius: 24, padding: "clamp(8px, 3.5vw, 8px) clamp(14px, 3.5vw, 24px)" }}>
        {rows.map(([label, value, note], i) => (
          <div key={i} style={{ padding: "16px 0", borderBottom: i < rows.length - 1 ? `1px solid ${C.grey}33` : "none" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 16 }}>
              <span style={{ fontFamily: F.body, fontWeight: 600, fontSize: 16, color: C.charcoal }}>{label}</span>
              <span style={{ fontFamily: F.body, fontWeight: 600, fontSize: 16, color: C.emerald, whiteSpace: "nowrap" }}>{value}</span>
            </div>
            <div style={{ fontFamily: F.body, fontSize: 14, color: C.charcoal, opacity: 0.8, lineHeight: 1.5, marginTop: 4, maxWidth: 560 }}>{note}</div>
          </div>
        ))}
      </div>

      <Eyebrow rule>Terms</Eyebrow>
      <div style={{ fontFamily: F.body, fontSize: 15, lineHeight: 1.7, color: C.charcoal }}>
        <p style={{ marginTop: 0 }}>
          This tool is <strong style={{ fontWeight: 600 }}>educational</strong>. It is general information only and is not financial, tax, credit or legal advice. It does not consider your full personal circumstances, and nothing here is a recommendation to buy, sell or borrow.
        </p>
        <p>
          Every figure is an <strong style={{ fontWeight: 600 }}>indicative projection</strong>, not a forecast or a guarantee. Real outcomes depend on markets, interest rates, lender policy, your circumstances and decisions you make. Property values can fall as well as rise. Borrowing capacity shown here is a simplified rule of thumb — actual capacity is set by each lender's assessment, not by this tool.
        </p>
        <p>
          Tax treatment, including negative gearing, depreciation and capital gains, depends on your individual situation and current law, both of which can change. Figures hold income, rates and tax settings flat unless you change them, which keeps the picture simple but means the future will differ.
        </p>
        <p style={{ marginBottom: 0 }}>
          Before acting on anything here, speak with a licensed professional who can look at your full position. When you're ready, a partner can model your exact numbers with you — the decision, the timing and the commitment always stay yours.
        </p>
      </div>

      <div style={{ marginTop: 28, display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
        <Btn variant="primary" onClick={() => {}}>When you're ready, talk to a partner</Btn>
        <TextLink onClick={() => {}}>See how the access works</TextLink>
      </div>
    </div>
  );
}

// ---------- small shared helpers ----------
function CalloutQuiet({ children }) {
  return (
    <div style={{ background: C.mint, borderRadius: 14, padding: "18px 20px", marginTop: 8, fontFamily: F.body, fontSize: 16, lineHeight: 1.6, color: C.emerald }}>
      {children}
    </div>
  );
}
function DualNote({ calc, d }) {
  if (!(d.employment === "payg" && d.incomeMode === "dual")) return null;
  const combined = (d.income || 0) + (d.income2 || 0);
  const saving = incomeTaxPAYG(combined) - calc.taxPaid;
  if (saving <= 100) return null;
  return (
    <div style={{ background: C.mint, borderRadius: 14, padding: "16px 18px", marginTop: 14, fontFamily: F.body, fontSize: 15, lineHeight: 1.6, color: C.emerald }}>
      Splitting that across two earners keeps about {fmt(saving)} a year more than one person earning {fmtK(combined)} — each income has its own tax-free threshold and lower brackets.
    </div>
  );
}

// Tiny header indicator: "Saving…" while debounce window or network in flight,
// "All saved" briefly after success, "Save failed" on error. Designed to be
// quiet — reassurance, not noise.
function SaveIndicator({ status }) {
  if (status === "idle") return null;
  const palette =
    status === "saving" ? { bg: `${C.grey}20`, color: C.grey, label: "Saving…" }
    : status === "saved" ? { bg: C.lighterMint, color: C.emerald, label: "✓ All saved" }
    : status === "error" ? { bg: "#F8E5E1", color: C.negative, label: "Save failed — will retry" }
    : null;
  if (!palette) return null;
  return (
    <span style={{
      fontFamily: F.body, fontWeight: 500, fontSize: 11, letterSpacing: "0.04em",
      color: palette.color, background: palette.bg,
      padding: "4px 10px", borderRadius: 999, lineHeight: 1.2,
    }}>
      {palette.label}
    </span>
  );
}

function Lockup() {
  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
      <span style={{ fontFamily: F.body, fontWeight: 700, fontSize: 22, color: C.emerald, lineHeight: 1 }}>
        h
      </span>
      <span style={{ fontFamily: F.body, fontSize: 17, color: C.emerald, lineHeight: 1 }}>
        <span style={{ fontWeight: 700 }}>help me</span>
        <span style={{ fontWeight: 500 }}> invest</span>
      </span>
    </div>
  );
}

// ============================================================
// STEP 0 — WHERE YOU STAND (self assessment)

function Insight({ blocker, d, calc }) {
  let msg;
  if (blocker === "servicing" || blocker === "both") {
    if (d.employment === "business") {
      msg = `Borrowing power follows your income. As a business owner, you decide how you're paid — lifting your declared salary (currently ${fmt(d.bizSalary || 0)}) raises your assessable income and what you can borrow, at the cost of more personal tax. That trade-off is the lever.`;
    } else if (d.incomeMode === "dual") {
      msg = `Borrowing power tracks income directly, and you already have two incomes on the application — most lenders assess both. On a combined ${fmt((d.income || 0) + (d.income2 || 0))} gross, more capacity comes from income growth on either income or reducing other commitments.`;
    } else {
      msg = `Borrowing power tracks your income directly. On ${fmt(d.income || 0)} gross, more capacity comes from income growth, reducing other commitments, or — if there's a second earner in the household — adding their income to the application.`;
    }
  } else {
    const yrs = Math.ceil((calc.depositPerProp || 0) / Math.max(1, d.annualSavings || 1));
    msg = `The deposit is the constraint. You're saving ${fmt(d.annualSavings || 0)} a year — at that rate, a single deposit takes about ${yrs} ${yrs === 1 ? "year" : "years"} from savings alone. Releasing equity from property you already own is usually the faster path.`;
  }
  return (
    <div style={{ marginTop: 16, padding: "16px 18px", background: C.mint, borderRadius: 14, fontSize: 15, lineHeight: 1.6, color: C.emerald }}>
      {msg}
    </div>
  );
}

// ------------------------------------------------------------
// Editorial primitives
// ------------------------------------------------------------
function Eyebrow({ children, rule }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: rule ? 18 : 12 }}>
      <span style={{ width: 32, height: 1, background: C.grey }} />
      <span style={{ fontFamily: F.body, fontWeight: 500, fontSize: 13, letterSpacing: "0.02em", textTransform: "uppercase", color: C.grey }}>
        {children}
      </span>
    </div>
  );
}

// H1 with optional italic-within-Newsreader emphasis (Section 3d)
function H1({ children, emphasis }) {
  let content = children;
  if (emphasis && typeof children === "string" && children.includes(emphasis)) {
    const [a, b] = children.split(emphasis);
    content = (
      <>
        {a}
        <span style={{ fontStyle: "italic", fontWeight: 300 }}>{emphasis}</span>
        {b}
      </>
    );
  }
  return (
    <h1
      className="news-h1"
      style={{
        fontFamily: F.display,
        fontWeight: 400,
        fontSize: "clamp(36px, 4vw, 52px)",
        lineHeight: 1.08,
        letterSpacing: "-0.025em",
        color: C.emerald,
        margin: "0 0 4px",
        textWrap: "balance",
        maxWidth: 760,
      }}
    >
      {content}
    </h1>
  );
}

function Lede({ children }) {
  return (
    <p style={{ fontFamily: F.body, fontSize: 19, lineHeight: 1.55, color: C.charcoal, marginTop: 16, maxWidth: 640 }}>
      {children}
    </p>
  );
}

function Rule() {
  return <div style={{ height: 1, background: C.grey, opacity: 0.4, margin: "32px 0" }} />;
}

function Group({ title, children }) {
  return (
    <section style={{ marginBottom: 8 }}>
      {title && <Eyebrow>{title}</Eyebrow>}
      {children}
    </section>
  );
}

function Two({ children }) {
  return (
    <div className="hmi-two">
      {children}
    </div>
  );
}

// ---------- CHART PRIMITIVES (grade-7 readable, on-brand, no deps) ----------

// A clean pie chart with labelled wedges and a centred big number.
// slices: [{ label, value, color }]
function PieChart({ slices, centerLabel, centerValue, size = 280 }) {
  const total = slices.reduce((a, s) => a + Math.max(0, s.value), 0);
  if (total <= 0) return null;
  const cx = size / 2, cy = size / 2;
  const r = size * 0.42, rInner = size * 0.26;
  let angle = -Math.PI / 2; // start at top
  const arcs = slices.map((s) => {
    const a0 = angle;
    const sweep = (Math.max(0, s.value) / total) * Math.PI * 2;
    angle += sweep;
    const a1 = angle;
    const x0 = cx + Math.cos(a0) * r, y0 = cy + Math.sin(a0) * r;
    const x1 = cx + Math.cos(a1) * r, y1 = cy + Math.sin(a1) * r;
    const xi0 = cx + Math.cos(a0) * rInner, yi0 = cy + Math.sin(a0) * rInner;
    const xi1 = cx + Math.cos(a1) * rInner, yi1 = cy + Math.sin(a1) * rInner;
    const large = sweep > Math.PI ? 1 : 0;
    // labelling: midpoint angle
    const mid = (a0 + a1) / 2;
    const lx = cx + Math.cos(mid) * (r * 1.18);
    const ly = cy + Math.sin(mid) * (r * 1.18);
    const pct = Math.round((s.value / total) * 100);
    return {
      d: `M ${x0} ${y0} A ${r} ${r} 0 ${large} 1 ${x1} ${y1} L ${xi1} ${yi1} A ${rInner} ${rInner} 0 ${large} 0 ${xi0} ${yi0} Z`,
      color: s.color, label: s.label, pct, value: s.value, lx, ly,
      anchor: Math.cos(mid) > 0.1 ? "start" : Math.cos(mid) < -0.1 ? "end" : "middle",
    };
  });
  return (
    <div style={{ display: "flex", justifyContent: "center", padding: "8px 0" }}>
      <svg viewBox={`0 0 ${size + 120} ${size + 40}`} style={{ width: "100%", maxWidth: 480, height: "auto" }}>
        <g transform={`translate(60, 20)`}>
          {arcs.map((a, i) => (
            <g key={i}>
              <path d={a.d} fill={a.color} />
              {a.pct >= 6 && (
                <text x={a.lx} y={a.ly} fill={C.charcoal} fontSize="13" fontFamily="Plus Jakarta Sans, sans-serif" fontWeight="600" textAnchor={a.anchor} dominantBaseline="middle">
                  {a.label} <tspan fontWeight="500" opacity="0.7">{a.pct}%</tspan>
                </text>
              )}
            </g>
          ))}
          {centerValue && (
            <>
              <text x={cx} y={cy - 6} fill={C.emerald} fontSize="11" fontFamily="Plus Jakarta Sans, sans-serif" fontWeight="500" letterSpacing="0.04em" textAnchor="middle" style={{ textTransform: "uppercase" }}>{centerLabel}</text>
              <text x={cx} y={cy + 18} fill={C.emerald} fontSize="24" fontFamily="Newsreader, serif" fontWeight="400" textAnchor="middle">{centerValue}</text>
            </>
          )}
        </g>
      </svg>
    </div>
  );
}

// Two horizontal bars — "before" (red) and "after" (emerald). The point is
// the gap between them, not precise values. Used on every optimisation.
function BeforeAfterBars({ beforeLabel, beforeValue, beforeText, afterLabel, afterValue, afterText, suffix }) {
  const max = Math.max(beforeValue, afterValue, 1);
  const bw = (beforeValue / max) * 100;
  const aw = (afterValue / max) * 100;
  return (
    <div style={{ padding: "8px 0" }}>
      <div style={{ marginBottom: 18 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
          <span style={{ fontFamily: F.body, fontSize: 13, fontWeight: 500, color: C.negative, letterSpacing: "0.02em", textTransform: "uppercase" }}>{beforeLabel}</span>
          <span style={{ fontFamily: F.body, fontSize: 14, fontWeight: 600, color: C.negative }}>{beforeText}</span>
        </div>
        <div style={{ background: "#F8E5E1", borderRadius: 999, height: 22, overflow: "hidden" }}>
          <div style={{ width: `${bw}%`, height: "100%", background: C.negative, borderRadius: 999 }} />
        </div>
      </div>
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
          <span style={{ fontFamily: F.body, fontSize: 13, fontWeight: 500, color: C.emerald, letterSpacing: "0.02em", textTransform: "uppercase" }}>{afterLabel}</span>
          <span style={{ fontFamily: F.body, fontSize: 14, fontWeight: 600, color: C.emerald }}>{afterText}</span>
        </div>
        <div style={{ background: C.lighterMint, borderRadius: 999, height: 22, overflow: "hidden" }}>
          <div style={{ width: `${aw}%`, height: "100%", background: C.emerald, borderRadius: 999 }} />
        </div>
      </div>
    </div>
  );
}

// A wedge legend that pairs with PieChart. Pass slices same as the pie.
function PieLegend({ slices }) {
  const total = slices.reduce((a, s) => a + Math.max(0, s.value), 0);
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, marginTop: 14 }}>
      {slices.map((s, i) => {
        const pct = total > 0 ? Math.round((s.value / total) * 100) : 0;
        return (
          <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
            <div style={{ width: 14, height: 14, borderRadius: 4, background: s.color, flexShrink: 0, marginTop: 4 }} />
            <div style={{ flex: "1 1 auto" }}>
              <div style={{ fontFamily: F.body, fontSize: 14, fontWeight: 600, color: C.charcoal }}>{s.label}</div>
              <div style={{ fontFamily: F.body, fontSize: 13, color: C.charcoal, opacity: 0.75 }}>
                {fmtK(s.value)} <span style={{ opacity: 0.6 }}>· {pct}%</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// A "hero stat" — one massive number with a label above and a caption below.
// The Hormozi punchline pattern.
// Five day-of-the-week blocks, with the first `mortgageDays` rendered as
// "going to the bank" and the remainder as "yours". Used in the bottom-line
// closer on the Opportunities screen.
function DaysWeekStrip({ totalDays = 5, mortgageDays = 0 }) {
  const names = ["MON", "TUE", "WED", "THU", "FRI"];
  return (
    <div style={{ display: "flex", gap: 8 }}>
      {Array.from({ length: totalDays }).map((_, i) => {
        // proportion of this day taken by mortgage (0-1)
        const portion = Math.max(0, Math.min(1, mortgageDays - i));
        return (
          <div key={i} style={{ flex: 1, minWidth: 0 }}>
            <div style={{ position: "relative", height: 78, background: C.mint, borderRadius: 10, overflow: "hidden", border: `1px solid ${C.paper}33` }}>
              {portion > 0 && (
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: `${portion * 100}%`, background: C.negative }} />
              )}
              <div style={{ position: "absolute", left: 0, right: 0, bottom: 6, textAlign: "center", fontFamily: F.body, fontWeight: 600, fontSize: 11, letterSpacing: "0.06em", color: portion > 0.6 ? C.paper : C.emerald }}>
                {names[i] || `D${i + 1}`}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// The identity moment — a real, calibrated 0-100 score that summarises the
// user's financial trajectory in one number. Used as both a diagnostic readout
// and a commitment device: once people have a "type", they want to change it.
function WealthVelocityCard({ score, grade, type, color, firstName }) {
  // Arc from 0 (left, at the bottom) to 100 (right, at the bottom), top semicircle
  const cx = 140, cy = 130, r = 100;
  const angle = Math.PI - (score / 100) * Math.PI; // 180° to 0°
  const px = cx + Math.cos(angle) * r;
  const py = cy - Math.sin(angle) * r;
  const trackPath = `M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`;
  const fillPath = `M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${px} ${py}`;
  return (
    <div className="hmi-panel-md" style={{ background: C.paper, border: `1px solid ${C.grey}30`, borderRadius: 24, marginBottom: 24 }}>
      <div className="hmi-flex-stack-mobile">
        <div style={{ flex: "0 0 auto", maxWidth: "100%" }}>
          <svg viewBox={`0 0 280 160`} style={{ width: "100%", maxWidth: 240, height: "auto", display: "block" }}>
            <path d={trackPath} stroke={`${C.grey}30`} strokeWidth="18" fill="none" strokeLinecap="round" />
            <path d={fillPath} stroke={color} strokeWidth="18" fill="none" strokeLinecap="round" />
            <text x={cx} y={cy - 24} fill={color} fontSize="56" fontFamily="Newsreader, serif" fontWeight="400" textAnchor="middle">{score}</text>
            <text x={cx} y={cy + 4} fill={C.charcoal} fontSize="11" fontFamily="Plus Jakarta Sans, sans-serif" fontWeight="500" textAnchor="middle" opacity="0.6" letterSpacing="0.1em">OUT OF 100</text>
          </svg>
        </div>
        <div style={{ flex: "1 1 280px", minWidth: 0 }}>
          <div style={{ fontFamily: F.body, fontWeight: 500, fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: C.emerald, opacity: 0.75, marginBottom: 8 }}>
            {firstName ? `${firstName}, your` : "Your"} Wealth Velocity Score
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 14, marginBottom: 10 }}>
            <div className="news-h1" style={{ fontFamily: F.display, fontWeight: 400, fontSize: "clamp(2rem, 2.5vw + 1rem, 3.5rem)", color, lineHeight: 1 }}>{grade}</div>
            <div style={{ fontFamily: F.body, fontWeight: 600, fontSize: 18, color: C.charcoal }}>{type}</div>
          </div>
          <p style={{ fontFamily: F.body, fontSize: 14, color: C.charcoal, opacity: 0.85, lineHeight: 1.6, margin: 0, maxWidth: 380 }}>
            {grade === "A" && "You're rare. The maths is on your side. The question now is what to do with the surplus."}
            {grade === "B" && "Close. Real assets, real momentum — but specific levers untapped. The full plan finds them."}
            {grade === "C" && "Coasting. Not in trouble, not ahead. You're paying tax and interest your peers have learned how to redirect."}
            {grade === "D" && "The engine isn't built yet. Same income, same household, completely different outcome with three specific moves."}
            {grade === "F" && "You're not behind because you did anything wrong. You're behind because no one ever showed you the picture you're about to see."}
          </p>
        </div>
      </div>
    </div>
  );
}

// Where the household sits in the national distribution, with a peer (age)
// comparison line and a small horizontal bar showing their dot on the curve.
// Pure social-comparison lever, anchored to ABS data with a footnote.
function PercentileReadout({ calc, d }) {
  const pct = calc.nationalPercentile;
  // Distribution markers at P10 .. P90 for the bar
  const markers = [10, 25, 50, 75, 90];
  return (
    <div className="hmi-panel-md" style={{ background: C.paper, border: `1px solid ${C.grey}30`, borderRadius: 24, marginBottom: 24 }}>
      <div className="hmi-flex-stack-mobile" style={{ marginBottom: 22 }}>
        <div style={{ flex: "1 1 280px" }}>
          <div style={{ fontFamily: F.body, fontWeight: 500, fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: C.emerald, opacity: 0.75, marginBottom: 8 }}>
            {d.firstName ? `${d.firstName}, where` : "Where"} you sit nationally
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 10 }}>
            <div className="news-d" style={{ fontFamily: F.display, fontWeight: 400, fontSize: "clamp(2.25rem, 3.5vw + 1rem, 4rem)", color: C.emerald, lineHeight: 1 }}>P{pct}</div>
            <div style={{ fontFamily: F.body, fontSize: 14, color: C.charcoal, opacity: 0.75 }}>
              of Australian households
            </div>
          </div>
          <p style={{ fontFamily: F.body, fontSize: 14, color: C.charcoal, opacity: 0.85, lineHeight: 1.6, margin: 0 }}>
            {pct >= 90 && <>Top decile. Real wealth. The question now is what you do with the surplus.</>}
            {pct >= 75 && pct < 90 && <>Top quartile. You're ahead of three in every four Australian households. Outperforming on absolutes — but most users at this level still aren't deploying capital efficiently.</>}
            {pct >= 50 && pct < 75 && <>Above the national median. Comfortable by raw numbers — but "above the middle" in Australia hasn't been enough for a comfortable retirement for over a decade.</>}
            {pct >= 25 && pct < 50 && <>Below the national median. You're behind half of Australian households on raw net worth. The compounding gap from here only widens unless something changes.</>}
            {pct < 25 && <>Bottom quartile. You're behind three in every four households — and at this position, the age pension does most of the heavy lifting in retirement unless this changes.</>}
          </p>
        </div>
        <div style={{ flex: "0 0 auto", textAlign: "right" }}>
          <div style={{ fontFamily: F.body, fontWeight: 500, fontSize: 11, letterSpacing: "0.06em", textTransform: "uppercase", color: C.emerald, opacity: 0.7 }}>
            Median for {calc.ageBandLabel}
          </div>
          <div className="news-h3" style={{ fontFamily: F.display, fontWeight: 400, fontSize: "clamp(1.1875rem, 0.5vw + 1rem, 1.625rem)", color: C.charcoal, marginTop: 4, lineHeight: 1 }}>
            {fmtK(calc.ageMedian)}
          </div>
          <div style={{ fontFamily: F.body, fontSize: 13, color: calc.aboveAgeMedian ? C.emerald : C.negative, fontWeight: 600, marginTop: 6 }}>
            {calc.aboveAgeMedian ? "+" : ""}{calc.ageGapPct}% {calc.aboveAgeMedian ? "above" : "below"} median for your age
          </div>
        </div>
      </div>

      {/* The distribution bar */}
      <div style={{ position: "relative", height: 56, marginTop: 8 }}>
        <div style={{ position: "absolute", left: 0, right: 0, top: 22, height: 12, borderRadius: 999, background: `linear-gradient(to right, ${C.negative}40 0%, #FAE5D9 25%, ${C.lighterMint} 50%, ${C.mint} 75%, ${C.emerald} 100%)` }} />
        {markers.map((m) => (
          <div key={m} style={{ position: "absolute", left: `${m}%`, top: 16, transform: "translateX(-50%)" }}>
            <div style={{ width: 2, height: 24, background: C.charcoal, opacity: 0.25 }} />
            <div style={{ fontFamily: F.body, fontSize: 10, color: C.charcoal, opacity: 0.6, marginTop: 4, textAlign: "center", transform: "translateX(-50%)", marginLeft: 1, position: "absolute", left: 1 }}>
              P{m}
            </div>
          </div>
        ))}
        {/* user's dot */}
        <div style={{ position: "absolute", left: `${Math.min(98, Math.max(2, pct))}%`, top: 14, transform: "translateX(-50%)" }}>
          <div style={{ width: 28, height: 28, borderRadius: "50%", background: C.emerald, border: `4px solid ${C.paper}`, boxShadow: `0 0 0 2px ${C.emerald}` }} />
        </div>
      </div>

      <div style={{ fontFamily: F.body, fontSize: 12, color: C.grey, marginTop: 18, lineHeight: 1.5 }}>
        Source: {calc.ABS_RELEASE_NOTE}.
      </div>
    </div>
  );
}

// ---- RENTER-SPECIFIC PANELS ----

// The Renter Trap — for users renting with NO investment property exposure.
// Honest, sourced wake-up: rentflation vs wage growth, personal projection,
// total rent paid over working life, and the post-retirement squeeze.
function RenterTrapPanel({ d, calc }) {
  const rentDoubleYears = Math.log(2) / Math.log(1 + (calc.RENT_GROWTH || 0.04));
  return (
    <div style={{ background: C.paper, border: `1px solid ${C.grey}30`, borderRadius: 24, padding: "clamp(16px, 3.5vw, 30px) clamp(15px, 3.5vw, 28px)", marginBottom: 24 }}>
      <div style={{ fontFamily: F.body, fontWeight: 500, fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: C.negative, marginBottom: 10 }}>
        Renting without property exposure
      </div>
      <h3 className="news-h1" style={{ fontFamily: F.display, fontWeight: 400, fontSize: "clamp(1.5rem, 1.25vw + 1rem, 2.25rem)", color: C.emerald, margin: "0 0 16px", lineHeight: 1.15 }}>
        Renting is paying a mortgage. <em style={{ fontStyle: "italic" }}>Just not yours.</em>
      </h3>
      <p style={{ fontFamily: F.body, fontSize: 16, color: C.charcoal, lineHeight: 1.65, margin: "0 0 24px", maxWidth: 600 }}>
        {d.firstName ? `${d.firstName}, here's ` : "Here's "}what nobody puts in a graph for you. Renting is fine — useful, even — <strong style={{ fontWeight: 700 }}>as long as you own property somewhere else</strong>. Renting with zero exposure to real estate is the number-one way Australians retire broke. The maths is brutal in a way that compounds quietly until it's too late to fix.
      </p>

      {/* The rent-vs-wages divergence — national data */}
      <div style={{ background: "#FCEFE8", border: `1px solid ${C.negative}30`, borderRadius: 16, padding: "22px 22px", marginBottom: 18 }}>
        <div style={{ fontFamily: F.body, fontWeight: 500, fontSize: 11, letterSpacing: "0.06em", textTransform: "uppercase", color: C.negative, marginBottom: 12 }}>
          The last 5 years — Australia-wide
        </div>
        <BeforeAfterBars
          beforeLabel="Wage growth"
          beforeValue={calc.WAGE_GROWTH_HISTORICAL_5Y * 100}
          beforeText={`+${(calc.WAGE_GROWTH_HISTORICAL_5Y * 100).toFixed(1)}% over 5 years`}
          afterLabel="Rent growth"
          afterValue={calc.RENT_GROWTH_HISTORICAL_5Y * 100}
          afterText={`+${(calc.RENT_GROWTH_HISTORICAL_5Y * 100).toFixed(1)}% over 5 years`}
        />
        <p style={{ fontFamily: F.body, fontSize: 14, color: C.charcoal, lineHeight: 1.65, marginTop: 16, marginBottom: 0, maxWidth: 560 }}>
          Rents grew <strong style={{ fontWeight: 700 }}>2.5 times faster than wages</strong>. The gap between what you earn and what you have to pay just to live somewhere has never been wider. Source: {calc.RENT_DATA_NOTE}.
        </p>
      </div>

      {/* Personal rent projection */}
      {calc.rentAnnualNow > 0 && (
        <div style={{ background: "#FCEFE8", border: `1px solid ${C.negative}30`, borderRadius: 16, padding: "22px 22px", marginBottom: 18 }}>
          <div style={{ fontFamily: F.body, fontWeight: 500, fontSize: 11, letterSpacing: "0.06em", textTransform: "uppercase", color: C.negative, marginBottom: 12 }}>
            Your rent, on the same trajectory
          </div>
          <BeforeAfterBars
            beforeLabel="Today"
            beforeValue={calc.rentWeekNow}
            beforeText={`${fmtK(calc.rentWeekNow)} / wk · ${fmtK(calc.rentAnnualNow)} / yr`}
            afterLabel={`By the time you're ${d.retireAge}`}
            afterValue={calc.rentWeekAtRetirement}
            afterText={`${fmtK(calc.rentWeekAtRetirement)} / wk · ${fmtK(calc.rentAnnualAtRetirement)} / yr`}
          />
          <p style={{ fontFamily: F.body, fontSize: 14, color: C.charcoal, lineHeight: 1.65, marginTop: 16, marginBottom: 0, maxWidth: 560 }}>
            At a conservative 4% a year (well below recent reality), your rent roughly doubles every <strong style={{ fontWeight: 700 }}>{rentDoubleYears.toFixed(0)} years</strong>. Your landlord will retire on this. You won't.
          </p>
        </div>
      )}

      {/* Total rent over working life */}
      {calc.rentAnnualNow > 0 && (
        <div style={{ background: C.negative, color: C.paper, borderRadius: 16, padding: "clamp(14px, 3.5vw, 26px) clamp(14px, 3.5vw, 24px)", marginBottom: 18 }}>
          <div style={{ fontFamily: F.body, fontWeight: 500, fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: C.paper, opacity: 0.9, marginBottom: 10 }}>
            Total rent paid between now and {d.retireAge}
          </div>
          <div className="news-d" style={{ fontFamily: F.display, fontWeight: 400, fontSize: "clamp(2.25rem, 3.5vw + 1rem, 4rem)", color: C.paper, lineHeight: 1 }}>
            {fmtK(calc.totalRentToRetirement)}
          </div>
          <p style={{ fontFamily: F.body, fontSize: 15, color: C.paper, opacity: 0.95, lineHeight: 1.65, marginTop: 14, marginBottom: 0, maxWidth: 540 }}>
            Money you wave goodbye to. No equity. No tax deduction. No asset growing underneath you. <strong style={{ color: C.paper, fontWeight: 700 }}>That's a house. Sometimes two.</strong> Paid to your landlord, who used your rent to buy more property.
          </p>
        </div>
      )}

      {/* The squeeze — rent vs income */}
      {calc.rentPctIncomeToday > 0 && (
        <div style={{ background: C.lighterMint, borderRadius: 16, padding: "22px 22px", marginBottom: 18 }}>
          <div style={{ fontFamily: F.body, fontWeight: 500, fontSize: 11, letterSpacing: "0.06em", textTransform: "uppercase", color: C.emerald, marginBottom: 12 }}>
            The squeeze
          </div>
          <BeforeAfterBars
            beforeLabel="Rent as % of your income today"
            beforeValue={calc.rentPctIncomeToday}
            beforeText={`${calc.rentPctIncomeToday.toFixed(1)}%`}
            afterLabel={`Rent as % of your income at ${d.retireAge}`}
            afterValue={calc.rentPctIncomeAtRetirement}
            afterText={`${calc.rentPctIncomeAtRetirement.toFixed(1)}%`}
          />
          <p style={{ fontFamily: F.body, fontSize: 14, color: C.charcoal, lineHeight: 1.65, marginTop: 16, marginBottom: 0, maxWidth: 560 }}>
            Because rent grows faster than wages, every year you stay a pure renter, a bigger slice of every dollar you earn goes straight to a landlord. And in retirement — when you're on a fixed income or the pension — that slice doesn't shrink. It grows.
          </p>
        </div>
      )}

      {/* The pension reality */}
      <div style={{ background: C.negative, color: C.paper, borderRadius: 16, padding: "clamp(14px, 3.5vw, 26px) clamp(14px, 3.5vw, 24px)" }}>
        <h4 className="news-h3" style={{ fontFamily: F.display, fontWeight: 400, fontSize: 24, color: C.paper, margin: "0 0 12px", lineHeight: 1.25 }}>
          And here's the part no one wants to say out loud.
        </h4>
        <p style={{ fontFamily: F.body, fontSize: 15, color: C.paper, opacity: 0.95, lineHeight: 1.7, margin: 0 }}>
          The age pension assumes you own your home. Older Australians who rent in retirement have <strong style={{ color: C.paper, fontWeight: 700 }}>more than double the poverty rate</strong> of homeowners. They face annual rent rises while their income is fixed. Their landlords can sell or move them on with 90 days' notice. <strong style={{ color: C.paper, fontWeight: 700 }}>This is the single biggest predictor of retirement poverty in Australia.</strong>
        </p>
        <p style={{ fontFamily: F.body, fontSize: 15, color: C.paper, opacity: 0.95, lineHeight: 1.7, marginTop: 12, marginBottom: 0 }}>
          You don't need to live in the home you own. You just need to own one. That's rentvesting — live where you want, own where the maths works. The way out of the renter trap doesn't require giving up your lifestyle. It just requires getting some exposure to property, today.
        </p>
      </div>

      <div style={{ fontFamily: F.body, fontSize: 12, color: C.grey, marginTop: 16, lineHeight: 1.5 }}>
        National rent and wage figures: {calc.RENT_DATA_NOTE} (5 years to Sept 2025). Personal projection compounds your rent at 4% p.a. — a conservative figure, well below the 7.6% averaged across the last five years. Rent doubles roughly every {rentDoubleYears.toFixed(0)} years at this rate.
      </div>
    </div>
  );
}

// Rentvester acknowledgment — for users renting WITH investment property.
// They've made a deliberate choice; don't shame them. Validate the strategy,
// then point to optimisation as the real lever.
function RentvesterPanel({ d, calc }) {
  return (
    <div style={{ background: C.lighterMint, borderRadius: 24, padding: "clamp(15px, 3.5vw, 28px) clamp(15px, 3.5vw, 28px)", marginBottom: 24 }}>
      <div style={{ fontFamily: F.body, fontWeight: 500, fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: C.emerald, marginBottom: 10 }}>
        Rentvesting — the smart bit
      </div>
      <h3 className="news-h2" style={{ fontFamily: F.display, fontWeight: 400, fontSize: "clamp(1.3125rem, 0.875vw + 1rem, 1.875rem)", color: C.emerald, margin: "0 0 16px", lineHeight: 1.2 }}>
        {d.firstName ? `${d.firstName}, you're ` : "You're "}playing it right.
      </h3>
      <p style={{ fontFamily: F.body, fontSize: 16, color: C.charcoal, lineHeight: 1.7, margin: "0 0 16px", maxWidth: 600 }}>
        You're renting where you want to live and owning property where the maths actually works. That's rentvesting, and it's a legitimate, well-documented strategy. <strong style={{ fontWeight: 700 }}>You're not the renter who retires broke</strong> — you have property exposure, equity growing underneath you, and the lifestyle flexibility renting buys.
      </p>
      <p style={{ fontFamily: F.body, fontSize: 15, color: C.charcoal, lineHeight: 1.7, margin: "0 0 16px", maxWidth: 600 }}>
        Here's the question that matters from this point: <strong style={{ fontWeight: 700 }}>is your portfolio actually optimised?</strong> Most rentvesters we work with discover the lender structure is wrong, the tax position is leaving money on the table, or the property mix isn't doing the work it could. The strategy is right — the execution is where the report adds value.
      </p>
      <div style={{ background: C.paper, borderRadius: 14, padding: "16px 18px" }}>
        <div style={{ fontFamily: F.body, fontWeight: 500, fontSize: 13, color: C.emerald, marginBottom: 6 }}>
          Worth flagging
        </div>
        <p style={{ fontFamily: F.body, fontSize: 14, color: C.charcoal, lineHeight: 1.6, margin: 0 }}>
          Your rent of {fmtK(calc.rentAnnualNow)}/yr is still real money flowing out. If your portfolio compounds well, that's fine — the equity will catch up. If it doesn't, you're in the same trap as a pure renter, just slower. The {fmtK(calc.totalRentToRetirement)} you'll pay in rent between now and {d.retireAge} needs to be more than covered by the equity your investments build over the same period.
        </p>
      </div>
    </div>
  );
}

function HeroNumber({ eyebrow, value, caption, tone = "emerald" }) {
  const color = tone === "negative" ? C.negative : tone === "paper" ? C.paper : C.emerald;
  const eyebrowColor = tone === "paper" ? C.mint : tone === "negative" ? C.negative : C.emerald;
  return (
    <div style={{ padding: "10px 0" }}>
      {eyebrow && (
        <div style={{ fontFamily: F.body, fontWeight: 500, fontSize: 12, letterSpacing: "0.06em", textTransform: "uppercase", color: eyebrowColor, opacity: 0.85, marginBottom: 10 }}>
          {eyebrow}
        </div>
      )}
      <div className="news-d" style={{ fontFamily: F.display, fontWeight: 400, fontSize: "clamp(2.75rem, 4.5vw + 1.25rem, 5rem)", color, lineHeight: 0.95, letterSpacing: "-0.01em" }}>
        {value}
      </div>
      {caption && (
        <div style={{ fontFamily: F.body, fontSize: 15, color: tone === "paper" ? C.paper90 : C.charcoal, opacity: 0.8, marginTop: 12, maxWidth: 520, lineHeight: 1.55 }}>
          {caption}
        </div>
      )}
    </div>
  );
}

function BigStat({ label, value, sub, emphasis }) {
  return (
    <div
      style={{
        background: emphasis ? C.mint : C.lighterMint,
        borderRadius: 14,
        padding: "clamp(14px, 3.5vw, 22px) clamp(14px, 3.5vw, 24px)",
      }}
    >
      <div style={{ fontFamily: F.body, fontWeight: 500, fontSize: 13, letterSpacing: "0.02em", textTransform: "uppercase", color: C.emerald, opacity: 0.7, marginBottom: 8 }}>
        {label}
      </div>
      <div className="news-h2" style={{ fontFamily: F.display, fontWeight: 400, fontSize: "clamp(1.5rem, 1.25vw + 1rem, 2.375rem)", color: C.emerald, lineHeight: 1 }}>
        {value}
      </div>
      {sub && <div style={{ fontSize: 14, color: C.charcoal, marginTop: 8, lineHeight: 1.4 }}>{sub}</div>}
    </div>
  );
}

function MiniStat({ label, value, dark, accent }) {
  return (
    <div>
      <div style={{ fontFamily: F.body, fontWeight: 500, fontSize: 13, letterSpacing: "0.02em", textTransform: "uppercase", color: dark ? C.mint : C.grey, marginBottom: 7 }}>
        {label}
      </div>
      <div className="news-h2" style={{ fontFamily: F.display, fontWeight: 400, fontSize: 40, color: dark ? C.paper : C.emerald, lineHeight: 1 }}>
        {value}
      </div>
    </div>
  );
}

// The working week — a Mon–Fri strip segmented by where each day goes.
function WorkWeek({ calc }) {
  const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri"];
  // build ordered segments across 5 days
  const segs = [
    { key: "tax", label: "Tax", days: calc.days.tax, color: C.negative, fill: 0.85 },
    { key: "int", label: "Home interest", days: calc.days.homeInt, color: C.negative, fill: 0.55 },
    { key: "prin", label: "Home principal", days: calc.days.homePrin, color: C.grey, fill: 0.6 },
    { key: "left", label: "Earning for your life", days: calc.days.left, color: C.emerald, fill: 1 },
  ].filter((s) => s.days > 0.01);

  return (
    <div style={{ marginTop: 8 }}>
      {/* day grid background with the segmented overlay */}
      <div style={{ position: "relative", borderRadius: 14, overflow: "hidden", border: `1px solid ${C.grey}` }}>
        {/* segmented bar */}
        <div style={{ display: "flex", height: 86 }}>
          {segs.map((s) => (
            <div
              key={s.key}
              style={{
                width: `${(s.days / 5) * 100}%`,
                background: s.color,
                opacity: s.fill,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRight: `1px solid ${C.paper}`,
              }}
              title={`${s.label}: ${s.days.toFixed(2)} days`}
            >
              {s.days > 0.5 && (
                <span style={{ fontFamily: F.body, fontWeight: 500, fontSize: 12, color: C.paper, textAlign: "center", padding: "0 6px", lineHeight: 1.3 }}>
                  {s.days.toFixed(1)}d
                </span>
              )}
            </div>
          ))}
        </div>
        {/* day dividers + labels */}
        <div style={{ display: "flex", borderTop: `1px solid ${C.grey}` }}>
          {dayNames.map((d) => (
            <div
              key={d}
              style={{
                flex: 1,
                textAlign: "center",
                padding: "7px 0",
                fontFamily: F.body,
                fontWeight: 500,
                fontSize: 12,
                color: C.charcoal,
                borderRight: d !== "Fri" ? `1px solid ${C.grey}` : "none",
                opacity: 0.7,
              }}
            >
              {d}
            </div>
          ))}
        </div>
      </div>

      {/* legend */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "10px 20px", marginTop: 16 }}>
        {segs.map((s) => (
          <div key={s.key} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 12, height: 12, borderRadius: 3, background: s.color, opacity: s.fill, display: "inline-block" }} />
            <span style={{ fontFamily: F.body, fontSize: 14, color: C.charcoal }}>
              {s.label} — <strong style={{ fontWeight: 600 }}>{s.days.toFixed(1)} {s.days === 1 ? "day" : "days"}</strong>
            </span>
          </div>
        ))}
      </div>

      <p style={{ fontFamily: F.body, fontSize: 16, lineHeight: 1.6, color: C.charcoal, marginTop: 18, marginBottom: 0, maxWidth: 640 }}>
        That's <strong style={{ fontWeight: 600, color: C.negative }}>{calc.days.leak.toFixed(1)} days a week</strong> working
        purely to cover tax and home interest before you earn a dollar for yourself. The first day or so
        of every week — your Monday — is gone before it starts.
      </p>
    </div>
  );
}

// A single weekly-leak row. Negatives shown in functional red.
function LeakRow({ label, note, weekly, neutral, total }) {
  const color = neutral ? C.grey : total ? C.negative : C.negative;
  const sign = neutral ? "" : "−";
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 20, padding: "16px 0" }}>
      <div style={{ flex: "1 1 auto" }}>
        <div style={{ fontFamily: F.body, fontWeight: total ? 600 : 500, fontSize: total ? 17 : 16, color: C.charcoal }}>
          {label}
        </div>
        <div style={{ fontFamily: F.body, fontSize: 14, color: C.charcoal, opacity: 0.8, lineHeight: 1.5, marginTop: 3 }}>
          {note}
        </div>
      </div>
      <div
        className={total ? "news-h3" : ""}
        style={{
          fontFamily: total ? F.display : F.body,
          fontWeight: total ? 400 : 600,
          fontSize: total ? 30 : 20,
          color,
          whiteSpace: "nowrap",
        }}
      >
        {sign}{fmt(Math.abs(weekly))}<span style={{ fontSize: 13, opacity: 0.7, fontWeight: 500, fontFamily: F.body }}> /wk</span>
      </div>
    </div>
  );
}

// A property's usable-equity row in the report.
function EquityRow({ label, value, debt, equity }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 20, padding: "14px 0" }}>
      <div style={{ flex: "1 1 auto" }}>
        <div style={{ fontFamily: F.body, fontWeight: 500, fontSize: 16, color: C.charcoal }}>{label}</div>
        <div style={{ fontFamily: F.body, fontSize: 14, color: C.charcoal, opacity: 0.8, lineHeight: 1.5, marginTop: 3 }}>
          {fmtK(value)} value · {fmtK(debt)} owing
        </div>
      </div>
      <div style={{ fontFamily: F.body, fontWeight: 600, fontSize: 20, color: C.emerald, whiteSpace: "nowrap" }}>
        {fmtK(equity)}
      </div>
    </div>
  );
}

function LeakProjection({ label, value, emphasis }) {
  return (
    <div style={{ background: emphasis ? C.mint : C.lighterMint, borderRadius: 14, padding: "20px 22px" }}>
      <div style={{ fontFamily: F.body, fontWeight: 500, fontSize: 13, letterSpacing: "0.02em", textTransform: "uppercase", color: C.emerald, opacity: 0.7, marginBottom: 8 }}>
        {label}
      </div>
      <div className="news-h2" style={{ fontFamily: F.display, fontWeight: 400, fontSize: "clamp(1.375rem, 1vw + 1rem, 2.125rem)", color: C.negative, lineHeight: 1 }}>
        −{fmtK(value)}
      </div>
    </div>
  );
}

// The working week strip lives above; chart below.
function SourceLine({ children }) {
  return (
    <div style={{ fontFamily: F.body, fontSize: 14, color: C.grey, marginTop: 16, lineHeight: 1.5 }}>
      {children}
    </div>
  );
}

// Cumulative area chart — zero baseline, Emerald line, soft Mint fill.
// Honest axes: y always starts at 0, scale never manipulated (Section 6c).
// Stacked area chart — accumulating equity layers per acquisition (ref-style).
// Emerald-family tonal bands so newer properties read as lighter layers.
function StackedAreaChart({ series, caption, maxLayers = 12 }) {
  const W = 620, H = 240, padL = 52, padR = 12, padT = 14, padB = 30;
  const plotW = W - padL - padR, plotH = H - padT - padB;
  const n = series.length;
  const maxTotal = Math.max(1, ...series.map((s) => s.value)); // value = equity + debt stacked
  const sx = (i) => padL + (i / Math.max(1, n - 1)) * plotW;
  const sy = (v) => padT + plotH - (v / maxTotal) * plotH;

  const layerCount = Math.max(...series.map((s) => s.layers.length), 0);
  // tonal ramp from Emerald to Mint across layers
  const ramp = ["#0A4B34", "#13684A", "#1C8460", "#2FA078", "#5BB994", "#88CFB0", "#A8D5B4", "#C2E3CE", "#D4E8B5", "#E0EFCB", "#EAF4DC", "#F1F8E8"];

  // build cumulative band paths (equity layers stacked, then debt band on top)
  const bands = [];
  for (let li = 0; li < layerCount; li++) {
    const top = [], bot = [];
    for (let i = 0; i < n; i++) {
      let cum = 0;
      for (let k = 0; k <= li; k++) cum += series[i].layers[k]?.equity || 0;
      let cumBelow = 0;
      for (let k = 0; k < li; k++) cumBelow += series[i].layers[k]?.equity || 0;
      top.push([sx(i), sy(cum)]);
      bot.push([sx(i), sy(cumBelow)]);
    }
    const d = "M " + top.map((p) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" L ") +
      " L " + bot.reverse().map((p) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" L ") + " Z";
    bands.push({ d, color: ramp[li % ramp.length] });
  }
  // debt band (grey) sits above total equity up to total value
  const debtTop = [], debtBot = [];
  for (let i = 0; i < n; i++) {
    debtTop.push([sx(i), sy(series[i].value)]);
    debtBot.push([sx(i), sy(series[i].equity)]);
  }
  const debtPath = "M " + debtTop.map((p) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" L ") +
    " L " + debtBot.reverse().map((p) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" L ") + " Z";

  const yTicks = [0, maxTotal / 2, maxTotal];
  const xLabels = series.filter((_, i) => i % 2 === 0 || i === n - 1);

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", display: "block" }} role="img" aria-label={caption}>
        {yTicks.map((t, i) => (
          <g key={i}>
            <line x1={padL} y1={sy(t)} x2={W - padR} y2={sy(t)} stroke={C.grey} strokeWidth="1" opacity={i === 0 ? 0.5 : 0.18} />
            <text x={padL - 8} y={sy(t) + 4} fontFamily="'Plus Jakarta Sans',sans-serif" fontSize="11" fill={C.grey} textAnchor="end">{fmtK(t)}</text>
          </g>
        ))}
        {/* debt band first (behind), then equity layers on top */}
        <path d={debtPath} fill={C.grey} opacity="0.28" />
        {bands.map((b, i) => <path key={i} d={b.d} fill={b.color} opacity="0.92" />)}
        {/* total equity line */}
        <path d={"M " + series.map((s, i) => `${sx(i).toFixed(1)} ${sy(s.equity).toFixed(1)}`).join(" L ")} fill="none" stroke={C.emerald} strokeWidth="2" />
        {xLabels.map((s) => (
          <text key={s.year} x={sx(s.offset)} y={H - 9} fontFamily="'Plus Jakarta Sans',sans-serif" fontSize="10.5" fill={C.grey} textAnchor="middle">{s.year}</text>
        ))}
      </svg>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginTop: 10 }}>
        <Legend swatch={C.emerald} label="Equity (your wealth)" />
        <Legend swatch={C.grey} label="Debt (the bank's share)" faded />
      </div>
      {caption && <div style={{ fontFamily: F.body, fontSize: 13, color: C.grey, lineHeight: 1.45, marginTop: 8 }}>{caption}</div>}
    </div>
  );
}

function Legend({ swatch, label, faded }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <span style={{ width: 12, height: 12, borderRadius: 3, background: swatch, opacity: faded ? 0.4 : 1, display: "inline-block" }} />
      <span style={{ fontFamily: F.body, fontSize: 13, color: C.charcoal }}>{label}</span>
    </div>
  );
}

function AreaChart({ data, years, caption, tone }) {
  const stroke = tone === "negative" ? C.negative : C.emerald;
  const fill = tone === "negative" ? C.negative : C.mint;
  const fillOpacity = tone === "negative" ? 0.18 : 0.55;
  const W = 380, H = 150, padL = 8, padR = 8, padT = 10, padB = 26;
  const plotW = W - padL - padR, plotH = H - padT - padB;
  const maxY = Math.max(1, ...data.map((d) => d.y));
  const maxX = Math.max(1, years);
  const sx = (x) => padL + (x / maxX) * plotW;
  const sy = (y) => padT + plotH - (y / maxY) * plotH;

  const line = data.map((d, i) => `${i === 0 ? "M" : "L"} ${sx(d.x).toFixed(1)} ${sy(d.y).toFixed(1)}`).join(" ");
  const area = `${line} L ${sx(data[data.length - 1].x).toFixed(1)} ${sy(0).toFixed(1)} L ${sx(0).toFixed(1)} ${sy(0).toFixed(1)} Z`;

  // tick years: 0, mid, end
  const ticks = [0, Math.round(maxX / 2), maxX];

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", display: "block" }} role="img" aria-label={caption}>
        {/* zero baseline */}
        <line x1={padL} y1={sy(0)} x2={W - padR} y2={sy(0)} stroke={C.grey} strokeWidth="1" opacity="0.5" />
        {/* area fill */}
        <path d={area} fill={fill} opacity={fillOpacity} />
        {/* line */}
        <path d={line} fill="none" stroke={stroke} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
        {/* end marker */}
        <circle cx={sx(data[data.length - 1].x)} cy={sy(data[data.length - 1].y)} r="3.5" fill={stroke} />
        {/* x ticks */}
        {ticks.map((t) => (
          <text key={t} x={sx(t)} y={H - 8} fontFamily="'Plus Jakarta Sans', sans-serif" fontSize="11" fill={C.grey} textAnchor={t === 0 ? "start" : t === maxX ? "end" : "middle"}>
            {t === 0 ? "now" : `yr ${t}`}
          </text>
        ))}
      </svg>
      <div style={{ fontFamily: F.body, fontSize: 13, color: C.grey, lineHeight: 1.45, marginTop: 4 }}>{caption}</div>
    </div>
  );
}

// Income growth vs inflation — real-terms verdict.
function IncomeVsInflation({ calc, d }) {
  if (calc.incomeCAGR === null) {
    return (
      <div style={{ fontFamily: F.body, fontSize: 15, color: C.charcoal, opacity: 0.8, marginTop: 4 }}>
        Add a figure above and we'll work out whether your income has kept pace with inflation.
      </div>
    );
  }
  const v = calc.incomeVerdict;
  const behind = v === "behind";
  const ahead = v === "ahead";
  const bg = behind ? C.lighterMint : ahead ? C.mint : C.lighterMint;
  const cagrPct = (calc.incomeCAGR * 100).toFixed(1);
  const inflPct = (calc.inflBenchmark * 100).toFixed(1);

  let headline, body;
  if (ahead) {
    headline = "Your income has outpaced inflation";
    body = `Growing about ${cagrPct}% a year against inflation of ${inflPct}%, you're roughly ${fmt(Math.abs(calc.realGapNow))} ahead of simply standing still. That gap is real spending power — the question is whether it's working for you or being absorbed by the leaks above.`;
  } else if (v === "pace") {
    headline = "Your income has just kept pace";
    body = `At about ${cagrPct}% a year against ${inflPct}% inflation, you're treading water — earning more on paper, but with the same real buying power as five years ago. Income alone isn't moving you forward.`;
  } else {
    headline = "Your income has fallen behind inflation";
    body = `Your pay has grown about ${cagrPct}% a year, but prices have risen ${inflPct}%. To hold the same buying power as five years ago you'd need to earn ${fmt(calc.realStandStill)} today — so in real terms you're around ${fmt(Math.abs(calc.realGapNow))} behind, even though the number on your payslip went up.`;
  }

  return (
    <div style={{ background: bg, borderRadius: 14, padding: "20px 22px", marginTop: 4 }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 16, flexWrap: "wrap", marginBottom: 10 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
          <span className="news-h3" style={{ fontFamily: F.display, fontWeight: 400, fontSize: "clamp(1.3125rem, 0.875vw + 1rem, 1.875rem)", color: behind ? C.negative : C.emerald, lineHeight: 1 }}>
            {ahead ? "+" : ""}{cagrPct}%
          </span>
          <span style={{ fontFamily: F.body, fontSize: 13, color: C.emerald, opacity: 0.7 }}>your income / yr</span>
        </div>
        <span style={{ fontFamily: F.body, fontSize: 15, color: C.emerald, opacity: 0.5 }}>vs</span>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
          <span className="news-h3" style={{ fontFamily: F.display, fontWeight: 400, fontSize: "clamp(1.3125rem, 0.875vw + 1rem, 1.875rem)", color: C.emerald, lineHeight: 1 }}>
            {inflPct}%
          </span>
          <span style={{ fontFamily: F.body, fontSize: 13, color: C.emerald, opacity: 0.7 }}>inflation / yr</span>
        </div>
      </div>
      <div style={{ fontFamily: F.body, fontWeight: 600, fontSize: 16, color: behind ? C.negative : C.emerald, marginBottom: 6 }}>
        {headline}
      </div>
      <p style={{ fontFamily: F.body, fontSize: 15, lineHeight: 1.6, color: C.charcoal, margin: 0 }}>{body}</p>
    </div>
  );
}


function Snap({ label, value, negative, prefix }) {
  const valueColor = negative ? C.negative : C.emerald;
  const labelColor = negative ? C.negative : C.emerald;
  const bg = negative ? "#F8E5E1" : C.lighterMint;
  return (
    <div style={{ background: bg, borderRadius: 14, padding: "16px 18px" }}>
      <div style={{ fontFamily: F.body, fontWeight: 500, fontSize: 12, letterSpacing: "0.02em", textTransform: "uppercase", color: labelColor, opacity: 0.85, marginBottom: 6 }}>
        {label}
      </div>
      <div className="news-h3" style={{ fontFamily: F.display, fontWeight: 400, fontSize: "clamp(1.1875rem, 0.5vw + 1rem, 1.625rem)", color: valueColor, lineHeight: 1 }}>
        {prefix || ""}{value}
      </div>
    </div>
  );
}

