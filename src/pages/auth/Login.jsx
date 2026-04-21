import { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { onAuthStateChanged, signInWithPopup } from "firebase/auth"
import { doc, setDoc } from "firebase/firestore"
import { FcGoogle } from "react-icons/fc"

import Card from "../../components/ui/Card"
import Button from "../../components/ui/Button"
import Modal from "../../components/ui/Modal"
import { auth, db, provider } from "../../firebase"
import {
  discardGuestExpenses,
  getGuestExpenses,
  hasGuestExpenses,
  initializeGuestMode,
  mergeGuestExpensesIntoAccount,
} from "../../services/dataService"

const Login = () => {
  const navigate = useNavigate()
  const skipRedirectRef = useRef(false)

  const [authError, setAuthError] = useState("")
  const [guestExpenseCount, setGuestExpenseCount] = useState(0)
  const [isMergePromptOpen, setIsMergePromptOpen] = useState(false)
  const [isResolvingMerge, setIsResolvingMerge] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && !skipRedirectRef.current) {
        navigate("/")
      }
    })

    return () => unsubscribe()
  }, [navigate])

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

  const handleGoogleLogin = async () => {
    setAuthError("")
    setIsSubmitting(true)
    skipRedirectRef.current = true

    try {
      const result = await signInWithPopup(auth, provider)
      const user = result.user

      await saveUserProfile(user)

      const guestExpenses = getGuestExpenses()
      if (guestExpenses.length > 0 || hasGuestExpenses()) {
        setGuestExpenseCount(guestExpenses.length)
        setIsMergePromptOpen(true)
        return
      }

      finishLogin()
    } catch (error) {
      console.error("Google Login Error:", error)
      skipRedirectRef.current = false
      setAuthError("Google sign-in failed. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleContinueAsGuest = () => {
    initializeGuestMode()
    navigate("/")
  }

  const handleMergeDecision = async (shouldMerge) => {
    setAuthError("")
    setIsResolvingMerge(true)

    try {
      if (shouldMerge) {
        await mergeGuestExpensesIntoAccount()
      } else {
        discardGuestExpenses()
      }

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
              disabled={isSubmitting}
            >
              <FcGoogle size={20} />
              {isSubmitting ? "Signing in..." : "Continue with Google"}
            </Button>

            <Button
              onClick={handleContinueAsGuest}
              variant="secondary"
              className="w-full"
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
            Merge your offline expenses into your account?
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {guestExpenseCount > 0
              ? `${guestExpenseCount} guest expense${guestExpenseCount === 1 ? "" : "s"} will be compared against your cloud data and the newest version will win when there is a conflict.`
              : "We found guest expenses on this device and can move them into your account now."}
          </p>
          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={() => handleMergeDecision(false)}
              className="flex-1"
              disabled={isResolvingMerge}
            >
              {isResolvingMerge ? "Working..." : "Discard guest data"}
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
