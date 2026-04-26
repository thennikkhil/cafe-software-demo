import { useState, useEffect, useCallback } from 'react'
import { Outlet, NavLink, useLocation } from 'react-router-dom'
import axios from 'axios'
import {
  ShoppingBag, UtensilsCrossed, BarChart2, ChefHat,
  Plus, Trash2, Tag, ChevronDown, ChevronRight, Loader2,
  Users, MessageSquare,
} from 'lucide-react'

const API = import.meta.env.VITE_API_URL

const navItems = [
  { to: '/orders',    label: 'Live Orders',   Icon: ShoppingBag },
  { to: '/menu',      label: 'Menu Manager',  Icon: UtensilsCrossed },
  { to: '/analytics', label: 'Analytics',     Icon: BarChart2 },
  { to: '/customers', label: 'Customers',     Icon: Users },
  { to: '/feedback',  label: 'Feedback',      Icon: MessageSquare },
]

export default function Layout() {
  const location = useLocation()

  const pageTitle = navItems.find(n => location.pathname.startsWith(n.to))?.label ?? 'Dashboard'

  return (
    <div className='flex min-h-screen'>
      {/* ── Sidebar ─────────────────────────────────────────────────────── */}
      <aside className='w-64 bg-primary-900 flex flex-col shrink-0'>
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
        <nav className='px-3 py-4 space-y-1'>
          {navItems.map(({ to, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${isActive
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

        {/* ── Category Manager ── */}
        <div className='flex-1 border-t border-primary-800 overflow-y-auto'>
          <CategoryManager />
        </div>

        <div className='px-6 py-4 border-t border-primary-800'>
          <p className='text-primary-400 text-xs'>© 2026 Café OS</p>
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

/* ─────────────────────────────────────────────────────────────────────────────
   Category Manager — lives in the sidebar
───────────────────────────────────────────────────────────────────────────── */
function CategoryManager() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(true)
  const [newName, setNewName] = useState('')
  const [adding, setAdding] = useState(false)
  const [addOpen, setAddOpen] = useState(false)
  const [error, setError] = useState('')

  const fetchCategories = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API}/api/categories`)
      setCategories(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchCategories() }, [fetchCategories])

  async function handleAdd(e) {
    e.preventDefault()
    if (!newName.trim()) return
    setAdding(true)
    setError('')
    try {
      const { data } = await axios.post(`${API}/api/categories`, { name: newName.trim() })
      setCategories(prev => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)))
      setNewName('')
      setAddOpen(false)
    } catch (err) {
      setError(err.response?.data?.error ?? 'Failed to add category.')
    } finally {
      setAdding(false)
    }
  }

  async function handleDelete(id, name) {
    if (!window.confirm(`Delete category "${name}"?`)) return
    try {
      await axios.delete(`${API}/api/categories/${id}`)
      setCategories(prev => prev.filter(c => c._id !== id))
    } catch (err) {
      alert('Delete failed: ' + (err.response?.data?.error ?? err.message))
    }
  }

  return (
    <div className='px-3 py-4'>
      {/* Section header */}
      <button
        onClick={() => setExpanded(v => !v)}
        className='w-full flex items-center justify-between px-3 py-2 text-primary-300
                   hover:text-white transition-colors rounded-lg hover:bg-primary-800 group'
      >
        <div className='flex items-center gap-2'>
          <Tag className='w-3.5 h-3.5' />
          <span className='text-xs font-semibold uppercase tracking-wider'>Categories</span>
        </div>
        {expanded
          ? <ChevronDown className='w-3.5 h-3.5' />
          : <ChevronRight className='w-3.5 h-3.5' />}
      </button>

      {expanded && (
        <div className='mt-2 space-y-1'>
          {loading ? (
            <div className='flex justify-center py-3'>
              <Loader2 className='w-4 h-4 text-primary-400 animate-spin' />
            </div>
          ) : categories.length === 0 ? (
            <p className='text-primary-400 text-xs px-3 py-2 italic'>No categories yet</p>
          ) : (
            categories.map(cat => (
              <div
                key={cat._id}
                className='flex items-center justify-between px-3 py-1.5 rounded-lg
                           text-primary-300 hover:bg-primary-800 hover:text-white
                           transition-colors group'
              >
                <span className='text-xs font-medium truncate'>{cat.name}</span>
                <button
                  onClick={() => handleDelete(cat._id, cat.name)}
                  className='opacity-0 group-hover:opacity-100 transition-opacity
                             p-0.5 rounded hover:bg-red-500/20 text-primary-400
                             hover:text-red-400'
                  title={`Delete ${cat.name}`}
                >
                  <Trash2 className='w-3 h-3' />
                </button>
              </div>
            ))
          )}

          {/* Add new category */}
          {addOpen ? (
            <form onSubmit={handleAdd} className='mt-2 px-1 space-y-1.5'>
              <input
                autoFocus
                type='text'
                value={newName}
                onChange={e => { setNewName(e.target.value); setError('') }}
                placeholder='Category name…'
                className='w-full bg-primary-800 text-white placeholder-primary-400
                           text-xs rounded-lg px-3 py-2 border border-primary-700
                           focus:outline-none focus:ring-1 focus:ring-primary-400'
              />
              {error && <p className='text-red-400 text-[10px] px-1'>{error}</p>}
              <div className='flex gap-1'>
                <button
                  type='submit'
                  disabled={adding || !newName.trim()}
                  className='flex-1 flex items-center justify-center gap-1 text-xs py-1.5
                             bg-primary-600 hover:bg-primary-500 disabled:opacity-50
                             text-white rounded-lg transition-colors font-medium'
                >
                  {adding ? <Loader2 className='w-3 h-3 animate-spin' /> : <Plus className='w-3 h-3' />}
                  Add
                </button>
                <button
                  type='button'
                  onClick={() => { setAddOpen(false); setNewName(''); setError('') }}
                  className='flex-1 text-xs py-1.5 bg-primary-800 hover:bg-primary-700
                             text-primary-300 rounded-lg transition-colors'
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setAddOpen(true)}
              className='mt-1 w-full flex items-center gap-2 px-3 py-1.5 rounded-lg
                         text-primary-400 hover:text-white hover:bg-primary-800
                         transition-colors text-xs border border-dashed border-primary-700
                         hover:border-primary-500'
            >
              <Plus className='w-3 h-3' />
              Add Category
            </button>
          )}
        </div>
      )}
    </div>
  )
}
