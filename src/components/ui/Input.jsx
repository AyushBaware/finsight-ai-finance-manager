import clsx from "clsx"

const Input = ({ label, error, className, ...props }) => {
  return (
    <div className="w-full space-y-1">
      {label ? <label className="theme-muted-text text-sm font-medium">{label}</label> : null}

      <input
        className={clsx(
          "theme-input w-full rounded-lg border px-3 py-2 text-sm transition focus:outline-none focus:ring-2",
          error && "border-red-500 focus:ring-red-400",
          className,
        )}
        {...props}
      />

      {error ? <p className="text-xs text-red-500">{error}</p> : null}
    </div>
  )
}

export default Input
