const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000"

export class InvestmentPlannerError extends Error {
  constructor(message, status) {
    super(message)
    this.name = "InvestmentPlannerError"
    this.status = status
  }
}

export const getFundsForHorizon = async (horizonMonths) => {
  const parsedHorizon = Number.parseInt(horizonMonths, 10)

  if (!Number.isFinite(parsedHorizon) || parsedHorizon <= 0) {
    throw new InvestmentPlannerError("Please provide a valid horizon in months.")
  }

  const url = `${API_BASE_URL}/api/funds?horizonMonths=${parsedHorizon}`

  let response
  try {
    response = await fetch(url)
  } catch {
    throw new InvestmentPlannerError(
      "Could not reach the fund data service. Is the backend running?",
    )
  }

  let payload
  try {
    payload = await response.json()
  } catch {
    throw new InvestmentPlannerError("Received an unexpected response from the server.")
  }

  if (!response.ok) {
    throw new InvestmentPlannerError(
      payload?.error || "Failed to fetch fund recommendations.",
      response.status,
    )
  }

  return payload
}

export default { getFundsForHorizon }