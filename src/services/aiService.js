// Smart Suggestions Service
//
// IMPORTANT — HONESTY NOTE FOR THIS PROJECT:
// Everything in this file is deterministic, rule-based financial logic
// (allocation percentages, threshold checks, standard formulas). It is NOT
// a machine-learning model or an LLM. We label it "Smart Suggestions"
// rather than "AI" in the UI for that reason — it's genuinely useful,
// explainable, and debuggable logic, and there's no need to oversell it.
// (A real LLM-backed conversational advisor, if added later, should live
// in a separate service and be clearly labeled as AI-generated.)

const generateSmartSuggestions = (financialData) => {
  const {
    monthlyIncome,
    totalExpenses,
    expenses,
    savingsGoal,
    riskTolerance = "medium",
  } = financialData

  const leftoverMoney = monthlyIncome - totalExpenses
  const expensesByCategory = categorizeExpenses(expenses)

  const suggestions = []

  // 1. Smart Leftover Money Allocation
  if (leftoverMoney > 0) {
    const allocation = allocateLeftoverMoney(leftoverMoney, riskTolerance)
    suggestions.push({
      id: "allocation",
      title: "💰 Smart Money Allocation",
      desc: `You have ₹${leftoverMoney.toLocaleString()} leftover this month`,
      details: allocation,
      priority: "high",
      category: "allocation",
      icon: "💰",
      source: "rules",
    })
  }

  // 2. Investment Recommendations
  // NOTE: these are illustrative category-level allocations (e.g. "Mutual
  // Funds (Balanced)"), not specific fund names or buy recommendations.
  // Real, live fund matching lives in the upcoming Goal-Based Investment
  // Planner, which pulls actual AMFI NAV data through the backend.
  if (leftoverMoney > 1000) {
    const investments = getInvestmentRecommendations(
      leftoverMoney,
      riskTolerance
    )
    suggestions.push({
      id: "investment",
      title: "📈 Investment Opportunities",
      desc: `Consider allocating ₹${Math.floor(leftoverMoney * 0.5).toLocaleString()} towards long-term goals`,
      details: investments,
      priority: "high",
      category: "investment",
      icon: "📈",
      action: "Plan a Goal",
      source: "rules",
    })
  }

  // 3. Spending Insights — reframed to be informative, not accusatory.
  const topCategory = Object.entries(expensesByCategory).sort(
    ([, a], [, b]) => b - a
  )[0]
  if (topCategory) {
    const categorySpend = topCategory[1]
    const avgSpend = totalExpenses / Object.keys(expensesByCategory).length
    if (categorySpend > avgSpend * 1.3) {
      suggestions.push({
        id: "spending",
        title: "🔍 Category Worth a Look",
        desc: `${topCategory[0]} is your biggest category this month at ₹${categorySpend.toLocaleString()} (${((categorySpend / totalExpenses) * 100).toFixed(1)}% of total)`,
        details: `That's higher than your other categories. No action needed unless you want to explore ways to free up some room here.`,
        priority: "medium",
        category: "alert",
        icon: "🔍",
        source: "rules",
      })
    }
  }

  // 4. Savings Goal Progress
  if (savingsGoal) {
    const goalProgress = (leftoverMoney / savingsGoal) * 100
    suggestions.push({
      id: "savings",
      title: "🎯 Savings Goal Progress",
      desc: `${Math.min(goalProgress, 100).toFixed(1)}% towards your ₹${savingsGoal.toLocaleString()} goal`,
      details: `At this pace, saving ₹${Math.floor(leftoverMoney).toLocaleString()} per month keeps you moving forward.`,
      priority: goalProgress < 50 ? "high" : "low",
      category: "goal",
      icon: "🎯",
      progress: Math.min(goalProgress, 100),
      source: "rules",
    })
  }

  // 5. Emergency Fund Check
  const emergencyFundGoal = monthlyIncome * 6
  if (leftoverMoney > 0) {
    suggestions.push({
      id: "emergency",
      title: "🛡️ Emergency Fund",
      desc: `A buffer of ₹${emergencyFundGoal.toLocaleString()} (about 6 months of expenses) adds a lot of peace of mind`,
      details: `Setting aside ₹${Math.ceil(leftoverMoney * 0.3).toLocaleString()} monthly would build this steadily.`,
      priority: "high",
      category: "safety",
      icon: "🛡️",
      source: "rules",
    })
  }

  // 6. Expense Ratio Note — reframed away from "debt" framing when there's
  // no actual debt data; this is about the ratio of spend to income.
  if (totalExpenses > monthlyIncome * 0.8) {
    suggestions.push({
      id: "ratio",
      title: "📉 A Few Ideas to Create Breathing Room",
      desc: "Your expenses are close to your income this month — here are some optional ideas:",
      details: getExpenseReductionTips(expensesByCategory),
      priority: "high",
      category: "optimization",
      icon: "📉",
      source: "rules",
    })
  }

  // 7. Seasonal Insights
  const seasonalSuggestion = getSeasonalInsight()
  if (seasonalSuggestion) {
    suggestions.push({
      id: "seasonal",
      title: seasonalSuggestion.title,
      desc: seasonalSuggestion.desc,
      priority: "medium",
      category: "seasonal",
      icon: seasonalSuggestion.icon,
      source: "rules",
    })
  }

  // 8. Financial Health Score
  const suitabilityScore = calculateInvestmentSuitability(
    leftoverMoney,
    monthlyIncome,
    riskTolerance
  )
  if (suitabilityScore.score > 60) {
    suggestions.push({
      id: "suitability",
      title: "✨ Financial Health Score",
      desc: `Your financial health score: ${suitabilityScore.score}/100`,
      details: suitabilityScore.message,
      priority: "medium",
      category: "score",
      icon: "✨",
      source: "rules",
    })
  }

  return suggestions.sort((a, b) => {
    const priorityMap = { high: 3, medium: 2, low: 1 }
    return priorityMap[b.priority] - priorityMap[a.priority]
  })
}

