import { useState } from "react"
import { Plus, Trash2 } from "lucide-react"

import Card from "../components/ui/Card"
import Button from "../components/ui/Button"
import Input from "../components/ui/Input"
import Modal from "../components/ui/Modal"
import { useExpenses } from "../context/ExpensesContext"

const initialCategories = [
  { id: 1, name: "Food & Dining", emoji: "Meal" },
  { id: 2, name: "Transport", emoji: "Ride" },
  { id: 3, name: "Shopping", emoji: "Shop" },
  { id: 4, name: "Utilities", emoji: "Bill" },
  { id: 5, name: "Entertainment", emoji: "Fun" },
  { id: 6, name: "Healthcare", emoji: "Care" },
  { id: 7, name: "Subscription", emoji: "Plan" },
  { id: 8, name: "Other", emoji: "Misc" },
]

const Categories = () => {
  const { expenses } = useExpenses()
  const [categories, setCategories] = useState(initialCategories)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newCategory, setNewCategory] = useState({ name: "", emoji: "Misc" })

  const getCategorySpending = (categoryName) => {
    return expenses
      .filter((expense) => expense.category === categoryName)
      .reduce((sum, expense) => sum + Number(expense.amount || 0), 0)
  }

  const handleAddCategory = () => {
    if (!newCategory.name.trim()) return

    const nextId =
      categories.length > 0 ? Math.max(...categories.map((category) => category.id)) + 1 : 1
    setCategories((previous) => [
      ...previous,
      {
        id: nextId,
        name: newCategory.name.trim(),
        emoji: newCategory.emoji.trim() || "Misc",
      },
    ])
    setNewCategory({ name: "", emoji: "Misc" })
    setIsModalOpen(false)
  }

  const handleDeleteCategory = (id) => {
    setCategories((previous) => previous.filter((category) => category.id !== id))
  }
  return (
    <div className="space-y-6">
      <div className="theme-hero rounded-2xl p-6 shadow-lg">
        <h1 className="text-3xl font-bold">Expense Categories</h1>
        <p className="mt-2 text-sm opacity-90">Track your spending across categories</p>
      </div>

      <section className="space-y-4">
        <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Your Categories
          </h2>
          <Button
            size="sm"
            className="flex w-full items-center gap-2 sm:w-auto"
            onClick={() => setIsModalOpen(true)}
          >
            <Plus size={16} />
            Add Category
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => {
            const spending = getCategorySpending(category.name)

            return (
              <Card
                key={category.id}
                padding="lg"
                className="transition-shadow hover:shadow-lg"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex flex-1 items-center gap-3">
                      <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold uppercase text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                        {category.emoji}
                      </span>
                      <div className="min-w-0">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                          {category.name}
                        </h3>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteCategory(category.id)}
                      className="shrink-0 text-gray-400 transition-colors hover:text-red-500 dark:hover:text-red-400"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Spent</span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        Rs {spending.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      </section>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Category">
        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Category Name
            </label>
            <Input
              placeholder="e.g., Education"
              value={newCategory.name}
              onChange={(event) =>
                setNewCategory((previous) => ({ ...previous, name: event.target.value }))
              }
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Label (optional)
            </label>
            <Input
              placeholder="e.g., Learn"
              value={newCategory.emoji}
              maxLength={8}
              onChange={(event) =>
                setNewCategory((previous) => ({ ...previous, emoji: event.target.value }))
              }
            />
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleAddCategory} className="flex-1">
              Add Category
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default Categories
