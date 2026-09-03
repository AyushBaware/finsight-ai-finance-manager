import { useEffect, useRef, useState } from "react"
import { Link } from "react-router-dom"
import {
  DollarSign,
  Download,
  Monitor,
  Moon,
  Palette,
  Sun,
  Upload,
  User,
  Wallet,
} from "lucide-react"

import Card from "../components/ui/Card"
import Button from "../components/ui/Button"
import Input from "../components/ui/Input"
import { auth } from "../firebase"
import { useTheme } from "../context/ThemeContext"
import { EXPENSES_CHANGED_EVENT, getGuestExpenses } from "../services/dataService"
import settingsService from "../services/settingsService"
import accountsService from "../services/accountsService"
import { normalizeThemePreference } from "../services/themeService"

const MODE_OPTIONS = [
  { value: "system", label: "System", icon: Monitor },
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
]

const Settings = () => {
  const initialSettings = settingsService.getSettings()
  const fileInputRef = useRef(null)
  const { activeMode, setThemePreference, themePreference, themes, user } = useTheme()
  const isSignedIn = Boolean(user) && !user.isAnonymous

  const [monthlyIncome, setMonthlyIncome] = useState(initialSettings.monthlyIncome)
  const [guestExpenseCount, setGuestExpenseCount] = useState(() => getGuestExpenses().length)
  const [notice, setNotice] = useState("")
  const accountsCount = accountsService.getAccounts().length

  useEffect(() => {
    if (!notice) return undefined
    const timeoutId = window.setTimeout(() => setNotice(""), 3000)
    return () => window.clearTimeout(timeoutId)
  }, [notice])

  useEffect(() => {
    const refreshGuestExpenseCount = () => {
      setGuestExpenseCount(getGuestExpenses().length)
    }
    window.addEventListener(EXPENSES_CHANGED_EVENT, refreshGuestExpenseCount)
    window.addEventListener("storage", refreshGuestExpenseCount)
    return () => {
      window.removeEventListener(EXPENSES_CHANGED_EVENT, refreshGuestExpenseCount)
      window.removeEventListener("storage", refreshGuestExpenseCount)
    }
  }, [])

  const showNotice = (message) => setNotice(message)

  const handleSaveIncome = () => {
    if (monthlyIncome && monthlyIncome > 0) {
      settingsService.updateSettings({ monthlyIncome })
      showNotice("Income saved.")
    }
  }

  const handleThemeSelect = async (themeId) => {
    await setThemePreference({ themeId })
    showNotice(user ? "Theme synced to your account." : "Theme saved for guest mode.")
  }

  const handleModeSelect = async (modePreference) => {
    await setThemePreference({ modePreference })
    showNotice(user ? "Appearance synced to your account." : "Appearance saved.")
  }

  const downloadFile = (filename, content, mimeType) => {
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement("a")
    anchor.href = url
    anchor.download = filename
    anchor.click()
    URL.revokeObjectURL(url)
  }

  const handleExportBackup = () => {
    const guestExpenses = getGuestExpenses()
    const exportPayload = {
      exportedAt: new Date().toISOString(),
      themePreference,
      expenses: guestExpenses,
    }
    const dateStamp = new Date().toISOString().slice(0, 10)
    downloadFile(
      `finsight-backup-${dateStamp}.json`,
      JSON.stringify(exportPayload, null, 2),
      "application/json",
    )
  }

  const handleImportTheme = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const content = await file.text()
      const parsed = JSON.parse(content)

      if (!parsed?.themePreference) {
        throw new Error("No theme preference found in this backup.")
      }

      await setThemePreference(normalizeThemePreference(parsed.themePreference))
      showNotice("Theme restored from backup.")
    } catch (error) {
      console.error("Failed to import theme settings", error)
      showNotice("Could not restore theme from this file.")
    } finally {
      event.target.value = ""
    }
  }

  return (
    <div className="space-y-4">
      <div className="theme-hero rounded-2xl p-5 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-white/20 p-2">
            <User size={22} />
          </div>
          <div>
            <h1 className="text-xl font-bold">Settings</h1>
            <p className="mt-0.5 text-xs opacity-90">Your profile, wallets, and app preferences</p>
          </div>
        </div>
      </div>

      {notice ? (
        <div
          className="rounded-lg border px-4 py-2.5 text-sm"
          style={{
            backgroundColor: "var(--accent-soft-color)",
            borderColor: "var(--border-color)",
            color: "var(--text-color)",
          }}
        >
          {notice}
        </div>
      ) : null}

      {/* 1. Profile / Sign-in */}
      <Card padding="lg">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            {isSignedIn && user.photoURL ? (
              <img
                src={user.photoURL}
                alt=""
                className="h-11 w-11 shrink-0 rounded-full object-cover"
                style={{ border: "2px solid var(--accent-color)" }}
              />
            ) : (
              <div
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold"
                style={{
                  background: "linear-gradient(135deg, var(--accent-color), var(--accent-strong-color))",
                  color: "var(--accent-contrast-color)",
                }}
              >
                {isSignedIn ? (user.displayName || user.email || "U")[0].toUpperCase() : <User size={18} />}
              </div>
            )}
            <div className="min-w-0">
              <p className="theme-text truncate text-sm font-semibold">
                {isSignedIn ? user.displayName || user.email : "Guest"}
              </p>
              <span
                className="mt-0.5 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium"
                style={
                  isSignedIn
                    ? { background: "var(--positive-soft-color)", color: "var(--positive-color)" }
                    : { background: "var(--surface-muted)", color: "var(--muted-text-color)" }
                }
              >
                {isSignedIn ? "Synced across devices" : "Guest — data on this device"}
              </span>
            </div>
          </div>

          {isSignedIn ? (
            <Button variant="secondary" size="sm" onClick={() => auth.signOut()}>
              Log out
            </Button>
          ) : (
            <Link to="/login">
              <Button size="sm">Sign in</Button>
            </Link>
          )}
        </div>
      </Card>

      {/* 2. Monthly Income — moved up, compact */}
      <Card padding="lg">
        <div className="mb-3 flex items-center gap-3">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
            style={{ backgroundColor: "var(--accent-soft-color)" }}
          >
            <DollarSign size={18} className="theme-accent-text" />
          </div>
          <div>
            <p className="theme-text text-sm font-semibold">Monthly Income</p>
            <p className="theme-muted-text text-xs">Used to calculate your leftover money each month</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Input
            type="number"
            value={monthlyIncome}
            onChange={(event) => setMonthlyIncome(parseInt(event.target.value, 10) || 0)}
            placeholder="45000"
            className="flex-1"
          />
          <Button onClick={handleSaveIncome} className="px-5">
            Save
          </Button>
        </div>
      </Card>

      {/* 3. Wallets & Accounts */}
      <Link to="/accounts">
        <Card padding="lg" className="transition-shadow hover:shadow-md">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full"
                style={{ backgroundColor: "var(--accent-soft-color)" }}
              >
                <Wallet size={20} className="theme-accent-text" />
              </div>
              <div>
                <p className="theme-text text-sm font-semibold">Wallets & Accounts</p>
                <p className="theme-muted-text text-xs">
                  {accountsCount} wallet{accountsCount === 1 ? "" : "s"} · Cash, Bank, Card & more
                </p>
              </div>
            </div>
            <Button size="sm">Manage</Button>
          </div>
        </Card>
      </Link>

      {/* 4. Appearance — mode + theme merged, compact */}
      <Card padding="lg">
        <div className="mb-4 flex items-center gap-2">
          <Palette size={18} className="theme-accent-text" />
          <h2 className="theme-text text-sm font-semibold">Appearance</h2>
        </div>

        <div className="mb-4 flex gap-2">
          {MODE_OPTIONS.map((option) => {
            const OptionIcon = option.icon
            const isActive = themePreference.modePreference === option.value
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => handleModeSelect(option.value)}
                className="flex flex-1 flex-col items-center gap-1 rounded-xl border py-2.5 text-xs font-medium transition-all"
                style={
                  isActive
                    ? { borderColor: "var(--accent-color)", background: "var(--accent-soft-color)", color: "var(--accent-color)" }
                    : { borderColor: "var(--border-color)", color: "var(--muted-text-color)" }
                }
              >
                <OptionIcon size={16} />
                {option.label}
              </button>
            )
          })}
        </div>

        <div className="grid grid-cols-3 gap-2">
          {themes.map((themeOption) => {
            const previewPalette = themeOption.colors[activeMode]
            const isSelected = themePreference.themeId === themeOption.id

            return (
              <button
                key={themeOption.id}
                type="button"
                onClick={() => handleThemeSelect(themeOption.id)}
                className="flex flex-col items-center gap-1.5 rounded-xl border p-2.5 transition-all"
                style={
                  isSelected
                    ? { borderColor: previewPalette.accent, background: "var(--surface-muted)" }
                    : { borderColor: "var(--border-color)" }
                }
              >
                <div className="flex -space-x-1.5">
                  <span
                    className="h-5 w-5 rounded-full"
                    style={{ background: previewPalette.background, border: `2px solid ${previewPalette.surface}` }}
                  />
                  <span
                    className="h-5 w-5 rounded-full"
                    style={{ background: previewPalette.accent, border: `2px solid ${previewPalette.surface}` }}
                  />
                  <span
                    className="h-5 w-5 rounded-full"
                    style={{ background: previewPalette.accentStrong, border: `2px solid ${previewPalette.surface}` }}
                  />
                </div>
                <span className="theme-text text-xs font-medium">{themeOption.label}</span>
              </button>
            )
          })}
        </div>
      </Card>

      {/* 5. Backup — trimmed, honestly labeled */}
      <Card padding="lg">
        <div className="mb-3 flex items-center gap-3">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
            style={{ backgroundColor: "var(--surface-muted)" }}
          >
            <Download size={18} className="theme-muted-text" />
          </div>
          <div>
            <p className="theme-text text-sm font-semibold">Backup</p>
            <p className="theme-muted-text text-xs">
              {guestExpenseCount} guest expense{guestExpenseCount === 1 ? "" : "s"} on this device
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" className="flex-1" onClick={handleExportBackup}>
            Export Backup
          </Button>
          <Button
            variant="secondary"
            size="sm"
            className="flex flex-1 items-center justify-center gap-1.5"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload size={14} />
            Restore Theme
          </Button>
        </div>
        <p className="theme-muted-text mt-2 text-caption">
          Export saves your guest expenses and theme together. Restore currently brings back the theme only.
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json"
          className="hidden"
          onChange={handleImportTheme}
        />
      </Card>
    </div>
  )
}

export default Settings