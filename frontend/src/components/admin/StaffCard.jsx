import { formatDate } from '../../utils/formatDate'

export default function StaffCard({ staff, onRemove, onResetPin }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">{staff.name}</h3>
          <p className="mt-1 text-sm capitalize text-slate-500">{staff.role}</p>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">{staff.role}</span>
      </div>

      <dl className="mt-4 space-y-2 text-sm text-slate-600">
        <div className="flex items-center justify-between gap-3">
          <dt className="text-slate-500">Date added</dt>
          <dd className="font-medium text-slate-800">{formatDate(staff.createdAt)}</dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="text-slate-500">Last login</dt>
          <dd className="font-medium text-slate-800">{staff.lastLogin ? formatDate(staff.lastLogin) : 'Never'}</dd>
        </div>
      </dl>

      <div className="mt-5 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onResetPin(staff)}
          className="rounded-xl bg-emerald-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-emerald-700"
        >
          Reset PIN
        </button>
        <button
          type="button"
          onClick={() => onRemove(staff)}
          className="rounded-xl border border-red-200 px-3 py-2 text-sm font-medium text-red-700 transition hover:bg-red-50"
        >
          Remove
        </button>
      </div>
    </article>
  )
}
