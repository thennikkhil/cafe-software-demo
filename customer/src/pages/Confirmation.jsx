import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { CheckCircle2, MessageCircle, ArrowLeft, Copy, ShoppingBag } from 'lucide-react'

export default function Confirmation() {
  const navigate  = useNavigate()
  const location  = useLocation()
  const [copied, setCopied] = useState(false)

  const order         = location.state?.order
  const whatsapp_link = location.state?.whatsapp_link

  useEffect(() => {
    if (!order) navigate('/', { replace: true })
  }, [order, navigate])

  if (!order) return null

  function copyLink() {
    navigator.clipboard.writeText(whatsapp_link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className='app-shell min-h-screen pb-10'>
      {/* ── Header ── */}
      <div className='flex items-center justify-between px-5 pt-12 pb-5'>
        <button
          onClick={() => navigate('/')}
          className='w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-card
                     transition-all duration-200 active:scale-95'
        >
          <ArrowLeft className='w-5 h-5 text-app-dark' />
        </button>
        <h1 className='font-display font-bold text-app-dark text-xl'>Order Confirmed</h1>
        <div className='w-10' />
      </div>

      <div className='px-5 space-y-4'>
        {/* ── Success card ── */}
        <div className='bg-white rounded-3xl p-8 shadow-card border border-app-sand/30 text-center'>
          <div className='w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-5
                          border-4 border-green-100'>
            <CheckCircle2 className='w-10 h-10 text-green-500' />
          </div>
          <h2 className='font-display font-bold text-app-dark text-2xl mb-1'>Order Placed! 🎉</h2>
          <p className='text-app-muted text-sm'>
            Thank you, <strong className='text-app-dark'>{order.customer_name}</strong>!<br />
            Your order is confirmed and being prepared.
          </p>
        </div>

        {/* ── Order summary ── */}
        <div className='bg-white rounded-2xl p-5 shadow-card border border-app-sand/30'>
          <h3 className='font-bold text-app-dark text-base mb-4'>Order Summary</h3>
          <div className='space-y-3'>
            {order.items.map((item, i) => (
              <div key={i} className='flex justify-between items-center'>
                <div className='flex items-center gap-2'>
                  <span className='w-6 h-6 bg-app-bg rounded-full flex items-center justify-center
                                   text-xs font-bold text-app-red'>
                    {item.quantity}
                  </span>
                  <span className='text-app-dark text-sm'>{item.name}</span>
                </div>
                <span className='text-app-muted text-sm font-medium'>
                  ₹{(item.quantity * item.price_at_time).toFixed(0)}
                </span>
              </div>
            ))}
          </div>
          <div className='mt-4 pt-4 border-t border-app-sand/40 flex justify-between items-center'>
            <span className='font-semibold text-app-muted text-sm'>Total</span>
            <span className='font-display font-bold text-app-dark text-xl'>₹{order.total.toFixed(0)}</span>
          </div>
        </div>

        {/* ── WhatsApp CTA ── */}
        {whatsapp_link && (
          <div className='bg-green-50 rounded-2xl p-5 border border-green-200 shadow-card'>
            <div className='flex items-start gap-3 mb-4'>
              <div className='w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center shrink-0'>
                <MessageCircle className='w-5 h-5 text-white' />
              </div>
              <div>
                <p className='font-semibold text-green-900 text-sm'>Notify via WhatsApp</p>
                <p className='text-green-700 text-xs mt-0.5'>
                  Send your order details directly to the café
                </p>
              </div>
            </div>

            {/* Message preview */}
            <div className='bg-white rounded-xl border border-green-100 px-4 py-3 mb-4 text-xs text-gray-700 leading-relaxed font-mono whitespace-pre-wrap break-words'>
              {decodeURIComponent(whatsapp_link.split('?text=')[1] ?? '')}
            </div>

            <a
              href={whatsapp_link}
              target='_blank'
              rel='noreferrer'
              className='flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700
                         text-white text-sm font-semibold px-5 py-3 rounded-2xl
                         transition-colors duration-200 w-full active:scale-95'
            >
              <MessageCircle className='w-4 h-4' />
              Open WhatsApp &amp; Send Order
            </a>

            {/* Copy link */}
            <div className='mt-3 flex items-center gap-2'>
              <p className='text-[11px] text-green-700 bg-white border border-green-200 rounded-xl px-3 py-2
                            flex-1 min-w-0 truncate font-mono'>
                {whatsapp_link}
              </p>
              <button
                onClick={copyLink}
                className='shrink-0 text-xs font-semibold px-3 py-2 rounded-xl bg-white border border-green-200
                           text-green-700 hover:bg-green-50 transition-colors flex items-center gap-1'
              >
                <Copy className='w-3 h-3' />
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>
        )}

        {/* ── Back to menu ── */}
        <button
          onClick={() => navigate('/')}
          className='w-full flex items-center justify-center gap-2 btn-primary py-4 text-sm font-semibold'
        >
          <ShoppingBag className='w-5 h-5' />
          Back to Menu
        </button>
      </div>
    </div>
  )
}
