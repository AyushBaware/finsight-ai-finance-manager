import { onAuthStateChanged } from "firebase/auth"
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  query,
  setDoc,
  where,
} from "firebase/firestore"

import { auth, db } from "../firebase"

export const GUEST_EXPENSES_STORAGE_KEY = "finsight_expenses_v1"
export const GUEST_MODE_STORAGE_KEY = "finsight_guest_mode_v1"
export const EXPENSES_CHANGED_EVENT = "expensesChanged"
export const EXPENSES_SYNC_ERROR_EVENT = "expensesSyncError"

const EXPENSES_COLLECTION = "expenses"
const DATA_SERVICE_INIT_KEY = "__finsightDataServiceInitialized"

const readJson = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    const parsed = JSON.parse(raw)
    return parsed ?? fallback
  } catch (error) {
    console.error(`Failed to read ${key}`, error)
    return fallback
  }
}

const writeJson = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch (error) {
    console.error(`Failed to write ${key}`, error)
    return false
  }
}

const removeStorageItem = (key) => {
  try {
    localStorage.removeItem(key)
  } catch (error) {
    console.error(`Failed to remove ${key}`, error)
  }
}

const getNowDateString = () => new Date().toISOString().split("T")[0]

const generateExpenseId = () => {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID()
  }

  return `expense_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`
}

const toTimestamp = (value) => {
  if (value == null) return null

  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null
  }

  if (typeof value === "string") {
    const parsed = Date.parse(value)
    return Number.isNaN(parsed) ? null : parsed
  }

  if (value instanceof Date) {
    return value.getTime()
  }

  if (typeof value.toMillis === "function") {
    return value.toMillis()
  }

  if (typeof value.toDate === "function") {
    return value.toDate().getTime()
  }

  if (typeof value.seconds === "number") {
    return value.seconds * 1000
  }

  return null
}

const getExpenseTimestamp = (expense = {}) => {
  return (
    toTimestamp(expense.timestamp) ??
    toTimestamp(expense.updatedAt) ??
    toTimestamp(expense.createdAt) ??
    toTimestamp(expense.date) ??
    0
  )
}

const toDateString = (value) => {
  if (!value) return getNowDateString()
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value
  }

  const timestamp = toTimestamp(value)
  if (!timestamp) return getNowDateString()

  return new Date(timestamp).toISOString().split("T")[0]
}

const normalizeExpense = (expense = {}, overrides = {}) => {
  const fallbackTimestamp = overrides.timestamp ?? Date.now()
  const createdTimestamp =
    toTimestamp(overrides.createdAt) ??
    toTimestamp(expense.createdAt) ??
    toTimestamp(expense.timestamp) ??
    toTimestamp(expense.date) ??
    fallbackTimestamp
  const updatedTimestamp =
    overrides.timestamp ??
    toTimestamp(overrides.updatedAt) ??
    toTimestamp(expense.updatedAt) ??
    toTimestamp(expense.timestamp) ??
    createdTimestamp
  const createdAt =
    overrides.createdAt ?? expense.createdAt ?? new Date(createdTimestamp).toISOString()
  const updatedAt =
    overrides.updatedAt ?? new Date(updatedTimestamp).toISOString()

  const normalized = {
    id: String(overrides.id ?? expense.id ?? generateExpenseId()),
    amount: Number(expense.amount) || 0,
    category: expense.category || "Other",
    note: expense.note || "",
    date: toDateString(expense.date || createdAt),
    createdAt,
    updatedAt,
    timestamp: updatedTimestamp,
  }

  if (expense.merchant) {
    normalized.merchant = expense.merchant
  }

  const userId = overrides.userId ?? expense.userId
  if (userId) {
    normalized.userId = userId
  }

  return normalized
}

const sortExpenses = (expenses = []) =>
  [...expenses].sort((left, right) => {
    const timestampDiff = getExpenseTimestamp(right) - getExpenseTimestamp(left)
    if (timestampDiff !== 0) return timestampDiff
    return String(right.id).localeCompare(String(left.id))
  })

