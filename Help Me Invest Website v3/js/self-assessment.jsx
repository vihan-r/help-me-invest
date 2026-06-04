const { useState, useMemo } = React;
const SiteHeader = window.Header; // site toolbar, shared from components.jsx

// ============================================================
// HELP ME INVEST, Nest Egg & Trajectory
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
  if (taxable <= 18200) t = 0;else
  if (taxable <= 45000) t = (taxable - 18200) * 0.16;else
  if (taxable <= 135000) t = 4288 + (taxable - 45000) * 0.30;else
  if (taxable <= 190000) t = 31288 + (taxable - 135000) * 0.37;else
  t = 51638 + (taxable - 190000) * 0.45;
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

// Renders a formatted currency string with its leading "$" in the body
// sans font, so the dollar sign reads as a normal glyph even inside the
// Newsreader serif display numbers.
function Money({ children }) {
  const s = Array.isArray(children) ? children.join("") : String(children);
  const i = s.indexOf("$");
  if (i === -1) return <React.Fragment>{s}</React.Fragment>;
  return <React.Fragment>{s.slice(0, i)}<span style={{ fontFamily: F.body }}>$</span>{s.slice(i + 1)}</React.Fragment>;
}

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
// Assumed income growth, lifts borrowing capacity over the plan horizon.
const INCOME_GROWTH = 0.035;

// ---- RENT GROWTH ASSUMPTION ----
// Cotality Feb 2026: Australian rents up 43.9% over the 5 years to Sept 2025
// (= 7.6% p.a. compounded) vs wage growth of 17.5% (= 3.3% p.a.). We assume a
// more conservative 4% p.a. going forward.
const RENT_GROWTH = 0.04;
const RENT_GROWTH_HISTORICAL_5Y = 0.076;
const WAGE_GROWTH_HISTORICAL_5Y = 0.033;
const RENT_DATA_NOTE = "Cotality Monthly Housing Chart Pack (Feb 2026)";

// ---- ABS HOUSEHOLD WEALTH BENCHMARKS ----
// Source: ABS 6523.0 Household Income and Wealth, Australia 2019-20. Values are
// PUBLISHED in 2019-20 dollars; uplifted to ~2026 dollars at ~26% cumulative CPI.
const ABS_CPI_UPLIFT = 1.26;
const ABS_RELEASE_NOTE = "ABS 6523.0 (2019-20), inflated to 2026 dollars at ~26% cumulative CPI";

// National net worth percentile distribution, all households, all ages.
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
  { p: 90, nw: 2257.7 }];

// Net worth by age band, median values only published in the public table.
const ABS_AGE_MEDIANS_2019_20 = [
  { ageLow: 15, ageHigh: 24, median: 34.6, mean: 83.8 },
  { ageLow: 25, ageHigh: 34, median: 175.7, mean: 353.8 },
  { ageLow: 35, ageHigh: 44, median: 401.0, mean: 692.6 },
  { ageLow: 45, ageHigh: 54, median: 799.6, mean: 1124.6 },
  { ageLow: 55, ageHigh: 64, median: 999.9, mean: 1519.0 },
  { ageLow: 65, ageHigh: 74, median: 926.7, mean: 1673.8 },
  { ageLow: 75, ageHigh: 200, median: 725.1, mean: 1167.0 }];

// Given a net worth in DOLLARS (not thousands), return percentile 0-100
// using linear interpolation across the national distribution.
function percentileForNetWorth(nw) {
  const table = ABS_NATIONAL_PERCENTILES_2019_20.map((r) => ({
    p: r.p,
    threshold: r.nw * 1000 * ABS_CPI_UPLIFT }));
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
    ageBand: `${row.ageLow}–${row.ageHigh === 200 ? "plus" : row.ageHigh}` };
}

// Simulate a staged acquisition plan using equity recycling, gated by BOTH
// usable equity AND borrowing capacity (servicing). Servicing capacity is
// 6 × assessable income, where assessable = gross income (growing over time)
// + 80% of rental income (existing + each new property). New loans are
// interest only for 5 years, then flip to P&I and pay down, which frees
// servicing capacity over the horizon. Income also grows each year.
function simulateAcquisitions({ startCash, homeValue, homeDebt, homeIsPI, years, avgPrice, growth, grossIncome, existingInvDebt, existingInvRent, maxProps = 12 }) {
  const equityNeeded = avgPrice * EQUITY_PER_BUY;
  const loanPerProp = avgPrice * (1 - DEPOSIT_PCT); // ~90% of price
  const newRent = avgPrice * 0.04; // new build at 4% gross yield
  const capacityOf = (gross, rentAnnual) => 6 * ((gross || 0) + 0.8 * rentAnnual);

  // P&I balance after `monthsPaid` months on a 25yr term at ~6.3%
  const piBalance = (loan, monthsPaid) => {
    if (!loan) return 0;
    const r = 0.063 / 12,term = 25 * 12;
    const pmt = loan * r / (1 - Math.pow(1 + r, -term));
    let b = loan;
    for (let m = 0; m < Math.min(monthsPaid, term); m++) b -= pmt - b * r;
    return Math.max(0, b);
  };
  // an investment loan's current balance: flat (IO) for first 5yrs, then P&I
  const invBalance = (loan, age) => age <= IO_YEARS ? loan : piBalance(loan, (age - IO_YEARS) * 12);
  // home debt year y: pays down if P&I, flat if IO
  const homeBalanceAt = (y) => homeIsPI ? piBalance(homeDebt || 0, y * 12) : homeDebt || 0;
  // home usable equity at 80% LVR, year y (home value grows at `growth`)
  const homeUsableAt = (y) => Math.max(0, fv(homeValue || 0, growth, y) * 0.8 - homeBalanceAt(y));

  const props = [];
  let consumedCash = 0; // cash from startCash used as deposits/costs so far
  let recycledFromHome = 0; // home equity already pulled out as deposits
  let recycledFromInv = 0; // investment equity already pulled out
  let rents = existingInvRent || 0;
  const series = [];

  for (let y = 0; y <= years; y++) {
    const grossNow = (grossIncome || 0) * Math.pow(1 + INCOME_GROWTH, y);
    // used borrowing = current home balance + existing inv debt + new properties (IO then P&I)
    let usedBorrow = homeBalanceAt(y) + (existingInvDebt || 0);
    props.forEach((p) => {usedBorrow += invBalance(p.loan, y - p.buyYear);});
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
      const fromCash = Math.min(need, cashAvail);consumedCash += fromCash;need -= fromCash;
      const fromHome = Math.min(need, homeAvail);recycledFromHome += fromHome;need -= fromHome;
      const fromInv = Math.min(need, invAvail);recycledFromInv += fromInv;
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
      layers
    });
  }
  const buyYears = [];
  let last = 0;
  series.forEach((s) => {if (s.count > last) {buyYears.push({ year: s.year, to: s.count });last = s.count;}});
  const baseCapacity = capacityOf(grossIncome, existingInvRent || 0);
  const baseHeadroom = baseCapacity - ((homeDebt || 0) + (existingInvDebt || 0));
  return { series, buyYears, equityNeeded, loanPerProp, baseCapacity, baseHeadroom };
}

// Cumulative home-loan interest, year by year, to retirement.
// Home debt is NON-DEDUCTIBLE, every dollar of this interest is after-tax money.
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
  const pmt = balance * r / (1 - Math.pow(1 + r, -termMonths));
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
  paper: "#F6F7F4", // Soft Paper, ground
  lighterMint: "#D4E8B5", // gentle surface
  mint: "#A8D5B4", // warm surface / highlight
  emerald: "#0A4B34", // primary / headlines / wordmark
  charcoal: "#1A2B22", // body ink
  grey: "#8B8881", // structural neutral
  paper90: "rgba(246,247,244,0.9)", // body on emerald
  // functional-only signal for negative/leak figures (not a brand colour;
  // used the way an error state is, never decoratively).
  negative: "#A33A2B"
};

const F = {
  display: "'Newsreader', Georgia, 'Times New Roman', serif", // announce
  body: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif" // read
};

const EASE = "cubic-bezier(0.16, 1, 0.3, 1)";

// ------------------------------------------------------------
// Inputs, forms ask plain questions (Voice Rule 2)
// ------------------------------------------------------------
function Field({ label, hint, children }) {
  return (
    <div style={{ marginBottom: 36 }}>
      <label style={{ display: "block", fontFamily: F.body, fontWeight: 500, fontSize: 14, color: C.charcoal, marginBottom: 8 }}>
        {label}
      </label>
      {children}
      {hint &&
      <div style={{ fontSize: 14, color: C.charcoal, marginTop: 7, lineHeight: 1.5, opacity: 0.85 }}>
          {hint}
        </div>
      }
    </div>);

}

function NumInput({ value, onChange, prefix = "$", suffix, step = 1000, placeholder }) {
  const [foc, setFoc] = useState(false);
  return (
    <div style={{ display: "flex", alignItems: "center", border: `1px solid ${foc ? C.emerald : C.grey}`, borderRadius: 10, background: C.paper, overflow: "hidden", transition: `border-color .25s ${EASE}, box-shadow .25s ${EASE}`, boxShadow: foc ? `0 0 0 3px rgba(10, 75, 52, 0.10)` : "none" }}>
      {prefix &&
      <span style={{ padding: "14px 0 14px 16px", color: C.grey, fontFamily: F.body, fontSize: 16 }}>{prefix}</span>
      }
      <input
        type="number"
        value={value}
        step={step}
        placeholder={placeholder}
        onFocus={() => setFoc(true)}
        onBlur={() => setFoc(false)}
        onChange={(e) => onChange(e.target.value === "" ? "" : Number(e.target.value))}
        style={{ flex: 1, border: "none", outline: "none", padding: "14px 16px", fontFamily: F.body, fontSize: 16, color: C.charcoal, background: "transparent", width: "100%" }} />
      
      {suffix &&
      <span style={{ padding: "14px 16px 14px 0", color: C.grey, fontFamily: F.body, fontSize: 14 }}>{suffix}</span>
      }
    </div>);

}

// Plain text input (e.g. lender name)
function TextInput({ value, onChange, placeholder }) {
  const [foc, setFoc] = useState(false);
  return (
    <div style={{ display: "flex", alignItems: "center", border: `1px solid ${foc ? C.emerald : C.grey}`, borderRadius: 10, background: C.paper, overflow: "hidden", transition: `border-color .25s ${EASE}, box-shadow .25s ${EASE}`, boxShadow: foc ? `0 0 0 3px rgba(10, 75, 52, 0.10)` : "none" }}>
      <input
        type="text"
        value={value || ""}
        placeholder={placeholder}
        onFocus={() => setFoc(true)}
        onBlur={() => setFoc(false)}
        onChange={(e) => onChange(e.target.value)}
        style={{ flex: 1, border: "none", outline: "none", padding: "14px 16px", fontFamily: F.body, fontSize: 16, color: C.charcoal, background: "transparent", width: "100%" }} />
      
    </div>);

}

// Choice control, quiet pills, never a high-pressure pattern
function Choice({ options, value, onChange }) {
  const [hov, setHov] = useState(null);
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
      {options.map((o) => {
        const active = o.value === value;
        const isHov = hov === o.value && !active;
        return (
          <button
            key={o.value}
            onClick={() => onChange(o.value)}
            onMouseEnter={() => setHov(o.value)}
            onMouseLeave={() => setHov(null)}
            style={{
              flex: "1 1 auto", minWidth: 120, padding: "12px 16px",
              border: `1px solid ${active || isHov ? C.emerald : C.grey}`, borderRadius: 10,
              cursor: "pointer", fontFamily: F.body, fontWeight: 500, fontSize: 15,
              background: active ? C.emerald : isHov ? C.lighterMint : C.paper, color: active ? C.paper : C.charcoal,
              transform: isHov ? "translateY(-1px)" : "none",
              transition: `background .25s ${EASE}, color .25s ${EASE}, border-color .25s ${EASE}, transform .25s ${EASE}`
            }}>
            
            {o.label}
          </button>);

      })}
    </div>);

}

// Buttons, pills, verbs for labels
function Btn({ children, onClick, variant = "secondary", onEmerald }) {
  const [hov, setHov] = useState(false);
  let base, hovStyle;
  if (variant === "primary") {
    base = onEmerald ?
    { background: C.paper, color: C.emerald, border: `1px solid ${C.paper}` } :
    { background: C.emerald, color: C.paper, border: `1px solid ${C.emerald}` };
    hovStyle = onEmerald ?
    { boxShadow: "0 8px 20px rgba(0, 0, 0, 0.20)" } :
    { boxShadow: "0 8px 20px rgba(10, 75, 52, 0.22)" };
  } else {
    base = onEmerald ?
    { background: "transparent", color: C.paper, border: `1px solid ${C.paper}` } :
    { background: C.lighterMint, color: C.emerald, border: `1px solid ${C.lighterMint}` };
    hovStyle = onEmerald ?
    { background: "rgba(246, 247, 244, 0.14)" } :
    { background: C.mint, borderColor: C.mint };
  }
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{ padding: "14px 26px", borderRadius: 10, fontFamily: F.body, fontWeight: 500, fontSize: 15, cursor: "pointer", transform: hov ? "translateY(-2px)" : "none", transition: `transform .25s ${EASE}, background .25s ${EASE}, border-color .25s ${EASE}, box-shadow .25s ${EASE}`, ...base, ...(hov ? hovStyle : {}) }}>
      
      {children}
    </button>);

}

// Tertiary text link, Warm Charcoal, underline, arrow nudge
function TextLink({ children, onClick }) {const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{ background: "none", border: "none", padding: 0, cursor: "pointer", fontFamily: F.body, fontWeight: 500, fontSize: 15, color: hov ? C.emerald : C.charcoal, borderBottom: `${hov ? 2 : 1}px solid ${hov ? C.emerald : C.charcoal}`, paddingBottom: 3, transition: `color .6s ${EASE}` }}>
      
      {children}{" "}
      <span style={{ display: "inline-block", transform: hov ? "translateX(2px)" : "none", transition: `transform .6s ${EASE}` }}>→</span>
    </button>);

}

// Back link, leading arrow (mirror of TextLink)
function BackLink({ onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{ background: "none", border: "none", padding: 0, cursor: "pointer", fontFamily: F.body, fontWeight: 500, fontSize: 15, color: hov ? C.emerald : C.charcoal, display: "inline-flex", alignItems: "center", gap: 7, transition: `color .6s ${EASE}` }}>
      
      <span style={{ display: "inline-block", transform: hov ? "translateX(-2px)" : "none", transition: `transform .6s ${EASE}` }}>←</span>
      <span style={{ borderBottom: `${hov ? 2 : 1}px solid ${hov ? C.emerald : C.charcoal}`, paddingBottom: 3 }}>Back</span>
    </button>);

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
{ phase: "Your plan", key: "plan" },
{ phase: "Your plan", key: "puttowork" },
{ phase: "Your plan", key: "nextsteps" },
{ phase: "Your plan", key: "terms" }];

const PHASES = ["About you", "Where this leads", "Your plan"];

