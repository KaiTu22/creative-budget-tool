import { SAG_RATES } from './constants'

// ─────────────────────────────────────────────
// FORMATTING HELPERS
// ─────────────────────────────────────────────
export function formatCurrency(n) {
  if (n == null || isNaN(n)) return '$0'
  return new Intl.NumberFormat('en-US', {
    style: 'currency', currency: 'USD', maximumFractionDigits: 0
  }).format(n)
}

export function formatPct(n) {
  if (n == null || isNaN(n)) return '0.00%'
  return (n * 100).toFixed(2) + '%'
}

export function parsePct(str) {
  // Accepts "50", "50%", "0.50" — always returns a decimal like 0.50
  const n = parseFloat(str)
  if (isNaN(n)) return 0
  return n > 1 ? n / 100 : n
}

// ─────────────────────────────────────────────
// CORE INVERSE MARKUP
// ─────────────────────────────────────────────

// Cost = Investment / (1 + markup)
// Used for Influencer and Branded Content P&T portion
export function calcCostFromMarkup(investment, markupPct) {
  if (!investment || !markupPct) return { cost: investment, margin: 0, marginPct: 0 }
  const cost      = investment / (1 + markupPct)
  const margin    = investment - cost
  const marginPct = investment > 0 ? margin / investment : 0
  return { cost, margin, marginPct }
}

// ─────────────────────────────────────────────
// INFLUENCER & BRANDED CONTENT
// ─────────────────────────────────────────────
export function calcInfluencerSplit(totalInvestment, mediaPct, markupPct) {
  const mediaInvestment = totalInvestment * mediaPct
  const ptInvestment    = totalInvestment - mediaInvestment
  const { cost: ptCost, margin: ptMargin, marginPct: ptMarginPct } =
    calcCostFromMarkup(ptInvestment, markupPct)

  return {
    totalInvestment,
    mediaInvestment,
    ptInvestment,
    ptCost,        // available budget for talent + production
    ptMargin,
    ptMarginPct,
    workingAmount:    mediaInvestment,
    nonWorkingAmount: ptInvestment,
  }
}

// Convert media $ to pct or pct to $
export function mediaAmountToPct(mediaAmount, totalInvestment) {
  if (!totalInvestment) return 0
  return mediaAmount / totalInvestment
}
export function mediaPctToAmount(mediaPct, totalInvestment) {
  return totalInvestment * mediaPct
}

// ─────────────────────────────────────────────
// BLENDED SOCIAL
// ─────────────────────────────────────────────
export function calcBlendedSplit(totalInvestment, marginPct, mediaPct) {
  const marginAmount = totalInvestment * marginPct
  const mediaAmount  = totalInvestment * mediaPct
  const ptBudget     = totalInvestment - marginAmount - mediaAmount

  return {
    totalInvestment,
    marginAmount,
    marginPct,
    mediaAmount,
    mediaPct,
    ptBudget,
    workingAmount:    totalInvestment, // all working for blended
    nonWorkingAmount: 0,
  }
}

// ─────────────────────────────────────────────
// SAG
// ─────────────────────────────────────────────
export function calcSAG(talentCostPerUnit, qty, sagKey) {
  const talentTotal = talentCostPerUnit * qty
  const sagRate     = SAG_RATES[sagKey]?.rate ?? 0
  const sagCost     = talentTotal * sagRate
  return { talentTotal, sagCost, lineTotal: talentTotal + sagCost }
}

// ─────────────────────────────────────────────
// BUDGET WORKBENCH
// ─────────────────────────────────────────────
export function calcLineItemTotal(line) {
  const base = (line.costPerUnit || 0) * (line.qty || 0)
  if (line.type === 'talent') {
    const sagRate = SAG_RATES[line.sagType]?.rate ?? 0
    return base + (base * sagRate)
  }
  return base
}

export function calcWorkbenchTotals(lines, availableBudget, calcFn) {
  const fn = calcFn || calcLineItemTotal
  const allocated = lines.reduce((sum, l) => sum + fn(l), 0)
  const remaining = availableBudget - allocated
  return { allocated, remaining, isOverBudget: remaining < 0 }
}

// ─────────────────────────────────────────────
// VERSION SUMMARY ROLLUP
// ─────────────────────────────────────────────
export function calcVersionTotals(packages) {
  return packages.reduce((acc, pkg) => {
    acc.totalInvestment    += pkg.totalInvestment    || 0
    acc.workingAmount      += pkg.workingAmount      || 0
    acc.nonWorkingAmount   += pkg.nonWorkingAmount   || 0
    acc.totalMediaInvest   += pkg.mediaInvestment    || 0
    acc.totalPTInvest      += pkg.ptInvestment       || 0
    acc.totalInternalBudget+= pkg.ptCost             || 0
    return acc
  }, {
    totalInvestment:     0,
    workingAmount:       0,
    nonWorkingAmount:    0,
    totalMediaInvest:    0,
    totalPTInvest:       0,
    totalInternalBudget: 0,
  })
}