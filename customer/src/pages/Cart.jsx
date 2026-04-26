import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { ArrowLeft, Minus, Plus, Trash2, ShoppingBag, ImageIcon } from 'lucide-react'
import { useCart } from '../context/CartContext'

const API          = import.meta.env.VITE_API_URL
const WHATSAPP_NUM = import.meta.env.VITE_WHATSAPP_NUMBER

function buildWhatsAppLink(name, phone, items, total) {
  const itemLines = items
    .map(c => `  • ${c.quantity}x ${c.item.name} — ₹${(c.quantity * c.item.price).toFixed(0)}`)
    .join('\n')

  const text = [
    `🍽️ *New Order — The Artisanal Heart*`,
    ``,
    `👤 *Name:* ${name}`,
    `📞 *Phone:* ${phone}`,
    ``,
    `🛒 *Order Items:*`,
    itemLines,
    ``,
    `━━━━━━━━━━━━━━━━━━━`,
    `💰 *Total: ₹${total.toFixed(0)}*`,
    `━━━━━━━━━━━━━━━━━━━`,
    ``,
    `Please confirm my order! 🙏`,
  ].join('\n')

  return `https://wa.me/${WHATSAPP_NUM}?text=${encodeURIComponent(text)}`
}

export default function Cart() {
  const navigate = useNavigate()
  const { cart, total, updateQuantity, removeFromCart, clearCart } = useCart()
  const [name,    setName]    = useState('')
  const [phone,   setPhone]   = useState('')
  const [placing, setPlacing] = useState(false)
  const [error,   setError]   = useState('')

  async function placeOrder(e) {
    e.preventDefault()
    if (cart.length === 0) { setError('Your cart is empty.'); return }
    if (!name.trim())      { setError('Please enter your name.'); return }
    if (phone.length < 10) { setError('Enter a valid 10-digit phone number.'); return }
    setPlacing(true); setError('')

    const whatsapp_link = buildWhatsAppLink(name.trim(), phone.trim(), cart, total)
    const payload = {
      customer_name:  name.trim(),
      customer_phone: phone.trim(),
      total, whatsapp_link,
      items: cart.map(c => ({
        food_item_id:  c.item._id,
        name:          c.item.name,
        quantity:      c.quantity,
        price_at_time: c.item.price,
      })),
    }
    try {
      const { data: order } = await axios.post(`${API}/api/orders`, payload)
      clearCart()
      navigate('/confirmation', { state: { order, whatsapp_link } })
    } catch (err) {
      setError(err.response?.data?.error ?? 'Failed to place order. Try again.')
    } finally { setPlacing(false) }
  }

  return (
    <div className='app-shell min-h-screen' style={{ paddingBottom: '100px' }}>
      {/* ── Header ── */}
      <div className='flex items-center justify-between px-5 pt-12 pb-5'>
        <button
          onClick={() => navigate(-1)}
          className='w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-card
                     transition-all duration-200 active:scale-95'
        >
          <ArrowLeft className='w-5 h-5 text-app-dark' />
        </button>
        <h1 className='font-display font-bold text-app-dark text-xl'>Your Order</h1>
        <div className='w-10' /> {/* spacer */}
      </div>

      {cart.length === 0 ? (
        /* ── Empty state ── */
        <div className='flex flex-col items-center justify-center px-8 pt-20 text-center'>
          <div className='w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-card mb-6'>
            <ShoppingBag className='w-10 h-10 text-app-sand' />
          </div>
          <h2 className='font-display font-bold text-app-dark text-2xl mb-2'>Cart is Empty</h2>
          <p className='text-app-muted text-sm mb-8'>Discover our artisan favorites and add them to your order.</p>
          <button
            onClick={() => navigate('/')}
            className='btn-primary px-8 py-3.5 text-sm flex items-center gap-2'
          >
            <ArrowLeft className='w-4 h-4' /> Browse Menu
          </button>
        </div>
      ) : (
        <div className='px-5 space-y-4'>
          {/* ── Cart Items ── */}
          <div className='space-y-3'>
            {cart.map(({ item, quantity }) => (
              <div key={item._id} className='bg-white rounded-2xl p-4 flex items-center gap-3 shadow-card border border-app-sand/30'>
                {/* Thumbnail */}
                <div className='w-16 h-16 rounded-xl overflow-hidden bg-app-bg shrink-0'>
                  {item.image_url ? (
                    <img src={item.image_url} alt={item.name} className='w-full h-full object-cover' />
                  ) : (
                    <div className='w-full h-full flex items-center justify-center'>
                      <ImageIcon className='w-6 h-6 text-app-sand' />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className='flex-1 min-w-0'>
                  <p className='font-semibold text-app-dark text-sm truncate'>{item.name}</p>
                  <p className='text-app-red font-bold text-sm mt-0.5'>₹{item.price}</p>
                </div>

                {/* Quantity + remove */}
                <div className='flex items-center gap-2 shrink-0'>
                  <button
                    onClick={() => updateQuantity(item._id, quantity - 1)}
                    className='w-8 h-8 rounded-full border border-app-sand/60 flex items-center justify-center
                               text-app-dark hover:border-app-red hover:text-app-red transition-colors'
                  >
                    <Minus className='w-3.5 h-3.5' />
                  </button>
                  <span className='w-5 text-center font-bold text-app-dark text-sm'>{quantity}</span>
                  <button
                    onClick={() => updateQuantity(item._id, quantity + 1)}
                    className='w-8 h-8 rounded-full bg-app-red flex items-center justify-center
                               text-white transition-all active:scale-95'
                  >
                    <Plus className='w-3.5 h-3.5' />
                  </button>
                  <button
                    onClick={() => removeFromCart(item._id)}
                    className='w-8 h-8 rounded-full hover:bg-red-50 flex items-center justify-center
                               text-app-sand hover:text-red-500 transition-colors ml-1'
                  >
                    <Trash2 className='w-3.5 h-3.5' />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* ── Order total ── */}
          <div className='bg-white rounded-2xl p-4 shadow-card border border-app-sand/30 flex justify-between items-center'>
            <span className='text-app-muted font-medium text-sm'>Subtotal</span>
            <span className='font-display font-bold text-app-dark text-xl'>₹{total.toFixed(0)}</span>
          </div>

          {/* ── Details form ── */}
          <form onSubmit={placeOrder} className='bg-white rounded-2xl p-5 shadow-card border border-app-sand/30 space-y-4'>
            <h2 className='font-display font-bold text-app-dark text-lg'>Your Details</h2>

            <div>
              <label className='block text-xs font-semibold text-app-muted uppercase tracking-wide mb-1.5'>
                Full Name *
              </label>
              <input
                required className='input' placeholder='e.g. Arjun Sharma'
                value={name} onChange={e => setName(e.target.value)}
              />
            </div>

            <div>
              <label className='block text-xs font-semibold text-app-muted uppercase tracking-wide mb-1.5'>
                Phone Number *
              </label>
              <input
                required type='tel' maxLength={10} pattern='[6-9][0-9]{9}'
                className='input' placeholder='10-digit mobile number'
                value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
              />
            </div>

            {error && (
              <p className='text-red-600 text-sm bg-red-50 border border-red-100 rounded-xl px-4 py-3'>{error}</p>
            )}

            {/* Sticky bottom CTA */}
            <div className='fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-sm
                            bg-white border-t border-app-sand/40 shadow-bottom-bar px-5 py-4'>
              <div className='flex items-center gap-4'>
                <div>
                  <p className='text-xs text-app-muted font-medium'>Total</p>
                  <p className='font-display font-bold text-app-dark text-xl'>₹{total.toFixed(0)}</p>
                </div>
                <button
                  type='submit'
                  disabled={placing}
                  className='flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl
                             bg-app-red hover:bg-app-red-dark disabled:opacity-60 disabled:cursor-not-allowed
                             text-white text-sm font-semibold transition-all duration-200 active:scale-95 shadow-card'
                >
                  {placing
                    ? <div className='w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin' />
                    : <ShoppingBag className='w-5 h-5' />}
                  {placing ? 'Placing Order…' : 'Place Order'}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
