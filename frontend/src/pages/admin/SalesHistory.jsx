import { useMemo, useState } from 'react'
import SalesTable from '../../components/admin/SalesTable'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { useSales } from '../../hooks/useSales'
import { exportCSV } from '../../utils/exportCSV'

const PAGE_SIZE = 10

export default function SalesHistory() {
  const [staffName, setStaffName] = useState('')
  const [drinkName, setDrinkName] = useState('')
  const [date, setDate] = useState('')
  const [page, setPage] = useState(1)

  const { sales, loading, setFilters } = useSales({})

  const filtered = useMemo(() => [...sales].reverse(), [sales])
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  const handleFilter = (event) => {
    event.preventDefault()
    setPage(1)
    setFilters({ staffName, drinkName, date })
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Sales history</h2>
          <p className="mt-1 text-sm text-slate-500">Review all sales with filters and CSV export.</p>
        </div>
        <button
          type="button"
          onClick={() => exportCSV(filtered, 'sales-history')}
          className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700"
        >
          Export CSV
        </button>
      </div>

      <form onSubmit={handleFilter} className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-4">
        <input
          value={staffName}
          onChange={(event) => setStaffName(event.target.value)}
          placeholder="Filter by staff"
          className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
        />
        <input
          value={drinkName}
          onChange={(event) => setDrinkName(event.target.value)}
          placeholder="Filter by drink"
          className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
        />
        <input
          type="date"
          value={date}
          onChange={(event) => setDate(event.target.value)}
          className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
        />
        <button type="submit" className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white">
          Apply
        </button>
      </form>

      <SalesTable sales={paginated} />

      <div className="flex items-center justify-between text-sm text-slate-600">
        <button
          type="button"
          onClick={() => setPage((value) => Math.max(1, value - 1))}
          disabled={currentPage === 1}
          className="rounded-lg border border-slate-300 px-3 py-1.5 disabled:opacity-50"
        >
          Previous
        </button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <button
          type="button"
          onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
          disabled={currentPage === totalPages}
          className="rounded-lg border border-slate-300 px-3 py-1.5 disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  )
}
