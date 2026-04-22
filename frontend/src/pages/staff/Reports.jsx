import { useMemo, useState } from 'react'
import { format, subDays } from 'date-fns'
import ReportChart from '../../components/admin/ReportChart'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { useAuth } from '../../hooks/useAuth'
import { useSales } from '../../hooks/useSales'
import { exportCSV } from '../../utils/exportCSV'
import { exportExcel } from '../../utils/exportExcel'
import { exportPDFTable } from '../../utils/exportPDF'
import { formatCurrency } from '../../utils/formatCurrency'

export default function StaffReports() {
  const { user } = useAuth()
  const today = format(new Date(), 'yyyy-MM-dd')
  const defaultFromDate = format(subDays(new Date(), 6), 'yyyy-MM-dd')

  const [fromDate, setFromDate] = useState(defaultFromDate)
  const [toDate, setToDate] = useState(today)

  const { sales, loading, setFilters } = useSales({
    staffName: user.name,
    fromDate: defaultFromDate,
    toDate: today,
  })

  const salesPerDay = useMemo(() => {
    const map = new Map()
    sales.forEach((sale) => {
      map.set(sale.date, (map.get(sale.date) || 0) + sale.total)
    })
    return Array.from(map.entries())
      .map(([date, total]) => ({ date, total }))
      .sort((a, b) => a.date.localeCompare(b.date))
  }, [sales])

  const topProducts = useMemo(() => {
    const map = new Map()
    sales.forEach((sale) => {
      const current = map.get(sale.drinkName) || { product: sale.drinkName, quantity: 0, revenue: 0 }
      current.quantity += sale.quantity
      current.revenue += sale.total
      map.set(sale.drinkName, current)
    })
    return Array.from(map.values())
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5)
  }, [sales])

  const topCustomers = useMemo(() => {
    const map = new Map()
    sales.forEach((sale) => {
      const key = String(sale.customerName || 'Walk-in customer').trim() || 'Walk-in customer'
      const current = map.get(key) || { customer: key, items: 0, revenue: 0 }
      current.items += sale.quantity
      current.revenue += sale.total
      map.set(key, current)
    })
    return Array.from(map.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 8)
  }, [sales])

  const totals = useMemo(() => {
    const totalRevenue = sales.reduce((sum, sale) => sum + sale.total, 0)
    const totalItems = sales.reduce((sum, sale) => sum + sale.quantity, 0)
    return {
      totalRevenue,
      totalItems,
      totalOrders: sales.length,
    }
  }, [sales])

  const handleApply = (event) => {
    event.preventDefault()
    setFilters({
      staffName: user.name,
      ...(fromDate ? { fromDate } : {}),
      ...(toDate ? { toDate } : {}),
    })
  }

  const resetToLast7Days = () => {
    const nextToDate = format(new Date(), 'yyyy-MM-dd')
    const nextFromDate = format(subDays(new Date(), 6), 'yyyy-MM-dd')
    setFromDate(nextFromDate)
    setToDate(nextToDate)
    setFilters({
      staffName: user.name,
      fromDate: nextFromDate,
      toDate: nextToDate,
    })
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">My reports</h2>
          <p className="mt-1 text-sm text-slate-500">Review your sales trend, top products, and top customers by date range.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => exportCSV(topCustomers, 'my-top-customers-report')}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700"
          >
            Export CSV
          </button>
          <button
            type="button"
            onClick={() => exportExcel(topCustomers, 'my-top-customers-report', 'Top Customers')}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700"
          >
            Export Excel
          </button>
          <button
            type="button"
            onClick={() =>
              exportPDFTable({
                title: 'My Top Customers Report',
                subtitle: `From ${fromDate || '-'} to ${toDate || '-'}`,
                columns: ['Customer', 'Items Bought', 'Revenue'],
                rows: topCustomers.map((row) => [row.customer, row.items, formatCurrency(row.revenue)]),
                filename: 'my-top-customers-report',
              })
            }
            className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700"
          >
            Export PDF
          </button>
        </div>
      </div>

      <form onSubmit={handleApply} className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-4">
        <input
          type="date"
          value={fromDate}
          onChange={(event) => setFromDate(event.target.value)}
          className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
        />
        <input
          type="date"
          value={toDate}
          onChange={(event) => setToDate(event.target.value)}
          className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
        />
        <button className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white">Apply range</button>
        <button
          type="button"
          onClick={resetToLast7Days}
          className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700"
        >
          Last 7 days
        </button>
      </form>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-slate-500">Total revenue</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{formatCurrency(totals.totalRevenue)}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-slate-500">Items sold</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{totals.totalItems}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-slate-500">Total sale lines</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{totals.totalOrders}</p>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <ReportChart data={salesPerDay} xKey="date" yKey="total" color="#16a34a" title="My sales per day" />
        <ReportChart data={topProducts} xKey="product" yKey="quantity" color="#0ea5e9" title="My top 5 products" />
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900">Top customers</h3>
        <div className="mt-3 overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Items bought</th>
                <th className="px-4 py-3">Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {topCustomers.map((row) => (
                <tr key={row.customer}>
                  <td className="px-4 py-3 font-medium text-slate-900">{row.customer}</td>
                  <td className="px-4 py-3 text-slate-600">{row.items}</td>
                  <td className="px-4 py-3 font-semibold text-slate-900">{formatCurrency(row.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
