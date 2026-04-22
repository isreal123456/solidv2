import { useMemo, useState } from 'react'
import { formatCurrency } from '../../utils/formatCurrency'

export default function MySalesTable({ sales, total }) {
  const [activeCustomer, setActiveCustomer] = useState(null)

  const escapeHtml = (value) =>
    String(value ?? '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;')

  const groupedSales = useMemo(() => {
    const groups = new Map()

    sales.forEach((sale) => {
      const normalizedName = String(sale.customerName ?? '').trim()
      const customerName = normalizedName || 'Walk-in customer'
      const key = customerName.toLowerCase()
      const timestamp = Date.parse(`${sale.date} ${sale.time}`)

      if (!groups.has(key)) {
        groups.set(key, {
          key,
          customerName,
          lines: [],
          totalSpent: 0,
          totalItems: 0,
          latestTimestamp: Number.isNaN(timestamp) ? 0 : timestamp,
        })
      }

      const group = groups.get(key)
      group.lines.push(sale)
      group.totalSpent += Number(sale.total) || 0
      group.totalItems += Number(sale.quantity) || 0

      if (!Number.isNaN(timestamp) && timestamp > group.latestTimestamp) {
        group.latestTimestamp = timestamp
      }
    })

    return Array.from(groups.values())
      .map((group) => {
        const sortedLines = [...group.lines].sort((a, b) => {
          const aTime = Date.parse(`${a.date} ${a.time}`)
          const bTime = Date.parse(`${b.date} ${b.time}`)
          return (Number.isNaN(bTime) ? 0 : bTime) - (Number.isNaN(aTime) ? 0 : aTime)
        })

        return {
          ...group,
          lines: sortedLines,
          latestDate: sortedLines[0]?.date ?? '-',
          latestTime: sortedLines[0]?.time ?? '-',
        }
      })
      .sort((a, b) => b.latestTimestamp - a.latestTimestamp)
  }, [sales])

  const openCustomerDetails = (customer) => {
    setActiveCustomer(customer)
  }

  const closeCustomerDetails = () => {
    setActiveCustomer(null)
  }

  const printCustomerDetails = (customer) => {
    const printWindow = window.open('', '_blank', 'width=720,height=900')
    if (!printWindow) {
      return
    }

    const rowsHtml = customer.lines
      .map(
        (sale) => `
          <tr>
            <td>${escapeHtml(sale.time)}</td>
            <td>${escapeHtml(sale.drinkName)}</td>
            <td>${escapeHtml(sale.quantity)}</td>
            <td>${escapeHtml(formatCurrency(sale.price))}</td>
            <td>${escapeHtml(formatCurrency(sale.total))}</td>
            <td>${escapeHtml(sale.staffName)}</td>
          </tr>
        `,
      )
      .join('')

    const html = `
      <html>
        <head>
          <title>Customer Purchase Details</title>
          <style>
            body { font-family: Arial, sans-serif; color: #0f172a; padding: 20px; }
            h2 { margin: 0 0 8px; }
            p { margin: 4px 0; color: #475569; }
            table { width: 100%; border-collapse: collapse; margin-top: 16px; }
            th, td { border: 1px solid #cbd5e1; padding: 8px; font-size: 13px; text-align: left; }
            th { background: #f8fafc; }
            .summary { margin-top: 12px; font-weight: 700; color: #0f172a; }
          </style>
        </head>
        <body>
          <h2>Customer Purchase Details</h2>
          <p>Customer: ${escapeHtml(customer.customerName)}</p>
          <p>Products: ${escapeHtml(customer.lines.length)}</p>
          <p>Total quantity: ${escapeHtml(customer.totalItems)}</p>
          <p class="summary">Total spent: ${escapeHtml(formatCurrency(customer.totalSpent))}</p>
          <table>
            <thead>
              <tr>
                <th>Time</th>
                <th>Product</th>
                <th>Quantity</th>
                <th>Unit price</th>
                <th>Line total</th>
                <th>Staff</th>
              </tr>
            </thead>
            <tbody>${rowsHtml}</tbody>
          </table>
          <script>
            window.onload = function () {
              window.print();
            };
          </script>
        </body>
      </html>
    `

    printWindow.document.open()
    printWindow.document.write(html)
    printWindow.document.close()
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Latest purchase</th>
              <th className="px-4 py-3">Products bought</th>
              <th className="px-4 py-3">Total quantity</th>
              <th className="px-4 py-3">Total spent</th>
              <th className="px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {groupedSales.length === 0 ? (
              <tr>
                <td className="px-4 py-6 text-center text-slate-500" colSpan={6}>
                  No sales found for the selected filters.
                </td>
              </tr>
            ) : (
              groupedSales.map((customer) => (
                <tr
                  key={customer.key}
                  className="cursor-pointer hover:bg-slate-50/80"
                  onClick={() => openCustomerDetails(customer)}
                >
                  <td className="px-4 py-3 font-medium text-slate-900">{customer.customerName}</td>
                  <td className="px-4 py-3 text-slate-600">{customer.latestDate} {customer.latestTime}</td>
                  <td className="px-4 py-3 text-slate-600">{customer.lines.length}</td>
                  <td className="px-4 py-3 text-slate-600">{customer.totalItems}</td>
                  <td className="px-4 py-3 font-semibold text-slate-900">{formatCurrency(customer.totalSpent)}</td>
                  <td className="px-4 py-3 text-slate-600">View details</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-4 py-4 text-sm">
        <span className="font-medium text-slate-600">Personal total</span>
        <span className="text-lg font-semibold text-slate-900">{formatCurrency(total)}</span>
      </div>

      {activeCustomer ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/40 p-4">
          <div className="w-full max-w-4xl rounded-2xl bg-white p-5 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">{activeCustomer.customerName}</h3>
                <p className="mt-1 text-sm text-slate-600">
                  {activeCustomer.lines.length} product line{activeCustomer.lines.length === 1 ? '' : 's'} | Total spent{' '}
                  {formatCurrency(activeCustomer.totalSpent)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => printCustomerDetails(activeCustomer)}
                  className="rounded-xl bg-emerald-600 px-3 py-2 text-sm font-medium text-white"
                >
                  Print
                </button>
                <button
                  type="button"
                  onClick={closeCustomerDetails}
                  className="rounded-xl border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700"
                >
                  Close
                </button>
              </div>
            </div>

            <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Time</th>
                    <th className="px-4 py-3">Product</th>
                    <th className="px-4 py-3">Quantity</th>
                    <th className="px-4 py-3">Unit price</th>
                    <th className="px-4 py-3">Line total</th>
                    <th className="px-4 py-3">Staff</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {activeCustomer.lines.map((sale) => (
                    <tr key={sale.id}>
                      <td className="px-4 py-3 text-slate-600">{sale.time}</td>
                      <td className="px-4 py-3 font-medium text-slate-900">{sale.drinkName}</td>
                      <td className="px-4 py-3 text-slate-600">{sale.quantity}</td>
                      <td className="px-4 py-3 text-slate-600">{formatCurrency(sale.price)}</td>
                      <td className="px-4 py-3 font-semibold text-slate-900">{formatCurrency(sale.total)}</td>
                      <td className="px-4 py-3 text-slate-600">{sale.staffName}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
