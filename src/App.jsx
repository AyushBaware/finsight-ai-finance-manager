import { useEffect, useState } from "react"
import { BrowserRouter, Route, Routes } from "react-router-dom"
import { onAuthStateChanged } from "firebase/auth"

import Sidebar from "./components/layout/Sidebar"
import Header from "./components/layout/Header"
import BottomNav from "./components/layout/BottomNav"
import QuickAddExpenseModal from "./components/common/QuickAddExpenseModal"
import ExpenseWidget from "./components/common/ExpenseWidget"
import { ExpensesContext } from "./context/ExpensesContext"
import { ThemeContext } from "./context/ThemeContext"
import {
  auth,
  getFirestorePersistenceState,
  subscribeToFirestorePersistenceState,
} from "./firebase"
import Login from "./pages/auth/Login"
import Register from "./pages/auth/Register"
import Dashboard from "./pages/Dashboard"
import Expenses from "./pages/Expenses"
import Analytics from "./pages/Analytics"
import Categories from "./pages/Categories"
import AddExpense from "./pages/AddExpense"
import Settings from "./pages/Settings"
import {
  buildThemeVariables,
  getAvailableThemes,
  getStoredThemePreference,
  getTheme,
  mergeGuestThemePreferenceIntoAccount,
  normalizeThemePreference,
  resolveMode,
  saveThemePreference,
  subscribeToThemePreference,
  THEME_PREFERENCE_EVENT,
  THEME_STORAGE_KEY,
} from "./services/themeService"
import {
  addExpense as createExpense,
  deleteExpense as removeExpense,
  EXPENSES_SYNC_ERROR_EVENT,
  subscribeToExpenses,
  updateExpense as editExpense,
} from "./services/dataService"

const getSystemMode = () => {
  if (typeof window === "undefined") return "light"

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
}

const getOnlineState = () => {
  if (typeof navigator === "undefined") return true
  return navigator.onLine
}

