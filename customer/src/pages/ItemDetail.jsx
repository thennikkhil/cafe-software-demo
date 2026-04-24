import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import axios from 'axios'
import { ArrowLeft, Heart, Star, ShoppingBag, ImageIcon, Snowflake, Flame, Droplets, Sparkles } from 'lucide-react'
import { useCart } from '../context/CartContext'

const API = import.meta.env.VITE_API_URL

const MILK_OPTIONS      = ['Oat Milk', 'Full Cream', 'Skim Milk', 'Soy Milk']
const SWEETNESS_OPTIONS = ['None', 'Light', 'Standard', 'Extra']
const TEMP_OPTIONS      = [
  { label: 'Iced', icon: <Snowflake className='w-4 h-4' /> },
  { label: 'Hot',  icon: <Flame     className='w-4 h-4' /> },
]

/* Only show customizations for coffee/tea */
const CUSTOMIZABLE_CATS = ['Coffee', 'Tea']

export default function ItemDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addToCart, itemCount } = useCart()

  const [item,        setItem]        = useState(null)
  const [loading,     setLoading]     = useState(true)
  const [favorited,   setFavorited]   = useState(false)
  const [selectedTemp,   setTemp]     = useState('Hot')
  const [selectedMilk,   setMilk]     = useState('Oat Milk')
  const [selectedSweet,  setSweet]    = useState('Standard')
  const [added,           setAdded]   = useState(false)

  useEffect(() => {
    axios.get(`${API}/api/menu`)
      .then(r => {
        const found = r.data.find(i => i._id === id)
        setItem(found || null)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [id])

  function handleAddToCart() {
    if (!item) return
    addToCart(item)
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  function handleAddAndGoCart() {
    if (!item) return
    addToCart(item)
    navigate('/cart')
  }

  if (loading) {
    return (
      <div className='app-shell flex items-center justify-center h-screen'>
        <div className='w-10 h-10 border-4 border-app-sand border-t-app-red rounded-full animate-spin' />
      </div>
    )
  }

  if (!item) {
    return (
      <div className='app-shell flex flex-col items-center justify-center h-screen gap-4 px-6 text-center'>
        <p className='text-5xl'>☕</p>
        <p className='font-semibold text-app-dark'>Item not found</p>
        <button onClick={() => navigate('/')} className='btn-primary px-6 py-3 text-sm'>
          Back to Menu
        </button>
      </div>
    )
  }

  const kcal = Math.floor(item.price * 1.8 + 80)
  const rating = 4.8
  const reviewCount = 120
  const isCustomizable = CUSTOMIZABLE_CATS.includes(item.category)

  return (
    <div className='app-shell flex flex-col' style={{ paddingBottom: '90px' }}>

      {/* ── Hero Image ── */}
      <div className='relative w-full' style={{ height: '55vw', maxHeight: '280px', minHeight: '200px' }}>
        {item.image_url ? (
          <img
            src={item.image_url}
            alt={item.name}
            className='w-full h-full object-cover'
          />
        ) : (
          <div className='w-full h-full bg-app-bg flex items-center justify-center'>
            <ImageIcon className='w-16 h-16 text-app-sand' />
          </div>
        )}

        {/* Gradient overlay at top for header readability */}
        <div className='absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/30 to-transparent' />

        {/* Header row */}
        <div className='absolute top-0 inset-x-0 flex items-center justify-between px-5 pt-12'>
          <button
            onClick={() => navigate(-1)}
            className='w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center
                       shadow-card transition-all duration-200 active:scale-95'
          >
            <ArrowLeft className='w-5 h-5 text-app-dark' />
          </button>

          <span className='font-semibold text-white text-base drop-shadow-sm'>Detail</span>

          <button
            onClick={() => setFavorited(f => !f)}
            className='w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center
                       shadow-card transition-all duration-200 active:scale-95'
          >
            <Heart
              className={`w-5 h-5 transition-all duration-200 ${
                favorited ? 'fill-app-red stroke-app-red scale-110' : 'stroke-app-dark'
              }`}
            />
          </button>
        </div>

        {/* Calorie badge */}
        <div className='absolute bottom-3 left-4 flex items-center gap-1.5 bg-black/60 backdrop-blur-sm
                        text-white text-xs font-medium px-3 py-1.5 rounded-full'>
          🔥 {kcal} Kcal
        </div>

        {/* Cart badge top-right */}
        {itemCount > 0 && (
          <button
            onClick={() => navigate('/cart')}
            className='absolute bottom-3 right-4 flex items-center gap-1.5 bg-app-red
                       text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-card
                       transition-all duration-200 active:scale-95'
          >
            <ShoppingBag className='w-3.5 h-3.5' />
            {itemCount} in cart
          </button>
        )}
      </div>

      {/* ── Content Area ── */}
      <div className='flex-1 px-5 pt-5 space-y-5'>

        {/* Name + Rating */}
        <div className='flex items-start justify-between gap-3'>
          <h1 className='font-display font-bold text-app-dark text-3xl leading-tight flex-1'>
            {item.name}
          </h1>
          <div className='flex items-center gap-1 shrink-0 mt-1'>
            <Star className='w-4 h-4 fill-amber-400 stroke-amber-400' />
            <span className='font-bold text-app-dark text-sm'>{rating}</span>
            <span className='text-app-muted text-sm'>({reviewCount})</span>
          </div>
        </div>

        {/* Short description */}
        {item.description && (
          <p className='text-app-muted text-sm leading-relaxed -mt-1'>
            {item.description.slice(0, 80)}{item.description.length > 80 ? '…' : ''}
          </p>
        )}

        {/* Description card */}
        {item.description && (
          <div className='bg-white rounded-2xl p-4 border border-app-sand/30 shadow-card'>
            <h2 className='font-bold text-app-dark mb-2 text-base'>Description</h2>
            <p className='text-app-muted text-sm leading-relaxed'>{item.description}</p>
          </div>
        )}

        {/* ── Customization (only for coffee/tea) ── */}
        {isCustomizable && (
          <>
            {/* Temperature toggle */}
            <div>
              <h2 className='font-bold text-app-dark mb-3 text-base'>Options Available</h2>
              <div className='grid grid-cols-2 gap-3'>
                {TEMP_OPTIONS.map(opt => (
                  <button
                    key={opt.label}
                    onClick={() => setTemp(opt.label)}
                    className={`flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-semibold
                                border-2 transition-all duration-200 active:scale-95
                                ${selectedTemp === opt.label
                                  ? 'bg-app-green border-app-green text-app-dark-green'
                                  : 'bg-white border-app-sand/40 text-app-muted'
                                }`}
                  >
                    {opt.icon}
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Milk + Sweetness */}
            <div className='grid grid-cols-2 gap-3'>
              {/* Milk picker */}
              <div className='bg-white rounded-2xl p-4 border border-app-sand/30 shadow-card'>
                <div className='flex items-center gap-2 mb-2'>
                  <Droplets className='w-4 h-4 text-app-red' />
                  <span className='text-xs text-app-muted font-medium uppercase tracking-wide'>Milk</span>
                </div>
                <p className='font-bold text-app-dark text-sm mb-2'>{selectedMilk}</p>
                <div className='flex flex-wrap gap-1'>
                  {MILK_OPTIONS.map(m => (
                    <button
                      key={m}
                      onClick={() => setMilk(m)}
                      className={`text-[10px] px-2 py-0.5 rounded-full border transition-all
                                  ${selectedMilk === m
                                    ? 'bg-app-red text-white border-app-red'
                                    : 'bg-app-bg border-app-sand/50 text-app-muted'
                                  }`}
                    >
                      {m.replace(' Milk', '')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sweetness picker */}
              <div className='bg-white rounded-2xl p-4 border border-app-sand/30 shadow-card'>
                <div className='flex items-center gap-2 mb-2'>
                  <Sparkles className='w-4 h-4 text-app-red' />
                  <span className='text-xs text-app-muted font-medium uppercase tracking-wide'>Sweetness</span>
                </div>
                <p className='font-bold text-app-dark text-sm mb-2'>{selectedSweet}</p>
                <div className='flex flex-wrap gap-1'>
                  {SWEETNESS_OPTIONS.map(s => (
                    <button
                      key={s}
                      onClick={() => setSweet(s)}
                      className={`text-[10px] px-2 py-0.5 rounded-full border transition-all
                                  ${selectedSweet === s
                                    ? 'bg-app-red text-white border-app-red'
                                    : 'bg-app-bg border-app-sand/50 text-app-muted'
                                  }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Availability notice */}
        {!item.is_available && (
          <div className='bg-red-50 border border-red-200 rounded-2xl p-4 text-center'>
            <p className='text-red-600 font-semibold text-sm'>Currently Unavailable</p>
            <p className='text-red-400 text-xs mt-0.5'>Check back soon!</p>
          </div>
        )}
      </div>

      {/* ── Sticky Bottom Bar ── */}
      <div className='fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-sm
                      bg-white border-t border-app-sand/40 shadow-bottom-bar px-5 py-4'>
        <div className='flex items-center gap-4'>
          <div>
            <p className='text-xs text-app-muted font-medium'>Price</p>
            <p className='font-display font-bold text-app-dark text-2xl'>₹{item.price}</p>
          </div>
          <button
            onClick={handleAddAndGoCart}
            disabled={!item.is_available}
            className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl
                        text-sm font-semibold transition-all duration-200 active:scale-95
                        ${added
                          ? 'bg-green-500 text-white'
                          : item.is_available
                            ? 'bg-app-red hover:bg-app-red-dark text-white shadow-card'
                            : 'bg-app-sand/40 text-app-muted cursor-not-allowed'
                        }`}
          >
            <ShoppingBag className='w-5 h-5' />
            {added ? 'Added!' : 'Add to Order'}
          </button>
        </div>
      </div>
    </div>
  )
}
