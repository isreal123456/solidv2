import { useEffect, useMemo, useState } from 'react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import { NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useShopName } from '../../hooks/useShopName'
import * as api from '../../services/api'

const ROLE_LINKS = {
  admin: [
    { label: 'Dashboard', to: '/admin/dashboard' },
    { label: 'Sales', to: '/admin/sales' },
    { label: 'Stock', to: '/admin/stock' },
    { label: 'Staff', to: '/admin/staff' },
    { label: 'Reports', to: '/admin/reports' },
    { label: 'Logs', to: '/admin/logs' },
    { label: 'Settings', to: '/admin/settings' },
  ],
  staff: [
    { label: 'Dashboard', to: '/staff/dashboard' },
    { label: 'Record Sale', to: '/staff/record-sale' },
    { label: 'My Sales', to: '/staff/my-sales' },
    { label: 'Reports', to: '/staff/reports' },
    { label: 'Stock View', to: '/staff/stock-view' },
  ],
}

export default function Sidebar() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const shopName = useShopName()

  const [open, setOpen] = useState(false)
  const [metrics, setMetrics] = useState({ sales: 0, lowStock: 0 })
  const [loading, setLoading] = useState(false)

  const links = useMemo(() => {
    return ROLE_LINKS[user?.role] ?? []
  }, [user?.role])

  // Close sidebar on route change
  useEffect(() => {
    setOpen(false)
  }, [location.pathname])

  // Lock body scroll on mobile
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => (document.body.style.overflow = '')
  }, [open])

  // Load staff metrics
  useEffect(() => {
    if (user?.role !== 'staff') return

    const load = async () => {
      setLoading(true)
      try {
        const today = format(new Date(), 'yyyy-MM-dd')
        const [sales, stock] = await Promise.all([
          api.getSales({ staffName: user.name, date: today }),
          api.getStock(),
        ])

        setMetrics({
          sales: sales.length,
          lowStock: stock.filter((d) => d.stock <= d.alertLevel).length,
        })
      } catch {
        toast.error('Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [user])

  const linkClass = ({ isActive }) =>
    `rounded-xl px-3 py-2.5 text-sm font-medium transition block ${
      isActive
        ? 'bg-emerald-600 text-white shadow'
        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
    }`

  return (
    <>
      {/* Mobile toggle */}
{!open && (
  <button
    onClick={() => setOpen((v) => !v)}
    className="fixed left-4 top-4 z-50 rounded-full bg-emerald-600 px-4 py-2 text-sm text-white md:hidden"
  >
    Menu
  </button>
)}

      {/* Overlay */}
      {open && (
        <button
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          aria-label="Close menu"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 bg-white/95 backdrop-blur border-r px-4 pt-6 pb-6 shadow-xl transition-transform duration-300
        ${open ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
      >
        {/* Header */}
        <div className="mb-6">
          <p className="text-xs tracking-[0.3em] text-emerald-600 font-semibold">
            {shopName}
          </p>
          <h1 className="text-xl font-semibold text-slate-900">
            {user?.role === 'admin' ? 'Admin Panel' : 'Staff Panel'}
          </h1>
        </div>

        {/* User card */}
        <div className="mb-6 rounded-2xl bg-slate-50 p-4">
          <p className="text-xs text-slate-500">Signed in as</p>
          <p className="font-semibold">{user?.name}</p>
          <p className="text-sm text-slate-500 capitalize">{user?.role}</p>
        </div>

        {/* Staff metrics */}
        {user?.role === 'staff' && (
          <div className="mb-6 rounded-2xl bg-emerald-50 p-4">
            <p className="text-xs font-semibold text-emerald-700">
              Live Overview
            </p>

            {loading ? (
              <p className="text-sm text-emerald-700 mt-2">Loading...</p>
            ) : (
              <div className="mt-3 grid grid-cols-2 gap-2">
                <div className="bg-white p-3 rounded-xl">
                  <p className="text-xs text-slate-500">Sales</p>
                  <p className="text-lg font-semibold">{metrics.sales}</p>
                </div>

                <div className="bg-white p-3 rounded-xl">
                  <p className="text-xs text-slate-500">Low stock</p>
                  <p className="text-lg font-semibold text-red-600">
                    {metrics.lowStock}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Nav */}
        <nav className="space-y-2 overflow-y-auto pb-28">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={linkClass}
              onClick={() => setOpen(false)}
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="absolute bottom-6 left-4 right-4">
          <button
            onClick={async () => {
              try {
                await logout()
                toast.success('Logged out')
                setOpen(false)
              } catch {
                toast.error('Logout failed')
              }
            }}
            className="w-full rounded-xl border px-4 py-3 text-sm hover:bg-red-50 hover:text-red-600"
          >
            Logout
          </button>
        </div>
      </aside>
    </>
  )
}