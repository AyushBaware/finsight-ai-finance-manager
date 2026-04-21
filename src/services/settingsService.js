// Settings persistence using localStorage
const SETTINGS_KEY = 'finsight_settings_v1'

const defaultSettings = {
  monthlyIncome: 45000,
  currency: 'INR',
  riskTolerance: 'medium',
  theme: 'light',
}

function getSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    if (!raw) return defaultSettings
    return { ...defaultSettings, ...JSON.parse(raw) }
  } catch (e) {
    console.error('Failed to read settings', e)
    return defaultSettings
  }
}

function updateSettings(updates) {
  try {
    const current = getSettings()
    const updated = { ...current, ...updates }
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated))
    // Emit event so all pages can listen and update
    window.dispatchEvent(new CustomEvent('settingsUpdated', { detail: { settings: updated } }))
    return updated
  } catch (e) {
    console.error('Failed to save settings', e)
    return getSettings()
  }
}

function getMonthlyIncome() {
  return getSettings().monthlyIncome
}

function setMonthlyIncome(income) {
  return updateSettings({ monthlyIncome: income })
}

export default {
  getSettings,
  updateSettings,
  getMonthlyIncome,
  setMonthlyIncome,
}
