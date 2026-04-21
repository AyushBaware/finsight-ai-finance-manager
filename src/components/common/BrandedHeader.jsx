import { ShieldCheck } from "lucide-react"

const BrandedHeader = () => {
  return (
    <div className="flex items-center gap-3">
      <div className="relative">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-full shadow-lg"
          style={{
            background: "linear-gradient(135deg, var(--accent-color), var(--accent-strong-color))",
            color: "var(--accent-contrast-color)",
          }}
        >
          <ShieldCheck size={24} strokeWidth={1.5} />
        </div>
        <div
          className="absolute -right-1 -top-1 h-3 w-3 animate-pulse rounded-full"
          style={{ backgroundColor: "var(--accent-soft-color)" }}
        />
      </div>

      <div className="flex flex-col">
        <span
          className="text-xl font-black leading-none text-transparent"
          style={{
            backgroundImage:
              "linear-gradient(135deg, var(--accent-color), var(--accent-strong-color))",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
          }}
        >
          FinSight
        </span>
        <span className="theme-muted-text text-xs font-medium">
          Smart Financial Insights
        </span>
      </div>
    </div>
  )
}

export default BrandedHeader
