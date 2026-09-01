import { useEffect, useState } from "react"
import Button from "./Button"

const BottomSheet = ({ isOpen, onClose, title, children, confirmDirty }) => {
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false)

  useEffect(() => {
    if (!isOpen) return
    document.body.style.overflow = "hidden"
    return () => { document.body.style.overflow = "" }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) setShowDiscardConfirm(false)
  }, [isOpen])

  if (!isOpen) return null

  const handleBackdropClick = () => {
    if (confirmDirty) {
      setShowDiscardConfirm(true)
      return
    }
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

        {showDiscardConfirm ? (
          <div className="absolute inset-0 flex items-center justify-center rounded-t-3xl md:rounded-3xl theme-overlay">
            <div className="theme-card mx-6 w-full max-w-xs rounded-2xl border p-4 shadow-[var(--shadow-lg)]">
              <p className="text-body-strong theme-text">Discard this entry?</p>
              <p className="text-caption theme-muted-text mt-1">Your changes won't be saved.</p>
              <div className="mt-4 flex gap-2">
                <Button variant="secondary" size="sm" className="flex-1" onClick={() => setShowDiscardConfirm(false)}>
                  Keep editing
                </Button>
                <Button variant="danger" size="sm" className="flex-1" onClick={() => { setShowDiscardConfirm(false); onClose() }}>
                  Discard
                </Button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}

export default BottomSheet