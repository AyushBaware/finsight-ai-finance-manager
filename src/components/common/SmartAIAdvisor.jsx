import { useState } from 'react'
import { TrendingUp, ExternalLink, Target, AlertCircle } from 'lucide-react'
import Card from '../ui/Card'
import Button from '../ui/Button'
import { getMarketSentiment } from '../../services/aiService'

const SmartAIAdvisor = ({ leftoverMoney, riskTolerance = 'medium' }) => {
  const [selectedInvestment, setSelectedInvestment] = useState(null)

  // AI-generated recommendations based on user profile
  const generateRecommendations = () => {
    const recommendations = {
      low: [
        {
          id: 'sbi-fd',
          name: 'SBI Fixed Deposit',
          type: 'Fixed Deposit',
          allocation: Math.floor(leftoverMoney * 0.4),
          roi: '5.5% p.a.',
          risk: 'Very Low',
          description: 'Secure government-backed savings with guaranteed returns.',
          reason: 'Based on your conservative risk profile, FDs offer guaranteed growth.',
          url: 'https://www.sbi.co.in/web/personal-banking/deposits/fixed-deposits',
          buttonText: 'Open SBI FD',
        },
        {
          id: 'hdfc-savings',
          name: 'HDFC High-Yield Savings',
          type: 'Savings Account',
          allocation: Math.floor(leftoverMoney * 0.3),
          roi: '4% p.a.',
          risk: 'No Risk',
          description: 'Liquid savings with instant access and competitive interest rates.',
          reason: 'Keep emergency fund accessible while earning interest.',
          url: 'https://www.hdfcbank.com/personal/deposits/savings-accounts',
          buttonText: 'Explore HDFC',
        },
        {
          id: 'govt-bonds',
          name: 'Government Securities (G-Sec)',
          type: 'Bonds',
          allocation: Math.floor(leftoverMoney * 0.3),
          roi: '6.5% p.a.',
          risk: 'Low',
          description: 'Secure bonds backed by the Indian government.',
          reason: 'Zero credit risk with decent returns for long-term wealth building.',
          url: 'https://www.rbi.org.in/scripts/ndtl.aspx',
          buttonText: 'Buy G-Secs',
        },
      ],
      medium: [
        {
          id: 'hdfc-balanced',
          name: 'HDFC Balanced Advantage Fund',
          type: 'Mutual Fund',
          allocation: Math.floor(leftoverMoney * 0.5),
          roi: '8-10% p.a.',
          risk: 'Medium',
          description: 'Dynamic fund that balances equity and debt based on market conditions.',
          reason: 'Ideal for your risk profile—combines growth with stability.',
          url: 'https://www.hdfcfund.com/invest/products/funds/hdfc-balanced-advantage-fund',
          buttonText: 'Invest in HDFC',
        },
        {
          id: 'nifty-index',
          name: 'Nifty 50 Index Fund',
          type: 'Index Fund',
          allocation: Math.floor(leftoverMoney * 0.35),
          roi: '10-12% p.a.',
          risk: 'Medium',
          description: 'Low-cost fund tracking India\'s top 50 companies.',
          reason: 'Diversified exposure to India\'s best companies with minimal fees.',
          url: 'https://www.nseindia.com',
          buttonText: 'Track Nifty 50',
        },
        {
          id: 'icici-fd',
          name: 'ICICI Bank FD',
          type: 'Fixed Deposit',
          allocation: Math.floor(leftoverMoney * 0.15),
          roi: '5.5% p.a.',
          risk: 'Very Low',
          description: 'Stable, liquid portion for emergency access.',
          reason: 'Balance your aggressive investments with safe reserves.',
          url: 'https://www.icicibank.com/Personal/deposits',
          buttonText: 'Open ICICI FD',
        },
      ],
      high: [
        {
          id: 'kotak-growth',
          name: 'Kotak Growth Fund',
          type: 'Mutual Fund',
          allocation: Math.floor(leftoverMoney * 0.45),
          roi: '12-15% p.a.',
          risk: 'High',
          description: 'Aggressive growth fund focused on large-cap and mid-cap stocks.',
          reason: 'Your high risk tolerance allows aggressive equity exposure for wealth creation.',
          url: 'https://www.kotakmf.com',
          buttonText: 'Invest Aggressively',
        },
        {
          id: 'tcs-stock',
          name: 'TCS Stock (Direct)',
          type: 'Stock',
          allocation: Math.floor(leftoverMoney * 0.35),
          roi: '10-20% p.a.',
          risk: 'High',
          description: 'Tata Consultancy Services — India\'s largest IT company.',
          reason: 'Blue-chip stock with strong fundamentals and dividend potential.',
          url: 'https://zerodha.com',
          buttonText: 'Trade on Zerodha',
        },
        {
          id: 'crypto-small',
          name: 'Bitcoin (Small Allocation)',
          type: 'Crypto',
          allocation: Math.floor(leftoverMoney * 0.2),
          roi: '20-50%+',
          risk: 'Very High',
          description: 'Emerging digital asset for speculative high-growth plays.',
          reason: 'Only allocate what you can afford to lose; high volatility for high returns.',
          url: 'https://wazirx.com',
          buttonText: 'Buy Crypto',
        },
      ],
    }

    return recommendations[riskTolerance] || recommendations.medium
  }

  const recommendations = generateRecommendations()

  const handleInvestmentClick = (inv) => {
    setSelectedInvestment(selectedInvestment?.id === inv.id ? null : inv)
  }

  const handleInvest = (url) => {
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl bg-linear-to-r from-purple-600 to-indigo-600 p-6 text-white shadow-lg">
        <div className="flex items-center gap-3 mb-2">
          <div className="rounded-full bg-white/20 p-2">
            <Target size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold">AI-Powered Investment Advisor</h2>
            <p className="text-sm opacity-90 mt-1">
              Personalized for your ₹{leftoverMoney.toLocaleString()} leftover funds
            </p>
          </div>
        </div>
      </div>

      {/* Allocation Summary */}
      <Card className="border-2 border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-900/20">
        <div className="space-y-4">
          <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
            💡 Quick Allocation Summary
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {recommendations.map((inv, idx) => (
              <div key={inv.id} className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg">
                <div className="shrink-0 w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                  <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">{idx + 1}</span>
                </div>
                <div className="flex-1">
                  <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">{inv.type}</p>
                  <p className="font-bold text-gray-900 dark:text-white">₹{inv.allocation.toLocaleString()}</p>
                  <p className="text-xs text-indigo-600 dark:text-indigo-400">{inv.name}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="border-t border-purple-200 dark:border-purple-800 pt-3 mt-3">
            <p className="text-xs text-gray-600 dark:text-gray-400">
              <span className="font-semibold">Total to Invest:</span> ₹{recommendations.reduce((sum, inv) => sum + inv.allocation, 0).toLocaleString()}
            </p>
          </div>
        </div>
      </Card>

      {/* Disclaimer Banner */}
      <div className="rounded-lg border border-yellow-300 bg-yellow-50 dark:bg-yellow-900/20 p-4">
        <div className="flex gap-3">
          <AlertCircle size={20} className="text-yellow-600 dark:text-yellow-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-300">
              Investment Disclaimer
            </p>
            <p className="text-xs text-yellow-700 dark:text-yellow-400 mt-1">
              "Mutual fund and stock market investments are subject to market risks; read all scheme-related documents carefully. Past performance is no guarantee of future results. Consult a financial advisor before investing."
            </p>
          </div>
        </div>
      </div>

      {/* Recommendations Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {recommendations.map((inv) => (
          <div
            key={inv.id}
            onClick={() => handleInvestmentClick(inv)}
            className="cursor-pointer"
          >
            <Card
              className={`h-full transition-all ${
                selectedInvestment?.id === inv.id
                  ? 'border-2 border-indigo-600 shadow-lg'
                  : 'hover:shadow-md border border-gray-200 dark:border-gray-700'
              }`}
            >
              <div className="space-y-3">
                {/* Header */}
                <div>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white">
                        {inv.name}
                      </h3>
                      <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                        {inv.type}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    {inv.description}
                  </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-2 bg-gray-50 dark:bg-gray-800 rounded-lg p-2">
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Allocation</p>
                    <p className="font-bold text-gray-900 dark:text-white">
                      ₹{inv.allocation.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Expected ROI</p>
                    <p className="font-bold text-green-600 dark:text-green-400">
                      {inv.roi}
                    </p>
                  </div>
                </div>

                {/* Risk Badge */}
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                    inv.risk === 'Very Low' || inv.risk === 'No Risk'
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      : inv.risk === 'Low'
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                      : inv.risk === 'Medium'
                      ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                      : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                  }`}>
                    {inv.risk}
                  </span>
                  <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                    {selectedInvestment?.id === inv.id ? 'Hide ▲' : 'Details ▼'}
                  </span>
                </div>

                {/* Expanded Details */}
                {selectedInvestment?.id === inv.id && (
                  <div className="mt-4 space-y-3 border-t border-gray-200 dark:border-gray-700 pt-3">
                    {/* Why This Investment */}
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-2">
                      <p className="text-xs font-semibold text-blue-900 dark:text-blue-300 mb-1">
                        Why This?
                      </p>
                      <p className="text-xs text-blue-800 dark:text-blue-200">
                        {inv.reason}
                      </p>
                    </div>

                    {/* Market Sentiment */}
                    {(() => {
                      const sentiment = getMarketSentiment(inv.name)
                      return (
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-2">
                          <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                            Market Sentiment
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            {sentiment.sentiment.charAt(0).toUpperCase() + sentiment.sentiment.slice(1)} • {sentiment.summary}
                          </p>
                        </div>
                      )
                    })()}

                    {/* Primary CTA */}
                    <Button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleInvest(inv.url)
                      }}
                      className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white"
                    >
                      <ExternalLink size={14} />
                      {inv.buttonText}
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          </div>
        ))}
      </div>

      {/* Next Steps */}
      <Card className="bg-linear-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20">
        <div className="space-y-2">
          <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            📋 Next Steps
          </h3>
          <ol className="text-sm text-gray-700 dark:text-gray-300 space-y-1 list-decimal list-inside">
            <li>Click on an investment to see detailed analysis and market sentiment</li>
            <li>Click the "{recommendations[0]?.buttonText || 'Open'}" button to visit the provider</li>
            <li>Research the fund/stock on the provider's website</li>
            <li>Read all scheme documents carefully before investing</li>
            <li>Start with the allocation suggested above</li>
          </ol>
        </div>
      </Card>
    </section>
  )
}

export default SmartAIAdvisor
