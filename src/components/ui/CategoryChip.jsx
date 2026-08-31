import clsx from "clsx"

const CategoryChip = ({ label, selected, onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        "h-8 rounded-full px-3 text-sm font-medium transition-all",
        selected ? "theme-button-primary" : "theme-muted-text",
      )}
      style={!selected ? { background: "var(--surface-muted)" } : undefined}
    >
      {label}
    </button>
  )
}

export default CategoryChip