import { useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import {
  Users, Search, Phone, TrendingUp, ShoppingBag,
  Calendar, ChevronDown, ChevronUp, RefreshCw, Star,
} from 'lucide-react'

const API = import.meta.env.VITE_API_URL

function formatDate(d) {
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}
function formatTime(d) {
  return new Date(d).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
}
function timeSince(d) {
  const diff = Date.now() - new Date(d).getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  return `${days} days ago`
}

function Avatar({ name, size = 'md' }) {
  const initials = name.trim().split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
  const colors = [
    'bg-violet-500', 'bg-blue-500', 'bg-emerald-500', 'bg-amber-500',
    'bg-rose-500', 'bg-cyan-500', 'bg-indigo-500', 'bg-pink-500',
  ]
  const color = colors[initials.charCodeAt(0) % colors.length]
  const sizeClass = size === 'lg' ? 'w-12 h-12 text-base' : 'w-9 h-9 text-sm'
  return (
    <div className={`${sizeClass} ${color} rounded-full flex items-center justify-center font-bold text-white shrink-0`}>
      {initials}
    </div>
  )
}

export default function Customers() {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading]     = useState(true)
  const [search, setSearch]       = useState('')
  const [sortBy, setSortBy]       = useState('spend') // spend | orders | recent

  const fetchCustomers = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await axios.get(`${API}/api/customers`)
      setCustomers(data)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchCustomers() }, [fetchCustomers])

  const filtered = customers
    .filter(c =>
      c.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      c.customer_phone.includes(search)
    )
    .sort((a, b) => {
      if (sortBy === 'spend')  return b.totalSpend  - a.totalSpend
      if (sortBy === 'orders') return b.orderCount  - a.orderCount
      return new Date(b.lastOrderAt) - new Date(a.lastOrderAt)
    })

  const repeatCount = customers.filter(c => c.orderCount > 1).length

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between flex-wrap gap-3'>
        <div>
          <p className='text-sm text-gray-500'>
            {customers.length} unique customers · {repeatCount} repeat visitors
          </p>
        </div>
        <button onClick={fetchCustomers} disabled={loading}
          className='btn-secondary flex items-center gap-2 text-sm'>
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Summary stat row */}
      <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
        <StatMini label='Total Customers' value={customers.length} icon={Users} color='bg-violet-50 text-violet-600' />
        <StatMini
          label='Repeat Visitors'
          value={repeatCount}
          icon={Star}
          color='bg-amber-50 text-amber-600'
        />
        <StatMini
          label='Total Orders'
          value={customers.reduce((s,c) => s + c.orderCount, 0)}
          icon={ShoppingBag}
          color='bg-blue-50 text-blue-600'
        />
        <StatMini
          label='Total Revenue'
          value={`₹${customers.reduce((s,c) => s + c.totalSpend, 0).toLocaleString('en-IN')}`}
          icon={TrendingUp}
          color='bg-emerald-50 text-emerald-600'
        />
      </div>

      {/* Search + Sort */}
      <div className='flex flex-col sm:flex-row gap-3'>
        <div className='relative flex-1'>
          <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400' />
          <input
            type='text'
            placeholder='Search by name or phone…'
            value={search}
            onChange={e => setSearch(e.target.value)}
            className='input pl-9'
          />
        </div>
        <div className='flex gap-2 shrink-0'>
          {[
            { key: 'spend',  label: 'Top Spenders' },
            { key: 'orders', label: 'Most Orders' },
            { key: 'recent', label: 'Most Recent' },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setSortBy(key)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                sortBy === key
                  ? 'bg-primary-800 text-white shadow-sm'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-cream-100'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className='flex justify-center h-48 items-center'>
          <div className='w-8 h-8 border-4 border-primary-200 border-t-primary-800 rounded-full animate-spin' />
        </div>
      ) : filtered.length === 0 ? (
        <div className='card text-center py-16 text-gray-400'>
          <Users className='w-12 h-12 mx-auto mb-3 opacity-30' />
          <p className='font-medium'>{search ? 'No customers match your search' : 'No customer data yet'}</p>
          <p className='text-sm mt-1'>Customers appear here automatically as orders come in</p>
        </div>
      ) : (
        <div className='space-y-3'>
          {filtered.map((customer, idx) => (
            <CustomerRow key={customer.customer_phone} customer={customer} rank={idx + 1} />
          ))}
        </div>
      )}
    </div>
  )
}

function StatMini({ label, value, icon: Icon, color }) {
  return (
    <div className='card flex items-center gap-3 !p-4'>
      <div className={`p-2.5 rounded-xl ${color}`}>
        <Icon className='w-5 h-5' />
      </div>
      <div>
        <p className='text-xs text-gray-500 font-medium uppercase tracking-wide'>{label}</p>
        <p className='text-xl font-bold text-gray-900'>{value}</p>
      </div>
    </div>
  )
}

