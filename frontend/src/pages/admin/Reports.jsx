import { useMemo, useState } from 'react'
import ReportChart from '../../components/admin/ReportChart'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { useSales } from '../../hooks/useSales'
import { exportCSV } from '../../utils/exportCSV'
import { exportExcel } from '../../utils/exportExcel'
import { exportPDFTable } from '../../utils/exportPDF'
import { formatCurrency } from '../../utils/formatCurrency'

export default function Reports() {
  const [fromDate, setFromDate] = useState('2026-04-18')
  const [toDate, setToDate] = useState('2026-04-20')
  const { sales, loading, setFilters } = useSales({ fromDate: '2026-04-18', toDate: '2026-04-20' })

  const salesPerDay = useMemo(() => {
    const map = new Map()
    sales.forEach((sale) => {
      map.set(sale.date, (map.get(sale.date) || 0) + sale.total)
    })
    return Array.from(map.entries()).map(([date, total]) => ({ date, total }))
  }, [sales])

  const topDrinks = useMemo(() => {
    const map = new Map()
    sales.forEach((sale) => {
      map.set(sale.drinkName, (map.get(sale.drinkName) || 0) + sale.quantity)
    })
    return Array.from(map.entries())
      .map(([drink, quantity]) => ({ drink, quantity }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5)
  }, [sales])

  const staffPerformance = useMemo(() => {
    const map = new Map()
    sales.forEach((sale) => {
      const current = map.get(sale.staffName) || { name: sale.staffName, totalSales: 0, totalRevenue: 0 }
      current.totalSales += sale.quantity
      current.totalRevenue += sale.total
      map.set(sale.staffName, current)
    })
    return Array.from(map.values())
  }, [sales])

  const handleApply = (event) => {
    event.preventDefault()
    setFilters({ fromDate, toDate })
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Reports</h2>
          <p className="mt-1 text-sm text-slate-500">Track trends by day, product, and staff performance.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => exportCSV(staffPerformance, 'staff-performance-report')}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700"
          >
            Export CSV
          </button>
          <button
            type="button"
            onClick={() => exportExcel(staffPerformance, 'staff-performance-report', 'Staff Performance')}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700"
          >
            Export Excel
          </button>
          <button
            type="button"
            onClick={() =>
              exportPDFTable({
                title: 'Staff Performance Report',
                subtitle: `From ${fromDate || '-'} to ${toDate || '-'}`,
                columns: ['Name', 'Total Sales', 'Total Revenue'],
                rows: staffPerformance.map((row) => [row.name, row.totalSales, formatCurrency(row.totalRevenue)]),
                filename: 'staff-performance-report',
              })
            }
            className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700"
          >
            Export PDF
          </button>
        </div>
      </div>

      <form onSubmit={handleApply} className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-3">
        <input type="date" value={fromDate} onChange={(event) => setFromDate(event.target.value)} className="rounded-xl border border-slate-300 px-3 py-2 text-sm" />
        <input type="date" value={toDate} onChange={(event) => setToDate(event.target.value)} className="rounded-xl border border-slate-300 px-3 py-2 text-sm" />
        <button className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white">Apply range</button>
      </form>

      <div className="grid gap-4 xl:grid-cols-2">
        <ReportChart data={salesPerDay} xKey="date" yKey="total" color="#16a34a" title="Sales per day" />
        <ReportChart data={topDrinks} xKey="drink" yKey="quantity" color="#0ea5e9" title="Top 5 drinks sold" />
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900">Staff performance</h3>
        <div className="mt-3 overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Total sales</th>
                <th className="px-4 py-3">Total revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {staffPerformance.map((row) => (
                <tr key={row.name}>
                  <td className="px-4 py-3 font-medium text-slate-900">{row.name}</td>
                  <td className="px-4 py-3 text-slate-600">{row.totalSales}</td>
                  <td className="px-4 py-3 font-semibold text-slate-900">{formatCurrency(row.totalRevenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
