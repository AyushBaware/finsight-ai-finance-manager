import { useState } from "react"
import Card from "../ui/Card"
import Button from "../ui/Button"
import generateAISuggestions from "../../services/aiService"
import { ChevronDown, ChevronUp, TrendingUp, Lightbulb } from "lucide-react"

const AISuggestions = ({ financialData }) => {
  const [expandedId, setExpandedId] = useState(null)
  const [showAll, setShowAll] = useState(false)

  // Generate dynamic suggestions based on user data
  const suggestions = financialData
    ? generateAISuggestions(financialData)
    : []

  const displayedSuggestions = showAll
    ? suggestions
    : suggestions.slice(0, 3)

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id)
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="rounded-full bg-linear-to-br from-purple-500 to-indigo-600 p-2">
            <Lightbulb size={20} className="text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Smart AI Suggestions
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Personalized financial insights for you
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {displayedSuggestions.map((item) => (
          <Card
            key={item.id}
            className={`cursor-pointer transition-all hover:shadow-lg ${
              item.priority === "high"
                ? "border-l-4 border-l-red-500 dark:border-l-red-400"
                : item.priority === "medium"
                ? "border-l-4 border-l-yellow-500 dark:border-l-yellow-400"
                : "border-l-4 border-l-green-500 dark:border-l-green-400"
            }`}
            onClick={() => toggleExpand(item.id)}
          >
            <div className="space-y-2">
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{item.icon}</span>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {item.title}
                    </p>
                  </div>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    {item.desc}
                  </p>
                </div>
                {item.details && (
                  <button className="mt-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
                    {expandedId === item.id ? (
                      <ChevronUp size={18} />
                    ) : (
                      <ChevronDown size={18} />
                    )}
                  </button>
                )}
              </div>

              {/* Progress Bar (if applicable) */}
              {item.progress && (
                <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                  <div
                    className="h-full bg-linear-to-r from-indigo-500 to-purple-600 transition-all duration-500"
                    style={{ width: `${item.progress}%` }}
                  />
                </div>
              )}

              {/* Expanded Details */}
              {expandedId === item.id && item.details && (
                <div className="mt-4 space-y-3 border-t border-gray-200 pt-3 dark:border-gray-700">
                  {Array.isArray(item.details) ? (
                    <div className="space-y-2">
                      {item.details.map((detail, idx) => (
                        <div
                          key={idx}
                          className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800"
                        >
                          {detail.category ? (
                            <>
                              <div className="flex items-center justify-between">
                                <span className="font-medium text-gray-900 dark:text-white">
                                  {detail.category}
                                </span>
                                <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                                  ₹{detail.amount?.toLocaleString() || detail.allocation?.toLocaleString()}
                                </span>
                              </div>
                              <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                                {detail.reason || detail.roi}
                              </p>
                              {detail.percentage && (
                                <div className="mt-2 flex items-center gap-2">
                                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                                    <div
                                      className="h-full bg-indigo-500"
                                      style={{ width: `${detail.percentage}%` }}
                                    />
                                  </div>
                                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                                    {detail.percentage}%
                                  </span>
                                </div>
                              )}
                            </>
                          ) : (
                            <p className="text-sm text-gray-700 dark:text-gray-300">
                              {detail.name ? (
                                <>
                                  <span className="font-medium">{detail.name}</span>
                                  <br />
                                  <span className="text-xs">
                                    ROI: {detail.roi} | Risk: {detail.risk}
                                  </span>
                                </>
                              ) : (
                                detail
                              )}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {item.details}
                    </p>
                  )}
                  {item.action && (
                    <Button variant="primary" size="sm" className="w-full">
                      {item.action}
                    </Button>
                  )}
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Show More Button */}
      {suggestions.length > 3 && (
        <div className="flex justify-center">
          <Button
            variant="secondary"
            onClick={() => setShowAll(!showAll)}
            className="flex items-center gap-2"
          >
            <TrendingUp size={16} />
            {showAll
              ? "Show Less"
              : `View ${suggestions.length - 3} More Insights`}
          </Button>
        </div>
      )}
    </section>
  )
}

export default AISuggestions
