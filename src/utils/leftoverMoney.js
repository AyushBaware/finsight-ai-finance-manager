// Computes "leftover money" for the current calendar month — the same
// concept already used in Analytics.jsx and Dashboard.jsx, pulled out here
// so the Goal Calculator uses the exact same definition rather than a
// second, possibly-drifting copy of the same logic.

export const calculateCurrentMonthExpenseTotal = (expenses = []) => {
  const today = new Date()
  const currentMonth = today.getMonth()
  const currentYear = today.getFullYear()

  return expenses.reduce((total, expense) => {
    const expenseDate = new Date(expense.date)
    if (Number.isNaN(expenseDate.getTime())) return total

    const isCurrentMonth =
      expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear

    return isCurrentMonth ? total + (Number(expense.amount) || 0) : total
  }, 0)
}

export const calculateCurrentMonthLeftover = (expenses = [], monthlyIncome = 0) => {
  const totalExpenses = calculateCurrentMonthExpenseTotal(expenses)
  return (Number(monthlyIncome) || 0) - totalExpenses
}