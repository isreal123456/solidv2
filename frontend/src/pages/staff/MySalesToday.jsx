import { useEffect, useMemo, useState } from 'react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import MySalesTable from '../../components/staff/MySalesTable'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { useAuth } from '../../hooks/useAuth'
import * as api from '../../services/api'

export default function MySalesToday() {
  const { user } = useAuth()
  const [sales, setSales] = useState([])
  const [loading, setLoading] = useState(true)
  const [customerQuery, setCustomerQuery] = useState('')
  const [selectedDate, setSelectedDate] = useState('')

  useEffect(() => {
    const loadSales = async () => {
      setLoading(true)
      try {
        const filters = {
          staffName: user.name,
          ...(selectedDate ? { date: selectedDate } : {}),
        }
        const data = await api.getSales(filters)
        setSales(data)
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unable to load your sales'
        toast.error(message)
      } finally {
        setLoading(false)
      }
    }

    void loadSales()
  }, [user.name, selectedDate])

  const filteredSales = useMemo(() => {
    const query = customerQuery.trim().toLowerCase()
    if (!query) return sales

    return sales.filter((sale) => {
      const customerName = String(sale.customerName ?? '').trim().toLowerCase()
      return customerName.includes(query)
    })
  }, [sales, customerQuery])

  const total = useMemo(() => filteredSales.reduce((sum, sale) => sum + sale.total, 0), [filteredSales])

  const clearFilters = () => {
    setCustomerQuery('')
    setSelectedDate('')
  }

  const setTodayFilter = () => {
    setSelectedDate(format(new Date(), 'yyyy-MM-dd'))
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">My sales</h2>
        <p className="mt-1 text-sm text-slate-500">Search by customer name and filter by date. Click a customer to view full purchase details.</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-3">
          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700">Search customer name</span>
            <input
              type="text"
              value={customerQuery}
              onChange={(event) => setCustomerQuery(event.target.value)}
              placeholder="Type customer name"
              className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700">Filter by date</span>
            <input
              type="date"
              value={selectedDate}
              onChange={(event) => setSelectedDate(event.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            />
          </label>

          <div className="flex items-end gap-2">
            <button
              type="button"
              onClick={setTodayFilter}
              className="rounded-xl border border-emerald-300 bg-emerald-50 px-3 py-2.5 text-sm font-medium text-emerald-700"
            >
              Today
            </button>
            <button
              type="button"
              onClick={clearFilters}
              className="rounded-xl border border-slate-300 px-3 py-2.5 text-sm font-medium text-slate-700"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      <MySalesTable sales={filteredSales} total={total} />
    </div>
  )
}
