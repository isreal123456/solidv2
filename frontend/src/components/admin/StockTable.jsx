import { formatCurrency } from '../../utils/formatCurrency'

export default function StockTable({ stock, onQuantityChange, onAlertChange, onToggleStatus }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Drink</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3">Alert</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {stock.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-slate-500">
                  No drinks found for selected filters.
                </td>
              </tr>
            ) : (
              stock.map((drink) => {
                const lowStock = drink.stock <= drink.alertLevel
                return (
                  <tr key={drink.id} className={lowStock ? 'bg-red-50/80' : 'hover:bg-slate-50/80'}>
                    <td className="px-4 py-3 font-medium text-slate-900">{drink.name}</td>
                    <td className="px-4 py-3 text-slate-600">{drink.category}</td>
                    <td className="px-4 py-3 text-slate-600">{formatCurrency(drink.price)}</td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        min="0"
                        defaultValue={drink.stock}
                        onBlur={(event) => onQuantityChange(drink, event.target.value)}
                        className="w-24 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        min="0"
                        defaultValue={drink.alertLevel}
                        onBlur={(event) => onAlertChange(drink, event.target.value)}
                        className="w-24 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                      />
                    </td>
                    <td className="px-4 py-3 text-slate-500">
                      <div className="flex items-center gap-2">
                        {lowStock ? <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-medium text-red-700">Low stock</span> : <span>OK</span>}
                        {drink.isActive ? (
                          <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700">Active</span>
                        ) : (
                          <span className="rounded-full bg-slate-200 px-2.5 py-1 text-xs font-medium text-slate-700">Inactive</span>
                        )}
                        <button
                          type="button"
                          onClick={() => onToggleStatus(drink)}
                          className={`rounded-lg px-2.5 py-1 text-xs font-medium ${
                            drink.isActive
                              ? 'border border-amber-200 bg-amber-50 text-amber-700'
                              : 'border border-emerald-200 bg-emerald-50 text-emerald-700'
                          }`}
                        >
                          {drink.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