function NestEggTrajectory() {
  const [i, setI] = useState(0);

  const [d, setD] = useState({
    age: 38, retireAge: 60,
    employment: "payg", incomeMode: "single", income: 180000, income2: 90000,
    bizTurnover: 0, bizProfitMargin: 25, bizSalary: 120000,
    ownsHome: "yes", homeValue: 1200000, homeDebt: 650000, homeRate: 6.1, homeRepayType: "pi", mortgageYearsLeft: 22,
    annualExpenses: 100000,
    firstName: "", email: "", rentPerWeek: 600,
    invValue: 0, invDebt: 0, invRate: 6.3, invRepayType: "io",
    hasInv: "no",
    investments: [
    { value: 600000, debt: 450000, rate: 6.3, repayType: "io", lender: "", rentWeek: 480 }],

    super: 220000, super2: 140000, cash: 60000,
    pastGrowth: 7, futureGrowth: 5, superReturn: 7.5,
    income5yrAgo: 140000, inflationBenchmark: 3.8,
    annualSavings: 40000,
    needBasics: 70000, needLifestyle: 45000, needLuxuries: 25000,
    homePriority: "passive", blocker: "deposit", goals: []
  });
  const set = (k, v) => setD((s) => ({ ...s, [k]: v }));
  // investment-array helpers
  const setInv = (idx, key, val) =>
  setD((s) => ({ ...s, investments: s.investments.map((p, i) => i === idx ? { ...p, [key]: val } : p) }));
  const addInv = () =>
  setD((s) => ({ ...s, investments: [...s.investments, { value: 0, debt: 0, rate: 6.3, repayType: "io", lender: "", rentWeek: 0 }] }));
  const removeInv = (idx) =>
  setD((s) => ({ ...s, investments: s.investments.filter((_, i) => i !== idx) }));

  const calc = useMemo(() => {
    const years = Math.max(0, d.retireAge - d.age);
    const g = (d.futureGrowth || 5) / 100;
    const sr = (d.superReturn || 7.5) / 100;

    // Super: individual accounts, sum both when there are two earners.
    const superStart =
    (d.super || 0) + (d.employment === "payg" && d.incomeMode === "dual" ? d.super2 || 0 : 0);

    // Home, only counts when they actually own. The toggle is the source of truth.
    const homeValue = d.ownsHome === "yes" ? d.homeValue || 0 : 0;
    const homeDebt = d.ownsHome === "yes" ? d.homeDebt || 0 : 0;

    // Investment properties (array). Sum values/debts; compute usable equity
    // at 80% LVR per property: (value × 0.80) − debt, floored at 0.
    const invs = d.hasInv === "yes" ? d.investments || [] : [];
    const invValueTotal = invs.reduce((a, p) => a + (p.value || 0), 0);
    const invDebtTotal = invs.reduce((a, p) => a + (p.debt || 0), 0);
    const invRentWeekTotal = invs.reduce((a, p) => a + (p.rentWeek || 0), 0);
    const usableEquity80 = (val, debt) => Math.max(0, (val || 0) * 0.8 - (debt || 0));
    const invEquity80 = invs.map((p) => ({
      ...p,
      equity80: usableEquity80(p.value, p.debt)
    }));
    const invUsableEquityTotal = invEquity80.reduce((a, p) => a + p.equity80, 0);
    const homeUsableEquity80 = usableEquity80(homeValue, homeDebt);
    const totalUsableEquity80 = invUsableEquityTotal + homeUsableEquity80;

    const totalAssets =
    homeValue + invValueTotal + superStart + (d.cash || 0);
    const totalDebt = homeDebt + invDebtTotal;
    const netWorth = totalAssets - totalDebt;

    let grossIncome, taxPaid, netIncome;
    let bizDeficit = 0,bizProfit = 0;
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
      const profit = (d.bizTurnover || 0) * ((d.bizProfitMargin || 0) / 100);
      const salary = d.bizSalary || 0;
      // The honest figure, can be negative if salary exceeds profit (the business
      // is being subsidised somehow to pay the owner). We surface this as a deficit.
      const rawProfitAfterSalary = profit - salary;
      const profitAfterSalary = Math.max(0, rawProfitAfterSalary);
      bizDeficit = rawProfitAfterSalary < 0 ? -rawProfitAfterSalary : 0;
      bizProfit = profit;
      const personalTax = incomeTaxPAYG(salary);
      const coTax = companyTax(profitAfterSalary);
      grossIncome = salary + profitAfterSalary;
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
    // 2. Tax leaked, cumulative, holding income flat (conservative, no wage growth).
    const taxPerYear = taxPaid;
    const taxSchedule = [{ yr: 0, cum: 0 }];
    for (let y = 1; y <= years; y++) {
      taxSchedule.push({ yr: y, cum: taxPerYear * y });
    }
    const taxTotal = taxPerYear * years;

    // ---- WEEKLY VIEW + DAYS OF THE WEEK ----
    // Split this year's home repayment into interest (a true leak) and
    // principal (forced savings, not a leak, it builds equity). Honest split.
    let homeIntYr = 0,homePrinYr = 0;
    if (homeDebt > 0 && (d.homeRate || 0) > 0) {
      if (d.homeRepayType === "io") {
        homeIntYr = homeDebt * ((d.homeRate || 0) / 100);
        homePrinYr = 0;
      } else {
        const r = (d.homeRate || 0) / 100 / 12;
        const nTerm = 25 * 12;
        const pmt = homeDebt * r / (1 - Math.pow(1 + r, -nTerm));
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
      leak: leakPerYear / 52
    };
    // Days of a 5-day week, valued on gross income.
    const dayValue = (grossIncome || 1) / 5;
    const days = {
      tax: taxPerYear / dayValue,
      homeInt: homeIntYr / dayValue,
      homePrin: homePrinYr / dayValue,
      leak: leakPerYear / dayValue,
      left: Math.max(0, 5 - leakPerYear / dayValue - homePrinYr / dayValue)
    };

    const needTotal =
    (d.needBasics || 0) + (d.needLifestyle || 0) + (d.needLuxuries || 0);
    const grossYield = 0.045;
    const equityRequired = needTotal / grossYield;
    const workingEquity = invEquityFut;
    const equityGap = Math.max(0, equityRequired - workingEquity);

    const avgPropPrice = 750000;
    // Each new property contributes to the equity gap = (value at retirement) − (loan balance at retirement)
    // New loans: 5yr IO then P&I, we approximate with a fully-IO balance to be conservative
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
        const pmt = homeDebt * r / (1 - Math.pow(1 + r, -monthsLeft));
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
    // wake-up case, not just "no investments" but "no plan that adds up".
    const POST_RETIREMENT_YEARS = 25;
    const noPlanFlag =
    yearsCapitalLasts < POST_RETIREMENT_YEARS &&
    trajectoryPassive < needTotal * 0.5;

    // Mortgage-outlives-retirement flag, if the home loan term extends past
    // retirement, they'd repay it from super or sale proceeds.
    const mortgageOutlivesRetirement =
    homeValue > 0 && homeDebt > 0 && (d.mortgageYearsLeft || 0) > years;
    const mortgageOverhangYears = Math.max(0, (d.mortgageYearsLeft || 0) - years);

    // ---- RENTFLATION ANALYSIS (for renters & rentvesters) ----
    const isRenter = d.ownsHome === "no";
    const hasInvestmentProperty = d.hasInv === "yes" && (d.investments || []).some((p) => (p.value || 0) > 0);
    const isPureRenter = isRenter && !hasInvestmentProperty;
    const isRentvester = isRenter && hasInvestmentProperty;
    const rentWeekNow = isRenter ? (d.rentPerWeek || 0) : 0;
    const rentAnnualNow = rentWeekNow * 52;
    const rentWeekAtRetirement = rentWeekNow * Math.pow(1 + RENT_GROWTH, years);
    const rentAnnualAtRetirement = rentWeekAtRetirement * 52;
    const totalRentToRetirement = RENT_GROWTH === 0 ?
    rentAnnualNow * years :
    rentAnnualNow * ((Math.pow(1 + RENT_GROWTH, years) - 1) / RENT_GROWTH);
    const rentPctIncomeToday = grossIncome > 0 ? (rentAnnualNow / grossIncome) * 100 : 0;
    const incomeAtRetirement = (grossIncome || 0) * Math.pow(1 + INCOME_GROWTH, years);
    const rentPctIncomeAtRetirement = incomeAtRetirement > 0 ? (rentAnnualAtRetirement / incomeAtRetirement) * 100 : 0;

    // ---- WEALTH VELOCITY SCORE ----
    // A single readable 0-100 number summarising whether the household is on track.
    const wvsPassive = Math.min(1, trajectoryPassive / Math.max(1, needTotal)) * 40;
    const wvsCapital = Math.min(1, yearsCapitalLasts / POST_RETIREMENT_YEARS) * 30;
    const wvsDebt = mortgageOutlivesRetirement ?
    Math.max(0, 15 - mortgageOverhangYears) :
    15;
    const wvsBuyingPower = Math.min(1, Math.floor((totalUsableEquity80 + (d.cash || 0)) / (750000 * EQUITY_PER_BUY)) / 3) * 15;
    const wealthVelocityScore = Math.round(Math.max(0, Math.min(100, wvsPassive + wvsCapital + wvsDebt + wvsBuyingPower)));
    const wvsGrade = wealthVelocityScore >= 80 ? "A" :
    wealthVelocityScore >= 65 ? "B" :
    wealthVelocityScore >= 50 ? "C" :
    wealthVelocityScore >= 35 ? "D" :
    "F";
    const wvsType = wealthVelocityScore >= 80 ? "Wealth Builder" :
    wealthVelocityScore >= 65 ? "On Track, Untapped" :
    wealthVelocityScore >= 50 ? "Coasting" :
    wealthVelocityScore >= 35 ? "High Leak, Low Engine" :
    "At Risk";
    const wvsColor = wealthVelocityScore >= 65 ? C.emerald :
    wealthVelocityScore >= 50 ? "#8B7E3F" :
    C.negative;

    // ---- ABS BENCHMARK COMPARISONS ----
    const nationalPercentile = percentileForNetWorth(netWorth);
    const ageMedianData = medianNetWorthForAge(d.age || 0);
    const ageMedian = ageMedianData ? ageMedianData.median : 0;
    const ageBandLabel = ageMedianData ? ageMedianData.ageBand : "your age";
    const aboveAgeMedian = ageMedian > 0 && netWorth >= ageMedian;
    const ageGapPct = ageMedian > 0 ? Math.round(((netWorth - ageMedian) / ageMedian) * 100) : 0;
    const inflRateForBench = (d.inflationBenchmark || 3.8) / 100;
    const futNetWorthRealToday = futNetWorth / Math.pow(1 + inflRateForBench, years);
    const retireeMedian = (medianNetWorthForAge(70) || { median: 0 }).median;
    const retireeMedianMultiple = retireeMedian > 0 ? futNetWorthRealToday / retireeMedian : 0;
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
      existingInvRent: existingRentAnnual
    });
    // tax benefit of one negatively-geared NEW build at 4% gross yield
    const ngRent = acqAvgPrice * 0.04;
    const ngLoan = acqPlan.loanPerProp;
    const ngInterest = ngLoan * ((d.invRate || 6.3) / 100);
    const ngDeprec = acqAvgPrice * 0.02; // ~2% p.a. depreciation on a new build
    const ngExpenses = ngRent * 0.25; // management, rates, insurance
    const ngLoss = ngRent - ngInterest - ngDeprec - ngExpenses; // negative = paper loss
    // marginal rate for the saving, for dual incomes, use the higher earner's bracket
    // (negative gearing benefit typically goes to whichever spouse is on the higher rate)
    const marginalIncomeForBracket = d.employment === "payg" && d.incomeMode === "dual" ?
    Math.max(d.income || 0, d.income2 || 0) :
    grossIncome;
    const marginal =
    marginalIncomeForBracket > 190000 ? 0.47 :
    marginalIncomeForBracket > 135000 ? 0.39 :
    marginalIncomeForBracket > 45000 ? 0.325 :
    0.18;
    const ngTaxSaved = ngLoss < 0 ? -ngLoss * marginal : 0;
    // recycle timing: years until one property builds $90k usable equity at 80% LVR
    let recycleYears = null;
    for (let y = 1; y <= 15; y++) {
      const val = fv(acqAvgPrice, g, y);
      if (val * 0.8 - ngLoan >= 90000) {recycleYears = y;break;}
    }

    // ---- OPTIMISATION CALCS (the "if you redirected this..." engine) ----
    const homeIsPI = d.homeRepayType === "pi";
    const homeRate = (d.homeRate || 6.1) / 100;
    const homeRateM = homeRate / 12;
    const homeRemainingMonths = (d.mortgageYearsLeft || 25) * 12;
    const standardPmt = homeIsPI && homeDebt > 0 && homeRemainingMonths > 0 ?
    (homeDebt * homeRateM) / (1 - Math.pow(1 + homeRateM, -homeRemainingMonths)) :
    0;
    function payoffMonths(bal, rateM, pmt) {
      if (bal <= 0 || pmt <= 0) return 0;
      if (pmt <= bal * rateM) return Infinity;
      return Math.log(pmt / (pmt - bal * rateM)) / Math.log(1 + rateM);
    }
    const extraFromTax = ngTaxSaved / 12;
    const monthsWithTax = homeIsPI && homeDebt > 0 ?
    payoffMonths(homeDebt, homeRateM, standardPmt + extraFromTax) :
    0;
    const monthsSavedByTax = Math.max(0, homeRemainingMonths - monthsWithTax);
    const yearsSavedByTax = monthsSavedByTax / 12;
    const interestSavedByTax = homeIsPI && homeDebt > 0 ?
    Math.max(0, standardPmt * homeRemainingMonths - (standardPmt + extraFromTax) * monthsWithTax) :
    0;
    const sensibleExtra = Math.min((d.annualSavings || 0) / 12, 1000);
    const monthsWithSavings = homeIsPI && homeDebt > 0 ?
    payoffMonths(homeDebt, homeRateM, standardPmt + sensibleExtra) :
    0;
    const yearsSavedBySavings = (Math.max(0, homeRemainingMonths - monthsWithSavings)) / 12;
    const monthsCombined = homeIsPI && homeDebt > 0 ?
    payoffMonths(homeDebt, homeRateM, standardPmt + extraFromTax + sensibleExtra) :
    0;
    const yearsSavedCombined = (Math.max(0, homeRemainingMonths - monthsCombined)) / 12;

    // ---- BOTTOM-LINE FIGURES (the shock numbers for the close) ----
    const totalInterestStandard = homeIsPI && homeDebt > 0 ?
    Math.max(0, standardPmt * homeRemainingMonths - homeDebt) :
    0;
    const totalInterestOptimised = homeIsPI && homeDebt > 0 ?
    Math.max(0, (standardPmt + extraFromTax + sensibleExtra) * monthsCombined - homeDebt) :
    0;
    const totalInterestSaved = Math.max(0, totalInterestStandard - totalInterestOptimised);
    const ageHomePaidStandard = d.age + (d.mortgageYearsLeft || 0);
    const ageHomePaidOptimised = d.age + (monthsCombined / 12);
    const weeklyMortgagePmt = standardPmt * 12 / 52;
    const daysOfWeekFromMortgage = grossIncome > 0 ?
    (standardPmt * 12 / grossIncome) * 5 :
    0;

    // ---- COST OF WAITING ----
    const _wait_priceNow = 750000;
    const _wait_priceMonthLater = fv(_wait_priceNow, g, 1 / 12);
    const _wait_capturedNow = fv(_wait_priceNow, g, years) - _wait_priceNow;
    const _wait_capturedLater = fv(_wait_priceMonthLater, g, years - 1 / 12) - _wait_priceMonthLater;
    const costOfWaitingMonth = Math.max(0, _wait_capturedNow - _wait_capturedLater);
    const costOfWaitingDay = costOfWaitingMonth / 30;

    // ---- SELL ONE INVESTMENT IN 15 YEARS (after CGT + selling fee) ----
    const sellYears = 15;
    const propValY15 = fv(acqAvgPrice, g, sellYears);
    const propGain = propValY15 - acqAvgPrice;
    const cgt = propGain * 0.5 * marginal;
    const sellingFeeOnInv = propValY15 * 0.022;
    const netInvSaleProceeds = Math.max(0, propValY15 - sellingFeeOnInv - cgt - acqAvgPrice * 0.9);
    let homeBalY15 = 0;
    if (homeIsPI && homeDebt > 0) {
      let b = homeDebt;
      for (let m = 0; m < Math.min(sellYears * 12, homeRemainingMonths); m++) b -= standardPmt - b * homeRateM;
      homeBalY15 = Math.max(0, b);
    } else {
      homeBalY15 = homeDebt;
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
      if (incomeCAGR > infl + 0.005) incomeVerdict = "ahead";else
      if (incomeCAGR >= infl - 0.005) incomeVerdict = "pace";else
      incomeVerdict = "behind";
    }

    return {
      years, totalAssets, totalDebt, netWorth, grossIncome, taxPaid, netIncome,
      bizDeficit, bizProfit,
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
      incomeCAGR, realStandStill, realGapNow, incomeVerdict, incomeThen: then, inflBenchmark: infl
    };
  }, [d]);

  const screen = SCREENS[i];
  const phaseIndex = PHASES.indexOf(screen.phase);
  // progress within current phase
  // Filter out screens that get auto-skipped (reality screen for users on track)
  const visibleScreens = SCREENS.filter((s) => !(s.key === "reality" && !calc.noPlanFlag));
  const phaseScreens = visibleScreens.filter((s) => s.phase === screen.phase);
  const posInPhase = phaseScreens.findIndex((s) => s.key === screen.key);
  // Skip the "reality" screen for users with a real passive-income trajectory,
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
  const goToKey = (key) => {const idx = SCREENS.findIndex((s) => s.key === key);if (idx >= 0) setI(idx);};
  // Whenever the screen changes, bring the viewport back to the top so the
  // user always lands on the new screen's header.
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const toTop = () => {
      try { window.scrollTo(0, 0); } catch (e) {}
      if (document.scrollingElement) document.scrollingElement.scrollTop = 0;
      if (document.documentElement) document.documentElement.scrollTop = 0;
      if (document.body) document.body.scrollTop = 0;
    };
    toTop();
    // Run again after paint in case the new screen reflows the page height.
    requestAnimationFrame(toTop);
  }, [i]);
  const isFirst = i === 0;
  const isLast = i === SCREENS.length - 1;

  // continue-label per screen (verbs; help offered not imposed)
  const nextLabel = {
    timing: "Continue", income: "Continue", assets: "Continue",
    growth: "Continue", inflation: "See where this leads",
    networth: "Continue", leaks: "Show me my week", week: "What it costs me",
    cost: "Set the income I want", income_target: "See my move from here",
    reality: "Set the income I want",
    acquire: "See the full plan",
    plan: "What I can use now",
    puttowork: "Assumptions & terms",
    nextsteps: "See the assumptions",
    terms: ""
  }[screen.key];

  const props = { d, set, calc, next, goToKey, setInv, addInv, removeInv };

  return (
    <div style={{ fontFamily: F.body, background: C.paper, color: C.charcoal, minHeight: "100vh" }}>
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
      `}</style>

      {/* ---------- Website top toolbar ---------- */}
      <SiteHeader active="how" />

      {/* ---------- Phase progress (below the toolbar) ---------- */}
      <div style={{ borderTop: `1px solid ${C.grey}40`, borderBottom: `1px solid ${C.grey}40`, background: C.paper }}>
        <div style={{ maxWidth: 760, margin: "0 auto", padding: "20px 24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <span style={{ fontFamily: F.body, fontWeight: 600, fontSize: 13, letterSpacing: "0.02em", textTransform: "uppercase", color: C.emerald }}>
              {screen.phase}
            </span>
            <span style={{ fontFamily: F.body, fontWeight: 500, fontSize: 13, color: C.grey }}>
              Step {i + 1} of {visibleScreens.length}
            </span>
          </div>
          {/* phase segments */}
          <div style={{ display: "flex", gap: 8 }}>
            {PHASES.map((p, pi) => {
              const total = visibleScreens.filter((s) => s.phase === p).length;
              const done = pi < phaseIndex ? total : pi > phaseIndex ? 0 : posInPhase + 1;
              return (
                <div key={p} style={{ flex: 1 }}>
                  <div style={{ display: "flex", gap: 3 }}>
                    {Array.from({ length: total }).map((_, k) =>
                    <div key={k} style={{
                      flex: 1, height: 3, borderRadius: 999,
                      background: k < done ? C.emerald : C.grey,
                      opacity: k < done ? 1 : 0.3,
                      transition: `opacity .5s ${EASE}, background .5s ${EASE}`
                    }} />
                    )}
                  </div>
                </div>);

            })}
          </div>
        </div>
      </div>

      {/* ---------- Screen body ---------- */}
      <main>
        <div key={screen.key} className="screenIn" style={{ maxWidth: 760, margin: "0 auto", padding: "40px 24px 8px" }}>
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
          {screen.key === "plan" && <ScreenPlan {...props} />}
          {screen.key === "puttowork" && <ScreenPutToWork {...props} />}
          {screen.key === "nextsteps" && <ScreenNextSteps {...props} />}
          {screen.key === "terms" && <ScreenTerms {...props} />}
        </div>

        {/* ---------- In-page nav buttons ---------- */}
        <div style={{ maxWidth: 760, margin: "0 auto", padding: "24px 24px 64px" }}>
          <div style={{ borderTop: `1px solid ${C.grey}40`, paddingTop: 24, display: "flex", justifyContent: "space-between", alignItems: screen.key === "plan" ? "flex-end" : "center", gap: 16 }}>
            {screen.key === "puttowork" ?
            <React.Fragment>
                <BackLink onClick={back} />
                <Btn variant="primary" onClick={next}>Next steps</Btn>
              </React.Fragment> :

            <React.Fragment>
                {isFirst ? <span style={{ fontFamily: F.body, fontSize: 13, color: C.grey }}>Nothing here is saved or sent.</span> :
              <BackLink onClick={back} />}
                {!isLast && screen.key !== "nextsteps" ?
              <Btn variant="primary" onClick={next}>{nextLabel}</Btn> :
              <span style={{ fontFamily: F.body, fontSize: 13, color: C.grey }}>You're in charge from here</span>}
              </React.Fragment>
            }
          </div>
        </div>
      </main>
    </div>);

}

// ============================================================
// SCREEN HEADER, shared, keeps every screen visually consistent
// ============================================================
function ScreenHead({ eyebrow, title, emphasis, lede }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <Eyebrow>{eyebrow}</Eyebrow>
      <H1 emphasis={emphasis}>{title}</H1>
      {lede && <Lede>{lede}</Lede>}
    </div>);

}

// ---------- 1. TIMING ----------
function ScreenTiming({ d, set }) {
  return (
    <div>
      <div style={{ background: C.lighterMint, borderRadius: 20, aspectRatio: "16 / 9", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
        <span style={{ fontFamily: F.body, fontWeight: 500, fontSize: 13, letterSpacing: "0.02em", textTransform: "uppercase", color: C.emerald, opacity: 0.6 }}>[ Report screenshot ]</span>
      </div>
      <div style={{ background: C.lighterMint, borderRadius: 20, padding: "28px 30px", marginBottom: 36, display: "flex", gap: 28, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ flex: "0 0 auto" }}>
          <div className="news-d" style={{ fontFamily: F.display, fontWeight: 400, fontSize: 48, color: C.emerald, lineHeight: 1 }}>~10 min</div>
          <div style={{ fontFamily: F.body, fontWeight: 500, fontSize: 12, letterSpacing: "0.02em", textTransform: "uppercase", color: C.emerald, opacity: 0.7, marginTop: 6 }}>to complete</div>
        </div>
        <ul style={{ flex: "1 1 280px", margin: 0, paddingLeft: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 12 }}>
          {[
          "A few honest questions, nothing saved or sent as you go.",
          "A clear, personalised picture of where you stand today.",
          "Exactly what it takes to retire on your own terms.",
          "A customised report at the end that's yours to keep, free."].
          map((t, i) =>
          <li key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start", fontFamily: F.body, fontSize: 16, lineHeight: 1.5, color: C.charcoal }}>
              <span style={{ flexShrink: 0, width: 7, height: 7, borderRadius: 999, background: C.emerald, marginTop: 8 }}></span>
              <span>{t}</span>
            </li>
          )}
        </ul>
      </div>
      <ScreenHead
        eyebrow="About you · 1 of 5"
        title="Let's start with timing"
        lede="Two quick questions. Nothing here is saved or sent, it all works out as you type." />
      
      <Two>
        <Field label="How old are you?">
          <NumInput value={d.age} onChange={(v) => set("age", v)} prefix="" step={1} suffix="years" />
        </Field>
        <Field label="When would you like work to be optional?" hint="The age you're aiming at.">
          <NumInput value={d.retireAge} onChange={(v) => set("retireAge", v)} prefix="" step={1} suffix="years" />
        </Field>
      </Two>
      <CalloutQuiet>
        That gives you <strong style={{ fontWeight: 600 }}>{Math.max(0, d.retireAge - d.age)} years</strong> to
        work with, the runway every number after this is built on.
      </CalloutQuiet>
    </div>);

}

// ---------- 2. INCOME ----------
function ScreenIncome({ d, set, calc }) {
  return (
    <div>
      <ScreenHead
        eyebrow="About you · 2 of 5"
        title="How you earn"
        lede="Your income shapes both your tax and how much you can borrow, so it's worth getting right." />
      
      <Field label="How are you taxed?" hint="Borrowing power is driven directly by assessable income.">
        <Choice value={d.employment} onChange={(v) => set("employment", v)}
        options={[{ value: "payg", label: "I'm an employee (PAYG)" }, { value: "business", label: "I own a business" }]} />
      </Field>

      {d.employment === "payg" ?
      <>
          <Field label="Is this one income or two?" hint="Two incomes are each taxed on their own brackets, often keeping thousands more in the household each year.">
            <Choice value={d.incomeMode} onChange={(v) => set("incomeMode", v)}
          options={[{ value: "single", label: "Single income" }, { value: "dual", label: "Two incomes" }]} />
          </Field>
          {d.incomeMode === "dual" ?
        <Two>
              <Field label="What's the first gross income?" hint="Before tax."><NumInput value={d.income} onChange={(v) => set("income", v)} /></Field>
              <Field label="And the second?" hint="Before tax."><NumInput value={d.income2} onChange={(v) => set("income2", v)} /></Field>
            </Two> :

        <Field label="What's your gross annual income?" hint="Your salary package, before tax."><NumInput value={d.income} onChange={(v) => set("income", v)} /></Field>
        }
        </> :

      <>
          <Two>
            <Field label="Annual business turnover?"><NumInput value={d.bizTurnover} onChange={(v) => set("bizTurnover", v)} /></Field>
            <Field label="Net profit margin?" hint="Before you pay yourself."><NumInput value={d.bizProfitMargin} onChange={(v) => set("bizProfitMargin", v)} prefix="" suffix="%" step={1} /></Field>
          </Two>
          <Field label="How much do you pay yourself?" hint="The salary in your own name, this is what a lender assesses."><NumInput value={d.bizSalary} onChange={(v) => set("bizSalary", v)} /></Field>
        </>
      }

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 12, marginTop: 8 }}>
        <Snap label="Gross income" value={fmtK(calc.grossIncome)} />
        <Snap label="Tax & Medicare" value={fmtK(calc.taxPaid)} />
        <Snap label="After-tax" value={fmtK(calc.netIncome)} />
      </div>
      <DualNote calc={calc} d={d} />
      {d.employment === "business" && calc.bizDeficit > 0 &&
      <div style={{ background: C.negative, color: C.paper, borderRadius: 20, padding: "24px 26px", marginTop: 22 }}>
          <div style={{ fontFamily: F.body, fontWeight: 500, fontSize: 12, letterSpacing: "0.02em", textTransform: "uppercase", opacity: 0.9, marginBottom: 12 }}>
            Your business is in deficit
          </div>
          <div className="news-h3" style={{ fontFamily: F.display, fontWeight: 400, fontSize: 26, lineHeight: 1.2, marginBottom: 14 }}>
            You're paying yourself more than the business actually makes.
          </div>
          <p style={{ fontFamily: F.body, fontSize: 15, lineHeight: 1.65, margin: 0, opacity: 0.95, maxWidth: 560 }}>
            At a {d.bizProfitMargin}% margin on {fmtK(d.bizTurnover)} of turnover, the business produces <strong style={{ fontWeight: 600 }}>{fmtK(calc.bizProfit)}</strong> in profit. You're drawing <strong style={{ fontWeight: 600 }}>{fmtK(d.bizSalary)}</strong> as salary, which means <strong style={{ fontWeight: 600 }}>{fmtK(calc.bizDeficit)} a year</strong> is leaving the business that didn't come in.
          </p>
          <p style={{ fontFamily: F.body, fontSize: 15, lineHeight: 1.65, marginTop: 12, marginBottom: 0, opacity: 0.95, maxWidth: 560 }}>
            Something is propping that up, savings, the home loan, a partner's income, or unpaid tax. That isn't sustainable, and a lender will see it the moment they look at the books. Before anything else, this is the number to fix.
          </p>
        </div>
      }
    </div>);

}

// ---------- 3. ASSETS ----------
function ScreenAssets({ d, set, calc, setInv, addInv, removeInv }) {
  const dual = d.employment === "payg" && d.incomeMode === "dual";
  return (
    <div>
      <ScreenHead
        eyebrow="About you · 3 of 5"
        title="What you own, and owe"
        lede="Roughly is fine. We'll use this as the starting point for where you're heading." />
      
      <Field label="Do you own your home?">
        <Choice value={d.ownsHome} onChange={(v) => set("ownsHome", v)}
        options={[{ value: "yes", label: "Yes, I own where I live" }, { value: "no", label: "No, I rent" }]} />
      </Field>
      {d.ownsHome === "yes" &&
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
      }
      <Field label="Do you have any investment properties?">
        <Choice value={d.hasInv} onChange={(v) => set("hasInv", v)}
        options={[{ value: "no", label: "Not yet" }, { value: "yes", label: "Yes, I do" }]} />
      </Field>
      {d.hasInv === "yes" &&
      <div style={{ marginBottom: 24 }}>
          {(d.investments || []).map((p, idx) =>
        <div key={idx} style={{ background: C.lighterMint, borderRadius: 14, padding: "20px 22px", marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <span style={{ fontFamily: F.body, fontWeight: 600, fontSize: 15, color: C.emerald }}>Property {idx + 1}</span>
                {d.investments.length > 1 &&
            <button onClick={() => removeInv(idx)} style={{ background: "none", border: "none", cursor: "pointer", fontFamily: F.body, fontSize: 13, color: C.grey, textDecoration: "underline", padding: 0 }}>Remove</button>
            }
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
                <span style={{ fontFamily: F.display, fontWeight: 400, fontSize: 20, color: C.emerald }}><Money>{fmtK(Math.max(0, (p.value || 0) * 0.8 - (p.debt || 0)))}</Money></span>
              </div>
            </div>
        )}
          <TextLink onClick={addInv}>Add another property</TextLink>
        </div>
      }
      {dual ?
      <>
          <Two>
            <Field label="First person's super?" hint="Super is individual, each account counts separately."><NumInput value={d.super} onChange={(v) => set("super", v)} /></Field>
            <Field label="Second person's super?"><NumInput value={d.super2} onChange={(v) => set("super2", v)} /></Field>
          </Two>
          <Field label="Cash or offset savings?" hint="Combined across the household."><NumInput value={d.cash} onChange={(v) => set("cash", v)} /></Field>
        </> :

      <Two>
          <Field label="Your super balance?"><NumInput value={d.super} onChange={(v) => set("super", v)} /></Field>
          <Field label="Cash or offset savings?"><NumInput value={d.cash} onChange={(v) => set("cash", v)} /></Field>
        </Two>
      }
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 12, marginTop: 8 }}>
        <Snap label="Total assets" value={fmtK(calc.totalAssets)} />
        <Snap label="Total debt" value={fmtK(calc.totalDebt)} />
        <Snap label="Net worth today" value={fmtK(calc.netWorth)} />
      </div>
    </div>);

}

// ---------- 4. GROWTH ----------
function ScreenGrowth({ d, set }) {
  const hasProperty = d.ownsHome === "yes" || d.hasInv === "yes" && (d.investments || []).some((p) => (p.value || 0) > 0);
  return (
    <div>
      <ScreenHead
        eyebrow="About you · 4 of 5"
        title={hasProperty ? "Growth, and what you put away" : "What you put away"}
        lede={hasProperty ?
        "A couple of assumptions you can change any time. We keep them deliberately conservative." :
        "One question, and the one that funds everything else."} />
      
      {hasProperty &&
      <Two>
          <Field label="What do you think your property has grown by?" hint="Your best estimate of the yearly average.">
            <NumInput value={d.pastGrowth} onChange={(v) => set("pastGrowth", v)} prefix="" suffix="% p.a." step={0.5} />
          </Field>
          <Field label="What growth should we assume ahead?" hint="We default to a conservative 5% a year on all property.">
            <NumInput value={d.futureGrowth} onChange={(v) => set("futureGrowth", v)} prefix="" suffix="% p.a." step={0.5} />
          </Field>
        </Two>
      }
      <Field label="Roughly, what does the household spend each year?" hint="Living costs only, outside the mortgage. Food, bills, transport, kids, insurance, the lot. The Australian average for a family is around $100k a year.">
        <NumInput value={d.annualExpenses} onChange={(v) => set("annualExpenses", v)} />
      </Field>
      <Field label="How much can you save or invest each year?" hint="What's left after those living costs, this is what funds deposits.">
        <NumInput value={d.annualSavings} onChange={(v) => set("annualSavings", v)} />
      </Field>
    </div>);

}

// ---------- 5. INFLATION ----------
function ScreenInflation({ d, set, calc }) {
  return (
    <div>
      <ScreenHead
        eyebrow="About you · 5 of 5"
        title="Has your income kept up?"
        emphasis="kept up"
        lede="A raise can quietly be a pay cut. Let's see how your income has tracked against the cost of living." />
      
      <Two>
        <Field
          label={d.employment === "payg" && d.incomeMode === "dual" ? "Combined income about 5 years ago?" : "Your income about 5 years ago?"}
          hint="A rough figure is fine, per year, before tax.">
          <NumInput value={d.income5yrAgo} onChange={(v) => set("income5yrAgo", v)} />
        </Field>
        <Field label="What's inflation been over that time?" hint="Australian CPI has averaged around 3.8% a year over the last five years.">
          <NumInput value={d.inflationBenchmark} onChange={(v) => set("inflationBenchmark", v)} prefix="" suffix="% p.a." step={0.1} />
        </Field>
      </Two>
      <IncomeVsInflation calc={calc} d={d} />
    </div>);

}

// ---------- 6. NET WORTH ----------
function ScreenNetWorth({ d, calc }) {
  const segs = [
  { label: "Home equity", val: calc.futHome - calc.futHomeDebt },
  { label: "Investment equity", val: calc.futInv - calc.futInvDebt },
  { label: "Super", val: calc.futSuper },
  { label: "Cash", val: calc.futCash }].
  filter((s) => s.val > 0);
  const max = Math.max(calc.futNetWorth, 1);
  return (
    <div>
      <ScreenHead
        eyebrow="Where this leads · 1 of 4"
        title="If nothing changes"
        emphasis="nothing changes"
        lede={`Carrying on exactly as you are, here's where you land at ${d.retireAge}, ${calc.years} years from now, at ${d.futureGrowth}% a year.`} />
      
      <div style={{ background: C.emerald, borderRadius: 20, padding: "30px 28px", marginBottom: 24 }}>
        <div style={{ display: "flex", gap: 28, flexWrap: "wrap", alignItems: "flex-end" }}>
          <MiniStat dark label="Net worth today" value={fmtK(calc.netWorth)} />
          <span style={{ fontSize: 24, color: C.paper, opacity: 0.5, paddingBottom: 4 }}>→</span>
          <MiniStat dark accent label={`In ${calc.years} years`} value={fmtK(calc.futNetWorth)} />
        </div>
        <p style={{ color: C.paper90, fontFamily: F.body, fontSize: 16, lineHeight: 1.6, marginTop: 18, marginBottom: 0 }}>
          Passive income from that, at a 4.5% gross yield, is about <strong style={{ color: C.paper, fontWeight: 600 }}>{fmtK(calc.trajectoryPassive)} a year</strong>.
        </p>
      </div>
      <Eyebrow rule>What makes up that net worth</Eyebrow>
      {segs.map((s) =>
      <div key={s.label} style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 15, marginBottom: 7, fontWeight: 500 }}>
            <span>{s.label}</span><span>{fmtK(s.val)}</span>
          </div>
          <div style={{ height: 10, background: C.lighterMint, borderRadius: 999, overflow: "hidden" }}>
            <div className="bar-fill" style={{ height: "100%", width: `${s.val / max * 100}%`, background: C.emerald, borderRadius: 999, transformOrigin: "left", animation: `grow 1.2s ${EASE} both` }} />
          </div>
        </div>
      )}
      <SourceLine>Future property growth assumed at {d.futureGrowth}% p.a. · super return {d.superReturn}% p.a. · indicative only.</SourceLine>
    </div>);

}

