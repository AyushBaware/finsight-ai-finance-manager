const CATEGORIES_KEY = "finsight_categories_v1"

const defaultCategories = [
  { id: 1, name: "Food & Dining", emoji: "Meal" },
  { id: 2, name: "Transport", emoji: "Ride" },
  { id: 3, name: "Shopping", emoji: "Shop" },
  { id: 4, name: "Utilities", emoji: "Bill" },
  { id: 5, name: "Entertainment", emoji: "Fun" },
  { id: 6, name: "Healthcare", emoji: "Care" },
  { id: 7, name: "Subscription", emoji: "Plan" },
  { id: 8, name: "Other", emoji: "Misc" },
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

export default {
  getCategories,
  saveCategories,
  defaultCategories,
}