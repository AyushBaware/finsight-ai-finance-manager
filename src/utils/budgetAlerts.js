import categoriesService from "../services/categoriesService"
import { showToast } from "./toastStore"

const ALERT_STATE_KEY = "finsight_budget_alert_state_v1"

const getMonthKey = () => {
  const now = new Date()
  return `${now.getFullYear()}-${now.getMonth()}`
}

const readAlertState = () => {
  try {
    return JSON.parse(sessionStorage.getItem(ALERT_STATE_KEY) || "{}")
  } catch {
    return {}
  }
}

const writeAlertState = (state) => {
  try {
    sessionStorage.setItem(ALERT_STATE_KEY, JSON.stringify(state))
  } catch {
    // ignore quota errors
  }
}

const calculateCurrentMonthCategoryTotal = (expenses = [], category) => {
  const today = new Date()
  const currentMonth = today.getMonth()
  const currentYear = today.getFullYear()

  return expenses.reduce((total, expense) => {
    if (expense.category !== category) return total
    const expenseDate = new Date(expense.date)
    if (Number.isNaN(expenseDate.getTime())) return total
    const isCurrentMonth =
      expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear
    return isCurrentMonth ? total + (Number(expense.amount) || 0) : total
  }, 0)
}

// Called right after an expense is added. Fires a toast the first time a
// category crosses 80% or 100% of its budget in a given month — de-duped
// via sessionStorage so it doesn't nag on every render or every add.
export const checkBudgetThreshold = (categoryName, expenses) => {
  if (!categoryName) return

  const categories = categoriesService.getCategories()
  const category = categories.find((item) => item.name === categoryName)
  if (!category?.monthlyLimit || category.monthlyLimit <= 0) return

  const spent = calculateCurrentMonthCategoryTotal(expenses, categoryName)
  const percentUsed = (spent / category.monthlyLimit) * 100

  const stateKey = `${categoryName}:${getMonthKey()}`
  const alertState = readAlertState()
  const lastAlertedTier = alertState[stateKey] || 0

  let tier = 0
  let message = null

  if (percentUsed >= 100 && lastAlertedTier < 100) {
    tier = 100
    message = `You've crossed your Rs ${category.monthlyLimit.toLocaleString()} budget for ${categoryName} this month.`
  } else if (percentUsed >= 80 && lastAlertedTier < 80) {
    tier = 80
    message = `Heads up — you're at ${Math.round(percentUsed)}% of your ${categoryName} budget this month.`
  }

  if (message) {
    showToast(message, tier === 100 ? "error" : "warning", 5000)
    writeAlertState({ ...alertState, [stateKey]: tier })
  }
}

export default { checkBudgetThreshold };