// ---------- 7. LEAKS ----------
function ScreenLeaks({ d, calc }) {
  return (
    <div>
      <ScreenHead
        eyebrow="Where this leads · 2 of 4"
        title="Where money leaks on the way"
        emphasis="leaks"
        lede={`Two costs sit quietly inside that path. Neither arrives as a bill, but both are real, and large over ${calc.years} years.`} />
      
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 18 }}>
        <div style={{ background: C.lighterMint, borderRadius: 20, padding: "24px 24px 20px" }}>
          <h3 className="news-h3" style={{ fontFamily: F.display, fontWeight: 400, fontSize: 23, color: C.emerald, margin: "0 0 4px" }}>Interest on your home</h3>
          <p style={{ fontFamily: F.body, fontSize: 14, color: C.charcoal, lineHeight: 1.5, margin: "0 0 16px" }}>
            <strong style={{ fontWeight: 600 }}>Non-deductible debt</strong>, paid with after-tax dollars, nothing claimed back.
            {d.homeRepayType === "io" && " On interest only, the balance never falls, so the interest never eases."}
          </p>
          <div className="news-h2" style={{ fontFamily: F.display, fontWeight: 400, fontSize: 36, color: C.negative, lineHeight: 1, marginBottom: 14 }}><Money>{"\u2212" + fmtK(calc.homeInt.total)}</Money></div>
          <AreaChart tone="negative" data={calc.homeInt.schedule.map((p) => ({ x: p.yr, y: p.cum }))} years={calc.years}
          caption={`Cumulative home-loan interest, ${d.homeRepayType === "io" ? "interest only" : "P&I"}, at ${d.homeRate}% p.a.`} />
        </div>
        <div style={{ background: C.lighterMint, borderRadius: 20, padding: "24px 24px 20px" }}>
          <h3 className="news-h3" style={{ fontFamily: F.display, fontWeight: 400, fontSize: 23, color: C.emerald, margin: "0 0 4px" }}>Tax you'll pay</h3>
          <p style={{ fontFamily: F.body, fontSize: 14, color: C.charcoal, lineHeight: 1.5, margin: "0 0 16px" }}>
            At about <strong style={{ fontWeight: 600 }}>{fmtK(calc.taxPerYear)} a year</strong>, held flat, what leaves before you invest a dollar.
          </p>
          <div className="news-h2" style={{ fontFamily: F.display, fontWeight: 400, fontSize: 36, color: C.negative, lineHeight: 1, marginBottom: 14 }}><Money>{"\u2212" + fmtK(calc.taxTotal)}</Money></div>
          <AreaChart tone="negative" data={calc.taxSchedule.map((p) => ({ x: p.yr, y: p.cum }))} years={calc.years}
          caption="Cumulative tax, income held flat, no wage growth assumed." />
        </div>
      </div>
      <SourceLine>Home interest from a monthly amortisation schedule on a 25-year remaining term. Tax on FY2025–26 resident rates incl. Medicare{d.employment === "business" ? " plus 25% company tax on retained profit" : ""}. Indicative of scale, not a forecast.</SourceLine>
    </div>);

}

