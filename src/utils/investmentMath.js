// SIP (Systematic Investment Plan) math.
//
// These are pure, deterministic financial formulas — the standard
// "future value of an annuity due" calculation used by every mutual fund
// SIP calculator (the same math Groww/Kuvera/ET Money show you). Nothing
// here is personalized advice; it's arithmetic based on numbers the user
// enters themselves, plus a category-level historical return assumption
// that is always shown, never hidden.

// Illustrative, historical-range midpoints per category — NOT a promise of
// future returns. Always disclose this assumption in the UI next to any
// number calculated from it.
export const CATEGORY_RETURN_ASSUMPTIONS = {
  liquid: 6,
  debt: 7,
  hybrid: 9,
  index: 11,
  equity: 12,
  elss: 12,
  other: 8,
}

/**
 * Averages the return assumption across whichever categories the backend
 * actually matched for this horizon, so the assumption always lines up
 * with the real funds being shown alongside it.
 */
export const getBlendedAnnualReturn = (categories = []) => {
  const validCategories = categories.filter((category) => CATEGORY_RETURN_ASSUMPTIONS[category])
  if (validCategories.length === 0) return CATEGORY_RETURN_ASSUMPTIONS.other

  const total = validCategories.reduce(
    (sum, category) => sum + CATEGORY_RETURN_ASSUMPTIONS[category],
    0,
  )
  return total / validCategories.length
}

/**
 * How much would someone need to invest EVERY MONTH to reach `goalAmount`
 * in `months`, assuming `annualReturnPercent` annual growth, compounded
 * monthly, with each SIP installment made at the start of the month
 * (the standard "annuity due" assumption most SIP calculators use).
 */
export const calculateRequiredMonthlySIP = ({ goalAmount, months, annualReturnPercent }) => {
  if (!Number.isFinite(goalAmount) || goalAmount <= 0) return null
  if (!Number.isFinite(months) || months <= 0) return null

  const monthlyRate = (annualReturnPercent || 0) / 12 / 100

  if (monthlyRate === 0) {
    return goalAmount / months
  }

  const growthFactor = ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate)
  return goalAmount / growthFactor
}

/**
 * The inverse question: if someone can only invest `monthlyInvestment` per
 * month, how many months would it take to reach `goalAmount`? Used to show
 * "here's a realistic timeline" when the ideal timeline isn't affordable.
 */
export const calculateMonthsToReachGoal = ({ goalAmount, monthlyInvestment, annualReturnPercent }) => {
  if (!Number.isFinite(goalAmount) || goalAmount <= 0) return null
  if (!Number.isFinite(monthlyInvestment) || monthlyInvestment <= 0) return null

  const monthlyRate = (annualReturnPercent || 0) / 12 / 100

  if (monthlyRate === 0) {
    return Math.ceil(goalAmount / monthlyInvestment)
  }

  const ratio = (goalAmount * monthlyRate) / (monthlyInvestment * (1 + monthlyRate))
  const months = Math.log(1 + ratio) / Math.log(1 + monthlyRate)

  return Number.isFinite(months) ? Math.ceil(months) : null
}

export const formatMonthsAsYearsAndMonths = (totalMonths) => {
  if (!Number.isFinite(totalMonths) || totalMonths <= 0) return "—"

  const years = Math.floor(totalMonths / 12)
  const months = Math.round(totalMonths % 12)

  if (years === 0) return `${months} month${months === 1 ? "" : "s"}`
  if (months === 0) return `${years} year${years === 1 ? "" : "s"}`
  return `${years} year${years === 1 ? "" : "s"} ${months} month${months === 1 ? "" : "s"}`
}