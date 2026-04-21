import clsx from "clsx"
import { NavLink } from "react-router-dom"
import { BarChart3, LayoutDashboard, PlusCircle, Receipt, Tags } from "lucide-react"

const BottomNav = ({ onAddClick }) => {
  return (
    <nav className="theme-card theme-border fixed bottom-0 left-0 right-0 z-40 border-t md:hidden">
      <div className="flex items-center justify-around py-2">
        <NavItem to="/" icon={LayoutDashboard} label="Home" />
        <NavItem to="/expenses" icon={Receipt} label="Expenses" />

        <button
          onClick={onAddClick}
          className="theme-button-primary flex -translate-y-4 flex-col items-center justify-center rounded-full p-3 shadow-lg"
        >
          <PlusCircle size={28} />
        </button>

        <NavItem to="/analytics" icon={BarChart3} label="Stats" />
        <NavItem to="/categories" icon={Tags} label="Categories" />
      </div>
    </nav>
  )
}

const NavItem = ({ to, icon, label }) => {
  const IconComponent = icon

  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        clsx(
          "flex flex-col items-center gap-1 text-xs",
          isActive ? "theme-accent-text" : "theme-muted-text",
        )
      }
    >
      <IconComponent size={20} />
      {label}
    </NavLink>
  )
}

export default BottomNav
