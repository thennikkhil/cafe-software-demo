import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import {
  Plus, Pencil, Trash2, UploadCloud, X, Check,
  ImageIcon, ToggleLeft, ToggleRight, Search, Tag,
} from 'lucide-react'

const API = import.meta.env.VITE_API_URL

const EMPTY_FORM = {
  name: '', description: '', price: '', category: '', image_url: '', is_available: true,
}

export default function Menu() {
  const [items,      setItems]      = useState([])
  const [categories, setCategories] = useState([])
  const [loading,    setLoading]    = useState(true)
  const [modal,      setModal]      = useState(false)   // 'add' | 'edit' | false
  const [editId,     setEditId]     = useState(null)
  const [form,       setForm]       = useState(EMPTY_FORM)
  const [uploading,  setUploading]  = useState(false)
  const [saving,     setSaving]     = useState(false)
  const [filter,     setFilter]     = useState('All')
  const [search,     setSearch]     = useState('')
  const [newCatName, setNewCatName] = useState('')
  const [addingCat,  setAddingCat]  = useState(false)
  const [showNewCat, setShowNewCat] = useState(false)
  const fileRef = useRef()

  useEffect(() => {
    Promise.all([fetchItems(), fetchCategories()])
  }, [])

  async function fetchItems() {
    try {
      const { data } = await axios.get(`${API}/api/menu`)
      setItems(data)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  async function fetchCategories() {
    try {
      const { data } = await axios.get(`${API}/api/categories`)
      setCategories(data)
    } catch (err) { console.error(err) }
  }

  // ── Auto-upload image ─────────────────────────────────────────────────
  async function handleFileChange(e) {
    const file = e.target.files[0]
    if (!file) return
    const fd = new FormData()
    fd.append('image', file)
    setUploading(true)
    try {
      const { data } = await axios.post(`${API}/api/upload`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setForm(f => ({ ...f, image_url: data.secure_url }))
    } catch (err) {
      alert('Image upload failed: ' + (err.response?.data?.error ?? err.message))
    } finally { setUploading(false) }
  }

  function openAdd() {
    setForm(EMPTY_FORM); setEditId(null); setModal('add'); setShowNewCat(false)
  }
  function openEdit(item) {
    setForm({ ...item, price: String(item.price) })
    setEditId(item._id)
    setModal('edit')
    setShowNewCat(false)
  }
  function closeModal() { setModal(false); setForm(EMPTY_FORM); setShowNewCat(false); setNewCatName('') }

  async function handleSave(e) {
    e.preventDefault()
    if (!form.name || !form.price || !form.category) return
    setSaving(true)
    try {
      const payload = { ...form, price: parseFloat(form.price) }
      if (modal === 'add') {
        const { data } = await axios.post(`${API}/api/menu`, payload)
        setItems(prev => [data, ...prev])
      } else {
        const { data } = await axios.put(`${API}/api/menu/${editId}`, payload)
        setItems(prev => prev.map(i => i._id === editId ? data : i))
      }
      closeModal()
    } catch (err) {
      alert('Save failed: ' + (err.response?.data?.error ?? err.message))
    } finally { setSaving(false) }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this item?')) return
    try {
      await axios.delete(`${API}/api/menu/${id}`)
      setItems(prev => prev.filter(i => i._id !== id))
    } catch (err) { console.error(err) }
  }

  async function toggleAvail(item) {
    try {
      const { data } = await axios.put(`${API}/api/menu/${item._id}`, {
        is_available: !item.is_available,
      })
      setItems(prev => prev.map(i => i._id === item._id ? data : i))
    } catch (err) { console.error(err) }
  }

  // ── Add new category inline ────────────────────────────────────────────
  async function handleAddCategory(e) {
    e.preventDefault()
    if (!newCatName.trim()) return
    setAddingCat(true)
    try {
      const { data } = await axios.post(`${API}/api/categories`, { name: newCatName.trim() })
      setCategories(prev => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)))
      setForm(f => ({ ...f, category: data.name }))
      setNewCatName('')
      setShowNewCat(false)
    } catch (err) {
      alert(err.response?.data?.error ?? 'Failed to add category.')
    } finally { setAddingCat(false) }
  }

  // ── Derived state ─────────────────────────────────────────────────────
  const allCategoryNames = ['All', ...categories.map(c => c.name)]
  const filtered = items
    .filter(i => filter === 'All' || i.category === filter)
    .filter(i => i.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <div>
      {/* ── Toolbar ─────────────────────────────────────────────── */}
      <div className='flex flex-wrap items-center gap-3 mb-6'>
        {/* Search */}
        <div className='relative flex-1 min-w-48'>
          <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400' />
          <input
            className='input pl-9'
            placeholder='Search items…'
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        {/* Category filter tabs */}
        <div className='flex gap-1 flex-wrap'>
          {allCategoryNames.map(c => (
            <button
              key={c}
              onClick={() => setFilter(c)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filter === c
                  ? 'bg-primary-800 text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-primary-400'
              }`}
            >{c}</button>
          ))}
        </div>
        <button onClick={openAdd} className='btn-primary flex items-center gap-2 ml-auto'>
          <Plus className='w-4 h-4' /> Add Item
        </button>
      </div>

      {/* ── Table ───────────────────────────────────────────────── */}
      {loading ? (
        <div className='flex justify-center h-40 items-center'>
          <div className='w-8 h-8 border-4 border-primary-200 border-t-primary-800 rounded-full animate-spin' />
        </div>
      ) : filtered.length === 0 ? (
        <div className='card text-center py-16 text-gray-400'>No items found.</div>
      ) : (
        <div className='card overflow-hidden p-0'>
          <table className='w-full text-sm'>
            <thead>
              <tr className='bg-cream-100 border-b border-gray-100'>
                <th className='text-left px-5 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide'>Item</th>
                <th className='text-left px-5 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide'>Category</th>
                <th className='text-left px-5 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide'>Price</th>
                <th className='text-left px-5 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide'>Available</th>
                <th className='px-5 py-3' />
              </tr>
            </thead>
            <tbody className='divide-y divide-gray-50'>
              {filtered.map(item => (
                <tr key={item._id} className='hover:bg-cream-50 transition-colors'>
                  <td className='px-5 py-3'>
                    <div className='flex items-center gap-3'>
                      {item.image_url ? (
                        <img src={item.image_url} alt={item.name}
                          className='w-10 h-10 rounded-lg object-cover border border-gray-100' />
                      ) : (
                        <div className='w-10 h-10 rounded-lg bg-cream-200 flex items-center justify-center'>
                          <ImageIcon className='w-4 h-4 text-gray-400' />
                        </div>
                      )}
                      <div>
                        <p className='font-medium text-gray-900'>{item.name}</p>
                        <p className='text-xs text-gray-400 line-clamp-1'>{item.description}</p>
                      </div>
                    </div>
                  </td>
                  <td className='px-5 py-3'>
                    <span className='bg-cream-200 text-primary-800 text-xs font-medium px-2 py-1 rounded-full'>
                      {item.category}
                    </span>
                  </td>
                  <td className='px-5 py-3 font-semibold text-gray-900'>₹{item.price}</td>
                  <td className='px-5 py-3'>
                    <button onClick={() => toggleAvail(item)} className='text-gray-400 hover:text-primary-700 transition-colors'>
                      {item.is_available
                        ? <ToggleRight className='w-6 h-6 text-green-500' />
                        : <ToggleLeft  className='w-6 h-6' />}
                    </button>
                  </td>
                  <td className='px-5 py-3'>
                    <div className='flex items-center justify-end gap-2'>
                      <button onClick={() => openEdit(item)}
                        className='p-1.5 rounded-lg hover:bg-primary-50 text-gray-400 hover:text-primary-700 transition-colors'>
                        <Pencil className='w-4 h-4' />
                      </button>
                      <button onClick={() => handleDelete(item._id)}
                        className='p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors'>
                        <Trash2 className='w-4 h-4' />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Add/Edit Modal ───────────────────────────────────────── */}
      {modal && (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm'>
          <div className='bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto'>
            {/* Modal header */}
            <div className='flex items-center justify-between px-6 py-4 border-b'>
              <h2 className='font-semibold text-gray-900'>
                {modal === 'add' ? 'Add New Item' : 'Edit Item'}
              </h2>
              <button onClick={closeModal} className='p-1 rounded-lg hover:bg-gray-100 transition-colors'>
                <X className='w-5 h-5 text-gray-500' />
              </button>
            </div>

            <form onSubmit={handleSave} className='px-6 py-5 space-y-4'>
              {/* Image upload */}
              <div>
                <label className='block text-xs font-semibold text-gray-600 mb-1'>
                  Photo <span className='font-normal text-gray-400'>(auto-uploads to Cloudinary)</span>
                </label>
                <div className='flex gap-3 items-start'>
                  {/* Preview */}
                  <div className='w-20 h-20 rounded-xl border-2 border-dashed border-gray-200 overflow-hidden
                                  flex items-center justify-center bg-cream-100 shrink-0'>
                    {form.image_url ? (
                      <img src={form.image_url} alt='preview'
                        className='w-full h-full object-cover' />
                    ) : uploading ? (
                      <div className='w-5 h-5 border-2 border-primary-400 border-t-transparent rounded-full animate-spin' />
                    ) : (
                      <ImageIcon className='w-6 h-6 text-gray-300' />
                    )}
                  </div>
                  <div className='flex-1 space-y-2'>
                    <button type='button'
                      onClick={() => fileRef.current.click()}
                      disabled={uploading}
                      className='btn-secondary text-xs w-full flex items-center justify-center gap-2'>
                      <UploadCloud className='w-4 h-4' />
                      {uploading ? 'Uploading…' : 'Select Image'}
                    </button>
                    <input
                      ref={fileRef}
                      type='file'
                      accept='image/*'
                      className='hidden'
                      onChange={handleFileChange}
                    />
                    <input
                      type='url'
                      className='input text-xs'
                      placeholder='Or paste image URL'
                      value={form.image_url}
                      onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))}
                    />
                  </div>
                </div>
              </div>

              {/* Name */}
              <div>
                <label className='block text-xs font-semibold text-gray-600 mb-1'>Name *</label>
                <input required className='input' placeholder='e.g. Masala Chai'
                  value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>

              {/* Description */}
              <div>
                <label className='block text-xs font-semibold text-gray-600 mb-1'>Description</label>
                <textarea rows={2} className='input resize-none' placeholder='Short description…'
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              </div>

              {/* Price + Category */}
              <div className='grid grid-cols-2 gap-3'>
                <div>
                  <label className='block text-xs font-semibold text-gray-600 mb-1'>Price (₹) *</label>
                  <input required type='number' min='0' step='0.01' className='input'
                    placeholder='0.00' value={form.price}
                    onChange={e => setForm(f => ({ ...f, price: e.target.value }))} />
                </div>
                <div>
                  <label className='block text-xs font-semibold text-gray-600 mb-1'>
                    Category *
                  </label>
                  {showNewCat ? (
                    /* Inline add new category */
                    <form onSubmit={handleAddCategory} className='flex gap-1'>
                      <input
                        autoFocus
                        type='text'
                        className='input text-xs flex-1 min-w-0'
                        placeholder='New category…'
                        value={newCatName}
                        onChange={e => setNewCatName(e.target.value)}
                      />
                      <button
                        type='submit'
                        disabled={addingCat || !newCatName.trim()}
                        className='px-2 py-1 bg-primary-700 text-white rounded-lg text-xs
                                   hover:bg-primary-800 disabled:opacity-50 transition-colors shrink-0'
                      >
                        {addingCat ? '…' : <Check className='w-3 h-3' />}
                      </button>
                      <button
                        type='button'
                        onClick={() => { setShowNewCat(false); setNewCatName('') }}
                        className='px-2 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs hover:bg-gray-200 shrink-0'
                      >
                        <X className='w-3 h-3' />
                      </button>
                    </form>
                  ) : (
                    <div className='relative'>
                      <select
                        required
                        value={form.category}
                        onChange={e => {
                          if (e.target.value === '__new__') {
                            setShowNewCat(true)
                          } else {
                            setForm(f => ({ ...f, category: e.target.value }))
                          }
                        }}
                        className='input appearance-none pr-8 cursor-pointer'
                      >
                        <option value=''>Select category…</option>
                        {categories.map(c => (
                          <option key={c._id} value={c.name}>{c.name}</option>
                        ))}
                        <option value='__new__'>➕ Add new category…</option>
                      </select>
                      <Tag className='absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none' />
                    </div>
                  )}
                </div>
              </div>

              {/* Available toggle */}
              <div className='flex items-center justify-between'>
                <label className='text-xs font-semibold text-gray-600'>Available</label>
                <button type='button' onClick={() => setForm(f => ({ ...f, is_available: !f.is_available }))}>
                  {form.is_available
                    ? <ToggleRight className='w-8 h-8 text-green-500' />
                    : <ToggleLeft  className='w-8 h-8 text-gray-300' />}
                </button>
              </div>

              {/* Actions */}
              <div className='flex gap-3 pt-2'>
                <button type='button' onClick={closeModal} className='btn-secondary flex-1'>Cancel</button>
                <button type='submit' disabled={saving || uploading} className='btn-primary flex-1 flex items-center justify-center gap-2'>
                  {saving
                    ? <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin' />
                    : <Check className='w-4 h-4' />}
                  {modal === 'add' ? 'Add Item' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