// ---------- 8. WORKING WEEK ----------
function ScreenWeek({ calc }) {
  return (
    <div>
      <ScreenHead
        eyebrow="Where this leads · 3 of 4"
        title="Your working week"
        lede="Of the five days you work, here's who each one is really for. Only the days at the end are earning for your own life." />
      
      <WorkWeek calc={calc} />
      <SourceLine>Each day valued at one-fifth of gross income ({fmtK(calc.grossIncome)}/yr). Principal is shown separately, it isn't lost, it builds your equity. Only tax and home interest leave for good.</SourceLine>
    </div>);

}

// ---------- 9. COST OVER TIME ----------
// The identity moment, a calibrated 0-100 score summarising the user's
// financial trajectory in one number (Wealth Velocity Score).
function WealthVelocityCard({ score, grade, type, color, firstName }) {
  const cx = 140, cy = 130, r = 100;
  const angle = Math.PI - (score / 100) * Math.PI;
  const px = cx + Math.cos(angle) * r;
  const py = cy - Math.sin(angle) * r;
  const trackPath = `M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`;
  const fillPath = `M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${px} ${py}`;
  return (
    <div style={{ background: C.paper, border: `1px solid ${C.grey}30`, borderRadius: 20, padding: "clamp(16px, 3.5vw, 28px)", marginBottom: 24 }}>
      <div style={{ display: "flex", gap: 24, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ flex: "0 0 auto", maxWidth: "100%" }}>
          <svg viewBox="0 0 280 160" style={{ width: "100%", maxWidth: 240, height: "auto", display: "block" }}>
            <path d={trackPath} stroke={`${C.grey}30`} strokeWidth="18" fill="none" strokeLinecap="round"></path>
            <path d={fillPath} stroke={color} strokeWidth="18" fill="none" strokeLinecap="round"></path>
            <text x={cx} y={cy - 24} fill={color} fontSize="56" fontFamily="Newsreader, serif" fontWeight="400" textAnchor="middle">{score}</text>
            <text x={cx} y={cy + 4} fill={C.charcoal} fontSize="11" fontFamily="Plus Jakarta Sans, sans-serif" fontWeight="500" textAnchor="middle" opacity="0.6" letterSpacing="0.1em">OUT OF 100</text>
          </svg>
        </div>
        <div style={{ flex: "1 1 280px", minWidth: 0 }}>
          <div style={{ fontFamily: F.body, fontWeight: 500, fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: C.emerald, opacity: 0.75, marginBottom: 8 }}>
            {firstName ? `${firstName}, your` : "Your"} Wealth Velocity Score
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 14, marginBottom: 10 }}>
            <div style={{ fontFamily: F.display, fontWeight: 400, fontSize: 48, color, lineHeight: 1 }}>{grade}</div>
            <div style={{ fontFamily: F.body, fontWeight: 600, fontSize: 18, color: C.charcoal }}>{type}</div>
          </div>
          <p style={{ fontFamily: F.body, fontSize: 14, color: C.charcoal, opacity: 0.85, lineHeight: 1.6, margin: 0, maxWidth: 380 }}>
            {grade === "A" && "You're rare. The maths is on your side. The question now is what to do with the surplus."}
            {grade === "B" && "Close. Real assets, real momentum, but specific levers untapped. The full plan finds them."}
            {grade === "C" && "Coasting. Not in trouble, not ahead. You're paying tax and interest your peers have learned how to redirect."}
            {grade === "D" && "The engine isn't built yet. Same income, same household, completely different outcome with three specific moves."}
            {grade === "F" && "You're not behind because you did anything wrong. You're behind because no one ever showed you the picture you're about to see."}
          </p>
        </div>
      </div>
    </div>
  );
}

// Where the household sits in the national distribution, anchored to ABS data.
function PercentileReadout({ calc, d }) {
  const pct = calc.nationalPercentile;
  const markers = [10, 25, 50, 75, 90];
  return (
    <div style={{ background: C.paper, border: `1px solid ${C.grey}30`, borderRadius: 20, padding: "clamp(16px, 3.5vw, 28px)", marginBottom: 24 }}>
      <div style={{ display: "flex", gap: 24, flexWrap: "wrap", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 22 }}>
        <div style={{ flex: "1 1 280px" }}>
          <div style={{ fontFamily: F.body, fontWeight: 500, fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: C.emerald, opacity: 0.75, marginBottom: 8 }}>
            {d.firstName ? `${d.firstName}, where` : "Where"} you sit nationally
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 10 }}>
            <div style={{ fontFamily: F.display, fontWeight: 400, fontSize: 56, color: C.emerald, lineHeight: 1 }}>P{pct}</div>
            <div style={{ fontFamily: F.body, fontSize: 14, color: C.charcoal, opacity: 0.75 }}>of Australian households</div>
          </div>
          <p style={{ fontFamily: F.body, fontSize: 14, color: C.charcoal, opacity: 0.85, lineHeight: 1.6, margin: 0, maxWidth: 380 }}>
            {pct >= 90 && <>Top decile. Real wealth. The question now is what you do with the surplus.</>}
            {pct >= 75 && pct < 90 && <>Top quartile. You're ahead of three in every four Australian households, but most at this level still aren't deploying capital efficiently.</>}
            {pct >= 50 && pct < 75 && <>Above the national median. Comfortable by raw numbers, but "above the middle" hasn't been enough for a comfortable retirement for over a decade.</>}
            {pct >= 25 && pct < 50 && <>Below the national median. You're behind half of Australian households on raw net worth, and the gap widens unless something changes.</>}
            {pct < 25 && <>Bottom quartile. At this position the age pension does most of the heavy lifting in retirement unless this changes.</>}
          </p>
        </div>
        <div style={{ flex: "0 0 auto", textAlign: "right" }}>
          <div style={{ fontFamily: F.body, fontWeight: 500, fontSize: 11, letterSpacing: "0.06em", textTransform: "uppercase", color: C.emerald, opacity: 0.7 }}>
            Median for {calc.ageBandLabel}
          </div>
          <div style={{ fontFamily: F.display, fontWeight: 400, fontSize: 24, color: C.charcoal, marginTop: 4, lineHeight: 1 }}><Money>{fmtK(calc.ageMedian)}</Money></div>
          <div style={{ fontFamily: F.body, fontSize: 13, color: calc.aboveAgeMedian ? C.emerald : C.negative, fontWeight: 600, marginTop: 6 }}>
            {calc.aboveAgeMedian ? "+" : ""}{calc.ageGapPct}% {calc.aboveAgeMedian ? "above" : "below"} median for your age
          </div>
        </div>
      </div>
      <div style={{ position: "relative", height: 56, marginTop: 8 }}>
        <div style={{ position: "absolute", left: 0, right: 0, top: 22, height: 12, borderRadius: 999, background: `linear-gradient(to right, ${C.negative}40 0%, #FAE5D9 25%, ${C.lighterMint} 50%, ${C.mint} 75%, ${C.emerald} 100%)` }}></div>
        {markers.map((m) => (
          <div key={m} style={{ position: "absolute", left: `${m}%`, top: 16, transform: "translateX(-50%)" }}>
            <div style={{ width: 2, height: 24, background: C.charcoal, opacity: 0.25 }}></div>
            <div style={{ fontFamily: F.body, fontSize: 10, color: C.charcoal, opacity: 0.6, marginTop: 4, textAlign: "center", position: "absolute", left: 1, transform: "translateX(-50%)" }}>P{m}</div>
          </div>
        ))}
        <div style={{ position: "absolute", left: `${Math.min(98, Math.max(2, pct))}%`, top: 14, transform: "translateX(-50%)" }}>
          <div style={{ width: 28, height: 28, borderRadius: "50%", background: C.emerald, border: `4px solid ${C.paper}`, boxShadow: `0 0 0 2px ${C.emerald}` }}></div>
        </div>
      </div>
      <div style={{ fontFamily: F.body, fontSize: 12, color: C.grey, marginTop: 18, lineHeight: 1.5 }}>
        Source: {calc.ABS_RELEASE_NOTE}.
      </div>
    </div>
  );
}

