import { useEffect, useMemo, useRef, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { BarChart3, PieChart as PieChartIcon } from "lucide-react";

import Card from "../components/ui/Card";
import StatCard from "../components/ui/StatCard";
import WealthProjectionCalculator from "../components/common/WealthProjectionCalculator";
import { useExpenses } from "../context/ExpensesContext";
import GoalBasedInvestmentPlanner from "../components/common/GoalBasedInvestmentPlanner";
import settingsService from "../services/settingsService";

const CHART_COLORS = [
  "#4f46e5",
  "#06b6d4",
  "#10b981",
  "#f59e0b",
  "#f43f5e",
  "#8b5cf6",
  "#0ea5e9",
  "#84cc16",
];

// Rule-based, client-side only — compares this week's top category spend
// against its own trailing 4-week average. No LLM needed for v1 value.
const getWeeklyInsight = (expenses = []) => {
  const now = new Date()
  const dayMs = 24 * 60 * 60 * 1000

  const daysAgo = (dateStr) => {
    const d = new Date(dateStr)
    if (Number.isNaN(d.getTime())) return null
    return Math.floor((now - d) / dayMs)
  }

  const thisWeekByCategory = {}
  const trailingByCategory = {}

  expenses.forEach((expense) => {
    const age = daysAgo(expense.date)
    if (age === null || age < 0) return
    const category = expense.category || "Other"
    const amount = Number(expense.amount) || 0

    if (age < 7) {
      thisWeekByCategory[category] = (thisWeekByCategory[category] || 0) + amount
    } else if (age < 35) {
      trailingByCategory[category] = (trailingByCategory[category] || 0) + amount
    }
  })

  const topEntry = Object.entries(thisWeekByCategory).sort(([, a], [, b]) => b - a)[0]
  if (!topEntry) return null

  const [topCategory, thisWeekAmount] = topEntry
  const trailingTotal = trailingByCategory[topCategory] || 0
  const trailingWeeklyAvg = trailingTotal / 4

  if (trailingWeeklyAvg <= 0) return null

  const percentDiff = ((thisWeekAmount - trailingWeeklyAvg) / trailingWeeklyAvg) * 100
  if (Math.abs(percentDiff) < 5) return null

  const direction = percentDiff > 0 ? "more" : "less"
  return `You've spent ${Math.abs(percentDiff).toFixed(0)}% ${direction} on ${topCategory} this week than your trailing 4-week average.`
}

const Analytics = () => {
  const { expenses } = useExpenses();
  const [monthlyIncome, setMonthlyIncome] = useState(
    Number(settingsService.getMonthlyIncome()) || 0,
  );

  const plannerRef = useRef(null);
  const scrollToPlanner = () =>
    plannerRef.current?.scrollIntoView({ behavior: "smooth" });

  const calculateStats = (expenseList) => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    const monthExpenses = (expenseList || []).filter((expense) => {
      const expenseDate = new Date(expense.date);
      if (Number.isNaN(expenseDate.getTime())) return false;

      return (
        expenseDate.getMonth() === currentMonth &&
        expenseDate.getFullYear() === currentYear
      );
    });

    const weeklyBreakdown = {
      "Week 1": 0,
      "Week 2": 0,
      "Week 3": 0,
      "Week 4+": 0,
    };

    const categoryBreakdown = {};
    let total = 0;

    monthExpenses.forEach((expense) => {
      const day = Number(String(expense.date || "").split("-")[2]) || 1;
      const amount = Number(expense.amount) || 0;
      const categoryName = expense.category || "Other";

      if (day <= 7) weeklyBreakdown["Week 1"] += amount;
      else if (day <= 14) weeklyBreakdown["Week 2"] += amount;
      else if (day <= 21) weeklyBreakdown["Week 3"] += amount;
      else weeklyBreakdown["Week 4+"] += amount;

      categoryBreakdown[categoryName] =
        (categoryBreakdown[categoryName] || 0) + amount;
      total += amount;
    });

    return {
      totalExpenses: total,
      weeklyBreakdown,
      categoryBreakdown,
    };
  };

  useEffect(() => {
    const handleSettingsUpdated = (event) => {
      const { settings } = event.detail || {};
      if (settings?.monthlyIncome == null) return;
      setMonthlyIncome(Number(settings.monthlyIncome) || 0);
    };

    window.addEventListener("settingsUpdated", handleSettingsUpdated);

    return () =>
      window.removeEventListener("settingsUpdated", handleSettingsUpdated);
  }, []);

  const monthlyStats = useMemo(() => calculateStats(expenses), [expenses]);
  const weeklyInsight = useMemo(() => getWeeklyInsight(expenses), [expenses]);

  const leftoverMoney = monthlyIncome - monthlyStats.totalExpenses;
  const spendsByCategory = Object.entries(monthlyStats.categoryBreakdown || {})
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  const categoryChartData = spendsByCategory.slice(0, 6);
  const weeklyChartData = Object.entries(
    monthlyStats.weeklyBreakdown || {},
  ).map(([name, value]) => ({
    name,
    value,
  }));

  const totalCategorySpend =
    categoryChartData.reduce((sum, item) => sum + item.value, 0) || 1;
  const hasExpenseData = (expenses || []).some(
    (expense) => Number(expense.amount) > 0,
  );

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="theme-hero rounded-3xl p-5 shadow-lg md:p-7">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-white/20 p-2.5">
            <BarChart3 size={24} className="md:h-7 md:w-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold md:text-3xl">
              Analytics & Insights
            </h1>
            <p className="mt-1 text-sm opacity-90 md:text-base">
              Track spending patterns and investment growth
            </p>
          </div>
        </div>
      </div>

      {weeklyInsight ? (
        <p className="text-body-strong theme-text">{weeklyInsight}</p>
      ) : null}

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Monthly expenses"
          value={`Rs ${monthlyStats.totalExpenses.toLocaleString()}`}
          delta={
            monthlyIncome
              ? `${((monthlyStats.totalExpenses / monthlyIncome) * 100).toFixed(1)}% of income`
              : "0.0% of income"
          }
          deltaType="negative"
        />
        <StatCard
          label="Leftover money"
          value={`Rs ${leftoverMoney.toLocaleString()}`}
          delta={
            monthlyIncome
              ? `${((leftoverMoney / monthlyIncome) * 100).toFixed(1)}% of income`
              : "0.0% of income"
          }
          deltaType="positive"
        />
        <StatCard
          label="Average daily spend"
          value={`Rs ${(monthlyStats.totalExpenses / 30).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`}
        />
        <StatCard
          label="Annual potential growth"
          value={`Rs ${(leftoverMoney * 12 * 0.09).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`}
          delta="At 9% annual ROI"
          deltaType="positive"
        />
      </section>

      {!hasExpenseData ? (
        <Card
          padding="lg"
          className="border-dashed border-2 border-[var(--border-color)] bg-[var(--surface-color)]"
        >
          <div className="flex min-h-[220px] flex-col items-center justify-center text-center">
            <div className="mb-3 rounded-full bg-[var(--accent-soft-color)] p-3">
              <BarChart3 size={26} className="text-[var(--accent-color)]" />
            </div>
            <h3 className="text-xl font-bold theme-text">
              No spending data yet
            </h3>
            <p className="mt-2 max-w-md text-sm theme-muted-text">
              Add your first expense to unlock category trends, weekly spending
              insights, and a live financial overview.
            </p>
          </div>
        </Card>
      ) : (
        <section className="grid gap-4 xl:grid-cols-[1.05fr_1.55fr]">
          <Card padding="lg" className="overflow-hidden">
            <div className="mb-4 flex items-center gap-2">
              <PieChartIcon size={18} className="theme-accent-text" />
              <h3 className="text-lg font-semibold theme-text">
                Category split
              </h3>
            </div>

            <div className="h-[320px] min-h-[320px] w-full">
              <ResponsiveContainer
                width="100%"
                height="100%"
                minWidth={260}
                minHeight={260}
              >
                <PieChart width={300} height={260}>
                  <Pie
                    data={categoryChartData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={56}
                    outerRadius={88}
                    paddingAngle={3}
                    stroke="var(--surface)"
                    strokeWidth={2}
                  >
                    {categoryChartData.map((entry, index) => (
                      <Cell
                        key={`${entry.name}-${index}`}
                        fill={CHART_COLORS[index % CHART_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [
                      `Rs ${Number(value).toLocaleString()}`,
                      "Spend",
                    ]}
                    contentStyle={{
                      borderRadius: 12,
                      border: "1px solid var(--border-color)",
                      background: "var(--surface-color)",
                      color: "var(--text-color)",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-3 space-y-2">
              {categoryChartData.map((item, index) => {
                const percentage = (item.value / totalCategorySpend) * 100;
                return (
                  <div
                    key={item.name}
                    className="flex items-center justify-between gap-3"
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{
                          backgroundColor:
                            CHART_COLORS[index % CHART_COLORS.length],
                        }}
                      />
                      <span className="truncate text-sm theme-text">
                        {item.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs theme-muted-text">
                      <span>{percentage.toFixed(0)}%</span>
                      <span className="tabular-nums">
                        Rs {item.value.toLocaleString()}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card padding="lg" className="overflow-hidden">
            <div className="mb-4 flex items-center gap-2">
              <BarChart3 size={18} className="theme-accent-text" />
              <h3 className="text-lg font-semibold theme-text">
                Weekly spending trends
              </h3>
            </div>

            <div className="h-80 min-h-[320px] w-full">
              <ResponsiveContainer
                width="100%"
                height="100%"
                minWidth={0}
                minHeight={300}
              >
                <BarChart
                  data={weeklyChartData}
                  barCategoryGap="16%"
                  width={500}
                  height={300}
                >
                  <CartesianGrid
                    vertical={false}
                    stroke="var(--border-color)"
                    strokeDasharray="4 4"
                  />
                  <XAxis
                    dataKey="name"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: "var(--muted-text-color)", fontSize: 12 }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: "var(--muted-text-color)", fontSize: 12 }}
                  />
                  <Tooltip
                    formatter={(value) => [
                      `Rs ${Number(value).toLocaleString()}`,
                      "Spend",
                    ]}
                    contentStyle={{
                      borderRadius: 12,
                      border: "1px solid var(--border-color)",
                      background: "var(--surface-color)",
                      color: "var(--text-color)",
                    }}
                  />
                  <Bar
                    dataKey="value"
                    radius={[8, 8, 0, 0]}
                    fill="url(#spendGradient)"
                  />
                  <defs>
                    <linearGradient
                      id="spendGradient"
                      x1="0"
                      x2="0"
                      y1="0"
                      y2="1"
                    >
                      <stop offset="0%" stopColor="#4f46e5" />
                      <stop offset="100%" stopColor="#06b6d4" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </section>
      )}

      <Card
        padding="lg"
        className="bg-linear-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20"
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="text-center">
            <p className="text-caption theme-muted-text">Avg daily</p>
            <p className="mt-2 text-xl font-bold theme-text">
              Rs{" "}
              {(monthlyStats.totalExpenses / 30).toLocaleString("en-IN", {
                maximumFractionDigits: 0,
              })}
            </p>
          </div>
          <div className="text-center">
            <p className="text-caption theme-muted-text">Avg weekly</p>
            <p className="mt-2 text-xl font-bold theme-text">
              Rs{" "}
              {(monthlyStats.totalExpenses / 4).toLocaleString("en-IN", {
                maximumFractionDigits: 0,
              })}
            </p>
          </div>
          <div className="text-center">
            <p className="text-caption theme-muted-text">5-yr potential</p>
            <p className="mt-2 text-xl font-bold text-emerald-600 dark:text-emerald-400">
              Rs{" "}
              {(leftoverMoney * 12 * Math.pow(1.09, 5)).toLocaleString(
                "en-IN",
                { maximumFractionDigits: 0 },
              )}
            </p>
          </div>
          <div className="text-center">
            <p className="text-caption theme-muted-text">Categories</p>
            <p className="mt-2 text-xl font-bold text-blue-600 dark:text-blue-400">
              {Object.keys(monthlyStats.categoryBreakdown || {}).length}
            </p>
          </div>
        </div>
      </Card>

      <WealthProjectionCalculator
        monthlyIncome={monthlyIncome}
        currentSavings={100000}
        onFindFunds={scrollToPlanner}
      />

      <div ref={plannerRef}>
        <GoalBasedInvestmentPlanner />
      </div>
    </div>
  );
};

export default Analytics;
