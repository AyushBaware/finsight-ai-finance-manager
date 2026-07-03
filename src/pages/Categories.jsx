import { useState } from "react"
import { Plus, Trash2 } from "lucide-react"

import Card from "../components/ui/Card"
import Button from "../components/ui/Button"
import Input from "../components/ui/Input"
import Modal from "../components/ui/Modal"
import { useExpenses } from "../context/ExpensesContext"
import categoriesService from "../services/categoriesService"

const Categories = () => {
  const { expenses } = useExpenses()
  const [categories, setCategories] = useState(() => categoriesService.getCategories())
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newCategory, setNewCategory] = useState({ name: "", emoji: "Misc" })

  const [budgetModalCategory, setBudgetModalCategory] = useState(null)
  const [budgetInput, setBudgetInput] = useState("")

  const getCategorySpending = (categoryName) => {
    return expenses
      .filter((expense) => expense.category === categoryName)
      .reduce((sum, expense) => sum + Number(expense.amount || 0), 0)
  }

  const handleAddCategory = () => {
    if (!newCategory.name.trim()) return

    const nextId =
      categories.length > 0 ? Math.max(...categories.map((category) => category.id)) + 1 : 1
    const nextCategories = [
      ...categories,
      {
        id: nextId,
        name: newCategory.name.trim(),
        emoji: newCategory.emoji.trim() || "Misc",
        monthlyLimit: null,
      },
    ]
    setCategories(nextCategories)
    categoriesService.saveCategories(nextCategories) // ✅ persist
    setNewCategory({ name: "", emoji: "Misc" })
    setIsModalOpen(false)
  }

  const handleDeleteCategory = (id) => {
    const nextCategories = categories.filter((category) => category.id !== id)
    setCategories(nextCategories)
    categoriesService.saveCategories(nextCategories) // ✅ persist
  }

  const openBudgetModal = (category) => {
    setBudgetModalCategory(category)
    setBudgetInput(category.monthlyLimit ? String(category.monthlyLimit) : "")
  }

  const handleSaveBudget = () => {
    if (!budgetModalCategory) return

    const trimmed = budgetInput.trim()
    const limit = trimmed === "" ? null : Number.parseFloat(trimmed)

    if (limit !== null && (!Number.isFinite(limit) || limit <= 0)) return

    const nextCategories = categoriesService.updateCategoryLimit(budgetModalCategory.id, limit)
    setCategories(nextCategories)
    setBudgetModalCategory(null)
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

                  {category.monthlyLimit ? (
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500 dark:text-gray-400">Budget</span>
                        <span
                          className={`font-semibold ${
                            spending >= category.monthlyLimit
                              ? "text-red-600 dark:text-red-400"
                              : spending >= category.monthlyLimit * 0.8
                                ? "text-amber-600 dark:text-amber-400"
                                : "text-gray-700 dark:text-gray-300"
                          }`}
                        >
                          Rs {spending.toLocaleString()} / {category.monthlyLimit.toLocaleString()}
                        </span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                        <div
                          className={`h-full transition-all ${
                            spending >= category.monthlyLimit
                              ? "bg-red-500"
                              : spending >= category.monthlyLimit * 0.8
                                ? "bg-amber-500"
                                : "bg-green-500"
                          }`}
                          style={{
                            width: `${Math.min((spending / category.monthlyLimit) * 100, 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  ) : null}

                  <button
                    onClick={() => openBudgetModal(category)}
                    className="text-xs font-medium text-indigo-600 hover:underline dark:text-indigo-400"
                  >
                    {category.monthlyLimit ? "Edit budget" : "Set budget"}
                  </button>
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

      <Modal
        isOpen={Boolean(budgetModalCategory)}
        onClose={() => setBudgetModalCategory(null)}
        title={`Set Budget — ${budgetModalCategory?.name || ""}`}
      >
        <div className="space-y-4">
          <Input
            label="Monthly limit (Rs, leave blank to remove)"
            type="number"
            min="1"
            placeholder="e.g. 5000"
            value={budgetInput}
            onChange={(event) => setBudgetInput(event.target.value)}
          />
          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={() => setBudgetModalCategory(null)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button onClick={handleSaveBudget} className="flex-1">
              Save
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default Categories