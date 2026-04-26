import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import {
  ShoppingCart, Search, ImageIcon,
  Coffee, Croissant, Egg, Leaf,
  UtensilsCrossed, Cake, Star, IceCream, Sandwich,
  Soup, Pizza, Flame,
} from 'lucide-react'
import { useCart } from '../context/CartContext'

const API = import.meta.env.VITE_API_URL

/* ─── Icon map: category name → icon (case-insensitive prefix match) ─── */
const ICON_MAP = [
  { keys: ['coffee', 'espresso', 'latte', 'cappuccino', 'hot bev'],  icon: <Coffee          className='w-4 h-4' /> },
  { keys: ['tea', 'chai', 'matcha'],                                  icon: <Leaf            className='w-4 h-4' /> },
  { keys: ['bakery', 'croissant', 'bread', 'pastry'],                 icon: <Croissant       className='w-4 h-4' /> },
  { keys: ['breakfast', 'egg', 'brunch'],                             icon: <Egg             className='w-4 h-4' /> },
  { keys: ['mains', 'main', 'lunch', 'dinner'],                       icon: <UtensilsCrossed className='w-4 h-4' /> },
  { keys: ['dessert', 'sweet', 'cake', 'kulfi'],                      icon: <Cake            className='w-4 h-4' /> },
  { keys: ['cold bev', 'juice', 'smoothie', 'shake', 'soda'],        icon: <IceCream        className='w-4 h-4' /> },
  { keys: ['snack', 'sandwich', 'wrap'],                              icon: <Sandwich        className='w-4 h-4' /> },
  { keys: ['soup'],                                                   icon: <Soup            className='w-4 h-4' /> },
  { keys: ['pizza', 'pasta'],                                         icon: <Pizza           className='w-4 h-4' /> },
  { keys: ['spicy', 'hot', 'grill'],                                  icon: <Flame           className='w-4 h-4' /> },
]

function getCategoryIcon(name) {
  const lower = name.toLowerCase()
  for (const { keys, icon } of ICON_MAP) {
    if (keys.some(k => lower.includes(k))) return icon
  }
  return <UtensilsCrossed className='w-4 h-4' />  // fallback
}

/* ─── Item Card ─── */
function ItemCard({ item }) {
  const navigate = useNavigate()

  return (
    <div
      onClick={() => item.is_available && navigate(`/item/${item._id}`)}
      className={`bg-white rounded-3xl overflow-hidden shadow-card border border-app-sand/30
                  transition-all duration-200 hover:shadow-card-lg active:scale-[0.97]
                  ${item.is_available ? 'cursor-pointer' : 'opacity-60 cursor-not-allowed'}`}
    >
      {/* Image */}
      <div className='relative h-40 bg-app-bg overflow-hidden'>
        {item.image_url ? (
          <img
            src={item.image_url}
            alt={item.name}
            className='w-full h-full object-cover transition-transform duration-500 hover:scale-105'
          />
        ) : (
          <div className='w-full h-full flex items-center justify-center'>
            <ImageIcon className='w-10 h-10 text-app-muted/40' />
          </div>
        )}
        {!item.is_available && (
          <div className='absolute inset-0 bg-app-dark/40 flex items-center justify-center'>
            <span className='bg-white text-app-dark text-xs font-semibold px-3 py-1 rounded-full'>
              Unavailable
            </span>
          </div>
        )}
        {/* Calorie badge */}
        <div className='absolute bottom-2 left-2 flex items-center gap-1 bg-black/60 text-white
                        text-[10px] font-medium px-2 py-1 rounded-full backdrop-blur-sm'>
          🔥 {Math.floor(item.price * 1.8 + 80)} Kcal
        </div>
      </div>

      {/* Info */}
      <div className='p-3'>
        <div className='flex items-center gap-1 text-amber-500 mb-1'>
          <Star className='w-3 h-3 fill-amber-400 stroke-amber-400' />
          <span className='text-[11px] font-semibold text-app-dark'>4.{Math.floor(Math.random() * 3) + 7}</span>
          <span className='text-[11px] text-app-muted'>({Math.floor(Math.random() * 200) + 50})</span>
        </div>
        <h3 className='font-semibold text-app-dark text-sm leading-tight line-clamp-2 mb-1'>
          {item.name}
        </h3>
        <p className='text-app-red font-bold text-sm'>₹{item.price}</p>
      </div>
    </div>
  )
}

