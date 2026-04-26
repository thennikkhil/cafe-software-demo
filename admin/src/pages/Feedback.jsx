import { useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import { MessageSquare, Star, RefreshCw, Trash2, Filter, Phone, Clock } from 'lucide-react'

const API = import.meta.env.VITE_API_URL

function StarRating({ rating, size = 'sm' }) {
  const sz = size === 'lg' ? 'w-5 h-5' : 'w-3.5 h-3.5'
  return (
    <div className='flex items-center gap-0.5'>
      {[1,2,3,4,5].map(n => (
        <Star
          key={n}
          className={`${sz} ${n <= rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200 fill-gray-200'}`}
        />
      ))}
    </div>
  )
}

function formatDate(d) {
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}
function formatTime(d) {
  return new Date(d).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
}

export default function Feedback() {
  const [items,    setItems]    = useState([])
  const [loading,  setLoading]  = useState(true)
  const [filter,   setFilter]   = useState(0) // 0 = all, 1-5 = rating filter

  const fetchFeedback = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await axios.get(`${API}/api/feedback`)
      setItems(data)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchFeedback() }, [fetchFeedback])

  async function handleDelete(id) {
    if (!window.confirm('Remove this feedback entry?')) return
    try {
      await axios.delete(`${API}/api/feedback/${id}`)
      setItems(prev => prev.filter(f => f._id !== id))
    } catch (err) { console.error(err) }
  }

  const filtered = filter === 0 ? items : items.filter(f => f.rating === filter)
  const avgRating = items.length ? (items.reduce((s, f) => s + f.rating, 0) / items.length) : 0

  // Distribution counts
  const dist = [5,4,3,2,1].map(r => ({
    rating: r,
    count:  items.filter(f => f.rating === r).length,
    pct:    items.length ? (items.filter(f => f.rating === r).length / items.length) * 100 : 0,
  }))

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <p className='text-sm text-gray-500'>
          {items.length} review{items.length !== 1 ? 's' : ''} received
        </p>
        <button onClick={fetchFeedback} disabled={loading}
          className='btn-secondary flex items-center gap-2 text-sm'>
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Summary cards */}
      {items.length > 0 && (
        <div className='grid gap-4 md:grid-cols-2'>
          {/* Avg rating */}
          <div className='card flex items-center gap-5'>
            <div className='text-center'>
              <p className='text-5xl font-black text-gray-900'>{avgRating.toFixed(1)}</p>
              <StarRating rating={Math.round(avgRating)} size='lg' />
              <p className='text-xs text-gray-400 mt-1'>Average rating</p>
            </div>
            <div className='flex-1 space-y-1.5'>
              {dist.map(({ rating, count, pct }) => (
                <div key={rating} className='flex items-center gap-2'>
                  <span className='text-xs font-medium text-gray-600 w-3 shrink-0'>{rating}</span>
                  <Star className='w-3 h-3 fill-amber-400 text-amber-400 shrink-0' />
                  <div className='flex-1 h-2 bg-gray-100 rounded-full overflow-hidden'>
                    <div
                      className='h-full bg-amber-400 rounded-full transition-all duration-700'
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className='text-[10px] text-gray-400 w-4 text-right shrink-0'>{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick stats */}
          <div className='card grid grid-cols-2 gap-4'>
            <div className='flex flex-col items-center justify-center p-3 bg-green-50 rounded-xl'>
              <p className='text-2xl font-black text-green-600'>{items.filter(f => f.rating >= 4).length}</p>
              <p className='text-xs text-green-600 font-medium mt-0.5'>Positive (4–5★)</p>
            </div>
            <div className='flex flex-col items-center justify-center p-3 bg-amber-50 rounded-xl'>
              <p className='text-2xl font-black text-amber-600'>{items.filter(f => f.rating === 3).length}</p>
              <p className='text-xs text-amber-600 font-medium mt-0.5'>Neutral (3★)</p>
            </div>
            <div className='flex flex-col items-center justify-center p-3 bg-red-50 rounded-xl'>
              <p className='text-2xl font-black text-red-500'>{items.filter(f => f.rating <= 2).length}</p>
              <p className='text-xs text-red-500 font-medium mt-0.5'>Negative (1–2★)</p>
            </div>
            <div className='flex flex-col items-center justify-center p-3 bg-violet-50 rounded-xl'>
              <p className='text-2xl font-black text-violet-600'>
                {new Set(items.map(f => f.customer_phone)).size}
              </p>
              <p className='text-xs text-violet-600 font-medium mt-0.5'>Unique Reviewers</p>
            </div>
          </div>
        </div>
      )}

      {/* Filter bar */}
      <div className='flex items-center gap-2 flex-wrap'>
        <Filter className='w-4 h-4 text-gray-400 shrink-0' />
        <span className='text-xs text-gray-500 font-medium'>Filter:</span>
        {[0,5,4,3,2,1].map(r => (
          <button
            key={r}
            onClick={() => setFilter(r)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              filter === r
                ? 'bg-primary-800 text-white shadow-sm'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-cream-100'
            }`}
          >
            {r === 0 ? 'All Reviews' : (
              <>
                <Star className={`w-3 h-3 ${filter === r ? 'fill-amber-300 text-amber-300' : 'fill-amber-400 text-amber-400'}`} />
                {r}★
              </>
            )}
          </button>
        ))}
        {filter !== 0 && (
          <span className='text-xs text-gray-400 ml-1'>{filtered.length} result{filtered.length !== 1 ? 's' : ''}</span>
        )}
      </div>

      {/* Feedback list */}
      {loading ? (
        <div className='flex justify-center h-48 items-center'>
          <div className='w-8 h-8 border-4 border-primary-200 border-t-primary-800 rounded-full animate-spin' />
        </div>
      ) : filtered.length === 0 ? (
        <div className='card text-center py-16 text-gray-400'>
          <MessageSquare className='w-12 h-12 mx-auto mb-3 opacity-30' />
          <p className='font-medium'>{filter ? `No ${filter}-star reviews yet` : 'No feedback yet'}</p>
          <p className='text-sm mt-1'>Customer reviews will appear here</p>
        </div>
      ) : (
        <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-3'>
          {filtered.map(fb => (
            <FeedbackCard key={fb._id} fb={fb} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  )
}

function FeedbackCard({ fb, onDelete }) {
  const sentiment =
    fb.rating >= 4 ? { bar: 'bg-green-500', bg: 'bg-green-50', border: 'border-l-green-500' } :
    fb.rating === 3 ? { bar: 'bg-amber-400', bg: 'bg-amber-50', border: 'border-l-amber-400' } :
                     { bar: 'bg-red-400',   bg: 'bg-red-50',   border: 'border-l-red-400'   }

  const initials = fb.customer_name.trim().split(' ').map(w => w[0]).slice(0,2).join('').toUpperCase()
  const colors   = ['bg-violet-500','bg-blue-500','bg-emerald-500','bg-amber-500','bg-rose-500']
  const avatarColor = colors[initials.charCodeAt(0) % colors.length]

  return (
    <div className={`card border-l-4 ${sentiment.border} !p-0 overflow-hidden group`}>
      {/* Sentiment bar */}
      <div className={`h-1 ${sentiment.bar} w-full`} />

      <div className='p-4 space-y-3'>
        {/* Customer */}
        <div className='flex items-start justify-between gap-2'>
          <div className='flex items-center gap-2.5'>
            <div className={`w-9 h-9 ${avatarColor} rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0`}>
              {initials}
            </div>
            <div>
              <p className='font-semibold text-gray-900 text-sm'>{fb.customer_name}</p>
              <div className='flex items-center gap-1 mt-0.5'>
                <Phone className='w-2.5 h-2.5 text-gray-400' />
                <p className='text-[10px] text-gray-400'>{fb.customer_phone}</p>
              </div>
            </div>
          </div>
          <button
            onClick={() => onDelete(fb._id)}
            className='opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 shrink-0'
            title='Remove feedback'
          >
            <Trash2 className='w-3.5 h-3.5' />
          </button>
        </div>

        {/* Stars */}
        <StarRating rating={fb.rating} size='sm' />

        {/* Message */}
        {fb.message && (
          <p className='text-sm text-gray-700 leading-relaxed italic'>"{fb.message}"</p>
        )}

        {/* Timestamp */}
        <div className='flex items-center gap-1.5 pt-1 border-t border-gray-100'>
          <Clock className='w-2.5 h-2.5 text-gray-400' />
          <p className='text-[10px] text-gray-400'>
            {formatDate(fb.createdAt)} at {formatTime(fb.createdAt)}
          </p>
        </div>
      </div>
    </div>
  )
}