const buildConflictKey = (expense = {}) => {
  return [
    toDateString(expense.date),
    (Number(expense.amount) || 0).toFixed(2),
    String(expense.category || "").trim().toLowerCase(),
    String(expense.note || "").trim().toLowerCase(),
    String(expense.merchant || "").trim().toLowerCase(),
  ].join("|")
}

const readGuestExpenses = () => {
  const parsed = readJson(GUEST_EXPENSES_STORAGE_KEY, [])
  if (!Array.isArray(parsed)) return []
  return sortExpenses(parsed.map((expense) => normalizeExpense(expense)))
}

const writeGuestExpenses = (expenses) => {
  return writeJson(
    GUEST_EXPENSES_STORAGE_KEY,
    sortExpenses(expenses.map((expense) => normalizeExpense(expense))),
  )
}

const emitExpenseChange = (type, detail = {}) => {
  if (typeof window === "undefined") return

  const payload = { type, ...detail }
  window.dispatchEvent(new CustomEvent(EXPENSES_CHANGED_EVENT, { detail: payload }))

  if (type === "add") {
    window.dispatchEvent(new CustomEvent("expenseAdded", { detail: payload }))
  }

  if (type === "update") {
    window.dispatchEvent(new CustomEvent("expenseUpdated", { detail: payload }))
  }

  if (type === "delete") {
    window.dispatchEvent(new CustomEvent("expenseDeleted", { detail: payload }))
  }
}

const emitExpenseSyncError = (error, detail = {}) => {
  if (typeof window === "undefined") return

  window.dispatchEvent(
    new CustomEvent(EXPENSES_SYNC_ERROR_EVENT, {
      detail: {
        ...detail,
        code: String(error?.code || "").replace("firestore/", "") || null,
        message: error?.message || "Expense sync failed.",
      },
    }),
  )
}

const isGuestModeEnabled = () => readJson(GUEST_MODE_STORAGE_KEY, false) === true

const buildExpensesQuery = (user = auth.currentUser) => {
  if (!user?.uid) return null

  return query(collection(db, EXPENSES_COLLECTION), where("userId", "==", user.uid))
}

const mapSnapshotExpenses = (snapshot, userId) =>
  sortExpenses(
    snapshot.docs.map((document) =>
      normalizeExpense(
        {
          id: document.id,
          ...document.data(),
        },
        { userId },
      ),
    ),
  )

const writeExpenseToCloud = async (expense, user = auth.currentUser) => {
  if (!user) {
    throw new Error("A logged-in user is required to store expenses in Firestore.")
  }

  const nextExpense = normalizeExpense(expense, { userId: user.uid, id: expense.id })
  await setDoc(doc(db, EXPENSES_COLLECTION, nextExpense.id), nextExpense, { merge: true })
  return nextExpense
}

const queueExpenseWriteToCloud = (expense, user = auth.currentUser) => {
  if (!user) {
    throw new Error("A logged-in user is required to store expenses in Firestore.")
  }

  const nextExpense = normalizeExpense(expense, { userId: user.uid, id: expense.id })

  void writeExpenseToCloud(nextExpense, user).catch((error) => {
    console.error("Failed to sync expense to Firestore", error)
    emitExpenseSyncError(error, {
      operation: "upsert",
      expenseId: nextExpense.id,
      userId: user.uid,
    })
  })

  return nextExpense
}

const deleteExpenseFromCloud = async (id, user = auth.currentUser) => {
  if (!user) {
    throw new Error("A logged-in user is required to delete Firestore expenses.")
  }

  const expenseId = String(id)
  await deleteDoc(doc(db, EXPENSES_COLLECTION, expenseId))
  return true
}

