import AlertBadge from '../common/AlertBadge'
import { formatDate } from '../../utils/formatDate'

export default function LogTable({ logs }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Timestamp</th>
              <th className="px-4 py-3">Staff</th>
              <th className="px-4 py-3">Action</th>
              <th className="px-4 py-3">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-slate-50/80">
                <td className="px-4 py-3 text-slate-600">{formatDate(log.timestamp)}</td>
                <td className="px-4 py-3 font-medium text-slate-900">{log.staffName}</td>
                <td className="px-4 py-3"><AlertBadge type={log.action}>{log.action}</AlertBadge></td>
                <td className="px-4 py-3 text-slate-600">{log.details}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
