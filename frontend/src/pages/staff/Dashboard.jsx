import { useEffect, useMemo, useState } from 'react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import MySalesTable from '../../components/staff/MySalesTable'
import { useAuth } from '../../hooks/useAuth'
import * as api from '../../services/api'
import { formatCurrency } from '../../utils/formatCurrency'

export default function StaffDashboard() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [mySales, setMySales] = useState([])
  const [stock, setStock] = useState([])

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        const today = format(new Date(), 'yyyy-MM-dd')
        const [salesData, stockData] = await Promise.all([
          api.getSales({ staffName: user.name, date: today }),
          api.getStock(),
        ])
        setMySales(salesData)
        setStock(stockData)
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unable to load dashboard'
        toast.error(message)
      } finally {
        setLoading(false)
      }
    }

    void loadData()
  }, [user.name])

  const totalRevenue = useMemo(
    () => mySales.reduce((sum, sale) => sum + sale.total, 0),
    [mySales],
  )
  const totalItemsSold = useMemo(
    () => mySales.reduce((sum, sale) => sum + sale.quantity, 0),
    [mySales],
  )
  const lowStockCount = useMemo(
    () => stock.filter((drink) => drink.stock <= drink.alertLevel).length,
    [stock],
  )

  if (loading) return <LoadingSpinner />

  return (
    <div className="space-y-6">
      <section className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Staff dashboard</h2>
          <p className="mt-1 text-sm text-slate-500">Welcome back, {user.name}. Here is your performance snapshot for today.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            to="/staff/record-sale"
            className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white"
          >
            Record sale
          </Link>
          <Link
            to="/staff/stock-view"
            className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700"
          >
            View stock
          </Link>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Today's transactions</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{mySales.length}</p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Items sold today</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{totalItemsSold}</p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Revenue today</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{formatCurrency(totalRevenue)}</p>
        </article>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900">Shop stock alerts</h3>
        <p className="mt-1 text-sm text-slate-500">{lowStockCount} drink(s) currently at or below alert level.</p>
      </section>

      <section>
        <h3 className="mb-3 text-lg font-semibold text-slate-900">My sales today</h3>
        <MySalesTable sales={mySales} total={totalRevenue} />
      </section>
    </div>
  )
}
