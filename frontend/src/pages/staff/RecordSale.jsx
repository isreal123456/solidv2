import { useState } from 'react'
import toast from 'react-hot-toast'
import SaleForm from '../../components/staff/SaleForm'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { useAuth } from '../../hooks/useAuth'
import { useShopName } from '../../hooks/useShopName'
import { useStock } from '../../hooks/useStock'
import * as api from '../../services/api'

export default function RecordSale() {
  const { user } = useAuth()
  const shopName = useShopName()
  const { stock, loading, refresh } = useStock()
  const [submitting, setSubmitting] = useState(false)

  const escapeHtml = (value) =>
    String(value ?? '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;')

  const printReceipt = (sales) => {
    const receiptWindow = window.open('', '_blank', 'width=420,height=720')
    if (!receiptWindow) {
      toast.error('Could not open print window. Please allow popups and try again.')
      return
    }

    const firstSale = sales[0]
    const grandTotal = sales.reduce((sum, sale) => sum + sale.total, 0)
    const lineRows = sales
      .map(
        (sale) => `
          <div class="row"><span>${escapeHtml(sale.drinkName)} x ${sale.quantity}</span><span>${sale.total.toLocaleString()}</span></div>
        `,
      )
      .join('')

    const receiptHtml = `
      <html>
        <head>
          <title>Receipt ${firstSale.id}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 16px; color: #0f172a; }
            .title { text-align: center; margin-bottom: 12px; }
            .title h2 { margin: 0; font-size: 20px; }
            .muted { color: #64748b; font-size: 12px; }
            .row { display: flex; justify-content: space-between; margin: 6px 0; font-size: 14px; }
            .total { border-top: 1px dashed #94a3b8; margin-top: 10px; padding-top: 10px; font-weight: 700; }
          </style>
        </head>
        <body>
          <div class="title">
            <h2>${escapeHtml(shopName)}</h2>
            <div class="muted">Sales Receipt</div>
          </div>
          <div class="row"><span>Receipt ID</span><span>${escapeHtml(firstSale.id)}</span></div>
          <div class="row"><span>Date</span><span>${escapeHtml(firstSale.date)}</span></div>
          <div class="row"><span>Time</span><span>${escapeHtml(firstSale.time)}</span></div>
          <div class="row"><span>Staff</span><span>${escapeHtml(firstSale.staffName)}</span></div>
          <div class="row"><span>Customer</span><span>${escapeHtml(firstSale.customerName)}</span></div>
          ${lineRows}
          <div class="row total"><span>Total</span><span>${grandTotal.toLocaleString()}</span></div>
          <p class="muted" style="text-align:center; margin-top:16px;">Thank you for your purchase.</p>
          <script>
            window.onload = function () {
              window.print();
            };
          </script>
        </body>
      </html>
    `

    receiptWindow.document.open()
    receiptWindow.document.write(receiptHtml)
    receiptWindow.document.close()
  }

  const handleSubmit = async ({ customerName, lines }) => {
    setSubmitting(true)
    try {
      const requestedByDrink = new Map()
      for (const line of lines) {
        const current = requestedByDrink.get(line.drinkId) ?? 0
        requestedByDrink.set(line.drinkId, current + Number(line.quantity))
      }

      for (const [drinkId, requestedQty] of requestedByDrink.entries()) {
        const drink = stock.find((item) => item.id === drinkId)
        if (!drink || requestedQty > drink.stock) {
          throw new Error(`${drink?.name ?? 'Selected drink'} has insufficient stock`)
        }
      }

      const sales = []
      for (const line of lines) {
        const sale = await api.recordSale(user.id, user.name, customerName, line.drinkId, line.quantity)
        sales.push(sale)
      }

      toast.success('Sale recorded successfully')
      printReceipt(sales)
      await refresh()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to record sale'
      toast.error(message)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">Record sale</h2>
        <p className="mt-1 text-sm text-slate-500">Capture drink sales with automatic stock deduction.</p>
      </div>
      <SaleForm drinks={stock} loading={submitting} onSubmit={handleSubmit} />
    </div>
  )
}