const AuthLayout = ({
  children,
  user,
  isSidebarOpen,
  setIsSidebarOpen,
  onAddClick,
  isQuickAddOpen,
  setIsQuickAddOpen,
}) => (
  <div className="theme-shell flex min-h-screen">
    <Sidebar
      isOpen={isSidebarOpen}
      onClose={() => setIsSidebarOpen(false)}
      user={user}
    />
    <div className="flex flex-1 flex-col md:ml-64">
      <Header
        title="FinSight"
        onMenuClick={() => setIsSidebarOpen(true)}
        onAddClick={onAddClick}
      />
      <main className="theme-shell flex-1 overflow-y-auto p-4 pb-20 md:pb-4">
        {children}
      </main>
      <BottomNav onAddClick={onAddClick} />
    </div>
    <ExpenseWidget />
    <QuickAddExpenseModal
      isOpen={isQuickAddOpen}
      onClose={() => setIsQuickAddOpen(false)}
    />
  </div>
)

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false)
  const [user, setUser] = useState(null)
  const [isAuthReady, setIsAuthReady] = useState(false)
  const [systemMode, setSystemMode] = useState(getSystemMode)
  const [themePreference, setThemePreference] = useState(getStoredThemePreference)
  const [expenses, setExpenses] = useState([])
  const [expenseState, setExpenseState] = useState({
    errorMessage: "",
    fromCache: true,
    hasPendingWrites: false,
    isReady: false,
    source: "guest",
    userId: null,
  })
  const [isOnline, setIsOnline] = useState(getOnlineState)
  const [persistenceState, setPersistenceState] = useState(getFirestorePersistenceState)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
      setIsAuthReady(true)

      if (!currentUser) {
        setThemePreference(getStoredThemePreference())
        return
      }

      mergeGuestThemePreferenceIntoAccount(currentUser)
        .then((mergedPreference) => {
          if (mergedPreference) {
            setThemePreference(normalizeThemePreference(mergedPreference))
          }
        })
        .catch((error) => {
          console.error("Failed to merge guest theme preference", error)
        })
    })

    return () => unsubscribe()
  }, [])

  useEffect(() => {
    if (typeof window === "undefined") return undefined

    const updateOnlineState = () => {
      setIsOnline(navigator.onLine)
    }

    updateOnlineState()
    window.addEventListener("online", updateOnlineState)
    window.addEventListener("offline", updateOnlineState)

    return () => {
      window.removeEventListener("online", updateOnlineState)
      window.removeEventListener("offline", updateOnlineState)
    }
  }, [])

  useEffect(() => {
    return subscribeToFirestorePersistenceState((nextState) => {
      setPersistenceState(nextState)
    })
  }, [])

  useEffect(() => {
    if (typeof window === "undefined") return undefined

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
    const handleModeChange = (event) => {
      setSystemMode(event.matches ? "dark" : "light")
    }

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", handleModeChange)
      return () => mediaQuery.removeEventListener("change", handleModeChange)
    }

    mediaQuery.addListener(handleModeChange)
    return () => mediaQuery.removeListener(handleModeChange)
  }, [])

  useEffect(() => {
    if (!user?.uid) return undefined

    return subscribeToThemePreference(user.uid, (nextPreference) => {
      setThemePreference(
        nextPreference ? normalizeThemePreference(nextPreference) : getStoredThemePreference(),
      )
    })
  }, [user?.uid])

  useEffect(() => {
    if (typeof window === "undefined") return undefined

    const handleThemeEvent = (event) => {
      if (user) return
      setThemePreference(normalizeThemePreference(event.detail))
    }

    const handleStorageEvent = (event) => {
      if (user || event.key !== THEME_STORAGE_KEY) return
      setThemePreference(getStoredThemePreference())
    }

    window.addEventListener(THEME_PREFERENCE_EVENT, handleThemeEvent)
    window.addEventListener("storage", handleStorageEvent)

    return () => {
      window.removeEventListener(THEME_PREFERENCE_EVENT, handleThemeEvent)
      window.removeEventListener("storage", handleStorageEvent)
    }
  }, [user])

  useEffect(() => {
    if (!isAuthReady) return undefined

    return subscribeToExpenses(
      user,
      (nextExpenses, metadata = {}) => {
        setExpenses(Array.isArray(nextExpenses) ? nextExpenses : [])
        setExpenseState({
          errorMessage: "",
          fromCache: Boolean(metadata.fromCache),
          hasPendingWrites: Boolean(metadata.hasPendingWrites),
          isReady: true,
          source: metadata.source || (user?.uid ? "cloud" : "guest"),
          userId: metadata.userId ?? null,
        })
      },
      (error) => {
        setExpenseState((previous) => ({
          ...previous,
          errorMessage: error?.message || "Could not sync expenses right now.",
          isReady: true,
          source: user?.uid ? "cloud" : "guest",
          userId: user?.uid ?? null,
        }))
      },
    )
  }, [isAuthReady, user])

  useEffect(() => {
    if (typeof window === "undefined") return undefined

    const handleExpenseSyncError = (event) => {
      setExpenseState((previous) => ({
        ...previous,
        errorMessage: event.detail?.message || "Could not sync expenses right now.",
      }))
    }

    window.addEventListener(EXPENSES_SYNC_ERROR_EVENT, handleExpenseSyncError)

    return () => {
      window.removeEventListener(EXPENSES_SYNC_ERROR_EVENT, handleExpenseSyncError)
    }
  }, [])

  const activeMode = resolveMode(themePreference.modePreference, systemMode)
  const activeTheme = getTheme(themePreference.themeId)

  useEffect(() => {
    if (typeof document === "undefined") return

    const root = document.documentElement
    const variables = buildThemeVariables(themePreference.themeId, activeMode)

    Object.entries(variables).forEach(([key, value]) => {
      root.style.setProperty(key, value)
    })

    root.dataset.theme = themePreference.themeId
    root.dataset.colorMode = activeMode
    root.style.colorScheme = activeMode
  }, [activeMode, themePreference.themeId])

  const handleThemePreferenceChange = async (updates) => {
    const nextPreference = normalizeThemePreference({
      ...themePreference,
      ...updates,
      updatedAt: new Date().toISOString(),
    })

    setThemePreference(nextPreference)

    try {
      const savedPreference = await saveThemePreference(nextPreference, user)
      if (!user) {
        setThemePreference(savedPreference)
      }
    } catch (error) {
      console.error("Failed to save theme preference", error)
    }
  }

  const handleQuickAddExpense = () => {
    setIsQuickAddOpen(true)
  }

  const runExpenseMutation = async (mutation) => {
    if (user?.uid && !isOnline && !persistenceState.enabled) {
      const message =
        persistenceState.message ||
        "Offline cloud caching is unavailable in this browser session."

      setExpenseState((previous) => ({
        ...previous,
        errorMessage: message,
        source: user?.uid ? "cloud" : "guest",
        userId: user?.uid ?? null,
      }))

      return null
    }

    return mutation()
  }

  const handleAddExpense = (expense) => runExpenseMutation(() => createExpense(expense))
  const handleUpdateExpense = (id, updates, existingExpense) =>
    runExpenseMutation(() => editExpense(id, updates, existingExpense))
  const handleDeleteExpense = (id) => runExpenseMutation(() => removeExpense(id))
  const activeExpenseSource = user?.uid ? "cloud" : "guest"
  const activeExpenseOwnerId = user?.uid ?? null
  const isMatchingExpenseFeed =
    expenseState.source === activeExpenseSource && expenseState.userId === activeExpenseOwnerId
  const visibleExpenses = isMatchingExpenseFeed ? expenses : []

  const expenseContextValue = {
    addExpense: handleAddExpense,
    deleteExpense: handleDeleteExpense,
    expenses: visibleExpenses,
    expenseError: isMatchingExpenseFeed ? expenseState.errorMessage : "",
    expenseSource: expenseState.source,
    fromCache: isMatchingExpenseFeed ? expenseState.fromCache : true,
    hasPendingWrites: isMatchingExpenseFeed ? expenseState.hasPendingWrites : false,
    isOnline,
    isReady: isMatchingExpenseFeed && expenseState.isReady,
    isSyncing: isMatchingExpenseFeed && expenseState.hasPendingWrites,
    persistenceState,
    updateExpense: handleUpdateExpense,
    user,
  }

  return (
    <ThemeContext.Provider
      value={{
        activeMode,
        currentTheme: activeTheme,
        setThemePreference: handleThemePreferenceChange,
        systemMode,
        themePreference,
        themes: getAvailableThemes(),
        user,
      }}
    >
      <ExpensesContext.Provider value={expenseContextValue}>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route
              path="/"
              element={
                <AuthLayout
                  user={user}
                  isSidebarOpen={isSidebarOpen}
                  setIsSidebarOpen={setIsSidebarOpen}
                  onAddClick={handleQuickAddExpense}
                  isQuickAddOpen={isQuickAddOpen}
                  setIsQuickAddOpen={setIsQuickAddOpen}
                >
                  <Dashboard />
                </AuthLayout>
              }
            />
            <Route
              path="/expenses"
              element={
                <AuthLayout
                  user={user}
                  isSidebarOpen={isSidebarOpen}
                  setIsSidebarOpen={setIsSidebarOpen}
                  onAddClick={handleQuickAddExpense}
                  isQuickAddOpen={isQuickAddOpen}
                  setIsQuickAddOpen={setIsQuickAddOpen}
                >
                  <Expenses />
                </AuthLayout>
              }
            />
            <Route
              path="/analytics"
              element={
                <AuthLayout
                  user={user}
                  isSidebarOpen={isSidebarOpen}
                  setIsSidebarOpen={setIsSidebarOpen}
                  onAddClick={handleQuickAddExpense}
                  isQuickAddOpen={isQuickAddOpen}
                  setIsQuickAddOpen={setIsQuickAddOpen}
                >
                  <Analytics />
                </AuthLayout>
              }
            />
            <Route
              path="/categories"
              element={
                <AuthLayout
                  user={user}
                  isSidebarOpen={isSidebarOpen}
                  setIsSidebarOpen={setIsSidebarOpen}
                  onAddClick={handleQuickAddExpense}
                  isQuickAddOpen={isQuickAddOpen}
                  setIsQuickAddOpen={setIsQuickAddOpen}
                >
                  <Categories />
                </AuthLayout>
              }
            />
            <Route
              path="/add-expense"
              element={
                <AuthLayout
                  user={user}
                  isSidebarOpen={isSidebarOpen}
                  setIsSidebarOpen={setIsSidebarOpen}
                  onAddClick={handleQuickAddExpense}
                  isQuickAddOpen={isQuickAddOpen}
                  setIsQuickAddOpen={setIsQuickAddOpen}
                >
                  <AddExpense />
                </AuthLayout>
              }
            />
            <Route
              path="/settings"
              element={
                <AuthLayout
                  user={user}
                  isSidebarOpen={isSidebarOpen}
                  setIsSidebarOpen={setIsSidebarOpen}
                  onAddClick={handleQuickAddExpense}
                  isQuickAddOpen={isQuickAddOpen}
                  setIsQuickAddOpen={setIsQuickAddOpen}
                >
                  <Settings />
                </AuthLayout>
              }
            />
          </Routes>
        </BrowserRouter>
      </ExpensesContext.Provider>
    </ThemeContext.Provider>
  )
}

export default App
