import { Navigate, Outlet, Route, Routes } from 'react-router-dom'
import ProtectedRoute from '../components/common/ProtectedRoute'
import Sidebar from '../components/common/Sidebar'
import Login from '../pages/Login'
import Dashboard from '../pages/admin/Dashboard'
import Logs from '../pages/admin/Logs'
import Reports from '../pages/admin/Reports'
import SalesHistory from '../pages/admin/SalesHistory'
import Settings from '../pages/admin/Settings'
import StaffManagement from '../pages/admin/StaffManagement'
import StockManagement from '../pages/admin/StockManagement'
import StaffDashboard from '../pages/staff/Dashboard'
import MySalesToday from '../pages/staff/MySalesToday'
import RecordSale from '../pages/staff/RecordSale'
import StaffReports from '../pages/staff/Reports'
import StockView from '../pages/staff/StockView'
import { useShopName } from '../hooks/useShopName'

function ShellLayout() {
  const shopName = useShopName()

  return (
    <div className="min-h-screen bg-transparent">
      <Sidebar />
      <main className="min-h-screen px-4 pb-8 pt-20 md:ml-72 md:px-8 md:pt-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-slate-200/80 bg-white/85 px-4 py-3 shadow-sm backdrop-blur">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-600">{shopName} SaaS</p>
            <p className="text-sm text-slate-500">Drinks operations and team performance in one workspace</p>
          </div>
          <span className="hidden rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 md:inline-flex">Live API data</span>
        </div>
        <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-sm backdrop-blur md:p-5">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />

      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRole="admin">
            <ShellLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="sales" element={<SalesHistory />} />
        <Route path="stock" element={<StockManagement />} />
        <Route path="staff" element={<StaffManagement />} />
        <Route path="reports" element={<Reports />} />
        <Route path="logs" element={<Logs />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      <Route
        path="/staff"
        element={
          <ProtectedRoute allowedRole="staff">
            <ShellLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<StaffDashboard />} />
        <Route path="record-sale" element={<RecordSale />} />
        <Route path="my-sales" element={<MySalesToday />} />
        <Route path="reports" element={<StaffReports />} />
        <Route path="stock-view" element={<StockView />} />
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}