// Helper: Allocate leftover money intelligently
const allocateLeftoverMoney = (amount, riskTolerance) => {
  const allocation = {
    emergency: amount * 0.2,
    savings: amount * 0.3,
    investments: amount * (riskTolerance === "high" ? 0.5 : 0.3),
    leisure: amount * (riskTolerance === "high" ? 0 : 0.2),
  }

  return [
    {
      category: "Emergency Fund",
      amount: Math.floor(allocation.emergency),
      percentage: 20,
      reason: "For unexpected expenses",
    },
    {
      category: "Regular Savings",
      amount: Math.floor(allocation.savings),
      percentage: 30,
      reason: "Build wealth gradually",
    },
    {
      category: "Investments",
      amount: Math.floor(allocation.investments),
      percentage: riskTolerance === "high" ? 50 : 30,
      reason: "Grow your money over time",
    },
    {
      category: "Personal/Leisure",
      amount: Math.floor(allocation.leisure),
      percentage: riskTolerance === "high" ? 0 : 20,
      reason: "Enjoy life while saving",
    },
  ]
}

// Helper: Get investment recommendations
// These are category-level illustrations only (asset class + approximate
// historical return ranges), never specific tickers/fund names, and never
// phrased as instructions to buy. Real fund matching happens server-side
// against live AMFI data in the Goal-Based Investment Planner.
const getInvestmentRecommendations = (amount, riskTolerance) => {
  const recommendations = {
    low: [
      {
        name: "Fixed Deposits",
        allocation: Math.floor(amount * 0.4),
        roi: "5-6%",
        risk: "Very Low",
      },
      {
        name: "Savings Accounts",
        allocation: Math.floor(amount * 0.3),
        roi: "3-4%",
        risk: "No Risk",
      },
      {
        name: "Bonds",
        allocation: Math.floor(amount * 0.3),
        roi: "5-7%",
        risk: "Low",
      },
    ],
    medium: [
      {
        name: "Mutual Funds (Balanced)",
        allocation: Math.floor(amount * 0.5),
        roi: "7-10%",
        risk: "Medium",
      },
      {
        name: "Index Funds",
        allocation: Math.floor(amount * 0.3),
        roi: "8-12%",
        risk: "Medium",
      },
      {
        name: "Fixed Deposits",
        allocation: Math.floor(amount * 0.2),
        roi: "5-6%",
        risk: "Very Low",
      },
    ],
    high: [
      {
        name: "Growth Mutual Funds",
        allocation: Math.floor(amount * 0.4),
        roi: "12-15%",
        risk: "High",
      },
      {
        name: "Index Funds",
        allocation: Math.floor(amount * 0.35),
        roi: "8-12%",
        risk: "Medium",
      },
      {
        name: "Direct Equity (Diversified)",
        allocation: Math.floor(amount * 0.25),
        roi: "10-20%",
        risk: "High",
      },
    ],
  }

  return recommendations[riskTolerance] || recommendations.medium
}

