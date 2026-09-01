import { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  GoogleAuthProvider,
  getRedirectResult,
  linkWithRedirect,
  onAuthStateChanged,
  signInWithCredential,
  signInWithRedirect,
} from "firebase/auth"
import { doc, setDoc } from "firebase/firestore"
import { FcGoogle } from "react-icons/fc"

import Card from "../../components/ui/Card"
import Button from "../../components/ui/Button"
import Modal from "../../components/ui/Modal"
import { auth, db, provider } from "../../firebase"
import { getCloudExpenses, mergeExpenseListIntoAccount } from "../../services/dataService"

// Sessions can't hold a live JS object across a full-page redirect, so the
// credential + captured expenses are serialized here and read back when
// the browser returns from Google.
const PENDING_MERGE_KEY = "finsight_pending_google_merge_v1"

const readPendingMerge = () => {
  try {
    const raw = sessionStorage.getItem(PENDING_MERGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

const clearPendingMerge = () => {
  try {
    sessionStorage.removeItem(PENDING_MERGE_KEY)
  } catch {
    // ignore
  }
}

const Login = () => {
  const navigate = useNavigate()
  const skipRedirectRef = useRef(false)

  const [authError, setAuthError] = useState("")
  const [guestExpenseCount, setGuestExpenseCount] = useState(0)
  const [isMergePromptOpen, setIsMergePromptOpen] = useState(false)
  const [isResolvingMerge, setIsResolvingMerge] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isProcessingRedirect, setIsProcessingRedirect] = useState(true)

  const saveUserProfile = async (user) => {
    await setDoc(
      doc(db, "users", user.uid),
      {
        name: user.displayName,
        email: user.email,
        photo: user.photoURL,
        createdAt: new Date().toISOString(),
      },
      { merge: true },
    )
  }

  const finishLogin = () => {
    skipRedirectRef.current = false
    setIsMergePromptOpen(false)
    setIsResolvingMerge(false)
    navigate("/")
  }

  // Runs once on mount — picks up the outcome of a signInWithRedirect /
  // linkWithRedirect that just brought the browser back to this page.
  // Redirect (not popup) is what's actually reliable in production:
  // popups get silently blocked by many mobile browsers, installed
  // standalone PWAs, and default Cross-Origin-Opener-Policy headers that
  // hosts like Vercel/Netlify send — that combination is the most common
  // real-world reason Google sign-in fails in prod but works locally.
  useEffect(() => {
    const processRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth)

        if (result?.user) {
          // Primary path: Google just got linked to the SAME anonymous
          // session this device already had. The uid never changed, so
          // every expense already written to Firestore is already this
          // account's data — no merge step needed.
          await saveUserProfile(result.user)
          finishLogin()
        }
        // result is null when this load isn't the return leg of a
        // redirect sign-in — the normal case for every other page view.
      } catch (error) {
        if (error?.code === "auth/credential-already-in-use") {
          // This Google account already has its own FinSight account
          // elsewhere, so linking failed. Capture this device's
          // anonymous-session expenses and the credential now — while
          // still signed in anonymously, which is required to read them —
          // and ask the user whether to bring this data along.
          try {
            const anonymousUser = auth.currentUser
            const anonymousExpenses = await getCloudExpenses(anonymousUser)
            const credential = GoogleAuthProvider.credentialFromError(error)

            sessionStorage.setItem(
              PENDING_MERGE_KEY,
              JSON.stringify({
                credential: credential.toJSON(),
                expenses: anonymousExpenses,
              }),
            )

            setGuestExpenseCount(anonymousExpenses.length)
            setIsMergePromptOpen(true)
          } catch (captureError) {
            console.error("Failed to prepare account merge:", captureError)
            setAuthError("Google sign-in failed. Please try again.")
          }
        } else {
          console.error("Google Login Error:", error)
          setAuthError("Google sign-in failed. Please try again.")
        }
      } finally {
        setIsProcessingRedirect(false)
      }
    }

    processRedirectResult()
  }, [])

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      // Only a REAL (non-anonymous) sign-in should redirect away from
      // this page automatically — an anonymous user is present on
      // basically every load now, so "user exists" no longer means
      // "signed in."
      if (user && !user.isAnonymous && !skipRedirectRef.current) {
        navigate("/")
      }
    })

    return () => unsubscribe()
  }, [navigate])

  const handleGoogleLogin = async () => {
    setAuthError("")
    setIsSubmitting(true)
    skipRedirectRef.current = true

    try {
      if (auth.currentUser) {
        await linkWithRedirect(auth.currentUser, provider)
      } else {
        await signInWithRedirect(auth, provider)
      }
      // Browser navigates away here; nothing after this line runs.
    } catch (error) {
      console.error("Google Login Error:", error)
      skipRedirectRef.current = false
      setIsSubmitting(false)
      setAuthError("Google sign-in failed. Please try again.")
    }
  }

  const handleContinueAsGuest = () => {
    // Anonymous auth already ran automatically on app load — this button
    // just confirms the choice and moves on, there's nothing to set up.
    navigate("/")
  }

  const handleMergeDecision = async (shouldMerge) => {
    setAuthError("")
    setIsResolvingMerge(true)

    try {
      const pending = readPendingMerge()
      if (!pending) throw new Error("No pending merge found.")

      const credential = GoogleAuthProvider.credentialFromJSON(pending.credential)
      await signInWithCredential(auth, credential)

      if (shouldMerge) {
        await mergeExpenseListIntoAccount(pending.expenses, auth.currentUser)
      }

      clearPendingMerge()
      finishLogin()
    } catch (error) {
      console.error("Failed to resolve guest expense merge", error)
      setAuthError("We could not finish moving your guest data. Please try again.")
      setIsResolvingMerge(false)
    }
  }

  return (
    <>
      <div className="theme-shell flex min-h-screen items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
              Welcome back
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Sign in to sync your expenses across devices, or keep going offline.
            </p>
          </div>

          {authError ? (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {authError}
            </div>
          ) : null}

          <div className="space-y-3">
            <Button
              onClick={handleGoogleLogin}
              className="flex w-full items-center justify-center gap-3"
              disabled={isSubmitting || isProcessingRedirect}
            >
              <FcGoogle size={20} />
              {isSubmitting ? "Redirecting to Google..." : "Continue with Google"}
            </Button>

            <Button
              onClick={handleContinueAsGuest}
              variant="secondary"
              className="w-full"
              disabled={isProcessingRedirect}
            >
              Continue as Guest
            </Button>
          </div>

          <p className="mt-6 text-center text-sm text-gray-500">
            Your guest expenses stay on this device until you choose to merge them.
          </p>
        </Card>
      </div>

      <Modal
        isOpen={isMergePromptOpen}
        onClose={() => {
          if (!isResolvingMerge) {
            handleMergeDecision(false)
          }
        }}
        title="Merge offline expenses?"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            This Google account already has a FinSight account. Merge this device's expenses into it?
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {guestExpenseCount > 0
              ? `${guestExpenseCount} expense${guestExpenseCount === 1 ? "" : "s"} on this device will be compared against your account and the newest version will win when there is a conflict.`
              : "We found expenses on this device and can move them into your account now."}
          </p>
          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={() => handleMergeDecision(false)}
              className="flex-1"
              disabled={isResolvingMerge}
            >
              {isResolvingMerge ? "Working..." : "Discard this device's data"}
            </Button>
            <Button
              onClick={() => handleMergeDecision(true)}
              className="flex-1"
              disabled={isResolvingMerge}
            >
              {isResolvingMerge ? "Merging..." : "Merge expenses"}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}

export default Login