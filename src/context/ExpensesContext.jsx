import { createContext, useContext } from "react"

export const ExpensesContext = createContext(null)

export const useExpenses = () => {
  const context = useContext(ExpensesContext)

  if (!context) {
    throw new Error("useExpenses must be used within an ExpensesContext provider.")
  }

  return context
}