function ScreenCost({ d, calc }) {
  return (
    <div>
      <ScreenHead
        eyebrow="Where this leads · 4 of 4"
        title="What it costs you"
        lede="The same leak, tax plus non-deductible interest, shown by the week, then carried forward." />

      <WealthVelocityCard
        score={calc.wealthVelocityScore}
        grade={calc.wvsGrade}
        type={calc.wvsType}
        color={calc.wvsColor}
        firstName={d.firstName} />

      <PercentileReadout calc={calc} d={d} />

      <div style={{ background: "transparent", padding: 0, marginBottom: 24 }}>
        <LeakRow label="Income tax & Medicare" note={`About ${calc.days.tax.toFixed(1)} days of every week worked for the tax office.`} weekly={calc.week.tax} />
        <LeakRow label="Interest on your home" note={calc.homeIntYr > 0 ? `Non-deductible, after-tax money, gone. ${calc.days.homeInt.toFixed(1)} days a week.` : "No home interest, you're not carrying this leak."} weekly={calc.week.homeInt} />
        <LeakRow label="Principal on your home" note="Not a leak, this builds your equity. Shown for honesty." weekly={calc.week.homePrin} neutral />
        <div style={{ height: 1, background: C.grey, opacity: 0.4, margin: "6px 0" }} />
        <LeakRow label="Leaking every week" note="Tax plus non-deductible interest, money that never comes back." weekly={calc.week.leak} total />
      </div>
      <p style={{ fontFamily: F.body, fontSize: 16, lineHeight: 1.6, color: C.charcoal, maxWidth: 600 }}>
        At <strong style={{ fontWeight: 600 }}>{fmt(calc.week.leak)} a week</strong>, here's where that lands if nothing changes:
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 14 }}>
        <LeakProjection label="In 1 year" value={calc.leakPerYear} />
        <LeakProjection label="In 5 years" value={calc.leakPerYear * 5} />
        <LeakProjection label={`In ${calc.years} years`} value={calc.leakPerYear * calc.years} emphasis />
      </div>
      <SourceLine>Held flat at today's settings, scale, not a forecast. Excludes principal, which builds equity rather than leaking.</SourceLine>
    </div>);

}

// ---------- 10. INCOME TARGET ----------
// ---------- REALITY CHECK (only shown when there's no real plan) ----------
function ScreenReality({ d, set, calc }) {
  const expensesAtRetirement = calc.annualExpenses; // shown in today's dollars for honesty
  const sellingFee = calc.homeValueAtRetirement * 0.02;
  // Decade-by-decade burn-through years for the "lasts" stat
  const lastsWhole = Math.floor(calc.yearsCapitalLasts);
  return (
    <div>
      <ScreenHead
        eyebrow="Where this leads · the honest version"
        title="Where your current path lands"
        emphasis="current path"
        lede="There's no passive income building underneath you yet. Here's what the numbers look like when retirement comes, and what selling the home does and doesn't do." />
      

      {/* The hard line */}
      <div style={{ background: C.negative, borderRadius: 20, padding: "30px 28px", marginBottom: 24, color: C.paper }}>
        <div style={{ fontFamily: F.body, fontWeight: 500, fontSize: 12, letterSpacing: "0.02em", textTransform: "uppercase", color: C.paper, opacity: 0.9, marginBottom: 14 }}>
          What the numbers show
        </div>
        <div className="news-h1" style={{ fontFamily: F.display, fontWeight: 400, fontSize: 36, color: C.paper, lineHeight: 1.15, marginBottom: 14 }}>
          On your current path, the numbers don't reach a retirement you could live on.
        </div>
        <p style={{ fontFamily: F.body, fontSize: 16, color: C.paper, opacity: 0.92, lineHeight: 1.65, margin: 0, maxWidth: 580 }}>
          A typical Australian household runs at about <strong style={{ fontWeight: 600 }}>{fmtK(expensesAtRetirement)} a year</strong> in
          living costs alone, food, bills, transport, insurance, the rest of life, and that's
          before any mortgage{calc.homeBalanceAtRetirement > 0 ? " you'll still be paying" : ""}. With no passive income coming in,
          everything you spend in retirement has to come from what you've already saved or what you can sell.
        </p>
      </div>

      {/* Annual expense framing */}
      <Field label="Roughly, what does your household actually spend each year?" hint="Living costs only, outside the mortgage. Change this if $100k doesn't match your reality.">
        <NumInput value={d.annualExpenses} onChange={(v) => set("annualExpenses", v)} />
      </Field>

      {/* What you'll have */}
      <Eyebrow rule>What you'll have at {d.retireAge}</Eyebrow>
      <div style={{ background: C.lighterMint, borderRadius: 20, padding: "8px 24px 18px" }}>
        <BreakdownRow label="Super (combined)" value={calc.futSuper} note="What's grown over the years from contributions and returns." />
        <BreakdownRow label="Cash and savings" value={calc.futCash} note="Compounded at a low return, kept conservative." />
        {d.ownsHome === "yes" &&
        <BreakdownRow label="Home equity (if you sell)" value={calc.sellProceeds} note={`Sale value ${fmtK(calc.homeValueAtRetirement)}, less ~2% selling fees (${fmtK(sellingFee)}), less ~${fmtK(50000)} pre-sale improvements${calc.homeBalanceAtRetirement > 0 ? `, less ${fmtK(calc.homeBalanceAtRetirement)} mortgage still owing` : ""}.`} />
        }
        <div style={{ height: 1, background: C.grey, opacity: 0.4, margin: "6px 0" }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "14px 0" }}>
          <span style={{ fontFamily: F.body, fontWeight: 600, fontSize: 17, color: C.charcoal }}>Total capital to live on</span>
          <span className="news-h2" style={{ fontFamily: F.display, fontWeight: 400, fontSize: 34, color: C.emerald }}><Money>{fmtK(calc.totalCapitalAtRetirement)}</Money></span>
        </div>
      </div>

      {/* How long it lasts */}
      <div style={{ background: C.mint, borderRadius: 20, padding: "26px 28px", marginTop: 20 }}>
        <h3 className="news-h3" style={{ fontFamily: F.display, fontWeight: 400, fontSize: 24, color: C.emerald, margin: "0 0 12px" }}>How long does that actually last?</h3>
        <p style={{ fontFamily: F.body, fontSize: 16, lineHeight: 1.65, color: C.emerald, margin: "0 0 16px" }}>
          {fmtK(calc.annualExpenses)} a year today becomes <strong style={{ fontWeight: 600 }}>{fmtK(calc.annualExpensesAtRetirement)}</strong> by the time you retire, at {d.inflationBenchmark}% inflation. Spending the capital straight down at that rate (no investment return assumed, conservative), it lasts:
        </p>
        <div className="news-d" style={{ fontFamily: F.display, fontWeight: 400, fontSize: 64, color: C.emerald, lineHeight: 1 }}>
          {lastsWhole} <span style={{ fontSize: 24, opacity: 0.7 }}>{lastsWhole === 1 ? "year" : "years"}</span>
        </div>
        <p style={{ fontFamily: F.body, fontSize: 15, lineHeight: 1.65, color: C.emerald, margin: "16px 0 0", maxWidth: 560 }}>
          {lastsWhole < 15 ?
          <>Most people retiring at {d.retireAge} live another 25 to 30 years. On these numbers, the money runs out well before then.</> :
          lastsWhole < 25 ?
          <>That gets you most of the way, but not all of it. And the moment a market dip, a hospital bill, or any unexpected cost lands, the timeline shortens further.</> :
          <>Tight, and only if nothing goes wrong. No buffer, no inheritance for the kids, no margin for an aged-care event in your 80s.</>}
        </p>
      </div>

      {/* Sell the home scenario */}
      {d.ownsHome === "yes" &&
      <div style={{ background: C.lighterMint, borderRadius: 20, padding: "26px 28px", marginTop: 20 }}>
          <h3 className="news-h3" style={{ fontFamily: F.display, fontWeight: 400, fontSize: 24, color: C.emerald, margin: "0 0 12px" }}>And if you sell the home, what could you actually buy?</h3>
          <p style={{ fontFamily: F.body, fontSize: 15, lineHeight: 1.65, color: C.charcoal, margin: "0 0 16px" }}>
            Your home is the lever most Australians reach for. Here's the maths, honestly.
          </p>
          <div style={{ background: C.paper, borderRadius: 14, padding: "16px 18px", marginBottom: 16 }}>
            <SellRow label="Sale price (at retirement)" value={calc.homeValueAtRetirement} />
            <SellRow label="Selling fees (~2%)" value={-sellingFee} negative />
            <SellRow label="Pre-sale improvements" value={-50000} negative />
            {calc.homeBalanceAtRetirement > 0 && <SellRow label="Mortgage still owing" value={-calc.homeBalanceAtRetirement} negative />}
            <div style={{ height: 1, background: C.grey, opacity: 0.4, margin: "8px 0" }} />
            <SellRow label="What you walk away with" value={calc.sellProceeds} bold />
          </div>
          <p style={{ fontFamily: F.body, fontSize: 16, lineHeight: 1.7, color: C.charcoal, margin: 0 }}>
            Meanwhile, the median Australian capital city house, today around <strong style={{ fontWeight: 600 }}>{fmtK(calc.medianCapitalCityHouse)}</strong>, will be worth roughly <strong style={{ fontWeight: 600 }}>{fmtK(calc.cityHouseAtRetirement)}</strong> by then at {d.futureGrowth}% growth.
          </p>
          {calc.shortfallVsMedianCity > 0 ?
        <div style={{ background: C.negative, color: C.paper, borderRadius: 14, padding: "16px 18px", marginTop: 14 }}>
              <div style={{ fontFamily: F.body, fontWeight: 600, fontSize: 16, marginBottom: 6 }}>
                You're <strong>{fmtK(calc.shortfallVsMedianCity)} short</strong> of a median capital city home.
              </div>
              <div style={{ fontFamily: F.body, fontSize: 14, lineHeight: 1.55, opacity: 0.95 }}>
                That's the gap between selling your home and buying back into the same market. It usually means moving somewhere cheaper, further out, or smaller, to free up money to live on.
              </div>
            </div> :

        <div style={{ background: C.mint, color: C.emerald, borderRadius: 14, padding: "16px 18px", marginTop: 14, fontFamily: F.body, fontSize: 14, lineHeight: 1.55 }}>
              The sale would technically cover a capital city median, but you'd be putting all your capital into housing again, with nothing left over to live on. That isn't retirement, that's just moving house.
            </div>
        }
        </div>
      }

      {/* The bottom line */}
      <div style={{ background: "transparent", borderRadius: 20, padding: "30px 0 0", marginTop: 24 }}>
        <h3 className="news-h3" style={{ fontFamily: F.display, fontWeight: 400, fontSize: 26, color: C.emerald, margin: "0 0 14px" }}>Where this leaves you</h3>
        <p style={{ fontFamily: F.body, fontSize: 16, lineHeight: 1.7, color: C.charcoal, margin: 0, maxWidth: 600 }}>
          At today's cost of living, the path you're on doesn't reach a retirement you could live on. Super alone never has. Selling the home gives you a one-off lump sum, but the maths above shows what that actually buys. Without a plan that builds passive income alongside what you already have, the gap stays, and it's harder to close the longer it's left.
        </p>
        <p style={{ fontFamily: F.body, fontSize: 16, lineHeight: 1.7, color: C.charcoal, marginTop: 14, marginBottom: 0, maxWidth: 600 }}>
          The next screens show what a different path could look like. The choice is yours, this just makes it one you can see clearly.
        </p>
      </div>

      <div style={{ marginTop: 36, paddingTop: 28, borderTop: `1px solid ${C.grey}33` }}>
        <SourceLine>
          Living costs of {fmtK(calc.annualExpenses)}/yr today are inflation-adjusted to {fmtK(calc.annualExpensesAtRetirement)} at retirement, at your {d.inflationBenchmark}% CPI assumption (Australian family households sit around $100k–$110k a year outside the mortgage). Sell scenario: 2% selling fees, ~$50k pre-sale improvements, less any mortgage still owing, all standard rules of thumb. Median capital city house value as at early 2026 (CoreLogic 8-capital), grown at your {d.futureGrowth}% assumption. Capital-lasts figure assumes no investment return (conservative, real returns extend it, real spending creep shortens it). Indicative and educational, not financial advice.
        </SourceLine>
      </div>
    </div>);

}

function BreakdownRow({ label, value, note }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 20, padding: "16px 0" }}>
      <div style={{ flex: "1 1 auto" }}>
        <div style={{ fontFamily: F.body, fontWeight: 500, fontSize: 16, color: C.charcoal }}>{label}</div>
        <div style={{ fontFamily: F.body, fontSize: 13, color: C.charcoal, opacity: 0.75, lineHeight: 1.5, marginTop: 4, maxWidth: 480 }}>{note}</div>
      </div>
      <div style={{ fontFamily: F.body, fontWeight: 600, fontSize: 20, color: C.emerald, whiteSpace: "nowrap" }}>{fmtK(value)}</div>
    </div>);

}

function SellRow({ label, value, negative, bold }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "8px 0", borderBottom: `0px` }}>
      <span style={{ fontFamily: F.body, fontWeight: bold ? 600 : 500, fontSize: bold ? 16 : 15, color: C.charcoal }}>{label}</span>
      <span style={{ fontFamily: F.body, fontWeight: bold ? 700 : 500, fontSize: bold ? 20 : 16, color: negative ? C.negative : C.emerald, whiteSpace: "nowrap" }}>
        {negative ? "−" : ""}{fmtK(Math.abs(value))}
      </span>
    </div>);

}

function ScreenIncomeTarget({ d, set, calc }) {
  const tiers = [
  { key: "needBasics", label: "Basics", tag: "The non-negotiables", desc: "A roof, the bills, food, insurance, rates." },
  { key: "needLifestyle", label: "Lifestyle", tag: "How you actually live", desc: "The car, the kids' sport, family time, a holiday a year." },
  { key: "needLuxuries", label: "Luxuries", tag: "Why you're doing this", desc: "A proper holiday, a better car, capital to back what's next." }];

  return (
    <div>
      <ScreenHead
        eyebrow="Your plan · 1 of 2"
        title="The income you actually want"
        emphasis="actually want"
        lede="Split it into three honest tiers. The top one is the difference between getting by and the life you're working toward." />
      
      {tiers.map((t) =>
      <div key={t.key} style={{ background: C.lighterMint, borderRadius: 14, padding: "20px 22px", marginBottom: 14, display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 20, flexWrap: "wrap" }}>
          <div style={{ flex: "1 1 220px" }}>
            <h3 className="news-h3" style={{ fontFamily: F.display, fontWeight: 400, fontSize: 24, color: C.emerald, margin: 0 }}>{t.label}</h3>
            <div style={{ fontFamily: F.body, fontWeight: 500, fontSize: 12, letterSpacing: "0.02em", textTransform: "uppercase", color: C.grey, margin: "4px 0 8px" }}>{t.tag}</div>
            <p style={{ fontSize: 14, color: C.charcoal, lineHeight: 1.5, margin: 0 }}>{t.desc}</p>
          </div>
          <div style={{ width: 190 }}><NumInput value={d[t.key]} onChange={(v) => set(t.key, v)} suffix="/ yr" /></div>
        </div>
      )}
      <div style={{ background: "transparent", padding: 0, marginTop: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 18 }}>
          <div>
            <div style={{ fontFamily: F.body, fontWeight: 500, fontSize: 12, letterSpacing: "0.02em", textTransform: "uppercase", color: C.emerald, opacity: 0.7 }}>The income you want</div>
            <div className="news-h1" style={{ fontFamily: F.display, fontWeight: 400, fontSize: 44, color: C.emerald, lineHeight: 1, marginTop: 6 }}><Money>{fmt(calc.needTotal)}</Money><span style={{ fontSize: 17, opacity: 0.7 }}> / yr</span></div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontFamily: F.body, fontWeight: 500, fontSize: 12, letterSpacing: "0.02em", textTransform: "uppercase", color: C.emerald, opacity: 0.7 }}>On your current path</div>
            <div className="news-h2" style={{ fontFamily: F.display, fontWeight: 400, fontSize: 32, color: C.emerald, lineHeight: 1, marginTop: 6 }}><Money>{fmtK(calc.trajectoryPassive)}</Money><span style={{ fontSize: 15, opacity: 0.7 }}> / yr</span></div>
          </div>
        </div>
        {calc.incomeGap > 0 &&
        <p style={{ fontFamily: F.body, fontSize: 15, color: C.emerald, lineHeight: 1.6, marginTop: 18, marginBottom: 0 }}>
            You're short <strong style={{ fontWeight: 700 }}>{fmt(calc.incomeGap)} a year</strong>. Next, exactly what closes that gap.
          </p>
        }
      </div>
    </div>);

}

