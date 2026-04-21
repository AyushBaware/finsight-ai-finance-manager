import { doc, getDoc, onSnapshot, setDoc } from "firebase/firestore"

import { auth, db } from "../firebase"

export const THEME_STORAGE_KEY = "finsight_theme_preferences_v1"
export const DEFAULT_THEME_ID = "classic"
export const DEFAULT_MODE_PREFERENCE = "system"

export const themes = {
  classic: {
    id: "classic",
    label: "Classic Ledger",
    description: "Clean blue accents with a crisp finance-dashboard feel.",
    fontFamily: '"Inter", "Segoe UI", sans-serif',
    colors: {
      light: {
        background: "#f3f6fb",
        surface: "#ffffff",
        surfaceMuted: "#e8eef8",
        text: "#152033",
        muted: "#5d6b82",
        accent: "#2563eb",
        accentStrong: "#1d4ed8",
        accentSoft: "#dbeafe",
        accentContrast: "#ffffff",
        border: "#d6deeb",
        overlay: "rgba(7, 15, 29, 0.56)",
        shadow: "0 24px 60px rgba(37, 99, 235, 0.14)",
      },
      dark: {
        background: "#0d1423",
        surface: "#131d31",
        surfaceMuted: "#1b2842",
        text: "#eef4ff",
        muted: "#9fb0cf",
        accent: "#60a5fa",
        accentStrong: "#3b82f6",
        accentSoft: "#172554",
        accentContrast: "#06101f",
        border: "#2b3855",
        overlay: "rgba(1, 6, 16, 0.72)",
        shadow: "0 24px 60px rgba(15, 23, 42, 0.4)",
      },
    },
  },
  elegant: {
    id: "elegant",
    label: "Elegant Reserve",
    description: "Warm ivory, slate depth, and a refined editorial serif.",
    fontFamily: '"Merriweather", Georgia, serif',
    colors: {
      light: {
        background: "#fbf7f1",
        surface: "#fffdf9",
        surfaceMuted: "#f2eadb",
        text: "#2c241d",
        muted: "#7d6f61",
        accent: "#9a6c2f",
        accentStrong: "#7a5320",
        accentSoft: "#f6e7c9",
        accentContrast: "#fffaf2",
        border: "#e4d4bc",
        overlay: "rgba(31, 24, 19, 0.5)",
        shadow: "0 24px 60px rgba(122, 83, 32, 0.12)",
      },
      dark: {
        background: "#16110c",
        surface: "#1f1913",
        surfaceMuted: "#2b241d",
        text: "#f9f1e6",
        muted: "#c0ab93",
        accent: "#d6a55c",
        accentStrong: "#b8853e",
        accentSoft: "#3a2a16",
        accentContrast: "#1f1305",
        border: "#4a3a2a",
        overlay: "rgba(6, 4, 3, 0.72)",
        shadow: "0 24px 60px rgba(8, 6, 4, 0.42)",
      },
    },
  },
  modern: {
    id: "modern",
    label: "Modern Current",
    description: "High-contrast geometry with fresh teal energy.",
    fontFamily: '"Space Grotesk", "Segoe UI", sans-serif',
    colors: {
      light: {
        background: "#eef6f5",
        surface: "#ffffff",
        surfaceMuted: "#dff2ef",
        text: "#0f1720",
        muted: "#4e6a67",
        accent: "#0f766e",
        accentStrong: "#0b5d57",
        accentSoft: "#ccfbf1",
        accentContrast: "#f3fffd",
        border: "#c7e5e0",
        overlay: "rgba(3, 16, 17, 0.56)",
        shadow: "0 24px 60px rgba(15, 118, 110, 0.14)",
      },
      dark: {
        background: "#071616",
        surface: "#0d2322",
        surfaceMuted: "#113434",
        text: "#e8fffc",
        muted: "#94c4bd",
        accent: "#2dd4bf",
        accentStrong: "#14b8a6",
        accentSoft: "#123f3b",
        accentContrast: "#03211e",
        border: "#21504d",
        overlay: "rgba(2, 10, 10, 0.74)",
        shadow: "0 24px 60px rgba(3, 15, 16, 0.44)",
      },
    },
  },
}

export const DEFAULT_THEME_PREFERENCE = Object.freeze({
  themeId: DEFAULT_THEME_ID,
  modePreference: DEFAULT_MODE_PREFERENCE,
  updatedAt: null,
})

const THEME_EVENT = "themePreferenceChanged"
const VALID_MODE_PREFERENCES = new Set(["light", "dark", "system"])

const readJson = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw)
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

const emitThemePreferenceChange = (preference) => {
  if (typeof window === "undefined") return
  window.dispatchEvent(new CustomEvent(THEME_EVENT, { detail: preference }))
}

const toTimestamp = (value) => {
  if (!value) return 0
  if (typeof value === "number") return value
  if (typeof value === "string") {
    const parsed = Date.parse(value)
    return Number.isNaN(parsed) ? 0 : parsed
  }
  if (typeof value.toMillis === "function") return value.toMillis()
  return 0
}

const getThemeSettingsRef = (uid) => doc(db, "users", uid, "settings", "preferences")

export const getAvailableThemes = () => Object.values(themes)

export const getTheme = (themeId) => themes[themeId] ?? themes[DEFAULT_THEME_ID]

