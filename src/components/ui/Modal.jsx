import clsx from "clsx"
import { X } from "lucide-react"

const Modal = ({ isOpen, onClose, title, children, className }) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="theme-overlay absolute inset-0 backdrop-blur-sm" onClick={onClose} />

      <div
        className={clsx(
          "theme-modal relative mx-4 w-full max-w-md rounded-xl shadow-lg",
          className,
        )}
      >
        <div className="theme-border flex items-center justify-between border-b px-5 py-4">
          <h2 className="theme-text text-base font-semibold">{title}</h2>
          <button
            onClick={onClose}
            className="theme-muted-text rounded-md p-1 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-5 py-4">{children}</div>
      </div>
    </div>
  )
}

export default Modal
