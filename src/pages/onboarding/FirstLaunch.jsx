import Button from "../../components/ui/Button"

export const FIRST_LAUNCH_KEY = "finsight_has_launched_v1"

const FirstLaunch = ({ onStart }) => {
  const handleStart = () => {
    try {
      localStorage.setItem(FIRST_LAUNCH_KEY, "true")
    } catch {
      // ignore storage errors — still proceed
    }
    onStart()
  }

  return (
    <div className="theme-shell flex min-h-screen flex-col items-center justify-between px-6 py-12">
      <div className="flex-1" />

      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <div
          className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl text-2xl font-black"
          style={{
            background: "linear-gradient(135deg, var(--accent-color), var(--accent-strong-color))",
            color: "var(--accent-contrast-color)",
          }}
        >
          F
        </div>
        <h1 className="text-h1 theme-text max-w-xs">Track money by talking, not typing</h1>
        <p className="text-body theme-muted-text mt-3 max-w-xs">
          FinSight logs expenses in seconds — no bank linking, no SMS access, just your voice.
        </p>
      </div>

      <div className="w-full max-w-sm space-y-3">
        <Button onClick={handleStart} className="w-full py-3 text-base">
          Start Tracking
        </Button>
        <p className="text-caption theme-muted-text text-center">
          Sign in later to back up across devices
        </p>
      </div>
    </div>
  )
}

export default FirstLaunch