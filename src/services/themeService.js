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
      background: "#F6F8FC",
      surface: "#FFFFFF",
      surfaceMuted: "#EEF2F9",
      text: "#0F1524",
      muted: "#6B7A99",
      accent: "#1E4FD8",
      accentStrong: "#1638A8",
      accentSoft: "#E3EAFC",
      accentContrast: "#FFFFFF",
      border: "#DFE6F1",
      overlay: "rgba(9, 14, 26, 0.6)",
      shadow: "0 20px 48px rgba(30, 79, 216, 0.12)",
      positive: "#0F8A5F",
      positiveSoft: "#E1F5EC",
      negative: "#C0432A",
      negativeSoft: "#FBEAE5",
      warning: "#B5760A",
      warningSoft: "#FBF0DD",
    },
    dark: {
      background: "#0B1220",
      surface: "#111A2E",
      surfaceMuted: "#182238",
      text: "#EEF2FB",
      muted: "#93A2C2",
      accent: "#5B84F5",
      accentStrong: "#3B62E0",
      accentSoft: "#1B2A4D",
      accentContrast: "#06101f",
      border: "#28334E",
      overlay: "rgba(2, 5, 12, 0.72)",
      shadow: "0 20px 48px rgba(15, 23, 42, 0.4)",
      positive: "#2FBE8A",
      positiveSoft: "#123527",
      negative: "#E06B4E",
      negativeSoft: "#3A1E16",
      warning: "#E0A93F",
      warningSoft: "#3A2C10",
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
        background: "#F5EEDC",
        surface: "#FFFCF5",
        surfaceMuted: "#EFE4CB",
        text: "#241C12",
        muted: "#7A6C54",
        accent: "#6B4226",
        accentStrong: "#4E2F1A",
        accentSoft: "#EBD9BE",
        accentContrast: "#FFFBF2",
        border: "#E0D0AC",
        overlay: "rgba(36, 28, 18, 0.55)",
        shadow: "0 24px 60px rgba(107, 66, 38, 0.14)",
        positive: "#3F6B4A",
        positiveSoft: "#E4EEE1",
        negative: "#8B3A2B",
        negativeSoft: "#F3E2DC",
        warning: "#93641D",
        warningSoft: "#F1E4C8",
      },
      dark: {
        background: "#17120B",
        surface: "#201911",
        surfaceMuted: "#2B2116",
        text: "#F3E9D6",
        muted: "#B8A98C",
        accent: "#C08A54",
        accentStrong: "#A06F3D",
        accentSoft: "#3A2A18",
        accentContrast: "#201509",
        border: "#4A3A26",
        overlay: "rgba(10, 7, 4, 0.72)",
        shadow: "0 24px 60px rgba(8, 6, 4, 0.44)",
        positive: "#6FA97C",
        positiveSoft: "#1E3324",
        negative: "#C97A63",
        negativeSoft: "#3B241D",
        warning: "#D1A34C",
        warningSoft: "#3A2C12",
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
        background: "#EDF3EF",
        surface: "#FFFFFF",
        surfaceMuted: "#DCEAE3",
        text: "#0D1B18",
        muted: "#52706A",
        accent: "#146B5C",
        accentStrong: "#0F5148",
        accentSoft: "#CFEFE6",
        accentContrast: "#F2FFFB",
        border: "#C3DED5",
        overlay: "rgba(4, 18, 16, 0.56)",
        shadow: "0 24px 60px rgba(20, 107, 92, 0.14)",
        positive: "#2E8B57",
        positiveSoft: "#DFF3E6",
        negative: "#B14A2E",
        negativeSoft: "#F5E2DA",
        warning: "#A67A12",
        warningSoft: "#F2E7CB",
      },
      dark: {
        background: "#061412",
        surface: "#0C201D",
        surfaceMuted: "#123028",
        text: "#E4FBF4",
        muted: "#85B0A6",
        accent: "#35C9A8",
        accentStrong: "#1EA789",
        accentSoft: "#123F37",
        accentContrast: "#04140F",
        border: "#1E4E45",
        overlay: "rgba(2, 10, 9, 0.74)",
        shadow: "0 24px 60px rgba(3, 15, 16, 0.44)",
        positive: "#4FCB86",
        positiveSoft: "#123623",
        negative: "#E08A5E",
        negativeSoft: "#3B2116",
        warning: "#E0B23F",
        warningSoft: "#3A2C10",
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
    // New semantic money/state tokens — separate from UI success/error.
    "--positive-color": palette.positive ?? "#0F8A5F",
    "--positive-soft-color": palette.positiveSoft ?? "#E1F5EC",
    "--negative-color": palette.negative ?? "#C0432A",
    "--negative-soft-color": palette.negativeSoft ?? "#FBEAE5",
    "--warning-color": palette.warning ?? "#B5760A",
    "--warning-soft-color": palette.warningSoft ?? "#FBF0DD",
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