export const normalizeThemePreference = (preference = {}) => {
  const nextThemeId = themes[preference.themeId] ? preference.themeId : DEFAULT_THEME_ID
  const nextModePreference = VALID_MODE_PREFERENCES.has(preference.modePreference)
    ? preference.modePreference
    : DEFAULT_MODE_PREFERENCE

  return {
    themeId: nextThemeId,
    modePreference: nextModePreference,
    updatedAt: preference.updatedAt ?? null,
  }
}

export const getStoredThemePreference = () =>
  normalizeThemePreference(readJson(THEME_STORAGE_KEY, DEFAULT_THEME_PREFERENCE))

export const clearStoredThemePreference = () => {
  try {
    localStorage.removeItem(THEME_STORAGE_KEY)
  } catch (error) {
    console.error("Failed to clear guest theme preference", error)
  }
}

export const saveGuestThemePreference = (preference) => {
  const nextPreference = normalizeThemePreference({
    ...preference,
    updatedAt: preference.updatedAt ?? new Date().toISOString(),
  })

  writeJson(THEME_STORAGE_KEY, nextPreference)
  emitThemePreferenceChange(nextPreference)
  return nextPreference
}

export async function loadThemePreference(user = auth.currentUser) {
  if (!user) {
    return getStoredThemePreference()
  }

  const snapshot = await getDoc(getThemeSettingsRef(user.uid))
  if (!snapshot.exists()) {
    return getStoredThemePreference()
  }

  const data = snapshot.data()
  return normalizeThemePreference({
    themeId: data.theme,
    modePreference: data.modePreference,
    updatedAt: data.updatedAt,
  })
}

export async function saveThemePreference(preference, user = auth.currentUser) {
  const nextPreference = normalizeThemePreference({
    ...preference,
    updatedAt: new Date().toISOString(),
  })

  if (!user) {
    return saveGuestThemePreference(nextPreference)
  }

  await setDoc(
    getThemeSettingsRef(user.uid),
    {
      theme: nextPreference.themeId,
      modePreference: nextPreference.modePreference,
      updatedAt: nextPreference.updatedAt,
    },
    { merge: true },
  )

  return nextPreference
}

export function subscribeToThemePreference(userId, callback) {
  if (!userId) return () => {}

  return onSnapshot(getThemeSettingsRef(userId), (snapshot) => {
    if (!snapshot.exists()) {
      callback(null)
      return
    }

    const data = snapshot.data()
    callback(
      normalizeThemePreference({
        themeId: data.theme,
        modePreference: data.modePreference,
        updatedAt: data.updatedAt,
      }),
    )
  })
}

export async function mergeGuestThemePreferenceIntoAccount(user = auth.currentUser) {
  const currentUser = user ?? auth.currentUser
  const guestPreference = readJson(THEME_STORAGE_KEY, null)

  if (!currentUser || !guestPreference) {
    return null
  }

  const normalizedGuestPreference = normalizeThemePreference(guestPreference)
  const remoteSnapshot = await getDoc(getThemeSettingsRef(currentUser.uid))
  const remotePreference = remoteSnapshot.exists()
    ? normalizeThemePreference({
        themeId: remoteSnapshot.data().theme,
        modePreference: remoteSnapshot.data().modePreference,
        updatedAt: remoteSnapshot.data().updatedAt,
      })
    : null

  const guestTimestamp = toTimestamp(normalizedGuestPreference.updatedAt)
  const remoteTimestamp = toTimestamp(remotePreference?.updatedAt)
  const shouldPromoteGuestPreference = !remotePreference || guestTimestamp >= remoteTimestamp

  if (shouldPromoteGuestPreference) {
    await saveThemePreference(normalizedGuestPreference, currentUser)
  }

  clearStoredThemePreference()
  return shouldPromoteGuestPreference
    ? normalizedGuestPreference
    : remotePreference
}

export const resolveMode = (modePreference, systemMode) => {
  if (modePreference === "dark") return "dark"
  if (modePreference === "light") return "light"
  return systemMode === "dark" ? "dark" : "light"
}

export const buildThemeVariables = (themeId, activeMode) => {
  const currentTheme = getTheme(themeId)
  const palette = currentTheme.colors[activeMode] ?? currentTheme.colors.light

  return {
    "--bg-color": palette.background,
    "--surface-color": palette.surface,
    "--surface-muted": palette.surfaceMuted,
    "--text-color": palette.text,
    "--muted-text-color": palette.muted,
    "--accent-color": palette.accent,
    "--accent-strong-color": palette.accentStrong,
    "--accent-soft-color": palette.accentSoft,
    "--accent-contrast-color": palette.accentContrast,
    "--border-color": palette.border,
    "--overlay-color": palette.overlay,
    "--card-shadow": palette.shadow,
    "--font-family": currentTheme.fontFamily,
  }
}

export const THEME_PREFERENCE_EVENT = THEME_EVENT

const themeService = {
  buildThemeVariables,
  clearStoredThemePreference,
  getAvailableThemes,
  getStoredThemePreference,
  getTheme,
  loadThemePreference,
  mergeGuestThemePreferenceIntoAccount,
  normalizeThemePreference,
  resolveMode,
  saveGuestThemePreference,
  saveThemePreference,
  subscribeToThemePreference,
}

export default themeService
