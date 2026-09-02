// Shared math so Dashboard, Accounts, and Expenses all agree on what a
// "balance" means: opening balance minus everything ever tagged to that
// account. Deliberately all-time, not month-scoped — a wallet balance
// carries over, unlike a monthly leftover-money figure.

export const calculateAccountSpend = (account, expenses = []) =>
  expenses
    .filter((expense) => (expense.accountId || "cash") === account.id)
    .reduce((sum, expense) => sum + (Number(expense.amount) || 0), 0)

export const calculateAccountBalance = (account, expenses = []) =>
  (Number(account.openingBalance) || 0) - calculateAccountSpend(account, expenses)