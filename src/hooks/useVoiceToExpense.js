import { useState, useRef, useCallback } from 'react'

// Category keywords mapping
const CATEGORY_KEYWORDS = {
  'Food & Dining': ['eat', 'lunch', 'dinner', 'breakfast', 'food', 'restaurant', 'cafe', 'coffee', 'pizza', 'burger', 'meal', 'snack', 'starbucks', 'mcdonalds', 'kfc', 'subway', 'dine'],
  'Transport': ['taxi', 'uber', 'auto', 'bus', 'train', 'flight', 'bike', 'car', 'drive', 'ride', 'travel', 'commute', 'fuel', 'gas', 'petrol', 'metro', 'railway'],
  'Shopping': ['bought', 'shopping', 'clothes', 'dress', 'shirt', 'shoes', 'dress', 'bag', 'mall', 'store', 'shop', 'purchase', 'shirt', 'pants', 'jacket'],
  'Entertainment': ['movie', 'cinema', 'concert', 'show', 'game', 'play', 'ticket', 'event', 'music', 'netflix', 'spotify', 'gaming', 'sports'],
  'Utilities': ['electricity', 'water', 'bill', 'internet', 'phone', 'gas', 'utility', 'broadband', 'wifi', 'power'],
  'Healthcare': ['doctor', 'medical', 'hospital', 'medicine', 'pharmacy', 'clinic', 'health', 'pill', 'tablet', 'treatment'],
  'Subscription': ['subscription', 'spotify', 'netflix', 'youtube', 'prime', 'membership', 'monthly', 'app', 'service', 'premium'],
}

// Amount pattern regex - matches numbers with optional decimal points and currency words
const AMOUNT_PATTERNS = [
  /(?:(?:rupee|rupees|rs|₹)\s*)?(\d+(?:\.\d{1,2})?)\s*(?:rupees?|bucks?|dollars?|rs|₹)?/gi,
  /(\d+(?:\.\d{1,2})?)\s*(?:rupees?|bucks?|dollars?|rs|₹)/gi,
  /(?:spent|cost|paid|expense|charges?|fee|amount)\s*(?:of\s*)?(?:rupee|rupees|rs|₹)?\s*(\d+(?:\.\d{1,2})?)/gi,
]

// Merchant patterns
const MERCHANT_PATTERNS = [
  /(?:at|in|from|to)\s+([A-Z][a-zA-Z\s]*)/g,
  /(?:at)\s+([a-zA-Z]+)/gi,
]

/**
 * Parse voice transcript to expense object
 * Example: "Spent 50 rupees at Starbucks for lunch"
 * Returns: { amount: 50, merchant: "Starbucks", category: "Food & Dining", note: "lunch" }
 */
function parseExpenseFromTranscript(transcript) {
  const text = transcript.toLowerCase().trim()
  
  let amount = null
  let merchant = null
  let category = 'Other'
  let note = text

  // Extract amount
  for (const pattern of AMOUNT_PATTERNS) {
    const match = pattern.exec(text)
    if (match) {
      amount = parseFloat(match[1])
      break
    }
  }

  // Determine category based on keywords
  for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some(keyword => text.includes(keyword))) {
      category = cat
      break
    }
  }

  // Extract merchant name
  const merchantMatch = text.match(/(?:at|from|in)\s+([a-zA-Z\s]+?)(?:\s+for|\s+because|\s+to|$)/i)
  if (merchantMatch) {
    merchant = merchantMatch[1].trim().split(/\s+/).slice(0, 2).join(' ')
  }

  // Extract note (what was purchased for)
  const noteMatch = text.match(/(?:for|because|to|as)\s+([a-zA-Z\s]+?)(?:$|\.)/i)
  if (noteMatch) {
    note = noteMatch[1].trim()
  }

  return {
    amount: amount || 0,
    merchant: merchant || 'Unknown',
    category,
    note: note || transcript,
    originalTranscript: transcript,
    confidence: amount !== null ? 'high' : 'medium',
  }
}

/**
 * Custom hook for voice-to-expense conversion
 * Handles Web Speech API with fallback for browser compatibility
 */
export function useVoiceToExpense(onExpenseRecognized) {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [error, setError] = useState(null)
  const [parsedExpense, setParsedExpense] = useState(null)
  const recognitionRef = useRef(null)

  // Initialize speech recognition on first use
  const initializeSpeechRecognition = useCallback(() => {
    // If already initialized, return true so startListening can proceed
    if (recognitionRef.current) return true

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      setError('Speech Recognition API not supported in your browser. Try Chrome, Edge, or Safari.')
      return false
    }

    const recognition = new SpeechRecognition()
    recognition.continuous = false
    recognition.interimResults = true
    recognition.lang = 'en-US'

    let interimTranscript = ''
    let finalTranscript = ''

    recognition.onstart = () => {
      setIsListening(true)
      setError(null)
      setTranscript('')
      interimTranscript = ''
      finalTranscript = ''
      setParsedExpense(null)
    }

    recognition.onresult = (event) => {
      // accumulate final segments to finalTranscript and show interim while listening
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcriptSegment = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          finalTranscript = `${finalTranscript} ${transcriptSegment}`.trim()
          setTranscript(finalTranscript)
        } else {
          interimTranscript += transcriptSegment
          // show interim with final preview
          setTranscript(`${finalTranscript} ${interimTranscript}`.trim())
        }
      }
    }

    recognition.onerror = (event) => {
      const errorMessages = {
        'network': 'Network error. Please check your internet connection.',
        'no-speech': 'No speech detected. Please try again.',
        'audio-capture': 'Microphone not found or permission denied.',
        'not-allowed': 'Microphone permission denied. Please allow access.',
      }
      setError(errorMessages[event.error] || `Error: ${event.error}`)
      setIsListening(false)
    }

    recognition.onend = () => {
      setIsListening(false)
      // Parse the final transcript when recognition ends
      const text = finalTranscript.trim()
      if (text) {
        setTranscript(text)
        const expense = parseExpenseFromTranscript(text)
        setParsedExpense(expense)
        if (onExpenseRecognized) {
          try { onExpenseRecognized(expense) } catch (e) { console.error(e) }
        }
      }
    }

    recognitionRef.current = recognition
    return true
  }, [])

  const startListening = useCallback(() => {
    if (!initializeSpeechRecognition()) return

    try {
      recognitionRef.current.start()
    } catch (err) {
      // Already started
      console.log('Recognition already started')
    }
  }, [initializeSpeechRecognition])

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
    setIsListening(false)
  }, [transcript, onExpenseRecognized])

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening()
    } else {
      startListening()
    }
  }, [isListening, startListening, stopListening])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const resetTranscript = useCallback(() => {
    setTranscript('')
    setParsedExpense(null)
  }, [])

  return {
    // State
    isListening,
    transcript,
    error,
    parsedExpense,
    
    // Methods
    startListening,
    stopListening,
    toggleListening,
    clearError,
    resetTranscript,
    
    // Utility
    parseExpense: parseExpenseFromTranscript,
  }
}

export default useVoiceToExpense
