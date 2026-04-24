import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import StockTable from '../../components/admin/StockTable'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { useAuth } from '../../hooks/useAuth'
import { useStock } from '../../hooks/useStock'
import * as api from '../../services/api'

const CREATE_NEW_CATEGORY = '__create_new_category__'

const initialDrink = {
  name: '',
  category: '',
  price: '',
  stock: '',
  alertLevel: '',
}

export default function StockManagement() {
  const { user } = useAuth()
  const { stock, loading, refresh } = useStock({ includeInactive: true })
  const [showModal, setShowModal] = useState(false)
  const [newDrink, setNewDrink] = useState(initialDrink)
  const [selectedCategory, setSelectedCategory] = useState('')
  const [customCategory, setCustomCategory] = useState('')
  const [savedCategories, setSavedCategories] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showLowStockOnly, setShowLowStockOnly] = useState(false)

  const stockCategories = Array.from(new Set(stock.map((drink) => drink.category))).sort()
  const addCategoryOptions = Array.from(new Set((savedCategories.length > 0 ? savedCategories : stockCategories))).sort()

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await api.getSettings()
        setSavedCategories(Array.isArray(data?.categories) ? data.categories : [])
      } catch {
        setSavedCategories([])
      }
    }

    void loadCategories()
  }, [])

  const filteredStock = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase()

    return stock.filter((drink) => {
      const matchesQuery =
        !normalizedQuery ||
        drink.name.toLowerCase().includes(normalizedQuery) ||
        drink.category.toLowerCase().includes(normalizedQuery)
      const matchesCategory = filterCategory === 'all' || drink.category === filterCategory
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && drink.isActive) ||
        (statusFilter === 'inactive' && !drink.isActive)
      const matchesLowStock = !showLowStockOnly || drink.stock <= drink.alertLevel

      return matchesQuery && matchesCategory && matchesStatus && matchesLowStock
    })
  }, [stock, searchQuery, filterCategory, statusFilter, showLowStockOnly])

  const handleQuantityChange = async (drink, quantity) => {
    try {
      await api.updateStock(drink.id, quantity, user.name)
      toast.success(`${drink.name} stock updated`)
      await refresh()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to update stock'
      toast.error(message)
    }
  }

  const handleAlertChange = async (drink, alertLevel) => {
    try {
      await api.updateAlertLevel(drink.id, alertLevel, user.name)
      toast.success(`${drink.name} alert updated`)
      await refresh()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to update alert level'
      toast.error(message)
    }
  }

  const handleToggleDrinkStatus = async (drink) => {
    const nextIsActive = !drink.isActive
    const shouldProceed = window.confirm(
      `${nextIsActive ? 'Activate' : 'Deactivate'} ${drink.name}?`,
    )
    if (!shouldProceed) {
      return
    }

    try {
      await api.updateDrinkActive(drink.id, nextIsActive, user.name)
      toast.success(`${drink.name} ${nextIsActive ? 'activated' : 'deactivated'}`)
      await refresh({ includeInactive: true })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to update drink status'
      toast.error(message)
    }
  }

  const handleAddDrink = async (event) => {
    event.preventDefault()

    const finalCategory =
      selectedCategory === CREATE_NEW_CATEGORY ? customCategory.trim() : selectedCategory.trim()

    if (!finalCategory) {
      toast.error('Please select or create a category')
      return
    }

    try {
      await api.addDrink({ ...newDrink, category: finalCategory }, user.name)
      toast.success('New drink added')
      setShowModal(false)
      setNewDrink(initialDrink)
      setSelectedCategory('')
      setCustomCategory('')
      try {
        const settings = await api.getSettings()
        setSavedCategories(Array.isArray(settings?.categories) ? settings.categories : [])
      } catch {
        // Keep the existing category list if settings cannot be reloaded.
      }
      await refresh()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to add drink'
      toast.error(message)
    }
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Stock management</h2>
          <p className="mt-1 text-sm text-slate-500">Adjust quantity, set alert levels, and add new drinks.</p>
        </div>
        <button
          type="button"
          onClick={() => {
            setShowModal(true)
            setSelectedCategory('')
            setCustomCategory('')
          }}
          className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white"
        >
          Add drink
        </button>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-4">
          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700">Search</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search by drink or category"
              className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700">Category</span>
            <select
              value={filterCategory}
              onChange={(event) => setFilterCategory(event.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="all">All categories</option>
              {stockCategories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700">Status</span>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="all">All statuses</option>
              <option value="active">Active only</option>
              <option value="inactive">Inactive only</option>
            </select>
          </label>

          <label className="flex items-center gap-2 rounded-xl border border-slate-300 px-3 py-2.5 text-sm text-slate-700 md:mt-7">
            <input
              type="checkbox"
              checked={showLowStockOnly}
              onChange={(event) => setShowLowStockOnly(event.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-emerald-600"
            />
            Show low stock only
          </label>
        </div>
      </section>

      <StockTable
        stock={filteredStock}
        onQuantityChange={handleQuantityChange}
        onAlertChange={handleAlertChange}
        onToggleStatus={handleToggleDrinkStatus}
      />

      {showModal ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/40 p-4">
          <form onSubmit={handleAddDrink} className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-xl">
            <h3 className="text-lg font-semibold text-slate-900">Add new drink</h3>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <input
                required
                placeholder="Drink name"
                value={newDrink.name}
                onChange={(event) => setNewDrink((prev) => ({ ...prev, name: event.target.value }))}
                className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
              />
              <select
                required
                value={selectedCategory}
                onChange={(event) => setSelectedCategory(event.target.value)}
                className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
              >
                <option value="">Select category</option>
                {addCategoryOptions.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
                <option value={CREATE_NEW_CATEGORY}>Create new category</option>
              </select>
              {selectedCategory === CREATE_NEW_CATEGORY ? (
                <input
                  required
                  placeholder="New category name"
                  value={customCategory}
                  onChange={(event) => setCustomCategory(event.target.value)}
                  className="rounded-xl border border-slate-300 px-3 py-2 text-sm md:col-span-2"
                />
              ) : null}
              <input
                required
                type="number"
                min="0"
                placeholder="Price"
                value={newDrink.price}
                onChange={(event) => setNewDrink((prev) => ({ ...prev, price: event.target.value }))}
                className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
              />
              <input
                required
                type="number"
                min="0"
                placeholder="Stock"
                value={newDrink.stock}
                onChange={(event) => setNewDrink((prev) => ({ ...prev, stock: event.target.value }))}
                className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
              />
              <input
                required
                type="number"
                min="0"
                placeholder="Alert level"
                value={newDrink.alertLevel}
                onChange={(event) => setNewDrink((prev) => ({ ...prev, alertLevel: event.target.value }))}
                className="rounded-xl border border-slate-300 px-3 py-2 text-sm md:col-span-2"
              />
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowModal(false)
                  setSelectedCategory('')
                  setCustomCategory('')
                }}
                className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
              >
                Cancel
              </button>
              <button type="submit" className="rounded-xl bg-emerald-600 px-3 py-2 text-sm text-white">
                Add drink
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  )
}
