// Shared category → icon glyph mapping so expense rows are visually
// scannable at a glance without reading text first.
const CATEGORY_ICONS = {
  "Food & Dining": "🍽️",
  "Transport": "🚗",
  "Shopping": "🛍️",
  "Utilities": "💡",
  "Entertainment": "🎬",
  "Healthcare": "🏥",
  "Subscription": "📱",
  "Other": "📦",
}

export const getCategoryIcon = (category) => CATEGORY_ICONS[category] || CATEGORY_ICONS.Other

export default CATEGORY_ICONS