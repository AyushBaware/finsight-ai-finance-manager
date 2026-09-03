// Shared math so Dashboard, Accounts, and Expenses all agree on what a
// "balance" means: opening balance + income − expenses, all tagged to
// that account. Deliberately all-time, not month-scoped.

export const calculateAccountSpend = (account, expenses = []) =>
  expenses
    .filter((expense) => (expense.accountId || "cash") === account.id && expense.type !== "income")
    .reduce((sum, expense) => sum + (Number(expense.amount) || 0), 0)

export const calculateAccountIncome = (account, expenses = []) =>
  expenses
    .filter((expense) => (expense.accountId || "cash") === account.id && expense.type === "income")
    .reduce((sum, expense) => sum + (Number(expense.amount) || 0), 0)

export const calculateAccountBalance = (account, expenses = []) =>
  (Number(account.openingBalance) || 0) +
  calculateAccountIncome(account, expenses) -
  calculateAccountSpend(account, expenses)