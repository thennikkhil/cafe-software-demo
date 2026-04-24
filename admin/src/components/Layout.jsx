import { Outlet, NavLink, useLocation } from 'react-router-dom'
import { ShoppingBag, UtensilsCrossed, BarChart2, ChefHat } from 'lucide-react'

const navItems = [
  { to: '/orders',    label: 'Live Orders',  Icon: ShoppingBag },
  { to: '/menu',      label: 'Menu Manager', Icon: UtensilsCrossed },
  { to: '/analytics', label: 'Analytics',    Icon: BarChart2 },
]

export default function Layout() {
  const location = useLocation()

  const pageTitle = navItems.find(n => location.pathname.startsWith(n.to))?.label ?? 'Dashboard'

  return (
    <div className='flex min-h-screen'>
      {/* ── Sidebar ─────────────────────────────────────────────────────── */}
      <aside className='w-60 bg-primary-900 flex flex-col shrink-0'>
        {/* Logo */}
        <div className='flex items-center gap-2.5 px-6 py-5 border-b border-primary-800'>
          <div className='w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center'>
            <ChefHat className='w-4 h-4 text-white' />
          </div>
          <div>
            <p className='text-white font-semibold text-sm leading-tight'>Café Admin</p>
            <p className='text-primary-300 text-xs'>Dashboard</p>
          </div>
        </div>

        {/* Nav */}
        <nav className='flex-1 px-3 py-4 space-y-1'>
          {navItems.map(({ to, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-primary-700 text-white'
                    : 'text-primary-200 hover:bg-primary-800 hover:text-white'
                }`
              }
            >
              <Icon className='w-4 h-4 shrink-0' />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className='px-6 py-4 border-t border-primary-800'>
          <p className='text-primary-400 text-xs'>© 2024 Café OS</p>
        </div>
      </aside>

      {/* ── Main ────────────────────────────────────────────────────────── */}
      <div className='flex-1 flex flex-col overflow-hidden'>
        {/* Top bar */}
        <header className='bg-white border-b border-gray-100 px-8 py-4'>
          <h1 className='text-xl font-semibold text-gray-900'>{pageTitle}</h1>
        </header>
        <main className='flex-1 overflow-y-auto p-8'>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
