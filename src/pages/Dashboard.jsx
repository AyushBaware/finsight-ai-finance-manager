import { useEffect, useState } from "react";
import { ArrowDownRight, ArrowUpRight, PieChart } from "lucide-react";
import Card from "../components/ui/Card";
import StatCard from "../components/ui/StatCard";
import BudgetProgressBar from "../components/ui/BudgetProgressBar";
import { Link } from "react-router-dom";
import TransactionRow from "../components/ui/TransactionRow";
import { getCategoryIcon } from "../utils/categoryIcons";
import { useExpenses } from "../context/ExpensesContext";
import settingsService from "../services/settingsService";
import categoriesService from "../services/categoriesService";
import accountsService from "../services/accountsService"
import { calculateAccountBalance } from "../utils/accountBalance"

const Dashboard = () => {
  const { expenses } = useExpenses();
  const initialSettings = settingsService.getSettings();
  const [monthlyIncome, setMonthlyIncome] = useState(
    Number(initialSettings.monthlyIncome) || 0,
  );
  const [riskTolerance, setRiskTolerance] = useState(
    initialSettings.riskTolerance,
  );

  const totalExpenses = expenses.reduce(
    (sum, e) => sum + (Number(e.amount) || 0),
    0,
  );
  const recentExpenses = expenses.slice(0, 5);
  const financialData = {
    monthlyIncome,
    totalExpenses,
    expenses,
    savingsGoal: 5000,
    riskTolerance,
  };
  const leftoverMoney =
    financialData.monthlyIncome - financialData.totalExpenses;
  const savingsRate = financialData.monthlyIncome
    ? ((leftoverMoney / financialData.monthlyIncome) * 100).toFixed(1)
    : "0.0";

  const isOverBudget = leftoverMoney < 0;

  // Show the two most urgent categories over budget & >50% used.
  const categories = categoriesService.getCategories();
  const mostUrgentBudgets = categories
    .filter((c) => c.monthlyLimit)
    .map((c) => {
      const spent = expenses
        .filter((e) => e.category === c.name)
        .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
      return { ...c, spent, percent: (spent / c.monthlyLimit) * 100 };
    })
    .filter((c) => c.percent > 50)
    .sort((a, b) => b.percent - a.percent)
    .slice(0, 2);

  useEffect(() => {
    const handleSettingsUpdated = (event) => {
      const { settings } = event.detail || {};
      if (!settings) return;
      setMonthlyIncome(Number(settings.monthlyIncome) || 0);
      setRiskTolerance(settings.riskTolerance);
    };
    window.addEventListener("settingsUpdated", handleSettingsUpdated);
    return () =>
      window.removeEventListener("settingsUpdated", handleSettingsUpdated);
  }, []);

  return (
    <div className="space-y-6">
      {/* Hero: Leftover Money (full width) + Income / Expense side-by-side below it */}
      <section className="grid grid-cols-2 gap-4">
        <StatCard
          hero
          tone={isOverBudget ? "negative" : "accent"}
          label="Leftover this month"
          value={`${isOverBudget ? "- " : ""}Rs ${Math.abs(leftoverMoney).toLocaleString()}`}
          subtext={
            isOverBudget
              ? "You've spent more than you earned this month."
              : "What's left after this month's expenses."
          }
          delta={isOverBudget ? "Over budget" : `${savingsRate}% saved`}
        />

        <StatCard
          label="Income"
          value={`Rs ${financialData.monthlyIncome.toLocaleString()}`}
          icon={
            <span
              className="flex h-8 w-8 items-center justify-center rounded-full"
              style={{ background: "var(--positive-soft-color)" }}
            >
              <ArrowUpRight
                size={16}
                style={{ color: "var(--positive-color)" }}
              />
            </span>
          }
        />

        <StatCard
          label="Expenses"
          value={`Rs ${financialData.totalExpenses.toLocaleString()}`}
          icon={
            <span
              className="flex h-8 w-8 items-center justify-center rounded-full"
              style={{ background: "var(--negative-soft-color)" }}
            >
              <ArrowDownRight
                size={16}
                style={{ color: "var(--negative-color)" }}
              />
            </span>
          }
        />
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-h2 theme-text">Wallets</h2>
          <Link to="/accounts" className="theme-link text-sm font-medium hover:underline">
            Manage
          </Link>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-1">
          {accountsService.getAccounts().map((account) => (
            <Card key={account.id} padding="md" className="min-w-[140px] shrink-0">
              <p className="text-caption theme-muted-text">{account.icon} {account.name}</p>
              <p className="text-h2 tabular-nums theme-text mt-1">
                Rs {calculateAccountBalance(account, expenses).toLocaleString()}
              </p>
            </Card>
          ))}
        </div>
      </section>

      {/* Two slim budget strips — the most urgent categories */}
      {mostUrgentBudgets.length > 0 ? (
        <section>
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PieChart size={18} className="theme-accent-text" />
              <h2 className="text-h2 theme-text">Budget Alerts</h2>
            </div>
            <Link
              to="/categories"
              className="theme-link text-sm font-medium hover:underline"
            >
              Manage budgets
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {mostUrgentBudgets.map((budget) => (
              <Card key={budget.name} padding="lg">
                <BudgetProgressBar
                  label={budget.name}
                  spent={budget.spent}
                  limit={budget.monthlyLimit}
                />
              </Card>
            ))}
          </div>
        </section>
      ) : null}

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-h2 theme-text">Recent Expenses</h2>
          <Link
            to="/expenses"
            className="theme-link text-sm font-medium hover:underline"
          >
            View all
          </Link>
        </div>

        <div className="space-y-2">
          {recentExpenses.length > 0 ? (
            recentExpenses.map((expense) => (
              <TransactionRow
                key={expense.id}
                category={expense.category}
                note={expense.note}
                date={expense.date}
                amount={expense.amount}
                icon={getCategoryIcon(expense.category)}
              />
            ))
          ) : (
            <Card padding="sm" className="text-center theme-muted-text">
              <p>No expenses yet. Add one to get started!</p>
            </Card>
          )}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
