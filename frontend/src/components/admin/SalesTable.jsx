import { formatCurrency } from '../../utils/formatCurrency'
import { format, parseISO } from 'date-fns'

const formatSaleDate = (value) => {
  if (!value) return '-'
  return format(parseISO(value), 'dd MMM yyyy')
}

export default function SalesTable({ sales }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Time</th>
              <th className="px-4 py-3">Staff</th>
              <th className="px-4 py-3">Drink</th>
              <th className="px-4 py-3">Qty</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sales.map((sale) => (
              <tr key={sale.id} className="hover:bg-slate-50/80">
                <td className="px-4 py-3 text-slate-600">{formatSaleDate(sale.date)}</td>
                <td className="px-4 py-3 text-slate-600">{sale.time}</td>
                <td className="px-4 py-3 font-medium text-slate-900">{sale.staffName}</td>
                <td className="px-4 py-3 text-slate-700">{sale.drinkName}</td>
                <td className="px-4 py-3 text-slate-600">{sale.quantity}</td>
                <td className="px-4 py-3 text-slate-600">{formatCurrency(sale.price)}</td>
                <td className="px-4 py-3 font-semibold text-slate-900">{formatCurrency(sale.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
