import clsx from "clsx"

const Button = ({
  children,
  variant = "primary",
  size = "md",
  className,
  ...props
}) => {
  return (
    <button
      className={clsx(
        "rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2",
        variant === "primary" && "theme-button-primary",
        variant === "secondary" && "theme-button-secondary",
        variant === "danger" && "theme-button-danger",
        variant === "ghost" && "bg-transparent theme-accent-text hover:bg-[var(--accent-soft-color)]",
        size === "sm" && "px-3 py-1.5 text-sm",
        size === "md" && "px-4 py-2 text-sm",
        size === "lg" && "px-5 py-3 text-base",
        size === "icon" && "h-10 w-10 flex items-center justify-center rounded-full p-0",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}

export default Button