import clsx from "clsx"

const Card = ({ children, className, padding = "md" }) => {
  const paddingClass = {
    sm: "p-3",
    md: "p-4",
    lg: "p-6",
    xl: "p-8",
  }[padding] || "p-4"

  return (
    <div
      className={clsx(
        "theme-card overflow-hidden rounded-xl border",
        paddingClass,
        className,
      )}
    >
      {children}
    </div>
  )
}

export default Card
