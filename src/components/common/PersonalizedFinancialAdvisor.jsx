import { useState } from "react"
import Card from "../ui/Card"
import Button from "../ui/Button"
import { MessageCircle, Lightbulb, BookOpen, AlertCircle } from "lucide-react"

const PersonalizedFinancialAdvisor = ({ financialData = {} }) => {
  const [activeTab, setActiveTab] = useState("advice")
  const [expandedAdvice, setExpandedAdvice] = useState(null)

  // Default financial data
  const {
    monthlyIncome = 45000,
    totalExpenses = 18750,
    leftoverMoney = 26250,
    age = 28,
    employmentType = "salaried",
    familySize = 2,
  } = financialData

  const savingsRate = (leftoverMoney / monthlyIncome) * 100

  // Generate personalized advice based on user profile
  const generatePersonalizedAdvice = () => {
    const advice = []

    // Age-based advice
    if (age < 30) {
      advice.push({
        id: "age-1",
        category: "Age Factor",
        title: "🚀 Time is Your Greatest Asset",
        advice:
          "At 28, you have a 35+ year runway for compound growth. Even small monthly investments can turn into significant wealth.",
        action: "Start investing ₹10,000+ monthly in growth funds",
        priority: "high",
      })
    } else if (age < 40) {
      advice.push({
        id: "age-2",
        category: "Age Factor",
        title: "⚡ Peak Earning Years",
        advice:
          "These are crucial years for wealth building. Balance growth investments with retirement planning.",
        action: "Increase SIP to 40% of leftover money",
        priority: "high",
      })
    } else {
      advice.push({
        id: "age-3",
        category: "Age Factor",
        title: "🎯 Focus on Wealth Preservation",
        advice:
          "Shift towards balanced investments and secure retirement income streams.",
        action: "Review and rebalance portfolio",
        priority: "high",
      })
    }

    // Savings rate advice
    if (savingsRate > 40) {
      advice.push({
        id: "savings-1",
        category: "Savings Habits",
        title: "💎 Exceptional Saver",
        advice: `Your ${savingsRate.toFixed(1)}% savings rate is exceptional! You're well above the recommended 30%.`,
        action: "Optimize investment allocation for maximum growth",
        priority: "medium",
      })
    } else if (savingsRate > 20) {
      advice.push({
        id: "savings-2",
        category: "Savings Habits",
        title: "✅ Good Savings Discipline",
        advice: `Your ${savingsRate.toFixed(1)}% savings rate is healthy. Try to increase it to reach financial independence faster.`,
        action: "Look for ways to increase monthly savings by 5%",
        priority: "medium",
      })
    } else {
      advice.push({
        id: "savings-3",
        category: "Savings Habits",
        title: "⚠️ Increase Your Savings Rate",
        advice: `Your ${savingsRate.toFixed(1)}% savings rate is below optimal. Work on increasing it to 30%+.`,
        action: "Review budget and reduce non-essential spending",
        priority: "high",
      })
    }

    // Family-based advice
    if (familySize > 1) {
      advice.push({
        id: "family-1",
        category: "Family Planning",
        title: "🛡️ Protect Your Family",
        advice: `With a family of ${familySize}, ensure adequate life insurance and health coverage.`,
        action: "Review insurance: 10x income term + family health",
        priority: "high",
      })
    }

    // Employment-based advice
    if (employmentType === "salaried") {
      advice.push({
        id: "employment-1",
        category: "Career & Income",
        title: "📈 Maximize Salaried Benefits",
        advice:
          "Take advantage of employer benefits: EPF, ESIC, health insurance, and stock options.",
        action: "Increase EPF contributions to ₹50,000/year",
        priority: "medium",
      })
    }

    // Expense ratio advice
    const expenseRatio = (totalExpenses / monthlyIncome) * 100
    if (expenseRatio > 65) {
      advice.push({
        id: "expense-1",
        category: "Expense Management",
        title: "💰 Optimize Your Spending",
        advice: `Your expense ratio of ${expenseRatio.toFixed(1)}% is high. Target should be 50-60%.`,
        action: "Reduce non-essential spending by ₹3,000-5,000",
        priority: "high",
      })
    }

    return advice
  }

  const personalizedAdvice = generatePersonalizedAdvice()

  // FAQ Section
  const faqs = [
    {
      question: "What's the 50/30/20 rule?",
      answer:
        "Allocate 50% of income to needs, 30% to wants, and 20% to savings. Your current split allows ₹22,500 (50%) for needs, ₹13,500 (30%) for wants, and ₹9,000 (20%) for savings.",
    },
    {
      question: "Should I focus on debt repayment or investments?",
      answer:
        "High-interest debt (>10%) should be prioritized. For low-interest loans, invest while paying them off. The 9% return from balanced investments may not justify skipping savings.",
    },
    {
      question: "How much emergency fund do I need?",
      answer:
        "Keep 6 months of expenses (₹1,12,500) in a liquid savings account. This covers unexpected crises without affecting your investments.",
    },
    {
      question: "What's the best investment for beginners?",
      answer:
        "Start with: (1) Mutual funds SIP for regular investing, (2) Fixed deposits for safety, (3) Index funds for long-term wealth. Diversify rather than putting all eggs in one basket.",
    },
    {
      question: "How do I achieve financial independence?",
      answer:
        "Follow the FIRE principle: Save 50%+ of income, invest in growth assets, and achieve a corpus of 25x annual expenses. At your rate, this is possible in 12-15 years.",
    },
  ]

  const resources = [
    {
      title: "Investment Basics",
      description: "Learn about different investment vehicles and how to choose",
      icon: "📚",
    },
    {
      title: "Tax Planning for Salaried",
      description: "Maximize tax benefits under Section 80C, 80D, etc.",
      icon: "📋",
    },
    {
      title: "Retirement Planning",
      description: "Calculate retirement needs and plan accordingly",
      icon: "🏖️",
    },
    {
      title: "Insurance Guide",
      description: "Understand life, health, and investment-linked insurance",
      icon: "🛡️",
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <div className="rounded-full bg-linear-to-br from-cyan-500 to-blue-600 p-2">
          <MessageCircle size={20} className="text-white" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Personalized Financial Advisor
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            AI-powered recommendations based on your financial profile
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
        {[
          { id: "advice", label: "💡 Personalized Advice", icon: Lightbulb },
          { id: "faq", label: "❓ FAQ", icon: MessageCircle },
          { id: "resources", label: "📚 Resources", icon: BookOpen },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 font-medium whitespace-nowrap border-b-2 transition-colors ${
              activeTab === tab.id
                ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
                : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Advice Tab */}
      {activeTab === "advice" && (
        <div className="space-y-3">
          {personalizedAdvice.map((item) => (
            <Card
              key={item.id}
              padding="lg"
              className={`cursor-pointer transition-all border-l-4 ${
                item.priority === "high"
                  ? "border-l-red-500"
                  : item.priority === "medium"
                  ? "border-l-yellow-500"
                  : "border-l-green-500"
              }`}
              onClick={() =>
                setExpandedAdvice(
                  expandedAdvice === item.id ? null : item.id
                )
              }
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">
                        {item.title.split(" ")[0]}
                      </span>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {item.title.substring(2)}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {item.category}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {expandedAdvice === item.id && (
                  <div className="border-t border-gray-200 pt-3 mt-3 dark:border-gray-700 space-y-3">
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {item.advice}
                    </p>
                    <div className="flex items-center gap-2 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 p-3">
                      <Lightbulb size={16} className="text-indigo-600 dark:text-indigo-400 shrink-0" />
                      <div>
                        <p className="text-xs font-medium text-indigo-700 dark:text-indigo-300">
                          Action Item
                        </p>
                        <p className="text-sm text-indigo-700 dark:text-indigo-300 font-medium">
                          {item.action}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* FAQ Tab */}
      {activeTab === "faq" && (
        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <Card
              key={idx}
              padding="lg"
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() =>
                setExpandedAdvice(expandedAdvice === idx ? null : idx)
              }
            >
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  {expandedAdvice === idx ? "▼" : "▶"} {faq.question}
                </h3>
                {expandedAdvice === idx && (
                  <p className="text-sm text-gray-700 dark:text-gray-300 border-t border-gray-200 dark:border-gray-700 pt-3">
                    {faq.answer}
                  </p>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Resources Tab */}
      {activeTab === "resources" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {resources.map((resource, idx) => (
            <Card
              key={idx}
              padding="lg"
              className="hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <span className="text-3xl">{resource.icon}</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {resource.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {resource.description}
                  </p>
                </div>
                <Button variant="secondary" size="sm" className="w-full">
                  Learn More
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Financial Health Checklist */}
      <Card padding="lg" className="bg-linear-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            ✅ Financial Health Checklist
          </h3>
          <div className="space-y-2">
            {[
              { task: "Emergency Fund (6 months expenses)", completed: false },
              { task: "Health Insurance Coverage", completed: true },
              { task: "Life Insurance (10x income)", completed: false },
              { task: "Monthly Budget Tracking", completed: true },
              { task: "Regular Investment Plan (SIP)", completed: false },
              { task: "Tax-Saving Investments (80C)", completed: true },
              { task: "Retirement Planning Started", completed: false },
              { task: "Debt Repayment Plan", completed: true },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={item.completed}
                  readOnly
                  className="w-4 h-4"
                />
                <span
                  className={`text-sm ${
                    item.completed
                      ? "text-green-700 dark:text-green-400 line-through"
                      : "text-gray-700 dark:text-gray-300"
                  }`}
                >
                  {item.task}
                </span>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-3">
            You've completed 4 out of 8 items. Keep building your financial foundation!
          </p>
        </div>
      </Card>
    </div>
  )
}

export default PersonalizedFinancialAdvisor