const queueExpenseDeleteFromCloud = (id, user = auth.currentUser) => {
  if (!user) {
    throw new Error("A logged-in user is required to delete Firestore expenses.")
  }

  const expenseId = String(id)

  void deleteExpenseFromCloud(expenseId, user).catch((error) => {
    console.error("Failed to sync expense deletion to Firestore", error)
    emitExpenseSyncError(error, {
      operation: "delete",
      expenseId,
      userId: user.uid,
    })
  })

  return true
}

const getCloudExpenses = async (user = auth.currentUser) => {
  if (!user) return []

  const expensesQuery = buildExpensesQuery(user)
  const snapshot = await getDocs(expensesQuery)

  return mapSnapshotExpenses(snapshot, user.uid)
}

const resolveLatestExpense = (existingExpense, incomingExpense, preferredId) => {
  const existingTimestamp = getExpenseTimestamp(existingExpense)
  const incomingTimestamp = getExpenseTimestamp(incomingExpense)
  const winner =
    incomingTimestamp >= existingTimestamp ? incomingExpense : existingExpense
  const loser = winner === incomingExpense ? existingExpense : incomingExpense
  const createdCandidates = [
    toTimestamp(existingExpense?.createdAt),
    toTimestamp(incomingExpense?.createdAt),
    existingTimestamp,
    incomingTimestamp,
  ].filter((value) => Number.isFinite(value) && value > 0)
  const createdTimestamp =
    createdCandidates.length > 0 ? Math.min(...createdCandidates) : Date.now()
  const updatedTimestamp = Math.max(existingTimestamp, incomingTimestamp)

  return normalizeExpense(
    {
      ...loser,
      ...winner,
      id: preferredId ?? winner.id ?? loser.id,
    },
    {
      id: preferredId ?? winner.id ?? loser.id,
      createdAt: new Date(createdTimestamp).toISOString(),
      updatedAt: new Date(updatedTimestamp).toISOString(),
      timestamp: updatedTimestamp,
      userId: winner.userId ?? loser.userId,
    },
  )
}

const upsertGuestExpense = (expense) => {
  const guestExpenses = readGuestExpenses()
  const expenseId = String(expense.id)
  const existingIndex = guestExpenses.findIndex(
    (currentExpense) => String(currentExpense.id) === expenseId,
  )

  if (existingIndex === -1) {
    const nextExpenses = sortExpenses([expense, ...guestExpenses])
    writeGuestExpenses(nextExpenses)
    return expense
  }

  const resolved = resolveLatestExpense(guestExpenses[existingIndex], expense, expenseId)
  const nextExpenses = [...guestExpenses]
  nextExpenses[existingIndex] = resolved
  writeGuestExpenses(nextExpenses)
  return resolved
}

const publishGuestExpenses = (listener) => {
  listener(readGuestExpenses(), {
    source: "guest",
    fromCache: true,
    hasPendingWrites: false,
    userId: null,
  })
}

export const subscribeToGuestExpenses = (listener) => {
  if (typeof listener !== "function") {
    return () => {}
  }

  if (typeof window === "undefined") {
    publishGuestExpenses(listener)
    return () => {}
  }

  const publish = () => publishGuestExpenses(listener)
  const handleStorage = (event) => {
    if (
      event?.key &&
      event.key !== GUEST_EXPENSES_STORAGE_KEY &&
      event.key !== GUEST_MODE_STORAGE_KEY
    ) {
      return
    }

    publish()
  }

  publish()
  window.addEventListener("storage", handleStorage)
  window.addEventListener(EXPENSES_CHANGED_EVENT, publish)

  return () => {
    window.removeEventListener("storage", handleStorage)
    window.removeEventListener(EXPENSES_CHANGED_EVENT, publish)
  }
}

