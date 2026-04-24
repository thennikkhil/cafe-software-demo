import { useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import { TrendingUp, ShoppingCart, Star, RefreshCw } from 'lucide-react'

const API = import.meta.env.VITE_API_URL

function StatCard({ icon: Icon, label, value, sub, color }) {
  return (
    <div className='card flex items-start gap-4'>
      <div className={`p-3 rounded-xl ${color}`}>
        <Icon className='w-6 h-6' />
      </div>
      <div className='flex-1 min-w-0'>
        <p className='text-xs font-medium text-gray-500 uppercase tracking-wide'>{label}</p>
        <p className='text-2xl font-bold text-gray-900 mt-0.5'>{value}</p>
        {sub && <p className='text-xs text-gray-400 mt-0.5 truncate'>{sub}</p>}
      </div>
    </div>
  )
}

export default function Analytics() {
  const [data,    setData]    = useState(null)
  const [loading, setLoading] = useState(true)
  const [lastRefresh, setLastRefresh] = useState(new Date())

  const fetchStats = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await axios.get(`${API}/api/analytics`)
      setData(data)
      setLastRefresh(new Date())
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => {
    fetchStats()
    const interval = setInterval(fetchStats, 60_000)
    return () => clearInterval(interval)
  }, [fetchStats])

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <p className='text-sm text-gray-500'>
            Today — {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <button onClick={fetchStats} disabled={loading}
          className='btn-secondary flex items-center gap-2 text-sm'>
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {loading && !data ? (
        <div className='flex justify-center h-40 items-center'>
          <div className='w-8 h-8 border-4 border-primary-200 border-t-primary-800 rounded-full animate-spin' />
        </div>
      ) : (
        <div className='grid gap-5 md:grid-cols-3'>
          <StatCard
            icon={TrendingUp}
            label="Today's Revenue"
            value={`₹${data?.totalRevenue?.toFixed(0) ?? 0}`}
            sub='Total collected today'
            color='bg-green-50 text-green-600'
          />
          <StatCard
            icon={ShoppingCart}
            label='Orders Today'
            value={data?.orderCount ?? 0}
            sub='Orders placed since midnight'
            color='bg-blue-50 text-blue-600'
          />
          <StatCard
            icon={Star}
            label='Most Popular'
            value={data?.mostPopularItem?.name ?? '—'}
            sub={data?.mostPopularItem ? `${data.mostPopularItem.count} unit(s) sold` : 'No orders yet'}
            color='bg-amber-50 text-amber-600'
          />
        </div>
      )}

      {/* Last updated */}
      <p className='text-xs text-gray-400 text-right'>
        Last updated: {lastRefresh.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
        &nbsp;· Auto-refreshes every 60s
      </p>

      {/* Revenue breakdown placeholder */}
      <div className='card'>
        <h3 className='font-semibold text-gray-800 mb-4'>Quick Tips</h3>
        <ul className='space-y-2 text-sm text-gray-600'>
          <li className='flex items-start gap-2'>
            <span className='w-1.5 h-1.5 rounded-full bg-primary-500 mt-1.5 shrink-0' />
            Use the <strong>Orders</strong> page to manage live orders in real-time.
          </li>
          <li className='flex items-start gap-2'>
            <span className='w-1.5 h-1.5 rounded-full bg-primary-500 mt-1.5 shrink-0' />
            Toggle item availability from the <strong>Menu Manager</strong> to hide sold-out items.
          </li>
          <li className='flex items-start gap-2'>
            <span className='w-1.5 h-1.5 rounded-full bg-primary-500 mt-1.5 shrink-0' />
            Analytics reset at midnight each day.
          </li>
        </ul>
      </div>
    </div>
  )
}
