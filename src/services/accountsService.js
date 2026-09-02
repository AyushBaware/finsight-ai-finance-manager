const ACCOUNTS_KEY = "finsight_accounts_v1"
const ACCOUNTS_UPDATED_EVENT = "accountsUpdated"

const defaultAccounts = [
  { id: "cash", name: "Cash", icon: "💵", openingBalance: 0 },
  { id: "bank", name: "Bank", icon: "🏦", openingBalance: 0 },
  { id: "card", name: "Card", icon: "💳", openingBalance: 0 },
]

function getAccounts() {
  try {
    const raw = localStorage.getItem(ACCOUNTS_KEY)
    if (!raw) return defaultAccounts
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : defaultAccounts
  } catch (e) {
    console.error("Failed to read accounts", e)
    return defaultAccounts
  }
}

function saveAccounts(accounts) {
  try {
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts))
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent(ACCOUNTS_UPDATED_EVENT, { detail: { accounts } }))
    }
    return true
  } catch (e) {
    console.error("Failed to save accounts", e)
    return false
  }
}

function addAccount({ name, icon, openingBalance }) {
  const accounts = getAccounts()
  const id = `acc_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
  const nextAccounts = [
    ...accounts,
    {
      id,
      name: name.trim(),
      icon: icon?.trim() || "💰",
      openingBalance: Number.isFinite(Number(openingBalance)) ? Number(openingBalance) : 0,
    },
  ]
  saveAccounts(nextAccounts)
  return nextAccounts
}

function updateAccount(id, updates) {
  const accounts = getAccounts()
  const nextAccounts = accounts.map((account) =>
    account.id === id ? { ...account, ...updates } : account,
  )
  saveAccounts(nextAccounts)
  return nextAccounts
}

// Never allow deleting the last remaining account — every expense needs
// somewhere to live, and the rest of the app assumes at least one exists.
function deleteAccount(id) {
  const accounts = getAccounts()
  if (accounts.length <= 1) return accounts
  const nextAccounts = accounts.filter((account) => account.id !== id)
  saveAccounts(nextAccounts)
  return nextAccounts
}

// Falls back to the first known account (Cash by default) if an expense
// points at an account that's since been deleted — keeps the UI from
// ever showing a blank/broken wallet reference.
function getAccountById(id) {
  const accounts = getAccounts()
  return accounts.find((account) => account.id === id) || accounts[0]
}

export const ACCOUNTS_UPDATED = ACCOUNTS_UPDATED_EVENT

export default {
  getAccounts,
  saveAccounts,
  addAccount,
  updateAccount,
  deleteAccount,
  getAccountById,
  defaultAccounts,
}