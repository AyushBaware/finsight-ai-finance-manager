import { useEffect, useRef, useState } from "react"
import {
  DollarSign,
  Download,
  Lightbulb,
  Palette,
  SunMoon,
  Upload,
  User,
} from "lucide-react"

import Card from "../components/ui/Card"
import Button from "../components/ui/Button"
import Input from "../components/ui/Input"
import { useTheme } from "../context/ThemeContext"
import { EXPENSES_CHANGED_EVENT, getGuestExpenses } from "../services/dataService"
import settingsService from "../services/settingsService"
import { normalizeThemePreference } from "../services/themeService"

const MODE_OPTIONS = [
  { value: "system", label: "System" },
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
]

const Settings = () => {
  const initialSettings = settingsService.getSettings()
  const fileInputRef = useRef(null)
  const {
    activeMode,
    currentTheme,
    setThemePreference,
    systemMode,
    themePreference,
    themes,
    user,
  } = useTheme()

  const [monthlyIncome, setMonthlyIncome] = useState(initialSettings.monthlyIncome)
  const [riskTolerance, setRiskTolerance] = useState(initialSettings.riskTolerance)
  const [guestExpenseCount, setGuestExpenseCount] = useState(() => getGuestExpenses().length)
  const [notice, setNotice] = useState("")

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

  const showNotice = (message) => {
    setNotice(message)
  }

  const handleSaveIncome = () => {
    if (monthlyIncome && monthlyIncome > 0) {
      settingsService.updateSettings({ monthlyIncome })
      showNotice("Income saved.")
    }
  }

  const handleSaveRiskTolerance = () => {
    settingsService.updateSettings({ riskTolerance })
    showNotice("Risk profile saved.")
  }

  const handleThemeSelect = async (themeId) => {
    await setThemePreference({ themeId })
    showNotice(user ? "Theme synced to your account." : "Theme saved for guest mode.")
  }

  const handleModeSelect = async (modePreference) => {
    await setThemePreference({ modePreference })
    showNotice(
      user ? "Appearance mode synced to your account." : "Appearance mode saved.",
    )
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

  const buildGuestExpenseCsv = (expenses) => {
    const headers = [
      "id",
      "date",
      "category",
      "amount",
      "note",
      "merchant",
      "createdAt",
      "updatedAt",
      "timestamp",
    ]
    const escapeValue = (value) => `"${String(value ?? "").replace(/"/g, "\"\"")}"`

    return [
      headers.join(","),
      ...expenses.map((expense) =>
        headers.map((header) => escapeValue(expense[header])).join(","),
      ),
    ].join("\n")
  }

  const handleExport = (format) => {
    const guestExpenses = getGuestExpenses()
    const exportPayload = {
      exportedAt: new Date().toISOString(),
      themePreference,
      expenses: guestExpenses,
    }

    const dateStamp = new Date().toISOString().slice(0, 10)

    if (format === "json") {
      downloadFile(
        `finsight-backup-${dateStamp}.json`,
        JSON.stringify(exportPayload, null, 2),
        "application/json",
      )
      return
    }

    downloadFile(
      `finsight-guest-expenses-${dateStamp}.csv`,
      buildGuestExpenseCsv(guestExpenses),
      "text/csv;charset=utf-8",
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
      showNotice("Theme settings imported.")
    } catch (error) {
      console.error("Failed to import theme settings", error)
      showNotice("Could not import theme settings.")
    } finally {
      event.target.value = ""
    }
  }

  return (
    <div className="space-y-6">
      <div className="theme-hero rounded-2xl p-6 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-white/20 p-2">
            <User size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Settings & Profile</h1>
            <p className="mt-1 text-sm opacity-90">Configure your financial profile</p>
          </div>
        </div>
      </div>

      {notice ? (
        <div className="rounded-lg border px-4 py-3 text-sm" style={{
          backgroundColor: "var(--accent-soft-color)",
          borderColor: "var(--border-color)",
          color: "var(--text-color)",
        }}>
          {notice}
        </div>
      ) : null}

      <Card padding="lg">
        <div className="flex items-start gap-4">
          <div
            className="shrink-0 rounded-full p-3"
            style={{ backgroundColor: "var(--accent-soft-color)" }}
          >
            <Palette size={24} className="theme-accent-text" />
          </div>
          <div className="flex-1">
            <h2 className="theme-text mb-2 text-xl font-semibold">Theme & Font</h2>
            <p className="theme-muted-text mb-4 text-sm">
              Pick a curated look. When you are logged in, theme changes sync instantly
              across your other signed-in browsers and devices.
            </p>

            <div className="mb-5">
              <div className="mb-3 flex items-center gap-2">
                <SunMoon size={16} className="theme-accent-text" />
                <h3 className="theme-text text-sm font-semibold">Color Mode</h3>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                {MODE_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className="theme-mode-button rounded-xl border px-4 py-3 text-sm font-semibold transition-all"
                    data-active={String(themePreference.modePreference === option.value)}
                    onClick={() => handleModeSelect(option.value)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              <p className="theme-muted-text mt-3 text-xs">
                Active palette: <strong>{activeMode}</strong>. System preference is{" "}
                <strong>{systemMode}</strong>.
              </p>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
              {themes.map((themeOption) => {
                const previewPalette = themeOption.colors[activeMode]

                return (
                  <button
                    key={themeOption.id}
                    type="button"
                    className="theme-preview-card theme-preview-card rounded-2xl p-4 text-left transition-transform hover:-translate-y-1"
                    data-selected={String(themePreference.themeId === themeOption.id)}
                    onClick={() => handleThemeSelect(themeOption.id)}
                  >
                    <div className="mb-4 flex items-start justify-between gap-3">
                      <div>
                        <h3
                          className="text-lg font-semibold"
                          style={{
                            color: previewPalette.text,
                            fontFamily: themeOption.fontFamily,
                          }}
                        >
                          {themeOption.label}
                        </h3>
                        <p
                          className="mt-1 text-sm"
                          style={{ color: previewPalette.muted }}
                        >
                          {themeOption.description}
                        </p>
                      </div>
                      <span className="theme-theme-badge rounded-full px-3 py-1 text-xs font-semibold">
                        {themePreference.themeId === themeOption.id ? "Selected" : "Preview"}
                      </span>
                    </div>

                    <div
                      className="rounded-2xl border p-4"
                      style={{
                        backgroundColor: previewPalette.background,
                        borderColor: previewPalette.border,
                        color: previewPalette.text,
                        fontFamily: themeOption.fontFamily,
                      }}
                    >
                      <div className="flex gap-2">
                        <span
                          className="theme-preview-swatch h-3 flex-1 rounded-full"
                          style={{ backgroundColor: previewPalette.background }}
                        />
                        <span
                          className="theme-preview-swatch h-3 flex-1 rounded-full"
                          style={{ backgroundColor: previewPalette.surface }}
                        />
                        <span
                          className="theme-preview-swatch h-3 flex-1 rounded-full"
                          style={{ backgroundColor: previewPalette.accent }}
                        />
                      </div>

                      <div
                        className="mt-4 rounded-xl px-3 py-2 text-sm font-semibold"
                        style={{
                          background:
                            `linear-gradient(135deg, ${previewPalette.accent}, ${previewPalette.accentStrong})`,
                          color: previewPalette.accentContrast,
                        }}
                      >
                        FinSight preview
                      </div>

                      <p className="mt-3 text-sm">
                        Reports, widgets, and modals inherit this font and palette.
                      </p>
                    </div>
                  </button>
                )
              })}
            </div>

            <div
              className="mt-5 rounded-2xl border p-4"
              style={{
                backgroundColor: "var(--surface-muted)",
                borderColor: "var(--border-color)",
              }}
            >
              <p className="theme-muted-text text-xs font-semibold uppercase tracking-[0.2em]">
                Active Theme
              </p>
              <p
                className="theme-text mt-2 text-2xl font-semibold"
                style={{ fontFamily: currentTheme.fontFamily }}
              >
                {currentTheme.label}
              </p>
              <p className="theme-muted-text mt-2 text-sm">
                {user
                  ? "Live account sync is enabled for this preference."
                  : "Guest theme is stored locally on this device."}
              </p>
            </div>
          </div>
        </div>
      </Card>

      <Card
        padding="lg"
        className="border-2 border-green-200 bg-linear-to-br from-green-50 to-emerald-50 dark:border-green-800 dark:from-green-900/20 dark:to-emerald-900/20"
      >
        <div className="flex items-start gap-4">
          <div className="shrink-0 rounded-full bg-green-100 p-3 dark:bg-green-900/30">
            <DollarSign size={24} className="text-green-600 dark:text-green-400" />
          </div>
          <div className="flex-1">
            <h2 className="mb-4 text-xl font-semibold">Monthly Income</h2>
            <p className="mb-4 text-sm">
              Set your monthly income. This helps FinSight calculate your leftover
              money and investment recommendations.
            </p>
            <div className="space-y-4">
              <div>
                <label className="theme-muted-text mb-2 block text-sm font-medium">
                  Total Monthly Income (Rs)
                </label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    value={monthlyIncome}
                    onChange={(event) =>
                      setMonthlyIncome(parseInt(event.target.value, 10) || 0)
                    }
                    placeholder="45000"
                    className="flex-1"
                  />
                  <Button onClick={handleSaveIncome} className="px-6">
                    Save
                  </Button>
                </div>
                <p className="theme-muted-text mt-2 text-xs">
                  Your current monthly income: Rs {monthlyIncome.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Card
        padding="lg"
        className="border-2 border-blue-200 bg-linear-to-br from-blue-50 to-indigo-50 dark:border-blue-800 dark:from-blue-900/20 dark:to-indigo-900/20"
      >
        <div className="flex items-start gap-4">
          <div className="shrink-0 rounded-full bg-blue-100 p-3 dark:bg-blue-900/30">
            <Lightbulb size={24} className="text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex-1">
            <h2 className="mb-4 text-xl font-semibold">Investment Risk Profile</h2>
            <p className="mb-4 text-sm">
              Choose your investment risk tolerance. This determines which investment
              recommendations you receive.
            </p>
            <div className="space-y-3">
              {[
                {
                  value: "low",
                  label: "Conservative (Low Risk)",
                  description: "Safety first - Fixed deposits, bonds, savings accounts",
                },
                {
                  value: "medium",
                  label: "Balanced (Medium Risk)",
                  description: "Mix of stability and growth - Mutual funds, index funds, FDs",
                },
                {
                  value: "high",
                  label: "Aggressive (High Risk)",
                  description: "Growth focused - Stocks, growth funds, crypto",
                },
              ].map((option) => (
                <label
                  key={option.value}
                  className="flex cursor-pointer items-center rounded-lg border-2 p-3 transition-all"
                  style={{
                    borderColor:
                      riskTolerance === option.value
                        ? "var(--accent-color)"
                        : "var(--border-color)",
                    backgroundColor:
                      riskTolerance === option.value
                        ? "var(--accent-soft-color)"
                        : "transparent",
                  }}
                >
                  <input
                    type="radio"
                    name="risk"
                    value={option.value}
                    checked={riskTolerance === option.value}
                    onChange={(event) => setRiskTolerance(event.target.value)}
                    className="h-4 w-4"
                  />
                  <div className="ml-3 flex-1">
                    <p className="font-medium">{option.label}</p>
                    <p className="theme-muted-text text-xs">{option.description}</p>
                  </div>
                </label>
              ))}
              <Button onClick={handleSaveRiskTolerance} className="mt-4 w-full">
                Save Risk Profile
              </Button>
            </div>
          </div>
        </div>
      </Card>

      <Card
        padding="lg"
        className="bg-linear-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20"
      >
        <div className="flex items-start gap-4">
          <div className="shrink-0 rounded-full bg-amber-100 p-3 dark:bg-amber-900/30">
            <Download size={24} className="text-amber-600 dark:text-amber-400" />
          </div>
          <div className="flex-1">
            <h2 className="mb-2 text-xl font-semibold">Guest Data & Theme Backup</h2>
            <p className="theme-muted-text mb-4 text-sm">
              Export guest-mode expenses and your current theme choice in one backup.
            </p>
            <p className="mb-4 text-sm">Guest expenses available: {guestExpenseCount}</p>
            <div className="flex flex-wrap gap-3">
              <Button variant="secondary" onClick={() => handleExport("json")}>
                Export JSON
              </Button>
              <Button
                variant="secondary"
                onClick={() => handleExport("csv")}
                disabled={guestExpenseCount === 0}
              >
                Export CSV
              </Button>
              <Button
                variant="secondary"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2"
              >
                <Upload size={16} />
                Import Theme JSON
              </Button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json"
              className="hidden"
              onChange={handleImportTheme}
            />
          </div>
        </div>
      </Card>

      <Card
        padding="lg"
        className="bg-linear-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20"
      >
        <h3 className="mb-3 text-xl font-semibold">How Income is Used</h3>
        <div className="grid gap-3">
          {[
            {
              title: "Monthly Income",
              copy: "Your total earnings per month",
            },
            {
              title: "Expenses Tracking",
              copy: "Calculates what percentage of income you spend",
            },
            {
              title: "AI Recommendations",
              copy: "Suggests how to invest your leftover money",
            },
            {
              title: "Savings Goal",
              copy: "Helps track if you are meeting goals",
            },
          ].map((item) => (
            <div key={item.title} className="flex items-center gap-3 p-2">
              <div>
                <p className="text-sm font-medium">{item.title}</p>
                <p className="theme-muted-text text-xs">{item.copy}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card padding="lg">
        <h3 className="mb-3 text-xl font-semibold">Example Calculation</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Monthly Income:</span>
            <span className="font-semibold">Rs {monthlyIncome.toLocaleString()}</span>
          </div>
          <div className="theme-border my-2 border-t" />
          <div className="theme-muted-text flex justify-between">
            <span>Total Expenses (example):</span>
            <span>Rs 15,000</span>
          </div>
          <div className="flex justify-between font-semibold text-green-600 dark:text-green-400">
            <span>Leftover Money:</span>
            <span>Rs {(monthlyIncome - 15000).toLocaleString()}</span>
          </div>
          <div className="theme-border my-2 border-t" />
          <p className="theme-muted-text mt-3 text-xs">
            Your leftover money will be allocated based on your <strong>{riskTolerance}</strong>{" "}
            risk profile.
          </p>
        </div>
      </Card>
    </div>
  )
}

export default Settings
