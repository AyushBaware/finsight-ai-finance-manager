import { useState } from 'react'
import { TrendingUp, ExternalLink, ArrowRight, Target } from 'lucide-react'
import Card from '../ui/Card'
import Button from '../ui/Button'
import { getMarketSentiment } from '../../services/aiService'

const AIInvestmentAdvisor = ({ leftoverMoney, riskTolerance = 'medium' }) => {
  const [selectedInvestment, setSelectedInvestment] = useState(null)

  // Investment recommendations with detailed info and links
  const investments = {
    low: [
      {
        id: 'fd',
        name: 'Fixed Deposits (FD)',
        allocation: Math.floor(leftoverMoney * 0.4),
        roi: '5-6% p.a.',
        risk: 'Very Low',
        description: 'Safe option with guaranteed returns. Best for risk-averse investors.',
        providers: [
          { name: 'SBI', url: 'https://www.sbi.co.in/web/personal-banking/deposits/fixed-deposits' },
          { name: 'HDFC Bank', url: 'https://www.hdfcbank.com/personal/deposits/fixed-deposits' },
          { name: 'ICICI Bank', url: 'https://www.icicibank.com/Personal/deposits' },
        ],
        pros: ['Guaranteed returns', 'Zero risk', 'FDIC insured'],
        cons: ['Lower returns', 'Less liquidity'],
      },
      {
        id: 'savings',
        name: 'High-Interest Savings Account',
        allocation: Math.floor(leftoverMoney * 0.3),
        roi: '3-4% p.a.',
        risk: 'No Risk',
        description: 'Liquid and safe. Ideal for emergency funds.',
        providers: [
          { name: 'Savings Account', url: 'https://www.sbi.co.in/web/personal-banking/accounts/saving-accounts' },
          { name: 'Digital Banks', url: 'https://www.digio.in' },
        ],
        pros: ['Easy access', 'No risk', 'Liquid funds'],
        cons: ['Very low returns'],
      },
      {
        id: 'bonds',
        name: 'Government Bonds / Debt Funds',
        allocation: Math.floor(leftoverMoney * 0.3),
        roi: '5-7% p.a.',
        risk: 'Low',
        description: 'Backed by government. Moderate returns with low risk.',
        providers: [
          { name: 'RBI Retail Bonds', url: 'https://www.rbi.org.in' },
          { name: 'NSE Bonds', url: 'https://www.nseindia.com' },
        ],
        pros: ['Government backed', 'Good returns', 'Low risk'],
        cons: ['Lower liquidity'],
      },
    ],
    medium: [
      {
        id: 'balanced-mf',
        name: 'Balanced Mutual Funds',
        allocation: Math.floor(leftoverMoney * 0.5),
        roi: '7-10% p.a.',
        risk: 'Medium',
        description: 'Mix of stocks and bonds. Great for moderate risk investors.',
        providers: [
          { name: 'HDFC Mutual Fund', url: 'https://www.hdfcfund.com' },
          { name: 'ICICI Prudential', url: 'https://www.iciciprumf.com' },
          { name: 'Axis Mutual Fund', url: 'https://www.axismf.com' },
        ],
        pros: ['Diversified', 'Professional management', 'Good returns'],
        cons: ['Medium risk', 'Market dependent'],
      },
      {
        id: 'index-funds',
        name: 'Index Funds',
        allocation: Math.floor(leftoverMoney * 0.3),
        roi: '8-12% p.a.',
        risk: 'Medium',
        description: 'Low-cost way to invest in the market. Tracks major indices like Sensex.',
        providers: [
          { name: 'SBI Mutual Fund', url: 'https://www.sbimf.com' },
          { name: 'Vanguard India', url: 'https://www.vanguardindia.com' },
          { name: 'DSP Mutual Fund', url: 'https://www.dspim.com' },
        ],
        pros: ['Low fees', 'Diversified', 'Consistent returns'],
        cons: ['Tied to market performance'],
      },
      {
        id: 'fd-medium',
        name: 'Fixed Deposits',
        allocation: Math.floor(leftoverMoney * 0.2),
        roi: '5-6% p.a.',
        risk: 'Very Low',
        description: 'Safe portion of your portfolio for stability.',
        providers: [
          { name: 'SBI', url: 'https://www.sbi.co.in/web/personal-banking/deposits/fixed-deposits' },
          { name: 'HDFC Bank', url: 'https://www.hdfcbank.com/personal/deposits/fixed-deposits' },
        ],
        pros: ['Guaranteed returns', 'Zero risk'],
        cons: ['Lower returns'],
      },
    ],
    high: [
      {
        id: 'growth-mf',
        name: 'Growth Mutual Funds',
        allocation: Math.floor(leftoverMoney * 0.4),
        roi: '12-15% p.a.',
        risk: 'High',
        description: 'Aggressive growth strategy. For long-term wealth creation.',
        providers: [
          { name: 'Kotak Mutual Fund', url: 'https://www.kotakmf.com' },
          { name: 'Nippon India MF', url: 'https://www.nipponindianmf.com' },
          { name: 'L&T Mutual Fund', url: 'https://www.ltmf.com' },
        ],
        pros: ['High growth potential', 'Long-term wealth', 'Diversified'],
        cons: ['High volatility', 'Market risk'],
      },
      {
        id: 'stocks',
        name: 'Stock Market (Blue Chips)',
        allocation: Math.floor(leftoverMoney * 0.35),
        roi: '10-20% p.a.',
        risk: 'High',
        description: 'Invest in large-cap companies like TCS, Infosys, Reliance.',
        providers: [
          { name: 'NSE Trading', url: 'https://www.nseindia.com' },
          { name: 'Zerodha', url: 'https://zerodha.com' },
          { name: 'ICICI Direct', url: 'https://www.icicidirect.com' },
        ],
        pros: ['Direct ownership', 'High returns', 'Dividends'],
        cons: ['High risk', 'Requires research', 'Volatile'],
      },
      {
        id: 'crypto',
        name: 'Crypto/Digital Assets',
        allocation: Math.floor(leftoverMoney * 0.15),
        roi: '20-50%+',
        risk: 'Very High',
        description: 'Emerging asset class. High risk, high reward.',
        providers: [
          { name: 'WazirX', url: 'https://wazirx.com' },
          { name: 'CoinDCX', url: 'https://coindcx.com' },
          { name: 'Binance India', url: 'https://www.binance.com/en-IN' },
        ],
        pros: ['Highest potential returns', 'Emerging market', 'Digital-first'],
        cons: ['Extreme volatility', 'Regulatory risk', 'Complex'],
      },
      {
        id: 'index-high',
        name: 'Index Funds',
        allocation: Math.floor(leftoverMoney * 0.1),
        roi: '8-12% p.a.',
        risk: 'Medium',
        description: 'Diversified index fund for stability within aggressive portfolio.',
        providers: [
          { name: 'SBI Mutual Fund', url: 'https://www.sbimf.com' },
          { name: 'DSP Mutual Fund', url: 'https://www.dspim.com' },
        ],
        pros: ['Diversified', 'Low fees', 'Stable'],
        cons: ['Tied to market'],
      },
    ],
  }

  const riskInvestments = investments[riskTolerance] || investments.medium

  const handleInvestmentClick = (investment) => {
    setSelectedInvestment(selectedInvestment?.id === investment.id ? null : investment)
  }

  const handleProviderClick = (url) => {
    window.open(url, '_blank')
  }

  return (
    <section className="space-y-6">
      <div className="rounded-2xl bg-linear-to-r from-purple-600 to-indigo-600 p-6 text-white shadow-lg">
        <div className="flex items-center gap-3 mb-2">
          <div className="rounded-full bg-white/20 p-2">
            <Target size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Smart Investment Guide</h2>
            <p className="text-sm opacity-90 mt-1">
              ₹{leftoverMoney.toLocaleString()} available for investment
            </p>
          </div>
        </div>
      </div>

      {/* Disclaimer banner */}
      <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-yellow-50 dark:bg-yellow-900/10 p-3">
        <p className="text-sm text-yellow-800 dark:text-yellow-200">
          “Mutual fund and stock market investments are subject to market risks; read all scheme-related documents carefully.”
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {riskInvestments.map((investment) => (
          <Card
            key={investment.id}
            className={`cursor-pointer transition-all hover:shadow-lg ${
              selectedInvestment?.id === investment.id
                ? 'border-2 border-indigo-600'
                : 'border border-gray-200 dark:border-gray-700'
            }`}
            onClick={() => handleInvestmentClick(investment)}
          >
            <div className="space-y-3">
              {/* Header */}
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {investment.name}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {investment.description}
                </p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-2">
                  <p className="text-xs text-gray-600 dark:text-gray-400">Allocation</p>
                  <p className="font-bold text-gray-900 dark:text-white">
                    ₹{investment.allocation.toLocaleString()}
                  </p>
                </div>
                <div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-2">
                  <p className="text-xs text-gray-600 dark:text-gray-400">Expected Return</p>
                  <p className="font-bold text-green-600 dark:text-green-400">
                    {investment.roi}
                  </p>
                </div>
              </div>

              {/* Risk Badge */}
              <div className="flex items-center gap-2">
                <TrendingUp size={14} className="text-orange-500" />
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                  investment.risk === 'Very Low' || investment.risk === 'No Risk'
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    : investment.risk === 'Low'
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                    : investment.risk === 'Medium'
                    ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                    : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                }`}>
                  {investment.risk}
                </span>
              </div>

              {/* Expand indicator */}
              <div className="text-right">
                <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                  {selectedInvestment?.id === investment.id ? 'Hide' : 'Learn more'} →
                </span>
              </div>

              {/* Expanded Details */}
              {selectedInvestment?.id === investment.id && (
                <div className="mt-4 space-y-3 border-t border-gray-200 dark:border-gray-700 pt-3">
                  {/* Market sentiment (simulated). Replace with real API for production. */}
                  {(() => {
                    const s = getMarketSentiment(investment.name)
                    return (
                      <div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-3">
                        <p className="text-xs font-semibold text-gray-600 dark:text-gray-400">Market Sentiment</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{s.sentiment === 'positive' ? 'Positive' : s.sentiment === 'negative' ? 'Negative' : 'Neutral'} ({s.score})</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{s.summary}</p>
                      </div>
                    )
                  })()}
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                      Pros
                    </p>
                    <ul className="space-y-1">
                      {investment.pros.map((pro, idx) => (
                        <li key={idx} className="text-xs text-green-700 dark:text-green-400 flex items-start gap-2">
                          <span>✓</span>
                          <span>{pro}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                      Cons
                    </p>
                    <ul className="space-y-1">
                      {investment.cons.map((con, idx) => (
                        <li key={idx} className="text-xs text-red-700 dark:text-red-400 flex items-start gap-2">
                          <span>✗</span>
                          <span>{con}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                      Where to Invest
                    </p>
                    <div className="space-y-2">
                      {investment.providers.map((provider, idx) => (
                        <button
                          key={idx}
                          onClick={(e) => {
                            e.stopPropagation()
                            handleProviderClick(provider.url)
                          }}
                          className="w-full flex items-center justify-between bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 rounded-lg px-3 py-2 transition-all"
                        >
                          <span className="text-xs font-medium text-indigo-700 dark:text-indigo-400">
                            {provider.name}
                          </span>
                          <ExternalLink size={12} className="text-indigo-600 dark:text-indigo-400" />
                        </button>
                      ))}
                    </div>
                  </div>

                  <Button
                    variant="primary"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleProviderClick(investment.providers[0].url)
                    }}
                    className="w-full flex items-center justify-center gap-2"
                  >
                    <ArrowRight size={14} />
                    Start Investing
                  </Button>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Tips Section */}
      <Card className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-l-blue-500">
        <div className="space-y-2">
          <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            💡 Investment Tips
          </h3>
          <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
            <li>✓ Start with your risk tolerance and investment goals</li>
            <li>✓ Diversify your portfolio across multiple asset classes</li>
            <li>✓ Invest regularly (SIP) for better returns over time</li>
            <li>✓ Review and rebalance your portfolio every 6 months</li>
            <li>✓ Avoid emotional decisions based on market fluctuations</li>
          </ul>
        </div>
      </Card>
    </section>
  )
}

export default AIInvestmentAdvisor
