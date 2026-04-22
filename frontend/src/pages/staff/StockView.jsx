import { useMemo, useState } from 'react'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import StockViewTable from '../../components/staff/StockViewTable'
import { useStock } from '../../hooks/useStock'

export default function StockView() {
  const { stock, loading } = useStock()
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    return stock.filter((drink) => {
      if (!normalized) return true
      return (
        drink.name.toLowerCase().includes(normalized) ||
        drink.category.toLowerCase().includes(normalized)
      )
    })
  }, [query, stock])

  if (loading) return <LoadingSpinner />

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Stock view</h2>
          <p className="mt-1 text-sm text-slate-500">Read-only inventory table with low stock highlights.</p>
        </div>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search drink or category"
          className="w-full max-w-xs rounded-xl border border-slate-300 px-3 py-2 text-sm"
        />
      </div>

      <StockViewTable stock={filtered} />
    </div>
  )
}
