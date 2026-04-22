import { useEffect, useMemo, useState } from 'react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import SalesTable from '../../components/admin/SalesTable'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import * as api from '../../services/api'
import { formatCurrency } from '../../utils/formatCurrency'

export default function Dashboard() {
  const [loading, setLoading] = useState(true)
  const [sales, setSales] = useState([])
  const [stock, setStock] = useState([])
  const [staff, setStaff] = useState([])

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        const [salesData, stockData, staffData] = await Promise.all([
          api.getSales(),
          api.getStock(),
          api.getStaff(),
        ])
        setSales(salesData)
        setStock(stockData)
        setStaff(staffData)
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unable to load dashboard'
        toast.error(message)
      } finally {
        setLoading(false)
      }
    }

    void loadData()
  }, [])

  const todaysSales = useMemo(() => {
    const today = format(new Date(), 'yyyy-MM-dd')
    return sales.filter((sale) => sale.date === today)
  }, [sales])
  const lowStock = useMemo(() => stock.filter((drink) => drink.stock <= drink.alertLevel), [stock])

  const cards = [
    {
      label: "Today's total sales",
      value: formatCurrency(todaysSales.reduce((sum, sale) => sum + sale.total, 0)),
    },
    {
      label: 'Drinks sold today',
      value: todaysSales.reduce((sum, sale) => sum + sale.quantity, 0),
    },
    {
      label: 'Active staff count',
      value: staff.filter((member) => member.role === 'staff').length,
    },
    {
      label: 'Low stock count',
      value: lowStock.length,
    },
  ]

  if (loading) return <LoadingSpinner />

  return (
    <div className="space-y-6">
      <section>
        <h2 className="text-2xl font-semibold text-slate-900">Dashboard</h2>
        <p className="mt-1 text-sm text-slate-500">Overview of sales, staff activity, and stock health.</p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <article key={card.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">{card.label}</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">{card.value}</p>
          </article>
        ))}
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">Recent sales</h3>
          <span className="text-sm text-slate-500">Last 10 entries</span>
        </div>
        <SalesTable sales={[...sales].slice(-10).reverse()} />
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900">Low stock alerts</h3>
        {lowStock.length ? (
          <ul className="mt-4 space-y-2">
            {lowStock.map((drink) => (
              <li key={drink.id} className="flex items-center justify-between rounded-xl bg-red-50 px-3 py-2 text-sm">
                <span className="font-medium text-red-700">{drink.name}</span>
                <span className="text-red-600">
                  {drink.stock} left (alert {drink.alertLevel})
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-slate-500">No low-stock drinks right now.</p>
        )}
      </section>
    </div>
  )
}
