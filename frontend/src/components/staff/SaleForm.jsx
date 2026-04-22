import { useMemo, useState } from 'react'
import { formatCurrency } from '../../utils/formatCurrency'

export default function SaleForm({ drinks, loading, onSubmit }) {
  const createLine = () => ({
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    drinkId: '',
    quantity: 1,
    search: '',
  })

  const [customerName, setCustomerName] = useState('')
  const [lines, setLines] = useState([createLine()])
  const [confirmOpen, setConfirmOpen] = useState(false)

  const validLines = useMemo(
    () => lines.filter((line) => line.drinkId && Number(line.quantity) > 0),
    [lines],
  )

  const total = useMemo(() => {
    return validLines.reduce((sum, line) => {
      const drink = drinks.find((item) => item.id === line.drinkId)
      if (!drink) return sum
      return sum + drink.price * Number(line.quantity)
    }, 0)
  }, [drinks, validLines])

  const handleLineChange = (lineId, updates) => {
    setLines((current) =>
      current.map((line) => (line.id === lineId ? { ...line, ...updates } : line)),
    )
  }

  const addLine = () => {
    setLines((current) => [...current, createLine()])
  }

  const removeLine = (lineId) => {
    setLines((current) => {
      if (current.length === 1) {
        return current
      }
      return current.filter((line) => line.id !== lineId)
    })
  }

  const handleConfirm = async () => {
    await onSubmit({
      customerName: customerName.trim(),
      lines: validLines.map((line) => ({
        drinkId: line.drinkId,
        quantity: Number(line.quantity),
      })),
    })
    setCustomerName('')
    setLines([createLine()])
    setConfirmOpen(false)
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2 md:col-span-2">
          <span className="text-sm font-medium text-slate-700">Customer name</span>
          <input
            value={customerName}
            onChange={(event) => setCustomerName(event.target.value)}
            placeholder="Enter customer name"
            className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
          />
        </label>
        <div className="space-y-3 md:col-span-2">
          <div className="text-sm font-medium text-slate-700">Sale lines</div>
          {lines.map((line, index) => {
            const lineSearch = String(line.search ?? '').trim().toLowerCase()
            const lineFilteredDrinks = drinks.filter((drink) => {
              if (!lineSearch) return true
              return (
                drink.name.toLowerCase().includes(lineSearch) ||
                drink.category.toLowerCase().includes(lineSearch)
              )
            })
            const selectedDrink = drinks.find((item) => item.id === line.drinkId)
            const lineTotal = selectedDrink ? selectedDrink.price * Number(line.quantity || 0) : 0

            return (
              <div key={line.id} className="grid gap-3 rounded-xl border border-slate-200 p-3 md:grid-cols-12">
                <div className="md:col-span-6">
                  <label className="space-y-2">
                    <span className="text-xs font-medium uppercase tracking-wide text-slate-500">Search product</span>
                    <input
                      value={line.search}
                      onChange={(event) => handleLineChange(line.id, { search: event.target.value })}
                      placeholder="Type drink name or category"
                      className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </label>

                  <label className="space-y-2">
                    <span className="text-xs font-medium uppercase tracking-wide text-slate-500">Drink {index + 1}</span>
                    <select
                      value={line.drinkId}
                      onChange={(event) => handleLineChange(line.id, { drinkId: event.target.value })}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                    >
                      <option value="">Select a drink</option>
                      {lineFilteredDrinks.map((drink) => (
                        <option key={drink.id} value={drink.id}>
                          {drink.name} ({drink.stock} in stock)
                        </option>
                      ))}
                    </select>
                    {lineFilteredDrinks.length === 0 ? (
                      <p className="text-xs text-amber-600">No products match this search.</p>
                    ) : null}
                  </label>
                </div>

                <div className="md:col-span-2">
                  <label className="space-y-2">
                    <span className="text-xs font-medium uppercase tracking-wide text-slate-500">Quantity</span>
                    <input
                      type="number"
                      min="1"
                      value={line.quantity}
                      onChange={(event) => handleLineChange(line.id, { quantity: event.target.value })}
                      className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </label>
                </div>

                <div className="md:col-span-3">
                  <label className="space-y-2">
                    <span className="text-xs font-medium uppercase tracking-wide text-slate-500">Line total</span>
                    <p className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-semibold text-slate-900">
                      {formatCurrency(lineTotal)}
                    </p>
                  </label>
                </div>

                <div className="md:col-span-1 md:flex md:items-end">
                  <button
                    type="button"
                    onClick={() => removeLine(line.id)}
                    disabled={lines.length === 1}
                    className="w-full rounded-xl border border-slate-300 px-2 py-2.5 text-sm text-slate-700 disabled:opacity-50"
                  >
                    Remove
                  </button>
                </div>
              </div>
            )
          })}

          <button
            type="button"
            onClick={addLine}
            className="rounded-xl border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700"
          >
            Add another line
          </button>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-700">Total price</p>
          <p className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xl font-semibold text-slate-900">
            {formatCurrency(total)}
          </p>
        </div>
      </div>

      <div className="mt-5">
        <button
          type="button"
          disabled={loading || !customerName.trim() || validLines.length === 0}
          onClick={() => setConfirmOpen(true)}
          className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? 'Processing...' : 'Record sale'}
        </button>
      </div>

      {confirmOpen ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl">
            <h3 className="text-lg font-semibold text-slate-900">Confirm sale</h3>
            <p className="mt-2 text-sm text-slate-600">
              Record {validLines.length} line{validLines.length === 1 ? '' : 's'} for {customerName || 'customer'} at {formatCurrency(total)}?
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmOpen(false)}
                className="rounded-xl border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={loading || !customerName.trim() || validLines.length === 0}
                onClick={handleConfirm}
                className="rounded-xl bg-emerald-600 px-3 py-2 text-sm font-medium text-white disabled:opacity-60"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
