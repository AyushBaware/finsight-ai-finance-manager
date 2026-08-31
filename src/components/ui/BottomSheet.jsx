import { useEffect } from "react"

const BottomSheet = ({ isOpen, onClose, title, children, confirmDirty }) => {
  useEffect(() => {
    if (!isOpen) return
    document.body.style.overflow = "hidden"
    return () => { document.body.style.overflow = "" }
  }, [isOpen])

  if (!isOpen) return null

  const handleBackdropClick = () => {
    if (confirmDirty && !window.confirm("Discard this entry?")) return
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center">
      <div className="theme-overlay absolute inset-0" onClick={handleBackdropClick} />

      <div
        className="theme-card relative w-full max-w-md rounded-t-3xl md:rounded-3xl shadow-[var(--shadow-lg)]"
        style={{ maxHeight: "90vh" }}
      >
        <div className="flex justify-center pt-3">
          <div className="h-1 w-9 rounded-full" style={{ background: "var(--border-color)" }} />
        </div>

        {title ? (
          <div className="px-5 pt-3">
            <h2 className="text-h2 theme-text">{title}</h2>
          </div>
        ) : null}

        <div className="overflow-y-auto px-5 py-4" style={{ maxHeight: "calc(90vh - 60px)" }}>
          {children}
        </div>
      </div>
    </div>
  )
}

export default BottomSheet