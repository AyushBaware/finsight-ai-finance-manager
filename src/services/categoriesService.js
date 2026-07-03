const CATEGORIES_KEY = "finsight_categories_v1"

const defaultCategories = [
  { id: 1, name: "Food & Dining", emoji: "Meal", monthlyLimit: null },
  { id: 2, name: "Transport", emoji: "Ride", monthlyLimit: null },
  { id: 3, name: "Shopping", emoji: "Shop", monthlyLimit: null },
  { id: 4, name: "Utilities", emoji: "Bill", monthlyLimit: null },
  { id: 5, name: "Entertainment", emoji: "Fun", monthlyLimit: null },
  { id: 6, name: "Healthcare", emoji: "Care", monthlyLimit: null },
  { id: 7, name: "Subscription", emoji: "Plan", monthlyLimit: null },
  { id: 8, name: "Other", emoji: "Misc", monthlyLimit: null },
]

function getCategories() {
  try {
    const raw = localStorage.getItem(CATEGORIES_KEY)
    if (!raw) return defaultCategories
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : defaultCategories
  } catch (e) {
    console.error("Failed to read categories", e)
    return defaultCategories
  }
}

function saveCategories(categories) {
  try {
    localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories))
    return true
  } catch (e) {
    console.error("Failed to save categories", e)
    return false
  }
}

function updateCategoryLimit(id, limit) {
  const categories = getCategories()
  const nextCategories = categories.map((category) =>
    category.id === id ? { ...category, monthlyLimit: limit } : category,
  )
  saveCategories(nextCategories)
  return nextCategories
}

export default {
  getCategories,
  saveCategories,
  updateCategoryLimit,
  defaultCategories,
}