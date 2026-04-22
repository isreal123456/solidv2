const badgeStyles = {
  login: 'bg-blue-100 text-blue-700 ring-blue-200',
  sale: 'bg-emerald-100 text-emerald-700 ring-emerald-200',
  stock: 'bg-yellow-100 text-yellow-800 ring-yellow-200',
  edit: 'bg-orange-100 text-orange-700 ring-orange-200',
  staff: 'bg-purple-100 text-purple-700 ring-purple-200',
  logout: 'bg-slate-100 text-slate-700 ring-slate-200',
  warning: 'bg-amber-100 text-amber-700 ring-amber-200',
  success: 'bg-green-100 text-green-700 ring-green-200',
  danger: 'bg-red-100 text-red-700 ring-red-200',
}

export default function AlertBadge({ type = 'warning', children }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${badgeStyles[type] ?? badgeStyles.warning}`}
    >
      {children}
    </span>
  )
}
