import { useState } from 'react'
import LogTable from '../../components/admin/LogTable'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { useLogs } from '../../hooks/useLogs'
import { exportCSV } from '../../utils/exportCSV'

export default function Logs() {
  const [staffName, setStaffName] = useState('')
  const [action, setAction] = useState('')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')

  const { logs, loading, setFilters } = useLogs({})

  const handleFilter = (event) => {
    event.preventDefault()
    setFilters({ staffName, action, fromDate, toDate })
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Activity logs</h2>
          <p className="mt-1 text-sm text-slate-500">Append-only activity trail across login, sales, stock, and edits.</p>
        </div>
        <button
          type="button"
          onClick={() => exportCSV(logs, 'activity-logs')}
          className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700"
        >
          Export CSV
        </button>
      </div>

      <form onSubmit={handleFilter} className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-5">
        <input value={staffName} onChange={(event) => setStaffName(event.target.value)} placeholder="Staff name" className="rounded-xl border border-slate-300 px-3 py-2 text-sm" />
        <select value={action} onChange={(event) => setAction(event.target.value)} className="rounded-xl border border-slate-300 px-3 py-2 text-sm">
          <option value="">All actions</option>
          <option value="login">Login</option>
          <option value="sale">Sale</option>
          <option value="stock">Stock</option>
          <option value="edit">Edit</option>
          <option value="staff">Staff</option>
          <option value="logout">Logout</option>
        </select>
        <input type="date" value={fromDate} onChange={(event) => setFromDate(event.target.value)} className="rounded-xl border border-slate-300 px-3 py-2 text-sm" />
        <input type="date" value={toDate} onChange={(event) => setToDate(event.target.value)} className="rounded-xl border border-slate-300 px-3 py-2 text-sm" />
        <button className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white">Apply</button>
      </form>

      <LogTable logs={[...logs].reverse()} />
    </div>
  )
}
