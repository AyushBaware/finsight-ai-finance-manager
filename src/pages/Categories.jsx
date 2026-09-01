import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";

import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Modal from "../components/ui/Modal";
import BudgetProgressBar from "../components/ui/BudgetProgressBar";
import { useExpenses } from "../context/ExpensesContext";
import categoriesService from "../services/categoriesService";

const Categories = () => {
  const { expenses } = useExpenses();
  const [categories, setCategories] = useState(() =>
    categoriesService.getCategories(),
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: "", emoji: "Misc" });

  const [budgetModalCategory, setBudgetModalCategory] = useState(null);
  const [budgetInput, setBudgetInput] = useState("");

  const getCategorySpending = (categoryName) =>
    expenses
      .filter((expense) => expense.category === categoryName)
      .reduce((sum, expense) => sum + Number(expense.amount || 0), 0);

  const handleAddCategory = () => {
    if (!newCategory.name.trim()) return;
    const nextId =
      categories.length > 0 ? Math.max(...categories.map((c) => c.id)) + 1 : 1;
    const nextCategories = [
      ...categories,
      {
        id: nextId,
        name: newCategory.name.trim(),
        emoji: newCategory.emoji.trim() || "Misc",
        monthlyLimit: null,
      },
    ];
    setCategories(nextCategories);
    categoriesService.saveCategories(nextCategories);
    setNewCategory({ name: "", emoji: "Misc" });
    setIsModalOpen(false);
  };

  const handleDeleteCategory = (id) => {
    const nextCategories = categories.filter((category) => category.id !== id);
    setCategories(nextCategories);
    categoriesService.saveCategories(nextCategories);
  };

  const openBudgetModal = (category) => {
    setBudgetModalCategory(category);
    setBudgetInput(category.monthlyLimit ? String(category.monthlyLimit) : "");
  };

  const handleSaveBudget = () => {
    if (!budgetModalCategory) return;
    const trimmed = budgetInput.trim();
    const limit = trimmed === "" ? null : Number.parseFloat(trimmed);
    if (limit !== null && (!Number.isFinite(limit) || limit <= 0)) return;
    const nextCategories = categoriesService.updateCategoryLimit(
      budgetModalCategory.id,
      limit,
    );
    setCategories(nextCategories);
    setBudgetModalCategory(null);
  };

  return (
    <div className="space-y-6">
      <div className="theme-hero rounded-2xl p-6 shadow-lg">
        <h1 className="text-h1">Expense Categories</h1>
        <p className="text-body mt-2 opacity-90">
          Track your spending across categories
        </p>
      </div>

      <section className="space-y-4">
        <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
          <h2 className="text-h2 theme-text">Your Categories</h2>
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
            const spending = getCategorySpending(category.name);

            return (
              <Card
                key={category.id}
                padding="lg"
                className="transition-shadow hover:shadow-md"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex flex-1 items-center gap-3">
                      <div
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold"
                        style={{ background: "var(--surface-muted)" }}
                      >
                        {category.emoji}
                      </div>
                      <h3 className="text-body-strong theme-text">
                        {category.name}
                      </h3>
                    </div>
                    <button
                      onClick={() => handleDeleteCategory(category.id)}
                      className="shrink-0 theme-muted-text transition-colors hover:text-red-500"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>

                  {category.monthlyLimit ? (
                    <BudgetProgressBar
                      label="Spent"
                      spent={spending}
                      limit={category.monthlyLimit}
                    />
                  ) : (
                    <p className="text-caption theme-muted-text">
                      Spent:{" "}
                      <span className="tabular-nums text-body-strong theme-text">
                        Rs {spending.toLocaleString()}
                      </span>
                    </p>
                  )}

                  <button
                    onClick={() => openBudgetModal(category)}
                    className="text-caption font-medium theme-accent-text hover:underline"
                  >
                    {category.monthlyLimit ? "Edit budget" : "Set budget"}
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add New Category"
      >
        <div className="space-y-4">
          <Input
            label="Category Name"
            placeholder="e.g., Education"
            value={newCategory.name}
            onChange={(e) =>
              setNewCategory((p) => ({ ...p, name: e.target.value }))
            }
          />
          <Input
            label="Label (optional)"
            placeholder="e.g., Learn"
            value={newCategory.emoji}
            maxLength={8}
            onChange={(e) =>
              setNewCategory((p) => ({ ...p, emoji: e.target.value }))
            }
          />
          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={() => setIsModalOpen(false)}
              className="flex-1"
            >
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
            onChange={(e) => setBudgetInput(e.target.value)}
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
  );
};

export default Categories;
