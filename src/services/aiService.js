// AI Service for generating smart financial suggestions
// This service analyzes user financial data and provides intelligent recommendations

const generateAISuggestions = (financialData) => {
  const {
    monthlyIncome,
    totalExpenses,
    expenses,
    savingsGoal,
    riskTolerance = "medium",
  } = financialData

  const leftoverMoney = monthlyIncome - totalExpenses
  const _savingsRate = (leftoverMoney / monthlyIncome) * 100
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
    })
  }

  // 2. Investment Recommendations
  if (leftoverMoney > 1000) {
    const investments = getInvestmentRecommendations(
      leftoverMoney,
      riskTolerance
    )
    suggestions.push({
      id: "investment",
      title: "📈 Investment Opportunities",
      desc: `Invest ₹${Math.floor(leftoverMoney * 0.5).toLocaleString()} to grow wealth`,
      details: investments,
      priority: "high",
      category: "investment",
      icon: "📈",
      action: "Learn More",
    })
  }

  // 3. Spending Insights
  const topCategory = Object.entries(expensesByCategory).sort(
    ([, a], [, b]) => b - a
  )[0]
  if (topCategory) {
    const categorySpend = topCategory[1]
    const avgSpend = totalExpenses / Object.keys(expensesByCategory).length
    if (categorySpend > avgSpend * 1.3) {
      suggestions.push({
        id: "spending",
        title: "🔍 Spending Alert",
        desc: `${topCategory[0]} spending is ₹${categorySpend.toLocaleString()} (${((categorySpend / totalExpenses) * 100).toFixed(1)}% of total)`,
        details: `This is 30% higher than average. Consider optimizing this category.`,
        priority: "medium",
        category: "alert",
        icon: "🔍",
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
      details: `You're on track! Keep saving ₹${Math.floor(leftoverMoney).toLocaleString()} per month.`,
      priority: goalProgress < 50 ? "high" : "low",
      category: "goal",
      icon: "🎯",
      progress: Math.min(goalProgress, 100),
    })
  }

  // 5. Emergency Fund Check
  const emergencyFundGoal = monthlyIncome * 6
  if (leftoverMoney > 0) {
    suggestions.push({
      id: "emergency",
      title: "🛡️ Emergency Fund",
      desc: `Build 6 months of expenses (₹${emergencyFundGoal.toLocaleString()})`,
      details: `Save ₹${Math.ceil(leftoverMoney * 0.3).toLocaleString()} monthly for emergencies.`,
      priority: "high",
      category: "safety",
      icon: "🛡️",
    })
  }

  // 6. Smart Debt Reduction (if applicable)
  if (totalExpenses > monthlyIncome * 0.8) {
    suggestions.push({
      id: "debt",
      title: "📉 Expense Reduction Tips",
      desc: "Your expense ratio is high. Here are ways to optimize:",
      details: getExpenseReductionTips(expensesByCategory),
      priority: "high",
      category: "optimization",
      icon: "📉",
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
    })
  }

  // 8. Investment Suitability Score
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
        name: "Stock Market (Blue Chips)",
        allocation: Math.floor(amount * 0.35),
        roi: "10-20%",
        risk: "High",
      },
      {
        name: "Crypto/Digital Assets",
        allocation: Math.floor(amount * 0.15),
        roi: "20-50%+",
        risk: "Very High",
      },
      {
        name: "Index Funds",
        allocation: Math.floor(amount * 0.1),
        roi: "8-12%",
        risk: "Medium",
      },
    ],
  }

  return recommendations[riskTolerance] || recommendations.medium
}

// Helper: Get expense reduction tips
const getExpenseReductionTips = (expensesByCategory) => {
  const tips = []

  if (expensesByCategory["Food & Dining"] > 5000) {
    tips.push("🍽️ Cook at home more often - Save ₹500-1000 monthly")
  }
  if (expensesByCategory["Entertainment"] > 3000) {
    tips.push("🎬 Use free entertainment options - Save ₹500-800 monthly")
  }
  if (expensesByCategory["Shopping"] > 4000) {
    tips.push("🛍️ Implement 30-day rule before purchases - Save ₹1000+ monthly")
  }
  if (expensesByCategory["Utilities"] > 2000) {
    tips.push("💡 Reduce energy consumption - Save ₹300-500 monthly")
  }

  return tips.length > 0
    ? tips.join("\n")
    : "Review each category and set spending limits."
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

// Helper: Calculate investment suitability score
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
  score += 20 // Placeholder for actual consistency tracking

  const messages = {
    excellent: "Excellent! You're in a great position to invest and grow wealth.",
    good: "Good financial health. Continue saving and investing regularly.",
    fair: "Fair position. Increase savings rate for better financial growth.",
    poor: "Focus on increasing your savings rate first.",
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

// Simple market sentiment helper (simulated).
// This is pluggable — replace implementation with a real sentiment feed/API later.
export function getMarketSentiment(key) {
  // deterministically generate a pseudo-score from the key and today's date
  const seed = `${key}-${new Date().toISOString().slice(0,10)}`
  let h = 0
  for (let i = 0; i < seed.length; i++) h = (h << 5) - h + seed.charCodeAt(i)
  const score = ((h % 101) - 50) / 50 // -1 .. +1 roughly
  const sentiment = score > 0.2 ? 'positive' : score < -0.2 ? 'negative' : 'neutral'
  const summary = sentiment === 'positive'
    ? 'Market sentiment currently positive for this type; consider researching top funds.'
    : sentiment === 'negative'
    ? 'Market sentiment shows caution; research defensive funds or wait for a better entry.'
    : 'Mixed signals; do additional research before investing.'

  return {
    score: Number((score).toFixed(2)),
    sentiment,
    summary,
  }
}

export default generateAISuggestions