export const subscribeToExpenses = (
  userOrListener,
  maybeListener,
  maybeErrorHandler,
) => {
  const hasExplicitUser = typeof userOrListener !== "function"
  const user = hasExplicitUser ? userOrListener : auth.currentUser
  const listener = hasExplicitUser ? maybeListener : userOrListener
  const errorHandler = hasExplicitUser ? maybeErrorHandler : maybeListener

  if (typeof listener !== "function") {
    return () => {}
  }

  if (!user?.uid) {
    return subscribeToGuestExpenses(listener)
  }

  return onSnapshot(
    buildExpensesQuery(user),
    { includeMetadataChanges: true },
    (snapshot) => {
      listener(mapSnapshotExpenses(snapshot, user.uid), {
        source: "cloud",
        fromCache: snapshot.metadata.fromCache,
        hasPendingWrites: snapshot.metadata.hasPendingWrites,
        userId: user.uid,
      })
    },
    (error) => {
      console.error("Failed to subscribe to Firestore expenses", error)
      emitExpenseSyncError(error, {
        operation: "subscribe",
        userId: user.uid,
      })

      if (typeof errorHandler === "function") {
        errorHandler(error)
      }
    },
  )
}

export async function flushQueuedOperations() {
  return 0
}

export function initializeGuestMode() {
  const wasGuestModeEnabled = isGuestModeEnabled()
  writeJson(GUEST_MODE_STORAGE_KEY, true)

  if (!localStorage.getItem(GUEST_EXPENSES_STORAGE_KEY)) {
    writeGuestExpenses([])
  }

  if (!wasGuestModeEnabled) {
    emitExpenseChange("sourceChanged", { mode: "guest" })
  }
}

export function clearGuestMode() {
  removeStorageItem(GUEST_MODE_STORAGE_KEY)
}

export function getGuestExpenses() {
  return readGuestExpenses()
}

export function hasGuestExpenses() {
  return readGuestExpenses().length > 0
}

export function discardGuestExpenses() {
  removeStorageItem(GUEST_EXPENSES_STORAGE_KEY)
  clearGuestMode()
  emitExpenseChange("sourceChanged", { mode: auth.currentUser ? "cloud" : "guest" })
}

export async function mergeGuestExpensesIntoAccount(user = auth.currentUser) {
  const currentUser = user ?? auth.currentUser
  if (!currentUser) {
    return { merged: 0, keptRemote: 0, totalGuestExpenses: 0 }
  }

  const guestExpenses = readGuestExpenses()
  if (!guestExpenses.length) {
    clearGuestMode()
    return { merged: 0, keptRemote: 0, totalGuestExpenses: 0 }
  }

  const cloudExpenses = await getCloudExpenses(currentUser)
  const cloudById = new Map(cloudExpenses.map((expense) => [String(expense.id), expense]))
  const cloudBySignature = new Map(
    cloudExpenses.map((expense) => [buildConflictKey(expense), expense]),
  )

  let merged = 0
  let keptRemote = 0

  for (const guestExpense of guestExpenses) {
    const normalizedGuestExpense = normalizeExpense(guestExpense, {
      userId: currentUser.uid,
      id: guestExpense.id,
    })
    const signature = buildConflictKey(normalizedGuestExpense)
    const conflict =
      cloudById.get(String(normalizedGuestExpense.id)) ?? cloudBySignature.get(signature)

    if (!conflict) {
      await writeExpenseToCloud(normalizedGuestExpense, currentUser)
      cloudById.set(normalizedGuestExpense.id, normalizedGuestExpense)
      cloudBySignature.set(signature, normalizedGuestExpense)
      merged += 1
      continue
    }

    if (getExpenseTimestamp(normalizedGuestExpense) >= getExpenseTimestamp(conflict)) {
      const resolvedExpense = resolveLatestExpense(
        conflict,
        normalizedGuestExpense,
        conflict.id || normalizedGuestExpense.id,
      )
      await writeExpenseToCloud(resolvedExpense, currentUser)
      cloudById.set(String(resolvedExpense.id), resolvedExpense)
      cloudBySignature.set(buildConflictKey(resolvedExpense), resolvedExpense)
      merged += 1
    } else {
      keptRemote += 1
    }
  }

  discardGuestExpenses()
  emitExpenseChange("merge", { merged, keptRemote })

  return {
    merged,
    keptRemote,
    totalGuestExpenses: guestExpenses.length,
  }
}