/* ─── Home Page ─── */
export default function Home() {
  const [menuItems,      setMenuItems]      = useState([])
  const [categories,     setCategories]     = useState([])
  const [loading,        setLoading]        = useState(true)
  const [activeCategory, setActiveCategory] = useState('All')
  const [search,         setSearch]         = useState('')
  const { itemCount } = useCart()
  const navigate = useNavigate()

  useEffect(() => {
    Promise.all([
      axios.get(`${API}/api/menu?is_available=true`).then(r => setMenuItems(r.data)),
      axios.get(`${API}/api/categories`).then(r => setCategories(r.data)),
    ])
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const filtered = menuItems.filter(item => {
    const matchCat    = activeCategory === 'All' || item.category === activeCategory
    const matchSearch = search === '' || item.name.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  /* Group by category for "All" view */
  const catNames = [...new Set(menuItems.map(i => i.category))]
  const grouped = catNames.reduce((acc, cat) => {
    const items = filtered.filter(i => i.category === cat)
    if (items.length) acc[cat] = items
    return acc
  }, {})

  const displayGroups = activeCategory === 'All' ? grouped : { [activeCategory]: filtered }

  /* Build dynamic pill list: All + fetched categories (only those with items) */
  const activeCatNames = new Set(menuItems.map(i => i.category))
  const pills = [
    { label: 'All', icon: <Coffee className='w-4 h-4' /> },
    ...categories
      .filter(c => activeCatNames.has(c.name))
      .map(c => ({ label: c.name, icon: getCategoryIcon(c.name) })),
  ]

  return (
    <div className='app-shell min-h-screen pb-8'>
      {/* ── Top Header ── */}
      <div className='px-5 pt-12 pb-4'>
        <div className='flex items-center justify-between mb-1'>
          <div>
            <p className='text-app-muted text-sm font-medium'>Good morning ☀️</p>
            <h1 className='font-display font-bold text-app-dark text-2xl leading-tight'>
              What would you like?
            </h1>
          </div>
          {/* Cart button */}
          <button
            onClick={() => navigate('/cart')}
            className='relative w-11 h-11 bg-app-red rounded-2xl flex items-center justify-center
                       shadow-card transition-all duration-200 active:scale-95'
          >
            <ShoppingCart className='w-5 h-5 text-white' />
            {itemCount > 0 && (
              <span className='absolute -top-1.5 -right-1.5 bg-amber-400 text-app-dark
                               text-[10px] font-bold min-w-[18px] h-[18px] rounded-full
                               flex items-center justify-center px-1'>
                {itemCount}
              </span>
            )}
          </button>
        </div>

        {/* Search bar */}
        <div className='relative mt-4'>
          <Search className='absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-app-muted' />
          <input
            type='text'
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder='Search menu items…'
            className='w-full bg-white border border-app-sand/50 rounded-2xl pl-10 pr-4 py-3 text-sm
                       focus:outline-none focus:ring-2 focus:ring-app-red/20 focus:border-app-red/50
                       placeholder-app-muted transition-all shadow-card'
          />
        </div>
      </div>

      {/* ── Category Pills (dynamic from API) ── */}
      <div className='px-5 mb-5'>
        <div className='flex gap-2 overflow-x-auto no-scrollbar'>
          {pills.map(cat => (
            <button
              key={cat.label}
              onClick={() => setActiveCategory(cat.label)}
              className={`shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-2xl text-sm font-medium
                          border transition-all duration-200
                          ${activeCategory === cat.label
                            ? 'bg-app-red text-white border-app-red shadow-card'
                            : 'bg-white text-app-dark border-app-sand/50 hover:border-app-red/40'
                          }`}
            >
              {cat.icon}
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Menu Items ── */}
      {loading ? (
        <div className='flex justify-center items-center h-64'>
          <div className='w-10 h-10 border-4 border-app-sand border-t-app-red rounded-full animate-spin' />
        </div>
      ) : Object.entries(displayGroups).length === 0 ? (
        <div className='text-center py-20 text-app-muted px-5'>
          <p className='text-5xl mb-3'>☕</p>
          <p className='font-semibold text-app-dark'>Nothing found</p>
          <p className='text-sm mt-1'>Try a different search or category</p>
        </div>
      ) : (
        Object.entries(displayGroups).map(([cat, items]) => (
          <section key={cat} className='mb-8 px-5'>
            {/* Category heading */}
            <div className='flex items-center justify-between mb-4'>
              <h2 className='font-display font-bold text-app-dark text-xl'>{cat}</h2>
              <span className='text-xs text-app-muted font-medium'>{items.length} items</span>
            </div>
            {/* 2-column grid */}
            <div className='grid grid-cols-2 gap-3'>
              {items.map(item => (
                <ItemCard key={item._id} item={item} />
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  )
}
