import { useState } from 'react'
import { X, AlertCircle, CheckCircle, Info } from 'lucide-react'
import { removeToast, useToastStore } from '../../utils/toastStore'

// Toast container component
export function ToastContainer() {
  const [toasts, setToasts] = useState([])

  useToastStore((updatedToasts) => {
    setToasts(updatedToasts)
  })

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-sm">
      {toasts.map(toast => (
        <Toast key={toast.id} toast={toast} />
      ))}
    </div>
  )
}

// Individual toast component
function Toast({ toast }) {
  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle size={20} className="text-green-600" />
      case 'error':
        return <AlertCircle size={20} className="text-red-600" />
      case 'warning':
        return <AlertCircle size={20} className="text-yellow-600" />
      default:
        return <Info size={20} className="text-blue-600" />
    }
  }

  const getStyles = () => {
    switch (toast.type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-900 dark:bg-green-900/30 dark:border-green-800'
      case 'error':
        return 'bg-red-50 border-red-200 text-red-900 dark:bg-red-900/30 dark:border-red-800'
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-900 dark:bg-yellow-900/30 dark:border-yellow-800'
      default:
        return 'bg-blue-50 border-blue-200 text-blue-900 dark:bg-blue-900/30 dark:border-blue-800'
    }
  }

  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg ${getStyles()} animate-in fade-in slide-in-from-right-4 duration-300`}>
      {getIcon()}
      <p className="flex-1 text-sm font-medium">{toast.message}</p>
      <button
        onClick={() => removeToast(toast.id)}
        className="text-current opacity-70 hover:opacity-100 transition-opacity"
      >
        <X size={16} />
      </button>
    </div>
  )
}

export default ToastContainer
