// Toast store utilities - exported separately to comply with react-refresh/only-export-components
import { useEffect } from 'react'

const toastStack = []
const listeners = new Set()

const notifyListeners = () => {
  listeners.forEach(listener => listener([...toastStack]))
}

export const showToast = (message, type = 'info', duration = 3000) => {
  const id = Date.now()
  const toast = { id, message, type, duration }
  
  toastStack.push(toast)
  notifyListeners()

  if (duration > 0) {
    setTimeout(() => {
      removeToast(id)
    }, duration)
  }

  return id
}

export const removeToast = (id) => {
  const index = toastStack.findIndex(t => t.id === id)
  if (index > -1) {
    toastStack.splice(index, 1)
    notifyListeners()
  }
}

export const useToastStore = (callback) => {
  useEffect(() => {
    listeners.add(callback)
    return () => listeners.delete(callback)
  }, [callback])
}