function CustomerRow({ customer, rank }) {
  const [expanded, setExpanded] = useState(false)
  const isRepeat = customer.orderCount > 1

  function formatDate(d) {
    return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  return (
    <div className='card !p-0 overflow-hidden'>
      {/* Main row */}
      <div className='flex items-center gap-4 p-4'>
        {/* Rank */}
        <span className={`text-xs font-bold w-6 text-center shrink-0 ${
          rank === 1 ? 'text-amber-500' : rank === 2 ? 'text-gray-400' : rank === 3 ? 'text-amber-700' : 'text-gray-300'
        }`}>
          {rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`}
        </span>

        {/* Avatar */}
        <Avatar name={customer.customer_name} />

        {/* Info */}
        <div className='flex-1 min-w-0'>
          <div className='flex items-center gap-2 flex-wrap'>
            <p className='font-semibold text-gray-900 truncate'>{customer.customer_name}</p>
            {isRepeat && (
              <span className='inline-flex items-center gap-1 bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full'>
                <Star className='w-2.5 h-2.5' /> Repeat
              </span>
            )}
          </div>
          <div className='flex items-center gap-1.5 mt-0.5'>
            <Phone className='w-3 h-3 text-gray-400' />
            <p className='text-xs text-gray-500'>{customer.customer_phone}</p>
          </div>
        </div>

        {/* Stats */}
        <div className='hidden md:flex items-center gap-6 text-right shrink-0'>
          <div>
            <p className='text-xs text-gray-400 uppercase tracking-wide font-medium'>Orders</p>
            <p className='font-bold text-gray-900'>{customer.orderCount}</p>
          </div>
          <div>
            <p className='text-xs text-gray-400 uppercase tracking-wide font-medium'>Total Spend</p>
            <p className='font-bold text-emerald-600'>₹{customer.totalSpend.toLocaleString('en-IN')}</p>
          </div>
          <div>
            <p className='text-xs text-gray-400 uppercase tracking-wide font-medium'>Last Visit</p>
            <p className='font-bold text-gray-700 text-sm'>{timeSince(customer.lastOrderAt)}</p>
          </div>
        </div>

        {/* Expand toggle */}
        <button
          onClick={() => setExpanded(v => !v)}
          className='ml-2 p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors shrink-0'
        >
          {expanded ? <ChevronUp className='w-4 h-4' /> : <ChevronDown className='w-4 h-4' />}
        </button>
      </div>

      {/* Mobile stats */}
      <div className='flex md:hidden items-center gap-4 px-4 pb-3 text-sm'>
        <span className='text-gray-500'>{customer.orderCount} order{customer.orderCount !== 1 ? 's' : ''}</span>
        <span className='text-gray-300'>·</span>
        <span className='font-semibold text-emerald-600'>₹{customer.totalSpend.toLocaleString('en-IN')}</span>
        <span className='text-gray-300'>·</span>
        <span className='text-gray-500'>{timeSince(customer.lastOrderAt)}</span>
      </div>

      {/* Expanded order history */}
      {expanded && (
        <div className='border-t border-gray-100 bg-gray-50 px-4 py-3'>
          <div className='flex items-center gap-2 mb-3'>
            <Calendar className='w-3.5 h-3.5 text-gray-400' />
            <p className='text-xs font-semibold text-gray-600 uppercase tracking-wide'>
              Order History · First visit {formatDate(customer.firstOrderAt)}
            </p>
          </div>
          <div className='space-y-2'>
            {[...customer.orders]
              .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
              .map(order => (
                <div key={order._id} className='flex items-center justify-between bg-white rounded-lg px-3 py-2 shadow-sm border border-gray-100'>
                  <div className='flex items-center gap-3'>
                    <div>
                      <p className='text-xs font-medium text-gray-700'>{formatDate(order.createdAt)}</p>
                      <p className='text-[10px] text-gray-400'>{formatTime(order.createdAt)} · {order.itemCount} item{order.itemCount !== 1 ? 's' : ''}</p>
                    </div>
                  </div>
                  <div className='flex items-center gap-3'>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${
                      order.status === 'ready'     ? 'bg-green-100 text-green-700' :
                      order.status === 'preparing' ? 'bg-orange-100 text-orange-700' :
                      order.status === 'accepted'  ? 'bg-blue-100 text-blue-700' :
                                                     'bg-yellow-100 text-yellow-700'
                    }`}>{order.status}</span>
                    <span className='font-bold text-gray-900 text-sm'>₹{order.total.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  )
}