// ---------- 11. PLAN ----------
// ---------- ACQUISITION / MOVE FROM HERE (dashboard) ----------
function ScreenAcquire({ d, calc }) {
  const plan = calc.acqPlan;
  const endEquity = plan.series[plan.series.length - 1].equity;
  const startEquity = plan.series[0].equity;
  const propsAcquired = plan.series[plan.series.length - 1].count;
  const pool = calc.acqPool;
  const hasEquity = pool >= calc.acqAvgPrice * EQUITY_PER_BUY;
  const hasServicing = calc.borrowingHeadroom >= plan.loanPerProp;
  const canActNow = hasEquity && hasServicing;

  return (
    <div>
      <ScreenHead
        eyebrow="Your plan · 2 of 3"
        title="Your move from here"
        emphasis="move"
        lede={`You're on a path to about ${fmtK(calc.trajectoryPassive)} a year passive income, while leaking ${fmt(calc.leakPerYear)} a year to tax and interest. Here's what putting your equity to work could change.`} />
      

      {/* The capacity statement */}
      <div style={{ background: C.emerald, borderRadius: 20, padding: "36px 34px", marginBottom: 36 }}>
        <div style={{ fontFamily: F.body, fontWeight: 500, fontSize: 12, letterSpacing: "0.02em", textTransform: "uppercase", color: C.mint, marginBottom: 12 }}>
          Equity and cash you can put to work
        </div>
        <div style={{ display: "flex", gap: 28, flexWrap: "wrap", alignItems: "flex-end" }}>
          <div>
            <div className="news-d" style={{ fontFamily: F.display, fontWeight: 400, fontSize: 56, color: C.paper, lineHeight: 1 }}><Money>{fmtK(pool)}</Money></div>
            <div style={{ fontFamily: F.body, fontSize: 14, color: C.paper90, marginTop: 6 }}>usable equity at 80% LVR + cash</div>
          </div>
          {canActNow &&
          <div style={{ borderLeft: `1px solid ${C.paper}40`, paddingLeft: 24 }}>
              <div className="news-h1" style={{ fontFamily: F.display, fontWeight: 400, fontSize: 44, color: C.mint, lineHeight: 1 }}>{Math.max(1, calc.capacityCount)}</div>
              <div style={{ fontFamily: F.body, fontSize: 14, color: C.paper90, marginTop: 6, maxWidth: 230 }}>
                {Math.max(1, calc.capacityCount) === 1 ? "property you could start with now" : "properties that capacity could support"}
              </div>
            </div>
          }        </div>
        <p style={{ fontFamily: F.body, fontSize: 15, color: C.paper90, lineHeight: 1.6, marginTop: 18, marginBottom: 0, maxWidth: 560 }}>
          {canActNow ?
          <>Each house-and-land purchase needs about 19% up front, a 10% deposit, stamp duty (on the land only, so lower), and LMI. Divide your pool by that and you could move on one right now, without saving another dollar.</> :
          !hasEquity ?
          <>You're a little short of the ~{fmtK(calc.acqAvgPrice * EQUITY_PER_BUY)} a first purchase needs (10% deposit, stamps on land, LMI). Growth on what you hold, or a lift in savings, gets you there.</> :
          <>You have the deposit, but on income alone, borrowing capacity is the limit right now. As your income rises and rent comes in, that headroom opens up.</>}
        </p>
        {/* servicing line */}
        <div style={{ display: "flex", gap: 28, flexWrap: "wrap", marginTop: 22, paddingTop: 20, borderTop: `1px solid ${C.paper}33` }}>
          <div>
            <div style={{ fontFamily: F.body, fontWeight: 500, fontSize: 12, letterSpacing: "0.02em", textTransform: "uppercase", color: C.mint, marginBottom: 6 }}>Borrowing capacity</div>
            <div className="news-h2" style={{ fontFamily: F.display, fontWeight: 400, fontSize: 30, color: C.paper, lineHeight: 1 }}><Money>{fmtK(calc.borrowingCapacity)}</Money></div>
            <div style={{ fontFamily: F.body, fontSize: 13, color: C.paper90, marginTop: 5 }}>≈ 6 × income, incl. 80% of rent</div>
          </div>
          <div>
            <div style={{ fontFamily: F.body, fontWeight: 500, fontSize: 12, letterSpacing: "0.02em", textTransform: "uppercase", color: C.mint, marginBottom: 6 }}>Headroom to borrow</div>
            <div className="news-h2" style={{ fontFamily: F.display, fontWeight: 400, fontSize: 30, color: C.paper, lineHeight: 1 }}><Money>{fmtK(calc.borrowingHeadroom)}</Money></div>
            <div style={{ fontFamily: F.body, fontSize: 13, color: C.paper90, marginTop: 5 }}>after {fmtK(calc.existingLoans)} of existing loans</div>
          </div>
        </div>
      </div>

      {/* Debt vs equity stacked chart */}
      {propsAcquired > 0 ?
      <>
          <Eyebrow rule>Acquiring over the next {calc.acqHorizon} years</Eyebrow>
          <p style={{ fontFamily: F.body, fontSize: 16, lineHeight: 1.6, color: C.charcoal, maxWidth: 600, marginTop: 0 }}>
            Each band is a property's equity growing beneath you. New loans run interest-only for 5 years to keep cashflow strong, then flip to principal & interest and start cutting debt, which is why the grey debt band begins to shrink. As your income rises and rent comes in, capacity opens up for the next one. Three or so properties across {calc.acqHorizon} years is a realistic pace.
          </p>
          <div style={{ background: C.paper, border: `1px solid ${C.grey}40`, borderRadius: 20, padding: "22px 22px 18px" }}>
            <StackedAreaChart series={plan.series} caption={`Portfolio equity vs debt, ${plan.series[0].year}–${plan.series[plan.series.length - 1].year}, at ${d.futureGrowth}% growth. New loans interest-only 5 years then P&I. Indicative.`} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 14, marginTop: 32 }}>
            <BigStat label={`Portfolio in ${calc.acqHorizon} yrs`} value={fmtK(plan.series[plan.series.length - 1].value)} />
            <BigStat label="Your equity then" value={fmtK(endEquity)} emphasis />
            <BigStat label="Properties held" value={String(propsAcquired)} />
          </div>
        </> :

      <div style={{ background: C.lighterMint, borderRadius: 20, padding: "32px 32px" }}>
          <h3 className="news-h3" style={{ fontFamily: F.display, fontWeight: 400, fontSize: 24, color: C.emerald, margin: "0 0 12px" }}>What your first move depends on</h3>
          <p style={{ fontFamily: F.body, fontSize: 15, lineHeight: 1.65, color: C.charcoal, margin: 0 }}>
            {!hasEquity ?
          <>You're building toward the ~{fmtK(calc.acqAvgPrice * EQUITY_PER_BUY)} of deposit and costs a first purchase needs. At {d.futureGrowth}% growth on what you hold and {fmtK(d.annualSavings)} saved a year, the gap closes, and from there the recycling engine takes over.</> :
          <>The deposit is there. The piece to solve is borrowing capacity: at ≈6× income you can carry {fmtK(calc.borrowingCapacity)}, and existing loans of {fmtK(calc.existingLoans)} leave {fmtK(calc.borrowingHeadroom)}, short of the ~{fmtK(plan.loanPerProp)} a purchase needs. Lifting income, or restructuring existing debt, is what opens the door. A partner can map the shortest path.</>}
          </p>
        </div>
      }

      {/* Recycle cadence */}
      {plan.buyYears.length > 1 &&
      <div style={{ background: C.lighterMint, borderRadius: 20, padding: "32px 32px", marginTop: 36 }}>
          <h3 className="news-h3" style={{ fontFamily: F.display, fontWeight: 400, fontSize: 24, color: C.emerald, margin: "0 0 12px" }}>How the recycling works</h3>
          <p style={{ fontFamily: F.body, fontSize: 15, lineHeight: 1.65, color: C.charcoal, margin: 0 }}>
            Buy now, and a new build at {d.futureGrowth}% growth builds about <strong style={{ fontWeight: 600 }}>$90k of usable equity by year {calc.recycleYears || 3}</strong>. Pull that equity, use it as the next deposit, and go again, the plan below repeats that step:
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 16 }}>
            {plan.buyYears.map((b, i) =>
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ background: C.emerald, color: C.paper, borderRadius: 6, padding: "8px 16px", fontFamily: F.body, fontSize: 14, fontWeight: 500 }}>
                  {b.year}: property {b.to}
                </div>
                {i < plan.buyYears.length - 1 && <span style={{ color: C.grey }}>→</span>}
              </div>
          )}
          </div>
        </div>
      }

      {/* Tax benefit of a new build */}
      <div style={{ background: "transparent", border: `1px solid ${C.grey}40`, borderRadius: 20, padding: "32px 32px", marginTop: 36 }}>
        <h3 className="news-h3" style={{ fontFamily: F.display, fontWeight: 400, fontSize: 24, color: C.emerald, margin: "0 0 12px" }}>And it works against your tax</h3>
        <p style={{ fontFamily: F.body, fontSize: 15, lineHeight: 1.65, color: C.charcoal, margin: "0 0 16px" }}>
          Even at a modest 4% gross yield, a brand-new property runs at a small paper loss once depreciation and interest are counted. That loss comes off your taxable income.
        </p>
        <div style={{ display: "flex", gap: 28, flexWrap: "wrap" }}>
          <div>
            <div className="news-h2" style={{ fontFamily: F.display, fontWeight: 400, fontSize: 34, color: C.emerald, lineHeight: 1 }}>+{fmtK(calc.ngTaxSaved)}</div>
            <div style={{ fontFamily: F.body, fontSize: 13, color: C.emerald, opacity: 0.8, marginTop: 5 }}>back in your pocket each year while negatively geared</div>
          </div>
          <div>
            <div className="news-h2" style={{ fontFamily: F.display, fontWeight: 400, fontSize: 34, color: C.emerald, lineHeight: 1 }}><Money>{fmtK(calc.ngRent)}</Money></div>
            <div style={{ fontFamily: F.body, fontSize: 13, color: C.emerald, opacity: 0.8, marginTop: 5 }}>rent a year coming in (4% gross)</div>
          </div>
        </div>
      </div>

      {/* The endgame */}
      <div style={{ background: C.lighterMint, borderRadius: 20, padding: "32px 32px", marginTop: 36 }}>
        <h3 className="news-h3" style={{ fontFamily: F.display, fontWeight: 400, fontSize: 24, color: C.emerald, margin: "0 0 12px" }}>And how it ends</h3>
        <p style={{ fontFamily: F.body, fontSize: 15, lineHeight: 1.7, color: C.charcoal, margin: 0 }}>
          Hold these assets through to your retirement phase. Because they're brand-new when bought, holding 15+ years means the CGT discount applies in full. Then the choice is yours: <strong style={{ fontWeight: 600 }}>sell one or two, clear the debt on the rest</strong>, and the remaining unencumbered properties throw off the passive income you set as your target, around {fmt(calc.needTotal)} a year. Or sell a single one and pay off your own home outright. Same portfolio, your call.
        </p>
      </div>

      <SourceLine>Capacity = (usable equity at 80% LVR + cash) ÷ ~19% per purchase (10% deposit, stamp duty on land, LMI). Borrowing ≈ 6 × (income + 80% of rent), with income assumed to grow {(INCOME_GROWTH * 100).toFixed(1)}% p.a. New loans interest-only for {IO_YEARS} years then principal & interest. New-build tax position assumes 4% gross yield, ~2% p.a. depreciation, interest at {d.invRate}%, at your {(calc.marginal * 100).toFixed(1)}% marginal rate. Indicative and educational, not financial, tax or credit advice. A partner can model your exact position.</SourceLine>
    </div>);

}

function ScreenPlan({ d, set, calc }) {
  const toggleGoal = (g) => set("goals", d.goals.includes(g) ? d.goals.filter((x) => x !== g) : [...d.goals, g]);
  const goalOpts = ["Help my kids", "Upgrade our home", "Start or back a business", "Travel and free time", "Leave something behind"];
  return (
    <div>
      <ScreenHead
        eyebrow="Your plan · 2 of 2"
        title="What it takes, working backwards"
        emphasis="working backwards"
        lede="From the income you want and a 4.5% gross yield. Every number is shown, check the working yourself." />
      
      <div style={{ textAlign: "center", padding: "16px 0 8px", marginBottom: 28 }}>
        <div style={{ fontFamily: F.body, fontWeight: 500, fontSize: 12, letterSpacing: "0.02em", textTransform: "uppercase", color: C.emerald, opacity: 0.7, marginBottom: 12 }}>Properties to acquire</div>
        <div className="news-d" style={{ fontFamily: F.display, fontWeight: 400, fontSize: 88, color: C.emerald, lineHeight: 0.95 }}>{calc.propertiesNeeded}</div>
        <p style={{ fontFamily: F.body, fontSize: 15, color: C.charcoal, lineHeight: 1.6, maxWidth: 460, margin: "14px auto 0" }}>
          At about {fmtK(calc.avgPropPrice)} each, growing {d.futureGrowth}% a year, this closes a {fmtK(calc.equityGap)} equity gap and supports {fmt(calc.needTotal)} a year.
        </p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(170px,1fr))", gap: 14 }}>
        <BigStat label="Equity required" value={fmtK(calc.equityRequired)} />
        <BigStat label="Deposit per property" value={fmtK(calc.depositPerProp)} sub="~12% incl. costs" />
        <BigStat label="Total deposits" value={fmtK(calc.totalDepositsNeeded)} emphasis />
      </div>
      <SourceLine>Indicative only, not financial advice. Based on ~{fmtK(calc.avgPropPrice)} per property, 19% deposit + costs (10% deposit, stamps on land, LMI), {d.futureGrowth}% growth, 4.5% gross yield.</SourceLine>

      <div style={{ background: C.emerald, borderRadius: 20, padding: "32px 32px", marginTop: 36, display: "flex", flexDirection: "column" }}>
        <div style={{ fontFamily: F.body, fontWeight: 500, fontSize: 12, letterSpacing: "0.02em", textTransform: "uppercase", color: C.mint, marginBottom: 10 }}>Want our experts&rsquo; help?</div>
        <h3 className="news-h3" style={{ fontFamily: F.display, fontWeight: 400, fontSize: 26, color: C.paper, margin: "0 0 10px", lineHeight: 1.15 }}>Now you know what to do.</h3>
        <p style={{ fontFamily: F.body, fontSize: 16, lineHeight: 1.6, color: C.paper90, margin: 0 }}>
          If you need help executing, our partners are here.
        </p>
        <div style={{ marginTop: 24 }}>
          <Btn variant="primary" onEmerald onClick={() => {window.location.href = "find-an-expert.html";}}>Talk to an expert</Btn>
        </div>
      </div>

    </div>);

}

