import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import * as api from '../../services/api'

export default function Settings() {
  const [loading, setLoading] = useState(true)
  const [shopName, setShopName] = useState('')
  const [categories, setCategories] = useState([])
  const [newCategory, setNewCategory] = useState('')

  const loadSettings = async () => {
    setLoading(true)
    try {
      const data = await api.getSettings()
      setShopName(data.shopName)
      setCategories(data.categories)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to load settings'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadSettings()
  }, [])

  const handleSaveShopName = async () => {
    try {
      await api.updateShopName(shopName)
      toast.success('Shop name updated')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to update shop name'
      toast.error(message)
    }
  }

  const handleSaveCategories = async (nextCategories) => {
    try {
      const updated = await api.updateCategories(nextCategories)
      setCategories(updated)
      toast.success('Categories updated')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to update categories'
      toast.error(message)
    }
  }

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <p className="text-sm text-slate-500">Loading settings...</p>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">Settings</h2>
        <p className="mt-1 text-sm text-slate-500">Manage shop profile, categories, and exports.</p>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900">Shop name</h3>
        <div className="mt-3 flex flex-wrap gap-2">
          <input
            value={shopName}
            onChange={(event) => setShopName(event.target.value)}
            className="w-full max-w-md rounded-xl border border-slate-300 px-3 py-2 text-sm"
          />
          <button onClick={handleSaveShopName} className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white">
            Save
          </button>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900">Drink categories</h3>
        <div className="mt-3 flex flex-wrap gap-2">
          <input
            value={newCategory}
            onChange={(event) => setNewCategory(event.target.value)}
            placeholder="Add category"
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
          />
          <button
            onClick={() => {
              if (!newCategory.trim()) return
              const next = [...categories, newCategory.trim()]
              setNewCategory('')
              void handleSaveCategories(next)
            }}
            className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white"
          >
            Add
          </button>
        </div>

        <ul className="mt-4 flex flex-wrap gap-2">
          {categories.map((category) => (
            <li key={category} className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-slate-700">
              <span>{category}</span>
              <button
                onClick={() => {
                  const next = categories.filter((item) => item !== category)
                  void handleSaveCategories(next)
                }}
                className="text-red-600"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