export async function getExpenses() {
  const user = auth.currentUser

  if (user) {
    try {
      return await getCloudExpenses(user)
    } catch (error) {
      console.error("Failed to fetch expenses from Firestore", error)
      return []
    }
  }

  return readGuestExpenses()
}

export async function addExpense(expense) {
  const user = auth.currentUser
  const timestamp = Date.now()
  const createdAt = expense.createdAt ?? new Date(timestamp).toISOString()
  const nextExpense = normalizeExpense(expense, {
    id: expense.id,
    createdAt,
    updatedAt: new Date(timestamp).toISOString(),
    timestamp,
    userId: user?.uid,
  })

  try {
    if (user) {
      const queuedExpense = queueExpenseWriteToCloud(nextExpense, user)
      emitExpenseChange("add", {
        expense: queuedExpense,
        mode: "cloud",
        pending: true,
      })
      return queuedExpense
    }

    initializeGuestMode()
    const savedExpense = upsertGuestExpense(nextExpense)
    emitExpenseChange("add", { expense: savedExpense, mode: "guest" })
    return savedExpense
  } catch (error) {
    console.error("Failed to add expense", error)
    return null
  }
}

export async function updateExpense(id, updates, existingExpenseInput = null) {
  const expenseId = String(id)
  const existingExpense =
    existingExpenseInput ??
    (await getExpenses()).find((currentExpense) => String(currentExpense.id) === expenseId)
  const timestamp = Date.now()
  const nextExpense = normalizeExpense(
    {
      ...existingExpense,
      ...updates,
      id: expenseId,
    },
    {
      id: expenseId,
      createdAt: existingExpense?.createdAt ?? new Date(timestamp).toISOString(),
      updatedAt: new Date(timestamp).toISOString(),
      timestamp,
      userId: auth.currentUser?.uid ?? existingExpense?.userId,
    },
  )

  try {
    if (auth.currentUser) {
      const savedExpense = queueExpenseWriteToCloud(nextExpense, auth.currentUser)
      emitExpenseChange("update", {
        expense: savedExpense,
        mode: "cloud",
        pending: true,
      })
      return savedExpense
    }

    initializeGuestMode()
    const savedExpense = upsertGuestExpense(nextExpense)
    emitExpenseChange("update", { expense: savedExpense, mode: "guest" })
    return savedExpense
  } catch (error) {
    console.error("Failed to update expense", error)
    return null
  }
}

export async function deleteExpense(id) {
  const expenseId = String(id)

  try {
    if (auth.currentUser) {
      queueExpenseDeleteFromCloud(expenseId, auth.currentUser)
      emitExpenseChange("delete", {
        id: expenseId,
        mode: "cloud",
        pending: true,
      })
      return true
    }

    const remainingExpenses = readGuestExpenses().filter(
      (expense) => String(expense.id) !== expenseId,
    )
    writeGuestExpenses(remainingExpenses)
    emitExpenseChange("delete", { id: expenseId, mode: "guest" })
    return true
  } catch (error) {
    console.error("Failed to delete expense", error)
    return false
  }
}

if (typeof window !== "undefined" && !window[DATA_SERVICE_INIT_KEY]) {
  window[DATA_SERVICE_INIT_KEY] = true

  onAuthStateChanged(auth, (user) => {
    emitExpenseChange("sourceChanged", {
      mode: user ? "cloud" : "guest",
      userId: user?.uid ?? null,
    })
  })
}

const dataService = {
  addExpense,
  deleteExpense,
  discardGuestExpenses,
  flushQueuedOperations,
  getExpenses,
  getGuestExpenses,
  hasGuestExpenses,
  initializeGuestMode,
  mergeGuestExpensesIntoAccount,
  subscribeToExpenses,
  subscribeToGuestExpenses,
  updateExpense,
}

export default dataService
