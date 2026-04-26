import { useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import {
  TrendingUp, ShoppingCart, Star, RefreshCw,
  Trophy, Users, BarChart3, Calendar,
} from 'lucide-react'

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

const MEDALS = ['🥇', '🥈', '🥉']

export default function Analytics() {
  const [data,        setData]        = useState(null)
  const [loading,     setLoading]     = useState(true)
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

  // Chart max
  const maxRevenue = data?.dailyRevenue?.length
    ? Math.max(...data.dailyRevenue.map(d => d.revenue), 1)
    : 1
  const maxItemQty = data?.topItems?.length
    ? Math.max(...data.topItems.map(i => i.qty), 1)
    : 1

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <p className='text-sm text-gray-500'>
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
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
        <>
          {/* ── Today's stats ──────────────────────────────────────────────── */}
          <div>
            <h2 className='text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3'>Today</h2>
            <div className='grid gap-4 md:grid-cols-3'>
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
                label="Today's Top Item"
                value={data?.mostPopularItem?.name ?? '—'}
                sub={data?.mostPopularItem ? `${data.mostPopularItem.count} unit(s) sold today` : 'No orders yet'}
                color='bg-amber-50 text-amber-600'
              />
            </div>
          </div>

          {/* ── All-time stats ──────────────────────────────────────────────── */}
          <div>
            <h2 className='text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3'>All Time</h2>
            <div className='grid gap-4 md:grid-cols-2'>
              <StatCard
                icon={TrendingUp}
                label='Total Revenue'
                value={`₹${(data?.totalAllTimeRevenue ?? 0).toLocaleString('en-IN')}`}
                sub='Across all orders ever'
                color='bg-emerald-50 text-emerald-600'
              />
              <StatCard
                icon={Users}
                label='Total Orders'
                value={data?.totalAllTimeOrders ?? 0}
                sub='All orders in the system'
                color='bg-violet-50 text-violet-600'
              />
            </div>
          </div>

          {/* ── 7-day revenue chart ──────────────────────────────────────────── */}
          <div className='card'>
            <div className='flex items-center gap-2 mb-5'>
              <Calendar className='w-4 h-4 text-primary-600' />
              <h3 className='font-semibold text-gray-800'>Revenue — Last 7 Days</h3>
            </div>
            <div className='flex items-end gap-2 h-36'>
              {(data?.dailyRevenue ?? []).map((day, i) => {
                const pct = maxRevenue > 0 ? (day.revenue / maxRevenue) * 100 : 0
                return (
                  <div key={i} className='flex-1 flex flex-col items-center gap-1.5 group relative'>
                    {/* Tooltip */}
                    <div className='absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none'>
                      ₹{day.revenue.toLocaleString('en-IN')} · {day.orders} order{day.orders !== 1 ? 's' : ''}
                    </div>
                    {/* Bar */}
                    <div className='w-full relative flex items-end' style={{ height: '120px' }}>
                      <div
                        className={`w-full rounded-t-lg transition-all duration-500 ${
                          i === 6 ? 'bg-primary-700' : 'bg-primary-200'
                        } group-hover:bg-primary-500`}
                        style={{ height: `${Math.max(pct, 3)}%` }}
                      />
                    </div>
                    <p className='text-[10px] text-gray-500 text-center leading-tight'>{day.date}</p>
                  </div>
                )
              })}
            </div>
          </div>

          {/* ── Item leaderboard + Top customers ──────────────────────────────── */}
          <div className='grid gap-6 lg:grid-cols-2'>
            {/* Item leaderboard */}
            <div className='card'>
              <div className='flex items-center gap-2 mb-4'>
                <Trophy className='w-4 h-4 text-amber-500' />
                <h3 className='font-semibold text-gray-800'>Most Loved Items</h3>
                <span className='ml-auto text-[10px] text-gray-400 uppercase tracking-wide'>All Time</span>
              </div>
              {!data?.topItems?.length ? (
                <p className='text-sm text-gray-400 italic'>No data yet</p>
              ) : (
                <div className='space-y-3'>
                  {data.topItems.map((item, i) => {
                    const pct = (item.qty / maxItemQty) * 100
                    return (
                      <div key={item.name} className='group'>
                        <div className='flex items-center justify-between mb-1'>
                          <div className='flex items-center gap-2'>
                            <span className='text-sm w-5 text-center'>
                              {i < 3 ? MEDALS[i] : <span className='text-xs font-bold text-gray-300'>#{i+1}</span>}
                            </span>
                            <span className='text-sm font-medium text-gray-800 truncate max-w-[160px]'>{item.name}</span>
                          </div>
                          <div className='flex items-center gap-3 text-right shrink-0'>
                            <span className='text-xs text-gray-400'>{item.qty} sold</span>
                            <span className='text-xs font-semibold text-emerald-600'>₹{item.revenue.toLocaleString('en-IN')}</span>
                          </div>
                        </div>
                        {/* Bar */}
                        <div className='h-1.5 bg-gray-100 rounded-full overflow-hidden'>
                          <div
                            className={`h-full rounded-full transition-all duration-700 ${
                              i === 0 ? 'bg-amber-400' :
                              i === 1 ? 'bg-gray-400' :
                              i === 2 ? 'bg-amber-700' :
                              'bg-primary-400'
                            }`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Top customers */}
            <div className='card'>
              <div className='flex items-center gap-2 mb-4'>
                <Users className='w-4 h-4 text-violet-500' />
                <h3 className='font-semibold text-gray-800'>Top Customers</h3>
                <span className='ml-auto text-[10px] text-gray-400 uppercase tracking-wide'>By Spend</span>
              </div>
              {!data?.topCustomers?.length ? (
                <p className='text-sm text-gray-400 italic'>No data yet</p>
              ) : (
                <div className='space-y-3'>
                  {data.topCustomers.map((c, i) => {
                    const initials = c.name.trim().split(' ').map(w => w[0]).slice(0,2).join('').toUpperCase()
                    const colors = ['bg-violet-500','bg-blue-500','bg-emerald-500','bg-amber-500','bg-rose-500']
                    return (
                      <div key={c.phone} className='flex items-center gap-3'>
                        <span className='text-sm w-5 text-center'>
                          {i < 3 ? MEDALS[i] : <span className='text-xs font-bold text-gray-300'>#{i+1}</span>}
                        </span>
                        <div className={`w-8 h-8 ${colors[i % colors.length]} rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0`}>
                          {initials}
                        </div>
                        <div className='flex-1 min-w-0'>
                          <p className='text-sm font-medium text-gray-800 truncate'>{c.name}</p>
                          <p className='text-xs text-gray-400'>{c.orders} order{c.orders !== 1 ? 's' : ''}</p>
                        </div>
                        <p className='font-bold text-emerald-600 text-sm shrink-0'>
                          ₹{c.spend.toLocaleString('en-IN')}
                        </p>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Last updated */}
      <p className='text-xs text-gray-400 text-right'>
        Last updated: {lastRefresh.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
        &nbsp;· Auto-refreshes every 60s
      </p>
    </div>
  )
}
