import { useMemo, useState } from 'react'
import SalesTable from '../../components/admin/SalesTable'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { useSales } from '../../hooks/useSales'
import { exportCSV } from '../../utils/exportCSV'
import { formatCurrency } from '../../utils/formatCurrency'

const PAGE_SIZE = 10

export default function SalesHistory() {
  const [staffName, setStaffName] = useState('')
  const [drinkName, setDrinkName] = useState('')
  const [date, setDate] = useState('')
  const [customerQuery, setCustomerQuery] = useState('')
  const [selectedCustomerName, setSelectedCustomerName] = useState('')
  const [page, setPage] = useState(1)

  const { sales, loading, setFilters } = useSales({})

  const filtered = useMemo(() => [...sales].reverse(), [sales])

  const customerGroups = useMemo(() => {
    const grouped = new Map()

    for (const sale of filtered) {
      const customerName = (sale.customerName || 'Walk-in').trim() || 'Walk-in'
      if (!grouped.has(customerName)) {
        grouped.set(customerName, {
          customerName,
          sales: [],
          orders: 0,
          quantity: 0,
          totalAmount: 0,
          lastDate: sale.date || '',
          lastTime: sale.time || '',
        })
      }

      const group = grouped.get(customerName)
      group.sales.push(sale)
      group.orders += 1
      group.quantity += Number(sale.quantity) || 0
      group.totalAmount += Number(sale.total) || 0
      if ((sale.date || '') > group.lastDate || ((sale.date || '') === group.lastDate && (sale.time || '') > group.lastTime)) {
        group.lastDate = sale.date || ''
        group.lastTime = sale.time || ''
      }
    }

    return Array.from(grouped.values())
  }, [filtered])

  const customerFiltered = useMemo(() => {
    const query = customerQuery.trim().toLowerCase()
    if (!query) return customerGroups
    return customerGroups.filter((group) => group.customerName.toLowerCase().includes(query))
  }, [customerGroups, customerQuery])

  const totalPages = Math.max(1, Math.ceil(customerFiltered.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const paginated = customerFiltered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  const selectedCustomer = useMemo(
    () => customerFiltered.find((group) => group.customerName === selectedCustomerName),
    [customerFiltered, selectedCustomerName],
  )

  const handleFilter = (event) => {
    event.preventDefault()
    setPage(1)
    setSelectedCustomerName('')
    setFilters({ staffName, drinkName, date })
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Sales history</h2>
          <p className="mt-1 text-sm text-slate-500">Browse sales by customer and click a customer to view full details.</p>
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

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-600">Customers</h3>
          <input
            value={customerQuery}
            onChange={(event) => {
              setPage(1)
              setCustomerQuery(event.target.value)
            }}
            placeholder="Search customer"
            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm md:w-64"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Orders</th>
                <th className="px-4 py-3">Items</th>
                <th className="px-4 py-3">Total spent</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginated.map((group) => {
                const isSelected = selectedCustomerName === group.customerName
                return (
                  <tr
                    key={group.customerName}
                    className={`cursor-pointer ${isSelected ? 'bg-emerald-50' : 'hover:bg-slate-50/80'}`}
                    onClick={() => setSelectedCustomerName(group.customerName)}
                  >
                    <td className="px-4 py-3 font-semibold text-slate-900">{group.customerName}</td>
                    <td className="px-4 py-3 text-slate-600">{group.orders}</td>
                    <td className="px-4 py-3 text-slate-600">{group.quantity}</td>
                    <td className="px-4 py-3 font-semibold text-slate-900">{formatCurrency(group.totalAmount)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {selectedCustomer ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-base font-semibold text-slate-900">Details: {selectedCustomer.customerName}</h3>
            <button
              type="button"
              onClick={() => setSelectedCustomerName('')}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700"
            >
              Close
            </button>
          </div>
          <SalesTable sales={selectedCustomer.sales} />
        </div>
      ) : null}

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
