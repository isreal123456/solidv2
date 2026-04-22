import { formatCurrency } from '../../utils/formatCurrency'

export default function StockViewTable({ stock }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Drink</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Available stock</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {stock.map((drink) => {
              const lowStock = drink.stock <= drink.alertLevel
              return (
                <tr key={drink.id} className={lowStock ? 'bg-red-50/80' : 'hover:bg-slate-50/80'}>
                  <td className="px-4 py-3 font-medium text-slate-900">{drink.name}</td>
                  <td className="px-4 py-3 text-slate-600">{drink.category}</td>
                  <td className="px-4 py-3 text-slate-600">{formatCurrency(drink.price)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-slate-900">{drink.stock}</span>
                      {lowStock ? <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-medium text-red-700">Low stock</span> : null}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
