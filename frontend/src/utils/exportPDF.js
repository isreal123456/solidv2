import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

export function exportPDFTable({ title, columns, rows, filename, subtitle = '' }) {
  const tableRows = Array.isArray(rows) ? rows : []
  if (!tableRows.length) return

  const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' })

  doc.setFontSize(14)
  doc.text(title || 'Report', 40, 40)

  let startY = 60
  if (subtitle) {
    doc.setFontSize(10)
    doc.setTextColor(100)
    doc.text(subtitle, 40, 58)
    startY = 72
  }

  autoTable(doc, {
    startY,
    head: [columns],
    body: tableRows,
    styles: { fontSize: 9, cellPadding: 6 },
    headStyles: { fillColor: [22, 163, 74] },
    theme: 'grid',
  })

  const finalName = filename.endsWith('.pdf') ? filename : `${filename}.pdf`
  doc.save(finalName)
}
