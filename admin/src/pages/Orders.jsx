import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import { io } from 'socket.io-client'
import {
  Phone, MessageCircle, Clock, CheckCircle2,
  ChefHat, PackageCheck, Bell,
} from 'lucide-react'

const API  = import.meta.env.VITE_API_URL
const SOCK = import.meta.env.VITE_SOCKET_URL

const STATUS_OPTIONS = ['pending', 'accepted', 'preparing', 'ready']
const STATUS_COLORS  = {
  pending:   'badge-pending',
  accepted:  'badge-accepted',
  preparing: 'badge-preparing',
  ready:     'badge-ready',
}
const STATUS_ICONS = {
  pending:   <Clock className='w-3 h-3' />,
  accepted:  <CheckCircle2 className='w-3 h-3' />,
  preparing: <ChefHat className='w-3 h-3' />,
  ready:     <PackageCheck className='w-3 h-3' />,
}

function formatTime(dateStr) {
  return new Date(dateStr).toLocaleTimeString('en-IN', {
    hour: '2-digit', minute: '2-digit', hour12: true,
  })
}
function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short',
  })
}

export default function Orders() {
  const [orders, setOrders]     = useState([])
  const [loading, setLoading]   = useState(true)
  const [toast, setToast]       = useState(null)
  const socketRef               = useRef(null)

  // ── Fetch initial orders ──────────────────────────────────────────────
  useEffect(() => {
    axios.get(`${API}/api/orders`)
      .then(r => setOrders(r.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  // ── Socket.io realtime ────────────────────────────────────────────────
  useEffect(() => {
    const socket = io(SOCK, { transports: ['websocket'] })
    socketRef.current = socket

    socket.on('new_order', (order) => {
      setOrders(prev => [order, ...prev])
      showToast(`🔔 New order from ${order.customer_name}!`)
    })

    socket.on('order_updated', (updated) => {
      setOrders(prev => prev.map(o => o._id === updated._id ? updated : o))
    })

    return () => socket.disconnect()
  }, [])

  function showToast(msg) {
    setToast(msg)
    setTimeout(() => setToast(null), 4000)
  }

  // ── Update order status ───────────────────────────────────────────────
  async function updateStatus(id, status) {
    try {
      await axios.patch(`${API}/api/orders/${id}/status`, { status })
    } catch (err) { console.error(err) }
  }

  // ── Toggle payment ────────────────────────────────────────────────────
  async function togglePayment(id) {
    try {
      await axios.patch(`${API}/api/orders/${id}/payment`)
    } catch (err) { console.error(err) }
  }

  if (loading) {
    return (
      <div className='flex items-center justify-center h-64'>
        <div className='w-8 h-8 border-4 border-primary-200 border-t-primary-800 rounded-full animate-spin' />
      </div>
    )
  }

  return (
    <div className='space-y-4'>
      {/* ── Toast ───────────────────────────────────────────────────────── */}
      {toast && (
        <div className='fixed top-5 right-5 z-50 bg-primary-800 text-white px-5 py-3 rounded-xl
                        shadow-lg flex items-center gap-2 animate-bounce'>
          <Bell className='w-4 h-4' />
          <span className='text-sm font-medium'>{toast}</span>
        </div>
      )}

      {/* ── Header stats ─────────────────────────────────────────────── */}
      <div className='flex items-center justify-between mb-6'>
        <div className='flex gap-3'>
          {STATUS_OPTIONS.map(s => {
            const count = orders.filter(o => o.status === s).length
            return (
              <div key={s} className={`${STATUS_COLORS[s]} flex items-center gap-1.5 !px-3 !py-1.5`}>
                {STATUS_ICONS[s]}
                <span className='capitalize'>{s}</span>
                <span className='font-bold'>({count})</span>
              </div>
            )
          })}
        </div>
        <p className='text-sm text-gray-500'>{orders.length} total orders</p>
      </div>

      {/* ── Orders list ───────────────────────────────────────────────── */}
      {orders.length === 0 ? (
        <div className='card text-center py-16 text-gray-400'>
          <PackageCheck className='w-12 h-12 mx-auto mb-3 opacity-30' />
          <p className='font-medium'>No orders yet</p>
        </div>
      ) : (
        <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-3'>
          {orders.map(order => (
            <OrderCard
              key={order._id}
              order={order}
              onStatusChange={updateStatus}
              onPaymentToggle={togglePayment}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function OrderCard({ order, onStatusChange, onPaymentToggle }) {
  const [status, setStatus]   = useState(order.status)
  const [payment, setPayment] = useState(order.payment_done)
  const [saving, setSaving]   = useState(false)

  // Sync when order updates via socket
  useEffect(() => { setStatus(order.status)       }, [order.status])
  useEffect(() => { setPayment(order.payment_done) }, [order.payment_done])

  async function handleStatusChange(e) {
    const newStatus = e.target.value
    setStatus(newStatus)
    setSaving(true)
    await onStatusChange(order._id, newStatus)
    setSaving(false)
  }

  async function handlePaymentToggle() {
    setPayment(p => !p)
    await onPaymentToggle(order._id)
  }

  return (
    <div className={`card transition-all duration-300 border-l-4 ${
      status === 'ready'     ? 'border-l-green-500' :
      status === 'preparing' ? 'border-l-orange-500' :
      status === 'accepted'  ? 'border-l-blue-500' :
                               'border-l-yellow-500'
    }`}>
      {/* Header */}
      <div className='flex items-start justify-between mb-3'>
        <div>
          <p className='font-semibold text-gray-900'>{order.customer_name}</p>
          <div className='flex items-center gap-1.5 mt-0.5'>
            <Phone className='w-3 h-3 text-gray-400' />
            <p className='text-xs text-gray-500'>{order.customer_phone}</p>
          </div>
        </div>
        <div className='text-right'>
          <p className='text-xs text-gray-400'>{formatDate(order.createdAt)}</p>
          <p className='text-xs text-gray-400'>{formatTime(order.createdAt)}</p>
        </div>
      </div>

      {/* Items */}
      <div className='bg-cream-100 rounded-lg p-3 mb-3 space-y-1'>
        {order.items.map((item, i) => (
          <div key={i} className='flex justify-between text-sm'>
            <span className='text-gray-700'>
              {item.quantity}× {item.name}
            </span>
            <span className='text-gray-500'>
              ₹{(item.quantity * item.price_at_time).toFixed(0)}
            </span>
          </div>
        ))}
        <div className='flex justify-between font-semibold text-sm pt-1 border-t border-cream-200 mt-1'>
          <span>Total</span>
          <span className='text-primary-800'>₹{order.total.toFixed(0)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className='space-y-2'>
        {/* Status dropdown */}
        <div className='flex items-center gap-2'>
          <label className='text-xs font-medium text-gray-500 w-14 shrink-0'>Status</label>
          <select
            value={status}
            onChange={handleStatusChange}
            disabled={saving}
            className='flex-1 border border-gray-200 rounded-lg px-2 py-1.5 text-xs
                       focus:outline-none focus:ring-2 focus:ring-primary-400 bg-white capitalize'
          >
            {STATUS_OPTIONS.map(s => (
              <option key={s} value={s} className='capitalize'>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
          {saving && <div className='w-3 h-3 border-2 border-primary-400 border-t-transparent rounded-full animate-spin' />}
        </div>

        {/* Payment toggle + WhatsApp */}
        <div className='flex items-center justify-between'>
          <button
            onClick={handlePaymentToggle}
            className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-all ${
              payment
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <CheckCircle2 className='w-3 h-3' />
            {payment ? 'Paid ✓' : 'Mark Paid'}
          </button>

          {order.whatsapp_link && (
            <a
              href={order.whatsapp_link}
              target='_blank'
              rel='noreferrer'
              className='flex items-center gap-1.5 text-xs font-medium px-3 py-1.5
                         bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors'
            >
              <MessageCircle className='w-3 h-3' />
              WhatsApp
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