// Helper: Get expense reduction tips (framed as optional ideas, not orders)
const getExpenseReductionTips = (expensesByCategory) => {
  const tips = []

  if (expensesByCategory["Food & Dining"] > 5000) {
    tips.push("🍽️ Cooking at home a bit more could free up ₹500-1000 monthly")
  }
  if (expensesByCategory["Entertainment"] > 3000) {
    tips.push("🎬 Mixing in some free entertainment options could save ₹500-800 monthly")
  }
  if (expensesByCategory["Shopping"] > 4000) {
    tips.push("🛍️ A short pause before non-essential purchases could save ₹1000+ monthly")
  }
  if (expensesByCategory["Utilities"] > 2000) {
    tips.push("💡 Small energy-usage tweaks could save ₹300-500 monthly")
  }

  return tips.length > 0
    ? tips.join("\n")
    : "Take a look through your categories whenever it's convenient — no rush."
}

// Helper: Get seasonal insights
const getSeasonalInsight = () => {
  const month = new Date().getMonth()
  const insights = {
    0: {
      title: "🎆 New Year Resolution",
      desc: "Start your financial goals fresh this year!",
      icon: "🎆",
    },
    3: {
      title: "🌸 Spring Spending Alert",
      desc: "Spring sales coming - Plan your budget wisely",
      icon: "🌸",
    },
    6: {
      title: "☀️ Summer Vacation Fund",
      desc: "Start saving for summer travel now",
      icon: "☀️",
    },
    11: {
      title: "🎄 Holiday Prep",
      desc: "Plan gifts and celebrations within budget",
      icon: "🎄",
    },
  }

  return insights[month] || null
}

// Helper: Calculate a financial health score (0-100).
// This is a transparent, rule-based composite score — not a credit score,
// not derived from any bureau data, purely computed from the user's own
// entered numbers. Worth stating that explicitly in the UI/README too.
const calculateInvestmentSuitability = (leftoverMoney, income, riskTolerance) => {
  let score = 0

  // Savings rate (0-30 points)
  const savingsRate = (leftoverMoney / income) * 100
  score += Math.min(savingsRate / 2, 30)

  // Risk tolerance (0-20 points)
  const riskScores = { low: 10, medium: 15, high: 20 }
  score += riskScores[riskTolerance] || 15

  // Amount available (0-30 points)
  const amountScore = Math.min((leftoverMoney / 10000) * 30, 30)
  score += amountScore

  // Consistency bonus (0-20 points)
  // NOTE: This is currently a flat placeholder. A real implementation should
  // track actual logging/saving consistency over recent months from
  // Firestore history rather than awarding this by default.
  score += 20

  const messages = {
    excellent: "You're in a strong position — investing and steadily growing wealth are realistic next steps.",
    good: "Good financial health. Keep saving and investing at this pace.",
    fair: "You're in a fair position. Growing your savings rate a bit would open up more options.",
    poor: "Building up your savings rate first will create more room to work with.",
  }

  let category = "fair"
  if (score >= 80) category = "excellent"
  else if (score >= 60) category = "good"
  else if (score >= 40) category = "fair"
  else category = "poor"

  return {
    score: Math.round(score),
    category,
    message: messages[category],
  }
}

// Helper: Categorize expenses
const categorizeExpenses = (expenses) => {
  const categories = {}
  expenses?.forEach((expense) => {
    categories[expense.category] = (categories[expense.category] || 0) + expense.amount
  })
  return categories
}

export default generateSmartSuggestions