import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { formatCurrency } from '../../utils/formatCurrency'

export default function ReportChart({ data, xKey, yKey, color = '#16a34a', title }) {
  const isMoneySeries = /total|revenue|sales/i.test(String(yKey))

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-base font-semibold text-slate-900">{title}</h3>
      <div className="mt-5 h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey={xKey} tick={{ fill: '#64748b', fontSize: 12 }} />
            <YAxis tick={{ fill: '#64748b', fontSize: 12 }} />
            <Tooltip
              formatter={(value) => {
                if (!isMoneySeries) return value
                return formatCurrency(Number(value || 0))
              }}
              contentStyle={{ borderRadius: 12, borderColor: '#e2e8f0' }}
            />
            <Bar dataKey={yKey} fill={color} radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
