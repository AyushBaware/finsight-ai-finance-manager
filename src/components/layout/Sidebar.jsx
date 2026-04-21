import clsx from "clsx"
import { NavLink } from "react-router-dom"
import { BarChart3, LayoutDashboard, Receipt, Settings, Tags } from "lucide-react"

import BrandedHeader from "../common/BrandedHeader"
import { auth } from "../../firebase"

const navItems = [
  { label: "Dashboard", path: "/", icon: LayoutDashboard },
  { label: "Expenses", path: "/expenses", icon: Receipt },
  { label: "Analytics", path: "/analytics", icon: BarChart3 },
  { label: "Categories", path: "/categories", icon: Tags },
  { label: "Settings", path: "/settings", icon: Settings },
]

const Sidebar = ({ isOpen, onClose, user }) => {
  return (
    <>
      {isOpen ? (
        <div className="theme-overlay fixed inset-0 z-40 md:hidden" onClick={onClose} />
      ) : null}

      <aside
        className={clsx(
          "theme-card theme-border fixed left-0 top-0 z-50 flex h-full w-64 flex-col border-r transition-transform duration-300",
          "md:fixed md:translate-x-0 md:z-50",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="theme-border flex h-16 items-center border-b px-6">
          <BrandedHeader />
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems.map((item) => {
            const Icon = item.icon

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  clsx(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition",
                    isActive
                      ? "theme-button-primary"
                      : "theme-muted-text hover:bg-gray-100 dark:hover:bg-gray-800",
                  )
                }
              >
                <Icon size={18} />
                {item.label}
              </NavLink>
            )
          })}
        </nav>

        <div className="theme-border border-t p-4">
          {user ? (
            <div>
              <p className="theme-text text-sm font-medium">
                {user.displayName || user.email}
              </p>
              <button
                onClick={() => {
                  auth.signOut()
                  onClose()
                }}
                className="mt-2 text-sm text-red-500"
              >
                Logout
              </button>
            </div>
          ) : (
            <NavLink to="/login" onClick={onClose} className="theme-link text-sm font-medium">
              Login / Signup
            </NavLink>
          )}
        </div>
      </aside>
    </>
  )
}

export default Sidebar
