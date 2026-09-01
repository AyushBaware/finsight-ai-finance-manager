import { auth } from "../firebase"

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000"

export class ExpensesApiError extends Error {
  constructor(message, status) {
    super(message)
    this.name = "ExpensesApiError"
    this.status = status
  }
}

// Returns null (not an error) when there's no signed-in user — callers use
// this to fall back to on-device logic for Guest Mode, which has no
// Firebase ID token to send.
const getAuthHeader = async () => {
  const user = auth.currentUser
  if (!user) return null
  const token = await user.getIdToken()
  return { Authorization: `Bearer ${token}` }
}

const post = async (path, body) => {
  const authHeader = await getAuthHeader()
  if (!authHeader) return null

  let response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeader },
      body: JSON.stringify(body),
    })
  } catch {
    throw new ExpensesApiError("Could not reach the expense service. Is the backend running?")
  }

  let payload
  try {
    payload = await response.json()
  } catch {
    throw new ExpensesApiError("Received an unexpected response from the server.")
  }

  if (!response.ok) {
    throw new ExpensesApiError(payload?.error || "Request failed.", response.status)
  }

  return payload
}

/**
 * Server-side re-parse of a voice transcript. Returns:
 *   - the parsed fields, for signed-in users
 *   - null, for guest users (no token) — caller should keep the local parse
 * Throws ExpensesApiError on network/server failure — caller should catch
 * and silently keep the local parse rather than blocking the user.
 */
export const parseVoiceTranscript = (transcript) =>
  post("/api/expenses/parse-voice", { transcript })

export default { parseVoiceTranscript, ExpensesApiError }