function ScreenPutToWork({ d, set, calc, next, goToKey }) {
  const [hovGoal, setHovGoal] = useState(null);
  const toggleGoal = (g) => set("goals", d.goals.includes(g) ? d.goals.filter((x) => x !== g) : [...d.goals, g]);
  const goalOpts = ["Help my kids", "Upgrade our home", "Start or back a business", "Travel and free time", "Leave something behind"];
  return (
    <div>
      <ScreenHead
        eyebrow="Your plan"
        title="What you can already put to work"
        emphasis="put to work"
        lede="Lenders will usually release equity up to 80% of a property's value, often the fastest source of deposits. Here's that, and how the rest of your plan comes together." />
      
      {calc.totalUsableEquity80 > 0 &&
      <>
          <div style={{ background: C.lighterMint, borderRadius: 20, padding: "10px 24px 18px" }}>
            {d.ownsHome === "yes" && calc.homeUsableEquity80 > 0 &&
          <EquityRow label="Your home" value={d.homeValue} debt={d.homeDebt} equity={calc.homeUsableEquity80} />
          }
            {calc.invEquity80.map((p, i) =>
          <EquityRow key={i} label={p.lender ? `Investment ${i + 1} · ${p.lender}` : `Investment ${i + 1}`} value={p.value} debt={p.debt} equity={p.equity80} />
          )}
            <div style={{ height: 1, background: C.grey, opacity: 0.4, margin: "6px 0" }} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "14px 0 8px" }}>
              <span style={{ fontFamily: F.body, fontWeight: 600, fontSize: 16, color: C.charcoal }}>Usable equity at 80% LVR</span>
              <span className="news-h3" style={{ fontFamily: F.display, fontWeight: 400, fontSize: 30, color: C.emerald }}><Money>{fmtK(calc.totalUsableEquity80)}</Money></span>
            </div>
          </div>
          <p style={{ fontFamily: F.body, fontSize: 15, lineHeight: 1.6, color: C.charcoal, marginTop: 14, maxWidth: 600 }}>
            That's roughly <strong style={{ fontWeight: 600 }}>{Math.floor(calc.totalUsableEquity80 / Math.max(1, calc.depositPerProp))}</strong> of
            the {calc.propertiesNeeded} deposit{calc.propertiesNeeded === 1 ? "" : "s"} you need, available without saving another dollar, if it suits your plan to use it.
          </p>
          <SourceLine>Usable equity = (property value × 80%) − loan balance, per property. Actual borrowing depends on servicing and each lender's policy.</SourceLine>
        </>
      }

      <div style={{ height: 1, background: C.grey, opacity: 0.4, margin: "32px 0" }} />

      {d.ownsHome === "yes" &&
      <Field label="Pay off your home, or build passive income?" hint="Paying it off gives certainty and no rent. Building income compounds faster but carries debt longer. Most plans blend the two, the choice is yours.">
          <Choice value={d.homePriority} onChange={(v) => set("homePriority", v)}
        options={[{ value: "payoff", label: "Pay off our home first" }, { value: "passive", label: "Build passive income" }]} />
        </Field>
      }
      <Field label="What's the tougher constraint right now?" hint="Borrowing power tracks income directly. If servicing is the blocker, income is the lever. If deposit is the blocker, savings and releasing equity are the levers.">
        <Choice value={d.blocker} onChange={(v) => set("blocker", v)}
        options={[{ value: "deposit", label: "Saving a deposit" }, { value: "servicing", label: "Borrowing power" }, { value: "both", label: "Both" }]} />
      </Field>
      <Insight blocker={d.blocker} d={d} calc={calc} />

      <Field label="Beyond retirement income, what else matters?" hint="Pick any that apply, these shape the order things happen in.">
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {goalOpts.map((g) => {
            const on = d.goals.includes(g);
            const isHov = hovGoal === g && !on;
            return (
              <button key={g} onClick={() => toggleGoal(g)} onMouseEnter={() => setHovGoal(g)} onMouseLeave={() => setHovGoal(null)} style={{ padding: "12px 16px", borderRadius: 10, border: `1px solid ${on || isHov ? C.emerald : C.grey}`, background: on ? C.emerald : isHov ? C.lighterMint : C.paper, color: on ? C.paper : C.charcoal, fontSize: 15, fontWeight: 500, cursor: "pointer", fontFamily: F.body, transform: isHov ? "translateY(-1px)" : "none", transition: `background .25s ${EASE}, color .25s ${EASE}, border-color .25s ${EASE}, transform .25s ${EASE}` }}>{g}</button>);

          })}
        </div>
      </Field>

      <div style={{ background: C.lighterMint, borderRadius: 20, padding: "28px 28px", marginTop: 16 }}>
        <h3 className="news-h3" style={{ fontFamily: F.display, fontWeight: 400, fontSize: 26, color: C.emerald, margin: "0 0 14px" }}>Your path, in one line</h3>
        <p style={{ fontSize: 16, lineHeight: 1.7, color: C.charcoal, margin: 0 }}>
          Acquire <strong style={{ fontWeight: 600 }}>{calc.propertiesNeeded} {calc.propertiesNeeded === 1 ? "property" : "properties"}</strong> over <strong style={{ fontWeight: 600 }}>{calc.years} years</strong>, needing about <strong style={{ fontWeight: 600 }}>{fmtK(calc.totalDepositsNeeded)}</strong> in deposits, to lift passive income from <strong style={{ fontWeight: 600 }}>{fmtK(calc.trajectoryPassive)}</strong> to <strong style={{ fontWeight: 600 }}>{fmt(calc.needTotal)}</strong> a year
          {d.ownsHome === "yes" && <>, {d.homePriority === "payoff" ? "with your home fully paid off" : "while using your home equity to move faster"}</>}.
        </p>
        {d.goals.length > 0 && <p style={{ fontSize: 14, color: C.charcoal, opacity: 0.85, marginTop: 12, marginBottom: 0 }}>Sequenced around what matters to you: {d.goals.join(" · ")}.</p>}
      </div>

      <p style={{ fontFamily: F.body, fontSize: 13, color: C.charcoal, marginTop: 28, maxWidth: 620, lineHeight: 1.5 }}>
        This is an educational projection, not financial advice. The numbers are indicative and depend on assumptions you can change. You're in charge of every decision here.
      </p>
      <p style={{ marginTop: 24 }}>
        <TextLink onClick={() => goToKey("terms")}>Assumptions &amp; terms</TextLink>
      </p>
    </div>);

}

// ---------- NEXT STEPS ----------
function ScreenNextSteps({ d, calc, next }) {
  const [lead, setLead] = useState({ name: "", email: "", mobile: "", sms: false });
  return (
    <div>
      <ScreenHead
        eyebrow="Your plan"
        title="Next steps"
        emphasis="steps"
        lede="Your full report is now ready. Most people would charge for this kind of information, we're here to change that, because we believe Aussies are more than capable." />
      
      <div style={{ background: C.lighterMint, borderRadius: 20, aspectRatio: "16 / 9", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 36 }}>
        <span style={{ fontFamily: F.body, fontWeight: 500, fontSize: 13, letterSpacing: "0.02em", textTransform: "uppercase", color: C.emerald, opacity: 0.6 }}>[ Image ]</span>
      </div>
      <ol style={{ listStyle: "none", margin: "0 0 8px", padding: 0, display: "flex", flexDirection: "column", gap: 18 }}>
        {[
        ["1", "Get your full report", "The complete projection and every assumption behind it, yours to keep, free."],
        ["2", "Build the finance strategy", "What you can borrow, how to structure it, which lenders fit. You can choose to engage our expert brokers to do this with you."],
        ["3", "Source the property, together", "If and when you're ready, we execute alongside you, never in front of you."]].
        map(([n, head, body]) =>
        <li key={n} style={{ display: "flex", gap: 18, alignItems: "flex-start" }}>
            <span style={{ flexShrink: 0, width: 34, height: 34, borderRadius: 6, background: C.lighterMint, color: C.emerald, fontFamily: F.body, fontWeight: 600, fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>{n}</span>
            <div>
              <div style={{ fontFamily: F.body, fontWeight: 600, fontSize: 17, color: C.charcoal, marginBottom: 3 }}>{head}</div>
              <div style={{ fontFamily: F.body, fontSize: 15, lineHeight: 1.55, color: C.charcoal, opacity: 0.85, maxWidth: 560 }}>{body}</div>
            </div>
          </li>
        )}
      </ol>

      <div style={{ background: C.lighterMint, borderRadius: 20, padding: "32px 32px", marginTop: 36 }}>
        <h3 className="news-h3" style={{ fontFamily: F.display, fontWeight: 400, fontSize: 24, color: C.emerald, margin: "0 0 8px" }}>Where should we send it?</h3>
        <p style={{ fontFamily: F.body, fontSize: 15, lineHeight: 1.6, color: C.charcoal, margin: "0 0 24px", maxWidth: 520 }}>
          Add your details and we&rsquo;ll email your full report straight away.
        </p>
        <Field label="Your name">
          <TextInput value={lead.name} onChange={(v) => setLead({ ...lead, name: v })} placeholder="Full name" />
        </Field>
        <Field label="Email" hint="We'll send your report to this address.">
          <TextInput value={lead.email} onChange={(v) => setLead({ ...lead, email: v })} placeholder="you@email.com" />
        </Field>
        <Field label="Mobile">
          <TextInput value={lead.mobile} onChange={(v) => setLead({ ...lead, mobile: v })} placeholder="04xx xxx xxx" />
        </Field>
        <label style={{ display: "flex", gap: 12, alignItems: "flex-start", cursor: "pointer", marginTop: 4 }}>
          <input type="checkbox" checked={lead.sms} onChange={(e) => setLead({ ...lead, sms: e.target.checked })} style={{ marginTop: 3, width: 18, height: 18, accentColor: C.emerald, flexShrink: 0 }} />
          <span style={{ fontFamily: F.body, fontSize: 14, lineHeight: 1.55, color: C.charcoal }}>
            It&rsquo;s OK to text me. We&rsquo;ll send occasional content and platform updates by SMS, you can opt out anytime.
          </span>
        </label>
        <div style={{ marginTop: 24 }}>
          <Btn variant="primary" onClick={() => {}}>Get my full report</Btn>
        </div>
      </div>

      <div style={{ background: C.emerald, borderRadius: 20, padding: "32px 32px", marginTop: 36 }}>
        <div style={{ fontFamily: F.body, fontWeight: 500, fontSize: 12, letterSpacing: "0.02em", textTransform: "uppercase", color: C.mint, marginBottom: 10 }}>Want our experts&rsquo; help?</div>
        <h3 className="news-h3" style={{ fontFamily: F.display, fontWeight: 400, fontSize: 26, color: C.paper, margin: "0 0 10px", lineHeight: 1.15 }}>Ready when you are.</h3>
        <p style={{ fontFamily: F.body, fontSize: 16, lineHeight: 1.6, color: C.paper90, margin: 0 }}>
          Book a call whenever it suits, there's no obligation, and the report is yours either way.
        </p>
        <div style={{ marginTop: 24 }}>
          <Btn variant="primary" onEmerald onClick={() => {window.location.href = "find-an-expert.html";}}>Talk to an expert</Btn>
        </div>
      </div>

      <p style={{ fontFamily: F.body, fontSize: 13, color: C.charcoal, marginTop: 28, maxWidth: 620, lineHeight: 1.5 }}>
        This is an educational projection, not financial advice. The numbers are indicative and depend on assumptions you can change. You're in charge of every decision here.
      </p>
    </div>);

}

// ---------- ASSUMPTIONS & TERMS ----------
function ScreenTerms({ d, calc }) {
  const rows = [
  ["Capital growth", `${d.futureGrowth}% p.a.`, "Applied to all property values. Default is a conservative 5%."],
  ["Rental yield (new builds)", "4% gross", "Used for income and the negative-gearing position on new acquisitions."],
  ["Deposit + costs per purchase", "≈ 19%", "10% deposit, stamp duty on the land only (house-and-land), plus LMI. Loan is ~90% of price."],
  ["Loan structure (new buys)", "5 yrs IO, then P&I", "Interest only for the first 5 years for cashflow, then principal & interest, debt starts reducing."],
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
  ["Annual household expenses", `${fmtK(d.annualExpenses || 100000)}/yr`, "Living costs outside the mortgage, editable. Australian family households sit around $100k–$110k a year."],
  ["Selling costs (home sale)", "~2% of sale + $50k", "Agent fees, legals and pre-sale improvements, standard rules of thumb when modelling a sell-down."],
  ["Median capital city house", "~$1.15M (early 2026)", "CoreLogic 8-capital median, grown at your future-growth assumption. Used to gauge what selling could buy."]];

  return (
    <div>
      <ScreenHead
        eyebrow="Your plan · 3 of 3"
        title="Assumptions & terms"
        lede="Every number in this tool rests on the assumptions below. They're shown in full so you can check the working and change anything that doesn't fit your situation." />
      

      <div style={{ background: C.lighterMint, borderRadius: 20, padding: "8px 24px 12px" }}>
        {rows.map(([label, value, note], i) =>
        <div key={i} style={{ padding: "16px 0", borderBottom: i < rows.length - 1 ? `1px solid ${C.grey}33` : "none" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 16 }}>
              <span style={{ fontFamily: F.body, fontWeight: 600, fontSize: 16, color: C.charcoal }}>{label}</span>
              <span style={{ fontFamily: F.body, fontWeight: 600, fontSize: 16, color: C.emerald, whiteSpace: "nowrap" }}>{value}</span>
            </div>
            <div style={{ fontFamily: F.body, fontSize: 14, color: C.charcoal, opacity: 0.8, lineHeight: 1.5, marginTop: 4, maxWidth: 560 }}>{note}</div>
          </div>
        )}
      </div>

      <Eyebrow rule>Terms</Eyebrow>
      <div style={{ fontFamily: F.body, fontSize: 15, lineHeight: 1.7, color: C.charcoal }}>
        <p style={{ marginTop: 0 }}>
          This tool is <strong style={{ fontWeight: 600 }}>educational</strong>. It is general information only and is not financial, tax, credit or legal advice. It does not consider your full personal circumstances, and nothing here is a recommendation to buy, sell or borrow.
        </p>
        <p>
          Every figure is an <strong style={{ fontWeight: 600 }}>indicative projection</strong>, not a forecast or a guarantee. Real outcomes depend on markets, interest rates, lender policy, your circumstances and decisions you make. Property values can fall as well as rise. Borrowing capacity shown here is a simplified rule of thumb, actual capacity is set by each lender's assessment, not by this tool.
        </p>
        <p>
          Tax treatment, including negative gearing, depreciation and capital gains, depends on your individual situation and current law, both of which can change. Figures hold income, rates and tax settings flat unless you change them, which keeps the picture simple but means the future will differ.
        </p>
        <p style={{ marginBottom: 0 }}>
          Before acting on anything here, speak with a licensed professional who can look at your full position. When you're ready, a partner can model your exact numbers with you, the decision, the timing and the commitment always stay yours.
        </p>
      </div>

      <div style={{ marginTop: 28, display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
        <Btn variant="primary" onClick={() => {}}>When you're ready, talk to a partner</Btn>
        <TextLink onClick={() => {}}>See how the access works</TextLink>
      </div>
    </div>);

}

// ---------- small shared helpers ----------
function CalloutQuiet({ children }) {
  return (
    <div style={{ background: C.mint, borderRadius: 14, padding: "20px 24px", marginTop: 24, marginBottom: 8, fontFamily: F.body, fontSize: 16, lineHeight: 1.6, color: C.emerald }}>
      {children}
    </div>);

}
function DualNote({ calc, d }) {
  if (!(d.employment === "payg" && d.incomeMode === "dual")) return null;
  const combined = (d.income || 0) + (d.income2 || 0);
  const saving = incomeTaxPAYG(combined) - calc.taxPaid;
  if (saving <= 100) return null;
  return (
    <div style={{ background: C.mint, borderRadius: 14, padding: "20px 24px", marginTop: 24, fontFamily: F.body, fontSize: 15, lineHeight: 1.6, color: C.emerald }}>
      Splitting that across two earners keeps about {fmt(saving)} a year more than one person earning {fmtK(combined)}, each income has its own tax-free threshold and lower brackets.
    </div>);

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
    </div>);

}

// ============================================================
// STEP 0, WHERE YOU STAND (self assessment)

function Insight({ blocker, d, calc }) {
  let msg;
  if (blocker === "servicing" || blocker === "both") {
    if (d.employment === "business") {
      msg = `Borrowing power follows your income. As a business owner, you decide how you're paid, lifting your declared salary (currently ${fmt(d.bizSalary || 0)}) raises your assessable income and what you can borrow, at the cost of more personal tax. That trade-off is the lever.`;
    } else if (d.incomeMode === "dual") {
      msg = `Borrowing power tracks income directly, and you already have two incomes on the application, most lenders assess both. On a combined ${fmt((d.income || 0) + (d.income2 || 0))} gross, more capacity comes from income growth on either income or reducing other commitments.`;
    } else {
      msg = `Borrowing power tracks your income directly. On ${fmt(d.income || 0)} gross, more capacity comes from income growth, reducing other commitments, or, if there's a second earner in the household, adding their income to the application.`;
    }
  } else {
    const yrs = Math.ceil((calc.depositPerProp || 0) / Math.max(1, d.annualSavings || 1));
    msg = `The deposit is the constraint. You're saving ${fmt(d.annualSavings || 0)} a year, at that rate, a single deposit takes about ${yrs} ${yrs === 1 ? "year" : "years"} from savings alone. Releasing equity from property you already own is usually the faster path.`;
  }
  return (
    <div style={{ marginTop: 28, marginBottom: 36, padding: "20px 24px", background: C.mint, borderRadius: 14, fontSize: 15, lineHeight: 1.6, color: C.emerald }}>
      {msg}
    </div>);

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
    </div>);

}

// H1 with optional italic-within-Newsreader emphasis (Section 3d)
function H1({ children, emphasis }) {
  let content = children;
  if (emphasis && typeof children === "string" && children.includes(emphasis)) {
    const [a, b] = children.split(emphasis);
    content =
    <>
        {a}
        <span style={{ fontStyle: "normal", color: C.emerald }}>{emphasis}</span>
        {b}
      </>;

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
        maxWidth: 760
      }}>
      
      {content}
    </h1>);

}

function Lede({ children }) {
  return (
    <p style={{ fontFamily: F.body, fontSize: 19, lineHeight: 1.55, color: C.charcoal, marginTop: 16, maxWidth: 640 }}>
      {children}
    </p>);

}

function Rule() {
  return <div style={{ height: 1, background: C.grey, opacity: 0.4, margin: "32px 0" }} />;
}

function Group({ title, children }) {
  return (
    <section style={{ marginBottom: 8 }}>
      {title && <Eyebrow>{title}</Eyebrow>}
      {children}
    </section>);

}

function Two({ children }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${React.Children.count(children)}, 1fr)`, gap: 18 }}>
      {children}
    </div>);

}

function BigStat({ label, value, sub, emphasis }) {
  return (
    <div
      style={{
        background: C.lighterMint,
        borderRadius: 14,
        padding: "22px 24px"
      }}>
      
      <div style={{ fontFamily: F.body, fontWeight: 500, fontSize: 13, letterSpacing: "0.02em", textTransform: "uppercase", color: C.emerald, opacity: 0.7, marginBottom: 8 }}>
        {label}
      </div>
      <div className="news-h2" style={{ fontFamily: F.display, fontWeight: 400, fontSize: 38, color: C.emerald, lineHeight: 1 }}>
        <Money>{value}</Money>
      </div>
      {sub && <div style={{ fontSize: 14, color: C.charcoal, marginTop: 8, lineHeight: 1.4 }}>{sub}</div>}
    </div>);

}

function MiniStat({ label, value, dark, accent }) {
  return (
    <div>
      <div style={{ fontFamily: F.body, fontWeight: 500, fontSize: 13, letterSpacing: "0.02em", textTransform: "uppercase", color: dark ? C.mint : C.grey, marginBottom: 7 }}>
        {label}
      </div>
      <div className="news-h2" style={{ fontFamily: F.display, fontWeight: 400, fontSize: 40, color: dark ? C.paper : C.emerald, lineHeight: 1 }}>
        <Money>{value}</Money>
      </div>
    </div>);

}

// The working week, a Mon–Fri strip segmented by where each day goes.
function WorkWeek({ calc }) {
  const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri"];
  // build ordered segments across 5 days
  const segs = [
  { key: "tax", label: "Tax", days: calc.days.tax, color: C.negative, fill: 0.85 },
  { key: "int", label: "Home interest", days: calc.days.homeInt, color: C.negative, fill: 0.55 },
  { key: "prin", label: "Home principal", days: calc.days.homePrin, color: C.grey, fill: 0.6 },
  { key: "left", label: "Earning for your life", days: calc.days.left, color: C.emerald, fill: 1 }].
  filter((s) => s.days > 0.01);

  return (
    <div style={{ marginTop: 8 }}>
      {/* day grid background with the segmented overlay */}
      <div style={{ position: "relative", borderRadius: 14, overflow: "hidden", border: `1px solid ${C.grey}` }}>
        {/* segmented bar */}
        <div style={{ display: "flex", height: 86 }}>
          {segs.map((s) =>
          <div
            key={s.key}
            style={{
              width: `${s.days / 5 * 100}%`,
              background: s.color,
              opacity: s.fill,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRight: `1px solid ${C.paper}`
            }}
            title={`${s.label}: ${s.days.toFixed(2)} days`}>
            
              {s.days > 0.5 &&
            <span style={{ fontFamily: F.body, fontWeight: 500, fontSize: 12, color: C.paper, textAlign: "center", padding: "0 6px", lineHeight: 1.3 }}>
                  {s.days.toFixed(1)}d
                </span>
            }
            </div>
          )}
        </div>
        {/* day dividers + labels */}
        <div style={{ display: "flex", borderTop: `1px solid ${C.grey}` }}>
          {dayNames.map((d) =>
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
              opacity: 0.7
            }}>
            
              {d}
            </div>
          )}
        </div>
      </div>

      {/* legend */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "10px 20px", marginTop: 16 }}>
        {segs.map((s) =>
        <div key={s.key} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 12, height: 12, borderRadius: 3, background: s.color, opacity: s.fill, display: "inline-block" }} />
            <span style={{ fontFamily: F.body, fontSize: 14, color: C.charcoal }}>
              {s.label}, <strong style={{ fontWeight: 600 }}>{s.days.toFixed(1)} {s.days === 1 ? "day" : "days"}</strong>
            </span>
          </div>
        )}
      </div>

      <p style={{ fontFamily: F.body, fontSize: 16, lineHeight: 1.6, color: C.charcoal, marginTop: 18, marginBottom: 0, maxWidth: 640 }}>
        That's <strong style={{ fontWeight: 600, color: C.negative }}>{calc.days.leak.toFixed(1)} days a week</strong> working
        purely to cover tax and home interest before you earn a dollar for yourself. The first day or so
        of every week, your Monday, is gone before it starts.
      </p>
    </div>);

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
          whiteSpace: "nowrap"
        }}>
        
        {sign}{fmt(Math.abs(weekly))}<span style={{ fontSize: 13, opacity: 0.7, fontWeight: 500, fontFamily: F.body }}> /wk</span>
      </div>
    </div>);

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
    </div>);

}

function LeakProjection({ label, value, emphasis }) {
  return (
    <div style={{ background: emphasis ? C.lighterMint : C.lighterMint, borderRadius: 14, padding: "20px 22px" }}>
      <div style={{ fontFamily: F.body, fontWeight: 500, fontSize: 13, letterSpacing: "0.02em", textTransform: "uppercase", color: C.emerald, opacity: 0.7, marginBottom: 8 }}>
        {label}
      </div>
      <div className="news-h2" style={{ fontFamily: F.display, fontWeight: 400, fontSize: 34, color: C.negative, lineHeight: 1 }}>
        <Money>{"\u2212" + fmtK(value)}</Money>
      </div>
    </div>);

}

// The working week strip lives above; chart below.
function SourceLine({ children }) {
  return (
    <div style={{ fontFamily: F.body, fontSize: 14, color: C.grey, marginTop: 16, lineHeight: 1.5 }}>
      {children}
    </div>);

}

// Cumulative area chart, zero baseline, Emerald line, soft Mint fill.
// Honest axes: y always starts at 0, scale never manipulated (Section 6c).
// Stacked area chart, accumulating equity layers per acquisition (ref-style).
// Emerald-family tonal bands so newer properties read as lighter layers.
function StackedAreaChart({ series, caption, maxLayers = 12 }) {
  const W = 620,H = 240,padL = 52,padR = 12,padT = 14,padB = 30;
  const plotW = W - padL - padR,plotH = H - padT - padB;
  const n = series.length;
  const maxTotal = Math.max(1, ...series.map((s) => s.value)); // value = equity + debt stacked
  const sx = (i) => padL + i / Math.max(1, n - 1) * plotW;
  const sy = (v) => padT + plotH - v / maxTotal * plotH;

  const layerCount = Math.max(...series.map((s) => s.layers.length), 0);
  // tonal ramp from Emerald to Mint across layers
  const ramp = ["#0A4B34", "#13684A", "#1C8460", "#2FA078", "#5BB994", "#88CFB0", "#A8D5B4", "#C2E3CE", "#D4E8B5", "#E0EFCB", "#EAF4DC", "#F1F8E8"];

  // build cumulative band paths (equity layers stacked, then debt band on top)
  const bands = [];
  for (let li = 0; li < layerCount; li++) {
    const top = [],bot = [];
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
  const debtTop = [],debtBot = [];
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
        {yTicks.map((t, i) =>
        <g key={i}>
            <line x1={padL} y1={sy(t)} x2={W - padR} y2={sy(t)} stroke={C.grey} strokeWidth="1" opacity={i === 0 ? 0.5 : 0.18} />
            <text x={padL - 8} y={sy(t) + 4} fontFamily="'Plus Jakarta Sans',sans-serif" fontSize="11" fill={C.grey} textAnchor="end">{fmtK(t)}</text>
          </g>
        )}
        {/* debt band first (behind), then equity layers on top */}
        <path d={debtPath} fill={C.grey} opacity="0.28" />
        {bands.map((b, i) => <path key={i} d={b.d} fill={b.color} opacity="0.92" />)}
        {/* total equity line */}
        <path d={"M " + series.map((s, i) => `${sx(i).toFixed(1)} ${sy(s.equity).toFixed(1)}`).join(" L ")} fill="none" stroke={C.emerald} strokeWidth="2" />
        {xLabels.map((s) =>
        <text key={s.year} x={sx(s.offset)} y={H - 9} fontFamily="'Plus Jakarta Sans',sans-serif" fontSize="10.5" fill={C.grey} textAnchor="middle">{s.year}</text>
        )}
      </svg>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginTop: 10 }}>
        <Legend swatch={C.emerald} label="Equity (your wealth)" />
        <Legend swatch={C.grey} label="Debt (the bank's share)" faded />
      </div>
      {caption && <div style={{ fontFamily: F.body, fontSize: 13, color: C.grey, lineHeight: 1.45, marginTop: 8 }}>{caption}</div>}
    </div>);

}

function Legend({ swatch, label, faded }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <span style={{ width: 12, height: 12, borderRadius: 3, background: swatch, opacity: faded ? 0.4 : 1, display: "inline-block" }} />
      <span style={{ fontFamily: F.body, fontSize: 13, color: C.charcoal }}>{label}</span>
    </div>);

}

function AreaChart({ data, years, caption, tone }) {
  const stroke = tone === "negative" ? C.negative : C.emerald;
  const fill = tone === "negative" ? C.negative : C.mint;
  const fillOpacity = tone === "negative" ? 0.18 : 0.55;
  const W = 380,H = 150,padL = 8,padR = 8,padT = 10,padB = 26;
  const plotW = W - padL - padR,plotH = H - padT - padB;
  const maxY = Math.max(1, ...data.map((d) => d.y));
  const maxX = Math.max(1, years);
  const sx = (x) => padL + x / maxX * plotW;
  const sy = (y) => padT + plotH - y / maxY * plotH;

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
        {ticks.map((t) =>
        <text key={t} x={sx(t)} y={H - 8} fontFamily="'Plus Jakarta Sans', sans-serif" fontSize="11" fill={C.grey} textAnchor={t === 0 ? "start" : t === maxX ? "end" : "middle"}>
            {t === 0 ? "now" : `yr ${t}`}
          </text>
        )}
      </svg>
      <div style={{ fontFamily: F.body, fontSize: 13, color: C.grey, lineHeight: 1.45, marginTop: 4 }}>{caption}</div>
    </div>);

}

// Income growth vs inflation, real-terms verdict.
function IncomeVsInflation({ calc, d }) {
  if (calc.incomeCAGR === null) {
    return (
      <div style={{ fontFamily: F.body, fontSize: 15, color: C.charcoal, opacity: 0.8, marginTop: 4 }}>
        Add a figure above and we'll work out whether your income has kept pace with inflation.
      </div>);

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
    body = `Growing about ${cagrPct}% a year against inflation of ${inflPct}%, you're roughly ${fmt(Math.abs(calc.realGapNow))} ahead of simply standing still. That gap is real spending power, the question is whether it's working for you or being absorbed by the leaks above.`;
  } else if (v === "pace") {
    headline = "Your income has just kept pace";
    body = `At about ${cagrPct}% a year against ${inflPct}% inflation, you're treading water, earning more on paper, but with the same real buying power as five years ago. Income alone isn't moving you forward.`;
  } else {
    headline = "Your income has fallen behind inflation";
    body = `Your pay has grown about ${cagrPct}% a year, but prices have risen ${inflPct}%. To hold the same buying power as five years ago you'd need to earn ${fmt(calc.realStandStill)} today, so in real terms you're around ${fmt(Math.abs(calc.realGapNow))} behind, even though the number on your payslip went up.`;
  }

  return (
    <div style={{ background: bg, borderRadius: 14, padding: "20px 22px", marginTop: 4 }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 16, flexWrap: "wrap", marginBottom: 10 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
          <span className="news-h3" style={{ fontFamily: F.display, fontWeight: 400, fontSize: 30, color: behind ? C.negative : C.emerald, lineHeight: 1 }}>
            {ahead ? "+" : ""}{cagrPct}%
          </span>
          <span style={{ fontFamily: F.body, fontSize: 13, color: C.emerald, opacity: 0.7 }}>your income / yr</span>
        </div>
        <span style={{ fontFamily: F.body, fontSize: 15, color: C.emerald, opacity: 0.5 }}>vs</span>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
          <span className="news-h3" style={{ fontFamily: F.display, fontWeight: 400, fontSize: 30, color: C.emerald, lineHeight: 1 }}>
            {inflPct}%
          </span>
          <span style={{ fontFamily: F.body, fontSize: 13, color: C.emerald, opacity: 0.7 }}>inflation / yr</span>
        </div>
      </div>
      <div style={{ fontFamily: F.body, fontWeight: 600, fontSize: 16, color: behind ? C.negative : C.emerald, marginBottom: 6 }}>
        {headline}
      </div>
      <p style={{ fontFamily: F.body, fontSize: 15, lineHeight: 1.6, color: C.charcoal, margin: 0 }}>{body}</p>
    </div>);

}


function Snap({ label, value }) {
  return (
    <div style={{ background: C.lighterMint, borderRadius: 14, padding: "16px 18px" }}>
      <div style={{ fontFamily: F.body, fontWeight: 500, fontSize: 12, letterSpacing: "0.02em", textTransform: "uppercase", color: C.emerald, opacity: 0.7, marginBottom: 6 }}>
        {label}
      </div>
      <div className="news-h3" style={{ fontFamily: F.display, fontWeight: 400, fontSize: 26, color: C.emerald, lineHeight: 1 }}>
        <Money>{value}</Money>
      </div>
    </div>);

}



ReactDOM.createRoot(document.getElementById("root")).render(<NestEggTrajectory />);